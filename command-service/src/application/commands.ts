import type { Order } from '@prisma/client';
import type { OrderItemInput } from '../domain/types.js';
import { orderRepository, publishEvent, seedMenu } from '../infrastructure/persistence.js';

export async function createOrderCommand(input: {
  tableId: string;
  items: OrderItemInput[];
}): Promise<Order> {
  const order = await orderRepository.create(input);
  await publishEvent('ORDER_CREATED', {
    orderId: order.id,
    tableId: order.tableId,
    status: order.status,
    total: order.total,
    pendingStartedAt: order.pendingStartedAt,
    items: order.items
  });
  return order;
}

export async function updateOrderStatusCommand(input: {
  orderId: string;
  status: string;
}): Promise<Order> {
  const existingOrder = await orderRepository.findById(input.orderId);
  if (!existingOrder) {
    throw new Error('Order not found');
  }

  if (existingOrder.status === 'CANCELLED' && input.status !== 'CANCELLED') {
    throw new Error('Cancelled orders cannot change status');
  }

  if (existingOrder.status === input.status) {
    return existingOrder;
  }

  const order = await orderRepository.updateStatus(input.orderId, input.status);
  await publishEvent('ORDER_STATUS_CHANGED', {
    orderId: order.id,
    tableId: order.tableId,
    newStatus: order.status,
    preparingStartedAt: order.preparingStartedAt,
    onTheWayStartedAt: order.onTheWayStartedAt
  });
  return order;
}

export async function addOrderItemCommand(input: {
  orderId: string;
  item: OrderItemInput;
}): Promise<Order> {
  const order = await orderRepository.addItem(input.orderId, input.item);
  await publishEvent('ORDER_ITEM_ADDED', {
    orderId: order.id,
    tableId: order.tableId,
    item: input.item
  });
  return order;
}

export async function removeOrderItemCommand(input: {
  orderId: string;
  productId: string;
}): Promise<Order> {
  const order = await orderRepository.removeItem(input.orderId, input.productId);
  await publishEvent('ORDER_ITEM_REMOVED', {
    orderId: order.id,
    tableId: order.tableId,
    productId: input.productId
  });
  return order;
}

export async function seedMenuCommand(): Promise<boolean> {
  await seedMenu();
  return true;
}
