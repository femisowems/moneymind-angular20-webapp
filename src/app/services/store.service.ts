import { Injectable, signal, computed, effect, PLATFORM_ID, Inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Reminder, Streak, CustomCategory, Goal, HealthScore } from '../types';
import { isSameDay, differenceInDays, addDays, addWeeks, addMonths, addYears } from 'date-fns';

@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // State
  private _reminders = signal<Reminder[]>([]);
  private _deletedReminders = signal<Reminder[]>([]);
  private _streak = signal<Streak>({ currentStreak: 0, longestStreak: 0 });
  private _categories = signal<CustomCategory[]>([
    { id: '1', name: 'Bills', color: 'danger' },
    { id: '2', name: 'Savings', color: 'success' },
    { id: '3', name: 'Subscriptions', color: 'primary' },
    { id: '4', name: 'Other', color: 'neutral' },
  ]);
  private _unlockedAchievements = signal<string[]>([]);
  private _goals = signal<Goal[]>([]);
  private _inventory = signal<{ streakFreezes: number }>({ streakFreezes: 0 });
  private _hasCompletedOnboarding = signal<boolean>(false);
  private _score = signal<HealthScore>({ value: 100, label: 'Strong', xp: 0, level: 1, nextLevelXP: 100 });

  // Selectors (computed signals)
  reminders = this._reminders.asReadonly();
  deletedReminders = this._deletedReminders.asReadonly();
  streak = this._streak.asReadonly();
  categories = this._categories.asReadonly();
  unlockedAchievements = this._unlockedAchievements.asReadonly();
  goals = this._goals.asReadonly();
  inventory = this._inventory.asReadonly();
  hasCompletedOnboarding = this._hasCompletedOnboarding.asReadonly();
  score = this._score.asReadonly();

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {
    // Persistence
    if (isPlatformBrowser(this.platformId)) {
      const savedData = localStorage.getItem('moneymind-storage');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        if (parsed.state) {
          const state = parsed.state;
          this._reminders.set(state.reminders || []);
          this._deletedReminders.set(state.deletedReminders || []);
          this._streak.set(state.streak || { currentStreak: 0, longestStreak: 0 });
          this._categories.set(state.categories || []);
          this._unlockedAchievements.set(state.unlockedAchievements || []);
          this._goals.set(state.goals || []);
          this._inventory.set(state.inventory || { streakFreezes: 0 });
          this._hasCompletedOnboarding.set(state.hasCompletedOnboarding || false);
          this._score.set(state.score || { value: 100, label: 'Strong', xp: 0, level: 1, nextLevelXP: 100 });
        }
      } catch (e) {
        console.error('Failed to load storage', e);
      }
    }
  }

    // Auto-save effect
    effect(() => {
      const state = {
        reminders: this._reminders(),
        deletedReminders: this._deletedReminders(),
        streak: this._streak(),
        categories: this._categories(),
        unlockedAchievements: this._unlockedAchievements(),
        goals: this._goals(),
        inventory: this._inventory(),
        hasCompletedOnboarding: this._hasCompletedOnboarding(),
        score: this._score(),
      };
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('moneymind-storage', JSON.stringify({ state }));
      }
    });
  }

  // Actions
  completeOnboarding() {
    this._hasCompletedOnboarding.set(true);
  }

  addReminder(reminderData: Omit<Reminder, 'id' | 'isCompleted'>) {
    const newReminder: Reminder = {
      ...reminderData,
      id: crypto.randomUUID(),
      isCompleted: false,
    };
    this._reminders.update(r => [...r, newReminder]);
    this.calculateScore();
  }

  toggleReminder(id: string) {
    const now = new Date();
    let newlySpawnedReminders: Reminder[] = [];

    this._reminders.update(reminders => {
      const updated = reminders.map((r) => {
        if (r.id === id) {
          const isCompleted = !r.isCompleted;
          
          if (isCompleted && r.recurring !== 'none') {
            const currentDueDate = new Date(r.dueDate);
            let nextDate = currentDueDate;
            if (r.recurring === 'daily') nextDate = addDays(currentDueDate, 1);
            else if (r.recurring === 'weekly') nextDate = addWeeks(currentDueDate, 1);
            else if (r.recurring === 'monthly') nextDate = addMonths(currentDueDate, 1);
            else if (r.recurring === 'yearly') nextDate = addYears(currentDueDate, 1);

            newlySpawnedReminders.push({
              ...r,
              id: crypto.randomUUID(),
              isCompleted: false,
              completedAt: undefined,
              history: [],
              dueDate: nextDate.toISOString()
            });
          }

          return {
            ...r,
            isCompleted,
            ...(isCompleted && r.recurring !== 'none' ? { recurring: 'none' as const } : {}),
            completedAt: isCompleted ? now.toISOString() : undefined,
            history: isCompleted 
              ? [...(r.history || []), now.toISOString()]
              : r.history
          };
        }
        return r;
      });
      return [...updated, ...newlySpawnedReminders];
    });

    // Update Streak and inventory
    const completedReminders = this._reminders().filter(r => r.isCompleted);
    if (completedReminders.length > 0) {
      this._streak.update(streak => {
        let newStreak = { ...streak };
        if (!newStreak.lastCompletedDate || !isSameDay(new Date(newStreak.lastCompletedDate), now)) {
          if (newStreak.lastCompletedDate && differenceInDays(now, new Date(newStreak.lastCompletedDate)) > 1) {
            // Check freeze
            if (this._inventory().streakFreezes > 0) {
              this._inventory.update(inv => ({ ...inv, streakFreezes: inv.streakFreezes - 1 }));
              newStreak.currentStreak += 1;
            } else {
              newStreak.currentStreak = 1;
            }
          } else {
            newStreak.currentStreak += 1;
          }
          newStreak.lastCompletedDate = now.toISOString();
          if (newStreak.currentStreak > newStreak.longestStreak) {
            newStreak.longestStreak = newStreak.currentStreak;
          }
        }
        return newStreak;
      });
    }

    // Check Achievements
    this.checkAchievements();
    this.calculateScore();
  }

  private checkAchievements() {
    const completedReminders = this._reminders().filter(r => r.isCompleted);
    const streak = this._streak();
    const newUnlocked = [...this._unlockedAchievements()];
    const now = new Date();

    if (!newUnlocked.includes('first_blood') && completedReminders.length > 0) newUnlocked.push('first_blood');
    if (!newUnlocked.includes('streak_3') && streak.currentStreak >= 3) newUnlocked.push('streak_3');
    if (!newUnlocked.includes('streak_7') && streak.currentStreak >= 7) newUnlocked.push('streak_7');
    if (!newUnlocked.includes('streak_14') && streak.currentStreak >= 14) newUnlocked.push('streak_14');
    if (!newUnlocked.includes('streak_30') && streak.currentStreak >= 30) newUnlocked.push('streak_30');
    
    if (completedReminders.some(r => r.amount && r.amount >= 100) && !newUnlocked.includes('rich_boy')) newUnlocked.push('rich_boy');
    if (completedReminders.some(r => r.amount && r.amount >= 1000000) && !newUnlocked.includes('millionaire')) newUnlocked.push('millionaire');

    this._unlockedAchievements.set(newUnlocked);
  }

  deleteReminder(id: string) {
    const reminder = this._reminders().find(r => r.id === id);
    if (reminder) {
      this._reminders.update(r => r.filter(x => x.id !== id));
      this._deletedReminders.update(d => [...d, reminder]);
    }
  }

  restoreReminder(id: string) {
    const reminder = this._deletedReminders().find(r => r.id === id);
    if (reminder) {
      this._deletedReminders.update(d => d.filter(x => x.id !== id));
      this._reminders.update(r => [...r, reminder]);
    }
  }

  permanentDelete(id: string) {
    this._deletedReminders.update(d => d.filter(r => r.id !== id));
  }

  clearTrash() {
    this._deletedReminders.set([]);
  }

  updateReminder(id: string, updates: Partial<Reminder>) {
    this._reminders.update(reminders => 
      reminders.map(r => r.id === id ? { ...r, ...updates } : r)
    );
    this.calculateScore();
  }

  addGoal(goalData: Omit<Goal, 'id'>) {
    this._goals.update(g => [...g, { ...goalData, id: crypto.randomUUID() }]);
    this.calculateScore();
  }

  addFundsToGoal(id: string, amount: number) {
    this._goals.update(goals => 
      goals.map(g => g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g)
    );
    this.calculateScore();
  }

  deleteGoal(id: string) {
    this._goals.update(g => g.filter(x => x.id !== id));
    this.calculateScore();
  }

  purchaseItem(item: 'streakFreeze', cost: number): boolean {
    const currentScore = this._score();
    if (currentScore.xp >= cost) {
      this._score.set({ ...currentScore, xp: currentScore.xp - cost });
      this._inventory.update(inv => ({ ...inv, streakFreezes: inv.streakFreezes + 1 }));
      this.calculateScore();
      return true;
    }
    return false;
  }

  private calculateScore() {
    const reminders = this._reminders();
    const streak = this._streak();
    const achievements = this._unlockedAchievements();

    const allReminders = [...reminders];
    const completed = allReminders.filter(r => r.isCompleted).length;
    
    // XP and Level calculation remains cumulative
    const xp = (completed * 10) + (achievements.length * 50);
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXP = level * 100;

    if (allReminders.length === 0) {
      this._score.set({ value: 100, label: 'Strong', xp, level, nextLevelXP });
      return;
    }

    // Use only the most recent 50 relevant reminders for the health score
    // Relevant means completed OR due in the past/today, to avoid future uncompleted bills diluting the score.
    const now = new Date();
    const relevantReminders = allReminders.filter(r => 
      r.isCompleted || new Date(r.dueDate) <= now
    );

    if (relevantReminders.length === 0 && this._goals().length === 0) {
      this._score.set({ value: 100, label: 'Strong', xp, level, nextLevelXP });
      return;
    }

    const sortedByDate = relevantReminders.sort((a, b) => 
      new Date(b.dueDate).getTime() - new Date(a.dueDate).getTime()
    );
    const recentReminders = sortedByDate.slice(0, 50);
    
    const recentTotal = recentReminders.length;
    const recentCompleted = recentReminders.filter(r => r.isCompleted).length;

    // Goals calculation
    let goalsBonus = 0;
    let goalsWeight = 0;
    const goals = this._goals();
    if (goals.length > 0) {
      goalsWeight = 20; // 20 points allocated to goals
      const targetSum = goals.reduce((sum, g) => sum + g.targetAmount, 0);
      const currentSum = goals.reduce((sum, g) => sum + g.currentAmount, 0);
      if (targetSum > 0) {
        goalsBonus = (currentSum / targetSum) * goalsWeight;
      }
    }

    // Calculate components
    let completionRatio = 0;
    if (recentTotal > 0) {
      const maxCompletionPoints = 70 - goalsWeight; // 50 if goals exist, 70 if not
      completionRatio = (recentCompleted / recentTotal) * maxCompletionPoints;
    } else {
      // If we have goals but no relevant reminders, grant full completion points so we don't penalize
      completionRatio = 70 - goalsWeight; 
    }
    const streakBonus = Math.min((streak.currentStreak / 7) * 30, 30);
    
    // Final score stability: Use a small epsilon to avoid rounding jitter at .5
    const rawScoreSum = completionRatio + streakBonus + goalsBonus;
    const roundedScore = Math.round(rawScoreSum + 0.00001);
    const finalScore = Math.min(100, Math.max(0, roundedScore));

    let label: 'Strong' | 'Good' | 'Needs Attention' = 'Needs Attention';
    if (finalScore >= 80) label = 'Strong';
    else if (finalScore >= 50) label = 'Good';

    // Only update signal if the integer value actually changed to prevent redundant downstream effects
    const currentScore = this._score();
    if (currentScore.value !== finalScore || currentScore.xp !== xp) {
      this._score.set({ value: finalScore, label, xp, level, nextLevelXP });
    }
  }
}
