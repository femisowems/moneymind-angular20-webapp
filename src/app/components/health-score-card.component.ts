import { Component, inject, signal, effect, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { CardComponent } from './ui/card.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-health-score-card',
  standalone: true,
  imports: [CommonModule, CardComponent, LucideAngularModule],
  template: `
    <app-card class="p-5 flex flex-col justify-between overflow-hidden relative min-h-[155px]">
      <div class="flex justify-between items-start mb-4 relative z-10">
        <div>
          <h3 class="text-gray-500 font-medium text-sm">Financial Health</h3>
          <div class="text-3xl font-bold mt-1 text-gray-900 flex items-center gap-2">
            {{ displayScore() }}<span class="text-lg text-gray-400 font-normal">%</span>
          </div>
        </div>
        <div class="p-3 rounded-full transition-colors" [ngClass]="getColor()">
          <i-lucide name="activity" class="w-6 h-6"></i-lucide>
        </div>
      </div>
      
      <div class="relative z-10">
        <div class="flex justify-between text-xs font-semibold mb-2">
          <span class="text-gray-500">Status</span>
          <span [ngClass]="getTextColor()">{{ score().label }}</span>
        </div>
        <div class="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
          <div 
            class="h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out"
            [ngClass]="getGradient()"
            [style.width.%]="score().value"
          ></div>
        </div>
      </div>

      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-blue-50 rounded-full blur-2xl z-0"></div>
    </app-card>
  `
})
export class HealthScoreCardComponent {
  private store = inject(StoreService);
  score = this.store.score;
  displayScore = signal(0);

  constructor() {
    effect(() => {
      // Re-calculate when reminders or streak changes (StoreService handles this internally now)
      // but we animate the displayScore
      this.animateScore(this.score().value);
    });
  }

  private animateScore(target: number) {
    const start = this.displayScore();
    const duration = 1000;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const current = Math.floor(start + (target - start) * progress);
      this.displayScore.set(current);

      if (currentStep >= steps) {
        this.displayScore.set(target);
        clearInterval(interval);
      }
    }, stepTime);
  }

  getColor() {
    if (this.score().value >= 80) return "text-success bg-success/10";
    if (this.score().value >= 50) return "text-warning bg-warning/10";
    return "text-danger bg-danger/10";
  }

  getTextColor() {
    if (this.score().value >= 80) return "text-success";
    if (this.score().value >= 50) return "text-warning";
    return "text-danger";
  }
  
  getGradient() {
    if (this.score().value >= 80) return "from-emerald-400 to-emerald-600";
    if (this.score().value >= 50) return "from-yellow-400 to-orange-500";
    return "from-red-400 to-red-600";
  }
}
