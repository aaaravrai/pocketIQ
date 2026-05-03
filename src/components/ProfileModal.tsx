import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { X, Check, User, Calendar, Mail, Camera, LogOut } from 'lucide-react';
import { signOutUser } from '../lib/firebase';

interface ProfileModalProps {
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ onClose }) => {
  const { userProfile, updateProfile } = useFinancialData();
  const [formData, setFormData] = useState({
    name: userProfile?.name || '',
    dateOfBirth: userProfile?.dateOfBirth || '',
    avatar: userProfile?.avatar || '',
    monthlyAllowance: userProfile?.monthlyAllowance.toString() || '1200'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!formData.name.trim()) return;
    setIsSubmitting(true);
    try {
      await updateProfile({
        name: formData.name,
        dateOfBirth: formData.dateOfBirth,
        avatar: formData.avatar,
        monthlyAllowance: parseFloat(formData.monthlyAllowance)
      });
      onClose();
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
      <GlassCard className="w-full max-w-sm p-6 space-y-6 overflow-y-auto max-h-[90vh] hide-scrollbar">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold">Profile Settings</h3>
          <button onClick={onClose} className="p-1 hover:bg-white/5 rounded-full"><X size={20} /></button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-3xl bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <User size={40} className="text-on-surface-variant" />
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center cursor-pointer shadow-lg shadow-blue-600/20 active:scale-95 transition-transform hover:bg-blue-500">
              <Camera size={14} className="text-white" />
              <input 
                type="file" 
                accept="image/*"
                className="hidden" 
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 500000) { // 500KB limit for base64 storage
                      alert("Image is too large. Please select an image under 500KB.");
                      return;
                    }
                    const reader = new FileReader();
                    reader.onloadend = () => {
                      setFormData({ ...formData, avatar: reader.result as string });
                    };
                    reader.readAsDataURL(file);
                  }
                }}
              />
            </label>
          </div>
          <div className="text-center">
            <p className="text-xs text-on-surface-variant font-medium">{userProfile?.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-white/5 h-12 pl-12 pr-4 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Date of Birth</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full bg-white/5 h-12 pl-12 pr-4 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-medium transition-colors [color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Email Address</label>
            <div className="relative opacity-60">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" size={16} />
              <input 
                type="email"
                value={userProfile?.email || ''}
                disabled
                className="w-full bg-white/5 h-12 pl-12 pr-4 rounded-xl border border-white/10 text-sm font-medium cursor-not-allowed"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest pl-1">Monthly Allowance</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold text-sm">₹</span>
              <input 
                type="number"
                value={formData.monthlyAllowance}
                onChange={(e) => setFormData({...formData, monthlyAllowance: e.target.value})}
                className="w-full bg-white/5 h-12 pl-12 pr-4 rounded-xl border border-white/10 focus:border-blue-500 focus:ring-0 text-sm font-bold transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-2">
          <button 
            onClick={handleSave}
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full h-12 bg-blue-600 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95 transition-transform"
          >
            {isSubmitting ? 'Saving...' : 'Save Changes'} <Check size={18} />
          </button>
          
          <button 
            onClick={() => signOutUser()}
            className="w-full h-12 bg-white/5 hover:bg-error/10 text-on-surface-variant hover:text-error rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <LogOut size={18} /> Logout
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
