import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <footer class="w-full bg-[#FAF8F5] border-t border-[#EAE5DE] mt-16">
      <div class="max-w-7xl mx-auto px-6 lg:px-12 pt-16 pb-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-[#EAE5DE]">
          <!-- Brand Info -->
          <div class="lg:col-span-2 flex flex-col gap-4">
            <div class="flex items-center gap-3">
              <img 
                alt="DashDish Brand Mark" 
                class="h-7 w-auto object-contain" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAQMiEGEtUArkdGpaa-evwcrV6OJDoRMfEuU3FH6YbDOezC1i2HzAdZ3LkC_h67uVUwuCRVwN37cRimOifi9Ci0-8AzhddTAtdmOiKNWZVm0kdzhyXwoZDSX5zD79_zHPGtVh7AM5N_9r6VW_YNQZBPLR_PaDuDZu5Tr2jSOxuRPsh3ltXFOs8Jojb-XvQ1qRO6zeUl1jI4OETRX09hCbYmvJDUl1QyJHBBG7vzA8NHkruGgmsrSYAt"
              />
              <span class="font-headline-sm text-headline-sm text-on-surface">DashDish</span>
            </div>
            <p class="font-body-md text-body-md text-on-surface-variant max-w-sm">
              Curated dining, seasonal culinary artisans, and high-touch hospitality delivered to your residence with analog reverence.
            </p>
            <div class="flex items-center gap-2 mt-2">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-label-sm font-label-sm bg-secondary-container text-on-secondary-fixed">
                <span class="w-2 h-2 rounded-full bg-secondary"></span>
                API: Online • v3.3.2
              </span>
              <span class="text-label-sm font-label-sm text-outline">Spring Boot 3.3.2</span>
            </div>
          </div>

          <!-- Column 1 -->
          <div>
            <h4 class="font-title-md text-title-md text-on-surface mb-4">Culinary Chapters</h4>
            <ul class="flex flex-col gap-2.5">
              <li routerLink="/discovery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Wood-Fired Bakeries</li>
              <li routerLink="/discovery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Heritage Pasta Labs</li>
              <li routerLink="/discovery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Natural Wine Cellars</li>
              <li routerLink="/discovery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Farmstead Seasonal</li>
              <li routerLink="/discovery" class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Small-Batch Patisserie</li>
            </ul>
          </div>

          <!-- Column 2 -->
          <div>
            <h4 class="font-title-md text-title-md text-on-surface mb-4">Hospitality Network</h4>
            <ul class="flex flex-col gap-2.5">
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Courier Integrity Charter</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Artisan Kitchen Onboarding</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Thermal Transport Standards</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Compostable Packaging Lab</li>
            </ul>
          </div>

          <!-- Column 3 -->
          <div>
            <h4 class="font-title-md text-title-md text-on-surface mb-4">Editorial &amp; Platform</h4>
            <ul class="flex flex-col gap-2.5">
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">The Seasonal Gazette</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Partner Restitution Policy</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">Privacy &amp; Data Rights</li>
              <li class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors cursor-pointer">System Architecture Status</li>
            </ul>
          </div>
        </div>

        <!-- Bottom Copyright -->
        <div class="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p class="font-body-md text-body-md text-outline">
            © 2024 DashDish Hospitality Inc. Crafted with epicurean intention.
          </p>
          <div class="flex items-center gap-6">
            <span class="font-label-md text-label-md text-outline hover:text-on-surface cursor-pointer">Terms of Service</span>
            <span class="font-label-md text-label-md text-outline hover:text-on-surface cursor-pointer">Culinary Ethics</span>
            <span class="font-label-md text-label-md text-outline hover:text-on-surface cursor-pointer">Security Protocol</span>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
