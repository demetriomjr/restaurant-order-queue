import { describe, expect, it, vi } from 'vitest';
import { sseClients } from './sse.js';

function createResponseMock() {
  return {
    write: vi.fn()
  } as any;
}

describe('SSEClientManager', () => {
  it('envia broadcast apenas para mesa alvo', () => {
    const tableA = createResponseMock();
    const tableB = createResponseMock();

    sseClients.addClient('table-1', tableA);
    sseClients.addClient('table-2', tableB);
    sseClients.broadcast('table-1', { type: 'ORDER_STATUS_CHANGED', payload: { orderId: '1' } });

    expect(tableA.write).toHaveBeenCalledTimes(1);
    expect(tableA.write).toHaveBeenCalledWith(
      expect.stringContaining('"type":"ORDER_STATUS_CHANGED"')
    );
    expect(tableB.write).not.toHaveBeenCalled();

    sseClients.removeClient(tableA);
    sseClients.removeClient(tableB);
  });

  it('envia broadcastAll para todos os clientes conectados', () => {
    const kitchen = createResponseMock();
    const tablet = createResponseMock();

    sseClients.addClient('all', kitchen);
    sseClients.addClient('table-9', tablet);
    sseClients.broadcastAll({ type: 'PING' });

    expect(kitchen.write).toHaveBeenCalledTimes(1);
    expect(tablet.write).toHaveBeenCalledTimes(1);

    sseClients.removeClient(kitchen);
    sseClients.removeClient(tablet);
  });
});

