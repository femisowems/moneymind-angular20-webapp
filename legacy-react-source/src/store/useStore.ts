import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Reminder, Streak, CustomCategory, Goal } from '../types';
import { isSameDay, differenceInDays, addDays, addWeeks, addMonths, addYears } from 'date-fns';

interface AppState {
  reminders: Reminder[];
  streak: Streak;
  score: { value: number; label: 'Strong' | 'Good' | 'Needs Attention'; xp: number; level: number; nextLevelXP: number };
  categories: CustomCategory[];
  unlockedAchievements: string[];
  goals: Goal[];
  inventory: { streakFreezes: number };
  hasCompletedOnboarding: boolean;
  deletedReminders: Reminder[];
  
  // Actions
  completeOnboarding: () => void;
  addReminder: (reminder: Omit<Reminder, 'id' | 'isCompleted'>) => void;
  toggleReminder: (id: string) => void;
  deleteReminder: (id: string) => void;
  restoreReminder: (id: string) => void;
  permanentDelete: (id: string) => void;
  clearTrash: () => void;
  updateReminder: (id: string, updates: Partial<Reminder>) => void;
  addCategory: (category: Omit<CustomCategory, 'id'>) => void;
  deleteCategory: (id: string) => void;
  addGoal: (goal: Omit<Goal, 'id'>) => void;
  addFundsToGoal: (id: string, amount: number) => void;
  deleteGoal: (id: string) => void;
  purchaseItem: (item: 'streakFreeze', cost: number) => boolean;
  calculateScore: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      reminders: [],
      streak: {
        currentStreak: 0,
        longestStreak: 0,
      },
      score: { value: 100, label: 'Strong', xp: 0, level: 1, nextLevelXP: 100 },
      unlockedAchievements: [],
      goals: [],
      inventory: { streakFreezes: 0 },
      hasCompletedOnboarding: false,
      deletedReminders: [],
      categories: [
        { id: '1', name: 'Bills', color: 'danger' },
        { id: '2', name: 'Savings', color: 'success' },
        { id: '3', name: 'Subscriptions', color: 'primary' },
        { id: '4', name: 'Other', color: 'neutral' },
      ],

      addCategory: (catData) => {
        set((state) => ({
          categories: [...state.categories, { ...catData, id: crypto.randomUUID() }]
        }));
      },

      deleteCategory: (id) => {
        set((state) => ({
          categories: state.categories.filter(c => c.id !== id)
        }));
      },

      completeOnboarding: () => {
        set({ hasCompletedOnboarding: true });
      },

      addReminder: (reminderData) => {
        const newReminder: Reminder = {
          ...reminderData,
          id: crypto.randomUUID(),
          isCompleted: false,
        };
        set((state) => ({ reminders: [...state.reminders, newReminder] }));
        get().calculateScore();
      },

      toggleReminder: (id: string) => {
        set((state) => {
          const now = new Date();
          let newlySpawnedReminders: Reminder[] = [];

          const updatedReminders = state.reminders.map((r) => {
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
          
          updatedReminders.push(...newlySpawnedReminders);

          // Update Streak and consume Freezes if necessary
          let newStreak = { ...state.streak };
          let newInventory = { ...state.inventory };
          const completedReminders = updatedReminders.filter((r) => r.isCompleted);
          
          if (completedReminders.length > 0) {
            if (
              !newStreak.lastCompletedDate ||
              !isSameDay(new Date(newStreak.lastCompletedDate), now)
            ) {
              if (
                newStreak.lastCompletedDate &&
                differenceInDays(now, new Date(newStreak.lastCompletedDate)) > 1
              ) {
                // Streak broken - check for freeze!
                if (newInventory.streakFreezes > 0) {
                  newInventory.streakFreezes -= 1; // Consume freeze
                  newStreak.currentStreak += 1; // Keep it alive
                } else {
                  newStreak.currentStreak = 1; // Actually broken
                }
              } else {
                newStreak.currentStreak += 1;
              }
              newStreak.lastCompletedDate = now.toISOString();
              
              if (newStreak.currentStreak > newStreak.longestStreak) {
                newStreak.longestStreak = newStreak.currentStreak;
              }
            }
          }

          // Check Achievements
          const newUnlocked = [...state.unlockedAchievements];
          if (!newUnlocked.includes('first_blood') && completedReminders.length > 0) {
            newUnlocked.push('first_blood');
          }
          if (!newUnlocked.includes('streak_3') && newStreak.currentStreak >= 3) {
            newUnlocked.push('streak_3');
          }
          if (!newUnlocked.includes('streak_7') && newStreak.currentStreak >= 7) {
            newUnlocked.push('streak_7');
          }
          if (!newUnlocked.includes('streak_14') && newStreak.currentStreak >= 14) {
            newUnlocked.push('streak_14');
          }
          if (!newUnlocked.includes('streak_30') && newStreak.currentStreak >= 30) {
            newUnlocked.push('streak_30');
          }
          if (!newUnlocked.includes('rich_boy') && completedReminders.some(r => r.amount && r.amount >= 100)) {
            newUnlocked.push('rich_boy');
          }
          if (!newUnlocked.includes('millionaire') && completedReminders.some(r => r.amount && r.amount >= 1000000)) {
            newUnlocked.push('millionaire');
          }
          if (!newUnlocked.includes('saved_late_fee') && completedReminders.some(r => r.lateFee && r.lateFee > 0)) {
            newUnlocked.push('saved_late_fee');
          }
          
          const completedBills = completedReminders.filter(r => r.category === '1').length;
          const completedSavings = completedReminders.filter(r => r.category === '2').length;
          if (!newUnlocked.includes('the_ceo_1') && completedBills >= 10) newUnlocked.push('the_ceo_1');
          if (!newUnlocked.includes('the_ceo_2') && completedBills >= 50) newUnlocked.push('the_ceo_2');
          if (!newUnlocked.includes('the_ceo_3') && completedBills >= 100) newUnlocked.push('the_ceo_3');
          
          if (!newUnlocked.includes('the_saver_1') && completedSavings >= 10) newUnlocked.push('the_saver_1');
          if (!newUnlocked.includes('the_saver_2') && completedSavings >= 50) newUnlocked.push('the_saver_2');
          if (!newUnlocked.includes('the_saver_3') && completedSavings >= 100) newUnlocked.push('the_saver_3');
          
          const currentHour = now.getHours();
          if (!newUnlocked.includes('night_owl') && currentHour >= 0 && currentHour < 4 && completedReminders.length > 0) {
            newUnlocked.push('night_owl');
          }

          return { reminders: updatedReminders, streak: newStreak, unlockedAchievements: newUnlocked, inventory: newInventory };
        });
        
        
        get().calculateScore();
      },

      deleteReminder: (id) => {
        set((state) => {
          const reminderToTrash = state.reminders.find(r => r.id === id);
          if (!reminderToTrash) return state;
          return {
            reminders: state.reminders.filter((r) => r.id !== id),
            deletedReminders: [...(state.deletedReminders || []), reminderToTrash]
          };
        });
      },

      restoreReminder: (id) => {
        set((state) => {
          const reminderToRestore = (state.deletedReminders || []).find(r => r.id === id);
          if (!reminderToRestore) return state;
          return {
            deletedReminders: (state.deletedReminders || []).filter((r) => r.id !== id),
            reminders: [...state.reminders, reminderToRestore]
          };
        });
      },

      permanentDelete: (id) => {
        set((state) => ({
          deletedReminders: (state.deletedReminders || []).filter((r) => r.id !== id)
        }));
      },
      
      clearTrash: () => {
        set({ deletedReminders: [] });
      },

      updateReminder: (id: string, updates: Partial<Reminder>) => {
        set((state) => ({
          reminders: state.reminders.map((r) => 
            r.id === id ? { ...r, ...updates } : r
          ),
        }));
        get().calculateScore();
      },

      addGoal: (goalData: Omit<Goal, 'id'>) => {
        set((state) => ({ goals: [...state.goals, { ...goalData, id: crypto.randomUUID() }] }));
      },

      addFundsToGoal: (id: string, amount: number) => {
        set((state) => ({
          goals: state.goals.map((g) =>
            g.id === id ? { ...g, currentAmount: Math.min(g.currentAmount + amount, g.targetAmount) } : g
          ),
        }));
      },

      deleteGoal: (id: string) => {
        set((state) => ({ goals: state.goals.filter((g) => g.id !== id) }));
      },

      purchaseItem: (item: 'streakFreeze', cost: number) => {
        const state = get();
        if (state.score.xp >= cost) {
          set({
             score: { ...state.score, xp: state.score.xp - cost },
             inventory: { ...state.inventory, streakFreezes: state.inventory.streakFreezes + 1 }
          });
          get().calculateScore(); // Re-calculate levels based on lowered XP
          return true;
        }
        return false;
      },

      calculateScore: () => {
        set((state) => {
          const { reminders, streak, unlockedAchievements } = state;
          
          const completed = reminders.filter((r) => r.isCompleted).length;
          const xp = (completed * 10) + (unlockedAchievements.length * 50);
          const level = Math.floor(xp / 100) + 1;
          const nextLevelXP = level * 100;

          if (reminders.length === 0) return { score: { value: 100, label: 'Strong', xp, level, nextLevelXP } };

          const total = reminders.length;
          
          // Basic formula: completion ratio (70%) + streak bonus (max 30%)
          const completionRatio = (completed / total) * 70;
          const streakBonus = Math.min((streak.currentStreak / 7) * 30, 30); // Max bonus at 7 days
          
          const rawScore = Math.round(completionRatio + streakBonus);
          let label: 'Strong' | 'Good' | 'Needs Attention' = 'Needs Attention';
          
          if (rawScore >= 80) label = 'Strong';
          else if (rawScore >= 50) label = 'Good';

          return { score: { value: rawScore, label, xp, level, nextLevelXP } };
        });
      },
    }),
    {
      name: 'moneymind-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
