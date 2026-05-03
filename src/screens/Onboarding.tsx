import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { motion, AnimatePresence } from 'motion/react';
import { Check, ChevronRight, User, Wallet, Sparkles, Calendar } from 'lucide-react';

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
    <div className="min-h-screen bg-background p-6 flex items-center justify-center relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[300px] h-[300px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="max-w-sm w-full space-y-8">
        <div className="space-y-2 text-center">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold">Setting up your IQ</h1>
          <div className="flex gap-1 justify-center">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? 'w-8 bg-blue-500' : 'w-2 bg-white/10'}`} />
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
              <GlassCard className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">What should we call you?</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="w-full bg-white/5 h-14 pl-12 pr-4 rounded-2xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-colors"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>
              </GlassCard>
              <button 
                onClick={next}
                disabled={!formData.name.trim()}
                className="w-full h-14 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
              >
                Continue <ChevronRight size={18} />
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
              <GlassCard className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Date of Birth</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                      className="w-full bg-white/5 h-14 pl-12 pr-4 rounded-2xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-colors [color-scheme:dark]"
                    />
                  </div>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-white/5 rounded-2xl font-bold border border-white/10">Back</button>
                <button 
                  onClick={next} 
                  disabled={!formData.dateOfBirth}
                  className="flex-1 h-14 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 disabled:opacity-50"
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
              <GlassCard className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Starting Balance (₹)</label>
                  <div className="relative">
                    <Wallet className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="number"
                      value={formData.balance}
                      onChange={(e) => setFormData({...formData, balance: e.target.value})}
                      className="w-full bg-white/5 h-14 pl-12 pr-4 rounded-2xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-bold transition-colors"
                    />
                  </div>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-white/5 rounded-2xl font-bold border border-white/10">Back</button>
                <button onClick={next} className="flex-1 h-14 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2">
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
              <GlassCard className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest pl-1">Monthly Budget (₹)</label>
                  <div className="relative">
                    <Sparkles className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={18} />
                    <input 
                      type="number"
                      value={formData.allowance}
                      onChange={(e) => setFormData({...formData, allowance: e.target.value})}
                      className="w-full bg-white/5 h-14 pl-12 pr-4 rounded-2xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-bold transition-colors"
                    />
                  </div>
                  <p className="text-[10px] text-on-surface-variant p-1">This will be your monthly spending limit.</p>
                </div>
              </GlassCard>
              <div className="flex gap-4">
                <button onClick={back} className="w-20 h-14 bg-white/5 rounded-2xl font-bold border border-white/10">Back</button>
                <button onClick={handleSubmit} className="flex-1 h-14 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30">
                  Ready to Start <Check size={18} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
