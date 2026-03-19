import { Component, Input, Output, EventEmitter, inject, signal, effect, ViewChild, ElementRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { Reminder } from '../types';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { BadgeComponent } from './ui/badge.component';
import { InputComponent } from './ui/input.component';
import { LucideAngularModule } from 'lucide-angular';
import { format, addDays } from 'date-fns';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reminder-details-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, BadgeComponent, InputComponent, LucideAngularModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Reminder Details">
      <div *ngIf="reminder" class="flex flex-col gap-6 pt-2">
        <!-- Header Info -->
        <div class="flex justify-between items-start gap-4">
          <div class="flex-1 min-w-0">
            <div *ngIf="isEditingTitle(); else titleView">
              <input
                appInput
                autoFocus
                class="text-xl font-bold mb-2 p-1 px-2 h-auto"
                [(ngModel)]="editTitle"
                (blur)="handleSaveTitle()"
                (keydown.enter)="handleSaveTitle()"
              />
            </div>
            <ng-template #titleView>
              <h2 
                class="text-xl font-bold text-gray-900 mb-2 truncate cursor-pointer hover:text-primary transition-colors group flex items-center gap-2"
                (click)="isEditingTitle.set(true)"
              >
                {{ reminder.title }}
                <i-lucide name="pencil-line" class="w-4 h-4 text-gray-300 opacity-0 group-hover:opacity-100"></i-lucide>
              </h2>
            </ng-template>

            <div class="flex flex-wrap items-center gap-2 mt-1">
              <div *ngIf="isEditingCategory(); else categoryView">
                <select
                  class="text-xs font-semibold px-2 py-1 rounded-full border border-primary outline-none bg-white text-gray-900 cursor-pointer shadow-sm"
                  [(ngModel)]="editCategory"
                  (change)="handleSaveCategory()"
                  (blur)="isEditingCategory.set(false)"
                >
                  <option *ngFor="let c of categories()" [value]="c.id">{{ c.name }}</option>
                </select>
              </div>
              <ng-template #categoryView>
                <div (click)="isEditingCategory.set(true)" class="cursor-pointer hover:opacity-80 transition-opacity">
                  <app-badge [variant]="getCategoryColor()">{{ getCategoryName() }}</app-badge>
                </div>
              </ng-template>
              <app-badge *ngIf="reminder.autoPay" variant="info">Auto-Pay Active</app-badge>
              <app-badge *ngIf="reminder.isCompleted" variant="success">Completed</app-badge>
            </div>
          </div>
          
          <div class="text-right shrink-0">
            <span class="block text-xs text-gray-500 font-medium uppercase tracking-wider mb-1">Amount</span>
            <div *ngIf="isEditingAmount(); else amountView">
              <input
                appInput
                type="number"
                class="w-24 text-right font-bold p-1 px-2 h-auto border-primary"
                [(ngModel)]="editAmount"
                (blur)="handleSaveAmount()"
                (keydown.enter)="handleSaveAmount()"
              />
            </div>
            <ng-template #amountView>
              <span 
                class="text-2xl font-bold text-foreground flex items-center justify-end cursor-pointer hover:text-primary group"
                (click)="isEditingAmount.set(true)"
              >
                <ng-container *ngIf="reminder.amount; else noAmount">
                  <i-lucide name="dollar-sign" class="w-5 h-5 text-gray-400 group-hover:text-primary/50"></i-lucide>
                  {{ reminder.amount | number:'1.2-2' }}
                </ng-container>
                <ng-template #noAmount>
                  <span class="text-sm font-normal text-gray-400 border border-dashed border-gray-300 rounded px-2 hover:border-primary">Set Amount</span>
                </ng-template>
              </span>
            </ng-template>
          </div>
        </div>

        <!-- Detailed Stats Grid -->
        <div class="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <i-lucide name="calendar" class="w-4 h-4"></i-lucide> Due Date
            </span>
            <span class="text-sm font-medium text-gray-900">
              {{ reminder.dueDate | date:'EEEE, MMM d, yyyy' }}
            </span>
            <div *ngIf="!reminder.isCompleted" class="flex gap-2 mt-2">
              <button (click)="handleSnooze(1)" class="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                +1 Day
              </button>
              <button (click)="handleSnooze(3)" class="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                +3 Days
              </button>
              <button (click)="handleSnooze(7)" class="text-[10px] bg-white border border-gray-200 hover:border-primary/50 text-gray-600 px-2 py-1 rounded shadow-sm transition-colors">
                Next Week
              </button>
            </div>
          </div>
          
          <div>
            <span class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
              <i-lucide name="repeat" class="w-4 h-4"></i-lucide> Recurring
            </span>
            <span class="text-sm font-medium text-gray-900 capitalize">
              {{ reminder.recurring }}
            </span>
          </div>
        </div>

        <!-- SubTasks Checklist -->
        <div class="flex flex-col gap-3">
          <div class="flex justify-between items-center mb-1">
            <span class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
              <i-lucide name="check-square" class="w-4 h-4"></i-lucide> Checklist ({{ completedSubTasks() }}/{{ subTasks().length }})
            </span>
          </div>
          
          <div *ngIf="subTasks().length > 0" class="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mb-1">
            <div 
              class="h-full bg-primary transition-all duration-300"
              [style.width.%]="subTaskProgress()"
            ></div>
          </div>

          <div class="flex flex-col gap-2">
            <div *ngFor="let st of subTasks()" class="flex items-center justify-between group bg-white border border-gray-100 p-2 rounded-xl shadow-sm hover:border-primary/30 transition-colors">
              <div 
                class="flex items-center gap-3 cursor-pointer flex-1"
                (click)="handleToggleSubTask(st.id)"
              >
                <input 
                  type="checkbox" 
                  [checked]="st.isCompleted" 
                  class="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary ml-1"
                />
                <span class="text-sm select-none transition-colors" [ngClass]="{'text-gray-400 line-through': st.isCompleted, 'text-gray-700': !st.isCompleted}">
                  {{ st.title }}
                </span>
              </div>
              <button 
                (click)="handleDeleteSubTask(st.id)"
                class="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-opacity p-1"
              >
                <i-lucide name="x" class="w-4 h-4"></i-lucide>
              </button>
            </div>
            
            <div class="flex items-center gap-2 mt-1">
              <input 
                appInput
                placeholder="Add new step..."
                [(ngModel)]="newSubTask"
                (keydown.enter)="handleAddSubTask()"
                class="h-9 text-sm flex-1 bg-gray-50 border-gray-100"
              />
              <button appButton size="icon" (click)="handleAddSubTask()" variant="secondary" class="h-9 w-9 shrink-0 shadow-none">
                <i-lucide name="plus" class="w-4 h-4"></i-lucide>
              </button>
            </div>
          </div>
        </div>

        <!-- Notes -->
        <div>
          <span class="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            <i-lucide name="message-square" class="w-4 h-4"></i-lucide> Notes
          </span>
          <div *ngIf="isEditingNotes(); else notesView">
            <textarea
              appInput
              autoFocus
              class="min-h-[80px]"
              [(ngModel)]="editNotes"
              (blur)="handleSaveNotes()"
            ></textarea>
          </div>
          <ng-template #notesView>
            <p 
              (click)="isEditingNotes.set(true)"
              class="text-sm bg-white border border-gray-200 p-3 rounded-xl whitespace-pre-wrap leading-relaxed shadow-sm cursor-pointer hover:border-primary/50 group transition-colors min-h-[48px]"
              [ngClass]="{'text-gray-400 italic': !reminder.notes, 'text-gray-700': reminder.notes}"
            >
              {{ reminder.notes || "Click to add a note..." }}
            </p>
          </ng-template>
        </div>

        <div class="mt-4 flex justify-end">
          <button appButton (click)="onClose.emit()" variant="secondary">Close</button>
        </div>
      </div>
    </app-modal>
  `
})
export class ReminderDetailsModalComponent {
  @Input() isOpen = false;
  @Input() reminder: Reminder | null = null;
  @Output() onClose = new EventEmitter<void>();

  private store = inject(StoreService);
  categories = this.store.categories;

  isEditingTitle = signal(false);
  editTitle = '';

  isEditingAmount = signal(false);
  editAmount = '';

  isEditingNotes = signal(false);
  editNotes = '';

  isEditingCategory = signal(false);
  editCategory = '';

  newSubTask = '';

  subTasks = signal<any[]>([]);
  completedSubTasks = signal(0);
  subTaskProgress = signal(0);

  constructor() {
    effect(() => {
      const r = this.reminder;
      if (r) {
        this.editTitle = r.title;
        this.editAmount = r.amount?.toString() || '';
        this.editNotes = r.notes || '';
        this.editCategory = r.category;
        
        const tasks = r.subTasks || [];
        this.subTasks.set(tasks);
        const completed = tasks.filter((t: any) => t.isCompleted).length;
        this.completedSubTasks.set(completed);
        this.subTaskProgress.set(tasks.length > 0 ? (completed / tasks.length) * 100 : 0);
      }
    });
  }

  getCategoryData() {
    return this.categories().find(c => c.id === this.reminder?.category) || { name: 'Unknown', color: 'neutral' };
  }

  getCategoryColor() {
    return this.getCategoryData().color as any;
  }

  getCategoryName() {
    return this.getCategoryData().name;
  }

  handleSaveTitle() {
    if (this.reminder && this.editTitle.trim() && this.editTitle !== this.reminder.title) {
      this.store.updateReminder(this.reminder.id, { title: this.editTitle.trim() });
    }
    this.isEditingTitle.set(false);
  }

  handleSaveAmount() {
    if (!this.reminder) return;
    const parsed = parseFloat(this.editAmount);
    if (!isNaN(parsed) && parsed !== this.reminder.amount) {
      this.store.updateReminder(this.reminder.id, { amount: parsed });
    } else if (this.editAmount === '') {
      this.store.updateReminder(this.reminder.id, { amount: undefined });
    }
    this.isEditingAmount.set(false);
  }

  handleSaveNotes() {
    if (this.reminder && this.editNotes.trim() !== (this.reminder.notes || '')) {
      this.store.updateReminder(this.reminder.id, { notes: this.editNotes.trim() || undefined });
    }
    this.isEditingNotes.set(false);
  }

  handleSaveCategory() {
    if (this.reminder) {
      this.store.updateReminder(this.reminder.id, { category: this.editCategory });
    }
    this.isEditingCategory.set(false);
  }

  handleSnooze(days: number) {
    if (this.reminder) {
      const newDate = addDays(new Date(this.reminder.dueDate), days);
      this.store.updateReminder(this.reminder.id, { dueDate: newDate.toISOString() });
    }
  }

  handleAddSubTask() {
    if (!this.reminder || !this.newSubTask.trim()) return;
    const currentList = this.reminder.subTasks || [];
    this.store.updateReminder(this.reminder.id, { 
      subTasks: [...currentList, { id: crypto.randomUUID(), title: this.newSubTask.trim(), isCompleted: false }] 
    });
    this.newSubTask = '';
  }

  handleToggleSubTask(subId: string) {
    if (!this.reminder) return;
    const list = this.reminder.subTasks || [];
    this.store.updateReminder(this.reminder.id, {
      subTasks: list.map(st => st.id === subId ? { ...st, isCompleted: !st.isCompleted } : st)
    });
  }

  handleDeleteSubTask(subId: string) {
    if (!this.reminder) return;
    const list = this.reminder.subTasks || [];
    this.store.updateReminder(this.reminder.id, {
      subTasks: list.filter(st => st.id !== subId)
    });
  }
}
