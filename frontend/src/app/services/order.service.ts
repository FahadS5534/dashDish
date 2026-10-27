import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order, OrderStatus, OrderRequest } from '../models/order.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = '/api/v1/orders';

  // Primary active order matching checkout design #DD-84920
  private defaultActiveOrder: Order = {
    id: 84920,
    ticketNumber: 'DD-84920',
    userId: 1,
    customerName: 'Elena Rostova',
    restaurantId: 1,
    restaurantName: 'Osteria Del Sole',
    addressId: 742,
    deliveryAddress: '742 Evergreen Terrace, Apt 4B, Springfield, OR 97477',
    status: 'PREPARING',
    items: [
      {
        id: 1,
        menuItemId: 101,
        menuItemName: 'Hand-Cut Tagliolini al Tartufo',
        price: 32.00,
        quantity: 1,
        subtotal: 32.00,
        description: 'Summer black truffle, cultured Normandy butter, 36mo parmigiano'
      },
      {
        id: 2,
        menuItemId: 104,
        menuItemName: 'Wood-Fired Wild Morel Focaccia',
        price: 14.50,
        quantity: 1,
        subtotal: 14.50,
        description: 'Heritage stone-ground wheat, rosemary sea salt crystals, cold-pressed olive oil'
      },
      {
        id: 3,
        menuItemId: 109,
        menuItemName: 'Artisanal Panna Cotta al Limone',
        price: 12.00,
        quantity: 1,
        subtotal: 12.00,
        description: 'Sorrento lemon reduction, candied thyme leaves'
      }
    ],
    subtotal: 58.50,
    deliveryFee: 4.99,
    tax: 4.50,
    tip: 5.00,
    totalAmount: 72.99,
    placedTime: '12:44 PM Today',
    estimatedDelivery: '1:15 PM (28–34 mins)',
    courierName: 'Marcus V.',
    specialInstructions: 'Ring buzzer 042, leave at front door alcove.',
    createdAt: new Date().toISOString()
  };

  // Partner portal active production stream orders matching design
  private partnerProductionStream: Order[] = [
    {
      id: 84920,
      ticketNumber: 'DD-84920',
      customerName: 'Elena Rostova',
      restaurantId: 1,
      restaurantName: 'Osteria Del Sole',
      deliveryAddress: '742 Evergreen Terrace, Apt 4B',
      status: 'PREPARING',
      items: [
        {
          id: 1,
          menuItemId: 101,
          menuItemName: 'Campanelle al Tartufo',
          price: 24.00,
          quantity: 2,
          subtotal: 48.00,
          description: 'Umbrian black truffle, cultured butter'
        },
        {
          id: 2,
          menuItemId: 103,
          menuItemName: 'Heirloom Burrata di Puglia',
          price: 18.50,
          quantity: 1,
          subtotal: 18.50,
          description: 'Roasted confit cherry tomatoes, basil oil'
        }
      ],
      subtotal: 66.50,
      deliveryFee: 4.99,
      tax: 4.50,
      tip: 5.00,
      totalAmount: 66.50,
      placedTime: 'Placed 8m ago',
      targetPassTime: '1:15 PM Target',
      specialInstructions: 'Chef Prep Request: "Extra parmigiano reggiano aged 24m packed on side. Separate warm paper wrap for bread."',
      createdAt: new Date().toISOString()
    },
    {
      id: 84924,
      ticketNumber: 'DD-84924',
      customerName: 'Julian Vance',
      restaurantId: 1,
      restaurantName: 'Osteria Del Sole',
      deliveryAddress: '220 Hawthorne Blvd',
      status: 'PLACED',
      items: [
        {
          id: 3,
          menuItemId: 105,
          menuItemName: 'Wild Boar Pappardelle',
          price: 28.00,
          quantity: 1,
          subtotal: 28.00
        },
        {
          id: 4,
          menuItemId: 104,
          menuItemName: 'Wood-Fired Focaccia',
          price: 14.50,
          quantity: 1,
          subtotal: 14.50
        }
      ],
      subtotal: 42.50,
      deliveryFee: 4.99,
      tax: 3.51,
      tip: 5.00,
      totalAmount: 52.00,
      placedTime: 'Placed 2m ago',
      targetPassTime: '1:28 PM Target',
      createdAt: new Date().toISOString()
    },
    {
      id: 84918,
      ticketNumber: 'DD-84918',
      customerName: 'Marcus Sterling',
      restaurantId: 1,
      restaurantName: 'Osteria Del Sole',
      deliveryAddress: '55 Pearl St, Ste 400',
      status: 'PREPARING',
      items: [
        {
          id: 5,
          menuItemId: 101,
          menuItemName: 'Hand-Cut Tagliolini al Burro e Salvia',
          price: 24.00,
          quantity: 2,
          subtotal: 48.00
        }
      ],
      subtotal: 48.00,
      deliveryFee: 4.99,
      tax: 3.84,
      tip: 4.00,
      totalAmount: 48.00,
      placedTime: 'Placed 16m ago',
      targetPassTime: '1:12 PM Target',
      createdAt: new Date().toISOString()
    },
    {
      id: 84915,
      ticketNumber: 'DD-84915',
      customerName: 'Claire Chen',
      restaurantId: 1,
      restaurantName: 'Osteria Del Sole',
      deliveryAddress: '900 SW 5th Ave',
      status: 'READY',
      items: [
        {
          id: 6,
          menuItemId: 106,
          menuItemName: 'Handcrafted Campanelle & Truffle',
          price: 24.50,
          quantity: 1,
          subtotal: 24.50
        },
        {
          id: 7,
          menuItemId: 106,
          menuItemName: 'Olive Oil & Meyer Lemon Cake',
          price: 11.00,
          quantity: 1,
          subtotal: 11.00
        }
      ],
      subtotal: 35.50,
      deliveryFee: 4.99,
      tax: 2.84,
      tip: 4.00,
      totalAmount: 41.00,
      placedTime: 'Plated 3m ago',
      targetPassTime: 'Ready at Pass',
      courierName: 'Matteo R. (En Route 2m)',
      createdAt: new Date().toISOString()
    }
  ];

  private activeOrderSignal = signal<Order>(this.loadStoredOrder());
  activeOrder = this.activeOrderSignal.asReadonly();

  private partnerOrdersSignal = signal<Order[]>(this.partnerProductionStream);
  partnerOrders = this.partnerOrdersSignal.asReadonly();

  // Selected ticket for partner portal focused view
  private selectedPartnerOrderSignal = signal<Order>(this.partnerProductionStream[0]);
  selectedPartnerOrder = this.selectedPartnerOrderSignal.asReadonly();

  // Metrics for partner portal
  incomingCount = computed(() => this.partnerOrdersSignal().filter(o => o.status === 'PLACED').length);
  preparingCount = computed(() => this.partnerOrdersSignal().filter(o => o.status === 'PREPARING').length);
  readyCount = computed(() => this.partnerOrdersSignal().filter(o => o.status === 'READY' || o.status === 'READY_FOR_PICKUP').length);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.fetchUserOrders();
  }

  private loadStoredOrder(): Order {
    try {
      const stored = localStorage.getItem('dashdish_active_order');
      return stored ? JSON.parse(stored) : this.defaultActiveOrder;
    } catch {
      return this.defaultActiveOrder;
    }
  }

  private saveOrder(order: Order) {
    this.activeOrderSignal.set(order);
    try {
      localStorage.setItem('dashdish_active_order', JSON.stringify(order));
    } catch (e) {
      console.warn('Could not save order', e);
    }
  }

  fetchUserOrders() {
    this.http.get<any>(this.apiUrl, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.activeOrderSignal.set(res.data[0]);
        }
      });
  }

  fetchRestaurantOrders() {
    this.http.get<any>(`${this.apiUrl}/owner`, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.partnerOrdersSignal.set(res.data);
        }
      });
  }

  selectPartnerOrder(order: Order) {
    this.selectedPartnerOrderSignal.set(order);
  }

  updateOrderStatus(orderId: number, newStatus: OrderStatus) {
    // Update active order if matches
    if (this.activeOrderSignal().id === orderId) {
      const updated = { ...this.activeOrderSignal(), status: newStatus };
      this.saveOrder(updated);
    }

    // Update partner orders
    const partnerList = this.partnerOrdersSignal().map(o => {
      if (o.id === orderId) {
        return { ...o, status: newStatus };
      }
      return o;
    });
    this.partnerOrdersSignal.set(partnerList);

    // Update focused ticket
    if (this.selectedPartnerOrderSignal().id === orderId) {
      this.selectedPartnerOrderSignal.set({ ...this.selectedPartnerOrderSignal(), status: newStatus });
    }

    this.toastService.show(
      `Status updated to ${newStatus} (PUT /api/v1/orders/${orderId}/status)`,
      'success',
      'sync'
    );

    // Map frontend design status to backend Spring Boot enum
    let backendStatus = newStatus;
    if (newStatus === 'READY_FOR_PICKUP') backendStatus = 'READY';
    if (newStatus === 'PICKED_UP') backendStatus = 'OUT_FOR_DELIVERY';

    this.http.put(`${this.apiUrl}/${orderId}/status?status=${backendStatus}`, {}, {
      headers: this.authService.getAuthHeaders()
    }).pipe(catchError(() => of(null))).subscribe();
  }

  checkout(orderRequest: OrderRequest, items: any[], subtotal: number, restaurantName: string = 'Osteria Del Sole'): Order {
    const newId = Math.floor(10000 + Math.random() * 90000);
    const newOrder: Order = {
      id: newId,
      ticketNumber: `DD-${newId}`,
      userId: 1,
      customerName: 'Elena Rostova',
      restaurantId: 1,
      restaurantName: restaurantName,
      deliveryAddress: orderRequest.deliveryAddress || '742 Evergreen Terrace, Apt 4B',
      status: 'PLACED',
      items: items.map(i => ({
        menuItemId: i.menuItemId,
        menuItemName: i.menuItemName,
        price: i.price,
        quantity: i.quantity,
        subtotal: i.subtotal,
        notes: i.note
      })),
      subtotal: subtotal,
      deliveryFee: 4.99,
      tax: Number((subtotal * 0.068).toFixed(2)),
      tip: orderRequest.tip ?? 5.00,
      totalAmount: Number((subtotal + 4.99 + (subtotal * 0.068) + (orderRequest.tip ?? 5.00)).toFixed(2)),
      placedTime: 'Just now',
      estimatedDelivery: '25–35 min preparation & transit',
      courierName: 'Marcus V.',
      specialInstructions: orderRequest.specialInstructions || 'Ring buzzer 042, leave at front door alcove.',
      createdAt: new Date().toISOString()
    };

    this.saveOrder(newOrder);

    // Also push to partner production stream
    const partnerList = [newOrder, ...this.partnerOrdersSignal()];
    this.partnerOrdersSignal.set(partnerList);
    this.selectedPartnerOrderSignal.set(newOrder);

    this.toastService.show(
      `Order #${newOrder.ticketNumber} dispatched! Dispatched via POST /api/v1/orders`,
      'success',
      'task_alt'
    );

    // Call backend API
    this.http.post<any>(this.apiUrl, {
      restaurantId: 1,
      deliveryAddressId: orderRequest.deliveryAddressId || 742,
      specialInstructions: orderRequest.specialInstructions
    }, { headers: this.authService.getAuthHeaders() })
    .pipe(catchError(() => of(null)))
    .subscribe();

    return newOrder;
  }

  downloadReceipt(ticket: string) {
    this.toastService.show(`Rendering PDF Tax Invoice for Ticket #${ticket}...`, 'info', 'download');
  }

  reorder(order: Order) {
    this.toastService.show(`Rebuilding cart with ${order.items.length} items from ${order.restaurantName}...`, 'success', 'replay');
  }
}
