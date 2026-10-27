export interface CartItem {
  id?: number;
  menuItemId: number;
  menuItemName: string;
  price: number;
  quantity: number;
  subtotal: number;
  note?: string;
  imageUrl?: string;
}

export interface Cart {
  id?: number;
  restaurantId: number | null;
  restaurantName: string | null;
  items: CartItem[];
  totalPrice: number;
}
