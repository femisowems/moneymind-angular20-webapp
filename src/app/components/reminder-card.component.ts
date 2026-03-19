import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { Reminder } from '../types';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { BadgeComponent } from './ui/badge.component';
import { LucideAngularModule } from 'lucide-angular';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

@Component({
  selector: 'app-reminder-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent, BadgeComponent, LucideAngularModule],
  template: `
    <div class="relative group">
      <!-- Background for swipe actions (simplified as a static hover state for now) -->
      <div class="absolute inset-0 rounded-2xl flex items-center justify-between px-6 bg-gray-50 -z-10 transition-opacity opacity-0 group-hover:opacity-100">
        <div class="flex flex-col items-center justify-center" [ngClass]="isDeletedItem ? 'text-primary/80' : 'text-success/80'">
          <i-lucide [name]="isDeletedItem ? 'refresh-ccw' : 'check'" class="w-6 h-6 mb-1"></i-lucide>
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ isDeletedItem ? 'Restore' : 'Complete' }}</span>
        </div>
        <div class="flex flex-col items-center justify-center text-danger/80">
          <i-lucide name="trash-2" class="w-6 h-6 mb-1"></i-lucide>
          <span class="text-[10px] font-bold uppercase tracking-wider">{{ isDeletedItem ? 'Delete' : 'Delete' }}</span>
        </div>
      </div>

      <div 
        class="z-10 bg-white rounded-2xl transition-transform"
        [ngClass]="{'opacity-75 grayscale-[0.5]': isDeletedItem}"
      >
        <div 
          (click)="onOpenDetails()"
          class="p-4 rounded-2xl border border-gray-100 transition-all hover:shadow-md group relative overflow-hidden cursor-pointer"
          [ngClass]="{
            'opacity-60 bg-gray-50': reminder.isCompleted,
            'bg-white': !reminder.isCompleted,
            'border-danger/30 bg-danger/5': isOverdue()
          }"
        >
          <div *ngIf="isOverdue()" class="absolute top-0 left-0 w-1 h-full bg-danger"></div>
          <div *ngIf="reminder.isCompleted" class="absolute top-0 left-0 w-1 h-full bg-success"></div>
          
          <div class="flex items-start gap-4">
            <button
              (click)="onToggle($event)"
              class="mt-0.5 flex-shrink-0 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all active:scale-95"
              [ngClass]="reminder.isCompleted ? 'bg-success border-success text-white' : 'border-gray-300 hover:border-primary text-transparent hover:text-primary/20 bg-white'"
            >
              <i-lucide [name]="isDeletedItem ? 'refresh-ccw' : 'check'" [class]="isDeletedItem ? 'h-3.5 w-3.5 text-primary' : 'h-4 w-4'"></i-lucide>
            </button>
            
            <div class="flex-1 min-w-0">
              <div class="flex items-start justify-between gap-2">
                <h3 class="font-semibold truncate text-base" [ngClass]="{'line-through text-gray-500': reminder.isCompleted}">
                  {{ reminder.title }}
                </h3>
                <span *ngIf="reminder.amount" class="font-bold text-gray-900 shrink-0">
                  \${{ reminder.amount | number:'1.2-2' }}
                </span>
              </div>
              
              <div class="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
                <app-badge [variant]="getCategoryColor()">
                  {{ getCategoryName() }}
                </app-badge>
                
                <div class="flex items-center gap-1" [ngClass]="{'text-danger font-medium': isOverdue()}">
                  <i-lucide [name]="isOverdue() ? 'alert-circle' : 'clock'" class="h-3.5 w-3.5"></i-lucide>
                  <span>{{ reminder.dueDate | date:'MMM d, yyyy' }}</span>
                </div>
                
                <span *ngIf="reminder.recurring !== 'none'" class="capitalize px-1.5 py-0.5 rounded-md bg-gray-100 text-gray-600">
                  ↻ {{ reminder.recurring }}
                </span>
              </div>
            </div>
            
            <button 
              appButton 
              variant="ghost" 
              size="icon" 
              (click)="onDelete($event)"
              class="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-danger hover:bg-danger/10 -mt-1 -mr-1"
            >
              <i-lucide name="trash-2" class="h-4 w-4"></i-lucide>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ReminderCardComponent {
  @Input({ required: true }) reminder!: Reminder;
  @Input() isDeletedItem = false;
  @Output() openDetails = new EventEmitter<Reminder>();

  private store = inject(StoreService);

  isOverdue() {
    const today = new Date().toISOString().substring(0, 10);
    const due = this.reminder.dueDate.substring(0, 10);
    return due < today && !this.reminder.isCompleted;
  }

  getCategoryData() {
    return this.store.categories().find(c => c.id === this.reminder.category) || { name: 'Unknown', color: 'neutral' };
  }

  getCategoryColor() {
    return this.getCategoryData().color as any;
  }

  getCategoryName() {
    return this.getCategoryData().name;
  }

  onToggle(event: MouseEvent) {
    event.stopPropagation();
    if (this.isDeletedItem) {
      this.store.restoreReminder(this.reminder.id);
    } else {
      this.store.toggleReminder(this.reminder.id);
    }
  }

  onDelete(event: MouseEvent) {
    event.stopPropagation();
    if (this.isDeletedItem) {
      this.store.permanentDelete(this.reminder.id);
    } else {
      this.store.deleteReminder(this.reminder.id);
    }
  }

  onOpenDetails() {
    this.openDetails.emit(this.reminder);
  }
}
