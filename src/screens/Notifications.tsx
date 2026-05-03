import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { AlertTriangle, Bell, Wallet, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion } from 'motion/react';

export const Notifications: React.FC = () => {
  const [settings, setSettings] = useState({
    lowBalance: true,
    dailySpend: false,
    smartInsights: true
  });

  const toggle = (key: keyof typeof settings) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold text-on-surface">Alerts & Notifications</h1>
        <p className="text-sm text-on-surface-variant">Stay on top of your financial health.</p>
      </div>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest px-1">Smart Alerts</h3>
        
        {/* Balance Breach Alert */}
        <GlassCard className="p-4 flex gap-4 items-start relative group active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full bg-error-container/30 flex items-center justify-center flex-shrink-0 border border-error/20">
            <AlertTriangle className="text-error" size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-error">Minimum Balance Breach</h4>
              <span className="text-[10px] text-on-surface-variant">Just now</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Your primary checking account has fallen below your set threshold.
            </p>
            <div className="mt-3 bg-white/5 rounded-xl p-3 border border-white/5 flex justify-between items-center">
              <span className="text-[10px] text-on-surface-variant">Current Balance</span>
              <span className="text-sm font-bold text-error">₹2,450.00</span>
            </div>
          </div>
        </GlassCard>

        {/* Budget Limit Alert */}
        <GlassCard className="p-4 flex gap-4 items-start active:scale-95 transition-transform">
          <div className="w-10 h-10 rounded-full bg-secondary-container/20 flex items-center justify-center flex-shrink-0 border border-secondary/20">
            <Wallet className="text-secondary" size={20} />
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex justify-between items-center">
              <h4 className="text-sm font-bold text-on-surface">Budget Limit Reached</h4>
              <span className="text-[10px] text-on-surface-variant">2h ago</span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              You have consumed 100% of your <span className="text-secondary font-bold">Dining Out</span> budget. Future expenses will draw from savings.
            </p>
          </div>
        </GlassCard>
      </section>

      <section className="space-y-3">
        <h3 className="text-xs font-bold text-blue-500 uppercase tracking-widest px-1">Settings</h3>
        <GlassCard className="divide-y divide-white/5">
          <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors" onClick={() => toggle('lowBalance')}>
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Low Balance Warning</h4>
              <p className="text-[10px] text-on-surface-variant">Notify when balance drops below ₹5,000</p>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300",
              settings.lowBalance ? "bg-blue-600" : "bg-surface-variant"
            )}>
              <motion.div 
                animate={{ x: settings.lowBalance ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-lg" 
              />
            </div>
          </div>

          <div className="p-5 flex justify-between items-center hover:bg-white/5 transition-colors" onClick={() => toggle('dailySpend')}>
            <div className="space-y-1">
              <h4 className="text-sm font-bold">Daily Spend Limit</h4>
              <p className="text-[10px] text-on-surface-variant">Alert if daily expenses exceed ₹1,500</p>
            </div>
            <div className={cn(
              "w-12 h-6 rounded-full flex items-center p-1 transition-all duration-300",
              settings.dailySpend ? "bg-blue-600" : "bg-surface-variant"
            )}>
              <motion.div 
                animate={{ x: settings.dailySpend ? 24 : 0 }}
                className="w-4 h-4 bg-white rounded-full shadow-lg" 
              />
            </div>
          </div>
        </GlassCard>
      </section>
    </div>
  );
};
