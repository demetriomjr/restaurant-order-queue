import { EventEmitter } from 'events';

export interface DomainEvent {
  type: string;
  payload: Record<string, unknown>;
  occurredAt: Date;
}

interface OrderCreatedPayload {
  orderId: string;
  tableId: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  }>;
}

interface OrderStatusChangedPayload {
  orderId: string;
  tableId: string;
  oldStatus: string;
  newStatus: string;
}

interface OrderItemPayload {
  orderId: string;
  tableId: string;
  item: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    notes?: string;
  };
}

interface OrderItemRemovedPayload {
  orderId: string;
  tableId: string;
  productId: string;
}

export class OrderCreatedEvent implements DomainEvent {
  type = 'ORDER_CREATED';

  constructor(
    public payload: OrderCreatedPayload,
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderStatusChangedEvent implements DomainEvent {
  type = 'ORDER_STATUS_CHANGED';

  constructor(
    public payload: OrderStatusChangedPayload,
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderItemAddedEvent implements DomainEvent {
  type = 'ORDER_ITEM_ADDED';

  constructor(
    public payload: OrderItemPayload,
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderItemRemovedEvent implements DomainEvent {
  type = 'ORDER_ITEM_REMOVED';

  constructor(
    public payload: OrderItemRemovedPayload,
    public occurredAt: Date = new Date()
  ) {}
}

export class EventBus extends EventEmitter {
  publish(event: DomainEvent): void {
    this.emit(event.type, event);
  }
}

export const eventBus = new EventBus();