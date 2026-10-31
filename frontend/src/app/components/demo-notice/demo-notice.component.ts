import { Component, signal, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-demo-notice',
  standalone: true,
  imports: [CommonModule],
  template: `
    <aside 
      class="fixed bottom-5 left-5 z-40 max-w-[340px] sm:max-w-[400px] transition-all duration-300 font-sans"
      aria-label="Demonstration Notice"
    >
      @if (isExpanded()) {
        <div class="bg-white/95 backdrop-blur-md rounded-2xl p-4 sm:p-5 shadow-[0_10px_35px_rgba(0,0,0,0.14)] border border-[#e4beb6] text-on-surface animate-in fade-in slide-in-from-bottom-3">
          <!-- Header Bar -->
          <div class="flex items-center justify-between gap-2 mb-2.5">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-900 border border-amber-300">
              <span class="w-1.5 h-1.5 rounded-full bg-amber-600 animate-pulse"></span>
              Demonstration Environment
            </span>
            <button 
              type="button" 
              (click)="toggleExpand()" 
              class="text-outline hover:text-on-surface p-1 rounded-lg hover:bg-surface-container transition-colors"
              title="Minimize window"
              aria-label="Minimize demonstration notice"
            >
              <span class="material-symbols-outlined text-[18px]">close</span>
            </button>
          </div>

          <!-- Title & Description -->
          <h4 class="font-bold text-sm sm:text-[15px] text-[#1e1b18] mb-1.5 flex items-center gap-1.5">
            <span class="material-symbols-outlined text-primary text-[20px]">terminal</span>
            API Showcase & Prototype
          </h4>
          <p class="text-xs sm:text-[13px] text-on-surface-variant leading-relaxed mb-3">
            This application is a <strong>live demonstration of backend endpoints</strong> (Spring Boot 3.3, Supabase PostgreSQL, and Angular 18). It is a portfolio prototype and <em>not an actual commercial food delivery service</em>. No real orders, payments, or restaurant deliveries will be fulfilled.
          </p>

          <!-- Badges & Action Buttons -->
          <div class="flex flex-wrap items-center justify-between gap-2 pt-2.5 border-t border-[#e4beb6]/50">
            <div class="flex items-center gap-1 text-[11px] text-outline">
              <span class="material-symbols-outlined text-[14px] text-secondary">dns</span>
              <span>Live Endpoints Connected</span>
            </div>
            <div class="flex items-center gap-2">
              <button 
                type="button"
                (click)="openAuth.emit()"
                class="px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-container-high hover:bg-surface-container-highest text-on-surface transition-colors flex items-center gap-1"
                title="Test Spring Boot JWT endpoints"
              >
                <span class="material-symbols-outlined text-[14px] text-primary">key</span>
                API Auth
              </button>
              <button 
                type="button"
                (click)="toggleExpand()"
                class="px-2.5 py-1 rounded-lg text-xs font-semibold text-primary hover:bg-primary/5 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      } @else {
        <!-- Collapsed Floating Pill -->
        <button 
          type="button"
          (click)="toggleExpand()"
          class="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/95 backdrop-blur-md shadow-lg border border-[#e4beb6] text-on-surface hover:bg-surface-container-low hover:border-primary/40 transition-all duration-200 group text-xs font-medium"
          title="Click to view demonstration disclaimer"
        >
          <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
          <span class="material-symbols-outlined text-[16px] text-primary">info</span>
          <span class="font-medium">Demo Notice</span>
          <span class="material-symbols-outlined text-[14px] text-outline group-hover:scale-110 transition-transform">unfold_more</span>
        </button>
      }
    </aside>
  `
})
export class DemoNoticeComponent {
  isExpanded = signal(true);
  openAuth = output<void>();

  toggleExpand() {
    this.isExpanded.update(v => !v);
  }
}

