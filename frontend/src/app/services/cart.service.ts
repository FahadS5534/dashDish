import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Cart, CartItem } from '../models/cart.model';
import { MenuItem, Restaurant } from '../models/restaurant.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private apiUrl = '/api/v1/cart';

  // Initial cart items matching the exact design specs
  private initialCart: Cart = {
    id: 1,
    restaurantId: 1,
    restaurantName: 'Osteria Del Sole',
    items: [
      {
        menuItemId: 101,
        menuItemName: 'Campanelle al Tartufo',
        price: 24.00,
        quantity: 2,
        subtotal: 48.00,
        note: 'Note: Extra parmigiano on side',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgLevigpg_Vl1EFXFYyM5qW0E8_LYN9TiEP18cq1xSEJQusHlr39TPs3VMr8MsPu5O12IDBhh5tZoCpEjNNUcHsMgWD47Cpny6BXxGXtutBg76Nbpvrn_qBfQ7wYHSCeTK575Mg3U7D0OfZ-Wx8JZPN5cjeTVPx860tl-56ralEd8b6WGaFN9CvvRwdoWeBr98CLrzhc6Q4DUAqxKlOQy4-oP2YH_FxwZjogDzOJ2VFIAG2GtWksQ'
      },
      {
        menuItemId: 103,
        menuItemName: 'Heirloom Burrata & Roasted Fig',
        price: 18.50,
        quantity: 1,
        subtotal: 18.50,
        note: 'Pairing: Warm toasted sourdough',
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1OOUh-Ax9Uuby0t6Ojy6NCe68t5NRGcJGcPkp_nSdcGgsVhbNeIkxOKob810bZF4cDpc7hkMZ2EGrU9CEEBM6oRNCJF5WdtCoh-BwHB_E0OEdOQ-XJvvnk3XMbg7z9Vc8mlDH_y_RwgBkGohBL6wXocafuvzlMjfdk3eut4QA-jDnchKQwkeR6b6lZweYiOdst9991zCpSZWx6T9ZJrIIPFnzYzWx_MTTAzSUztUogQND3ADL-VDN'
      }
    ],
    totalPrice: 66.50
  };

  private cartSignal = signal<Cart>(this.loadStoredCart());
  cart = this.cartSignal.asReadonly();

  // Pricing calculations matching the editorial checkout sheet
  courierFee = 4.99;
  taxRate = 0.068; // ~ $4.50 on $66.50 subtotal
  tipSignal = signal<number>(5.00);
  tip = this.tipSignal.asReadonly();

  subtotal = computed(() => {
    return this.cartSignal().items.reduce((sum, item) => sum + item.subtotal, 0);
  });

  totalItemsCount = computed(() => {
    return this.cartSignal().items.reduce((count, item) => count + item.quantity, 0);
  });

  tax = computed(() => {
    return Number((this.subtotal() * 0.068).toFixed(2));
  });

  totalAmount = computed(() => {
    if (this.subtotal() === 0) return 0;
    return Number((this.subtotal() + this.courierFee + this.tax() + this.tipSignal()).toFixed(2));
  });

  headerBadgeText = computed(() => {
    const count = this.totalItemsCount();
    const total = this.subtotal();
    return `${count} ${count === 1 ? 'item' : 'items'} • $${total.toFixed(2)}`;
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.fetchBackendCart();
  }

  private loadStoredCart(): Cart {
    try {
      const stored = localStorage.getItem('dashdish_cart');
      return stored ? JSON.parse(stored) : this.initialCart;
    } catch {
      return this.initialCart;
    }
  }

  private saveCart(c: Cart) {
    this.cartSignal.set(c);
    try {
      localStorage.setItem('dashdish_cart', JSON.stringify(c));
    } catch (e) {
      console.warn('Could not save cart to localStorage', e);
    }
  }

  fetchBackendCart() {
    this.http.get<any>(this.apiUrl, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (res && res.data && res.data.items && res.data.items.length > 0) {
          // Merge or update from backend
        }
      });
  }

  addItem(item: MenuItem, restaurant: { id: number; name: string }, quantity: number = 1) {
    let current = { ...this.cartSignal() };

    // Enforce single-restaurant rule
    if (current.restaurantId && current.restaurantId !== restaurant.id && current.items.length > 0) {
      if (confirm(`Your cart already contains artisan items from ${current.restaurantName}. Starting an order with ${restaurant.name} will clear your current cart. Proceed?`)) {
        current = {
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          items: [],
          totalPrice: 0
        };
        this.toastService.show(`Cart cleared for single-restaurant freshness: ${restaurant.name}`, 'info', 'swap_horiz');
      } else {
        return;
      }
    }

    current.restaurantId = restaurant.id;
    current.restaurantName = restaurant.name;

    const existingIdx = current.items.findIndex(i => i.menuItemId === item.id);
    if (existingIdx !== -1) {
      const existing = current.items[existingIdx];
      const newQty = existing.quantity + quantity;
      current.items[existingIdx] = {
        ...existing,
        quantity: newQty,
        subtotal: Number((newQty * existing.price).toFixed(2))
      };
    } else {
      current.items.push({
        menuItemId: item.id,
        menuItemName: item.name,
        price: item.price,
        quantity: quantity,
        subtotal: Number((quantity * item.price).toFixed(2)),
        imageUrl: item.imageUrl
      });
    }

    current.totalPrice = current.items.reduce((s, i) => s + i.subtotal, 0);
    this.saveCart(current);

    this.toastService.show(`Added ${item.name} to order`, 'success', 'shopping_bag');

    // Call backend API
    this.http.post<any>(`${this.apiUrl}/items`, {
      menuItemId: item.id,
      quantity: quantity
    }, { headers: this.authService.getAuthHeaders() })
    .pipe(catchError(() => of(null)))
    .subscribe();
  }

  updateItemQuantity(menuItemId: number, delta: number) {
    const current = { ...this.cartSignal() };
    const idx = current.items.findIndex(i => i.menuItemId === menuItemId);

    if (idx !== -1) {
      const item = current.items[idx];
      const newQty = item.quantity + delta;

      if (newQty <= 0) {
        current.items.splice(idx, 1);
        this.toastService.show(`Removed ${item.menuItemName} from cart`, 'info', 'remove_shopping_cart');
      } else {
        current.items[idx] = {
          ...item,
          quantity: newQty,
          subtotal: Number((newQty * item.price).toFixed(2))
        };
      }

      if (current.items.length === 0) {
        current.restaurantId = null;
        current.restaurantName = null;
      }

      current.totalPrice = current.items.reduce((s, i) => s + i.subtotal, 0);
      this.saveCart(current);

      // Backend API sync
      this.http.post<any>(`${this.apiUrl}/items`, {
        menuItemId: menuItemId,
        quantity: delta
      }, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();
    }
  }

  updateItemNote(menuItemId: number, note: string) {
    const current = { ...this.cartSignal() };
    const idx = current.items.findIndex(i => i.menuItemId === menuItemId);
    if (idx !== -1) {
      current.items[idx].note = note;
      this.saveCart(current);
      this.toastService.show('Chef prep note updated', 'success', 'edit_note');
    }
  }

  setTip(amount: number) {
    this.tipSignal.set(amount);
  }

  clearCart() {
    const cleared: Cart = {
      restaurantId: null,
      restaurantName: null,
      items: [],
      totalPrice: 0
    };
    this.saveCart(cleared);
    this.http.delete(this.apiUrl, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }
}
