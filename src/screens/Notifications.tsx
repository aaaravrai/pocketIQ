import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AlertTriangle, Bell, Wallet, ChevronRight, Save, ShieldAlert, Zap, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';

export const Notifications: React.FC = () => {
  const { userProfile, updateProfile, dailySpent, transactions } = useFinancialData();
  
  const [minBalance, setMinBalance] = useState(userProfile?.minBalanceThreshold || 5000);
  const [dailyLimit, setDailyLimit] = useState(userProfile?.dailySpendLimit || 1500);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.minBalanceThreshold) setMinBalance(userProfile.minBalanceThreshold);
    if (userProfile?.dailySpendLimit) setDailyLimit(userProfile.dailySpendLimit);
  }, [userProfile]);

  const toggle = async (key: 'isLowBalanceEnabled' | 'isDailySpendEnabled') => {
    if (!userProfile) return;
    await updateProfile({ [key]: !userProfile[key] });
  };

  const handleSaveSettings = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        minBalanceThreshold: Number(minBalance),
        dailySpendLimit: Number(dailyLimit)
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentBalance = userProfile?.totalBalance || 0;
  const isBalanceBreached = (userProfile?.isLowBalanceEnabled) && (currentBalance < (userProfile?.minBalanceThreshold || 0));
  const isDailyLimitBreached = (userProfile?.isDailySpendEnabled) && (dailySpent > (userProfile?.dailySpendLimit || 0));
  
  const monthlySpend = transactions
    .filter(t => t.type === 'expense' && t.date.startsWith(new Date().toISOString().slice(0, 7)))
    .reduce((sum, t) => sum + t.amount, 0);
  
  const isBudgetBreached = monthlySpend > (userProfile?.monthlyAllowance || 0);

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Financial Watch</h1>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1 pl-0.5">Alert Management</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <ShieldAlert size={24} />
        </div>
      </div>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2 opacity-60 flex items-center gap-2">
          <Zap size={12} /> Active Intelligence
        </h3>
        
        <AnimatePresence mode="popLayout">
          {isBalanceBreached && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassCard className="p-5 flex gap-4 items-start relative border-red-500/30 bg-red-500/5 overflow-hidden group">
                <motion.div 
                  animate={{ opacity: [0.1, 0.2, 0.1] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="absolute inset-0 bg-red-500/10 pointer-events-none" 
                />
                <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center flex-shrink-0 border border-red-500/30">
                  <AlertTriangle className="text-red-500" size={24} />
                </div>
                <div className="flex-1 space-y-1 z-10">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-red-500 uppercase tracking-tight">Minimum Balance Breach</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Critical</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Intelligence suggests your liquidity has dropped below your set safety threshold of {formatCurrency(userProfile?.minBalanceThreshold || 0)}.
                  </p>
                  <div className="mt-4 bg-on-surface/5 rounded-2xl p-4 border border-on-surface/5 flex justify-between items-center">
                    <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Liquid Assets</span>
                    <span className="text-base font-black text-red-500">{formatCurrency(currentBalance)}</span>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {isDailyLimitBreached && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassCard className="p-5 flex gap-4 items-start relative border-amber-500/30 bg-amber-500/5 group">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/20 flex items-center justify-center flex-shrink-0 border border-amber-500/30">
                  <TrendingDown className="text-amber-500" size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-amber-500 uppercase tracking-tight">Daily Spending Surge</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Warning</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Experimental tracking shows your daily spending ({formatCurrency(dailySpent)}) has exceeded your mission limit of {formatCurrency(userProfile?.dailySpendLimit || 0)}.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {isBudgetBreached && (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
            >
              <GlassCard className="p-5 flex gap-4 items-start border-primary/30 bg-primary/5">
                <div className="w-12 h-12 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0 border border-primary/30">
                  <Wallet className="text-primary" size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm font-black text-primary uppercase tracking-tight">Monthly Threshold Reached</h4>
                    <span className="text-[10px] font-bold text-on-surface-variant uppercase">Monitor</span>
                  </div>
                  <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                    Strategic mission update: You've consumed your total monthly budget of {formatCurrency(userProfile?.monthlyAllowance || 0)}. Any further action requires review.
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          )}

          {!isBalanceBreached && !isDailyLimitBreached && !isBudgetBreached && (
            <motion.div 
              layout
              className="py-12 flex flex-col items-center justify-center text-center space-y-3 opacity-40"
            >
              <div className="w-16 h-16 rounded-3xl bg-on-surface/5 flex items-center justify-center">
                <Bell className="text-on-surface-variant" size={32} />
              </div>
              <div>
                <p className="text-sm font-black text-on-surface uppercase tracking-widest">No Active Incidents</p>
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Status: Operational</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      <section className="space-y-4">
        <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] px-2 opacity-60">System Configurations</h3>
        
        <GlassCard className="overflow-hidden border-primary/10">
          <div className="p-6 space-y-6">
            {/* Low Balance Setting */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase tracking-tight">Minimum Buffer</h4>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Mission critical baseline</p>
                </div>
                <button 
                  onClick={() => toggle('isLowBalanceEnabled')}
                  className={cn(
                    "w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300",
                    userProfile?.isLowBalanceEnabled ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-on-surface/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: userProfile?.isLowBalanceEnabled ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg" 
                  />
                </button>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={minBalance}
                  onChange={(e) => setMinBalance(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                  placeholder="Set threshold..."
                />
              </div>
            </div>

            <div className="h-px bg-on-surface/5 mx--6" />

            {/* Daily Limit Setting */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="space-y-0.5">
                  <h4 className="text-sm font-black uppercase tracking-tight">Daily Threshold</h4>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Operational daily cap</p>
                </div>
                <button 
                  onClick={() => toggle('isDailySpendEnabled')}
                  className={cn(
                    "w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300",
                    userProfile?.isDailySpendEnabled ? "bg-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "bg-on-surface/10"
                  )}
                >
                  <motion.div 
                    animate={{ x: userProfile?.isDailySpendEnabled ? 24 : 0 }}
                    className="w-4 h-4 bg-white rounded-full shadow-lg" 
                  />
                </button>
              </div>
              
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={dailyLimit}
                  onChange={(e) => setDailyLimit(e.target.value === '' ? 0 : Number(e.target.value))}
                  className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                  placeholder="Set limit..."
                />
              </div>
            </div>

            <button 
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
            >
              {isSaving ? 'Syncing...' : 'Save Configuration'} <Save size={16} />
            </button>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
