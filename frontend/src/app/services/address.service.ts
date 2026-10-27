import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Address, AddressRequest } from '../models/address.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AddressService {
  private apiUrl = '/api/v1/users/me/addresses';

  private initialAddresses: Address[] = [
    {
      id: 742,
      label: 'Home • Default',
      street: '742 Evergreen Terrace, Apt 4B',
      city: 'Springfield, OR 97477',
      zipCode: '97477',
      instructions: 'Ring buzzer 042, leave at front door alcove.',
      isDefault: true,
      endpointRef: 'PUT /api/v1/users/me/addresses/addr_742/default'
    },
    {
      id: 108,
      label: 'Design Studio / Work',
      street: '108 Mercer Street, Suite 300',
      city: 'New York, NY 10012',
      zipCode: '10012',
      instructions: 'Reception desk, 3rd Floor freight elevator.',
      isDefault: false,
      endpointRef: 'PUT /api/v1/users/me/addresses/addr_108/default'
    }
  ];

  private addressesSignal = signal<Address[]>(this.loadStoredAddresses());
  addresses = this.addressesSignal.asReadonly();

  defaultAddress = computed(() => {
    const list = this.addressesSignal();
    return list.find(a => a.isDefault) || list[0];
  });

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.fetchAddresses();
  }

  private loadStoredAddresses(): Address[] {
    try {
      const stored = localStorage.getItem('dashdish_addresses');
      return stored ? JSON.parse(stored) : this.initialAddresses;
    } catch {
      return this.initialAddresses;
    }
  }

  private saveAddresses(list: Address[]) {
    this.addressesSignal.set(list);
    try {
      localStorage.setItem('dashdish_addresses', JSON.stringify(list));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }

  fetchAddresses() {
    this.http.get<any>(this.apiUrl, { headers: this.authService.getAuthHeaders() })
      .pipe(
        catchError(() => of(null))
      )
      .subscribe(res => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          this.saveAddresses(res.data);
        }
      });
  }

  setDefaultAddress(id: number) {
    const updated = this.addressesSignal().map(a => ({
      ...a,
      isDefault: a.id === id
    }));
    this.saveAddresses(updated);

    const addr = updated.find(a => a.id === id);
    this.toastService.show(
      `Updated active destination (PUT /api/v1/users/me/addresses/addr_${id}/default)`,
      'success',
      'location_on'
    );

    // Call backend API
    this.http.put(`${this.apiUrl}/${id}/default`, {}, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }

  addAddress(req: AddressRequest) {
    const newId = Date.now();
    const newAddress: Address = {
      id: newId,
      label: req.label || 'Saved Location',
      street: req.street,
      city: `${req.city}, ${req.zipCode}`,
      zipCode: req.zipCode,
      instructions: req.instructions || 'Leave at doorstep.',
      isDefault: true,
      endpointRef: `PUT /api/v1/users/me/addresses/addr_${newId}/default`
    };

    // Set previous ones to false if new one is default
    const updated = this.addressesSignal().map(a => ({ ...a, isDefault: false }));
    updated.unshift(newAddress);
    this.saveAddresses(updated);

    this.toastService.show(
      `Added ${newAddress.label} (${newAddress.street}) via POST /api/v1/users/me/addresses`,
      'success',
      'check_circle'
    );

    // Call backend API
    this.http.post(this.apiUrl, req, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();
  }
}
