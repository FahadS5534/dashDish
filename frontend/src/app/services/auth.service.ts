import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { User, AuthResponse } from '../models/user.model';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface BackendApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

export interface BackendAuthData {
  token: string;
  email: string;
  role: 'CUSTOMER' | 'RESTAURANT_OWNER' | 'DELIVERY_PARTNER' | 'ADMIN';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private toast = inject(ToastService);

  private apiUrl = `${environment.apiUrl}/auth`;
  private tokenKey = 'dashdish_jwt_token';
  private userKey = 'dashdish_current_user';

  // Default customer persona matching design: Elena Rostova
  readonly defaultCustomer: User = {
    id: 1,
    email: 'elena.rostova@epicurean.com',
    fullName: 'Elena Rostova',
    role: 'CUSTOMER',
    phone: '+1 (503) 892-4100',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuANllrOQ-YD044uTFKZ6wfbtBYPcf8bxsH5IVSLqflSC86Gp5qHECzRmas5dnBobE7iU3OAYT0ZkITjvGMqmtjcekXn0uGBgaNhgSSwzBbLVXlnyzaXqlgUwK_zeOpTWnzKkRrc6veDfdCWgH2ynKokh--HYkc2puL8a4sUIs62qKqfhvdMWW3ahFEsHV27XqKxzhlFlKSCGuyDWa0BsjT8s12rwpRVRXJJ_cO1HwQvcU6diTq3nRVE'
  };

  // Owner persona matching design: Chef Patron Carlo Moretti
  readonly defaultOwner: User = {
    id: 2,
    email: 'carlo@osteriadelsole.it',
    fullName: 'Chef Carlo Moretti',
    role: 'RESTAURANT_OWNER',
    phone: '+1 (503) 714-8832',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCxz7nUh_lilf89K7YbYP00OiLuGXf1cl3OJLKC4cFxItcSGkRLEqjPkqXSvsqRs5J47ZYUx1oRkYXJwOanjGrsu8y9SAdDpn2r2urYsR-T_DTism03uV3L_K2h41k7tnQ66y8WjqI2AfVSnFCG_m7kvUmb51I0Wn0iFULfQFh3XPT5TAmqXzRtXEjKuCBZssDChJE3RL-2Gk4TxKjH3VvHUz8dujTp1K-2gy0i6uGeuImxO4od99ef'
  };

  private currentUser = signal<User>(this.loadStoredUser() || this.defaultCustomer);
  private token = signal<string | null>(localStorage.getItem(this.tokenKey));
  private isAuthenticating = signal<boolean>(false);

  user = this.currentUser.asReadonly();
  jwtToken = this.token.asReadonly();
  isLoading = this.isAuthenticating.asReadonly();
  isOwner = computed(() => this.currentUser().role === 'RESTAURANT_OWNER');
  isAuthenticated = computed(() => !!this.token());

  constructor() {
    // If no JWT token is stored, initialize session by logging in with default Elena credentials
    if (!this.token()) {
      this.loginAsDefault('CUSTOMER', false).subscribe();
    } else {
      this.fetchCurrentUserProfile().subscribe();
    }
  }

  private loadStoredUser(): User | null {
    try {
      const data = localStorage.getItem(this.userKey);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  getAuthHeaders(): { [header: string]: string } {
    const t = this.token();
    return t ? { Authorization: `Bearer ${t}` } : {};
  }

  /**
   * Real Spring Boot Login via POST /api/v1/auth/login
   */
  login(email: string, password: string): Observable<BackendApiResponse<BackendAuthData>> {
    this.isAuthenticating.set(true);
    return this.http.post<BackendApiResponse<BackendAuthData>>(`${this.apiUrl}/login`, { email, password }).pipe(
      tap(res => {
        this.isAuthenticating.set(false);
        if (res && res.data && res.data.token) {
          const role = res.data.role;
          const isOwnerUser = role === 'RESTAURANT_OWNER';
          const defaultRef = isOwnerUser ? this.defaultOwner : this.defaultCustomer;
          
          const userObj: User = {
            id: defaultRef.id,
            email: res.data.email,
            fullName: isOwnerUser ? 'Chef Carlo Moretti' : (email === this.defaultCustomer.email ? 'Elena Rostova' : email.split('@')[0]),
            role: role,
            avatarUrl: defaultRef.avatarUrl,
            phone: defaultRef.phone
          };

          this.setSession(res.data.token, userObj);
          this.toast.show(`JWT Authenticated: Welcome, ${userObj.fullName}`, 'success', 'verified_user');
          
          // Refresh profile from backend
          this.fetchCurrentUserProfile().subscribe();
        }
      }),
      catchError(err => {
        this.isAuthenticating.set(false);
        const errMsg = err?.error?.message || 'Login failed. Please verify credentials.';
        this.toast.show(errMsg, 'error', 'lock');
        throw err;
      })
    );
  }

  /**
   * Real Spring Boot Registration via POST /api/v1/auth/register
   */
  register(name: string, email: string, password: string, role: 'CUSTOMER' | 'RESTAURANT_OWNER'): Observable<any> {
    this.isAuthenticating.set(true);
    return this.http.post<any>(`${this.apiUrl}/register`, { name, email, password, role }).pipe(
      tap(() => {
        this.isAuthenticating.set(false);
        this.toast.show('Account created successfully! Signing in...', 'success', 'person_add');
        // Auto-login upon registration
        this.login(email, password).subscribe();
      }),
      catchError(err => {
        this.isAuthenticating.set(false);
        const errMsg = err?.error?.message || 'Registration failed. Email may already be in use.';
        this.toast.show(errMsg, 'error', 'error');
        throw err;
      })
    );
  }

  /**
   * Quick-login helper for testing the Spring Boot backend
   */
  loginAsDefault(role: 'CUSTOMER' | 'RESTAURANT_OWNER', showToast = true): Observable<any> {
    const creds = role === 'CUSTOMER' 
      ? { email: 'elena.rostova@epicurean.com', password: 'password123' }
      : { email: 'carlo@osteriadelsole.it', password: 'password123' };

    return this.login(creds.email, credds(creds.password)).pipe(
      catchError(() => {
        // Fallback simulation if backend server is unreachable
        this.switchPersona(role);
        if (showToast) {
          this.toast.show(`Switched persona to ${role === 'CUSTOMER' ? 'Elena Rostova' : 'Chef Carlo'} (Offline Mode)`, 'info', 'person');
        }
        return of(null);
      })
    );
  }

  /**
   * Switch persona locally & refresh JWT session
   */
  switchPersona(role: 'CUSTOMER' | 'RESTAURANT_OWNER') {
    const target = role === 'CUSTOMER' ? this.defaultCustomer : this.defaultOwner;
    this.currentUser.set(target);
    localStorage.setItem(this.userKey, JSON.stringify(target));

    // Also attempt real backend login for persona to get matching JWT token
    this.loginAsDefault(role, false).subscribe();
  }

  /**
   * Fetch current user profile from Spring Boot GET /api/v1/users/me
   */
  fetchCurrentUserProfile(): Observable<any> {
    if (!this.token()) return of(null);
    return this.http.get<any>(`${environment.apiUrl}/users/me`).pipe(
      tap(res => {
        if (res && res.data) {
          const current = this.currentUser();
          const updated: User = {
            ...current,
            id: res.data.id || current.id,
            email: res.data.email || current.email,
            fullName: res.data.name || current.fullName,
            role: res.data.role || current.role
          };
          this.currentUser.set(updated);
          localStorage.setItem(this.userKey, JSON.stringify(updated));
        }
      }),
      catchError(() => of(null))
    );
  }

  private setSession(token: string, user: User) {
    this.token.set(token);
    this.currentUser.set(user);
    localStorage.setItem(this.tokenKey, token);
    localStorage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Logout via POST /api/v1/auth/logout
   */
  logout() {
    const currentToken = this.token();
    if (currentToken) {
      this.http.post(`${this.apiUrl}/logout`, {}, { headers: this.getAuthHeaders() }).pipe(
        catchError(() => of(null))
      ).subscribe();
    }

    this.token.set(null);
    this.currentUser.set(this.defaultCustomer);
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    this.toast.show('Signed out from Spring Boot session.', 'info', 'logout');
  }
}

function credds(pw: string): string {
  return pw;
}
