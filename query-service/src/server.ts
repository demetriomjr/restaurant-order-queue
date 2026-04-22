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

const schema = makeSchema({
  types: [Query, Mutation, Subscription, OrderRead, Product],
  outputs: {
    schema: path.join(__dirname, '../generated/schema.graphql'),
    typegen: path.join(__dirname, '../generated/nexus.ts')
  }
});

const prisma = new PrismaClient();

async function main() {
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
  app.use(cors());

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

  app.listen(4002, () => {
    console.log('Query Service running at http://localhost:4002/graphql');
    console.log('SSE endpoint: http://localhost:4002/sse/table/{tableId}');
  });
}

main().catch(console.error);