import { Component } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [LucideAngularModule, RouterLink],
  template: `
    <footer class="w-full py-8 mt-auto border-t border-gray-100 bg-white/60 backdrop-blur-xl">
      <div class="max-w-4xl mx-auto px-6">
        <div class="flex flex-col md:flex-row justify-between items-center gap-4">
          <p class="text-gray-400 text-xs font-bold">
            &copy; {{ currentYear }} 
            <a href="https://ssowemimo.com/" target="_blank" class="text-primary hover:text-indigo-700 transition-colors">
              femi sowems
            </a>
          </p>
          <div class="flex items-center gap-6">
            <a routerLink="/" class="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Dashboard</a>
            <a routerLink="/privacy-policy" class="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Privacy Policy</a>
            <a routerLink="/terms-of-service" class="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Terms of Service</a>
            <a href="mailto:femi@example.com" class="text-xs font-bold text-gray-400 hover:text-gray-600 transition-colors">Support</a>
          </div>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }
  `]
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
}
