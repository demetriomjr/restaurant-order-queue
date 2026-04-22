import cors from 'cors';
import express from 'express';
import { createYoga } from 'graphql-yoga';
import { makeSchema } from 'nexus';
import * as path from 'path';
import { fileURLToPath } from 'url';

import { Mutation } from './graphql/Mutation.js';
import { Query } from './graphql/Query.js';
import { Order, OrderItem, OrderItemInput } from './graphql/types.js';
import { connectRabbitMQ } from './infrastructure/persistence.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DEFAULT_PORT = 4001;
const PORT_RANGE_START = 4001;
const PORT_RANGE_END = 4010;

const schema = makeSchema({
  types: [Query, Mutation, Order, OrderItem, OrderItemInput],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus.ts')
  }
});

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
    context: () => ({}),
    graphiql: true
  });

  const app = express();
  app.use(cors(corsOptions));
  app.use(yoga);

  app.listen(port, () => {
    console.log(`Command Service running at http://localhost:${port}/graphql`);
    if (port !== DEFAULT_PORT) {
      console.log(`Note: Using port ${port} (default ${DEFAULT_PORT} was in use)`);
    }
  });
}

main().catch(console.error);