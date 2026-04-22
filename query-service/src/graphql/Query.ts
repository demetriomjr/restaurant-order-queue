import { createSchema } from 'nexus';
import { pubsub } from './pubsub.js';
import { readModelRepository, menuRepository } from '../../infrastructure/persistence.js';

export const Query = createSchema({
  queries: (t) => ({
    order: t.field({
      type: 'OrderRead',
      args: {
        id: t.string.arg({ required: true })
      },
      resolve: async (_, { id }) => {
        return readModelRepository.findById(id);
      }
    }),

    ordersByTable: t.field({
      type: 'OrderRead',
      list: true,
      args: {
        tableId: t.string.arg({ required: true })
      },
      resolve: async (_, { tableId }) => {
        if (tableId === 'all') {
          return readModelRepository.findAllActive();
        }
        return readModelRepository.findByTableId(tableId);
      }
    }),

    activeOrdersByTable: t.field({
      type: 'OrderRead',
      list: true,
      args: {
        tableId: t.string.arg({ required: true })
      },
      resolve: async (_, { tableId }) => {
        if (tableId === 'all') {
          return readModelRepository.findAllActive();
        }
        return readModelRepository.findActiveByTableId(tableId);
      }
    }),

    menu: t.field({
      type: 'Product',
      list: true,
      args: {
        category: t.string.arg()
      },
      resolve: async (_, { category }, { menuRepo }) => {
        if (category) {
          return menuRepo.findByCategory(category);
        }
        return menuRepo.findAll();
      }
    })
  })
});

export const Subscription = createSchema({
  subscriptions: (t) => {
    t.field('orderUpdated', {
      type: 'OrderRead',
      args: {
        tableId: t.string.arg({ required: true })
      },
      subscribe: (_, { tableId }) => {
        if (tableId === 'all') {
          return pubsub.asyncIterator(['ORDER_UPDATED_ALL']);
        }
        return pubsub.asyncIterator([`ORDER_UPDATED_${tableId}`]);
      }
    });
  }
});