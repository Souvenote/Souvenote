export class CreateOrderDto {
    userId!: string;
  orderNumber!: string;
  totalAmount!: number;
  currency?: string; // Optional, defaults to CAD in entity
  shippingAddress?: any;
  billingAddress?: any;
  orderItemsSnapshot!: any;
}
