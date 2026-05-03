import React, { useState, useEffect } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AlertTriangle, Bell, Wallet, ChevronLeft, Save, ShieldAlert, Zap, TrendingDown, ArrowLeft, X, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';

export const Notifications: React.FC<{ onClose?: () => void }> = ({ onClose }) => {
  const { userProfile, updateProfile, dailySpent } = useFinancialData();
  
  const [minBalance, setMinBalance] = useState(userProfile?.minBalanceThreshold || 5000);
  const [dailyLimit, setDailyLimit] = useState(userProfile?.dailySpendLimit || 1500);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (userProfile?.minBalanceThreshold) setMinBalance(userProfile.minBalanceThreshold);
    if (userProfile?.dailySpendLimit) setDailyLimit(userProfile.dailySpendLimit);
  }, [userProfile]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && onClose) onClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

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

  const { notifications, markNotificationRead, markAllNotificationsRead } = useFinancialData();

  useEffect(() => {
    // Option A: Auto mark all as read when viewed
    const timer = setTimeout(() => {
      if (notifications.some(n => !n.isRead)) {
        markAllNotificationsRead();
      }
    }, 1500); // 1.5s delay so user can see what's new before they clear
    return () => clearTimeout(timer);
  }, [notifications.length]); // Re-run if more notifications arrive while open

  const handleClearAll = async () => {
    await markAllNotificationsRead();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md"
    >
      {/* Overlay for Outside Click */}
      <div 
        className="absolute inset-0 cursor-default" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-md z-10"
      >
        <GlassCard className="p-6 space-y-8 overflow-y-auto max-h-[85vh] bg-background/95 border-primary/20 shadow-2xl hide-scrollbar relative">
          {/* Physical Header */}
          <div className="flex items-center justify-between border-b border-on-surface/5 pb-4 mb-2">
            <button 
              onClick={onClose}
              className="flex items-center gap-2 group"
            >
              <div className="w-8 h-8 rounded-lg bg-on-surface/5 flex items-center justify-center text-on-surface-variant group-hover:bg-primary/10 group-hover:text-primary transition-all">
                <ArrowLeft size={18} />
              </div>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest group-hover:text-primary transition-colors">Back</span>
            </button>
            <button 
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-on-surface/5 flex items-center justify-center text-on-surface-variant hover:bg-red-500/10 hover:text-red-500 transition-all"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex justify-between items-end">
            <div>
              <h1 className="text-3xl font-black text-on-surface tracking-tight">Financial Watch</h1>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] pl-0.5">Alert Management</p>
                {notifications.some(n => !n.isRead) && (
                  <button 
                    onClick={handleClearAll}
                    className="text-[10px] font-black text-primary/60 hover:text-primary uppercase tracking-widest transition-colors flex items-center gap-1"
                  >
                    Clear All
                  </button>
                )}
              </div>
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
              {notifications.length > 0 ? notifications.map((notif) => (
                <motion.div
                  key={notif.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                >
                  <GlassCard 
                    onClick={() => !notif.isRead && markNotificationRead(notif.id)}
                    className={cn(
                      "p-5 flex gap-4 items-start relative border-primary/20 cursor-pointer transition-all active:scale-[0.98]",
                      !notif.isRead 
                        ? notif.type === 'critical'
                          ? "bg-gradient-to-br from-rose-500/10 to-amber-500/10 border-rose-500/40 shadow-[0_0_20px_rgba(244,63,94,0.15)] animate-pulse-subtle"
                          : "bg-gradient-to-br from-emerald-500/10 to-indigo-500/10 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]" 
                        : "bg-on-surface/5 opacity-60"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                      !notif.isRead 
                        ? notif.type === 'critical' 
                          ? "bg-rose-500/20 text-rose-500" 
                          : "bg-emerald-500/20 text-emerald-500" 
                        : "bg-primary/10 text-primary"
                    )}>
                      {notif.type === 'critical' ? (
                        <ShieldAlert size={20} />
                      ) : notif.type === 'split' ? (
                        <Users size={20} />
                      ) : (
                        <Bell size={20} />
                      )}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex justify-between items-center">
                        <h4 className={cn(
                          "text-sm font-black uppercase tracking-tight",
                          !notif.isRead 
                            ? notif.type === 'critical' ? "text-rose-500" : "text-emerald-500" 
                            : "text-on-surface"
                        )}>{notif.title}</h4>
                        {!notif.isRead && (
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "text-[8px] font-black uppercase tracking-tighter",
                              notif.type === 'critical' ? "text-rose-500" : "text-emerald-500"
                            )}>
                              {notif.type === 'critical' ? 'Urgent' : 'New'}
                            </span>
                            <div className={cn(
                              "w-2 h-2 rounded-full animate-pulse",
                              notif.type === 'critical' ? "bg-rose-500" : "bg-emerald-500"
                            )} />
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-on-surface-variant leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      <p className="text-[8px] font-bold text-on-surface-variant uppercase tracking-widest pt-1">
                        {new Date(notif.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </GlassCard>
                </motion.div>
              )) : (
                <motion.div 
                  key="no-incidents"
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
        </GlassCard>
      </motion.div>
    </motion.div>
  );
};
