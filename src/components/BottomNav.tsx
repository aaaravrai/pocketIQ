import React from 'react';
import { Home, PlusCircle, Target, PieChart } from 'lucide-react';
import { cn } from '../lib/utils';

export type TabType = 'home' | 'add' | 'goals' | 'insights';

interface BottomNavProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ activeTab, onTabChange }) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Home', icon: Home },
    { id: 'add' as TabType, label: 'Add', icon: PlusCircle },
    { id: 'goals' as TabType, label: 'Goals', icon: Target },
    { id: 'insights' as TabType, label: 'Insights', icon: PieChart },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-8 pt-4 bg-white/10 backdrop-blur-2xl rounded-t-[24px] border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
      {tabs.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => onTabChange(id)}
          className={cn(
            "flex flex-col items-center justify-center transition-all duration-200 active:scale-90",
            activeTab === id 
              ? "text-blue-500 scale-110 font-bold" 
              : "text-on-surface-variant hover:text-blue-400"
          )}
        >
          <Icon size={24} strokeWidth={activeTab === id ? 2.5 : 2} />
          <span className="text-[10px] font-medium uppercase tracking-widest mt-1">
            {label}
          </span>
        </button>
      ))}
    </nav>
  );
};
