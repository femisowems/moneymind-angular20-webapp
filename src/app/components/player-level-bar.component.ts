import { Component, inject, signal, effect, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-player-level-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="bg-white rounded-3xl p-5 sm:p-5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-6 w-full cursor-default group hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-500">
      <div class="flex items-center justify-between sm:justify-start gap-4">
        <div class="flex items-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center text-white font-black text-2xl shadow-lg border-4 border-white transform group-hover:scale-105 transition-transform duration-500">
            {{ score().level }}
          </div>
          <div class="flex flex-col">
            <span class="text-base font-extrabold text-gray-900 tracking-tight leading-tight">Level {{ score().level }}</span>
            <span class="text-xs font-bold text-gray-400 flex items-center gap-1.5 mt-0.5">
              <i-lucide name="zap" class="w-3.5 h-3.5 text-yellow-500 fill-yellow-500"></i-lucide> {{ score().xp }} Total XP
            </span>
          </div>
        </div>

        <!-- Mobile Share (Hidden on Desktop) -->
        <button 
          (click)="openShare()"
          class="flex sm:hidden p-3.5 bg-gray-50 text-gray-400 hover:text-primary active:scale-95 transition-all rounded-2xl"
          title="Share Scorecard"
        >
          <i-lucide name="share-2" class="w-5 h-5"></i-lucide>
        </button>
      </div>

      <!-- Progress Section -->
      <div class="flex-1 flex flex-col gap-2.5">
        <div class="flex justify-between items-end px-0.5">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Current Progress</span>
            <span class="text-xs font-bold text-gray-700">{{ xpIntoLevel() }} <span class="text-gray-400">/ 100 XP</span></span>
          </div>
          <div class="text-right flex flex-col items-end">
            <span class="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-0.5">Next Level</span>
            <span class="text-xs font-bold text-primary">{{ 100 - xpIntoLevel() }} XP to go</span>
          </div>
        </div>
        <div class="w-full h-3.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner relative border border-gray-50/50">
          <div 
            class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-indigo-500 to-indigo-600 rounded-full transition-all duration-1000 ease-out shadow-[0_0_15px_rgba(99,102,241,0.2)]" 
            [style.width.%]="progressPercent()" 
          ></div>
        </div>
      </div>
      
      <!-- Desktop Share (Hidden on Mobile) -->
      <button 
        (click)="openShare()"
        class="hidden sm:flex px-6 py-3.5 rounded-3xl bg-white border border-gray-100/80 hover:border-primary/20 hover:bg-primary/5 text-gray-500 hover:text-primary shadow-sm hover:shadow-md active:scale-95 transition-all duration-300 flex flex-col items-center justify-center shrink-0 min-w-[80px] group/share"
        title="Share Scorecard"
      >
        <div class="relative mb-1">
          <i-lucide name="share-2" class="w-5 h-5 group-hover/share:scale-110 transition-transform"></i-lucide>
          <div class="absolute inset-0 bg-primary/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </div>
        <span class="text-[9px] uppercase tracking-[0.2em] font-black">Share</span>
      </button>

      <!-- Share Modal would be here -->
    </div>
  `
})
export class PlayerLevelBarComponent {
  private store = inject(StoreService);
  score = this.store.score;

  xpIntoLevel = signal(0);
  progressPercent = signal(0);

  constructor() {
    // Update derived values when score changes
    effect(() => {
      const s = this.score();
      const currentLevelXP = (s.level - 1) * 100;
      const xpInto = s.xp - currentLevelXP;
      this.xpIntoLevel.set(xpInto);
      this.progressPercent.set(Math.min((xpInto / 100) * 100, 100));
    });
  }

  @Output() share = new EventEmitter<void>();
  
  openShare() {
    this.share.emit();
  }
}
