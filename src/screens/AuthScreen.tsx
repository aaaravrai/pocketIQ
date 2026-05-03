import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { Wallet, LogIn } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-secondary/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-600/30">
            <Wallet className="text-white" size={40} />
          </div>
          <h1 className="text-4xl font-black tracking-tighter text-on-surface">PocketIQ</h1>
          <p className="text-on-surface-variant text-sm font-medium leading-relaxed px-4">
            Master your student finances with AI-powered insights and smart budgeting.
          </p>
        </div>

        <GlassCard className="p-8 space-y-6">
          <div className="space-y-2">
            <h2 className="text-xl font-bold">Welcome back</h2>
            <p className="text-xs text-on-surface-variant">Sign in to sync your financial data across devices.</p>
          </div>

          <button 
            onClick={() => signInWithGoogle()}
            className="w-full h-14 bg-white text-black rounded-2xl flex items-center justify-center gap-3 font-bold hover:bg-gray-100 transition-colors active:scale-95 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
            <LogIn size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-widest pt-4">
            Secured by Firebase Auth
          </p>
        </GlassCard>

        <div className="pt-8">
          <div className="flex gap-4 justify-center text-[10px] font-bold text-on-surface-variant uppercase tracking-widest">
            <span>Secure</span>
            <div className="w-1 h-1 bg-white/20 rounded-full my-auto" />
            <span>Private</span>
            <div className="w-1 h-1 bg-white/20 rounded-full my-auto" />
            <span>Always Syncing</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
