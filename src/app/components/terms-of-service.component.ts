import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-terms-of-service',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-16 min-h-screen">
      <header class="mb-12">
        <a routerLink="/" class="text-primary hover:underline flex items-center gap-2 mb-6 text-sm font-bold">
          <i-lucide name="chevron-left" class="w-4 h-4"></i-lucide> Back to Dashboard
        </a>
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Terms of Service</h1>
        <p class="text-gray-500 font-medium">Last Updated: March 20, 2026</p>
      </header>

      <section class="prose prose-indigo max-w-none space-y-10">
        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
          <p class="text-gray-600 leading-relaxed">
            By accessing or using MoneyMind, you agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you may not use our services.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">2. Use of Services</h2>
          <p class="text-gray-600 leading-relaxed">
            You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account. MoneyMind is for personal, non-commercial use only.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">3. User Conduct</h2>
          <p class="text-gray-600 leading-relaxed">
            Users agree not to use the service for any unlawful purposes or to transmit any material that is harmful or offensive. We reserve the right to terminate accounts for violations of these terms.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">4. Limitation of Liability</h2>
          <p class="text-gray-600 leading-relaxed">
            MoneyMind provides financial tracking tools for informational purposes. We are not responsible for financial decisions made based on the data provided by the application.
          </p>
        </div>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      background: linear-gradient(to bottom, #f9fafb, #ffffff);
    }
  `]
})
export class TermsOfServiceComponent {}
