export type TransactionCategory = 'Food' | 'Transport' | 'Study' | 'Fun' | 'Income' | 'Savings' | 'Health' | 'Shopping' | 'Savings/Goal';

export type TransactionType = 'expense' | 'earning' | 'saving';

export interface Transaction {
  id: string;
  amount: number;
  category: TransactionCategory;
  type: TransactionType;
  description: string;
  date: string; // ISO string
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline?: string;
  icon: string;
  color: string;
}

export interface Budget {
  category: TransactionCategory;
  limit: number;
  spent: number;
}

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  totalBalance: number;
  monthlyAllowance: number;
  onboarded?: boolean;
  minBalanceThreshold?: number;
  dailySpendLimit?: number;
  isLowBalanceEnabled?: boolean;
  isDailySpendEnabled?: boolean;
  streakCount?: number;
  lastActiveDate?: string;
  badges?: string[];
}

export interface SplitBill {
  id: string;
  amount: number;
  description: string;
  date: string;
  roommates: { name: string; email?: string; amount: number; settled: boolean }[];
  payerId: string;
}

export interface Notification {
  id: string;
  type: 'split' | 'alert' | 'info' | 'critical';
  title: string;
  message: string;
  date: string;
  isRead: boolean;
  senderName?: string;
  senderId?: string;
  amount?: number;
  billId?: string;
}
