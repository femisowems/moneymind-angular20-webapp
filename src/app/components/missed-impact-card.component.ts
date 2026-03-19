import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { CardComponent } from './ui/card.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-missed-impact-card',
  standalone: true,
  imports: [CommonModule, CardComponent, LucideAngularModule],
  template: `
    <app-card class="p-5 flex flex-col justify-between overflow-hidden relative border-danger/20 min-h-[155px]">
      <div class="flex justify-between items-start mb-2 relative z-10">
        <div>
          <h3 class="text-gray-500 font-medium text-sm flex items-center gap-1.5">
            <i-lucide name="trending-down" class="w-4 h-4"></i-lucide>
            Missed Impact
          </h3>
          <div class="text-3xl font-bold mt-1 text-gray-900 flex items-center gap-1.5">
            <span class="text-xl text-gray-400 font-normal">$</span>
            {{ wastedMoney() | number:'1.2-2' }}
          </div>
        </div>
        <div class="p-2.5 rounded-full bg-danger/10 text-danger shadow-sm">
          <span class="text-xl">💸</span>
        </div>
      </div>
      
      <div class="relative z-10">
        <p class="text-xs text-gray-500 leading-relaxed max-w-[90%]">
          {{ wastedMoney() > 0 
            ? "Money wasted on late fees. Try to complete pending bills on time!" 
            : "You've saved 100% of potential late fees. Great job!" }}
        </p>
      </div>
      
      <!-- Decorative background circle -->
      <div class="absolute -bottom-10 -right-10 w-32 h-32 bg-danger/5 rounded-full blur-2xl z-0"></div>
    </app-card>
  `
})
export class MissedImpactCardComponent {
  private store = inject(StoreService);
  reminders = this.store.reminders;

  wastedMoney = computed(() => {
    const todayStr = new Date().toISOString().substring(0, 10);
    return this.reminders().reduce((total, r) => {
      const dueStr = r.dueDate.substring(0, 10);
      if (!r.isCompleted && dueStr < todayStr && r.lateFee) {
        return total + r.lateFee;
      }
      return total;
    }, 0);
  });
}
