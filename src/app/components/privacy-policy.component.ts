import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-privacy-policy',
  standalone: true,
  imports: [RouterLink, LucideAngularModule],
  template: `
    <div class="max-w-3xl mx-auto px-6 py-16 min-h-screen">
      <header class="mb-12">
        <a routerLink="/" class="text-primary hover:underline flex items-center gap-2 mb-6 text-sm font-bold">
          <i-lucide name="chevron-left" class="w-4 h-4"></i-lucide> Back to Dashboard
        </a>
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 mb-4">Privacy Policy</h1>
        <p class="text-gray-500 font-medium">Last Updated: March 20, 2026</p>
      </header>

      <section class="prose prose-indigo max-w-none space-y-10">
        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">1. Information We Collect</h2>
          <p class="text-gray-600 leading-relaxed">
            MoneyMind is designed to prioritize your privacy. We collect minimal personal information necessary to provide our financial tracking services, such as your email address and transaction data you choose to input.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">2. How We Use Your Data</h2>
          <p class="text-gray-600 leading-relaxed">
            Your data is used solely to provide personalized financial insights and tracking within the application. We do not sell your personal information to third parties.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">3. Data Security</h2>
          <p class="text-gray-600 leading-relaxed">
            We use industry-standard encryption and security measures (via Supabase) to protect your financial information from unauthorized access or disclosure.
          </p>
        </div>

        <div class="bg-white/50 backdrop-blur-md border border-gray-100 p-8 rounded-[2.5rem] shadow-sm">
          <h2 class="text-xl font-bold text-gray-900 mb-4">4. Your Rights</h2>
          <p class="text-gray-600 leading-relaxed">
            You have the right to access, update, or delete your data at any time through the application settings.
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
export class PrivacyPolicyComponent {}
