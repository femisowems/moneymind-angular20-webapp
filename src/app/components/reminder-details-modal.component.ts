import { Component, Input, Output, EventEmitter, inject, signal, effect, ViewChild, ElementRef, ChangeDetectionStrategy, computed, input } from '@angular/core';
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
      <div *ngIf="reminder()" class="flex flex-col gap-6 pt-2">
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
                {{ reminder()?.title }}
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
               <app-badge *ngIf="reminder()?.autoPay" variant="info">Auto-Pay Active</app-badge>
              <app-badge *ngIf="reminder()?.isCompleted" variant="success">Completed</app-badge>
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
                <ng-container *ngIf="reminder()?.amount; else noAmount">
                  <i-lucide name="dollar-sign" class="w-5 h-5 text-gray-400 group-hover:text-primary/50"></i-lucide>
                  {{ reminder()?.amount | number:'1.2-2' }}
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
              {{ reminder()?.dueDate | date:'EEEE, MMM d, yyyy' }}
            </span>
            <div *ngIf="!reminder()?.isCompleted" class="flex gap-2 mt-2">
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
              {{ reminder()?.recurring }}
            </span>
          </div>
        </div>

        <!-- SubTasks Checklist -->
        <div class="flex flex-col gap-4">
          <div class="flex justify-between items-center mb-0.5">
            <span class="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
              <i-lucide name="list-checks" class="w-3.5 h-3.5 text-primary"></i-lucide> Checklist ({{ completedSubTasks() }}/{{ subTasks().length }})
            </span>
          </div>
          
          <div *ngIf="subTasks().length > 0" class="w-full h-2 bg-gray-100 rounded-full overflow-hidden -mt-1 shadow-inner">
            <div 
              class="h-full bg-gradient-to-r from-primary to-[#818cf8] transition-all duration-500 ease-out rounded-full"
              [style.width.%]="subTaskProgress()"
            ></div>
          </div>

          <div class="flex flex-col gap-2.5">
            <div *ngFor="let st of subTasks()" class="flex items-center justify-between group bg-white border border-gray-100 p-3 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <div 
                class="flex items-center gap-3.5 cursor-pointer flex-1"
                (click)="handleToggleSubTask(st.id)"
              >
                <div class="relative flex items-center justify-center">
                   <input 
                    type="checkbox" 
                    [checked]="st.isCompleted" 
                    class="peer appearance-none w-5 h-5 border-2 border-gray-200 rounded-lg checked:bg-primary checked:border-primary transition-all cursor-pointer"
                  />
                  <i-lucide name="check" class="absolute w-3.5 h-3.5 text-white opacity-0 peer-checked:opacity-100 scale-50 peer-checked:scale-100 transition-all pointer-events-none"></i-lucide>
                </div>
                <span class="text-sm font-medium select-none transition-all" [ngClass]="{'text-gray-400 line-through': st.isCompleted, 'text-gray-700': !st.isCompleted}">
                  {{ st.title }}
                </span>
              </div>
              <button 
                (click)="handleDeleteSubTask(st.id)"
                class="text-gray-300 hover:text-danger opacity-0 group-hover:opacity-100 transition-all p-1.5 hover:bg-danger/5 rounded-full"
              >
                <i-lucide name="trash-2" class="w-4 h-4"></i-lucide>
              </button>
            </div>
            
            <div class="flex items-center gap-3 mt-2 group/input">
              <div class="relative flex-1">
                <input 
                  appInput
                  placeholder="What needs to be done?"
                  [(ngModel)]="newSubTask"
                  (keydown.enter)="handleAddSubTask()"
                  class="h-11 text-sm pl-4 pr-4 bg-white border-gray-200 rounded-2xl shadow-sm focus:border-primary/40 focus:ring-4 focus:ring-primary/5 transition-all w-full"
                />
              </div>
              <button 
                (click)="handleAddSubTask()" 
                class="h-11 w-11 shrink-0 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-lg shadow-primary/20 hover:shadow-primary/30 active:scale-95 transition-all flex items-center justify-center group/btn"
              >
                <i-lucide name="plus" class="w-5 h-5 group-hover/btn:rotate-90 transition-transform duration-300"></i-lucide>
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
              [ngClass]="{'text-gray-400 italic': !reminder()?.notes, 'text-gray-700': reminder()?.notes}"
            >
              {{ reminder()?.notes || "Click to add a note..." }}
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
  reminder = input<Reminder | null>(null);
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

  subTasks = computed(() => this.reminder()?.subTasks || []);
  completedSubTasks = computed(() => this.subTasks().filter((t: any) => t.isCompleted).length);
  subTaskProgress = computed(() => {
    const tasks = this.subTasks();
    if (tasks.length === 0) return 0;
    return (this.completedSubTasks() / tasks.length) * 100;
  });

  constructor() {
    effect(() => {
      const r = this.reminder();
      if (r) {
        this.editTitle = r.title;
        this.editAmount = r.amount?.toString() || '';
        this.editNotes = r.notes || '';
        this.editCategory = r.category;
      }
    });
  }

  getCategoryData() {
    return this.categories().find(c => c.id === this.reminder()?.category) || { name: 'Unknown', color: 'neutral' };
  }

  getCategoryColor() {
    return this.getCategoryData().color as any;
  }

  getCategoryName() {
    return this.getCategoryData().name;
  }

  handleSaveTitle() {
    const r = this.reminder();
    if (r && this.editTitle.trim() && this.editTitle !== r.title) {
      this.store.updateReminder(r.id, { title: this.editTitle.trim() });
    }
    this.isEditingTitle.set(false);
  }

  handleSaveAmount() {
    const r = this.reminder();
    if (!r) return;
    const parsed = parseFloat(this.editAmount);
    if (!isNaN(parsed) && parsed !== r.amount) {
      this.store.updateReminder(r.id, { amount: parsed });
    } else if (this.editAmount === '') {
      this.store.updateReminder(r.id, { amount: undefined });
    }
    this.isEditingAmount.set(false);
  }

  handleSaveNotes() {
    const r = this.reminder();
    if (r && this.editNotes.trim() !== (r.notes || '')) {
      this.store.updateReminder(r.id, { notes: this.editNotes.trim() || undefined });
    }
    this.isEditingNotes.set(false);
  }

  handleSaveCategory() {
    const r = this.reminder();
    if (r) {
      this.store.updateReminder(r.id, { category: this.editCategory });
    }
    this.isEditingCategory.set(false);
  }

  handleSnooze(days: number) {
    const r = this.reminder();
    if (r) {
      const newDate = addDays(new Date(r.dueDate), days);
      this.store.updateReminder(r.id, { dueDate: newDate.toISOString() });
    }
  }

  handleAddSubTask() {
    const r = this.reminder();
    if (!r || !this.newSubTask.trim()) return;
    const currentList = r.subTasks || [];
    this.store.updateReminder(r.id, { 
      subTasks: [...currentList, { id: crypto.randomUUID(), title: this.newSubTask.trim(), isCompleted: false }] 
    });
    this.newSubTask = '';
  }

  handleToggleSubTask(subId: string) {
    const r = this.reminder();
    if (!r) return;
    const list = r.subTasks || [];
    this.store.updateReminder(r.id, {
      subTasks: list.map(st => st.id === subId ? { ...st, isCompleted: !st.isCompleted } : st)
    });
  }

  handleDeleteSubTask(subId: string) {
    const r = this.reminder();
    if (!r) return;
    const list = r.subTasks || [];
    this.store.updateReminder(r.id, {
      subTasks: list.filter(st => st.id !== subId)
    });
  }
}
