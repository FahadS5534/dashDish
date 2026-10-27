import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { RestaurantService } from '../../services/restaurant.service';
import { CartService } from '../../services/cart.service';
import { OrderService } from '../../services/order.service';
import { ToastService } from '../../services/toast.service';
import { MenuItem } from '../../models/restaurant.model';

@Component({
  selector: 'app-restaurant-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './restaurant-menu.component.html'
})
export class RestaurantMenuComponent {
  restaurantId = signal<number>(1);
  activeCourse = signal<'primi' | 'antipasti' | 'secondi' | 'dolci'>('primi');
  dietFilter = signal<'ALL' | 'V' | 'GF'>('ALL');

  editingItem = signal<any | null>(null);
  noteText = '';

  restaurant = computed(() => {
    return this.restaurantService.getRestaurantById(this.restaurantId()) || this.restaurantService.restaurants()[0];
  });

  menuItems = computed(() => {
    return this.restaurantService.getMenu(this.restaurantId());
  });

  courseTitle = computed(() => {
    switch (this.activeCourse()) {
      case 'primi': return 'Primi (Handmade Pastas)';
      case 'antipasti': return 'Antipasti & Crudo';
      case 'secondi': return 'Secondi & Braises';
      case 'dolci': return 'Dolci & Natural Wines';
    }
  });

  displayedMenuItems = computed(() => {
    let list = this.menuItems();
    const course = this.activeCourse();
    list = list.filter(i => i.courseId === course);

    const df = this.dietFilter();
    if (df === 'V') {
      list = list.filter(i => i.tags?.some(t => t.toLowerCase().includes('vegetarian') || t === 'V'));
    } else if (df === 'GF') {
      list = list.filter(i => i.tags?.some(t => t.toLowerCase().includes('gluten-free') || t === 'GF'));
    }
    return list;
  });

  constructor(
    public restaurantService: RestaurantService,
    public cartService: CartService,
    private orderService: OrderService,
    private toastService: ToastService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.route.queryParams.subscribe(params => {
      if (params['restaurantId']) {
        this.restaurantId.set(Number(params['restaurantId']));
      }
    });
  }

  getItemQuantityInCart(itemId: number): number {
    const item = this.cartService.cart().items.find(i => i.menuItemId === itemId);
    return item ? item.quantity : 0;
  }

  addItemToCart(item: MenuItem) {
    this.cartService.addItem(item, {
      id: this.restaurant().id,
      name: this.restaurant().name
    });
  }

  toggleDietFilter(filter: 'V' | 'GF') {
    if (this.dietFilter() === filter) {
      this.dietFilter.set('ALL');
    } else {
      this.dietFilter.set(filter);
    }
  }

  openNoteEditor(item: any) {
    this.editingItem.set(item);
    this.noteText = item.note || '';
  }

  saveNote() {
    const item = this.editingItem();
    if (item) {
      this.cartService.updateItemNote(item.menuItemId, this.noteText);
      this.editingItem.set(null);
    }
  }

  proceedToCheckout() {
    const cart = this.cartService.cart();
    if (cart.items.length === 0) return;

    this.orderService.checkout({
      deliveryAddress: '742 Evergreen Terrace, Apt 4B',
      deliveryAddressId: 742,
      tip: this.cartService.tip()
    }, cart.items, this.cartService.subtotal(), cart.restaurantName || this.restaurant().name);

    this.router.navigate(['/orders']);
  }
}
