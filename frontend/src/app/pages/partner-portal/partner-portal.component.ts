import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { Order, OrderStatus } from '../../models/order.model';
import { MenuItem } from '../../models/restaurant.model';

@Component({
  selector: 'app-partner-portal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './partner-portal.component.html'
})
export class PartnerPortalComponent {
  activeTab = signal<'dispatch' | 'inventory'>('dispatch');
  audioAlertsEnabled = signal<boolean>(true);
  inventorySearch = '';
  showAddItemModal = signal(false);

  newItem: Partial<MenuItem> = {
    name: '',
    description: '',
    price: 24.00,
    category: 'Primi Piatti'
  };

  inventoryItems = computed(() => {
    return this.restaurantService.getMenu(1);
  });

  filteredInventory = computed(() => {
    const list = this.inventoryItems();
    if (!this.inventorySearch.trim()) return list;
    const q = this.inventorySearch.toLowerCase();
    return list.filter(i => i.name.toLowerCase().includes(q) || i.category?.toLowerCase().includes(q));
  });

  constructor(
    public restaurantService: RestaurantService,
    public orderService: OrderService,
    public toastService: ToastService
  ) {}

  toggleAudioAlerts() {
    this.audioAlertsEnabled.update(v => !v);
    this.toastService.show(
      this.audioAlertsEnabled() ? 'Kitchen Audio Chimes: Enabled' : 'Kitchen Audio Chimes: Muted',
      'info',
      this.audioAlertsEnabled() ? 'volume_up' : 'volume_off'
    );
  }

  getStatusBadgeClass(status: OrderStatus): string {
    switch (status) {
      case 'PLACED':
        return 'bg-tertiary-fixed text-on-tertiary-fixed';
      case 'PREPARING':
        return 'bg-primary-container text-on-primary';
      case 'READY':
      case 'READY_FOR_PICKUP':
        return 'bg-secondary-fixed text-on-secondary-fixed';
      case 'DELIVERED':
        return 'bg-secondary text-on-secondary';
      default:
        return 'bg-surface-container text-on-surface-variant';
    }
  }

  acceptTicket(order: Order) {
    this.orderService.updateOrderStatus(order.id, 'PREPARING');
    this.toastService.show(`Ticket #${order.ticketNumber} ACCEPTED into line cook production`, 'success', 'skillet');
  }

  markAsReady(order: Order) {
    this.orderService.updateOrderStatus(order.id, 'READY');
    this.toastService.show(`Order #${order.ticketNumber} flagged READY for courier pickup at front pass`, 'success', 'done_all');
  }

  printKitchenTicket(order: Order) {
    this.toastService.show(`Kitchen printer queued: #${order.ticketNumber} (${order.customerName})`, 'info', 'print');
  }

  toggleItemStock(item: MenuItem) {
    this.restaurantService.toggleItemStock(1, item.id);
  }

  saveNewItem() {
    if (this.newItem.name && this.newItem.description) {
      this.restaurantService.addNewMenuItem(1, this.newItem);
      this.newItem = {
        name: '',
        description: '',
        price: 24.00,
        category: 'Primi Piatti'
      };
      this.showAddItemModal.set(false);
    }
  }
}
