import { objectType } from 'nexus';

export const OrderRead = objectType({
  name: 'OrderRead',
  definition(t) {
    t.string('id');
    t.string('tableId');
    t.string('status');
    t.float('total');
    t.json('items');
    t.field('updatedAt', { type: 'DateTime' });
  }
});

export const Product = objectType({
  name: 'Product',
  definition(t) {
    t.string('id');
    t.string('name');
    t.string('description');
    t.string('category');
    t.float('price');
    t.boolean('available');
  }
});