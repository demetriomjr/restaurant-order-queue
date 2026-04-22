import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Order Entity', () => {
  interface OrderItemProps {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }

  interface OrderProps {
    id?: string;
    tableId: string;
    items: OrderItemProps[];
    status?: string;
    total?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  class OrderItem {
    constructor(
      public readonly productId: string,
      public readonly productName: string,
      public readonly quantity: number,
      public readonly unitPrice: number,
      public readonly notes: string = ''
    ) {}

    get total(): number {
      return this.quantity * this.unitPrice;
    }

    toPlain(): OrderItemProps {
      return {
        productId: this.productId,
        productName: this.productName,
        quantity: this.quantity,
        unitPrice: this.unitPrice,
        notes: this.notes
      };
    }
  }

  class Order {
    public readonly id: string;
    public readonly tableId: string;
    public readonly items: OrderItem[];
    public readonly status: string;
    public readonly total: number;
    public readonly createdAt: Date;
    public readonly updatedAt: Date;

    constructor(props: OrderProps) {
      this.id = props.id || `order-${Date.now()}`;
      this.tableId = props.tableId;
      this.items = props.items.map(i => new OrderItem(i.productId, i.productName, i.quantity, i.unitPrice, i.notes));
      this.status = props.status || 'PENDING';
      this.total = props.total || this.calculateTotal();
      this.createdAt = props.createdAt || new Date();
      this.updatedAt = props.updatedAt || new Date();
    }

    private calculateTotal(): number {
      return this.items.reduce((sum, item) => sum + item.total, 0);
    }

    updateStatus(newStatus: string): Order {
      return new Order({
        ...this.toPlain(),
        status: newStatus,
        updatedAt: new Date()
      });
    }

    addItem(item: OrderItemProps): Order {
      return new Order({
        ...this.toPlain(),
        items: [...this.toPlain().items, item],
        updatedAt: new Date()
      });
    }

    removeItem(productId: string): Order {
      return new Order({
        ...this.toPlain(),
        items: this.toPlain().items.filter(i => i.productId !== productId),
        updatedAt: new Date()
      });
    }

    toPlain(): OrderProps & { items: OrderItemProps[] } {
      return {
        id: this.id,
        tableId: this.tableId,
        items: this.items.map(i => i.toPlain()),
        status: this.status,
        total: this.total,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      };
    }
  }

  describe('Order Creation', () => {
    it('should create an order with correct tableId', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [
          { productId: 'prod-1', productName: 'Hambúrguer', quantity: 2, unitPrice: 42.90 }
        ]
      });

      expect(order.tableId).toBe('table-1');
    });

    it('should calculate total correctly', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [
          { productId: 'prod-1', productName: 'Hambúrguer', quantity: 2, unitPrice: 42.90 },
          { productId: 'prod-2', productName: 'Batata', quantity: 1, unitPrice: 19.90 }
        ]
      });

      expect(order.total).toBe(105.70);
    });

    it('should default status to PENDING', () => {
      const order = new Order({
        tableId: 'table-1',
        items: []
      });

      expect(order.status).toBe('PENDING');
    });

    it('should set custom status when provided', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [],
        status: 'CONFIRMED'
      });

      expect(order.status).toBe('CONFIRMED');
    });
  });

  describe('Order Status Update', () => {
    it('should update status correctly', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [],
        status: 'PENDING'
      });

      const updatedOrder = order.updateStatus('CONFIRMED');

      expect(updatedOrder.status).toBe('CONFIRMED');
      expect(updatedOrder.id).toBe(order.id);
    });

    it('should preserve items after status update', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [
          { productId: 'prod-1', productName: 'Pizza', quantity: 1, unitPrice: 58.90 }
        ]
      });

      const updatedOrder = order.updateStatus('PREPARING');

      expect(updatedOrder.items.length).toBe(1);
      expect(updatedOrder.items[0].productName).toBe('Pizza');
    });
  });

  describe('Order Item Management', () => {
    it('should add item correctly', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [
          { productId: 'prod-1', productName: 'Hambúrguer', quantity: 1, unitPrice: 42.90 }
        ]
      });

      const updatedOrder = order.addItem({
        productId: 'prod-2',
        productName: 'Refrigerante',
        quantity: 2,
        unitPrice: 8.90
      });

      expect(updatedOrder.items.length).toBe(2);
      expect(updatedOrder.total).toBe(60.70);
    });

    it('should remove item correctly', () => {
      const order = new Order({
        tableId: 'table-1',
        items: [
          { productId: 'prod-1', productName: 'Hambúrguer', quantity: 1, unitPrice: 42.90 },
          { productId: 'prod-2', productName: 'Refrigerante', quantity: 1, unitPrice: 8.90 }
        ]
      });

      const updatedOrder = order.removeItem('prod-1');

      expect(updatedOrder.items.length).toBe(1);
      expect(updatedOrder.items[0].productId).toBe('prod-2');
      expect(updatedOrder.total).toBe(8.90);
    });
  });

  describe('OrderItem', () => {
    it('should calculate item total correctly', () => {
      const item = new OrderItem('prod-1', 'Hambúrguer', 3, 42.90);

      expect(item.total).toBe(128.70);
    });

    it('should handle notes', () => {
      const item = new OrderItem('prod-1', 'Hambúrguer', 1, 42.90, 'Sem cebola');

      expect(item.notes).toBe('Sem cebola');
    });

    it('should serialize to plain object', () => {
      const item = new OrderItem('prod-1', 'Pizza', 2, 58.90, 'Borda rechada');

      const plain = item.toPlain();

      expect(plain).toEqual({
        productId: 'prod-1',
        productName: 'Pizza',
        quantity: 2,
        unitPrice: 58.90,
        notes: 'Borda rechada'
      });
    });
  });
});