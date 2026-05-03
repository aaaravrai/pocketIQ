import React from 'react';
import { Bell, Search } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';

interface TopAppBarProps {
  title?: string;
  onSearch?: () => void;
  onNotifications?: () => void;
  onProfile?: () => void;
}

export const TopAppBar: React.FC<TopAppBarProps> = ({ title, onSearch, onNotifications, onProfile }) => {
  const { userProfile } = useFinancialData();

  return (
    <header className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-5 h-16 bg-white/5 backdrop-blur-lg border-b border-white/10 shadow-none">
      <div className="flex items-center gap-3">
        {userProfile?.avatar ? (
          <button 
            onClick={onProfile}
            className="w-8 h-8 rounded-full overflow-hidden border border-white/20 active:scale-95 transition-transform"
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
            className="w-8 h-8 rounded-full bg-primary-container border border-white/20 flex items-center justify-center active:scale-95 transition-transform"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
          </button>
        )}
        <h1 className="text-xl font-black text-blue-500 tracking-tighter">
          {title || "PocketIQ"}
        </h1>
      </div>
      
      <div className="flex items-center gap-2">
        {onSearch && (
          <button 
            onClick={onSearch}
            className="p-2 text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
          >
            <Search size={20} />
          </button>
        )}
        <button 
          onClick={onNotifications}
          className="p-2 text-on-surface-variant hover:text-on-surface transition-colors active:scale-95"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
};
