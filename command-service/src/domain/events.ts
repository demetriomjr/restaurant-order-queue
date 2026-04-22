import { EventEmitter } from 'events';

export interface DomainEvent {
  type: string;
  payload: any;
  occurredAt: Date;
}

export class OrderCreatedEvent implements DomainEvent {
  type = 'ORDER_CREATED';
  constructor(
    public payload: { orderId: string; tableId: string; items: any[] },
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderStatusChangedEvent implements DomainEvent {
  type = 'ORDER_STATUS_CHANGED';
  constructor(
    public payload: { orderId: string; tableId: string; oldStatus: string; newStatus: string },
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderItemAddedEvent implements DomainEvent {
  type = 'ORDER_ITEM_ADDED';
  constructor(
    public payload: { orderId: string; tableId: string; item: any },
    public occurredAt: Date = new Date()
  ) {}
}

export class OrderItemRemovedEvent implements DomainEvent {
  type = 'ORDER_ITEM_REMOVED';
  constructor(
    public payload: { orderId: string; tableId: string; productId: string },
    public occurredAt: Date = new Date()
  ) {}
}

export class EventBus extends EventEmitter {
  publish(event: DomainEvent): void {
    this.emit(event.type, event);
  }
}

export const eventBus = new EventBus();