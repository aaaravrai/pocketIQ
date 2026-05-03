import React from 'react';
import { Bell, Search, Sun, Moon } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';
import { useTheme } from '../context/ThemeContext';
import { Logo } from './Logo';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface TopAppBarProps {
  title?: string;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, onSearch, onNotifications, onProfile }) => {
  const { userProfile, dailySpent, monthlySpent, notifications } = useFinancialData();
  const { theme, toggleTheme } = useTheme();

  const alertCount = React.useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  const hasCriticalAlert = React.useMemo(() => {
    return notifications.some(n => !n.isRead && n.type === 'critical');
  }, [notifications]);

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-20 glass-card bg-surface/80 rounded-none border-b shadow-none">
      <div className="flex items-center gap-3">
        {userProfile?.avatar ? (
          <button 
            onClick={onProfile}
            className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-primary/20 active:scale-95 transition-transform"
          >
            <img 
              src={userProfile.avatar} 
              alt="Profile" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </button>
        ) : (
          <button 
            onClick={onProfile}
            className="w-10 h-10 rounded-2xl bg-surface border-2 border-primary/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <Logo className="scale-75" />
          </button>
        )}
        <div className="flex flex-col">
          {(!title || title === "PocketIQ") ? (
            <Logo withText size="sm" />
          ) : (
            <h1 className="text-xl font-black text-on-surface tracking-tighter leading-none">
              {title}
            </h1>
          )}
          {(!title || title === "PocketIQ") && (
            <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] ml-7">Smart Finance</span>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {userProfile?.streakCount !== undefined && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-500">
            <span className="text-[10px] font-black uppercase tracking-widest">{userProfile.streakCount}</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-xs"
            >
              🔥
            </motion.span>
          </div>
        )}

        <button 
          onClick={toggleTheme}
          className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-all active:scale-90 overflow-hidden relative w-10 h-10"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={theme}
              initial={{ y: 20, rotate: 45, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              exit={{ y: -20, rotate: -45, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 flex items-center justify-center"
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>

        {onSearch && (
          <button 
            onClick={onSearch}
            className="p-2.5 text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
          >
            <Search size={20} />
          </button>
        )}
        <button 
          onClick={onNotifications}
          className="p-2.5 text-on-surface-variant hover:text-on-surface transition-colors active:scale-95 relative"
        >
          <Bell size={20} />
          <AnimatePresence>
            {alertCount > 0 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  filter: hasCriticalAlert ? ['brightness(1)', 'brightness(1.5)', 'brightness(1)'] : 'brightness(1)',
                  boxShadow: hasCriticalAlert ? ['0 0 0px rgba(244,63,94,0)', '0 0 10px rgba(244,63,94,0.5)', '0 0 0px rgba(244,63,94,0)'] : 'none'
                }}
                exit={{ scale: 0, opacity: 0 }}
                transition={{ 
                  type: 'spring', 
                  stiffness: 500, 
                  damping: 15,
                  filter: { repeat: Infinity, duration: 1.5 },
                  boxShadow: { repeat: Infinity, duration: 1.5 }
                }}
                className={cn(
                  "absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] font-black text-white shadow-lg",
                  hasCriticalAlert ? "bg-rose-500 shadow-rose-500/40" : "bg-emerald-500 shadow-emerald-500/40"
                )}
              >
                <motion.span
                  key={alertCount}
                  initial={{ y: 5, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                >
                  {alertCount}
                </motion.span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>
      </div>
    </header>
  );
};
