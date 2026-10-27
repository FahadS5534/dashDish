import { Component, output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AddressService } from '../../services/address.service';
import { AddressRequest } from '../../models/address.model';

@Component({
  selector: 'app-address-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="fixed inset-0 z-50 bg-on-surface/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div class="w-full max-w-lg rounded-xl bg-surface-container-lowest p-6 lg:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto border border-outline-variant/30">
        <!-- Header -->
        <div class="flex items-center justify-between border-b border-outline-variant/30 pb-4">
          <div>
            <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline font-bold">Fulfillment Destinations</span>
            <h3 class="font-headline-sm text-headline-sm text-on-surface">Delivery Addresses</h3>
          </div>
          <button 
            (click)="closeModal.emit()" 
            class="p-2 text-on-surface-variant hover:text-on-surface rounded-lg hover:bg-surface-container transition-colors"
            type="button"
          >
            <span class="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <!-- Address List Selector -->
        <div class="space-y-3">
          <span class="font-label-sm text-label-sm uppercase tracking-wider text-outline">Select Active Destination:</span>
          @for (addr of addressService.addresses(); track addr.id) {
            <div 
              (click)="addressService.setDefaultAddress(addr.id)"
              class="address-card cursor-pointer rounded-xl p-4 transition-all flex flex-col justify-between space-y-2"
              [ngClass]="addr.isDefault ? 'bg-surface-container-lowest shadow-sm ring-2 ring-primary' : 'bg-surface-container hover:bg-surface-container-high'"
            >
              <div class="flex items-center justify-between">
                <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-label-sm font-label-sm font-bold"
                  [ngClass]="addr.isDefault ? 'bg-secondary-container text-on-secondary-fixed' : 'bg-surface-container-highest text-on-surface-variant'">
                  <span class="material-symbols-outlined text-[13px]">
                    {{ addr.label.includes('Studio') || addr.label.includes('Work') ? 'apartment' : 'home' }}
                  </span>
                  {{ addr.label }}
                </span>
                <span class="material-symbols-outlined text-[20px]"
                  [ngClass]="addr.isDefault ? 'text-primary' : 'text-outline'">
                  {{ addr.isDefault ? 'radio_button_checked' : 'radio_button_unchecked' }}
                </span>
              </div>
              <p class="font-title-md text-title-md text-on-surface font-semibold">{{ addr.street }}</p>
              <p class="font-body-md text-body-md text-on-surface-variant">{{ addr.city }}</p>
              @if (addr.instructions) {
                <p class="font-label-sm text-label-sm text-outline italic">Instructions: {{ addr.instructions }}</p>
              }
              <div class="pt-1 flex items-center justify-between text-outline text-[11px] font-mono">
                <span>addr_{{ addr.id }}</span>
                @if (addr.isDefault) {
                  <span class="text-secondary font-bold font-sans">Active Destination</span>
                } @else {
                  <button (click)="$event.stopPropagation(); addressService.setDefaultAddress(addr.id)" class="text-primary hover:underline font-sans font-bold">
                    Set As Active
                  </button>
                }
              </div>
            </div>
          }
        </div>

        <!-- Add Address Button / Collapsible Form -->
        <div class="pt-2 border-t border-outline-variant/30">
          @if (!showAddForm()) {
            <button 
              (click)="showAddForm.set(true)" 
              class="w-full py-2.5 px-4 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-md text-title-md transition-colors flex items-center justify-center gap-2"
              type="button"
            >
              <span class="material-symbols-outlined text-[18px]">add</span>
              <span>Add New Saved Address</span>
            </button>
          } @else {
            <form (ngSubmit)="saveNewAddress()" class="space-y-4 pt-2">
              <div class="flex items-center justify-between">
                <span class="font-title-md text-title-md text-on-surface">New Address Details</span>
                <button (click)="showAddForm.set(false)" class="text-label-sm text-label-sm text-outline hover:text-on-surface" type="button">Cancel</button>
              </div>

              <div class="space-y-1">
                <label class="font-label-md text-label-md text-on-surface">Address Nickname / Label</label>
                <input 
                  [(ngModel)]="newAddress.label" 
                  name="label" 
                  class="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="e.g. Penthouse, West End Loft" 
                  required 
                  type="text"
                />
              </div>

              <div class="space-y-1">
                <label class="font-label-md text-label-md text-on-surface">Street Address</label>
                <input 
                  [(ngModel)]="newAddress.street" 
                  name="street" 
                  class="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="e.g. 450 Broadway, Floor 4" 
                  required 
                  type="text"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1">
                  <label class="font-label-md text-label-md text-on-surface">City</label>
                  <input 
                    [(ngModel)]="newAddress.city" 
                    name="city" 
                    class="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                    placeholder="Portland" 
                    required 
                    type="text"
                  />
                </div>
                <div class="space-y-1">
                  <label class="font-label-md text-label-md text-on-surface">ZIP / Postal Code</label>
                  <input 
                    [(ngModel)]="newAddress.zipCode" 
                    name="zipCode" 
                    class="w-full h-11 px-3.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                    placeholder="97201" 
                    required 
                    type="text"
                  />
                </div>
              </div>

              <div class="space-y-1">
                <label class="font-label-md text-label-md text-on-surface">Delivery Instructions / Access Code</label>
                <textarea 
                  [(ngModel)]="newAddress.instructions" 
                  name="instructions" 
                  class="w-full p-2.5 rounded-lg bg-surface text-on-surface font-body-md text-body-md border border-outline-variant/60 focus:outline-none focus:ring-2 focus:ring-primary shadow-xs" 
                  placeholder="e.g. Ring lobby attendant or leave in cold-storage drop box." 
                  rows="2"
                ></textarea>
              </div>

              <div class="pt-2 flex items-center justify-end gap-3">
                <button 
                  (click)="showAddForm.set(false)" 
                  class="px-4 py-2 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md hover:bg-surface-container-high transition-colors" 
                  type="button"
                >
                  Cancel
                </button>
                <button 
                  class="px-5 py-2 rounded-lg bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-container transition-colors shadow-sm font-bold" 
                  type="submit"
                >
                  Save &amp; Select Address
                </button>
              </div>
            </form>
          }
        </div>
      </div>
    </div>
  `
})
export class AddressModalComponent {
  closeModal = output<void>();
  showAddForm = signal(false);

  newAddress: AddressRequest = {
    label: '',
    street: '',
    city: '',
    zipCode: '',
    instructions: ''
  };

  constructor(public addressService: AddressService) {}

  saveNewAddress() {
    if (this.newAddress.street && this.newAddress.city) {
      this.addressService.addAddress(this.newAddress);
      this.newAddress = {
        label: '',
        street: '',
        city: '',
        zipCode: '',
        instructions: ''
      };
      this.showAddForm.set(false);
      this.closeModal.emit();
    }
  }
}
