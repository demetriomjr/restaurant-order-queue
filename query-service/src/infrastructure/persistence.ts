import { PrismaClient, Product } from '@prisma/client';
import * as amqp from 'amqplib';
import { sseClients } from './sse.js';
import { pubsub } from './pubsub.js';

const prisma = new PrismaClient();
let channel: amqp.Channel;
const EXCHANGE_NAME = 'domain_events';
const QUEUE_NAME = process.env.RABBITMQ_QUEUE_NAME || 'query_service_order_projection';

interface OrderItemPayload {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

type DomainEvent =
  | {
      type: 'ORDER_CREATED';
      payload: {
        orderId: string;
        tableId: string;
        status: string;
        total: number;
        pendingStartedAt?: string;
        items: OrderItemPayload[];
      };
      occurredAt: string;
    }
  | {
      type: 'ORDER_STATUS_CHANGED';
      payload: {
        orderId: string;
        tableId?: string;
        newStatus: string;
        preparingStartedAt?: string;
        onTheWayStartedAt?: string;
      };
      occurredAt: string;
    }
  | {
      type: 'ORDER_ITEM_ADDED';
      payload: { orderId: string; tableId?: string; item: OrderItemPayload };
      occurredAt: string;
    }
  | {
      type: 'ORDER_ITEM_REMOVED';
      payload: { orderId: string; tableId?: string; productId: string };
      occurredAt: string;
    }
  | {
      type: string;
      payload: Record<string, unknown>;
      occurredAt: string;
    };

interface QueryOrder {
  id: string;
  tableId: string;
  total: number;
  items: unknown;
}

let menuCache: Product[] = [];

async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection = await amqp.connect(url);
  channel = await connection.createChannel();
  await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
  
  const queue = await channel.assertQueue(QUEUE_NAME, { durable: true });
  await channel.bindQueue(queue.queue, EXCHANGE_NAME, '');
  await channel.prefetch(10);
  
  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      try {
        console.log('RabbitMQ received message:', msg.content.toString().slice(0, 200));
        const event: DomainEvent = JSON.parse(msg.content.toString());
        await handleDomainEvent(event);
        channel.ack(msg);
      } catch (error) {
        console.error('Failed to process RabbitMQ message', error);
        channel.nack(msg, false, false);
      }
    }
  });

  console.log('Query Service connected to RabbitMQ');
}

async function handleDomainEvent(event: DomainEvent) {
  const { type, payload } = event;
  const occurredAt = new Date(event.occurredAt);
  console.log('Handling event:', type, payload.orderId, payload.tableId);

  switch (type) {
    case 'ORDER_CREATED': {
      const tableId = payload.tableId;
      const pendingStartedAt = payload.pendingStartedAt ? new Date(payload.pendingStartedAt) : occurredAt;
      const order = await prisma.order.upsert({
        where: { id: payload.orderId },
        create: {
          id: payload.orderId,
          tableId: payload.tableId,
          status: 'PENDING',
          total: payload.total,
          pendingStartedAt,
          items: payload.items
        },
        update: {
          status: 'PENDING',
          total: payload.total,
          pendingStartedAt,
          items: payload.items
        }
      });
      sseClients.broadcast(tableId, { type, payload });
      sseClients.broadcast('all', { type, payload });
      console.log('Broadcast sent for:', type, 'to table:', tableId, 'and all');
      pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: order });
      pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: order });
      break;
    }

    case 'ORDER_STATUS_CHANGED': {
      const existingOrder = await prisma.order.findUnique({ where: { id: payload.orderId } });
      if (existingOrder) {
        const tableId = payload.tableId ?? existingOrder.tableId;
        const preparingStartedAt = payload.preparingStartedAt ? new Date(payload.preparingStartedAt) : occurredAt;
        const onTheWayStartedAt = payload.onTheWayStartedAt ? new Date(payload.onTheWayStartedAt) : occurredAt;
        const updatedOrder = await prisma.order.update({
          where: { id: payload.orderId },
          data: {
            status: payload.newStatus,
            preparingStartedAt: payload.newStatus === 'PREPARING' ? preparingStartedAt : undefined,
            onTheWayStartedAt: payload.newStatus === 'ON_THE_WAY' ? onTheWayStartedAt : undefined
          }
        });
        sseClients.broadcast(tableId, { type, payload });
        sseClients.broadcast('all', { type, payload });
        pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
        pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: updatedOrder });
      }
      break;
    }

    case 'ORDER_ITEM_ADDED': {
      const existingOrder = await prisma.order.findUnique({ where: { id: payload.orderId } }) as QueryOrder | null;
      if (existingOrder) {
        const tableId = payload.tableId ?? existingOrder.tableId;
        const items = (Array.isArray(existingOrder.items) ? existingOrder.items : []) as OrderItemPayload[];
        const newTotal = existingOrder.total + payload.item.unitPrice * payload.item.quantity;
        const updatedOrder = await prisma.order.update({
          where: { id: payload.orderId },
          data: { total: newTotal, items: [...items, payload.item] }
        });
        sseClients.broadcast(tableId, { type, payload });
        sseClients.broadcast('all', { type, payload });
        pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
        pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: updatedOrder });
      }
      break;
    }

    case 'ORDER_ITEM_REMOVED': {
      const existingOrder = await prisma.order.findUnique({ where: { id: payload.orderId } }) as QueryOrder | null;
      if (existingOrder) {
        const tableId = payload.tableId ?? existingOrder.tableId;
        const items = (Array.isArray(existingOrder.items) ? existingOrder.items : []) as OrderItemPayload[];
        const itemToRemove = items.find((i) => i.productId === payload.productId);
        if (itemToRemove) {
          const newItems = items.filter((i) => i.productId !== payload.productId);
          const newTotal = existingOrder.total - (itemToRemove.unitPrice * itemToRemove.quantity);
          const updatedOrder = await prisma.order.update({
            where: { id: payload.orderId },
            data: { total: newTotal, items: newItems }
          });
          sseClients.broadcast(tableId, { type, payload });
          sseClients.broadcast('all', { type, payload });
          pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
          pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: updatedOrder });
        }
      }
      break;
    }
    default:
      console.warn('Ignoring unsupported event type:', type);
  }
}

async function loadMenuCache() {
  menuCache = await prisma.product.findMany({
    where: { available: true },
    orderBy: { category: 'asc' }
  });
  console.log(`Menu cache loaded: ${menuCache.length} items`);
}

export const menuRepository = {
  findAll() {
    return menuCache;
  },

  findByCategory(category: string) {
    return menuCache.filter(p => p.category === category);
  }
};

export { prisma, connectRabbitMQ, loadMenuCache };
export const __test__ = {
  handleDomainEvent
};
