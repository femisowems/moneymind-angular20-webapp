import { Component, Input, Output, EventEmitter, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { SupabaseService } from '../services/supabase.service';

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, ButtonComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Sign In to Sync">
      <div class="space-y-6 pt-2">
        <div class="text-center p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10">
          <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4 text-primary">
            <i-lucide name="refresh-ccw" class="w-8 h-8"></i-lucide>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">Cloud Synchronization</h3>
          <p class="text-gray-500 text-sm font-medium">
            Sign in to securely sync your reminders, streaks, and achievements across all your devices.
          </p>
        </div>

        @if (!isLoading() && !linkSent()) {
          <div class="space-y-4">
            <div class="space-y-2">
              <label for="email" class="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Email Address</label>
              <input 
                id="email"
                type="email" 
                [(ngModel)]="email"
                placeholder="femi@ssowemimo.com"
                class="w-full p-4 rounded-2xl border border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-medium"
                (keyup.enter)="onSignIn()"
              />
            </div>

            <button 
              appButton 
              (click)="onSignIn()" 
              [disabled]="!isValidEmail()"
              class="w-full py-4 rounded-2xl bg-gradient-to-r from-primary to-[#7050ff] text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all font-bold"
            >
              Send Magic Link
            </button>
          </div>
        } @else if (isLoading()) {
          <div class="py-12 flex flex-col items-center justify-center space-y-4">
            <i-lucide name="loader-2" class="w-10 h-10 text-primary animate-spin"></i-lucide>
            <p class="text-gray-500 font-bold">Sending magic link...</p>
          </div>
        } @else if (linkSent()) {
          <div class="py-8 text-center space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div class="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto text-success">
              <i-lucide name="check" class="w-8 h-8"></i-lucide>
            </div>
            <div class="space-y-2">
              <h4 class="text-xl font-bold text-gray-900">Check your email!</h4>
              <p class="text-gray-500 font-medium">
                We've sent a login link to <span class="text-gray-900 font-bold">{{ email }}</span>.
              </p>
            </div>
            <button appButton variant="ghost" (click)="linkSent.set(false)" class="text-primary font-bold">
              Try a different email
            </button>
          </div>
        }

        <p class="text-[10px] text-gray-400 text-center px-6">
          By continuing, you agree to MoneyMind's <a routerLink="/terms-of-service" class="underline">Terms of Service</a> and <a routerLink="/privacy-policy" class="underline">Privacy Policy</a>.
        </p>
      </div>
    </app-modal>
  `
})
export class AuthModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  private supabase = inject(SupabaseService);

  email = '';
  isLoading = signal(false);
  linkSent = signal(false);

  isValidEmail() {
    return this.email && this.email.includes('@') && this.email.includes('.');
  }

  async onSignIn() {
    if (!this.isValidEmail()) return;
    
    this.isLoading.set(true);
    const { error } = await this.supabase.signIn(this.email);
    this.isLoading.set(false);

    if (error) {
      alert(error.message);
    } else {
      this.linkSent.set(true);
    }
  }
}
