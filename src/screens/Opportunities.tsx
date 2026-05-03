import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { Sparkles, Bookmark, ExternalLink, Timer, Trophy } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export const Opportunities: React.FC = () => {
  const { scholarships, toggleScholarshipBookmark } = useFinancialData();

  const getDaysLeft = (deadline: string) => {
    const end = new Date(deadline);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Opportunities</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 pr-1 opacity-80">Scholarships & Grants</p>
        </div>
        <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
          <Trophy size={24} />
        </div>
      </div>

      <div className="space-y-4">
        {scholarships.map((s, idx) => {
          const daysLeft = getDaysLeft(s.deadline);
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <GlassCard className="p-5 flex flex-col sm:flex-row gap-6 relative overflow-hidden group">
                <div className="flex-1 space-y-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                       <h3 className="text-lg font-black text-on-surface leading-tight tracking-tight">{s.title}</h3>
                       {daysLeft < 30 && (
                         <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-widest border border-red-500/20">
                           Expiring Soon
                         </span>
                       )}
                    </div>
                    <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{s.provider}</p>
                  </div>

                  <div className="flex flex-wrap gap-4 pt-2">
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-on-surface/5 border border-on-surface/5">
                      <Timer size={14} className="text-primary" />
                      <span className="text-[10px] font-black text-on-surface tracking-widest uppercase">
                        {daysLeft} Days Left
                      </span>
                    </div>
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/10">
                      <Sparkles size={14} className="text-emerald-500" />
                      <span className="text-[10px] font-black text-emerald-500 tracking-widest uppercase">
                        {formatCurrency(s.amount)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 justify-end sm:justify-start">
                  <button 
                    onClick={() => toggleScholarshipBookmark(s.id)}
                    className={cn(
                      "w-12 h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                      s.bookmarked ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
                    )}
                  >
                    <Bookmark size={20} fill={s.bookmarked ? "currentColor" : "none"} />
                  </button>
                  <a 
                    href={s.link} 
                    target="_blank" 
                    rel="noreferrer"
                    className="w-12 h-12 rounded-2xl bg-on-surface/5 text-on-surface-variant hover:bg-primary hover:text-white flex items-center justify-center transition-all active:scale-95"
                  >
                    <ExternalLink size={20} />
                  </a>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>

      {scholarships.length === 0 && (
        <div className="py-20 flex flex-col items-center text-center space-y-4 opacity-40">
          <Trophy size={48} className="text-on-surface-variant" />
          <div>
            <p className="text-sm font-black uppercase tracking-widest">No Active Opportunities</p>
            <p className="text-xs font-bold uppercase tracking-widest mt-1">Check back later for system updates</p>
          </div>
        </div>
      )}
    </div>
  );
};
