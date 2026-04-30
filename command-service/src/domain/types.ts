export interface OrderItemInput {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
}

export interface OrderResolverParent {
  items: unknown;
  createdAt?: Date;
  updatedAt?: Date;
}
