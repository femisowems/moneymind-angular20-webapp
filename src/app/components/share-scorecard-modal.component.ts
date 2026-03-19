import { Component, Input, Output, EventEmitter, ElementRef, ViewChild, inject, signal, effect, PLATFORM_ID, Inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { StoreService } from '../services/store.service';
import { ACHIEVEMENTS } from '../lib/achievements';
import html2canvas from 'html2canvas';
import { format } from 'date-fns';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-share-scorecard-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Share Your Progress">
      <div class="flex flex-col gap-6 pt-2">
        <p class="text-sm text-gray-500 text-center">
          Show off your financial consistency! Download this scorecard and share it with your friends.
        </p>

        <!-- The Card to be captured -->
        <div class="flex justify-center">
          <div 
            #cardRef
            class="w-full max-w-sm bg-gradient-to-br from-primary via-[#6d50f5] to-[#4527d4] p-6 rounded-3xl text-white shadow-xl relative overflow-hidden"
          >
            <!-- Decorative background elements -->
            <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-12 translate-x-12"></div>
            <div class="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full blur-xl translate-y-8 -translate-x-8"></div>
            
            <div class="relative z-10 flex flex-col items-center">
              <h1 class="text-2xl font-black italic tracking-tight mb-1 text-white">MoneyMind</h1>
              <span class="text-primary-100/80 text-xs font-semibold uppercase tracking-widest mb-6">Financial Scorecard</span>
              
              <div class="bg-white/10 backdrop-blur-md rounded-2xl p-5 w-full flex flex-col items-center border border-white/20 mb-6">
                <span class="text-xs font-bold text-white/70 uppercase tracking-wider mb-2">Health Score</span>
                <span class="text-5xl font-black mb-1 drop-shadow-md">{{ score().value }}</span>
                <span class="text-sm font-semibold bg-white/20 px-3 py-1 rounded-full">{{ score().label }}</span>
              </div>

              <div class="grid grid-cols-2 gap-3 w-full mb-6">
                <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span class="text-xs text-white/70 mb-1">Level</span>
                  <span class="text-xl font-bold">{{ score().level }}</span>
                </div>
                <div class="bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span class="text-xs text-white/70 mb-1">XP Base</span>
                  <span class="text-xl font-bold">{{ score().xp }}</span>
                </div>
                <div class="col-span-2 bg-white/10 backdrop-blur-md rounded-xl p-3 flex flex-col items-center border border-white/10">
                  <span class="text-xs text-white/70 mb-1">Longest Streak</span>
                  <span class="text-xl font-bold">{{ streak().longestStreak }} Days</span>
                </div>
              </div>

              <div *ngIf="unlockedList().length > 0" class="w-full">
                <span class="text-xs font-bold text-white/70 uppercase tracking-wider mb-2 block text-center">Top Badges</span>
                <div class="flex justify-center gap-2 flex-wrap">
                  <div *ngFor="let ach of unlockedList().slice(0, 5)" class="w-8 h-8 flex items-center justify-center bg-white/20 rounded-full text-lg shadow-sm border border-white/30">
                    {{ ach.icon }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3 mt-2">
          <button appButton variant="ghost" (click)="onClose.emit()" [disabled]="isCapturing()">Cancel</button>
          <button appButton (click)="handleDownload()" [disabled]="isCapturing()" class="bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/30">
            <i-lucide *ngIf="!isCapturing()" name="download" class="w-5 h-5 mr-2"></i-lucide>
            <i-lucide *ngIf="isCapturing()" name="loader-2" class="w-5 h-5 animate-spin mr-2"></i-lucide>
            Download PNG
          </button>
        </div>
      </div>
    </app-modal>
  `
})
export class ShareScorecardModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();
  @ViewChild('cardRef') cardRef!: ElementRef;

  private platformId = inject(PLATFORM_ID);
  private store = inject(StoreService);
  score = this.store.score;
  streak = this.store.streak;
  unlockedAchievements = this.store.unlockedAchievements;

  isCapturing = signal(false);

  unlockedList = signal(ACHIEVEMENTS.filter(a => this.unlockedAchievements().includes(a.id)));

  constructor() {
    // Update unlockedList when unlockedAchievements changes
    effect(() => {
      this.unlockedList.set(ACHIEVEMENTS.filter(a => this.unlockedAchievements().includes(a.id)));
    });
  }

  async handleDownload() {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.cardRef) return;
    try {
      this.isCapturing.set(true);
      const canvas = await html2canvas(this.cardRef.nativeElement, { 
        scale: 2, 
        backgroundColor: null,
        logging: false 
      });
      const dataUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `MoneyMind-Scorecard-${format(new Date(), 'yyyy-MM-dd')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Failed to capture scorecard:", error);
    } finally {
      this.isCapturing.set(false);
      this.onClose.emit();
    }
  }
}
