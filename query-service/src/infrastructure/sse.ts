import { ServerResponse } from 'http';

interface SSEClient {
  tableId: string;
  res: ServerResponse;
}

class SSEClientManager {
  private clients: SSEClient[] = [];

  addClient(tableId: string, res: ServerResponse) {
    const clientType = tableId === 'all' ? 'KITCHEN_DISPLAY' : 'TABLET';
    this.clients.push({ tableId, res });
    console.log(`[SSE] ${clientType} connected for table "${tableId}". Total clients: ${this.clients.length}`);
  }

  removeClient(res: ServerResponse) {
    const client = this.clients.find(c => c.res === res);
    const clientType = client?.tableId === 'all' ? 'KITCHEN_DISPLAY' : 'TABLET';
    this.clients = this.clients.filter(c => c.res !== res);
    console.log(`[SSE] ${clientType} disconnected. Remaining: ${this.clients.length}`);
  }

  broadcast(tableId: string, data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    this.clients
      .filter(c => c.tableId === tableId)
      .forEach(client => {
        client.res.write(message);
      });
  }

  broadcastAll(data: any) {
    const message = `data: ${JSON.stringify(data)}\n\n`;
    
    this.clients.forEach(client => {
      client.res.write(message);
    });
  }
}

export const sseClients = new SSEClientManager();