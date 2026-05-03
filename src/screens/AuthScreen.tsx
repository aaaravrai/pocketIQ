import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { signInWithGoogle } from '../lib/firebase';
import { motion } from 'motion/react';
import { LogIn } from 'lucide-react';
import { Logo } from '../components/Logo';

export const AuthScreen: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        <div className="flex flex-col items-center gap-4">
          <Logo className="scale-150 mb-4" />
          <h1 className="text-4xl font-black tracking-tighter text-on-surface">PocketIQ</h1>
          <p className="text-on-surface-variant text-sm font-bold uppercase tracking-[0.2em] leading-relaxed px-4 opacity-80">
            Financial Intelligence
          </p>
        </div>

        <GlassCard className="p-8 space-y-6 border-2 border-primary/20">
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight uppercase">Welcome back</h2>
            <p className="text-xs text-on-surface-variant font-medium">Sync your intelligence across all devices.</p>
          </div>

          <button 
            onClick={() => signInWithGoogle()}
            className="w-full h-14 bg-on-surface text-background rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs hover:opacity-90 transition-all active:scale-95 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Sign in with Google
            <LogIn size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-[0.3em] pt-4 opacity-60">
            Secured Vault
          </p>
        </GlassCard>

        <div className="pt-8">
          <div className="flex gap-4 justify-center text-[10px] font-black text-on-surface-variant uppercase tracking-widest opacity-60">
            <span>Secure</span>
            <div className="w-1 h-1 bg-on-surface/20 rounded-full my-auto" />
            <span>Private</span>
            <div className="w-1 h-1 bg-on-surface/20 rounded-full my-auto" />
            <span>Real-time</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
