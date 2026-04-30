import { createYoga } from 'graphql-yoga';
import { makeExecutableSchema } from '@graphql-tools/schema';
import express from 'express';
import cors from 'cors';
import { createServer } from 'net';
import { connectRabbitMQ, menuRepository, loadMenuCache, prisma } from './infrastructure/persistence.js';
import { sseClients } from './infrastructure/sse.js';

const DEFAULT_PORT = 4002;
const PORT_RANGE_START = 4002;
const PORT_RANGE_END = 4010;

const typeDefs = `
  type Query {
    order(id: ID!): Order
    ordersByTable(tableId: String!): [Order!]!
    menu(category: String): [Product!]!
  }

  type Order {
    id: ID!
    tableId: String!
    status: String!
    total: Float!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
    pendingStartedAt: String
    preparingStartedAt: String
    onTheWayStartedAt: String
  }

  type OrderItem {
    productId: String!
    productName: String!
    quantity: Int!
    unitPrice: Float!
    notes: String
  }

  type Product {
    id: ID!
    name: String!
    description: String!
    price: Float!
    category: String!
    available: Boolean!
  }
`;

const resolvers = {
  Query: {
    order: async (_: any, { id }: { id: string }) => {
      return prisma.order.findUnique({ where: { id } });
    },
    ordersByTable: async (_: any, { tableId }: { tableId: string }) => {
      if (tableId === 'all') {
        return prisma.order.findMany({
          orderBy: { createdAt: 'desc' }
        });
      }
      return prisma.order.findMany({
        where: { tableId },
        orderBy: { createdAt: 'desc' }
      });
    },
    menu: (_: any, args: { category?: string }) => {
      if (args.category) {
        return menuRepository.findByCategory(args.category);
      }
      return menuRepository.findAll();
    }
  },
  Order: {
    items: (parent: any) => {
      return parent.items || [];
    },
    createdAt: (parent: any) => {
      return parent.createdAt?.toISOString() || new Date().toISOString();
    },
    updatedAt: (parent: any) => {
      return parent.updatedAt?.toISOString() || new Date().toISOString();
    },
    pendingStartedAt: (parent: any) => {
      return parent.pendingStartedAt?.toISOString() || null;
    },
    preparingStartedAt: (parent: any) => {
      return parent.preparingStartedAt?.toISOString() || null;
    },
    onTheWayStartedAt: (parent: any) => {
      return parent.onTheWayStartedAt?.toISOString() || null;
    },
    total: (parent: any) => {
      return parent.total || 0;
    }
  }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });
export const __test__ = { resolvers, typeDefs };

function findAvailablePort(startPort: number, endPort: number): Promise<number> {
  return new Promise((resolve) => {
    const server = createServer();

    server.once('error', () => {
      if (startPort < endPort) {
        resolve(findAvailablePort(startPort + 1, endPort));
      } else {
        resolve(startPort);
      }
    });

    server.once('listening', () => {
      server.close(() => resolve(startPort));
    });

    server.listen(startPort);
  });
}

async function main(): Promise<void> {
  const port = await findAvailablePort(PORT_RANGE_START, PORT_RANGE_END);
  const corsOptions = {
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:6173', 'http://localhost:6174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  await connectRabbitMQ();
  await loadMenuCache();

  const yoga = createYoga({
    schema,
    context: () => ({ prisma, menuRepo: menuRepository }),
    graphiql: true
  });

  const app = express();
  app.use(cors(corsOptions));

  app.get('/sse/table/:tableId', (req, res) => {
    const tableId = req.params.tableId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    res.write(`data: ${JSON.stringify({ type: 'CONNECTED', tableId })}\n\n`);

    sseClients.addClient(tableId, res);

    req.on('close', () => {
      sseClients.removeClient(res);
    });
  });

  app.use(yoga);

  app.listen(port, () => {
    console.log(`Query Service running at http://localhost:${port}/graphql`);
    console.log(`SSE endpoint: http://localhost:${port}/sse/table/{tableId}`);
    if (port !== DEFAULT_PORT) {
      console.log(`Note: Using port ${port} (default ${DEFAULT_PORT} was in use)`);
    }
  });
}

main().catch(console.error);
