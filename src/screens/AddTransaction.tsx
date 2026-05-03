import React, { useState, useCallback } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { TransactionCategory, TransactionType } from '../types';
import { cn } from '../lib/utils';
import { Coffee, Bus, GraduationCap, Gamepad2, ShoppingBag, HeartPulse, ChevronLeft, Delete, CheckCircle, StickyNote, Wallet, PiggyBank } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORIES: { id: TransactionCategory; icon: any; label: string }[] = [
  { id: 'Food', icon: Coffee, label: 'Food' },
  { id: 'Transport', icon: Bus, label: 'Transport' },
  { id: 'Study', icon: GraduationCap, label: 'Study' },
  { id: 'Fun', icon: Gamepad2, label: 'Fun' },
  { id: 'Shopping', icon: ShoppingBag, label: 'Shopping' },
  { id: 'Health', icon: HeartPulse, label: 'Health' },
  { id: 'Income', icon: Wallet, label: 'Income' },
  { id: 'Savings', icon: PiggyBank, label: 'Savings' },
];

export const AddTransaction: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
  const { addTransaction, userProfile } = useFinancialData();
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState('0');
  const [category, setCategory] = useState<TransactionCategory>('Food');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentBalance = userProfile?.totalBalance || 0;
  const numAmount = parseFloat(amount);
  const isInsufficient = type === 'expense' && numAmount > currentBalance;

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') setCategory('Food');
    else if (newType === 'earning') setCategory('Income');
    else if (newType === 'saving') setCategory('Savings');
  };

  const handleKeyPress = useCallback((key: string) => {
    if (key === 'backspace' || key === 'Backspace') {
      setAmount(prev => prev.length <= 1 ? '0' : prev.slice(0, -1));
      return;
    }

    if (key === '.') {
      if (!amount.includes('.')) setAmount(prev => prev + '.');
      return;
    }

    // Only allow numbers
    if (!/^\d$/.test(key)) return;

    setAmount(prev => {
      if (prev === '0') return key;
      if (prev.includes('.')) {
        const parts = prev.split('.');
        if (parts[1].length >= 2) return prev;
      }
      if (prev.replace('.', '').length >= 10) return prev;
      return prev + key;
    });
  }, [amount]);

  React.useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Backspace') handleKeyPress('backspace');
      else if (e.key === '.') handleKeyPress('.');
      else if (/^\d$/.test(e.key)) handleKeyPress(e.key);
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleKeyPress]);

  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (type === 'expense' && numAmount > currentBalance) {
      setError(`Insufficient Funds! Your current balance is only ₹${currentBalance.toFixed(2)}.`);
      setTimeout(() => setError(null), 4000);
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      let finalDescription = note.trim();
      let finalCategory = category;

      if (type === 'earning') {
        finalCategory = 'Income';
        if (!finalDescription) finalDescription = 'Income';
      } else if (type === 'saving') {
        finalCategory = 'Savings';
        if (!finalDescription) finalDescription = 'Savings';
      } else if (!finalDescription) {
        finalDescription = `${category} Expense`;
      }

      await addTransaction({
        amount: numAmount,
        category: finalCategory,
        type,
        description: finalDescription
      });
      onComplete();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-140px)] gap-6 animate-in slide-in-from-bottom duration-500">
      {/* Type Toggle */}
      <div className="glass-card rounded-[24px] p-1 flex w-full">
        {(['expense', 'earning', 'saving'] as TransactionType[]).map((t) => (
          <button
            key={t}
            onClick={() => handleTypeChange(t)}
            className={cn(
              "flex-1 py-3 rounded-[20px] text-sm font-medium transition-all capitalize",
              type === t ? "bg-white/10 text-on-surface shadow-inner" : "text-on-surface-variant hover:text-on-surface"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Amount Display */}
      <div className="flex flex-col items-center justify-center py-8">
        <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest mb-2 opacity-60">Input Amount</span>
        <div className="flex items-center">
          <span className={cn("text-4xl font-black mr-2", isInsufficient ? "text-red-500" : "text-primary")}>₹ </span>
          <span className={cn("text-5xl font-black tracking-tighter transition-colors", isInsufficient ? "text-red-500" : "text-on-surface")}>{amount}</span>
          <motion.span 
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className={cn("w-1 h-12 rounded-full ml-1", isInsufficient ? "bg-red-500/40" : "bg-blue-500/40")} 
          />
        </div>
        <AnimatePresence>
          {isInsufficient && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-4"
            >
              Exceeds Available Balance (₹{currentBalance.toFixed(2)})
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      {/* Category Grid (Only for Expenses) */}
      {type === 'expense' && (
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.filter(cat => cat.id !== 'Income' && cat.id !== 'Savings').map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setCategory(id)}
              className={cn(
                "glass-card p-4 flex flex-col items-center gap-3 transition-all active:scale-95 group border border-transparent",
                category === id ? "border-blue-500/50 bg-blue-500/10" : "hover:bg-white/5"
              )}
            >
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center transition-transform group-hover:scale-110",
                category === id ? "bg-blue-500 text-on-primary" : "bg-primary-container text-on-primary-container"
              )}>
                <Icon size={24} />
              </div>
              <span className={cn("text-sm font-medium", category === id ? "text-blue-400" : "text-on-surface")}>
                {label}
              </span>
            </button>
          ))}
        </div>
      )}
      
      {/* Note Input */}
      <div className="px-1">
        <div className="glass-card flex items-center gap-3 px-4 py-3 border border-white/5 focus-within:border-blue-500/50 transition-colors">
          <StickyNote size={18} className="text-on-surface-variant" />
          <input 
            type="text"
            placeholder="Add a note (optional)..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-medium text-on-surface placeholder:text-on-surface-variant/50"
          />
        </div>
      </div>

      {/* Tactile Keypad */}
      <div className="mt-auto grid grid-cols-3 gap-y-4 gap-x-12 px-6 py-4">
        {[1,2,3,4,5,6,7,8,9,'.',0,'backspace'].map((k) => (
          <button
            key={k}
            onClick={() => handleKeyPress(k.toString())}
            className="h-12 text-2xl font-bold text-on-surface active:scale-75 transition-transform flex items-center justify-center hover:bg-white/5 rounded-full"
          >
            {k === 'backspace' ? <Delete size={24} className="text-on-surface-variant" /> : k}
          </button>
        ))}
      </div>

      {/* Save Button */}
      <div className="px-1 sticky bottom-0 bg-background/80 backdrop-blur-xl pt-2 pb-8 -mx-1">
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4"
            >
              <div className="glass-card bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center justify-center text-center">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-wider">{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        <button
          disabled={isSubmitting || parseFloat(amount) <= 0 || isInsufficient}
          onClick={handleSubmit}
          className={cn(
            "w-full py-5 rounded-[24px] font-bold text-xl transition-all flex items-center justify-center gap-2 shadow-xl",
            isSubmitting || parseFloat(amount) <= 0 || isInsufficient
              ? "bg-white/5 text-on-surface-variant opacity-50 cursor-not-allowed" 
              : "bg-blue-600 text-white shadow-blue-600/30 active:scale-95"
          )}
        >
          <span>{isSubmitting ? 'Processing...' : 'Save Transaction'}</span>
          {!isSubmitting && <CheckCircle size={24} />}
        </button>
      </div>
    </div>
  );
};
