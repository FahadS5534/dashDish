import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Restaurant, MenuItem } from '../models/restaurant.model';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';
import { environment } from '../../environments/environment';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private apiUrl = `${environment.apiUrl}/restaurants`;

  private mockRestaurants: Restaurant[] = [
    {
      id: 1,
      name: 'Osteria Del Sole',
      description: 'Regional Northern Italian & Handmade Pasta. Slow-fermented durum grains and mountain butter since 1984.',
      city: 'Portland',
      address: 'Mercer St District • Station 1 Hearth',
      active: true,
      cuisine: 'Artisanal Pasta',
      rating: 4.92,
      reviewsCount: 340,
      deliveryTime: '25–35 min',
      minOrder: 15.00,
      chef: 'Matteo Vignoli',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBnZKxZINvyKTNghpPJp3SO8Na3Bl-h-Fy7FvDpGHIFjjd-dNpjCvctH2vkjgtDkCh9mBekI3FJkIlaRBFrs3kWX-Q0vJAon9Tm0LbMlr1epSeUx3LnNOrstpsd9bxVsYA9Dztewc--wlfC1dUxhlHrpGz1FbUOjInuTCcCO50SAhOQEd9fZ2upZlGWFxssPVHKJT0U-JNjsGpQfq5NJhgfP_uObNWLA4Rg-BIIdzxOYLQ4731U9Jgc',
      heroTag: 'Featured Purveyor • Florence & Northern Appenines',
      badge: '3-Star Michelin Alum',
      featuredEntree: {
        name: 'Campanelle al Tartufo',
        price: 24.50
      },
      technique: 'Wood-Fired'
    },
    {
      id: 2,
      name: "L'Atelier Sourdough & Tartines",
      description: 'Slow-fermented 36-hour pain de campagne paired with seasonal French countryside provender, raw cultured butter, and wild-harvested velouté.',
      city: 'Portland',
      address: 'Montmartre Heritage Quarter',
      active: true,
      cuisine: 'Sourdough Bakery',
      rating: 4.9,
      reviewsCount: 420,
      deliveryTime: '15–25 min',
      minOrder: 20.00,
      chef: 'Laurent Mercier',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7aA3lQXxl8YZ5VwsNr97cTux0QQrNZlZLBfWjhY2fm_tvq-pOrXtCd6EG2t-6CO4RnicaP_jZrqtVMabiM9znlclovh34HwdlDO-CiIC7ENu2i_G0JGina9cvepQ3YmNSfakxTKGF6p1hSEBkQL_msSQPwtmVgMUtOb2ZbiB0bwZDMI0enhAME_-30ScDIlRNCX_PaWAbVeWXJtLPdeH_zB4gtTOtoOzYwe1mLpFFTXNcjjSy12DH',
      heroTag: 'French Bistro & Tartines',
      badge: 'Free Delivery over $30',
      featuredEntree: {
        name: 'Tartine Provençale',
        price: 18.00
      },
      technique: 'Stone-Hearth'
    },
    {
      id: 3,
      name: 'Tori-Paitan Ramen Lab',
      description: 'Rich 14-hour simmered organic chicken emulsion broth, springy handmade alkaline noodles, and charred heirloom scallion oil.',
      city: 'Portland',
      address: 'Kyoto Style Lab District',
      active: true,
      cuisine: 'Clay-Pot Ramen',
      rating: 4.8,
      reviewsCount: 310,
      deliveryTime: '25–35 min',
      minOrder: 15.00,
      chef: 'Kenji Takahashi',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCD0XF53Cx9i330Yr2_pzkMKC7tWKMxIrVsJuYSPELQNULiwnSynlHpiL0KG2aotPrNpxpR6Mk7YPB81z9fFgL02EVLYDK1ic4i2Q9zph7egBKv_0uDFqwd67Dfee3ZHxOA3wKL_EShri89Gv2ZGhQoPVUkUx8frGFdiV9DQpgKJXwidqdazB_j6Y04xw2t5AJHsWntMJ1tc-X3R_7R9kAW5fndSx59acdIy5aQ3QrG1xeLKPan-_E6',
      heroTag: 'Artisanal Broth & Gyoza',
      badge: 'No MSG • Organic',
      featuredEntree: {
        name: 'Signature Tori Paitan',
        price: 19.50
      },
      technique: 'Clay-Pot Simmer'
    },
    {
      id: 4,
      name: 'Mercato Trattoria',
      description: '900°F oak-fired pies crafted from 72-hour sourdough levain, whole milk Pugliese burrata, and estate pressed cold harvest olive oil.',
      city: 'Portland',
      address: 'Campania Heritage Quarter',
      active: true,
      cuisine: 'Neapolitan Pizza',
      rating: 4.9,
      reviewsCount: 580,
      deliveryTime: '20–30 min',
      minOrder: 18.00,
      chef: 'Fabio Giannini',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDqruXnDmlVA--rwuvtxTISvwQoxDwLg6Q3OjTehtkg_HqkZjzwwuy9Mxet9BIm0E-ry-ZQ8m_T6_XzHsSd53mJpVr-3wSEeCK2-Xn3DSRx_qc_kySuw0xXmS9xh2CgxdLrasT-Qe89blGZE1bCdQKAWEAspl8jF3rcq9E1wtj-TRXWg47Zjfq-pJ6Rjwm4yk2qi9-2ezHjSufu8QZoZd6mt1fXhB20m_RZ8KbQbnlbOIFoAGjPa3Wi',
      heroTag: 'Wood-Fired Pizza & Burrata',
      badge: 'San Marzano D.O.P.',
      featuredEntree: {
        name: 'Burrata Margherita D.O.P.',
        price: 22.00
      },
      technique: 'Oak-Fired 900°F'
    },
    {
      id: 5,
      name: 'Nourish & Root',
      description: 'Soil-to-table botanical warm bowls, house fermented kimchi, activated seeds, and slow cold-pressed root tonics.',
      city: 'Portland',
      address: 'Farmstead Table Gardens',
      active: true,
      cuisine: 'Farmhouse Greens',
      rating: 4.9,
      reviewsCount: 240,
      deliveryTime: '15–25 min',
      minOrder: 14.00,
      chef: 'Maya Lin',
      imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDH5EHcCe1wekz20JIwOkRAG9b2f__lYrUrX7D1zXh2c_5sKVbBjxMPFZygfldemQj7X8bgg7WwQjYoLLGSfUaakKUMILLE-cghqqcD1jiLtGp5dgNYF9KnbUlMdtHVb7oZk-nWqo8zRMyt_QYQauRA_cQJOGzDf5g4zZCsXUARVAODx5zWe6y3VXtwAWy2BCYNCr6AOns_FRC-OhhOxbYm8Z4ExnrfNuY8hbUVFEdDHVId5ruz_HjG',
      heroTag: 'Heirloom Produce & Bowls',
      badge: '100% Plant-Based',
      featuredEntree: {
        name: 'Seasonal Botanical Bowl',
        price: 16.50
      },
      technique: 'Cold-Pressed & Fermented'
    }
  ];

  private mockMenuItems: { [restaurantId: number]: MenuItem[] } = {
    1: [
      {
        id: 101,
        name: 'Campanelle al Tartufo',
        description: 'Fresh fluted pasta, black summer truffle butter, 24-month Parmigiano-Reggiano, thyme breadcrumbs.',
        price: 24.00,
        available: true,
        category: 'Primi Piatti',
        courseId: 'primi',
        tags: ['Vegetarian', 'Truffle'],
        todaySold: 18,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgLevigpg_Vl1EFXFYyM5qW0E8_LYN9TiEP18cq1xSEJQusHlr39TPs3VMr8MsPu5O12IDBhh5tZoCpEjNNUcHsMgWD47Cpny6BXxGXtutBg76Nbpvrn_qBfQ7wYHSCeTK575Mg3U7D0OfZ-Wx8JZPN5cjeTVPx860tl-56ralEd8b6WGaFN9CvvRwdoWeBr98CLrzhc6Q4DUAqxKlOQy4-oP2YH_FxwZjogDzOJ2VFIAG2GtWksQ'
      },
      {
        id: 102,
        name: 'Slow-Braised Short Rib Tagliatelle',
        description: '12-hour Chianti ragù, hand-cut egg pasta, rosemary oil reduction, micro marjoram.',
        price: 28.00,
        available: true,
        category: 'Primi Piatti',
        courseId: 'primi',
        tags: ['Signature', 'Chianti Braise'],
        todaySold: 15,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBrm4NB1pLP-hw53n1X8-oJhQEJnIjO1UY4oy7o41zrVzxGShBh0k2ctV562tTL8Ah_jUuE4vD3qQVx8lyRh0IrRYtRIwsOvGLGJSbOo0nTgbYzusI3l36jvnqgd5VeHnZ22zKtH7HtVnxwwnVZe0fdVb0BORmjN7BERrSeBaOGlMccMTBxqdWUaNnSXmLxHAxlN9HNK33FVaGEsDf1TUgFh7TRL-cb6O-weHcSIrBwHrQNC0Xw0vZ1'
      },
      {
        id: 103,
        name: 'Heirloom Burrata & Roasted Fig',
        description: 'Confit mission figs, cold-pressed Frantoio olive oil, aged balsamic glaze, wild baby arugula.',
        price: 18.50,
        available: true,
        category: 'Antipasti & Crudo',
        courseId: 'antipasti',
        tags: ['Vegetarian', 'Gluten-Free'],
        todaySold: 14,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD1OOUh-Ax9Uuby0t6Ojy6NCe68t5NRGcJGcPkp_nSdcGgsVhbNeIkxOKob810bZF4cDpc7hkMZ2EGrU9CEEBM6oRNCJF5WdtCoh-BwHB_E0OEdOQ-XJvvnk3XMbg7z9Vc8mlDH_y_RwgBkGohBL6wXocafuvzlMjfdk3eut4QA-jDnchKQwkeR6b6lZweYiOdst9991zCpSZWx6T9ZJrIIPFnzYzWx_MTTAzSUztUogQND3ADL-VDN'
      },
      {
        id: 104,
        name: 'Wood-Fired Wild Morel Focaccia',
        description: 'Heritage stone-ground wheat, rosemary sea salt crystals, cold-pressed olive oil, mountain morels.',
        price: 14.50,
        available: true,
        category: 'Antipasti & Crudo',
        courseId: 'antipasti',
        tags: ['Wood-Fired', 'Vegetarian'],
        todaySold: 22,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDey-ehfb899Ll5hs3n8qiEhGsjwTVmdGPEB82gv8ZVq1O-DI7RYVTFr_COg4P3AfFaBfYd9I6RI-6dbMHwjBbi317sxkXnhMvBqhIY4FJ6dBsc4QbcA8eHvq4F0k9yRNPhE9UlhXfkB6cUjAU56jfV74BhcenjQJ3PV0ZSoP8s_DZ-cMSG14dwh1xsyhLSDbWGWC8e-7S4N7ZSzBoDytdnniDLu-XMqFQ5MUKBSBgPo107DDhPcX-7'
      },
      {
        id: 105,
        name: 'Wild Boar Pappardelle',
        description: '12-Hour Chianti Braise, juniper berries, hand-torn egg ribbons, aged pecorino toscano.',
        price: 28.00,
        available: true,
        category: 'Primi Piatti',
        courseId: 'primi',
        tags: ['Heritage Game', 'Chef Special'],
        todaySold: 21,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDJCQ2WzUbzWCQ_5suoAGZ7fNHawgvqUh4ep_ZlmnLBGIQsmWCcQQEymg_mtJ3jReFZdAEqG5Ne0us9d5puFU3u62B7OfzRTvyeg5lAZMSVknqwS7I1XTejWAyz4VEA76q7X5SVDmCd4gU1ekOThCIW7frT_MuBFvFtpRN_qlQjs-ItRU1_u0CxMuY60IOlpWsmaBxYPx9PoL5i3ZIvds_99Z1eHD2YKoqL4KW_703rxL18yKFXx2Hk'
      },
      {
        id: 106,
        name: 'Olive Oil & Meyer Lemon Cake',
        description: 'Coarse polenta crumb, cold-pressed Frantoio olive oil, whipped mascarpone, toasted Bronte pistachios.',
        price: 11.00,
        available: true,
        category: 'Dolci & Natural Wines',
        courseId: 'dolci',
        tags: ['Gluten-Free', 'Dessert'],
        todaySold: 12,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC7aA3lQXxl8YZ5VwsNr97cTux0QQrNZlZLBfWjhY2fm_tvq-pOrXtCd6EG2t-6CO4RnicaP_jZrqtVMabiM9znlclovh34HwdlDO-CiIC7ENu2i_G0JGina9cvepQ3YmNSfakxTKGF6p1hSEBkQL_msSQPwtmVgMUtOb2ZbiB0bwZDMI0enhAME_-30ScDIlRNCX_PaWAbVeWXJtLPdeH_zB4gtTOtoOzYwe1mLpFFTXNcjjSy12DH'
      },
      {
        id: 107,
        name: 'Trebbiano Macerato 2021',
        description: '750ml skin-contact natural white. Wild apricots, saline minerality, biodynamic estate bottling.',
        price: 38.00,
        available: true,
        category: 'Dolci & Natural Wines',
        courseId: 'dolci',
        tags: ['Sommelier Selection', 'Natural Wine'],
        todaySold: 8,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAAfBzTfL5yTxqfsYFnSajs5vEPYR-gLXY-qR2j-bey5L6yU4Qm4L40lNBfdAn0fIn5heHDeymvE0N3lrrgJ6jM5NLaeZB9cYN1Ya4nQabZh8GNzy3xKLgfFLGvQozGPKtT7R5HCkSz596Zswy9vV1TtY3K0A7OIDk_FLLb0d2FUwfAu91n3GFDBJWYiSL2sqASnw-6i8ivK-RD0Oke6HqsH1wgdWGY3sTxg-iF8lGqMM6uhPpHhpax'
      },
      {
        id: 108,
        name: 'Bronte Pistachio Cannoli',
        description: "Sheep's milk ricotta, candied citrus peel, Bronte pistachio dust, dark chocolate pearls.",
        price: 12.00,
        available: false, // 86'd
        category: 'Dolci & Natural Wines',
        courseId: 'dolci',
        tags: ["86'd Sold Out", 'Dessert'],
        todaySold: 10,
        imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB1L9VAYTxdymB3oa0QHSmhMvQmlkWFRNDSG_3cpHl8vbbFCwFpECWVwQxqFxHnsSpX_9RfClau56RC8V0dyvKw2oXUphqjEfhjSrFYrfAAdNHFNic7KH7j6tsLPVVWBYcWwgNbZ6DD_ZwSnK5LrkwLabpVNO0AAf5ziTWtajWICYRjLvAnAnwuAYGs0HDUlGdAKAm3afjijDye4GPpqUvN5ODWANKaeLbIHvOMZoRJsfbqZT15VlOL'
      }
    ]
  };

  private restaurantsSignal = signal<Restaurant[]>(this.mockRestaurants);
  restaurants = this.restaurantsSignal.asReadonly();

  private menuItemsSignal = signal<{ [resId: number]: MenuItem[] }>(this.mockMenuItems);

  // Kitchen operational live toggle for partner portal
  private kitchenAcceptingOrdersSignal = signal<boolean>(true);
  kitchenAcceptingOrders = this.kitchenAcceptingOrdersSignal.asReadonly();

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.loadBackendRestaurants();
  }

  loadBackendRestaurants() {
    this.http.get<any>(this.apiUrl)
      .pipe(catchError(() => of(null)))
      .subscribe(res => {
        if (res && res.data && Array.isArray(res.data) && res.data.length > 0) {
          // Merge with mock rich data
          const merged = this.mockRestaurants.map(m => {
            const backendMatch = res.data.find((b: any) => b.id === m.id || b.name === m.name);
            return backendMatch ? { ...m, ...backendMatch } : m;
          });
          this.restaurantsSignal.set(merged);
        }
      });
  }

  getRestaurantById(id: number): Restaurant | undefined {
    return this.restaurantsSignal().find(r => r.id === id) || this.restaurantsSignal()[0];
  }

  getMenu(restaurantId: number): MenuItem[] {
    const map = this.menuItemsSignal();
    return map[restaurantId] || map[1] || [];
  }

  toggleKitchenServiceStatus(): boolean {
    const current = !this.kitchenAcceptingOrdersSignal();
    this.kitchenAcceptingOrdersSignal.set(current);
    if (current) {
      this.toastService.show('Service is LIVE: Accepting incoming diner orders', 'success', 'check_circle');
    } else {
      this.toastService.show('Service PAUSED: Incoming orders disabled on marketplace', 'warning', 'pause_circle');
    }
    return current;
  }

  toggleItemStock(restaurantId: number, itemId: number): boolean {
    const map = { ...this.menuItemsSignal() };
    const items = map[restaurantId] ? [...map[restaurantId]] : [];
    const idx = items.findIndex(i => i.id === itemId);

    if (idx !== -1) {
      const item = { ...items[idx], available: !items[idx].available };
      items[idx] = item;
      map[restaurantId] = items;
      this.menuItemsSignal.set(map);

      if (item.available) {
        this.toastService.show(`${item.name} restored: Active in Menu`, 'success', 'check_circle');
      } else {
        this.toastService.show(`${item.name} marked Sold Out (86) on guest menus`, 'warning', 'do_not_disturb_on');
      }

      // Backend API call
      this.http.put(`${this.apiUrl}/${restaurantId}/menu/${itemId}`, {
        name: item.name,
        description: item.description,
        price: item.price,
        available: item.available
      }, { headers: this.authService.getAuthHeaders() })
      .pipe(catchError(() => of(null)))
      .subscribe();

      return item.available;
    }
    return false;
  }

  addNewMenuItem(restaurantId: number, item: Partial<MenuItem>) {
    const newItem: MenuItem = {
      id: Date.now(),
      name: item.name || 'Artisanal Spec',
      description: item.description || 'Prepared fresh upon order.',
      price: item.price || 18.00,
      available: true,
      category: item.category || 'Primi Piatti',
      courseId: 'primi',
      todaySold: 0,
      imageUrl: item.imageUrl || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDbgLevigpg_Vl1EFXFYyM5qW0E8_LYN9TiEP18cq1xSEJQusHlr39TPs3VMr8MsPu5O12IDBhh5tZoCpEjNNUcHsMgWD47Cpny6BXxGXtutBg76Nbpvrn_qBfQ7wYHSCeTK575Mg3U7D0OfZ-Wx8JZPN5cjeTVPx860tl-56ralEd8b6WGaFN9CvvRwdoWeBr98CLrzhc6Q4DUAqxKlOQy4-oP2YH_FxwZjogDzOJ2VFIAG2GtWksQ',
      tags: ['Chef Spec']
    };

    const map = { ...this.menuItemsSignal() };
    const current = map[restaurantId] ? [...map[restaurantId]] : [];
    current.push(newItem);
    map[restaurantId] = current;
    this.menuItemsSignal.set(map);

    this.toastService.show(`Added ${newItem.name} to menu`, 'success', 'add_circle');

    // Call backend API
    this.http.post(`${this.apiUrl}/${restaurantId}/menu`, {
      name: newItem.name,
      description: newItem.description,
      price: newItem.price,
      available: true
    }, { headers: this.authService.getAuthHeaders() })
    .pipe(catchError(() => of(null)))
    .subscribe();
  }
}
