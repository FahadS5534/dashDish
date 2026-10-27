export type OrderStatus =
  | 'PLACED'
  | 'PREPARING'
  | 'READY'
  | 'READY_FOR_PICKUP'
  | 'OUT_FOR_DELIVERY'
  | 'PICKED_UP'
  | 'DELIVERED'
  | 'CANCELLED';

export interface OrderItem {
  id?: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
  notes?: string;
  description?: string;
}

export interface Order {
  id: number;
  ticketNumber?: string;
  userId?: number;
  customerName?: string;
  restaurantId: number;
  restaurantName: string;
  addressId?: number;
  deliveryAddress: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  tax: number;
  tip: number;
  totalAmount: number;
  specialInstructions?: string;
  createdAt: string;
  placedTime?: string;
  estimatedDelivery?: string;
  courierName?: string;
  targetPassTime?: string;
}

export interface OrderRequest {
  deliveryAddressId?: number;
  deliveryAddress?: string;
  specialInstructions?: string;
  tip?: number;
}
