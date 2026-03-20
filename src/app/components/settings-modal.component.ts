import { Component, Input, Output, EventEmitter, inject, ChangeDetectionStrategy, signal } from '@angular/core';

import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { LucideAngularModule } from 'lucide-angular';
import { StoreService } from '../services/store.service';
import { SupabaseService } from '../services/supabase.service';
import { AuthModalComponent } from './auth-modal.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, LucideAngularModule, AuthModalComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Settings">
      <div class="space-y-6">
        <!-- App Info -->
        <div class="flex items-center gap-4 p-4 rounded-2xl bg-gray-50 border border-gray-100">
          <div class="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
            <i-lucide name="info" class="w-6 h-6"></i-lucide>
          </div>
          <div>
            <h3 class="font-bold text-gray-900">MoneyMind</h3>
            <p class="text-sm text-gray-500">Version 0.1.0 (Alpha)</p>
          </div>
        </div>

        <!-- Account / Sync Section -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Cloud Sync</h4>
          <div class="p-4 rounded-2xl bg-white border border-gray-100 space-y-4">
            @if (supabase.user()) {
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <i-lucide name="check-circle-2" class="w-5 h-5"></i-lucide>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">{{ supabase.user()?.email }}</p>
                    <p class="text-[10px] text-success font-bold flex items-center gap-1">
                      <span class="w-1 h-1 rounded-full bg-success"></span> Synchronized
                    </p>
                  </div>
                </div>
                <button (click)="onSignOut()" appButton variant="ghost" size="sm" class="text-gray-400 hover:text-danger">
                  Sign Out
                </button>
              </div>
            } @else {
              <div class="flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                    <i-lucide name="refresh-ccw" class="w-5 h-5"></i-lucide>
                  </div>
                  <div>
                    <p class="text-sm font-bold text-gray-900">Sync Disabled</p>
                    <p class="text-[10px] text-gray-400 font-medium tracking-tight">Login to sync across devices</p>
                  </div>
                </div>
                <button (click)="isAuthModalOpen.set(true)" appButton variant="primary" size="sm" class="rounded-xl px-4">
                  Sign In
                </button>
              </div>
            }
          </div>
        </div>

        <!-- General Settings -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Application</h4>
          <div class="grid gap-2">
              <button 
                appButton 
                variant="secondary"
                class="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 transition-all text-left group w-full h-auto"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center text-success group-hover:bg-success/20 transition-colors">
                    <i-lucide name="bell" class="w-4 h-4"></i-lucide>
                  </div>
                  <span class="font-medium text-gray-700">Notifications</span>
                </div>
                <div class="w-10 h-5 bg-gray-200 rounded-full relative">
                  <div class="absolute right-1 top-1 w-3 h-3 bg-white rounded-full"></div>
                </div>
              </button>

              <button 
                appButton 
                variant="secondary"
                class="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-primary/30 transition-all text-left group w-full h-auto"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary/20 transition-colors">
                    <i-lucide name="moon" class="w-4 h-4"></i-lucide>
                  </div>
                  <span class="font-medium text-gray-700">Dark Mode</span>
                </div>
                <span class="text-xs font-bold text-primary bg-primary/5 px-2 py-1 rounded">System</span>
              </button>
          </div>
        </div>

        <!-- Data Management -->
        <div class="space-y-2 pt-2">
          <h4 class="text-xs font-bold uppercase tracking-wider text-gray-400 px-1">Data & Privacy</h4>
          <div class="grid gap-2">
              <button 
                appButton
                variant="secondary"
                (click)="onResetData()"
                class="flex items-center justify-between p-4 rounded-2xl bg-white border border-gray-100 hover:border-danger/30 transition-all text-left group w-full h-auto"
              >
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-lg bg-danger/10 flex items-center justify-center text-danger group-hover:bg-danger/20 transition-colors">
                    <i-lucide name="trash-2" class="w-4 h-4"></i-lucide>
                  </div>
                  <div>
                    <span class="font-medium text-gray-700 block">Reset All Data</span>
                    <span class="text-[10px] text-gray-400">This action cannot be undone</span>
                  </div>
                </div>
                <i-lucide name="chevron-right" class="w-4 h-4 text-gray-300"></i-lucide>
              </button>
          </div>
        </div>

        <div class="pt-4 text-center">
            <p class="text-[10px] text-gray-400">Built with ❤️ for Financial Wellness</p>
        </div>
      </div>
    </app-modal>

    <app-auth-modal
      [isOpen]="isAuthModalOpen()"
      (onClose)="isAuthModalOpen.set(false)"
    ></app-auth-modal>
  `
})
export class SettingsModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  private store = inject(StoreService);
  protected supabase = inject(SupabaseService);

  isAuthModalOpen = signal(false);

  onResetData() {
    if (confirm('Are you sure you want to reset all data? This will delete all your reminders, goals, and progress achievements.')) {
      localStorage.removeItem('moneymind-storage');
      window.location.reload();
    }
  }

  async onSignOut() {
    if (confirm('Are you sure you want to sign out? Data sync will be disabled.')) {
      await this.supabase.signOut();
    }
  }
}
