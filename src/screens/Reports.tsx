import React from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { ChevronDown, ArrowDown, ArrowUp, TrendingUp, Wallet } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { cn } from '../lib/utils';

export const Reports: React.FC = () => {
  const { transactions } = useFinancialData();

  const totalSpent = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const totalEarned = transactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalEarned - totalSpent;

  const chartData = [
    { name: 'Food', value: 60, color: '#bec3f8' },
    { name: 'Study', value: 20, color: '#4edea3' },
    { name: 'Transit', value: 15, color: '#adc6ff' },
    { name: 'Fun', value: 5, color: '#ffb4ab' },
  ];

  return (
    <div className="space-y-6 pb-20 animate-in slide-in-from-right duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-on-surface">October Summary</h1>
        <GlassCard className="rounded-full px-3 py-1.5 flex items-center gap-1 border border-white/10">
          <span className="text-xs font-medium">Oct 2023</span>
          <ChevronDown size={14} />
        </GlassCard>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <GlassCard className="p-4">
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant uppercase font-bold mb-1">
            <ArrowDown size={12} className="text-error" /> Total Spent
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalSpent)}</p>
        </GlassCard>
        <GlassCard className="p-4">
          <div className="flex items-center gap-1 text-[10px] text-on-surface-variant uppercase font-bold mb-1">
            <ArrowUp size={12} className="text-secondary" /> Total Earned
          </div>
          <p className="text-xl font-bold">{formatCurrency(totalEarned)}</p>
        </GlassCard>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-full px-5 py-3 flex items-center justify-between">
        <span className="text-sm text-on-surface-variant font-medium">Net Cash Flow</span>
        <span className={cn("text-sm font-bold", netFlow >= 0 ? "text-secondary" : "text-error")}>
          {netFlow >= 0 ? '+' : ''}{formatCurrency(netFlow)}
        </span>
      </div>

      {/* Spending Donut */}
      <GlassCard className="p-6 flex flex-col items-center">
        <h2 className="text-sm font-bold text-on-surface w-full mb-6">Spending Breakdown</h2>
        <div className="h-64 w-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] text-on-surface-variant">Top Area</span>
            <span className="text-lg font-black text-primary">Food</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-2 gap-3 mt-4">
          {chartData.map((item) => (
            <div key={item.name} className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
              <span className="text-[11px] text-on-surface">{item.name} ({item.value}%)</span>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className="p-4 flex items-center gap-4">
        <div className="p-3 rounded-2xl bg-secondary/10 text-secondary">
          <TrendingUp size={24} />
        </div>
        <div>
          <h3 className="text-sm font-bold">Savings Growth</h3>
          <p className="text-[11px] text-on-surface-variant">You saved 15% more than last month. Keep it up!</p>
        </div>
      </GlassCard>
    </div>
  );
};
