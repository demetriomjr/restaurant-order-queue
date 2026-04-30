import { makeExecutableSchema } from '@graphql-tools/schema';
import {
  addOrderItemCommand,
  createOrderCommand,
  removeOrderItemCommand,
  seedMenuCommand,
  updateOrderStatusCommand
} from '../../application/commands.js';
import type { OrderResolverParent } from '../../domain/types.js';

const typeDefs = `
  type Query {
    _noop: Boolean!
  }

  type Mutation {
    createOrder(tableId: String!, items: [OrderItemInput!]!): Order
    updateOrderStatus(orderId: ID!, status: String!): Order
    addOrderItem(orderId: ID!, item: OrderItemInput!): Order
    removeOrderItem(orderId: ID!, productId: String!): Order
    seedMenu: Boolean
  }

  type Order {
    id: ID!
    tableId: String!
    status: String!
    total: Float!
    items: [OrderItem!]!
    createdAt: String!
    updatedAt: String!
  }

  type OrderItem {
    productId: String!
    productName: String!
    quantity: Int!
    unitPrice: Float!
    notes: String
  }

  input OrderItemInput {
    productId: String!
    productName: String!
    quantity: Int!
    unitPrice: Float!
    notes: String
  }
`;

const resolvers = {
  Query: {
    _noop: () => true
  },
  Mutation: {
    createOrder: async (
      _: unknown,
      args: { tableId: string; items: Array<{ productId: string; productName: string; quantity: number; unitPrice: number; notes?: string }> }
    ) => createOrderCommand(args),
    updateOrderStatus: async (_: unknown, args: { orderId: string; status: string }) =>
      updateOrderStatusCommand(args),
    addOrderItem: async (
      _: unknown,
      args: { orderId: string; item: { productId: string; productName: string; quantity: number; unitPrice: number; notes?: string } }
    ) => addOrderItemCommand(args),
    removeOrderItem: async (_: unknown, args: { orderId: string; productId: string }) =>
      removeOrderItemCommand(args),
    seedMenu: () => seedMenuCommand()
  },
  Order: {
    items: (parent: OrderResolverParent) => (Array.isArray(parent.items) ? parent.items : []),
    createdAt: (parent: OrderResolverParent) => parent.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: (parent: OrderResolverParent) => parent.updatedAt?.toISOString() || new Date().toISOString()
  }
};

export const schema = makeExecutableSchema({ typeDefs, resolvers });
