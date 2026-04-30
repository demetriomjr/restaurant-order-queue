import type { Order } from '@prisma/client';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  addOrderItemCommand,
  createOrderCommand,
  removeOrderItemCommand,
  updateOrderStatusCommand
} from './commands.js';
import { orderRepository, publishEvent } from '../infrastructure/persistence.js';

vi.mock('../infrastructure/persistence.js', () => ({
  orderRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    updateStatus: vi.fn(),
    addItem: vi.fn(),
    removeItem: vi.fn()
  },
  publishEvent: vi.fn(),
  seedMenu: vi.fn()
}));

const mockedRepo = vi.mocked(orderRepository);
const mockedPublishEvent = vi.mocked(publishEvent);

function makeOrder(overrides: Partial<Order> = {}): Order {
  return {
    id: 'order-1',
    tableId: 'table-1',
    status: 'PENDING',
    total: 42,
    items: [],
    createdAt: new Date('2026-04-30T10:00:00.000Z'),
    updatedAt: new Date('2026-04-30T10:00:00.000Z'),
    pendingStartedAt: new Date('2026-04-30T10:00:00.000Z'),
    preparingStartedAt: null,
    onTheWayStartedAt: null,
    ...overrides
  };
}

describe('application/commands', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('createOrderCommand publica ORDER_CREATED com payload completo', async () => {
    const order = makeOrder();
    mockedRepo.create.mockResolvedValue(order);

    const result = await createOrderCommand({
      tableId: 'table-1',
      items: [{ productId: 'p1', productName: 'Item', quantity: 1, unitPrice: 42 }]
    });

    expect(result).toEqual(order);
    expect(mockedPublishEvent).toHaveBeenCalledWith(
      'ORDER_CREATED',
      expect.objectContaining({
        orderId: order.id,
        tableId: order.tableId,
        status: order.status,
        total: order.total,
        pendingStartedAt: order.pendingStartedAt
      })
    );
  });

  it('updateOrderStatusCommand bloqueia saída de CANCELLED', async () => {
    mockedRepo.findById.mockResolvedValue(makeOrder({ status: 'CANCELLED' }));

    await expect(
      updateOrderStatusCommand({ orderId: 'order-1', status: 'PREPARING' })
    ).rejects.toThrow('Cancelled orders cannot change status');

    expect(mockedRepo.updateStatus).not.toHaveBeenCalled();
    expect(mockedPublishEvent).not.toHaveBeenCalled();
  });

  it('updateOrderStatusCommand publica evento quando status muda', async () => {
    mockedRepo.findById.mockResolvedValue(makeOrder({ status: 'PENDING' }));
    mockedRepo.updateStatus.mockResolvedValue(
      makeOrder({
        status: 'PREPARING',
        preparingStartedAt: new Date('2026-04-30T10:05:00.000Z')
      })
    );

    await updateOrderStatusCommand({ orderId: 'order-1', status: 'PREPARING' });

    expect(mockedRepo.updateStatus).toHaveBeenCalledWith('order-1', 'PREPARING');
    expect(mockedPublishEvent).toHaveBeenCalledWith(
      'ORDER_STATUS_CHANGED',
      expect.objectContaining({
        orderId: 'order-1',
        newStatus: 'PREPARING'
      })
    );
  });

  it('add/remove item publicam eventos corretos', async () => {
    mockedRepo.addItem.mockResolvedValue(makeOrder({ total: 84 }));
    mockedRepo.removeItem.mockResolvedValue(makeOrder({ total: 42 }));

    await addOrderItemCommand({
      orderId: 'order-1',
      item: { productId: 'p2', productName: 'Item 2', quantity: 1, unitPrice: 42 }
    });
    await removeOrderItemCommand({ orderId: 'order-1', productId: 'p2' });

    expect(mockedPublishEvent).toHaveBeenNthCalledWith(
      1,
      'ORDER_ITEM_ADDED',
      expect.objectContaining({ orderId: 'order-1', tableId: 'table-1' })
    );
    expect(mockedPublishEvent).toHaveBeenNthCalledWith(
      2,
      'ORDER_ITEM_REMOVED',
      expect.objectContaining({ orderId: 'order-1', tableId: 'table-1', productId: 'p2' })
    );
  });
});
