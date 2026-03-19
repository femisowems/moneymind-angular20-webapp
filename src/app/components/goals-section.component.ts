import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { Goal } from '../types';
import { ButtonComponent } from './ui/button.component';
import { InputComponent } from './ui/input.component';
import { LucideAngularModule } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-goals-section',
  standalone: true,
  imports: [CommonModule, ButtonComponent, InputComponent, LucideAngularModule, FormsModule],
  template: `
    <section class="mb-10">
      <div class="flex items-center justify-between mb-3">
        <h2 class="text-sm font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
          <i-lucide name="target" class="w-4 h-4"></i-lucide> Long-Term Goals
        </h2>
      </div>

      <div class="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
        <div 
          *ngFor="let goal of goals()" 
          (click)="activeGoal.set(goal)"
          class="snap-center shrink-0 w-64 p-4 rounded-3xl border transition-all cursor-pointer relative group"
          [ngClass]="isComplete(goal) ? 'bg-success/5 border-success/20 shadow-sm' : 'bg-white border-gray-100 shadow-sm hover:shadow-md hover:border-primary/20'"
        >
          <button 
            (click)="onDeleteGoal($event, goal.id)"
            class="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-gray-400 hover:text-danger hover:bg-danger/10 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <i-lucide name="trash-2" class="w-3.5 h-3.5"></i-lucide>
          </button>
          
          <div class="flex items-center gap-3 mb-4">
            <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl" [ngClass]="isComplete(goal) ? 'bg-success/10' : 'bg-primary/10'">
              {{ goal.icon || '🎯' }}
            </div>
            <div class="flex flex-col">
              <span class="font-bold text-gray-900 truncate max-w-[140px]">{{ goal.title }}</span>
              <span class="text-xs font-semibold text-gray-500">
                \${{ goal.currentAmount | number:'1.0-0' }} / <span class="text-gray-400">\${{ goal.targetAmount | number:'1.0-0' }}</span>
              </span>
            </div>
          </div>

          <div class="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
            <div 
              class="h-full rounded-full transition-all duration-1000 ease-out"
              [ngClass]="isComplete(goal) ? 'bg-success' : 'bg-gradient-to-r from-primary to-[#7050ff]'"
              [style.width.%]="getProgress(goal)"
            ></div>
          </div>
          <p class="text-[10px] font-bold text-gray-400 mt-2 uppercase text-right tracking-wider">
            {{ getProgress(goal) | number:'1.0-0' }}% {{ isComplete(goal) ? 'Completed!' : '' }}
          </p>
        </div>

        <button 
          *ngIf="!isAdding()"
          (click)="isAdding.set(true)"
          class="snap-center shrink-0 w-32 h-[126px] p-4 rounded-3xl border border-dashed border-gray-200 bg-gray-50 flex flex-col items-center justify-center text-gray-400 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all"
        >
          <i-lucide name="plus" class="w-6 h-6 mb-1"></i-lucide>
          <span class="text-xs font-bold uppercase tracking-wider">Add Goal</span>
        </button>

        <form *ngIf="isAdding()" (submit)="handleAddGoal()" class="snap-center shrink-0 w-64 p-4 rounded-3xl border border-primary/20 bg-white shadow-sm flex flex-col gap-2">
          <div class="flex justify-between items-center mb-1">
            <span class="text-xs font-bold uppercase tracking-wider text-primary">New Goal</span>
            <button type="button" (click)="isAdding.set(false)" class="text-gray-400 hover:text-gray-600">
              <i-lucide name="x" class="w-4 h-4"></i-lucide>
            </button>
          </div>
          <input appInput autoFocus placeholder="Goal Title" [(ngModel)]="newGoalTitle" name="title" required class="h-8 text-sm px-2" />
          <input appInput type="number" placeholder="Target Amount" [(ngModel)]="newGoalTarget" name="target" required min="1" class="h-8 text-sm px-2" />
          <button appButton type="submit" size="sm" class="w-full mt-1">Create</button>
        </form>
      </div>

      <!-- Deposit Modal -->
      <div *ngIf="activeGoal()" class="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
        <form (submit)="handleAddFunds($event)" class="bg-white rounded-3xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center text-xl">{{ activeGoal()?.icon }}</div>
              <div class="flex flex-col">
                <h3 class="font-bold text-lg text-gray-900 leading-tight">{{ activeGoal()?.title }}</h3>
                <span class="text-xs font-semibold text-gray-500">
                  \${{ activeGoal()?.currentAmount | number }} of \${{ activeGoal()?.targetAmount | number }}
                </span>
              </div>
            </div>
            <button type="button" (click)="activeGoal.set(null)" class="p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 transition-colors">
              <i-lucide name="x" class="w-5 h-5"></i-lucide>
            </button>
          </div>
          
          <div class="relative">
            <i-lucide name="dollar-sign" class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"></i-lucide>
            <input 
              appInput
              autoFocus 
              type="number" 
              placeholder="Amount to deposit" 
              [(ngModel)]="fundAmount"
              name="fund"
              required 
              min="1" 
              class="pl-10 text-lg py-6 shadow-none h-auto"
            />
          </div>
          
          <button appButton type="submit" class="w-full py-6 text-base shadow-lg shadow-primary/20 group">
            Deposit Funds
          </button>
        </form>
      </div>
    </section>
  `
})
export class GoalsSectionComponent {
  private store = inject(StoreService);
  goals = this.store.goals;

  isAdding = signal(false);
  activeGoal = signal<Goal | null>(null);

  newGoalTitle = '';
  newGoalTarget = '';
  fundAmount = '';

  getProgress(goal: Goal) {
    return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
  }

  isComplete(goal: Goal) {
    return this.getProgress(goal) === 100;
  }

  handleAddGoal() {
    if (!this.newGoalTitle || !this.newGoalTarget) return;
    this.store.addGoal({
      title: this.newGoalTitle,
      targetAmount: Number(this.newGoalTarget),
      currentAmount: 0,
      icon: '🎯'
    });
    this.isAdding.set(false);
    this.newGoalTitle = '';
    this.newGoalTarget = '';
  }

  onDeleteGoal(event: MouseEvent, id: string) {
    event.stopPropagation();
    this.store.deleteGoal(id);
  }

  handleAddFunds(event: Event) {
    event.preventDefault();
    const goal = this.activeGoal();
    if (!goal || !this.fundAmount) return;
    this.store.addFundsToGoal(goal.id, Number(this.fundAmount));
    this.activeGoal.set(null);
    this.fundAmount = '';
  }
}
