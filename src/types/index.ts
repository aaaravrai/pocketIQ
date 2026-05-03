export type TransactionCategory = 'Food' | 'Transport' | 'Study' | 'Fun' | 'Income' | 'Savings' | 'Health' | 'Shopping';

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
  name: string;
  email: string;
  avatar?: string;
  dateOfBirth?: string;
  totalBalance: number;
  monthlyAllowance: number;
  onboarded?: boolean;
}
