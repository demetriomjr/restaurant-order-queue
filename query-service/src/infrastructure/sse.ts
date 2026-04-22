import { IncomingMessage, ServerResponse } from 'http';

interface SSEClient {
  tableId: string;
  res: ServerResponse;
}

class SSEClientManager {
  private clients: SSEClient[] = [];

  addClient(tableId: string, res: ServerResponse) {
    this.clients.push({ tableId, res });
    console.log(`SSE client connected for table ${tableId}. Total clients: ${this.clients.length}`);
  }

  removeClient(res: ServerResponse) {
    this.clients = this.clients.filter(c => c.res !== res);
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