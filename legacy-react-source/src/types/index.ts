export interface CustomCategory {
  id: string;
  name: string;
  color: "success" | "warning" | "danger" | "primary" | "info" | "neutral";
}

export interface Reminder {
  id: string;
  title: string;
  amount?: number;
  lateFee?: number; // Optional late fee for missed impact
  dueDate: string; // ISO date string
  category: string; // ID of the category
  isCompleted: boolean;
  recurring: 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  completedAt?: string; // ISO date string if completed
  notes?: string;
  url?: string;
  autoPay?: boolean;
  subTasks?: { id: string; title: string; isCompleted: boolean }[];
  history?: string[]; // ISO date strings of past completions
  attachment?: string; // Base64 string of the uploaded receipt/image
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon?: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
}

export interface Streak {
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate?: string;
}

export interface HealthScore {
  score: number; // 0 to 100
  label: 'Strong' | 'Good' | 'Needs Attention';
}
