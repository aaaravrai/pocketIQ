import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GraduationCap, BookOpen, TrendingUp, DollarSign, Save } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { motion } from 'motion/react';

export const EducationROI: React.FC = () => {
  const { userProfile, updateProfile } = useFinancialData();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    semesterFees: userProfile?.educationROI?.semesterFees || 0,
    booksCost: userProfile?.educationROI?.booksCost || 0,
    otherCosts: userProfile?.educationROI?.otherAcademicCosts || 0,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({
        educationROI: {
          semesterFees: Number(formData.semesterFees),
          booksCost: Number(formData.booksCost),
          otherAcademicCosts: Number(formData.otherCosts)
        }
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalInvestment = Number(formData.semesterFees) + Number(formData.booksCost) + Number(formData.otherCosts);
  const savings = userProfile?.totalBalance || 0;
  const coverage = totalInvestment > 0 ? (savings / totalInvestment) * 100 : 0;

  return (
    <div className="space-y-8 pb-24 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight uppercase">Academic ROI</h1>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mt-1 pr-1 opacity-80">Degree Value Analysis</p>
        </div>
        <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500">
          <GraduationCap size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-6">
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <DollarSign size={14} /> Investment Inputs
          </h3>
          
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Semester Fees</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={formData.semesterFees}
                  onChange={(e) => setFormData({...formData, semesterFees: Number(e.target.value)})}
                  className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Books & Resources</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={formData.booksCost}
                  onChange={(e) => setFormData({...formData, booksCost: Number(e.target.value)})}
                  className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest pl-1">Other Costs (Tech, Lab, etc)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
                <input 
                  type="number"
                  value={formData.otherCosts}
                  onChange={(e) => setFormData({...formData, otherCosts: Number(e.target.value)})}
                  className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                />
              </div>
            </div>

            <button 
              onClick={handleSave}
              disabled={isSaving}
              className="w-full h-12 bg-primary text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20"
            >
              {isSaving ? 'Syncing...' : 'Update Records'} <Save size={14} />
            </button>
          </div>
        </GlassCard>

        <GlassCard className="p-6 space-y-6 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <h3 className="text-xs font-black text-primary uppercase tracking-[0.2em] flex items-center gap-2">
            <TrendingUp size={14} /> Financial Coverage
          </h3>

          <div className="flex flex-col items-center justify-center py-4 space-y-2">
            <div className="relative w-32 h-32">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  className="stroke-on-surface/5"
                  strokeWidth="3"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <motion.path
                  initial={{ strokeDasharray: '0, 100' }}
                  animate={{ strokeDasharray: `${Math.min(coverage, 100)}, 100` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="stroke-primary"
                  strokeWidth="3"
                  strokeLinecap="round"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black text-on-surface">{Math.round(coverage)}%</span>
                <span className="text-[8px] font-black text-on-surface-variant uppercase tracking-tighter">Funded</span>
              </div>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.1em] text-center max-w-[200px]">
              Current savings vs semester investment
            </p>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 rounded-xl bg-on-surface/5 border border-on-surface/5">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Total Investment</span>
              <span className="text-sm font-black text-on-surface">{formatCurrency(totalInvestment)}</span>
            </div>
            <div className="flex justify-between items-center p-3 rounded-xl bg-on-surface/5 border border-on-surface/5">
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Available Capital</span>
              <span className="text-sm font-black text-emerald-500">{formatCurrency(savings)}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
        <div className="flex gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
            <BookOpen className="text-emerald-500" size={20} />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-black text-emerald-500 uppercase tracking-tight">Intelligence Note</h4>
            <p className="text-xs text-on-surface-variant font-medium leading-relaxed">
              Every ₹1 invested in your education today is statistically projected to yield an 8x lifetime return. 
              {coverage < 50 ? " Focus on high-impact side gigs to increase your coverage." : " You have solid coverage, keep optimizing your study budget."}
            </p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
