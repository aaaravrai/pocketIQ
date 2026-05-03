import React, { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { X, Users, DollarSign, Plus, Trash2, Send } from 'lucide-react';
import { useFinancialData } from '../context/FinancialContext';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface SplitBillModalProps {
  onClose: () => void;
}

export const SplitBillModal: React.FC<SplitBillModalProps> = ({ onClose }) => {
  const { addSplitBill, userProfile } = useFinancialData();
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [roommates, setRoommates] = useState<{ name: string; email: string }[]>([]);
  const [newRoommate, setNewRoommate] = useState({ name: '', email: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const currentBalance = userProfile?.totalBalance || 0;
  const numAmount = parseFloat(amount.toString().replace(/[^\d.]/g, '')) || 0;
  const isInsufficient = numAmount > currentBalance;

  const handleAddRoommate = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (newRoommate.name && newRoommate.email) {
      if (!emailRegex.test(newRoommate.email)) {
        setToastMessage("Invalid Gmail/Email format detected.");
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
        return;
      }
      setRoommates([...roommates, newRoommate]);
      setNewRoommate({ name: '', email: '' });
    }
  };

  const handleRemoveRoommate = (index: number) => {
    setRoommates(roommates.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!amount || !description || roommates.length === 0) return;
    
    // Final validation
    const numAmount = parseFloat(amount.toString().replace(/[^\d.]/g, ''));
    if (isNaN(numAmount) || numAmount <= 0) {
      setToastMessage("Please enter a valid amount.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
      return;
    }

    if (numAmount > currentBalance) {
      setToastMessage(`Insufficient Funds! Your current balance is only ₹${currentBalance.toFixed(2)}.`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
      return;
    }

    setIsSubmitting(true);
    try {
      const splitAmount = numAmount / (roommates.length + 1);
      await addSplitBill({
        description,
        amount: numAmount,
        roommates: roommates.map(r => ({
          ...r,
          amount: splitAmount,
          settled: false
        }))
      });
      
      setToastMessage(`Split recorded and notification sent to ${roommates[0].email}${roommates.length > 1 ? ' and others' : ''}!`);
      setShowToast(true);
      
      setTimeout(() => {
        onClose();
      }, 2500);
    } catch (e) {
      console.error(e);
      setToastMessage("Failed to initiate split. Mission logic error.");
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
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
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Total Amount (₹)</label>
              {isInsufficient && (
                <span className="text-[8px] font-black text-red-500 uppercase tracking-widest animate-pulse">Low Funds</span>
              )}
            </div>
            <div className="relative">
              <span className={cn("absolute left-4 top-1/2 -translate-y-1/2 font-black text-sm transition-colors", isInsufficient ? "text-red-500" : "text-primary")}>₹ </span>
              <input 
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className={cn(
                  "w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border focus:ring-0 text-sm font-black transition-all",
                  isInsufficient ? "border-red-500 text-red-500" : "border-on-surface/10 focus:border-primary text-on-surface"
                )}
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
          disabled={isSubmitting || !amount || !description || roommates.length === 0 || isInsufficient}
          className={cn(
            "w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg",
            isInsufficient 
              ? "bg-red-500/20 text-red-500 border border-red-500/30 cursor-not-allowed" 
              : "bg-primary text-white shadow-primary/20 disabled:opacity-50"
          )}
        >
          {isSubmitting ? (
            <>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
              />
              Sending Notification...
            </>
          ) : (
            <>
              Initiate Split <Send size={16} />
            </>
          )}
        </button>
      </GlassCard>

      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] w-[90%] max-w-sm"
          >
            <GlassCard className={cn(
              "p-4 rounded-2xl shadow-2xl flex items-center justify-center text-center font-bold text-[10px] uppercase tracking-[0.2em] border border-white/20",
              toastMessage.includes("Insufficient Funds") ? "bg-red-600 text-white" : "bg-primary text-white"
            )}>
              {toastMessage}
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
