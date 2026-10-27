export interface User {
  id: number;
  email: string;
  fullName: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'ADMIN' | 'DELIVERY_PARTNER';
  phone?: string;
  avatarUrl?: string;
}

export interface AuthResponse {
  token: string;
  email: string;
  role: string;
}
