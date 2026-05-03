import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { 
  signInWithGoogle, 
  auth,
  db
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { motion } from 'motion/react';
import { Mail, Lock, ChevronRight } from 'lucide-react';
import { Logo } from '../components/Logo';
import { cn } from '../lib/utils';

type AuthMode = 'login' | 'register';

export const AuthScreen: React.FC = () => {
  const [mode, setMode] = useState<AuthMode>('login');
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Logic State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const ensureUserProfile = async (uid: string, userEmail: string | null) => {
    const userRef = doc(db, 'users', uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      await setDoc(userRef, {
        name: userEmail?.split('@')[0] || 'Member',
        email: userEmail || '',
        totalBalance: 5000,
        monthlyAllowance: 10000, // Default allowance
        savingsVaultBalance: 0,
        currency: 'INR',
        onboarded: false,
        updatedAt: new Date().toISOString()
      });
    }
  };

  const handleAuth = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(userCredential.user.uid, userCredential.user.email);
      } else {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await ensureUserProfile(userCredential.user.uid, userCredential.user.email);
      }
    } catch (err: any) {
      console.log("Auth Error (Code):", err.code);
      let message = "Authentication failed";

      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = "Invalid email or password";
      } else if (err.code === 'auth/email-already-in-use') {
        message = "Email already registered";
      } else if (err.code === 'auth/too-many-requests') {
        message = "Too many attempts. Try later.";
      } else if (err.code === 'auth/popup-closed-by-user') {
        message = "Sign-in cancelled";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const userCredential = await signInWithGoogle();
      await ensureUserProfile(userCredential.user.uid, userCredential.user.email);
    } catch (err: any) {
      console.log("Google Auth Error (Code):", err.code);
      let message = "Google authentication failed";
      
      if (err.code === 'auth/popup-closed-by-user') {
        message = "Sign-in cancelled";
      } else if (err.code === 'auth/invalid-credential') {
        message = "Invalid or expired session";
      }
      
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    if (error) setError(null);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-background relative overflow-hidden transition-colors duration-500">
      {/* Background Orbs */}
      <div className="absolute top-[-10%] right-[-10%] w-[400px] h-[400px] bg-[#6366F1]/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] bg-[#10B981]/10 rounded-full blur-[100px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-8 max-w-sm w-full"
      >
        <div className="flex flex-col items-center gap-4">
          <Logo withText size="xl" className="mb-4" />
          <p className="text-on-surface-variant text-[10px] font-black uppercase tracking-[0.4em] leading-relaxed px-4 opacity-70">
            Financial Intelligence
          </p>
        </div>

        <GlassCard className="p-8 space-y-6 border-2 border-primary/20 relative overflow-hidden">
          <div className="space-y-1">
            <h2 className="text-2xl font-black tracking-tight uppercase leading-none">
              {mode === 'login' ? 'Welcome Back' : 'Join PocketIQ'}
            </h2>
            <p className="text-[10px] text-on-surface-variant font-black uppercase tracking-widest opacity-60">
              Secure Vault Entry
            </p>
          </div>

          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-3">
              <div className="space-y-1">
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-[#6366F1] transition-colors" size={16} />
                  <input 
                    type="email"
                    placeholder="EMAIL ADDRESS"
                    required
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); clearError(); }}
                    className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 text-xs font-bold uppercase tracking-widest transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-[#6366F1] transition-colors" size={16} />
                  <input 
                    type="password"
                    placeholder="KEYWORD / PASSWORD"
                    required
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); clearError(); }}
                    className="w-full bg-on-surface/5 h-14 pl-12 pr-4 rounded-2xl border border-on-surface/10 focus:border-[#6366F1] focus:ring-4 focus:ring-[#6366F1]/10 text-xs font-bold uppercase tracking-widest transition-all outline-none"
                  />
                </div>
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center"
              >
                {error}
              </motion.p>
            )}

            <button 
              type="submit"
              disabled={loading}
              className={cn(
                "w-full h-14 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-[0.2em] text-xs transition-all active:scale-95 text-white shadow-xl bg-[#6366F1] shadow-[#6366F1]/20",
                loading && "opacity-70 animate-pulse"
              )}
            >
              {loading ? 'Processing...' : (
                <>
                  {mode === 'login' ? 'Sign In' : 'Create Account'}
                  <ChevronRight size={16} />
                </>
              )}
            </button>
          </form>

          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-on-surface/10"></div></div>
            <div className="relative flex justify-center text-[8px] font-black uppercase tracking-widest"><span className="bg-surface px-4 text-on-surface-variant">OR SECURE PORTAL</span></div>
          </div>

          <button 
            onClick={handleGoogleSignIn}
            className="w-full h-14 bg-on-surface/5 text-on-surface border border-on-surface/10 rounded-2xl flex items-center justify-center gap-3 font-black uppercase tracking-widest text-[10px] hover:bg-on-surface/10 transition-all active:scale-95 group"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-4 h-4" />
            Continue with Google
          </button>

          <button 
            onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(null); }}
            className="w-full text-center text-[10px] font-black text-on-surface-variant uppercase tracking-widest hover:text-primary transition-colors"
          >
            {mode === 'login' ? "Don't have an account? Sign Up" : "Already a member? Sign In"}
          </button>
        </GlassCard>

        <div className="pt-4">
          <div className="flex gap-4 justify-center text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] opacity-40">
            <span>Encrypted</span>
            <div className="w-0.5 h-0.5 bg-on-surface/40 rounded-full my-auto" />
            <span>2FA Ready</span>
            <div className="w-0.5 h-0.5 bg-on-surface/40 rounded-full my-auto" />
            <span>Real-time</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
