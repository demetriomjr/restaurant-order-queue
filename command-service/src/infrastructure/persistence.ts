import { PrismaClient, Order, Prisma } from '@prisma/client';
import * as amqp from 'amqplib';
import type { OrderItemInput } from '../domain/types.js';

const prisma = new PrismaClient();
const EXCHANGE_NAME = 'domain_events';
let connection: amqp.Connection | null = null;
let channel: amqp.ConfirmChannel | null = null;
let isConnecting = false;

type OrderWithJsonItems = Order & { items: Prisma.JsonValue };

async function connectRabbitMQ(): Promise<void> {
  if (channel) return;
  if (isConnecting) return;

  isConnecting = true;
  const url = process.env.RABBITMQ_URL || 'amqp://guest:guest@localhost:5672';
  try {
    connection = await amqp.connect(url);
    channel = await connection.createConfirmChannel();
    await channel.assertExchange(EXCHANGE_NAME, 'fanout', { durable: true });
    connection.on('close', () => {
      connection = null;
      channel = null;
    });
    connection.on('error', () => {
      connection = null;
      channel = null;
    });
    console.log('Connected to RabbitMQ');
  } finally {
    isConnecting = false;
  }
}

export async function publishEvent(type: string, payload: Record<string, unknown>): Promise<void> {
  if (!channel) {
    await connectRabbitMQ();
  }
  if (!channel) {
    throw new Error('RabbitMQ channel not available for event publication');
  }

  const event = { type, payload, occurredAt: new Date() };
  const wasPublished = channel.publish(
    EXCHANGE_NAME,
    '',
    Buffer.from(JSON.stringify(event)),
    { persistent: true }
  );

  if (!wasPublished) {
    throw new Error(`RabbitMQ publish buffer is saturated for event type ${type}`);
  }
  await channel.waitForConfirms();
}

export const orderRepository = {
  async create(data: { tableId: string; items: OrderItemInput[] }): Promise<Order> {
    const total = data.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const now = new Date();
    const order = await prisma.order.create({
      data: {
        tableId: data.tableId,
        total,
        pendingStartedAt: now,
        items: data.items as Prisma.InputJsonValue
      }
    });
    return order;
  },

  async findById(id: string): Promise<Order | null> {
    return prisma.order.findUnique({ where: { id } });
  },

  async findByTableId(tableId: string): Promise<Order[]> {
    return prisma.order.findMany({
      where: { tableId },
      orderBy: { createdAt: 'desc' }
    });
  },

  async updateStatus(id: string, status: string): Promise<Order> {
    const now = new Date();
    return prisma.order.update({
      where: { id },
      data: {
        status,
        preparingStartedAt: status === 'PREPARING' ? now : undefined,
        onTheWayStartedAt: status === 'ON_THE_WAY' ? now : undefined
      }
    });
  },

  async addItem(orderId: string, item: OrderItemInput): Promise<Order> {
    const order = await prisma.order.findUnique({ where: { id: orderId } }) as OrderWithJsonItems | null;
    if (!order) throw new Error('Order not found');
    const items = (Array.isArray(order.items) ? order.items : []) as OrderItemInput[];
    const newTotal = order.total + item.unitPrice * item.quantity;
    return prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal, items: [...items, item] as Prisma.InputJsonValue }
    });
  },

  async removeItem(orderId: string, productId: string): Promise<Order> {
    const order = await prisma.order.findUnique({ where: { id: orderId } }) as OrderWithJsonItems | null;
    if (!order) throw new Error('Order not found');
    const items = (Array.isArray(order.items) ? order.items : []) as OrderItemInput[];
    const itemToRemove = items.find(i => i.productId === productId);
    if (!itemToRemove) throw new Error('Item not found');
    const newItems = items.filter(i => i.productId !== productId);
    const newTotal = order.total - (itemToRemove.unitPrice * itemToRemove.quantity);
    return prisma.order.update({
      where: { id: orderId },
      data: { total: newTotal, items: newItems as Prisma.InputJsonValue }
    });
  }
};

const menuSeed = [
  { name: 'Filé Mignon ao Molho Pepper', description: 'Filé mignon grelhado com molho pepper e batatas rústicas', category: 'Pratos Principais', price: 89.90 },
  { name: 'Picanha na Brasa', description: 'Picanha grelhada na brasa com alho e ervas', category: 'Pratos Principais', price: 92.90 },
  { name: 'Costela de Porco', description: 'Costela de porco assada com molho barbecue', category: 'Pratos Principais', price: 78.90 },
  { name: 'Salmão Grelhado', description: 'Salmão fresco grelhado com legumes', category: 'Pratos Principais', price: 85.90 },
  { name: 'Frango ao Curry', description: 'Frango em cubos com curry oriental', category: 'Pratos Principais', price: 68.90 },
  { name: 'Bolinhos de Queijo', description: '6 unidades de bolinhos de mussarela', category: 'Entradas', price: 32.90 },
  { name: 'Pastel de Carne', description: 'Pastel frito com carne moída', category: 'Entradas', price: 28.90 },
  { name: 'Caldo de Camarão', description: 'Caldo rico de camarão', category: 'Entradas', price: 38.90 },
  { name: 'Salada Caesar', description: 'Alface romana, croutons, parmesão', category: 'Saladas', price: 29.90 },
  { name: 'Salada Grega', description: 'Tomate, pepino, cebola, azeitonas', category: 'Saladas', price: 26.90 },
  { name: 'Batata Frita', description: 'Batata frita crocante', category: 'Acompanhamentos', price: 22.90 },
  { name: 'Arroz Branco', description: 'Arroz branco soltinho', category: 'Acompanhamentos', price: 12.90 },
  { name: 'Batata Rústica', description: 'Batata rústica com alecrim', category: 'Acompanhamentos', price: 24.90 },
  { name: 'Refrigerante Lata', description: 'Coca-Cola, Guaraná, Sprite', category: 'Bebidas', price: 8.90 },
  { name: 'Suco Natural', description: 'Laranja, Limão, Manga', category: 'Bebidas', price: 12.90 },
  { name: 'Água sem Gás', description: 'Água mineral 500ml', category: 'Bebidas', price: 6.90 },
  { name: 'Heineken 600ml', description: 'Cerveja importada', category: 'Cervejas', price: 18.90 },
  { name: 'Stella Artois', description: 'Cerveja premium', category: 'Cervejas', price: 22.90 },
  { name: 'Vinho Tanger', description: 'Vinho tinto brasileiro', category: 'Vinhos', price: 45.90 },
  { name: 'Espumante Brut', description: 'Espumante seco', category: 'Vinhos', price: 38.90 },
  { name: 'Caipirinha', description: 'Cachaça com limão', category: 'Drinks', price: 24.90 },
  { name: 'Caipivodka', description: 'Vodka com limão', category: 'Drinks', price: 26.90 },
  { name: 'Mojito', description: 'Rum, Hortelã, Limão', category: 'Drinks', price: 28.90 },
  { name: 'Pudim', description: 'Pudim de leite condensado', category: 'Sobremesas', price: 18.90 },
  { name: 'Brigadeiro', description: '6 bolinhas de chocolate', category: 'Sobremesas', price: 16.90 },
  { name: 'Mousse de Maracujá', description: 'Mousse aerado', category: 'Sobremesas', price: 14.90 },
];

async function seedMenu() {
  for (const item of menuSeed) {
    await prisma.product.upsert({
      where: { id: item.name.toLowerCase().replace(/ /g, '-') },
      update: {},
      create: { id: item.name.toLowerCase().replace(/ /g, '-'), ...item }
    });
  }
  console.log('Menu seeded');
}

export { prisma, connectRabbitMQ, seedMenu };
