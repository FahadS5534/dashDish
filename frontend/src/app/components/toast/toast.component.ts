import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (toastService.toast(); as t) {
      <div class="fixed bottom-6 right-6 z-50 transform translate-y-0 opacity-100 transition-all duration-300 px-5 py-3.5 rounded-xl bg-inverse-surface text-inverse-on-surface font-label-md text-label-md shadow-2xl flex items-center gap-3 border border-outline/30 animate-in fade-in slide-in-from-bottom-4">
        <span class="material-symbols-outlined text-[20px] text-secondary">{{ t.icon || 'check_circle' }}</span>
        <span class="font-title-md text-title-md">{{ t.message }}</span>
        <button (click)="toastService.hide()" class="ml-2 text-inverse-on-surface/60 hover:text-inverse-on-surface transition-colors" type="button">
          <span class="material-symbols-outlined text-[16px]">close</span>
        </button>
      </div>
    }
  `
})
export class ToastComponent {
  constructor(public toastService: ToastService) {}
}
