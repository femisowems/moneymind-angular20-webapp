import { Component, Input, Output, EventEmitter, PLATFORM_ID, inject, ChangeDetectionStrategy, OnDestroy, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('backdrop', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('200ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0 }))
      ])
    ]),
    trigger('modal', [
      transition(':enter', [
        style({ opacity: 0 }),
        animate('150ms ease-out', style({ opacity: 1 }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0 }))
      ])
    ])
  ],
  template: `
    <div *ngIf="isOpen" class="fixed inset-0 z-50 overflow-hidden">
      <!-- Backdrop -->
      <div 
        @backdrop
        class="fixed inset-0 bg-black/40 backdrop-blur-sm" 
        (click)="onClose.emit()"
      ></div>

      <!-- Modal Content -->
      <div 
        @modal
        class="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-3xl shadow-xl border border-gray-100"
      >
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-xl font-bold">{{ title }}</h2>
          <button 
            (click)="onClose.emit()"
            class="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <i-lucide name="x" class="h-5 w-5"></i-lucide>
          </button>
        </div>
        <ng-content></ng-content>
      </div>
    </div>
  `
})
export class ModalComponent implements OnDestroy {
  @Input() isOpen = false;
  @Input() title = '';
  @Output() onClose = new EventEmitter<void>();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = 'unset';
    }
  }

  // Handle body scroll locking
  ngOnChanges() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    }
  }
}
