import { Component, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { ACHIEVEMENTS, Achievement } from '../lib/achievements';
import { BadgeDetailsModalComponent } from './badge-details-modal.component';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-achievements-section',
  standalone: true,
  imports: [CommonModule, BadgeDetailsModalComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('staggerList', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px) scale(0.8)' }),
          stagger(50, [
            animate('400ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateY(0) scale(1)' }))
          ])
        ], { optional: true })
      ])
    ])
  ],
  template: `
    <section class="mb-10">
      <div class="flex justify-between items-center mb-6 px-1">
        <h2 class="text-sm font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2.5">
          <i-lucide name="trophy" class="w-4 h-4 text-primary"></i-lucide> Badges & Achievements
        </h2>
        
        <button 
          *ngIf="visibleAchievements().length > 4"
          (click)="toggleExpand()"
          class="relative overflow-hidden text-xs font-bold text-primary transition-all flex items-center gap-2 group bg-white border border-gray-100 hover:border-primary/30 px-4 py-2 rounded-full shadow-sm hover:shadow-md active:scale-95"
        >
          <span>{{ isExpanded() ? 'Show less' : '+' + (visibleAchievements().length - 4) + ' more' }}</span>
          <div 
            class="flex items-center justify-center w-3 h-3 transition-transform"
            [style.transform]="isExpanded() ? 'rotate(180deg)' : 'rotate(0deg)'"
          >
            <div class="w-1.5 h-1.5 border-b-2 border-r-2 border-primary rotate-45 mb-0.5 group-hover:border-primary-hover"></div>
          </div>
        </button>
      </div>
      
      <div 
        class="grid grid-cols-2 sm:grid-cols-4 gap-4"
        [@staggerList]="displayedAchievements().length"
      >
        <button 
          *ngFor="let achievement of displayedAchievements()"
          (click)="selectBadge(achievement)"
          class="p-5 rounded-[2.5rem] border shadow-sm transition-all flex flex-col items-center justify-center text-center relative overflow-hidden group hover:shadow-xl hover:border-primary/30 bg-white border-gray-100 hover:-translate-y-1 active:scale-95"
        >
          <div class="relative w-16 h-16 mb-4 flex items-center justify-center bg-gray-50 rounded-[1.25rem] group-hover:bg-primary/5 transition-colors">
            <!-- Progress Circle for Locked Multi-step achievements (Simplified) -->
            <svg *ngIf="!isUnlocked(achievement.id) && achievement.maxProgress && achievement.maxProgress > 1" class="absolute inset-0 w-full h-full -rotate-90 pointer-events-none p-1" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="46" stroke="#f3f4f6" strokeWidth="6" fill="none" />
              <circle cx="50" cy="50" r="46" stroke="#6d50f5" strokeWidth="6" fill="none" 
                class="transition-all duration-1000 ease-out" 
                [attr.stroke-dasharray]="289" 
                [attr.stroke-dashoffset]="289 - (289 * getPercent(achievement)) / 100" 
                strokeLinecap="round" />
            </svg>
            <span 
              class="text-4xl filter drop-shadow-md z-10 transition-transform group-hover:scale-110 duration-500"
              [ngClass]="{'grayscale opacity-40': !isUnlocked(achievement.id)}"
            >
              {{ achievement.icon }}
            </span>
          </div>
          
          <h3 class="text-sm font-black text-gray-900 mb-1 tracking-tight group-hover:text-primary transition-colors">
            {{ achievement.title }}
          </h3>
          <div class="flex items-center gap-1.5 min-h-[1.25rem]">
            <div 
              *ngIf="isUnlocked(achievement.id)"
              class="w-1.5 h-1.5 rounded-full bg-success shadow-[0_0_8px_rgba(34,197,94,0.4)]"
            ></div>
            <span *ngIf="!isUnlocked(achievement.id)" class="text-[9px] font-black uppercase text-gray-400 tracking-[0.1em] opacity-80">Locked</span>
          </div>
        </button>
      </div>
    </section>

    <app-badge-details-modal 
      [isOpen]="!!selectedBadge()" 
      [achievement]="selectedBadge()" 
      (onClose)="selectedBadge.set(null)"
    ></app-badge-details-modal>
  `
})
export class AchievementsSectionComponent {
  private store = inject(StoreService);
  unlockedAchievements = this.store.unlockedAchievements;

  isExpanded = signal(false);
  selectedBadge = signal<Achievement | null>(null);

  visibleAchievements = computed(() => 
    ACHIEVEMENTS.filter(a => 
      !a.isHidden || (a.isHidden && this.unlockedAchievements().includes(a.id))
    )
  );

  displayedAchievements = computed(() => 
    this.isExpanded() ? this.visibleAchievements() : this.visibleAchievements().slice(0, 4)
  );

  toggleExpand() {
    this.isExpanded.set(!this.isExpanded());
  }

  selectBadge(achievement: Achievement) {
    this.selectedBadge.set(achievement);
  }

  isUnlocked(id: string) {
    return this.unlockedAchievements().includes(id);
  }

  getPercent(achievement: Achievement) {
    const progress = achievement.getProgress ? achievement.getProgress({
      reminders: this.store.reminders(),
      streak: this.store.streak()
    }) : (this.isUnlocked(achievement.id) ? (achievement.maxProgress || 1) : 0);
    const max = achievement.maxProgress || 1;
    return Math.min((progress / max) * 100, 100);
  }
}
