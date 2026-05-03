import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, User, Wallet, Sparkles, Calendar } from 'lucide-react';
import { Logo } from '../components/Logo';

export const Onboarding: React.FC = () => {
  const { updateProfile, authUser } = useFinancialData();
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: authUser?.displayName || '',
    dateOfBirth: '',
    balance: '2000',
    allowance: '1200'
  });

  const next = () => setStep(s => s + 1);
  const back = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    await updateProfile({
      name: formData.name,
      dateOfBirth: formData.dateOfBirth,
      totalBalance: parseFloat(formData.balance),
      monthlyAllowance: parseFloat(formData.allowance),
      avatar: authUser?.photoURL || undefined,
      onboarded: true,
      email: authUser?.email || ''
    });
  };

  return (
    <div className="min-h-screen bg-background p-6 flex items-center justify-center relative overflow-hidden transition-colors duration-500">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-sm w-full space-y-8">
        <div className="space-y-4 text-center">
          <Logo className="mx-auto" />
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Initiate IQ</h1>
          <div className="flex gap-1.5 justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-10 bg-primary' : 'w-2 bg-on-surface/10'}`} />
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <GlassCard className="p-6 space-y-4 border-none shadow-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Identity</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-colors"
                      placeholder="What is your name?"
                    />
                  </div>
                </div>
              </GlassCard>
              <button 
                onClick={next}
                disabled={!formData.name.trim()}
                className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-primary/20"
              >
                Next Phase <ChevronRight size={18} />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <GlassCard className="p-6 space-y-4 border-none shadow-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Arrival Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-colors [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </div>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-on-surface/5 rounded-2xl font-bold border border-on-surface/10 transition-colors hover:bg-on-surface/10">Back</button>
                <button 
                  onClick={next} 
                  disabled={!formData.dateOfBirth}
                  className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-all shadow-lg shadow-primary/20"
                >
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <GlassCard className="p-6 space-y-4 border-none shadow-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Starting fuel (₹)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="number"
                      value={formData.balance}
                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                      className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-colors"
                    />
                  </div>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-on-surface/5 rounded-2xl font-bold border border-on-surface/10 transition-colors hover:bg-on-surface/10">Back</button>
                <button onClick={next} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20">
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <GlassCard className="p-6 space-y-4 border-none shadow-xl">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Monthly Threshold (₹)</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="number"
                      value={formData.allowance}
                      onChange={(e) => setFormData({...formData, allowance: e.target.value})}
                      className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-colors"
                    />
                  </div>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest p-1 opacity-60">Strategic spending limit.</p>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-on-surface/5 rounded-2xl font-bold border border-on-surface/10 transition-colors hover:bg-on-surface/10">Back</button>
                <button onClick={handleSubmit} className="flex-1 h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/30">
                  Ignition <Check size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
