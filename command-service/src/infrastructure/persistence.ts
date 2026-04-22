import { PrismaClient } from '@prisma/client';
import * as amqp from 'amqplib';
import { eventBus, DomainEvent } from '../../domain/events.js';

const prisma = new PrismaClient();
let channel: amqp.Channel;

async function connectRabbitMQ() {
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  const connection = await amqp.connect(url);
  channel = connection.createChannel();
  await channel.assertExchange('domain_events', 'fanout', { durable: true });
  console.log('Connected to RabbitMQ');
}

function publishToRabbitMQ(event: DomainEvent) {
  if (channel) {
    channel.publish(
      'domain_events',
      '',
      Buffer.from(JSON.stringify(event))
    );
  }
}

eventBus.on('ORDER_CREATED', (event) => publishToRabbitMQ(event));
eventBus.on('ORDER_STATUS_CHANGED', (event) => publishToRabbitMQ(event));
eventBus.on('ORDER_ITEM_ADDED', (event) => publishToRabbitMQ(event));
eventBus.on('ORDER_ITEM_REMOVED', (event) => publishToRabbitMQ(event));

export const orderRepository = {
  async create(data: { tableId: string; items: any[] }) {
    const total = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    
    const order = await prisma.order.create({
      data: {
        tableId: data.tableId,
        total,
        items: {
          create: data.items
        }
      },
      include: { items: true }
    });

    eventBus.publish(new (require('../../domain/events.js').OrderCreatedEvent)({
      orderId: order.id,
      tableId: order.tableId,
      items: order.items
    }));

    return order;
  },

  async findById(id: string) {
    return prisma.order.findUnique({ where: { id }, include: { items: true } });
  },

  async updateStatus(id: string, status: string) {
    const order = await prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: { items: true }
    });

    eventBus.publish(new (require('../../domain/events.js').OrderStatusChangedEvent)({
      orderId: order.id,
      tableId: order.tableId,
      oldStatus: 'UNKNOWN',
      newStatus: status
    }));

    return order;
  },

  async addItem(orderId: string, item: any) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new Error('Order not found');

    const newTotal = order.total + item.unitPrice * item.quantity;

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { total: newTotal },
        include: { items: true }
      }),
      prisma.orderItem.create({
        data: { ...item, orderId }
      })
    ]);

    eventBus.publish(new (require('../../domain/events.js').OrderItemAddedEvent)({
      orderId,
      tableId: order.tableId,
      item
    }));

    return updatedOrder;
  },

  async removeItem(orderId: string, productId: string) {
    const item = await prisma.orderItem.findFirst({
      where: { orderId, productId }
    });
    if (!item) throw new Error('Item not found');

    const order = await prisma.order.findUnique({ where: { id: orderId } });
    const newTotal = order!.total - item.unitPrice * item.quantity;

    const [updatedOrder] = await prisma.$transaction([
      prisma.order.update({
        where: { id: orderId },
        data: { total: newTotal },
        include: { items: true }
      }),
      prisma.orderItem.delete({ where: { id: item.id } })
    ]);

    eventBus.publish(new (require('../../domain/events.js').OrderItemRemovedEvent)({
      orderId,
      tableId: order!.tableId,
      productId
    }));

    return updatedOrder;
  }
};

export { prisma, connectRabbitMQ };