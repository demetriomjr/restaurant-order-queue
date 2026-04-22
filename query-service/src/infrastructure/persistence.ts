import { PrismaClient } from '@prisma/client';
import * as amqp from 'amqplib';
import { sseClients } from './sse.js';
import { pubsub } from './pubsub.js';

const prisma = new PrismaClient();
let channel: amqp.Channel;

interface DomainEvent {
  type: string;
  payload: any;
  occurredAt: Date;
}

async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection = await amqp.connect(url);
  channel = connection.createChannel();
  await channel.assertExchange('domain_events', 'fanout', { durable: true });
  
  const queue = await channel.assertQueue('', { exclusive: true });
  channel.bindQueue(queue.queue, 'domain_events', '');
  
  channel.consume(queue.queue, async (msg) => {
    if (msg) {
      const event: DomainEvent = JSON.parse(msg.content.toString());
      await handleDomainEvent(event);
      channel.ack(msg);
    }
  });

  console.log('Query Service connected to RabbitMQ');
}

async function handleDomainEvent(event: DomainEvent) {
  const { type, payload } = event;
  const tableId = payload.tableId;

  switch (type) {
    case 'ORDER_CREATED': {
      await readModelRepository.upsertOrder(
        payload.orderId,
        payload.tableId,
        'PENDING',
        payload.items.reduce((sum: number, item: any) => sum + item.unitPrice * item.quantity, 0),
        payload.items
      );
      sseClients.broadcast(tableId, { type, payload, occurredAt: event.occurredAt });
      sseClients.broadcast('all', { type, payload, occurredAt: event.occurredAt });
      pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: { ...payload, status: 'PENDING' } });
      pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: { ...payload, status: 'PENDING' } });
      break;
    }

    case 'ORDER_STATUS_CHANGED': {
      const existingOrder = await readModelRepository.findById(payload.orderId);
      if (existingOrder) {
        const updatedOrder = await readModelRepository.updateStatus(payload.orderId, payload.newStatus);
        sseClients.broadcast(tableId, { type, payload, occurredAt: event.occurredAt });
        sseClients.broadcast('all', { type, payload, occurredAt: event.occurredAt });
        pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
        pubsub.publish('ORDER_UPDATED_ALL', { orderUpdated: updatedOrder });
      }
      break;
    }

    case 'ORDER_ITEM_ADDED': {
      const existingOrder = await readModelRepository.findById(payload.orderId);
      if (existingOrder) {
        const items = [...(existingOrder.items as any[]), payload.item];
        const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const updatedOrder = await readModelRepository.upsertOrder(payload.orderId, tableId, existingOrder.status, total, items);
        sseClients.broadcast(tableId, { type, payload, occurredAt: event.occurredAt });
        pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
      }
      break;
    }

    case 'ORDER_ITEM_REMOVED': {
      const existingOrder = await readModelRepository.findById(payload.orderId);
      if (existingOrder) {
        const items = (existingOrder.items as any[]).filter((i: any) => i.productId !== payload.productId);
        const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
        const updatedOrder = await readModelRepository.upsertOrder(payload.orderId, tableId, existingOrder.status, total, items);
        sseClients.broadcast(tableId, { type, payload, occurredAt: event.occurredAt });
        pubsub.publish(`ORDER_UPDATED_${tableId}`, { orderUpdated: updatedOrder });
      }
      break;
    }
  }
}

export const readModelRepository = {
  async upsertOrder(orderId: string, tableId: string, status: string, total: number, items: any[]) {
    return prisma.orderRead.upsert({
      where: { id: orderId },
      create: { id: orderId, tableId, status, total, items },
      update: { status, total, items, updatedAt: new Date() }
    });
  },

  async updateStatus(orderId: string, status: string) {
    return prisma.orderRead.update({
      where: { id: orderId },
      data: { status, updatedAt: new Date() }
    });
  },

  async findById(id: string) {
    return prisma.orderRead.findUnique({ where: { id } });
  },

  async findByTableId(tableId: string) {
    return prisma.orderRead.findMany({
      where: { tableId },
      orderBy: { updatedAt: 'desc' }
    });
  },

  async findActiveByTableId(tableId: string) {
    const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    return prisma.orderRead.findMany({
      where: { tableId, status: { in: activeStatuses } },
      orderBy: { createdAt: 'asc' }
    });
  },

  async findAllActive() {
    const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING', 'READY', 'DELIVERED'];
    return prisma.orderRead.findMany({
      where: { status: { in: activeStatuses } },
      orderBy: { createdAt: 'asc' }
    });
  }
};

export const menuRepository = {
  async findAll() {
    return prisma.product.findMany({
      where: { available: true },
      orderBy: { category: 'asc' }
    });
  },

  async findByCategory(category: string) {
    return prisma.product.findMany({
      where: { category, available: true }
    });
  },

  async createMenuItem(data: { name: string; description: string; category: string; price: number }) {
    return prisma.product.create({ data });
  }
};

export { prisma, connectRabbitMQ };