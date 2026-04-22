import { createYoga } from 'graphql-yoga';
import { makeSchema } from 'nexus';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { Query, Subscription } from './graphql/Query.js';
import { Mutation } from './graphql/Mutation.js';
import { OrderRead, Product } from './graphql/types.js';
import { connectRabbitMQ, menuRepository } from './infrastructure/persistence.js';
import { sseClients } from './infrastructure/sse.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_PORT = 4002;
const PORT_RANGE_START = 4001;
const PORT_RANGE_END = 4010;

const schema = makeSchema({
  types: [Query, Mutation, Subscription, OrderRead, Product],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus.ts')
  }
});

const prisma = new PrismaClient();

function findAvailablePort(startPort: number, endPort: number): Promise<number> {
  return new Promise((resolve) => {
    const net = require('net');
    const server = net.createServer();

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
    origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:5173', 'http://localhost:5174'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  };

  await connectRabbitMQ();

  const yoga = createYoga({
    schema,
    context: () => ({
      prisma,
      menuRepo: menuRepository
    }),
    graphiql: true
  });

  const app = express();
  app.use(cors(corsOptions));

  app.get('/sse/table/:tableId', (req, res) => {
    const tableId = req.params.tableId;

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

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