import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit,
  setDoc, 
  addDoc, 
  updateDoc, 
  onSnapshot,
  getDocFromServer
} from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { db, auth } from '../lib/firebase';
import { Transaction, Goal, Budget, UserProfile, TransactionType, TransactionCategory, SplitBill, Notification } from '../types';

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
  dailySpent: number;
  monthlySpent: number;
  splitBills: SplitBill[];
  notifications: Notification[];
  isLoaded: boolean;
  isAuthLoading: boolean;
  addTransaction: (tx: Omit<Transaction, 'id' | 'date'>) => Promise<void>;
  addGoal: (goal: Omit<Goal, 'id'>) => Promise<void>;
  updateGoal: (id: string, update: Partial<Goal>) => Promise<void>;
  deleteGoal: (id: string) => Promise<void>;
  fundGoal: (goalId: string, amount: number) => Promise<void>;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
  addSplitBill: (bill: Omit<SplitBill, 'id' | 'date' | 'payerId'>) => Promise<void>;
  settleSplitBill: (billId: string, roommateEmail: string) => Promise<void>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  sendNotification: (email: string, notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<(UserProfile & { userId: string, onboarded?: boolean }) | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [splitBills, setSplitBills] = useState<SplitBill[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
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

    const unsubNotifications = onSnapshot(query(collection(db, 'users', authUser.uid, 'notifications'), orderBy('date', 'desc')), (snapshot) => {
      setNotifications(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Notification));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/notifications`));

    const goalsQuery = collection(db, 'users', authUser.uid, 'goals');
    const unsubGoals = onSnapshot(goalsQuery, (snapshot) => {
      setGoals(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as Goal));
      setIsLoaded(true);
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/goals`));

    const unsubSplitBills = onSnapshot(query(collection(db, 'users', authUser.uid, 'splitBills')), (snapshot) => {
      setSplitBills(snapshot.docs.map(d => ({ ...d.data(), id: d.id }) as SplitBill));
    }, (error) => handleFirestoreError(error, OperationType.LIST, `users/${authUser.uid}/splitBills`));

    return () => {
      unsubProfile();
      unsubTx();
      unsubNotifications && unsubNotifications();
      unsubGoals();
      unsubSplitBills && unsubSplitBills();
    };
  }, [authUser]);

  const addTransaction = async (txData: Omit<Transaction, 'id' | 'date'>) => {
    if (!authUser || !userProfile) return;
    
    // Liquidity Check
    if (txData.type === 'expense' && txData.amount > (userProfile.totalBalance || 0)) {
      throw new Error(`Insufficient Funds! Your current balance is only ₹${(userProfile.totalBalance || 0).toFixed(2)}.`);
    }

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
      
      // Streak Logic
      const today = new Date().toISOString().split('T')[0];
      const lastActive = userProfile.lastActiveDate || '';
      let newStreak = userProfile.streakCount || 0;
      
      if (lastActive !== today) {
        newStreak += 1;
      }

      // Badge Logic
      const newBadges = [...(userProfile.badges || [])];
      if (newBalance >= 1000 && !newBadges.includes('First ₹1k Saved')) {
        newBadges.push('First ₹1k Saved');
      }
      if (newStreak >= 7 && !newBadges.includes('Budget Master')) {
        newBadges.push('Budget Master');
      }

      await updateDoc(doc(db, 'users', authUser.uid), { 
        totalBalance: newBalance,
        streakCount: newStreak,
        lastActiveDate: today,
        badges: newBadges
      });

      // --- BREACH CHECKS & NOTIFICATIONS ---
      // 1. Low Balance
      if (userProfile.isLowBalanceEnabled && newBalance < (userProfile.minBalanceThreshold || 0)) {
        await addDoc(collection(db, 'users', authUser.uid, 'notifications'), {
          type: 'critical',
          title: 'Critical: Low Balance',
          message: `Your balance is below your threshold: ${new Date().toLocaleTimeString()}`,
          date: new Date().toISOString(),
          isRead: false
        });
      }

      // 2. Daily Limit
      const newDailySpent = dailySpent + (txData.type === 'expense' ? txData.amount : 0);
      if (userProfile.isDailySpendEnabled && newDailySpent > (userProfile.dailySpendLimit || 0)) {
        await addDoc(collection(db, 'users', authUser.uid, 'notifications'), {
          type: 'critical',
          title: 'Critical: Daily Limit',
          message: `You have exceeded your daily limit of ${userProfile.dailySpendLimit}.`,
          date: new Date().toISOString(),
          isRead: false
        });
      }

      // 3. Monthly Budget
      const newMonthlySpent = monthlySpent + (txData.type === 'expense' ? txData.amount : 0);
      if (newMonthlySpent > userProfile.monthlyAllowance) {
        await addDoc(collection(db, 'users', authUser.uid, 'notifications'), {
          type: 'critical',
          title: 'Critical: Over Budget',
          message: `You have breached your monthly allowance of ${userProfile.monthlyAllowance}.`,
          date: new Date().toISOString(),
          isRead: false
        });
      }

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

  const addSplitBill = async (billData: Omit<SplitBill, 'id' | 'date' | 'payerId'>) => {
    if (!authUser || !userProfile) return;

    // Liquidity Check: User must be able to afford the total bill they are initiating/fronting
    if (billData.amount > (userProfile.totalBalance || 0)) {
      throw new Error(`Insufficient Funds! Your current balance is only ₹${(userProfile.totalBalance || 0).toFixed(2)}.`);
    }

    const path = `users/${authUser.uid}/splitBills`;
    try {
      const splitDoc = {
        ...billData,
        date: new Date().toISOString(),
        payerId: authUser.uid
      };
      
      // 1. Save to user's private splits
      const docRef = await addDoc(collection(db, path), splitDoc);
      
      // 2. Save to global_splits for formal tracking
      await addDoc(collection(db, 'global_splits'), {
        ...splitDoc,
        billId: docRef.id,
        initiatedBy: userProfile.name,
        initiatedByEmail: userProfile.email
      });

      // 3. Send notifications to roommates
      for (const roommate of billData.roommates) {
        if (!roommate.email) continue;

        // Check if roommate is a registered user
        const usersQuery = query(collection(db, 'users'), where('email', '==', roommate.email), limit(1));
        const userSnapshot = await getDocs(usersQuery);
        
        if (!userSnapshot.empty) {
          const roommateUid = userSnapshot.docs[0].id;
          const notificationPath = `users/${roommateUid}/notifications`;
          await addDoc(collection(db, notificationPath), {
            type: 'split',
            title: 'New Split Request',
            message: `${userProfile.name} requested ₹${roommate.amount.toFixed(2)} for ${billData.description}`,
            date: new Date().toISOString(),
            isRead: false,
            senderName: userProfile.name,
            senderId: authUser.uid,
            amount: roommate.amount,
            billId: docRef.id
          });
        } else {
          // Mock "Theoretical Gmail/Invite Link" for non-registered users
          console.log(`Theoretical Gmail Notification sent to ${roommate.email}: Invite Link to PocketIQ generated.`);
        }
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const settleSplitBill = async (billId: string, roommateEmail: string) => {
    if (!authUser) return;
    const bill = splitBills.find(b => b.id === billId);
    if (!bill) return;

    const updatedRoommates = bill.roommates.map(r => 
      r.email === roommateEmail ? { ...r, settled: true } : r
    );

    const path = `users/${authUser.uid}/splitBills/${billId}`;
    try {
      await updateDoc(doc(db, path), { roommates: updatedRoommates });
      
      // Update global_splits too
      const globalQuery = query(collection(db, 'global_splits'), where('billId', '==', billId));
      const globalSnapshot = await getDocs(globalQuery);
      if (!globalSnapshot.empty) {
        await updateDoc(doc(db, 'global_splits', globalSnapshot.docs[0].id), { roommates: updatedRoommates });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const markNotificationRead = async (id: string) => {
    if (!authUser) return;
    const path = `users/${authUser.uid}/notifications/${id}`;
    try {
      await updateDoc(doc(db, path), { isRead: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const markAllNotificationsRead = async () => {
    if (!authUser || notifications.length === 0) return;
    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);
      const unreadNotifications = notifications.filter(n => !n.isRead);
      
      unreadNotifications.forEach(n => {
        const ref = doc(db, 'users', authUser.uid, 'notifications', n.id);
        batch.update(ref, { isRead: true });
      });
      
      await batch.commit();
    } catch (error) {
      console.error("Error marking all read:", error);
    }
  };

  const sendNotification = async (email: string, notificationData: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
    if (!authUser) return;
    try {
      const usersQuery = query(collection(db, 'users'), where('email', '==', email), limit(1));
      const userSnapshot = await getDocs(usersQuery);
      
      if (!userSnapshot.empty) {
        const roommateUid = userSnapshot.docs[0].id;
        const notificationPath = `users/${roommateUid}/notifications`;
        await addDoc(collection(db, notificationPath), {
          ...notificationData,
          date: new Date().toISOString(),
          isRead: false
        });
      } else {
        // Invite link theoretical trigger
        console.log(`Theoretical Invite for ${email}: https://pocketiq.app/join?referrer=${authUser.uid}`);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `notifications_proxy/${email}`);
    }
  };

  const fundGoal = async (goalId: string, amount: number) => {
    if (!authUser || !userProfile) return;
    
    // 1. Validation
    if (amount > (userProfile.totalBalance || 0)) {
      throw new Error(`Insufficient balance to fund this goal. Your current balance is ₹${(userProfile.totalBalance || 0).toFixed(2)}`);
    }

    const goal = goals.find(g => g.id === goalId);
    if (!goal) throw new Error("Goal not found");

    try {
      const { writeBatch } = await import('firebase/firestore');
      const batch = writeBatch(db);

      // 2. Update Goal currentAmount
      const goalRef = doc(db, 'users', authUser.uid, 'goals', goalId);
      batch.update(goalRef, { currentAmount: goal.currentAmount + amount });

      // 3. Update User Balance
      const userRef = doc(db, 'users', authUser.uid);
      const newBalance = (userProfile.totalBalance || 0) - amount;
      batch.update(userRef, { totalBalance: newBalance });

      // 4. Record as hidden transaction
      const txRef = doc(collection(db, 'users', authUser.uid, 'transactions'));
      batch.set(txRef, {
        amount,
        category: 'Savings/Goal',
        type: 'expense',
        description: `Contributed to goal: ${goal.title}`,
        date: new Date().toISOString(),
        userId: authUser.uid
      });

      await batch.commit();
      
      // If target reached, send success notification
      if (goal.currentAmount + amount >= goal.targetAmount) {
        await addDoc(collection(db, 'users', authUser.uid, 'notifications'), {
          type: 'info',
          title: 'Goal Achieved! 🎉',
          message: `Mission Accomplished: You've reached your target for "${goal.title}"!`,
          date: new Date().toISOString(),
          isRead: false
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `fund_goal/${goalId}`);
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

  const dailySpent = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(today))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const monthlySpent = useMemo(() => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    return transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(currentMonth))
      .reduce((sum, t) => sum + t.amount, 0);
  }, [transactions]);

  const value = {
    authUser,
    userProfile,
    transactions,
    goals,
    budgets,
    dailySpent,
    monthlySpent,
    splitBills,
    notifications,
    isLoaded,
    isAuthLoading,
    addTransaction,
    addGoal,
    updateGoal,
    deleteGoal,
    fundGoal,
    updateProfile,
    addSplitBill,
    settleSplitBill,
    markNotificationRead,
    markAllNotificationsRead,
    sendNotification
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
