import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency, formatCompactNumber } from '../lib/formatters';
import { ArrowDown, ArrowUp, PiggyBank, BookOpen, Coffee, Wallet, Bus, Target, ShoppingBag, HeartPulse, GraduationCap, Gamepad2 } from 'lucide-react';
import { motion } from 'motion/react';
import { formatDistanceToNow, isYesterday } from 'date-fns';
import { cn } from '../lib/utils';
import { GOAL_ICONS } from '../constants';

export const Dashboard: React.FC = () => {
  const { userProfile, transactions, goals, budgets } = useFinancialData();

  const totalIn = transactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalSaved = transactions.filter(t => t.type === 'saving').reduce((s, t) => s + t.amount, 0);

  const budgetUsedPercent = Math.min(100, (totalOut / (userProfile?.monthlyAllowance || 1200)) * 100);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Study': return <GraduationCap className="text-blue-400" />;
      case 'Food': return <Coffee className="text-secondary" />;
      case 'Income': return <Wallet className="text-emerald-400" />;
      case 'Savings': return <PiggyBank className="text-amber-400" />;
      case 'Transport': return <Bus className="text-blue-400" />;
      case 'Shopping': return <ShoppingBag className="text-pink-400" />;
      case 'Health': return <HeartPulse className="text-rose-400" />;
      case 'Fun': return <Gamepad2 className="text-purple-400" />;
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
      <GlassCard className="p-6 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full" />
        <p className="text-sm font-medium text-on-primary-container mb-1">Available Balance</p>
        <h2 className="text-4xl font-bold text-on-background">
          {formatCurrency(userProfile?.totalBalance || 0)}
        </h2>
        
        <div className="mt-8 space-y-3">
          <div className="flex justify-between items-end">
            <p className="text-sm text-on-surface-variant font-medium">Monthly Budget</p>
            <p className="text-sm font-bold text-secondary">{Math.round(budgetUsedPercent)}% used</p>
          </div>
          <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${budgetUsedPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full bg-gradient-to-r from-secondary to-orange-400 rounded-full shadow-[0_0_12px_rgba(78,222,163,0.3)]" 
            />
          </div>
        </div>
      </GlassCard>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <ArrowDown className="text-secondary mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-tighter">In</p>
          <p className="text-sm font-bold text-on-background">₹{formatCompactNumber(totalIn)}</p>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <ArrowUp className="text-error mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-tighter">Out</p>
          <p className="text-sm font-bold text-on-background">₹{formatCompactNumber(totalOut)}</p>
        </GlassCard>
        <GlassCard className="p-4 flex flex-col items-center justify-center text-center">
          <PiggyBank className="text-tertiary mb-2" size={20} />
          <p className="text-[10px] text-on-surface-variant mb-1 uppercase tracking-tighter">Saved</p>
          <p className="text-sm font-bold text-on-background">₹{formatCompactNumber(totalSaved)}</p>
        </GlassCard>
      </div>

      {/* Active Goal Pill */}
      {goals.length > 0 && (
        <GlassCard className="rounded-full px-6 py-4 flex items-center justify-between border-l-4 border-l-blue-600 shadow-lg">
          <div className="flex items-center gap-4">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle className="text-white/10" cx="20" cy="20" fill="none" r="18" stroke="currentColor" strokeWidth="3" />
                <circle 
                  className="text-blue-500" 
                  cx="20" cy="20" fill="none" r="18" 
                  stroke="currentColor" 
                  strokeDasharray="113" 
                  strokeDashoffset={113 - (113 * (goals[0].currentAmount / goals[0].targetAmount))} 
                  strokeWidth="3" 
                  strokeLinecap="round"
                />
              </svg>
              {GOAL_ICONS[goals[0].icon as keyof typeof GOAL_ICONS] ? (
                React.createElement(GOAL_ICONS[goals[0].icon as keyof typeof GOAL_ICONS], { size: 16, className: "text-blue-400" })
              ) : (
                <Target size={16} className="text-blue-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-bold text-on-background leading-tight">{goals[0].title}</p>
              <p className="text-[10px] text-on-surface-variant">Target: ₹{formatCompactNumber(goals[0].targetAmount)}</p>
            </div>
          </div>
          <span className="text-sm font-bold text-blue-400">{formatCurrency(goals[0].currentAmount)}</span>
        </GlassCard>
      )}

      {/* Recent Activity */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h3 className="text-lg font-bold text-on-background">Recent Activity</h3>
          <button className="text-sm font-medium text-blue-400">View All</button>
        </div>
        
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <div className="py-8 text-center text-on-surface-variant text-sm">No transactions yet!</div>
          ) : (
            transactions.slice(0, 5).map((tx) => (
              <GlassCard 
                key={tx.id} 
                activeScale 
                className="p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-on-background">{tx.description}</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wide">
                      {tx.category.toLowerCase() !== tx.description.toLowerCase() ? `${tx.category} • ` : ''}
                      {getRelativeDate(tx.date)}
                    </p>
                  </div>
                </div>
                <p className={cn(
                  "text-sm font-bold",
                  tx.type === 'expense' ? "text-error" : "text-secondary"
                )}>
                  {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                </p>
              </GlassCard>
            ))
          )}
        </div>
      </section>
    </div>
  );
};
