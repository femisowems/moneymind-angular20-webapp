import { Component, Input, Output, EventEmitter, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { Achievement } from '../lib/achievements';
import { ModalComponent } from './ui/modal.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-badge-details-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Achievement Details">
      <div *ngIf="achievement" class="flex flex-col items-center justify-center p-6 bg-gray-50 rounded-3xl border border-gray-100 relative overflow-hidden mb-6">
        <div 
          *ngIf="isUnlocked() && achievement.tier === 'platinum'" 
          class="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full"
        ></div>
        <div 
          class="w-28 h-28 rounded-full flex items-center justify-center text-6xl shadow-xl relative z-10 transition-all"
          [ngClass]="isUnlocked() ? 'bg-white filter-none' : 'bg-gray-200 grayscale opacity-60'"
        >
           <span class="drop-shadow-lg">{{ achievement.icon }}</span>
        </div>
        <div class="absolute top-4 right-4 z-10 flex gap-2">
           <span *ngIf="achievement.tier" class="px-2 py-0.5 rounded-full text-xs font-bold uppercase tracking-widest border" [ngClass]="getTierClass(achievement.tier)">
             {{ achievement.tier | titlecase }}
           </span>
        </div>
      </div>

      <div *ngIf="achievement" class="text-center mb-6">
        <h3 class="text-2xl font-black text-gray-900 mb-2 flex items-center justify-center gap-2">
          {{ achievement.title }}
          <i-lucide *ngIf="isUnlocked()" name="check-circle-2" class="w-5 h-5 text-success"></i-lucide>
          <i-lucide *ngIf="!isUnlocked()" name="lock" class="w-5 h-5 text-gray-400"></i-lucide>
        </h3>
        <p class="text-md font-medium text-gray-600 mb-4 px-4">{{ achievement.description }}</p>
        
        <div class="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-bold">
          <i-lucide name="zap" class="w-4 h-4 fill-current"></i-lucide>
          +50 XP Reward
        </div>
      </div>

      <div *ngIf="achievement" class="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
        <div class="flex justify-between items-center mb-3">
          <span class="text-sm font-bold text-gray-500 uppercase tracking-widest">Progress</span>
          <span class="text-sm font-black text-gray-900">{{ progress() }} / {{ max() }}</span>
        </div>
        <div class="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out"
            [ngClass]="isUnlocked() ? 'bg-success' : 'bg-gradient-to-r from-primary to-[#7050ff]'"
            [style.width.%]="percent()"
          ></div>
        </div>
      </div>
    </app-modal>
  `
})
export class BadgeDetailsModalComponent {
  @Input() isOpen = false;
  @Input() achievement: Achievement | null = null;
  @Output() onClose = new EventEmitter<void>();

  private store = inject(StoreService);
  unlockedAchievements = this.store.unlockedAchievements;

  isUnlocked = computed(() => this.achievement ? this.unlockedAchievements().includes(this.achievement.id) : false);
  
  progress = computed(() => {
    if (!this.achievement) return 0;
    if (this.achievement.getProgress) {
       // Mock state for now as getProgress expects the whole state
       return this.achievement.getProgress({
         reminders: this.store.reminders(),
         streak: this.store.streak()
       });
    }
    return this.isUnlocked() ? (this.achievement.maxProgress || 1) : 0;
  });

  max = computed(() => this.achievement?.maxProgress || 1);
  percent = computed(() => Math.min((this.progress() / this.max()) * 100, 100));

  getTierClass(tier: string) {
    switch (tier) {
      case 'platinum': return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case 'gold': return "bg-amber-100 text-amber-800 border-amber-200";
      case 'silver': return "bg-slate-200 text-slate-800 border-slate-300";
      default: return "bg-orange-100 text-orange-800 border-orange-200";
    }
  }
}
