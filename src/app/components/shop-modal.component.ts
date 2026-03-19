import { Component, Input, Output, EventEmitter, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { StoreService } from '../services/store.service';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-shop-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('statusFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(10px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(5px)' }))
      ])
    ])
  ],
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Rewards Shop">
      <div class="flex flex-col gap-6 pt-2">
        <!-- Balance Card -->
        <div class="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden flex items-center justify-between">
           <div class="absolute -top-10 -right-10 w-40 h-40 bg-white/10 blur-3xl rounded-full"></div>
           <div class="relative z-10 flex flex-col">
             <span class="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1">Available Balance</span>
             <span class="text-4xl font-black flex items-center gap-2">
               {{ score().xp }} <span class="text-xl font-bold text-indigo-200 uppercase tracking-widest mt-1">XP</span>
             </span>
           </div>
           <i-lucide name="store" class="w-12 h-12 text-white/20 absolute right-6 z-0"></i-lucide>
        </div>

        <div class="flex flex-col gap-4">
          <h3 class="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
            <i-lucide name="zap" class="w-4 h-4"></i-lucide> Power-Ups
          </h3>
          
          <!-- Item Card -->
          <div class="bg-white border border-gray-200 rounded-3xl p-5 hover:border-primary/50 hover:shadow-md transition-all">
            <div class="flex items-start justify-between">
              <div class="flex gap-4">
                <div class="w-14 h-14 rounded-2xl bg-cyan-50 flex items-center justify-center text-cyan-500 border border-cyan-100 shadow-sm shrink-0">
                  <i-lucide name="snowflake" class="w-7 h-7"></i-lucide>
                </div>
                <div class="flex flex-col">
                  <h4 class="font-bold text-gray-900 text-lg flex items-center gap-2">
                    Streak Freeze
                    <span *ngIf="inventory().streakFreezes > 0" class="text-[10px] bg-cyan-100 text-cyan-700 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <i-lucide name="shield-check" class="w-3 h-3"></i-lucide> {{ inventory().streakFreezes }} Active
                    </span>
                  </h4>
                  <p class="text-sm font-medium text-gray-500 mt-1">Protect your hard-earned streak! If you forget to log a task for incredibly busy days, this freeze automatically consumes itself to stop your streak from resetting to zero.</p>
                </div>
              </div>
            </div>
            
            <div class="mt-5 flex items-center justify-between border-t border-gray-100 pt-5">
               <span class="text-xl font-black text-gray-900 flex items-center gap-1.5">
                 500 <span class="text-sm font-bold text-gray-400 uppercase tracking-widest">XP</span>
               </span>
               <button 
                 appButton
                 (click)="handlePurchase('streakFreeze', 500)"
                 [disabled]="score().xp < 500"
                 class="shadow-md hover:shadow-lg transition-transform hover:-translate-y-0.5 px-6"
               >
                 Purchase
               </button>
            </div>
          </div>
        </div>

        <!-- Purchase Status Notification -->
        <div 
          *ngIf="purchaseStatus()" 
          @statusFade
          [ngClass]="{
            'bg-success/10 text-success border-success/20': purchaseStatus()?.includes('successful'),
            'bg-danger/10 text-danger border-danger/20': !purchaseStatus()?.includes('successful')
          }"
          class="p-3 rounded-xl text-center text-sm font-bold border"
        >
          {{ purchaseStatus() }}
        </div>
      </div>
    </app-modal>
  `
})
export class ShopModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  private store = inject(StoreService);
  score = this.store.score;
  inventory = this.store.inventory;

  purchaseStatus = signal<string | null>(null);

  handlePurchase(item: 'streakFreeze', cost: number) {
    const success = this.store.purchaseItem(item, cost);
    if (success) {
      this.purchaseStatus.set("Purchase successful! Streak protected. 🛡️");
    } else {
      this.purchaseStatus.set("Not enough XP to make this purchase.");
    }
    setTimeout(() => this.purchaseStatus.set(null), 3000);
  }
}
