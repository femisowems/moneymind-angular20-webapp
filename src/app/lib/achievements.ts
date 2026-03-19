export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string; // Emoji
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  isHidden?: boolean; // Secrets hide from UI until unlocked
  maxProgress?: number;
  getProgress?: (state: any) => number;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Core Streaks
  { id: 'first_blood', title: 'Adulting 101', description: 'Complete your first reminder.', icon: '👶', tier: 'bronze', maxProgress: 1, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted).length > 0 ? 1 : 0 },
  { id: 'streak_3', title: 'On A Roll', description: 'Reach a 3-day consistency streak.', icon: '🔥', tier: 'silver', maxProgress: 3, getProgress: (s) => s.streak.currentStreak },
  { id: 'streak_7', title: 'Unstoppable', description: 'Reach a 7-day consistency streak.', icon: '🚀', tier: 'gold', maxProgress: 7, getProgress: (s) => s.streak.currentStreak },
  { id: 'streak_14', title: 'Habit Master', description: 'Reach a 14-day consistency streak.', icon: '👑', tier: 'platinum', maxProgress: 14, getProgress: (s) => s.streak.currentStreak },
  { id: 'streak_30', title: 'Ascension', description: 'Reach a 30-day consistency streak.', icon: '🌌', tier: 'platinum', maxProgress: 30, getProgress: (s) => s.streak.currentStreak },
  
  // Specific Actions
  { id: 'rich_boy', title: 'Money Moves', description: 'Complete a large financial task (>$100).', icon: '💸', tier: 'silver', maxProgress: 1, getProgress: (s) => s.reminders.some((r: any) => r.isCompleted && r.amount && r.amount >= 100) ? 1 : 0 },
  { id: 'saved_late_fee', title: 'Penny Pincher', description: 'Avoid a potential late fee by paying on time.', icon: '💰', tier: 'bronze', maxProgress: 1, getProgress: (s) => s.reminders.some((r: any) => r.isCompleted && r.lateFee && r.lateFee > 0) ? 1 : 0 },

  // Category Mastery - Hierarchy
  { id: 'the_ceo_1', title: 'The CEO I', description: 'Complete 10 Bill payments.', icon: '👔', tier: 'silver', maxProgress: 10, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '1').length },
  { id: 'the_ceo_2', title: 'The CEO II', description: 'Complete 50 Bill payments.', icon: '🏛️', tier: 'gold', maxProgress: 50, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '1').length },
  { id: 'the_ceo_3', title: 'The CEO III', description: 'Complete 100 Bill payments.', icon: '🗽', tier: 'platinum', maxProgress: 100, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '1').length },
  
  { id: 'the_saver_1', title: 'The Saver I', description: 'Complete 10 Savings transfers.', icon: '🏦', tier: 'silver', maxProgress: 10, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '2').length },
  { id: 'the_saver_2', title: 'The Saver II', description: 'Complete 50 Savings transfers.', icon: '🏰', tier: 'gold', maxProgress: 50, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '2').length },
  { id: 'the_saver_3', title: 'The Saver III', description: 'Complete 100 Savings transfers.', icon: '💎', tier: 'platinum', maxProgress: 100, getProgress: (s) => s.reminders.filter((r: any) => r.isCompleted && r.category === '2').length },

  // Hidden Secrets
  { id: 'millionaire', title: 'The Millionaire', description: 'Track a task worth over $1,000,000!', icon: '🤑', tier: 'platinum', isHidden: true },
  { id: 'night_owl', title: 'Night Owl', description: 'Complete a financial task when everyone else is asleep (12am - 4am).', icon: '🦉', tier: 'gold', isHidden: true },
];
