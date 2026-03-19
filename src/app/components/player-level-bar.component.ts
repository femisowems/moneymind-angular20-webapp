import { Component, inject, signal, effect, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from './ui/button.component';

@Component({
  selector: 'app-player-level-bar',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, ButtonComponent],
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

        <button 
          appButton
          variant="ghost"
          (click)="openShare()"
          class="sm:hidden p-3 rounded-2xl"
          title="Share Scorecard"
        >
          <i-lucide name="share-2" class="w-5 h-5"></i-lucide>
        </button>
      </div>

      <div class="flex-1 flex flex-col gap-2.5">
        <div class="flex justify-between items-end px-0.5">
          <div class="flex flex-col">
            <span class="text-[10px] font-black text-gray-400 uppercase tracking-[0.15em] mb-0.5">Progress</span>
            <span class="text-xs font-bold text-gray-700">{{ xpIntoLevel() }} <span class="text-gray-400">/ 100 XP</span></span>
          </div>
          <div class="text-right flex flex-col items-end">
            <span class="text-[10px] font-black text-primary/60 uppercase tracking-[0.15em] mb-0.5">Next Level</span>
            <span class="text-xs font-bold text-primary">{{ 100 - xpIntoLevel() }} XP to go</span>
          </div>
        </div>
        <div class="w-full h-3.5 bg-gray-100/80 rounded-full overflow-hidden shadow-inner relative border border-gray-50">
          <div 
            class="absolute top-0 left-0 h-full bg-gradient-to-r from-primary via-primary-hover to-[#7050ff] rounded-full transition-all duration-1000 ease-out shadow-[0_0_12px_rgba(109,80,245,0.3)]" 
            [style.width.%]="progressPercent()" 
          ></div>
        </div>
      </div>
      
      <button 
        appButton
        variant="secondary"
        (click)="openShare()"
        class="hidden sm:flex px-4 py-3 rounded-2xl flex-col items-center justify-center shrink-0 min-w-[72px]"
        title="Share Scorecard"
      >
        <i-lucide name="share-2" class="w-5 h-5 mb-1"></i-lucide>
        <span class="text-[10px] uppercase tracking-widest font-black">Share</span>
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
