import { Component, inject, signal, effect, computed, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoreService } from '../services/store.service';
import { trigger, transition, style, animate, keyframes } from '@angular/animations';

type Tone = 'funny' | 'calm' | 'savage';

@Component({
  selector: 'app-nudge-message',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [
    trigger('float', [
      transition('* => *', [
        animate('4s ease-in-out', keyframes([
          style({ transform: 'translateY(0)', offset: 0 }),
          style({ transform: 'translateY(-8px)', offset: 0.5 }),
          style({ transform: 'translateY(0)', offset: 1 }),
        ]))
      ])
    ]),
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-10px) scale(0.98)' }),
        animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 1, transform: 'translateX(0) scale(1)' }))
      ]),
      transition(':leave', [
        animate('300ms cubic-bezier(0.35, 0, 0.25, 1)', style({ opacity: 0, transform: 'translateX(10px) scale(0.98)' }))
      ])
    ])
  ],
  template: `
    <div 
      class="flex flex-col gap-4 mb-8 p-6 rounded-[2rem] border-2 shadow-sm transition-all duration-500"
      [ngClass]="theme().container"
    >
      <div class="flex justify-between items-center">
        <h2 class="text-xs font-black uppercase tracking-widest opacity-60" [ngClass]="theme().text">Today's Focus</h2>
        <div class="flex gap-1.5 text-xs bg-white/60 backdrop-blur-md rounded-full p-1 border border-white/40 shadow-sm">
          <button (click)="tone.set('funny')" class="px-4 py-1.5 rounded-full transition-all font-bold" [ngClass]="tone() === 'funny' ? theme().buttonActive : theme().buttonInactive">Funny</button>
          <button (click)="tone.set('calm')" class="px-4 py-1.5 rounded-full transition-all font-bold" [ngClass]="tone() === 'calm' ? theme().buttonActive : theme().buttonInactive">Calm</button>
          <button (click)="tone.set('savage')" class="px-4 py-1.5 rounded-full transition-all font-bold" [ngClass]="tone() === 'savage' ? theme().buttonActive : theme().buttonInactive">Savage</button>
        </div>
      </div>
      
      <div class="flex items-start gap-5 pt-2">
        <div 
          class="w-16 h-16 shrink-0 rounded-full flex items-center justify-center text-3xl border-4 shadow-xl shadow-black/5"
          [ngClass]="theme().iconBg"
          [@float]
        >
          {{ theme().icon }}
        </div>
        
        <div
          *ngIf="message()"
          [@fadeSlide]
          class="text-2xl md:text-[1.75rem] font-black leading-tight tracking-tight pt-1"
          [ngClass]="theme().text"
        >
          "{{ message() }}"
        </div>
      </div>
    </div>
  `
})
export class NudgeMessageComponent {
  private store = inject(StoreService);
  reminders = this.store.reminders;
  streak = this.store.streak;

  tone = signal<Tone>('funny');
  message = signal('');

  theme = computed(() => {
    const t = this.tone();
    switch (t) {
      case 'funny':
        return {
          container: "bg-gradient-to-br from-emerald-50 to-teal-50/50 border-emerald-200 shadow-emerald-100",
          text: "text-emerald-900",
          buttonActive: "bg-emerald-500 text-white shadow-md",
          buttonInactive: "text-emerald-600 hover:bg-emerald-100",
          icon: "🐸",
          iconBg: "bg-emerald-100 border-emerald-300"
        };
      case 'calm':
        return {
          container: "bg-gradient-to-br from-blue-50 to-indigo-50/50 border-blue-200 shadow-blue-100",
          text: "text-blue-900",
          buttonActive: "bg-blue-500 text-white shadow-md",
          buttonInactive: "text-blue-600 hover:bg-blue-100",
          icon: "🧘",
          iconBg: "bg-blue-100 border-blue-300"
        };
      case 'savage':
        return {
          container: "bg-gradient-to-br from-rose-50 to-red-50/50 border-rose-200 shadow-rose-100",
          text: "text-rose-950",
          buttonActive: "bg-rose-600 text-white shadow-md",
          buttonInactive: "text-rose-700 hover:bg-rose-100",
          icon: "😈",
          iconBg: "bg-rose-100 border-rose-300"
        };
    }
  });

  constructor() {
    effect(() => {
      this.generateMessage();
    });
  }

  generateMessage() {
    const today = new Date();
    const hour = today.getHours();
    const dayOfWeek = today.getDay();
    const currentTone = this.tone();
    const reminders = this.reminders();
    const streak = this.streak();
    
    const todayStr = today.toISOString().substring(0, 10);
    
    const missedReminders = reminders.filter(r => {
      const isPast = new Date(r.dueDate) < new Date(todayStr);
      return !r.isCompleted && isPast;
    });
    
    const totalLateFees = missedReminders.reduce((acc, r) => acc + (r.lateFee || 0), 0);
    const dueToday = reminders.filter(r => !r.isCompleted && r.dueDate.substring(0, 10) === todayStr);
    const dueTodayAmount = dueToday.reduce((acc, r) => acc + (r.amount || 0), 0);
    const completedToday = reminders.filter(r => r.isCompleted && r.completedAt && r.completedAt.substring(0, 10) === todayStr);

    const ctxMsgs: string[] = [];

    // 1. Time / Day Contexts
    if (hour < 4) {
      if (currentTone === 'funny') ctxMsgs.push(`Why are you looking at budgeting at ${hour} AM? Go to sleep! 🦉`);
      if (currentTone === 'calm') ctxMsgs.push(`A peaceful quiet night. Rest well and tackle your finances tomorrow. 🌙`);
      if (currentTone === 'savage') ctxMsgs.push(`Checking your bank account at ${hour} AM? Couldn't sleep thinking about that debt? 😈`);
    } else if (dayOfWeek === 1 && hour < 11) {
      if (currentTone === 'funny') ctxMsgs.push(`Monday mornings are for money moves. Let's get that bread! ☕🍞`);
      if (currentTone === 'calm') ctxMsgs.push(`It's a beautiful Monday morning. Set your financial intentions for the week. 🌱`);
      if (currentTone === 'savage') ctxMsgs.push(`Stop dreading Monday and pay your bills. The weekend is over. 💼`);
    } else if (dayOfWeek === 5 && hour >= 16) {
      if (currentTone === 'funny') ctxMsgs.push(`Happy Friday! Pay your bills before you party the weekend away! 🍻`);
      if (currentTone === 'calm') ctxMsgs.push(`The weekend is here. Ensure your tasks are done so you can relax. 🌅`);
      if (currentTone === 'savage') ctxMsgs.push(`Don't blow all your money this weekend. You still have ${dueToday.length} things due today. 📉`);
    }

    // 2. Financial Contexts
    if (totalLateFees > 0) {
      if (currentTone === 'funny') ctxMsgs.push(`Ouch! You're bleeding $${totalLateFees} in late fees right now. Get a band-aid! 🤕`);
      if (currentTone === 'calm') ctxMsgs.push(`There are currently $${totalLateFees} in late fees accumulating. Let's address this soon.`);
      if (currentTone === 'savage') ctxMsgs.push(`You are literally lighting $${totalLateFees} on fire in late fees right now. Fix it! 🔥`);
    }

    if (dueTodayAmount > 100) {
      if (currentTone === 'funny') ctxMsgs.push(`You have over $${dueTodayAmount} due today! Big spender coming through! 💸`);
      if (currentTone === 'calm') ctxMsgs.push(`A significant day for your outflows. Take a deep breath and handle the $${dueTodayAmount} due today.`);
      if (currentTone === 'savage') ctxMsgs.push(`Say goodbye to $${dueTodayAmount} today. Hope it was worth it. 📉`);
    }

    if (streak.currentStreak >= 7 && completedToday.length > 0) {
      if (currentTone === 'funny') ctxMsgs.push(`A ${streak.currentStreak}-day streak?! Look at you, doing adult things perfectly! 🏆`);
      if (currentTone === 'calm') ctxMsgs.push(`Your ${streak.currentStreak}-day consistency is admirable. Keep walking the path. 🧘`);
      if (currentTone === 'savage') ctxMsgs.push(`A ${streak.currentStreak}-day streak is decent. Don't ruin it tomorrow. 👀`);
    }

    // 3. Fallbacks
    if (ctxMsgs.length === 0) {
      if (missedReminders.length > 0) {
        if (currentTone === 'funny') ctxMsgs.push(`You missed ${missedReminders.length} tasks! Oopsie daisies, those got away! 🥀`);
        if (currentTone === 'calm') ctxMsgs.push(`${missedReminders.length} tasks slipped by. Let's gently get back on track tomorrow. 🌱`);
        if (currentTone === 'savage') ctxMsgs.push(`You missed ${missedReminders.length} tasks? Are you even trying? 🤦`);
      } else if (completedToday.length > 0) {
        if (currentTone === 'funny') ctxMsgs.push(`Nice 😎 you completed ${completedToday.length} tasks today!`);
        if (currentTone === 'calm') ctxMsgs.push(`Well done. You handled your responsibilities today.`);
        if (currentTone === 'savage') ctxMsgs.push(`You actually finished things today? Wow, a bare minimum adulting award for you 🏅`);
      } else {
        if (currentTone === 'funny') ctxMsgs.push(`Let's stay on track today! 💪`);
        if (currentTone === 'calm') ctxMsgs.push(`A peaceful blank slate. What will you accomplish?`);
        if (currentTone === 'savage') ctxMsgs.push(`Stop scrolling and check your budget. 📱`);
      }
    }

    const randomMsg = ctxMsgs[Math.floor(Math.random() * ctxMsgs.length)];
    this.message.set(randomMsg);
  }
}
