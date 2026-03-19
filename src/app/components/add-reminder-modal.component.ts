import { Component, Input, Output, EventEmitter, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { ModalComponent } from './ui/modal.component';
import { ButtonComponent } from './ui/button.component';
import { InputComponent } from './ui/input.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-reminder-modal',
  standalone: true,
  imports: [CommonModule, ModalComponent, ButtonComponent, InputComponent, LucideAngularModule, FormsModule],
  template: `
    <app-modal [isOpen]="isOpen" (onClose)="onClose.emit()" title="Add New Reminder">
      <form (submit)="handleSubmit($event)" class="flex flex-col gap-5 pt-2">
        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 ml-1">Reminder Title</label>
          <input 
            appInput
            placeholder="e.g. Rent Payment, Car Insurance"
            [(ngModel)]="title"
            name="title"
            required
            autoFocus
          />
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 ml-1">Amount (Optional)</label>
            <div class="relative">
              <i-lucide name="dollar-sign" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"></i-lucide>
              <input 
                appInput
                type="number"
                step="0.01"
                placeholder="0.00"
                class="pl-9"
                [(ngModel)]="amount"
                name="amount"
              />
            </div>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 ml-1">Due Date</label>
            <div class="relative">
              <i-lucide name="calendar" class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"></i-lucide>
              <input 
                appInput
                type="date"
                class="pl-9"
                [(ngModel)]="dueDate"
                name="dueDate"
                required
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 ml-1">Category</label>
            <select 
              class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
              [(ngModel)]="category"
              name="category"
            >
              <option *ngFor="let cat of categories()" [value]="cat.id">{{ cat.name }}</option>
            </select>
          </div>
          <div class="space-y-2">
            <label class="text-sm font-semibold text-gray-700 ml-1">Recurring</label>
            <select 
              class="flex h-10 w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-all"
              [(ngModel)]="recurring"
              name="recurring"
            >
              <option value="none">One-time</option>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div class="space-y-2">
          <label class="text-sm font-semibold text-gray-700 ml-1">Notes (Optional)</label>
          <textarea 
            appInput
            placeholder="Add any specific details here..."
            class="min-h-[80px]"
            [(ngModel)]="notes"
            name="notes"
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-2">
          <button type="button" appButton variant="ghost" (click)="onClose.emit()">Cancel</button>
          <button type="submit" appButton class="bg-primary text-white hover:bg-primary-hover shadow-lg shadow-primary/20">
            Create Reminder
          </button>
        </div>
      </form>
    </app-modal>
  `
})
export class AddReminderModalComponent {
  @Input() isOpen = false;
  @Output() onClose = new EventEmitter<void>();

  private store = inject(StoreService);
  categories = this.store.categories;

  title = '';
  amount: number | null = null;
  dueDate = new Date().toISOString().substring(0, 10);
  category = '1';
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly' = 'none';
  notes = '';

  handleSubmit(event: Event) {
    event.preventDefault();
    if (!this.title.trim() || !this.dueDate) return;

    this.store.addReminder({
      title: this.title.trim(),
      amount: this.amount || undefined,
      dueDate: new Date(this.dueDate).toISOString(),
      category: this.category,
      recurring: this.recurring,
      notes: this.notes.trim() || undefined
    });

    this.resetForm();
    this.onClose.emit();
  }

  resetForm() {
    this.title = '';
    this.amount = null;
    this.dueDate = new Date().toISOString().substring(0, 10);
    this.category = '1';
    this.recurring = 'none';
    this.notes = '';
  }
}
