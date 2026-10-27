import { Component, signal, output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div class="w-full max-w-lg rounded-2xl bg-surface-container-lowest p-6 lg:p-8 shadow-2xl border border-outline-variant/30 space-y-6 relative max-h-[92vh] overflow-y-auto">
        <!-- Close Button -->
        <button 
          (click)="close.emit()" 
          class="absolute top-5 right-5 text-outline hover:text-on-surface p-1 rounded-full hover:bg-surface-container transition-colors cursor-pointer"
          type="button"
          title="Close Modal"
        >
          <span class="material-symbols-outlined text-[22px]">close</span>
        </button>

        <!-- Header -->
        <div class="space-y-1.5 pr-8">
          <div class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-bold">
              Spring Boot Security Gateway • JWT v3.3
            </span>
          </div>
          <h2 class="font-headline-sm text-headline-sm text-on-surface font-serif font-bold">
            Hospitality Access &amp; Authentication
          </h2>
          <p class="font-body-md text-body-md text-on-surface-variant">
            Connect to DashDish API using JSON Web Tokens (JJWT 0.12.5).
          </p>
        </div>

        <!-- Real JWT Active Status Banner (if logged in) -->
        @if (authService.jwtToken(); as token) {
          <div class="p-4 rounded-xl bg-surface-container border border-secondary/30 space-y-2.5">
            <div class="flex items-center justify-between">
              <span class="font-label-sm text-label-sm font-bold text-secondary flex items-center gap-1.5 uppercase tracking-wider">
                <span class="material-symbols-outlined text-[16px]">verified_user</span>
                Active JWT Bearer Token
              </span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-secondary text-on-secondary">
                {{ authService.user().role }}
              </span>
            </div>
            
            <div class="p-2.5 rounded-lg bg-surface font-mono text-[11px] text-outline break-all border border-outline-variant/30 select-all max-h-16 overflow-y-auto">
              Bearer {{ token }}
            </div>

            <div class="flex items-center justify-between pt-1 text-xs">
              <span class="text-on-surface-variant">Logged in as: <strong class="text-on-surface">{{ authService.user().email }}</strong></span>
              <button 
                (click)="copyToken(token)" 
                class="text-primary font-bold hover:underline cursor-pointer flex items-center gap-1"
                type="button"
              >
                <span class="material-symbols-outlined text-[14px]">content_copy</span>
                <span>Copy Token</span>
              </button>
            </div>
          </div>
        }

        <!-- Quick 1-Click Persona Login Ribbon -->
        <div class="space-y-2.5">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold block">
            Instant 1-Click Spring Boot Authentication
          </span>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button 
              (click)="quickLogin('CUSTOMER')" 
              [disabled]="authService.isLoading()"
              class="p-3.5 rounded-xl border border-outline-variant/40 hover:border-primary bg-surface text-left transition-all hover:shadow-sm cursor-pointer group flex items-center gap-3 disabled:opacity-50"
              type="button"
            >
              <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0">
                <img [src]="authService.defaultCustomer.avatarUrl" alt="Elena" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <div class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary truncate">
                  Elena Rostova
                </div>
                <div class="font-label-sm text-[11px] text-outline">Customer (Portland)</div>
              </div>
            </button>

            <button 
              (click)="quickLogin('RESTAURANT_OWNER')" 
              [disabled]="authService.isLoading()"
              class="p-3.5 rounded-xl border border-outline-variant/40 hover:border-primary bg-surface text-left transition-all hover:shadow-sm cursor-pointer group flex items-center gap-3 disabled:opacity-50"
              type="button"
            >
              <div class="w-10 h-10 rounded-full overflow-hidden bg-surface-container shrink-0">
                <img [src]="authService.defaultOwner.avatarUrl" alt="Chef Carlo" class="w-full h-full object-cover" />
              </div>
              <div class="min-w-0">
                <div class="font-title-md text-title-md font-bold text-on-surface group-hover:text-primary truncate">
                  Chef Carlo Moretti
                </div>
                <div class="font-label-sm text-[11px] text-outline">Owner (Osteria Hearth)</div>
              </div>
            </button>
          </div>
        </div>

        <div class="relative flex py-1 items-center">
          <div class="flex-grow border-t border-outline-variant/30"></div>
          <span class="flex-shrink mx-4 text-xs font-semibold text-outline uppercase tracking-wider">or sign in with credentials</span>
          <div class="flex-grow border-t border-outline-variant/30"></div>
        </div>

        <!-- Tabs: Sign In / Create Account -->
        <div class="flex border-b border-outline-variant/30">
          <button 
            (click)="activeTab.set('login')" 
            class="pb-2.5 px-4 font-title-md text-title-md transition-colors cursor-pointer"
            [ngClass]="activeTab() === 'login' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'"
            type="button"
          >
            Sign In
          </button>
          <button 
            (click)="activeTab.set('register')" 
            class="pb-2.5 px-4 font-title-md text-title-md transition-colors cursor-pointer"
            [ngClass]="activeTab() === 'register' ? 'text-primary font-bold border-b-2 border-primary' : 'text-on-surface-variant hover:text-on-surface'"
            type="button"
          >
            Create Account
          </button>
        </div>

        <!-- Login Form -->
        @if (activeTab() === 'login') {
          <form (ngSubmit)="submitLogin()" class="space-y-4">
            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Email Address</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[18px]">mail</span>
                <input 
                  [(ngModel)]="loginEmail" 
                  name="email" 
                  type="email" 
                  required 
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Password</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[18px]">lock</span>
                <input 
                  [(ngModel)]="loginPassword" 
                  name="password" 
                  type="password" 
                  required 
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit" 
              [disabled]="authService.isLoading()"
              class="w-full py-3 rounded-lg bg-primary text-on-primary font-title-md text-title-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (authService.isLoading()) {
                <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Authenticating with Spring Boot...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">login</span>
                <span>Sign In via Spring Boot API</span>
              }
            </button>
          </form>
        }

        <!-- Register Form -->
        @if (activeTab() === 'register') {
          <form (ngSubmit)="submitRegister()" class="space-y-4">
            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Full Name</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[18px]">person</span>
                <input 
                  [(ngModel)]="registerName" 
                  name="name" 
                  type="text" 
                  required 
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="Elena Rostova"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Email Address</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[18px]">mail</span>
                <input 
                  [(ngModel)]="registerEmail" 
                  name="email" 
                  type="email" 
                  required 
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="name@domain.com"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Password (8+ chars)</label>
              <div class="relative">
                <span class="material-symbols-outlined absolute left-3.5 top-3 text-outline text-[18px]">lock</span>
                <input 
                  [(ngModel)]="registerPassword" 
                  name="password" 
                  type="password" 
                  required 
                  minlength="8"
                  class="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="Minimum 8 characters"
                />
              </div>
            </div>

            <div class="space-y-1">
              <label class="font-label-md text-label-md text-on-surface font-medium">Hospitality Role</label>
              <select 
                [(ngModel)]="registerRole" 
                name="role"
                class="w-full px-3.5 py-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              >
                <option value="CUSTOMER">Customer (Patron)</option>
                <option value="RESTAURANT_OWNER">Restaurant Owner / Partner</option>
              </select>
            </div>

            <button 
              type="submit" 
              [disabled]="authService.isLoading()"
              class="w-full py-3 rounded-lg bg-primary text-on-primary font-title-md text-title-md font-bold hover:bg-primary-container transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              @if (authService.isLoading()) {
                <span class="material-symbols-outlined text-[18px] animate-spin">sync</span>
                <span>Registering on Spring Boot...</span>
              } @else {
                <span class="material-symbols-outlined text-[18px]">person_add</span>
                <span>Register with Spring Boot API</span>
              }
            </button>
          </form>
        }

        <!-- Footer Strip -->
        <div class="pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-on-surface-variant">
          <span class="flex items-center gap-1 font-mono">
            <span class="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            POST /api/v1/auth/login
          </span>
          @if (authService.jwtToken()) {
            <button 
              (click)="authService.logout()" 
              class="text-error font-semibold hover:underline cursor-pointer flex items-center gap-1"
              type="button"
            >
              <span class="material-symbols-outlined text-[14px]">logout</span>
              <span>Sign Out</span>
            </button>
          }
        </div>
      </div>
    </div>
  `
})
export class AuthModalComponent {
  close = output<void>();

  authService = inject(AuthService);
  toast = inject(ToastService);

  activeTab = signal<'login' | 'register'>('login');

  loginEmail = 'elena.rostova@epicurean.com';
  loginPassword = 'password123';

  registerName = '';
  registerEmail = '';
  registerPassword = '';
  registerRole: 'CUSTOMER' | 'RESTAURANT_OWNER' = 'CUSTOMER';

  quickLogin(role: 'CUSTOMER' | 'RESTAURANT_OWNER') {
    this.authService.loginAsDefault(role).subscribe({
      next: () => {
        this.close.emit();
      }
    });
  }

  submitLogin() {
    if (this.loginEmail && this.loginPassword) {
      this.authService.login(this.loginEmail, this.loginPassword).subscribe({
        next: () => {
          this.close.emit();
        }
      });
    }
  }

  submitRegister() {
    if (this.registerName && this.registerEmail && this.registerPassword) {
      this.authService.register(
        this.registerName,
        this.registerEmail,
        this.registerPassword,
        this.registerRole
      ).subscribe({
        next: () => {
          this.close.emit();
        }
      });
    }
  }

  copyToken(token: string) {
    navigator.clipboard.writeText(token);
    this.toast.show('JWT token copied to clipboard', 'info', 'content_copy');
  }
}
