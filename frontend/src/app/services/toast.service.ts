import { Injectable, signal } from '@angular/core';

export interface ToastMessage {
  id: number;
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  icon?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private currentToast = signal<ToastMessage | null>(null);
  toast = this.currentToast.asReadonly();
  private timeoutId: any;

  show(message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success', icon: string = 'check_circle', durationMs: number = 3200) {
    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
    }

    this.currentToast.set({
      id: Date.now(),
      message,
      type,
      icon
    });

    this.timeoutId = setTimeout(() => {
      this.currentToast.set(null);
    }, durationMs);
  }

  hide() {
    this.currentToast.set(null);
  }
}
