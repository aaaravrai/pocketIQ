import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { TrendingUp, Target, BarChart3, Edit2, X, Check, Rocket, Headphones, Plane, ShoppingBag, Utensils, GraduationCap, Gamepad2, Heart, Car, Smartphone, Plus, Trash2, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Goal } from '../types';
import { cn } from '../lib/utils';
import { GOAL_ICONS } from '../constants';
import { formatDistanceToNow, isPast } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

const MOCK_LINE_DATA = [
  { day: 'Mon', thisWeek: 400, lastWeek: 300 },
  { day: 'Tue', thisWeek: 300, lastWeek: 450 },
  { day: 'Wed', thisWeek: 500, lastWeek: 400 },
  { day: 'Thu', thisWeek: 200, lastWeek: 300 },
  { day: 'Fri', thisWeek: 600, lastWeek: 500 },
  { day: 'Sat', thisWeek: 400, lastWeek: 600 },
  { day: 'Sun', thisWeek: 150, lastWeek: 200 },
];

const GoalModal: React.FC<{ goal?: Goal; onClose: () => void }> = ({ goal, onClose }) => {
  const { updateGoal, addGoal, deleteGoal } = useFinancialData();
  const [title, setTitle] = useState(goal?.title || '');
  const [targetAmount, setTargetAmount] = useState(goal?.targetAmount.toString() || '');
  const [currentAmount, setCurrentAmount] = useState(goal?.currentAmount.toString() || '0');
  const [selectedIcon, setSelectedIcon] = useState(goal?.icon || 'rocket_launch');
  const [deadline, setDeadline] = useState(goal?.deadline ? goal.deadline.split('T')[0] : '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const save = async () => {
    const targetVal = parseFloat(targetAmount);
    const currentVal = parseFloat(currentAmount);
    if (isNaN(targetVal) || isNaN(currentVal) || !title.trim()) return;
    
    setIsSubmitting(true);
    try {
      const payload: any = { 
        title: title.trim(),
        targetAmount: targetVal, 
        currentAmount: currentVal,
        icon: selectedIcon,
        color: goal?.color || '#3b82f6'
      };

      if (deadline) {
        payload.deadline = new Date(deadline).toISOString();
      }

      if (goal) {
        await updateGoal(goal.id, payload);
      } else {
        await addGoal(payload);
      }
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!goal || !window.confirm('Are you sure you want to delete this goal?')) return;
    try {
      await deleteGoal(goal.id);
      onClose();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-sm p-6 space-y-6 overflow-y-auto max-h-[90vh] hide-scrollbar relative">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">{goal ? 'Edit Goal' : 'New Goal'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Goal Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {Object.entries(GOAL_ICONS).map(([id, Icon]) => (
                <button
                  key={id}
                  onClick={() => setSelectedIcon(id)}
                  className={cn(
                    "flex items-center justify-center p-3 rounded-xl border transition-all active:scale-90",
                    selectedIcon === id 
                      ? "bg-primary border-primary text-white shadow-lg shadow-primary/20" 
                      : "bg-on-surface/5 border-on-surface/10 text-on-surface-variant hover:border-on-surface/20"
                  )}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Goal Title</label>
            <input 
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-on-surface/5 p-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-medium transition-colors"
              placeholder="e.g. New Laptop"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Target</label>
              <div className="flex items-center gap-2 bg-on-surface/5 p-3 rounded-xl border border-on-surface/10 focus-within:border-primary transition-colors">
                <span className="text-sm font-bold text-primary">₹ </span>
                <input 
                  type="number"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0"
                  placeholder="0"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Saved</label>
              <div className="flex items-center gap-2 bg-on-surface/5 p-3 rounded-xl border border-on-surface/10 focus-within:border-primary transition-colors">
                <span className="text-sm font-bold text-emerald-500">₹ </span>
                <input 
                  type="number"
                  value={currentAmount}
                  onChange={(e) => setCurrentAmount(e.target.value)}
                  className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0"
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Deadline (Optional)</label>
            <div className="flex items-center gap-2 bg-on-surface/5 p-3 rounded-xl border border-on-surface/10 focus-within:border-primary transition-colors">
              <Calendar className="text-on-surface-variant" size={18} />
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0 [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button 
            onClick={save}
            disabled={isSubmitting || !title.trim()}
            className="w-full bg-primary hover:opacity-90 py-4 rounded-2xl font-black text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100 uppercase tracking-widest"
          >
            {isSubmitting ? 'Processing...' : (goal ? 'Save Changes' : 'Create Goal')} <Check size={20} />
          </button>

          {goal && (
            <button 
              onClick={handleDelete}
              className="w-full bg-on-surface/5 hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs uppercase tracking-widest"
            >
              <Trash2 size={16} /> Delete Goal
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

const FundGoalModal: React.FC<{ goal: Goal; onClose: (msg?: string) => void }> = ({ goal, onClose }) => {
  const { fundGoal, userProfile } = useFinancialData();
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFund = async () => {
    const fundAmount = parseFloat(amount);
    if (isNaN(fundAmount) || fundAmount <= 0) return;

    setIsSubmitting(true);
    setError(null);
    try {
      await fundGoal(goal.id, fundAmount);
      onClose(`₹${fundAmount} moved to ${goal.title} successfully!`);
    } catch (e: any) {
      setError(e.message || "Failed to fund goal");
      setTimeout(() => setError(null), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentBalance = userProfile?.totalBalance || 0;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-[280px] p-6 space-y-6 relative border-primary/20 shadow-2xl">
        <div className="text-center space-y-1">
          <h3 className="text-base font-black text-on-surface uppercase tracking-tight">Fund this Goal</h3>
          <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{goal.title}</p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center px-1">
              <label className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Amount</label>
              <span className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest">Bal: ₹{currentBalance.toFixed(0)}</span>
            </div>
            <div className="flex items-center gap-2 bg-on-surface/5 p-4 rounded-xl border border-on-surface/10 focus-within:border-primary transition-colors">
              <span className="text-base font-black text-primary">₹</span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                autoFocus
                className="bg-transparent border-none focus:ring-0 text-xl font-black w-full p-0 tracking-tighter"
                placeholder="0"
              />
            </div>
            {error && (
              <p className="text-[10px] font-black text-rose-500 uppercase tracking-widest text-center mt-1">
                {error}
              </p>
            )}
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => onClose()}
              disabled={isSubmitting}
              className="flex-1 bg-white/5 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-on-surface-variant hover:bg-white/10 transition-all border border-on-surface/5"
            >
              Cancel
            </button>
            <button 
              onClick={handleFund}
              disabled={isSubmitting || !amount || parseFloat(amount) <= 0}
              className="flex-1 bg-primary py-3 rounded-xl font-black text-[10px] uppercase tracking-widest text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
            >
              Confirm
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};

export const GoalsInsights: React.FC = () => {
  const { goals } = useFinancialData();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [fundingGoal, setFundingGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-24 left-1/2 z-[200] w-[90%] max-w-sm"
          >
            <GlassCard className="bg-emerald-600 text-white p-4 rounded-2xl shadow-2xl flex items-center justify-center text-center font-bold text-[10px] uppercase tracking-[0.2em] border border-white/20">
              {toast}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      {(editingGoal || isAddingGoal) && (
        <GoalModal 
          goal={editingGoal || undefined} 
          onClose={() => {
            setEditingGoal(null);
            setIsAddingGoal(false);
          }} 
        />
      )}

      {fundingGoal && (
        <FundGoalModal 
          goal={fundingGoal}
          onClose={(msg) => {
            setFundingGoal(null);
            if (msg) {
              setToast(msg);
              setTimeout(() => setToast(null), 3000);
            }
          }}
        />
      )}
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-on-surface tracking-tight">Goals & Insights</h1>
          <p className="text-xs font-bold text-primary uppercase tracking-[0.2em] mt-1 pl-0.5">Strategic Future</p>
        </div>
        <button 
          onClick={() => setIsAddingGoal(true)}
          className="w-14 h-14 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary/20 active:scale-90 transition-transform"
        >
          <Plus size={28} />
        </button>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => {
          const percent = Math.round((Math.min(goal.currentAmount, goal.targetAmount) / goal.targetAmount) * 100);
          const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          const isOverdue = !isCompleted && deadlineDate && isPast(deadlineDate);
          
          return (
            <GlassCard 
              key={goal.id} 
              className="p-6 flex flex-col justify-between min-h-[220px] group border-primary/10"
              whileHover={{ scale: 0.98, translateY: -2 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase tracking-[0.15em] font-black",
                      isCompleted ? "text-emerald-500" : (isOverdue ? "text-red-500" : "text-primary")
                    )}>
                      {isCompleted ? 'Goal Achieved' : (isOverdue ? 'Overdue Goal' : 'Active Goal')}
                    </span>
                    <button 
                      onClick={() => setEditingGoal(goal)}
                      className="p-1 opacity-10 sm:opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:bg-primary/10 rounded-full"
                      title="Edit Goal"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <h2 
                    className={cn(
                      "text-xl font-black transition-colors leading-none tracking-tight",
                      isCompleted ? "text-emerald-500" : "text-on-surface"
                    )}
                  >
                    {goal.title}
                  </h2>
                  <div className="flex items-center gap-2">
                    <p className={cn(
                      "text-[10px] font-bold uppercase tracking-wider",
                      isCompleted ? "text-emerald-500/80" : "text-on-surface-variant"
                    )}>
                      {isCompleted 
                        ? 'Target Reached! 🚀' 
                        : (deadlineDate 
                            ? `${isOverdue ? 'Passed' : ''} ${formatDistanceToNow(deadlineDate, { addSuffix: true })}` 
                            : 'Strategic Accumulation')}
                    </p>
                    {isCompleted && (
                      <motion.span 
                        animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-xs"
                      >
                        🎉
                      </motion.span>
                    )}
                  </div>
                </div>
                <div 
                  className="relative w-16 h-16 flex-shrink-0"
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-on-surface/5" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="4" />
                    <motion.circle 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke={isCompleted ? "#10b981" : "#6366f1"} 
                      strokeWidth="4" 
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${percent}, 100` }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "p-2.5 rounded-2xl",
                      isCompleted ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" : "bg-primary/10 text-primary border border-primary/20"
                    )}>
                      {isCompleted ? (
                        <Check size={20} strokeWidth={3} />
                      ) : (
                        GOAL_ICONS[goal.icon as keyof typeof GOAL_ICONS] ? (
                          React.createElement(GOAL_ICONS[goal.icon as keyof typeof GOAL_ICONS], { 
                            size: 20, 
                            className: isCompleted ? "text-emerald-500" : "text-primary" 
                          })
                        ) : (
                          <Target size={20} className="text-primary" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex justify-between text-[11px] font-black uppercase tracking-wider text-on-surface-variant mb-2">
                  <span>{formatCurrency(goal.currentAmount)}</span>
                  <span>{formatCurrency(goal.targetAmount)}</span>
                </div>
                <div className="h-2 w-full bg-on-surface/5 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percent}%` }}
                    transition={{ duration: 1.5, ease: "anticipate" }}
                    className={cn(
                      "h-full transition-all",
                      isCompleted ? "bg-emerald-500" : "bg-primary shadow-[0_0_15px_rgba(99,102,241,0.3)]"
                    )} 
                  />
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-on-surface/5 flex gap-2">
                {!isCompleted ? (
                  <button 
                    onClick={() => setFundingGoal(goal)}
                    className="flex-1 bg-primary/10 text-primary border border-primary/20 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <Plus size={14} /> Add Funds
                  </button>
                ) : (
                  <div className="flex-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-[0.2em] flex items-center justify-center gap-2">
                    <Rocket size={14} /> Target Reached
                  </div>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      {/* Insight Card */}
      <GlassCard className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-secondary" size={20} />
            <h3 className="text-sm font-bold text-on-surface">Weekly Insight</h3>
          </div>
          <span className="text-[10px] text-secondary bg-secondary/10 px-2 py-1 rounded-lg">8% Efficient</span>
        </div>
        <p className="text-sm text-on-primary-container">
          You spent <span className="text-on-surface font-bold">12% less</span> on caffeine this week compared to last. Keep it up!
        </p>

        {/* Recharts Chart */}
        <div className="h-40 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={MOCK_LINE_DATA}>
              <XAxis dataKey="day" hide />
              <YAxis hide />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(21, 19, 20, 0.8)', border: 'none', borderRadius: '12px', color: '#fff' }}
                itemStyle={{ fontSize: '12px' }}
              />
              <Line type="monotone" dataKey="lastWeek" stroke="rgba(255,255,255,0.1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="thisWeek" stroke="#3b82f6" strokeWidth={3} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex gap-4 pt-2">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-[10px]">This Week</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/10" />
            <span className="text-[10px]">Last Week</span>
          </div>
        </div>
      </GlassCard>

      {/* Pill Tracker */}
      <div className="flex justify-center">
        <GlassCard className="rounded-full px-6 py-3 flex items-center gap-4 border border-white/10">
          <Target className="text-blue-400" size={18} />
          <div className="flex flex-col">
            <span className="text-[8px] uppercase text-on-primary-container font-black leading-none">Primary Target</span>
            <span className="text-sm font-bold text-blue-400 leading-none">Target: {formatCurrency(2000)}</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-1" />
          <div className="text-secondary font-bold text-sm">+{formatCurrency(42.50)}</div>
        </GlassCard>
      </div>
    </div>
  );
};
