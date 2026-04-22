import { createYoga } from 'graphql-yoga';
import { makeSchema } from 'nexus';
import { PrismaClient } from '@prisma/client';
import * as path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import { Query } from './graphql/Query.js';
import { Mutation } from './graphql/Mutation.js';
import { Order, OrderItem, OrderItemInput } from './graphql/types.js';
import { connectRabbitMQ } from './infrastructure/persistence.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const schema = makeSchema({
  types: [Query, Mutation, Order, OrderItem, OrderItemInput],
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
    context: () => ({ prisma }),
    graphiql: true
  });

  const app = express();
  app.use(cors());
  app.use(yoga);

  app.listen(4001, () => {
    console.log('Command Service running at http://localhost:4001/graphql');
  });
}

main().catch(console.error);