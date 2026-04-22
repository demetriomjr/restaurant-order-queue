import { createSchema } from 'nexus';
import { orderRepository } from '../../infrastructure/persistence.js';

const OrderItemInput = t.objectType({
  name: 'OrderItemInput',
  definition(t) {
    t.string('productId');
    t.string('productName');
    t.int('quantity');
    t.float('unitPrice');
    t.string('notes');
  }
});

export const Mutation = createSchema({
  mutations: (t) => ({
    createOrder: t.field({
      type: 'Order',
      args: {
        tableId: t.stringArg({ required: true }),
        items: t.arg({
          type: 'OrderItemInput',
          list: true,
          required: true
        })
      },
      resolve: async (_, args) => {
        return orderRepository.create({
          tableId: args.tableId as string,
          items: args.items as Array<{
            productId: string;
            productName: string;
            quantity: number;
            unitPrice: number;
            notes?: string;
          }>
        });
      }
    }),

    updateOrderStatus: t.field({
      type: 'Order',
      args: {
        orderId: t.stringArg({ required: true }),
        status: t.stringArg({ required: true })
      },
      resolve: async (_, { orderId, status }) => {
        return orderRepository.updateStatus(orderId as string, status as string);
      }
    }),

    addOrderItem: t.field({
      type: 'Order',
      args: {
        orderId: t.stringArg({ required: true }),
        item: t.arg({ type: 'OrderItemInput', required: true })
      },
      resolve: async (_, { orderId, item }) => {
        return orderRepository.addItem(orderId as string, item as {
          productId: string;
          productName: string;
          quantity: number;
          unitPrice: number;
          notes?: string;
        });
      }
    }),

    removeOrderItem: t.field({
      type: 'Order',
      args: {
        orderId: t.stringArg({ required: true }),
        productId: t.stringArg({ required: true })
      },
      resolve: async (_, { orderId, productId }) => {
        return orderRepository.removeItem(orderId as string, productId as string);
      }
    })
  })
});

export { OrderItemInput };