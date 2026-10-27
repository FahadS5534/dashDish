import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../services/cart.service';
import { AddressService } from '../../services/address.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <header class="fixed top-0 left-0 right-0 z-50 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#EAE5DE] shadow-[0_1px_8px_rgba(45,41,38,0.03)]">
      <div class="h-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-3 lg:gap-6">
        <!-- Logo & Address -->
        <div class="flex items-center gap-4 lg:gap-6 shrink-0">
          <a routerLink="/discovery" class="flex items-center gap-2.5 group shrink-0" title="DashDish • Culinary Hospitality">
            <img 
              alt="DashDish Brand Mark" 
              class="h-8 w-auto object-contain transition-transform group-hover:scale-105 shrink-0" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQMiEGEtUArkdGpaa-evwcrV6OJDoRMfEuU3FH6YbDOezC1i2HzAdZ3LkC_h67uVUwuCRVwN37cRimOifi9Ci0-8AzhddTAtdmOiKNWZVm0kdzhyXwoZDSX5zD79_zHPGtVh7AM5N_9r6VW_YNQZBPLR_PaDuDZu5Tr2jSOxuRPsh3ltXFOs8Jojb-XvQ1qRO6zeUl1jI4OETRX09hCbYmvJDUl1QyJHBBG7vzA8NHkruGgmsrSYAt"
            />
            <span class="font-headline-md text-headline-md tracking-tight text-on-surface whitespace-nowrap select-none font-bold">
              DashDish
            </span>
          </a>

          <!-- Deliver to pill -->
          <div 
            (click)="openAddressModal.emit()" 
            class="hidden 2xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-container-low text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors cursor-pointer shrink-0"
            title="Click to change delivery address"
          >
            <span class="material-symbols-outlined text-primary text-[18px]">location_on</span>
            <div class="flex flex-col text-left">
              <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline text-[10px]">Deliver to</span>
              <span class="font-title-md text-title-md truncate max-w-[180px] text-on-surface text-[13px]">
                {{ addressService.defaultAddress().street }}
              </span>
            </div>
            <span class="material-symbols-outlined text-outline text-[18px]">expand_more</span>
          </div>
        </div>

        <!-- Search Bar -->
        <div class="hidden xl:flex flex-1 max-w-sm items-center relative">
          <span class="material-symbols-outlined absolute left-3.5 text-outline text-[18px]">search</span>
          <input 
            [(ngModel)]="searchQuery" 
            (keyup.enter)="onSearch()" 
            class="w-full pl-10 pr-4 py-2 text-body-md font-body-md bg-surface-container-lowest rounded-lg border border-outline-variant/60 placeholder:text-outline focus:outline-none focus:border-on-surface transition-colors text-on-surface" 
            placeholder="Search dishes, cuisines, chefs..." 
            type="text"
          />
        </div>

        <!-- Navigation Links -->
        <nav class="hidden lg:flex items-center gap-4 xl:gap-6 h-full shrink-0">
          <a 
            routerLink="/discovery" 
            routerLinkActive="text-primary font-bold border-b-2 border-primary" 
            [routerLinkActiveOptions]="{ exact: false }" 
            class="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors pb-1 whitespace-nowrap text-[14px]"
          >
            Customer Discovery
          </a>
          <a 
            routerLink="/menu" 
            routerLinkActive="text-primary font-bold border-b-2 border-primary" 
            class="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors pb-1 whitespace-nowrap text-[14px]"
          >
            Restaurant Menu &amp; Cart
          </a>
          <a 
            routerLink="/orders" 
            routerLinkActive="text-primary font-bold border-b-2 border-primary" 
            class="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors pb-1 whitespace-nowrap text-[14px]"
          >
            Orders &amp; Status
          </a>
          <a 
            routerLink="/partner-portal" 
            routerLinkActive="text-primary font-bold border-b-2 border-primary" 
            class="font-title-md text-title-md text-on-surface-variant hover:text-on-surface transition-colors pb-1 whitespace-nowrap text-[14px]"
          >
            Partner &amp; Owner Portal
          </a>
        </nav>

        <!-- Right Side Icons & Profile -->
        <div class="flex items-center gap-2.5 shrink-0">
          <!-- Spring Boot JWT Security Pill -->
          <button 
            (click)="openAuthModal.emit()"
            class="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-outline-variant/40 bg-surface text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors text-xs font-semibold cursor-pointer"
            title="Spring Boot JWT Authentication &amp; Token Inspector"
            type="button"
          >
            <span class="w-2 h-2 rounded-full" [ngClass]="authService.jwtToken() ? 'bg-secondary animate-pulse' : 'bg-outline'"></span>
            <span class="font-mono text-[11px]">{{ authService.jwtToken() ? 'JWT Active' : 'Sign In' }}</span>
          </button>

          <!-- Saved Addresses Icon -->
          <button 
            (click)="openAddressModal.emit()" 
            class="p-2 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-low transition-colors hidden sm:flex cursor-pointer" 
            type="button" 
            title="Saved Delivery Addresses"
          >
            <span class="material-symbols-outlined text-[20px]">bookmark_border</span>
          </button>

          <!-- Shopping Bag Button -->
          <a 
            routerLink="/menu" 
            class="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-container text-on-primary-container hover:bg-primary transition-colors shadow-sm shrink-0"
          >
            <span class="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span class="font-label-md text-label-md tracking-wide text-xs sm:text-sm font-bold">{{ cartService.headerBadgeText() }}</span>
          </a>

          <!-- Profile Badge with Persona Switcher dropdown -->
          <div class="relative">
            <div 
              (click)="toggleUserDropdown()" 
              class="flex items-center gap-2 pl-2 border-l border-outline-variant/50 cursor-pointer group shrink-0"
              title="Click to view account and JWT credentials"
            >
              <div class="relative w-8 h-8 rounded-full overflow-hidden ring-1 ring-outline-variant group-hover:ring-primary transition-all shrink-0">
                <img 
                  [alt]="authService.user().fullName" 
                  class="w-full h-full object-cover" 
                  [src]="authService.user().avatarUrl"
                />
              </div>
              <span class="hidden xl:block font-title-md text-title-md text-on-surface font-semibold max-w-[120px] truncate text-[14px]">
                {{ authService.user().fullName }}
              </span>
              <span class="material-symbols-outlined text-outline text-[16px]">expand_more</span>
            </div>

            <!-- Dropdown Menu -->
            @if (showUserMenu()) {
              <div class="absolute right-0 mt-3 w-72 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-2 z-50 animate-in fade-in slide-in-from-top-2">
                <div class="px-3 py-2.5 border-b border-outline-variant/30 mb-1">
                  <div class="flex items-center justify-between">
                    <p class="font-title-md text-title-md text-on-surface font-bold">{{ authService.user().fullName }}</p>
                    <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary-container text-on-secondary-fixed">
                      {{ authService.user().role }}
                    </span>
                  </div>
                  <p class="font-label-sm text-label-sm text-outline truncate">{{ authService.user().email }}</p>
                  
                  <div class="mt-2 pt-2 border-t border-outline-variant/20 flex items-center justify-between text-[11px] font-mono text-secondary">
                    <span class="flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                      Spring Boot JWT v3.3
                    </span>
                    <button 
                      (click)="openAuthModal.emit(); showUserMenu.set(false)" 
                      class="text-primary font-bold hover:underline cursor-pointer"
                      type="button"
                    >
                      Token Details
                    </button>
                  </div>
                </div>

                <div class="py-1">
                  <span class="px-3 py-1 font-label-sm text-label-sm uppercase tracking-wider text-outline block text-[10px]">
                    Switch Active Persona:
                  </span>
                  <button 
                    (click)="switchUser('CUSTOMER')" 
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-title-md text-title-md flex items-center justify-between cursor-pointer"
                    type="button"
                  >
                    <span>Elena Rostova (Customer)</span>
                    @if (authService.user().role === 'CUSTOMER') {
                      <span class="material-symbols-outlined text-primary text-[18px]">check</span>
                    }
                  </button>
                  <button 
                    (click)="switchUser('RESTAURANT_OWNER')" 
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-title-md text-title-md flex items-center justify-between cursor-pointer"
                    type="button"
                  >
                    <span>Chef Carlo (Owner Portal)</span>
                    @if (authService.user().role === 'RESTAURANT_OWNER') {
                      <span class="material-symbols-outlined text-primary text-[18px]">check</span>
                    }
                  </button>
                </div>

                <div class="border-t border-outline-variant/30 pt-1 mt-1 space-y-0.5">
                  <button 
                    (click)="openAuthModal.emit(); showUserMenu.set(false)" 
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-body-md text-body-md flex items-center gap-2 cursor-pointer text-xs"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[16px] text-primary">key</span>
                    <span>Sign In / Register New Account</span>
                  </button>
                  <button 
                    (click)="openAddressModal.emit(); showUserMenu.set(false)" 
                    class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container text-on-surface font-body-md text-body-md flex items-center gap-2 cursor-pointer text-xs"
                    type="button"
                  >
                    <span class="material-symbols-outlined text-[16px]">home</span>
                    <span>Manage Addresses</span>
                  </button>
                  @if (authService.jwtToken()) {
                    <button 
                      (click)="authService.logout(); showUserMenu.set(false)" 
                      class="w-full text-left px-3 py-2 rounded-lg hover:bg-surface-container text-error font-body-md text-body-md flex items-center gap-2 cursor-pointer text-xs"
                      type="button"
                    >
                      <span class="material-symbols-outlined text-[16px]">logout</span>
                      <span>Sign Out from Spring Boot</span>
                    </button>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Mobile Navigation Row -->
      <div class="lg:hidden flex items-center justify-around py-2.5 px-4 border-t border-[#EAE5DE] bg-surface-container-low text-xs font-medium overflow-x-auto">
        <a routerLink="/discovery" routerLinkActive="text-primary font-bold" class="px-2 py-1 whitespace-nowrap">Discovery</a>
        <a routerLink="/menu" routerLinkActive="text-primary font-bold" class="px-2 py-1 whitespace-nowrap">Menu &amp; Cart</a>
        <a routerLink="/orders" routerLinkActive="text-primary font-bold" class="px-2 py-1 whitespace-nowrap">Order Status</a>
        <a routerLink="/partner-portal" routerLinkActive="text-primary font-bold" class="px-2 py-1 whitespace-nowrap">Partner Portal</a>
      </div>
    </header>
  `
})
export class HeaderComponent {
  openAddressModal = output<void>();
  openAuthModal = output<void>();

  searchQuery = '';
  showUserMenu = signal(false);

  constructor(
    public cartService: CartService,
    public addressService: AddressService,
    public authService: AuthService,
    private router: Router
  ) {}

  toggleUserDropdown() {
    this.showUserMenu.update(v => !v);
  }

  switchUser(role: 'CUSTOMER' | 'RESTAURANT_OWNER') {
    this.authService.switchPersona(role);
    this.showUserMenu.set(false);
    if (role === 'RESTAURANT_OWNER') {
      this.router.navigate(['/partner-portal']);
    } else {
      this.router.navigate(['/discovery']);
    }
  }

  onSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/discovery'], { queryParams: { q: this.searchQuery } });
    }
  }
}
