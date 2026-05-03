import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Transaction, Goal, Budget, UserProfile, TransactionType, TransactionCategory } from '../types';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface FinancialContextType {
  userProfile: (UserProfile & { userId: string, onboarded?: boolean }) | null;
  authUser: User | null;
  transactions: Transaction[];
  goals: Goal[];
  budgets: Budget[];
  isLoaded: boolean;
  isAuthLoading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, update: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<(UserProfile & { userId: string, onboarded?: boolean }) | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Connection test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setAuthUser(user);
      setIsAuthLoading(false);
      if (!user) {
        setUserProfile(null);
        setTransactions([]);
        setGoals([]);
        setIsLoaded(true);
      }
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!authUser) return;

    const userRef = doc(db, 'users', authUser.uid);
    const unsubProfile = onSnapshot(userRef, (snapshot) => {
      if (snapshot.exists()) {
        setUserProfile({ ...snapshot.data() as UserProfile, userId: authUser.uid });
      } else {
        setUserProfile(null);
      }
    }, (error) => handleFirestoreError(error, OperationType.GET, `users/${authUser.uid}`));

    const txQuery = query(collection(db, 'users', authUser.uid, 'transactions'), orderBy('date', 'desc'));
    const unsubTx = onSnapshot(txQuery, (snapshot) => {
      setTransactions(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Transaction));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/transactions`));

    const goalsQuery = collection(db, 'users', authUser.uid, 'goals');
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Goal));
      setIsLoaded(true);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/goals`));

    return () => {
      unsubProfile();
      unsubTx();
      unsubGoals();
    };
  }, [authUser]);

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'date'>) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}/transactions`;
    try {
      const data = {
        ...txData,
        date: new Date().toISOString(),
        userId: authUser.uid
      };
      await addDoc(collection(db, path), data);
      
      // Update balance
      const newBalance = (userProfile?.totalBalance || 0) + (txData.type === 'expense' ? -txData.amount : txData.amount);
      await updateDoc(doc(db, 'users', authUser.uid), { totalBalance: newBalance });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const updateGoal = async (id: string, update: Partial<Goal>) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}/goals/${id}`;
    try {
      await updateDoc(doc(db, path), update);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const addGoal = async (goalData: Omit<Goal, 'id'>) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}/goals`;
    try {
      await addDoc(collection(db, path), goalData);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteGoal = async (id: string) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}/goals/${id}`;
    try {
      // Note: deleteDoc needs to be imported or use a custom helper
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const updateProfile = async (profile: Partial<UserProfile>) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}`;
    try {
      await setDoc(doc(db, path), {
        ...profile,
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const budgets = useMemo(() => {
    const categories: TransactionCategory[] = ['Food', 'Transport', 'Study', 'Fun', 'Shopping', 'Health'];
    return categories.map(cat => {
      const spent = transactions
        .filter(t => t.category === cat && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      return {
        category: cat,
        limit: 500,
        spent: spent
      };
    });
  }, [transactions]);

  const value = {
    authUser,
    userProfile,
    transactions,
    goals,
    budgets,
    isLoaded,
    isAuthLoading,
    addTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    updateProfile
  };

  return <FinancialContext.Provider value={value}>{children}</FinancialContext.Provider>;
};

export const useFinancialData = () => {
  const context = useContext(FinancialContext);
  if (context === undefined) {
    throw new Error('useFinancialData must be used within a FinancialProvider');
  }
  return context;
};
