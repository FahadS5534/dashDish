import { Component, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { RestaurantService } from '../../services/restaurant.service';
import { AddressService } from '../../services/address.service';
import { ToastService } from '../../services/toast.service';
import { Restaurant } from '../../models/restaurant.model';

@Component({
  selector: 'app-customer-discovery',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './customer-discovery.component.html'
})
export class CustomerDiscoveryComponent {
  openAddressModal = output<void>();

  selectedCategory = signal<string>('All Cuisines');
  speedFilter = signal<boolean>(false);
  apiVerifiedFilter = signal<boolean>(true);
  dietaryFilter = signal<boolean>(false);
  currentSort = signal<string>('Culinary Integrity');

  categories = [
    { id: 1, name: 'Artisanal Pasta', count: '12 Kitchens', icon: 'dinner_dining', colorClass: 'text-primary-fixed' },
    { id: 2, name: 'Neapolitan Pizza', count: '8 Forni', icon: 'local_pizza', colorClass: 'text-primary' },
    { id: 3, name: 'Sourdough Bakery', count: '14 Ateliers', icon: 'bakery_dining', colorClass: 'text-tertiary' },
    { id: 4, name: 'Nordic Brunch', count: '6 Salons', icon: 'brunch_dining', colorClass: 'text-secondary' },
    { id: 5, name: 'Clay-Pot Ramen', count: '9 Labs', icon: 'ramen_dining', colorClass: 'text-primary-container' },
    { id: 6, name: 'Farmhouse Greens', count: '11 Growers', icon: 'eco', colorClass: 'text-secondary' },
    { id: 7, name: 'Slow-Roasted', count: '7 Hearth-Houses', icon: 'outdoor_grill', colorClass: 'text-tertiary' }
  ];

  filteredRestaurants = computed(() => {
    let list = this.restaurantService.restaurants();
    const cat = this.selectedCategory();
    if (cat !== 'All Cuisines') {
      list = list.filter(r => r.cuisine?.toLowerCase().includes(cat.toLowerCase()) || r.name.toLowerCase().includes(cat.toLowerCase()));
    }
    if (this.speedFilter()) {
      list = list.filter(r => r.deliveryTime?.includes('15') || r.deliveryTime?.includes('20'));
    }
    return list;
  });

  constructor(
    public restaurantService: RestaurantService,
    public addressService: AddressService,
    private toastService: ToastService,
    private router: Router
  ) {}

  selectCategory(name: string) {
    this.selectedCategory.set(name);
    this.toastService.show(`Filtering Chapter 01: ${name}`, 'info', 'filter_list');
  }

  resetCategory() {
    this.selectedCategory.set('All Cuisines');
  }

  toggleSpeedFilter() {
    this.speedFilter.update(v => !v);
    this.toastService.show(this.speedFilter() ? 'Showing rapid courier dispatches (<30 mins)' : 'Speed filter cleared', 'info', 'bolt');
  }

  toggleApiVerified() {
    this.apiVerifiedFilter.update(v => !v);
    this.toastService.show('Spring Boot REST API 3.3.2 Connected', 'success', 'check_circle');
  }

  toggleDietaryFilter() {
    this.dietaryFilter.update(v => !v);
    this.toastService.show(this.dietaryFilter() ? 'Filtered for Plant-Based & Gluten-Free' : 'Dietary filter cleared', 'info', 'spa');
  }

  cycleSort() {
    const sorts = ['Culinary Integrity', 'Fastest Courier', 'Highest Rated', 'Michelin Alum'];
    const idx = (sorts.indexOf(this.currentSort()) + 1) % sorts.length;
    this.currentSort.set(sorts[idx]);
    this.toastService.show(`Ranked by: ${this.currentSort()}`, 'info', 'sort');
  }

  getRestaurant(id: number): Restaurant | undefined {
    return this.restaurantService.getRestaurantById(id);
  }

  exploreRestaurant(id: number) {
    this.router.navigate(['/menu'], { queryParams: { restaurantId: id } });
  }

  showApiToast() {
    this.toastService.show('Spring Boot Swagger / OpenAPI: GET /api/v1/restaurants (200 OK)', 'info', 'terminal');
  }
}
