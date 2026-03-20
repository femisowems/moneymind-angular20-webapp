import { Component, inject, signal, computed, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { PlayerLevelBarComponent } from './player-level-bar.component';
import { StreakCardComponent } from './streak-card.component';
import { HealthScoreCardComponent } from './health-score-card.component';
import { MissedImpactCardComponent } from './missed-impact-card.component';
import { AchievementsSectionComponent } from './achievements-section.component';
import { GoalsSectionComponent } from './goals-section.component';
import { NudgeMessageComponent } from './nudge-message.component';
import { ReminderCardComponent } from './reminder-card.component';
import { AddReminderModalComponent } from './add-reminder-modal.component';
import { ShopModalComponent } from './shop-modal.component';
import { ReminderDetailsModalComponent } from './reminder-details-modal.component';
import { ButtonComponent } from './ui/button.component';
import { SettingsModalComponent } from './settings-modal.component';
import { ShareScorecardModalComponent } from './share-scorecard-modal.component';
import { LucideAngularModule } from 'lucide-angular';
import { format } from 'date-fns';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';
import { Reminder } from '../types';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule, 
    PlayerLevelBarComponent, 
    StreakCardComponent, 
    HealthScoreCardComponent, 
    MissedImpactCardComponent, 
    AchievementsSectionComponent, 
    GoalsSectionComponent, 
    NudgeMessageComponent,
    ReminderCardComponent,
    AddReminderModalComponent,
    ShopModalComponent,
    ReminderDetailsModalComponent,
    SettingsModalComponent,
    ShareScorecardModalComponent,
    ButtonComponent,
    LucideAngularModule
  ],
  animations: [
    trigger('listAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(10px)' }),
          stagger(50, [
            animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <main class="max-w-3xl mx-auto w-full p-4 sm:p-6 md:p-8 min-h-screen pb-24">
      <!-- Header -->
      <header class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pt-4">
        <div>
          <h1 class="text-3xl font-bold tracking-tight text-gray-900 flex items-center gap-3">
            MoneyMind <span class="text-2xl">💸</span>
          </h1>
          <p class="text-gray-500 font-medium">{{ today }}</p>
        </div>
        <div class="flex flex-col-reverse sm:flex-row w-full sm:w-auto items-stretch sm:items-center gap-3">
          <div class="flex w-full sm:w-auto justify-center items-center p-1.5 sm:p-1 bg-white/80 backdrop-blur-md border border-gray-200/80 rounded-[2rem] sm:rounded-full shadow-sm gap-1 sm:gap-0.5">
            <button (click)="isShopOpen.set(true)" appButton variant="ghost" size="icon" class="rounded-full hover:bg-indigo-50 text-indigo-400 hover:text-indigo-600">
              <i-lucide name="store" class="w-5 h-5 sm:w-[18px] sm:h-[18px]"></i-lucide>
            </button>
            <button (click)="isSettingsOpen.set(true)" appButton variant="ghost" size="icon" class="rounded-full hover:bg-gray-100 text-gray-500">
              <i-lucide name="settings" class="w-5 h-5 sm:w-[18px] sm:h-[18px]"></i-lucide>
            </button>
          </div>

          <button (click)="isAddModalOpen.set(true)" appButton class="w-full sm:w-auto rounded-full shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all bg-gradient-to-r from-primary to-[#7050ff] text-white px-6">
            <i-lucide name="plus" class="w-5 h-5 mr-2 shrink-0"></i-lucide>
            Add Reminder
          </button>
        </div>
      </header>

      <app-player-level-bar (share)="isShareModalOpen.set(true)"></app-player-level-bar>

      <!-- Top Stats -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <app-streak-card></app-streak-card>
        <app-health-score-card></app-health-score-card>
        <app-missed-impact-card></app-missed-impact-card>
      </div>

      <app-achievements-section></app-achievements-section>

      <!-- Nudge Area -->
      <app-nudge-message></app-nudge-message>

      <app-goals-section></app-goals-section>

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-xl font-bold text-gray-900">Overview</h2>
        <div class="flex bg-gray-100 p-1 rounded-xl">
          <button 
            (click)="statusFilter.set('Pending')"
            class="px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
            [ngClass]="statusFilter() === 'Pending' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'"
          >
            Pending
          </button>
          <button 
            (click)="statusFilter.set('Completed')"
            class="px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
            [ngClass]="statusFilter() === 'Completed' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'"
          >
            Completed
          </button>
          <button 
            (click)="statusFilter.set('Deleted')"
            class="px-3 py-1.5 rounded-lg transition-all text-sm font-bold"
            [ngClass]="statusFilter() === 'Deleted' ? 'bg-white shadow-sm text-primary' : 'text-gray-400'"
          >
            Trash
          </button>
        </div>
      </div>

      <div class="flex flex-col gap-3" [@listAnimation]="filteredReminders().length">
        <div *ngIf="filteredReminders().length > 0; else emptyState" class="flex flex-col gap-2">
           <app-reminder-card 
             *ngFor="let reminder of filteredReminders()" 
             [reminder]="reminder" 
             [isDeletedItem]="statusFilter() === 'Deleted'"
             (openDetails)="onOpenDetails($event)"
           ></app-reminder-card>
        </div>
        <ng-template #emptyState>
          <div class="py-12 text-center text-gray-500 border-2 border-dashed border-gray-200 rounded-3xl bg-white/50 backdrop-blur-sm">
            <div class="text-4xl mb-3">🪹</div>
            <h3 class="font-semibold text-lg text-gray-900">All caught up!</h3>
            <p class="text-sm mt-1">No reminders found for this filter.</p>
          </div>
        </ng-template>
      </div>

      <!-- Modals (Lazy Loaded) -->
      @defer (on idle) {
        <app-add-reminder-modal 
          [isOpen]="isAddModalOpen()" 
          (onClose)="isAddModalOpen.set(false)"
        ></app-add-reminder-modal>
      }

      @defer (on idle) {
        <app-shop-modal 
          [isOpen]="isShopOpen()" 
          (onClose)="isShopOpen.set(false)"
        ></app-shop-modal>
      }

      @defer (on idle) {
        <app-reminder-details-modal 
          [isOpen]="!!selectedReminderId()" 
          [reminder]="selectedReminder()"
          (onClose)="selectedReminderId.set(null)"
        ></app-reminder-details-modal>
      }

      @defer (on idle) {
        <app-settings-modal
          [isOpen]="isSettingsOpen()"
          (onClose)="isSettingsOpen.set(false)"
        ></app-settings-modal>
      }

      @defer (on idle) {
        <app-share-scorecard-modal
          [isOpen]="isShareModalOpen()"
          (onClose)="isShareModalOpen.set(false)"
        ></app-share-scorecard-modal>
      }
    </main>
  `
})
export class HomeComponent implements OnInit {
  private store = inject(StoreService);
  
  today = format(new Date(), 'EEEE, MMMM do');
  
  statusFilter = signal<'Pending' | 'Completed' | 'Deleted'>('Pending');
  isAddModalOpen = signal(false);
  isShopOpen = signal(false);
  isSettingsOpen = signal(false);
  isShareModalOpen = signal(false);
  selectedReminderId = signal<string | null>(null);

  selectedReminder = computed(() => {
    const id = this.selectedReminderId();
    if (!id) return null;
    return (
      this.store.reminders().find(r => r.id === id) || 
      this.store.deletedReminders().find(r => r.id === id) || 
      null
    );
  });

  filteredReminders = computed(() => {
    const filter = this.statusFilter();
    const allReminders = filter === 'Deleted' ? this.store.deletedReminders() : this.store.reminders();
    
    return allReminders
      .filter(r => {
        if (filter === 'Deleted') return true;
        if (filter === 'Completed') return r.isCompleted;
        return !r.isCompleted;
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  });

  ngOnInit() {
    // Initial onboarding logic if needed
    if (!this.store.hasCompletedOnboarding()) {
      const today = new Date().toISOString();
      this.store.addReminder({
        title: "Try completing this task! 👉",
        category: "1",
        dueDate: today,
        recurring: "none"
      });
      this.store.completeOnboarding();
    }
  }

  onOpenDetails(reminder: Reminder) {
    this.selectedReminderId.set(reminder.id);
  }
}
