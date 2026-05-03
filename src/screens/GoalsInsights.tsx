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
import { motion } from 'motion/react';

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
                      ? "bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-600/20" 
                      : "bg-white/5 border-white/10 text-on-surface-variant hover:border-white/20"
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
              className="w-full bg-white/5 p-4 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-colors"
              placeholder="e.g. New Laptop"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Target</label>
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-bold text-blue-500">₹</span>
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
              <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 focus-within:border-blue-500 transition-colors">
                <span className="text-sm font-bold text-secondary">₹</span>
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
            <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl border border-white/10 focus-within:border-blue-500 transition-colors">
              <Calendar className="text-on-surface-variant" size={18} />
              <input 
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="bg-transparent border-none focus:ring-0 text-sm font-bold w-full p-0 [color-scheme:dark]"
              />
            </div>
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <button 
            onClick={save}
            disabled={isSubmitting || !title.trim()}
            className="w-full bg-blue-600 hover:bg-blue-500 py-4 rounded-2xl font-bold flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
          >
            {isSubmitting ? 'Processing...' : (goal ? 'Save Changes' : 'Create Goal')} <Check size={20} />
          </button>

          {goal && (
            <button 
              onClick={handleDelete}
              className="w-full bg-white/5 hover:bg-error/10 text-on-surface-variant hover:text-error py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all text-xs"
            >
              <Trash2 size={16} /> Delete Goal
            </button>
          )}
        </div>
      </GlassCard>
    </div>
  );
};

export const GoalsInsights: React.FC = () => {
  const { goals } = useFinancialData();
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [isAddingGoal, setIsAddingGoal] = useState(false);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {(editingGoal || isAddingGoal) && (
        <GoalModal 
          goal={editingGoal || undefined} 
          onClose={() => {
            setEditingGoal(null);
            setIsAddingGoal(false);
          }} 
        />
      )}
      
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Goals & Insights</h1>
          <p className="text-xs text-on-primary-container">Strategic tracking for your financial future.</p>
        </div>
        <button 
          onClick={() => setIsAddingGoal(true)}
          className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-600/30 active:scale-90 transition-transform"
        >
          <Plus size={24} />
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
              className="p-6 flex flex-col justify-between min-h-[180px] group cursor-pointer"
              whileHover={{ scale: 0.98, rotateX: 2, rotateY: -2, z: -10 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
            >
              <div className="flex justify-between items-start">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "text-[10px] uppercase tracking-wider font-bold",
                      isCompleted ? "text-emerald-400" : (isOverdue ? "text-error" : "text-on-primary-container")
                    )}>
                      {isCompleted ? 'Goal Achieved' : (isOverdue ? 'Overdue Goal' : 'Active Goal')}
                    </span>
                    <button 
                      onClick={() => setEditingGoal(goal)}
                      className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-blue-400 hover:bg-blue-400/10 rounded-full"
                      title="Edit Goal"
                    >
                      <Edit2 size={12} />
                    </button>
                  </div>
                  <h2 
                    onClick={() => setEditingGoal(goal)}
                    className={cn(
                      "text-lg font-bold transition-colors cursor-pointer leading-tight",
                      isCompleted ? "text-emerald-400" : "text-on-surface hover:text-blue-400"
                    )}
                  >
                    {goal.title}
                  </h2>
                  <p className={cn(
                    "text-[10px] font-medium",
                    isCompleted ? "text-emerald-400/80" : "text-secondary"
                  )}>
                    {isCompleted 
                      ? 'Target Reached! 🎉' 
                      : (deadlineDate 
                          ? `${isOverdue ? 'Passed' : ''} ${formatDistanceToNow(deadlineDate, { addSuffix: true })}` 
                          : '3 months away at current rate')}
                  </p>
                </div>
                <div 
                  onClick={() => setEditingGoal(goal)}
                  className="relative w-14 h-14 cursor-pointer"
                >
                  <svg className="absolute inset-0 w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle className="text-white/10" cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="3" />
                    <motion.circle 
                      cx="18" cy="18" r="16" fill="none" 
                      stroke={isCompleted ? "#34d399" : (goal.color || "#3b82f6")} 
                      strokeWidth="3" 
                      initial={{ strokeDasharray: "0, 100" }}
                      animate={{ strokeDasharray: `${percent}, 100` }}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className={cn(
                      "p-2 rounded-full",
                      isCompleted ? "bg-emerald-400/10 text-emerald-400" : "bg-blue-500/10"
                    )}>
                      {isCompleted ? (
                        <Check size={18} strokeWidth={3} />
                      ) : (
                        GOAL_ICONS[goal.icon as keyof typeof GOAL_ICONS] ? (
                          React.createElement(GOAL_ICONS[goal.icon as keyof typeof GOAL_ICONS], { 
                            size: 16, 
                            className: isCompleted ? "text-emerald-400" : "text-blue-500" 
                          })
                        ) : (
                          <Target size={18} className="text-blue-500" />
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div 
                  onClick={() => setEditingGoal(goal)}
                  className="flex justify-between text-[10px] text-on-primary-container mb-1 cursor-pointer hover:text-on-surface transition-colors"
                >
                  <span>{formatCurrency(goal.currentAmount)} of {formatCurrency(goal.targetAmount)}</span>
                </div>
                <div 
                  onClick={() => setEditingGoal(goal)}
                  className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden cursor-pointer"
                >
                  <div 
                    className="h-full bg-blue-500 transition-all duration-1000" 
                    style={{ width: `${percent}%` }} 
                  />
                </div>
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
            <span className="text-sm font-bold text-on-surface">Save ₹2,000</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10 mx-1" />
          <div className="text-secondary font-bold text-sm">+₹42.50</div>
        </GlassCard>
      </div>
    </div>
  );
};
