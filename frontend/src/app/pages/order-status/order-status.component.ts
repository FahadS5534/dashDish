import { Component, signal, output, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { AddressService } from '../../services/address.service';
import { ToastService } from '../../services/toast.service';
import { OrderStatus } from '../../models/order.model';

@Component({
  selector: 'app-order-status',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './order-status.component.html'
})
export class CheckoutOrderStatusComponent implements OnInit, OnDestroy {
  openAddressModal = output<void>();

  lastSyncedTime = signal<string>('just now');
  private pollInterval: any;

  constructor(
    public orderService: OrderService,
    public addressService: AddressService,
    public toastService: ToastService
  ) {}

  ngOnInit() {
    this.pollInterval = setInterval(() => {
      const now = new Date();
      this.lastSyncedTime.set(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 10000);
  }

  ngOnDestroy() {
    if (this.pollInterval) clearInterval(this.pollInterval);
  }

  getStepIndex(status: OrderStatus): number {
    switch (status) {
      case 'PLACED': return 1;
      case 'PREPARING': return 2;
      case 'READY':
      case 'READY_FOR_PICKUP': return 3;
      case 'OUT_FOR_DELIVERY':
      case 'PICKED_UP': return 4;
      case 'DELIVERED': return 5;
      default: return 1;
    }
  }

  isStepCompleted(step: number): boolean {
    const currentStep = this.getStepIndex(this.orderService.activeOrder().status);
    return currentStep > step;
  }

  isStepActive(step: number): boolean {
    const currentStep = this.getStepIndex(this.orderService.activeOrder().status);
    return currentStep === step;
  }

  setStepStatus(status: OrderStatus) {
    this.orderService.updateOrderStatus(this.orderService.activeOrder().id, status);
  }
}
