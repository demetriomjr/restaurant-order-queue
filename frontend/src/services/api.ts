const API_BASE = 'http://localhost:3000';

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  category: string;
  price: number;
  available: boolean;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface Order {
  id: string;
  tableId: string;
  items: OrderItem[];
  status: string;
  total: number;
  createdAt: string;
  updatedAt: string;
}

export const api = {
  async getMenu(): Promise<MenuItem[]> {
    const res = await fetch(`${API_BASE}/queries/menu`);
    return res.json();
  },

  async createOrder(tableId: string, items: OrderItem[]): Promise<Order> {
    const res = await fetch(`${API_BASE}/commands/create-order`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tableId, items })
    });
    return res.json();
  },

  async addItem(orderId: string, item: OrderItem): Promise<Order> {
    const res = await fetch(`${API_BASE}/commands/add-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, item })
    });
    return res.json();
  },

  async removeItem(orderId: string, productId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/commands/remove-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, productId })
    });
    return res.json();
  },

  async updateStatus(orderId: string, status: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/commands/update-status`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status })
    });
    return res.json();
  },

  async getOrder(orderId: string): Promise<Order> {
    const res = await fetch(`${API_BASE}/queries/order/${orderId}`);
    return res.json();
  },

  async getOrdersByTable(tableId: string): Promise<Order[]> {
    const res = await fetch(`${API_BASE}/queries/orders/table/${tableId}`);
    return res.json();
  }
};

export function createSSEConnection(tableId: string, onMessage: (data: any) => void): EventSource {
  const es = new EventSource(`${API_BASE}/sse/table/${tableId}`);
  es.onmessage = (event) => {
    const data = JSON.parse(event.data);
    onMessage(data);
  };
  return es;
}