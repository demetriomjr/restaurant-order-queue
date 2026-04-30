import { beforeEach, describe, expect, it, vi } from 'vitest';

const prismaMock = {
  order: {
    upsert: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn()
  },
  product: {
    findMany: vi.fn()
  }
};

const sseMock = {
  broadcast: vi.fn()
};

const pubsubMock = {
  publish: vi.fn()
};

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => prismaMock)
}));

vi.mock('./sse.js', () => ({
  sseClients: sseMock
}));

vi.mock('./pubsub.js', () => ({
  pubsub: pubsubMock
}));

describe('persistence.handleDomainEvent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('projeta ORDER_CREATED e publica em SSE + pubsub', async () => {
    const { __test__ } = await import('./persistence.js');
    prismaMock.order.upsert.mockResolvedValue({ id: 'o1', tableId: 'table-1' });

    await __test__.handleDomainEvent({
      type: 'ORDER_CREATED',
      payload: {
        orderId: 'o1',
        tableId: 'table-1',
        status: 'PENDING',
        total: 42,
        items: []
      },
      occurredAt: '2026-04-30T10:00:00.000Z'
    });

    expect(prismaMock.order.upsert).toHaveBeenCalled();
    expect(sseMock.broadcast).toHaveBeenCalledWith('table-1', expect.any(Object));
    expect(sseMock.broadcast).toHaveBeenCalledWith('all', expect.any(Object));
    expect(pubsubMock.publish).toHaveBeenCalledWith('ORDER_UPDATED_table-1', expect.any(Object));
  });

  it('usa fallback de tableId quando evento de status vem sem tableId', async () => {
    const { __test__ } = await import('./persistence.js');
    prismaMock.order.findUnique.mockResolvedValue({ id: 'o2', tableId: 'table-9' });
    prismaMock.order.update.mockResolvedValue({ id: 'o2', tableId: 'table-9', status: 'PREPARING' });

    await __test__.handleDomainEvent({
      type: 'ORDER_STATUS_CHANGED',
      payload: {
        orderId: 'o2',
        newStatus: 'PREPARING'
      },
      occurredAt: '2026-04-30T10:00:00.000Z'
    });

    expect(sseMock.broadcast).toHaveBeenCalledWith('table-9', expect.any(Object));
    expect(pubsubMock.publish).toHaveBeenCalledWith('ORDER_UPDATED_table-9', expect.any(Object));
  });
});

