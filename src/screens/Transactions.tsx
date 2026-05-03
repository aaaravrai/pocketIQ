import React, { useState, useMemo } from 'react';
import { GlassCard } from '../components/GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { formatCurrency } from '../lib/formatters';
import { 
  Search, Filter, ArrowDown, ArrowUp, PiggyBank,
  Coffee, Bus, HeartPulse, GraduationCap, Gamepad2,
  ShoppingBag, Wallet, Calendar, X, Trash2, ChevronRight,
  TrendingUp, TrendingDown, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { format, isSameMonth, isSameWeek, isWithinInterval, startOfWeek, endOfWeek, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { cn } from '../lib/utils';
import { TransactionCategory, TransactionType } from '../types';

type DateFilter = 'All' | 'This Week' | 'This Month';

export const Transactions: React.FC = () => {
  const { transactions, userProfile } = useFinancialData();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TransactionCategory | 'All'>('All');
  const [selectedType, setSelectedType] = useState<TransactionType | 'All'>('All');
  const [dateFilter, setDateFilter] = useState<DateFilter>('All');
  const [showFilters, setShowFilters] = useState(false);

  const categories: (TransactionCategory | 'All')[] = [
    'All', 'Food', 'Transport', 'Study', 'Fun', 'Income', 'Savings', 'Health', 'Shopping'
  ];

  const types: (TransactionType | 'All')[] = ['All', 'earning', 'expense', 'saving'];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Study': return <GraduationCap size={18} className="text-blue-500" />;
      case 'Food': return <Coffee size={18} className="text-orange-500" />;
      case 'Income': return <Wallet size={18} className="text-emerald-500" />;
      case 'Savings': return <PiggyBank size={18} className="text-primary" />;
      case 'Transport': return <Bus size={18} className="text-indigo-500" />;
      case 'Shopping': return <ShoppingBag size={18} className="text-pink-500" />;
      case 'Health': return <HeartPulse size={18} className="text-rose-500" />;
      case 'Fun': return <Gamepad2 size={18} className="text-purple-500" />;
      default: return <Wallet size={18} />;
    }
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || tx.category === selectedCategory;
      const matchesType = selectedType === 'All' || tx.type === selectedType;
      
      let matchesDate = true;
      const txDate = parseISO(tx.date);
      const now = new Date();

      if (dateFilter === 'This Week') {
        matchesDate = isWithinInterval(txDate, {
          start: startOfWeek(now),
          end: endOfWeek(now)
        });
      } else if (dateFilter === 'This Month') {
        matchesDate = isSameMonth(txDate, now);
      }

      return matchesSearch && matchesCategory && matchesType && matchesDate;
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [transactions, searchQuery, selectedCategory, selectedType, dateFilter]);

  const stats = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'earning').reduce((s, t) => s + t.amount, 0);
    const expense = filteredTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { income, expense };
  }, [filteredTransactions]);

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="px-1">
        <h2 className="text-2xl font-black text-on-surface tracking-tight">Transaction History</h2>
        <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em] mt-1 opacity-60">Ledger & Audit Trail</p>
      </div>

      {/* Search & Filter Header */}
      <div className="sticky top-0 z-20 pt-2 pb-4 bg-background/80 backdrop-blur-xl -mx-5 px-5">
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant group-focus-within:text-primary transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search history..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-12 bg-on-surface/5 border border-on-surface/5 rounded-2xl pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
              showFilters ? "bg-primary text-white shadow-lg shadow-primary/20" : "bg-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
            )}
          >
            <Filter size={20} />
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="pt-4 space-y-4">
                {/* Type Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {types.map(type => (
                    <button
                      key={type}
                      onClick={() => setSelectedType(type)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        selectedType === type 
                          ? "bg-primary border-primary text-white shadow-md" 
                          : "bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
                      )}
                    >
                      {type === 'earning' ? 'Income' : type === 'expense' ? 'Expense' : type === 'saving' ? 'Savings' : 'All Types'}
                    </button>
                  ))}
                </div>

                {/* Date Filter */}
                <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
                  {(['All', 'This Week', 'This Month'] as DateFilter[]).map(filter => (
                    <button
                      key={filter}
                      onClick={() => setDateFilter(filter)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        dateFilter === filter 
                          ? "bg-secondary border-secondary text-white shadow-md" 
                          : "bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
                      )}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Category Filter */}
                <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                  {categories.map(cat => (
                    <button
                      key={cat}
                      onClick={() => setSelectedCategory(cat)}
                      className={cn(
                        "flex-shrink-0 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all",
                        selectedCategory === cat 
                          ? "bg-on-surface border-on-surface text-background" 
                          : "bg-on-surface/5 border-on-surface/5 text-on-surface-variant hover:bg-on-surface/10"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 border-emerald-500/10 bg-emerald-500/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/20 flex items-center justify-center">
              <TrendingUp size={14} className="text-emerald-600" />
            </div>
            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Selected Income</p>
          </div>
          <p className="text-xl font-black text-on-surface tracking-tight">{formatCurrency(stats.income)}</p>
        </GlassCard>
        <GlassCard className="p-4 border-rose-500/10 bg-rose-500/5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-6 h-6 rounded-lg bg-rose-500/20 flex items-center justify-center">
              <TrendingDown size={14} className="text-rose-600" />
            </div>
            <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Selected Spend</p>
          </div>
          <p className="text-xl font-black text-on-surface tracking-tight">{formatCurrency(stats.expense)}</p>
        </GlassCard>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length > 0 ? (
          filteredTransactions.map((tx, index) => (
            <motion.div
              key={tx.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="p-4 flex items-center justify-between group hover:border-primary/30 transition-all border-transparent bg-on-surface/5">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/40 dark:bg-white/5 flex items-center justify-center shadow-inner">
                    {getCategoryIcon(tx.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-on-surface tracking-tight truncate max-w-[150px]">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-[9px] font-black text-on-surface-variant uppercase tracking-widest">
                        {tx.category}
                      </p>
                      <span className="w-1 h-1 bg-on-surface/10 rounded-full" />
                      <p className="text-[9px] font-bold text-on-surface-variant uppercase tracking-widest flex items-center gap-1">
                        <Clock size={8} /> {format(parseISO(tx.date), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={cn(
                    "text-sm font-black tracking-tighter",
                    tx.type === 'earning' ? "text-emerald-500" : tx.type === 'expense' ? "text-rose-500" : "text-primary"
                  )}>
                    {tx.type === 'expense' ? '-' : '+'}{formatCurrency(tx.amount)}
                  </p>
                  <p className="text-[8px] font-black text-on-surface-variant uppercase tracking-widest mt-0.5">
                    {tx.type === 'earning' ? 'Credit' : 'Debit'}
                  </p>
                </div>
              </GlassCard>
            </motion.div>
          ))
        ) : (
          <div className="py-20 flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-20 h-20 rounded-full bg-on-surface/5 flex items-center justify-center mb-4">
              <Trash2 size={32} className="text-on-surface-variant" />
            </div>
            <h3 className="text-sm font-black text-on-surface uppercase tracking-widest">No matching logs</h3>
            <p className="text-xs text-on-surface-variant font-medium mt-1">Adjust filters to clear the static.</p>
            {(searchQuery || selectedCategory !== 'All' || selectedType !== 'All' || dateFilter !== 'All') && (
              <button 
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedType('All');
                  setDateFilter('All');
                }}
                className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.2em] border-b border-primary/30 pb-0.5"
              >
                Reset All Filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
