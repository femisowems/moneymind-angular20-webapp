import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { CardComponent } from './ui/card.component';
import { LucideAngularModule } from 'lucide-angular';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-streak-card',
  standalone: true,
  imports: [CommonModule, CardComponent, LucideAngularModule],
  template: `
    <app-card class="p-5 flex flex-col justify-between overflow-hidden relative min-h-[155px]">
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 class="text-gray-500 font-medium text-sm">Current Streak</h3>
          <div class="text-3xl font-bold mt-1 text-gray-900 flex items-center gap-2">
            {{ streak().currentStreak }} <span class="text-lg text-gray-400 font-normal">days</span>
          </div>
        </div>
        <div class="p-3 rounded-full transition-colors" [ngClass]="streak().currentStreak > 0 ? 'bg-orange-100 text-orange-500' : 'bg-gray-100 text-gray-400'">
          <i-lucide name="flame" class="w-6 h-6"></i-lucide>
        </div>
      </div>
      
      <div class="relative z-10">
        <div class="flex justify-between text-xs text-gray-500 mb-2">
          <span>Weekly Goal</span>
          <span>{{ streak().currentStreak }}/7 Days</span>
        </div>
        <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full transition-all duration-1000 ease-out"
            [ngClass]="streak().currentStreak > 0 ? 'bg-gradient-to-r from-orange-400 to-red-500' : 'bg-gray-300'"
            [style.width.%]="progress()"
          ></div>
        </div>
      </div>
      
      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-orange-50 rounded-full blur-2xl z-0"></div>
    </app-card>
  `
})
export class StreakCardComponent {
  private store = inject(StoreService);
  streak = this.store.streak;

  progress = computed(() => Math.min((this.streak().currentStreak / 7) * 100, 100));
}
