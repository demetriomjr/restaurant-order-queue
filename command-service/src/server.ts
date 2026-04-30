import cors from 'cors';
import express from 'express';
import { createYoga } from 'graphql-yoga';
import { createServer } from 'net';
import { connectRabbitMQ } from './infrastructure/persistence.js';
import { schema } from './interfaces/graphql/schema.js';

const DEFAULT_PORT = 4001;
const PORT_RANGE_START = 4001;
const PORT_RANGE_END = 4010;

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

  const yoga = createYoga({
    schema,
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
