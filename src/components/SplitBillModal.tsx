import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { X, Users, DollarSign, Plus, Trash2, Send } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';
import { motion, AnimatePresence } from 'motion/react';

interface SplitBillModalProps {
  onClose: () => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ onClose }) => {
  const { addSplitBill } = useFinancialData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [roommates, setRoommates] = useState<{ name: string; email: string }[]>([]);
  const [newRoommate, setNewRoommate] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddRoommate = () => {
    if (newRoommate.name && newRoommate.email) {
      setRoommates([...roommates, newRoommate]);
      setNewRoommate({ name: '', email: '' });
    }
  };

  const handleRemoveRoommate = (index: number) => {
    setRoommates(roommates.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!amount || !description || roommates.length === 0) return;
    
    setIsSubmitting(true);
    try {
      const splitAmount = Number(amount) / (roommates.length + 1);
      await addSplitBill({
        description,
        amount: Number(amount),
        roommates: roommates.map(r => ({
          ...r,
          amount: splitAmount,
          settled: false
        }))
      });
      onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-sm p-6 space-y-6 overflow-y-auto max-h-[90vh] hide-scrollbar border-2 border-primary/20">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black tracking-tight text-on-surface uppercase pr-1">Split Expenses</h3>
          <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Description</label>
            <input 
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-on-surface/5 h-12 px-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-all"
              placeholder="Rent, Internet, Groceries..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Total Amount (₹)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-primary" size={16} />
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Add Roommates</label>
            <div className="flex gap-2">
              <input 
                type="text"
                placeholder="Name"
                value={newRoommate.name}
                onChange={(e) => setNewRoommate({...newRoommate, name: e.target.value})}
                className="flex-[2] bg-on-surface/5 h-10 px-3 rounded-lg border border-on-surface/10 text-xs font-bold"
              />
              <input 
                type="email"
                placeholder="Email"
                value={newRoommate.email}
                onChange={(e) => setNewRoommate({...newRoommate, email: e.target.value})}
                className="flex-[3] bg-on-surface/5 h-10 px-3 rounded-lg border border-on-surface/10 text-xs font-bold"
              />
              <button 
                onClick={handleAddRoommate}
                className="w-10 h-10 bg-primary/20 text-primary rounded-lg flex items-center justify-center hover:bg-primary/30 transition-colors"
              >
                <Plus size={18} />
              </button>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto pr-1 custom-scrollbar">
              <AnimatePresence>
                {roommates.map((r, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    className="flex justify-between items-center p-2 rounded-lg bg-on-surface/5 border border-on-surface/5"
                  >
                    <div>
                      <p className="text-[10px] font-black text-on-surface uppercase tracking-tight">{r.name}</p>
                      <p className="text-[8px] text-on-surface-variant font-bold">{r.email}</p>
                    </div>
                    <button onClick={() => handleRemoveRoommate(i)} className="text-red-500/60 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={isSubmitting || !amount || !description || roommates.length === 0}
          className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
        >
          {isSubmitting ? 'Syncing...' : 'Initiate Split'} <Send size={16} />
        </button>
      </GlassCard>
    </div>
  );
};
