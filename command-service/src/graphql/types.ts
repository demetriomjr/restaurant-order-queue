import { objectType } from 'nexus';

export const OrderStatus = objectType({
  name: 'OrderStatus',
  sourceType: {
    module: __dirname,
    export: 'OrderStatus'
  },
  definition: (t) => {
    t.string('PENDING');
    t.string('CONFIRMED');
    t.string('PREPARING');
    t.string('READY');
    t.string('DELIVERED');
    t.string('COMPLETED');
  }
});

export const Order = objectType({
  name: 'Order',
  definition(t) {
    t.string('id');
    t.string('tableId');
    t.string('status');
    t.float('total');
    t.list.field('items', { type: 'OrderItem' });
    t.field('createdAt', { type: 'DateTime' });
    t.field('updatedAt', { type: 'DateTime' });
  }
});

export const OrderItem = objectType({
  name: 'OrderItem',
  definition(t) {
    t.string('id');
    t.string('productId');
    t.string('productName');
    t.int('quantity');
    t.float('unitPrice');
    t.string('notes');
  }
});

export const OrderItemInput = objectType({
  name: 'OrderItemInput',
  definition(t) {
    t.string('productId');
    t.string('productName');
    t.int('quantity');
    t.float('unitPrice');
    t.string('notes');
  }
});