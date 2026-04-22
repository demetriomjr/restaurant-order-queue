import { createSchema } from 'nexus';

export const Query = createSchema({
  queries: (t) => ({
    order: t.field({
      type: 'Order',
      args: {
        id: t.string.arg({ required: true })
      },
      resolve: async (_, { id }, { prisma }) => {
        return prisma.order.findUnique({ where: { id }, include: { items: true } });
      }
    }),

    ordersByTable: t.field({
      type: 'Order',
      list: true,
      args: {
        tableId: t.string.arg({ required: true })
      },
      resolve: async (_, { tableId }, { prisma }) => {
        return prisma.order.findMany({
          where: { tableId },
          include: { items: true },
          orderBy: { createdAt: 'desc' }
        });
      }
    })
  })
});