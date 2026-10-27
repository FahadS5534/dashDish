export interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  available: boolean;
  category?: string;
  imageUrl?: string;
  tags?: string[];
  courseId?: string;
  todaySold?: number;
}

export interface Restaurant {
  id: number;
  name: string;
  description: string;
  city: string;
  address: string;
  active: boolean;
  ownerId?: number;
  cuisine?: string;
  rating?: number;
  reviewsCount?: number;
  deliveryTime?: string;
  minOrder?: number;
  chef?: string;
  imageUrl?: string;
  heroTag?: string;
  badge?: string;
  featuredEntree?: {
    name: string;
    price: number;
  };
  technique?: string;
}
