import { createSchema } from 'nexus';
import { orderRepository } from '../../infrastructure/persistence.js';

export const Mutation = createSchema({
  mutations: (t) => ({
    createOrder: t.field({
      type: 'Order',
      args: {
        tableId: t.string.arg({ required: true }),
        items: t.arg({
          type: 'OrderItemInput',
          list: true,
          required: true
        })
      },
      resolve: async (_, args) => {
        return orderRepository.create({
          tableId: args.tableId,
          items: args.items!
        });
      }
    }),

    updateOrderStatus: t.field({
      type: 'Order',
      args: {
        orderId: t.string.arg({ required: true }),
        status: t.string.arg({ required: true })
      },
      resolve: async (_, { orderId, status }) => {
        return orderRepository.updateStatus(orderId, status);
      }
    }),

    addOrderItem: t.field({
      type: 'Order',
      args: {
        orderId: t.string.arg({ required: true }),
        item: t.arg({ type: 'OrderItemInput', required: true })
      },
      resolve: async (_, { orderId, item }) => {
        return orderRepository.addItem(orderId, item);
      }
    }),

    removeOrderItem: t.field({
      type: 'Order',
      args: {
        orderId: t.string.arg({ required: true }),
        productId: t.string.arg({ required: true })
      },
      resolve: async (_, { orderId, productId }) => {
        return orderRepository.removeItem(orderId, productId);
      }
    })
  })
});