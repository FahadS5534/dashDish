import { Routes } from '@angular/router';
import { CustomerDiscoveryComponent } from './pages/customer-discovery/customer-discovery.component';
import { RestaurantMenuComponent } from './pages/restaurant-menu/restaurant-menu.component';
import { CheckoutOrderStatusComponent } from './pages/order-status/order-status.component';
import { PartnerPortalComponent } from './pages/partner-portal/partner-portal.component';

export const routes: Routes = [
  { path: '', redirectTo: 'discovery', pathMatch: 'full' },
  { path: 'discovery', component: CustomerDiscoveryComponent, title: 'DashDish • Customer Discovery' },
  { path: 'menu', component: RestaurantMenuComponent, title: 'DashDish • Restaurant Menu & Cart' },
  { path: 'orders', component: CheckoutOrderStatusComponent, title: 'DashDish • Live Order Status' },
  { path: 'partner-portal', component: PartnerPortalComponent, title: 'DashDish • Partner & Owner Portal' },
  { path: '**', redirectTo: 'discovery' }
];
