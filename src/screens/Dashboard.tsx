import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency, formatCompactNumber } from '../lib/formatters';
import { 
  ArrowDown, ArrowUp, PiggyBank, BookOpen, Coffee, Wallet, 
  Bus, Target, ShoppingBag, HeartPulse, GraduationCap, 
  Gamepad2, Sparkles, Users, UserMinus, BellRing, Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { formatDistanceToNow, isYesterday } from 'date-fns';
import { cn } from '../lib/utils';
import { GOAL_ICONS } from '../constants';
import { SplitBillModal } from '../components/SplitBillModal';

export const Dashboard: React.FC = () => {
  const { userProfile, transactions, goals, budgets, splitBills, settleSplitBill } = useFinancialData();
  const [showSplitModal, setShowSplitModal] = useState(false);

  const totalIn = transactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalSaved = transactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);

  const budgetUsedPercent = Math.min(100, (totalOut / (userProfile?.monthlyAllowance || 1200)) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Study': return <GraduationCap className="text-primary" />;
      case 'Food': return <Coffee className="text-secondary" />;
      case 'Income': return <Wallet className="text-primary" />;
      case 'Savings': return <PiggyBank className="text-primary" />;
      case 'Transport': return <Bus className="text-primary" />;
      case 'Shopping': return <ShoppingBag className="text-pink-500" />;
      case 'Health': return <HeartPulse className="text-rose-500" />;
      case 'Fun': return <Gamepad2 className="text-purple-500" />;
      default: return <Wallet />;
    }
  };

  const getRelativeDate = (date: string) => {
    const d = new Date(date);
    if (isYesterday(d)) return 'Yesterday';
    return formatDistanceToNow(d, { addSuffix: true }).replace('about ', '');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Balance Card */}
      <GlassCard className="p-6 relative overflow-hidden border-2 border-primary/20">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary/20 blur-[60px] rounded-full" />
        <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest mb-1 opacity-80 pl-1">Available Balance</p>
        <h2 className="text-4xl font-black text-on-surface tracking-tight">
          {formatCurrency(userProfile?.totalBalance || 0)}
        </h2>
        
        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-end px-1">
            <p className="text-xs text-on-surface-variant font-bold uppercase tracking-wider">Monthly Budget</p>
            <p className="text-xs font-black text-primary">{Math.round(budgetUsedPercent)}% used</p>
          </div>
          <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-primary to-emerald-400 rounded-full" 
            />
          </div>
        </div>
      </GlassCard>

      {/* AI Coach Insights */}
      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2 opacity-60 flex items-center gap-2">
          <Sparkles size={12} /> Strategic Insight
        </h3>
        <GlassCard className="p-5 border-emerald-500/20 bg-emerald-500/5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl -mr-12 -mt-12" />
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="text-emerald-500" size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-black text-emerald-500 uppercase tracking-tight">Budget Coach</h4>
              <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
                {userProfile && (totalOut / userProfile.monthlyAllowance) > 0.4 ? 
                  "Spending detected in 'Food' exceeds 40% of mission parameters. Consider optimizing your cafeteria strategy." :
                  "Operational efficiency high. You've saved 15% more than last semester. Keep this trajectory."}
              </p>
            </div>
          </div>
        </GlassCard>
      </section>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center border-none">
          <ArrowDown className="text-emerald-500 mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-tighter">In</p>
          <p className="text-xs font-black text-on-surface">₹{formatCompactNumber(totalIn)}</p>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center border-none">
          <ArrowUp className="text-red-500 mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-tighter">Out</p>
          <p className="text-xs font-black text-on-surface">₹{formatCompactNumber(totalOut)}</p>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center border-none">
          <PiggyBank className="text-primary mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-0.5 font-bold uppercase tracking-tighter">Saved</p>
          <p className="text-xs font-black text-on-surface">₹{formatCompactNumber(totalSaved)}</p>
        </GlassCard>
      </div>

      {/* Active Goal Pill */}
      {goals.length > 0 && (
        <GlassCard className="rounded-[40px] px-6 py-5 flex items-center justify-between border-2 border-primary/20 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="relative w-12 h-12 flex items-center justify-center bg-primary/10 rounded-2xl">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-on-surface/5" cx="24" cy="24" fill="none" r="20" stroke="currentColor" strokeWidth="3" />
                <circle 
                  className="text-primary" 
                  cx="24" cy="24" fill="none" r="20" 
                  stroke="currentColor" 
                  strokeDasharray="125.6" 
                  strokeDashoffset={125.6 - (125.6 * (goals[0].currentAmount / goals[0].targetAmount))} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              </svg>
              {GOAL_ICONS[goals[0].icon as keyof typeof GOAL_ICONS] ? (
                React.createElement(GOAL_ICONS[goals[0].icon as keyof typeof GOAL_ICONS], { size: 18, className: "text-primary transition-colors" })
              ) : (
                <Target size={18} className="text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-black text-on-surface leading-tight tracking-tight">{goals[0].title}</p>
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-0.5 pl-0.5">Target: ₹{formatCompactNumber(goals[0].targetAmount)}</p>
            </div>
          </div>
          <span className="text-sm font-black text-primary bg-primary/5 px-3 py-1.5 rounded-full">{formatCompactNumber(goals[0].currentAmount / goals[0].targetAmount * 100)}%</span>
        </GlassCard>
      )}

      {/* Shared Expenses / Who Owes Me */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-on-surface tracking-tight">Shared Logistics</h3>
          <button 
            onClick={() => setShowSplitModal(true)}
            className="w-8 h-8 bg-primary/10 text-primary rounded-xl flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            <Plus size={18} />
          </button>
        </div>

        <div className="space-y-2.5">
          {splitBills.length > 0 ? (
            splitBills.filter(b => b.roommates.some(r => !r.settled)).slice(0, 2).map(bill => (
              <GlassCard key={bill.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Users className="text-primary" size={18} />
                    </div>
                    <div>
                      <p className="text-sm font-black text-on-surface capitalize">{bill.description}</p>
                      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">{formatCurrency(bill.amount)} Total</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-primary">₹{bill.roommates.reduce((s, r) => s + (r.settled ? 0 : r.amount), 0)}</p>
                    <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-tighter">Outstanding</p>
                  </div>
                </div>
                
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {bill.roommates.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => !r.settled && settleSplitBill(bill.id, r.email)}
                      className={cn(
                        "flex-shrink-0 px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all",
                        r.settled ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:bg-primary/10 hover:border-primary/20"
                      )}
                    >
                      {r.name} {r.settled ? '✓' : `₹${Math.round(r.amount)}`}
                    </button>
                  ))}
                </div>
              </GlassCard>
            ))
          ) : (
            <div className="p-4 text-center bg-on-surface/5 rounded-2xl border border-dashed border-on-surface/10">
              <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">No shared expenses tracked</p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-black text-on-surface tracking-tight">Recent Log</h3>
          <button className="text-xs font-bold text-primary uppercase tracking-widest">History</button>
        </div>
        
        <div className="space-y-2.5">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant text-sm font-medium">No transactions yet!</div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <GlassCard 
                key={tx.id} 
                activeScale 
                className="p-4 flex items-center justify-between border-primary/5 hover:border-primary/20 transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-surface leading-tight tracking-tight">{tx.description}</p>
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">
                      {tx.category.toLowerCase() !== tx.description.toLowerCase() ? `${tx.category} • ` : ''}
                      {getRelativeDate(tx.date)}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm font-black",
                  tx.type === 'expense' ? "text-red-500" : "text-emerald-500"
                )}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </p>
              </GlassCard>
            ))
          )}
        </div>
      </section>

      <AnimatePresence>
        {showSplitModal && <SplitBillModal onClose={() => setShowSplitModal(false)} />}
      </AnimatePresence>
    </div>
  );
};
