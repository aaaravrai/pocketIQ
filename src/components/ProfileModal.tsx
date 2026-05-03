import React, { useState } from 'react';
import { GlassCard } from './GlassCard';
import { useFinancialData } from '../context/FinancialContext';
import { X, Check, User, Calendar, Mail, Camera, LogOut, Loader2 } from 'lucide-react';
import { signOutUser } from '../lib/firebase';
import { cn } from '../lib/utils';

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
  const [isUploading, setIsUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setFeedback({ message: 'Only .jpg, .png, and .webp files allowed.', type: 'error' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) { // 2MB
      setFeedback({ message: 'File too large. Maximum size is 2MB.', type: 'error' });
      return;
    }

    setIsUploading(true);
    setFeedback(null);

    try {
      const compressImage = (base64Str: string): Promise<string> => {
        return new Promise((resolve, reject) => {
          const img = new Image();
          img.src = base64Str;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 200;
            const MAX_HEIGHT = 200;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compress to 70% quality
          };
          img.onerror = (err) => reject(err);
        });
      };

      const reader = new FileReader();
      reader.onloadend = async () => {
        const rawBase64 = reader.result as string;
        try {
          const compressedBase64 = await compressImage(rawBase64);
          
          // Optimistic UI update
          setFormData(prev => ({ ...prev, avatar: compressedBase64 }));
          
          // Immediate Firestore update
          await updateProfile({ avatar: compressedBase64 });
          
          setFeedback({ message: 'Photo Updated Successfully!', type: 'success' });
          setTimeout(() => setFeedback(null), 3000);
        } catch (err) {
          setFeedback({ message: 'Compression failed.', type: 'error' });
        }
      };
      
      reader.onerror = () => {
        throw new Error('Failed to read file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error(error);
      setFeedback({ message: 'Failed to upload photo. Please try again.', type: 'error' });
    } finally {
      setIsUploading(false);
    }
  };

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
      <GlassCard className="w-full max-w-sm p-6 space-y-6 overflow-y-auto max-h-[90vh] hide-scrollbar border-2 border-primary/20">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-black tracking-tight text-on-surface uppercase pr-1">Intelligence Profile</h3>
          <button onClick={onClose} className="p-2 hover:bg-on-surface/10 rounded-xl transition-colors"><X size={20} /></button>
        </div>

        <div className="flex flex-col items-center gap-4">
          <div className="relative group">
            <div className="w-24 h-24 rounded-[32px] bg-on-surface/5 border-2 border-primary/20 overflow-hidden flex items-center justify-center shadow-2xl relative">
              {formData.avatar ? (
                <img src={formData.avatar} alt="Avatar" className={cn("w-full h-full object-cover", isUploading && "opacity-50 blur-[2px]")} />
              ) : (
                <User size={40} className={cn("text-on-surface-variant opacity-40", isUploading && "opacity-20")} />
              )}
              
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Loader2 className="animate-spin text-primary" size={24} />
                </div>
              )}
            </div>
            {!isUploading && (
              <label className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary/20 backdrop-blur-md border border-primary/30 rounded-2xl flex items-center justify-center cursor-pointer shadow-lg shadow-primary/10 active:scale-95 transition-all hover:bg-primary/30 group-hover:scale-110">
                <Camera size={16} className="text-primary" />
                <input 
                  type="file" 
                  accept=".jpg,.jpeg,.png,.webp"
                  className="hidden" 
                  onChange={handleImageChange}
                />
              </label>
            )}
          </div>
          <div className="text-center h-4">
            {feedback ? (
              <p className={cn("text-[10px] font-black uppercase tracking-[0.1em] animate-in fade-in slide-in-from-top-1", 
                feedback.type === 'success' ? 'text-emerald-500' : 'text-rose-500'
              )}>
                {feedback.message}
              </p>
            ) : (
              <p className="text-[10px] font-black text-on-surface-variant uppercase tracking-[0.2em]">{userProfile?.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Operational Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60" size={16} />
              <input 
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Origin Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-60" size={16} />
              <input 
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-bold transition-all [color-scheme:light] dark:[color-scheme:dark]"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Budget Threshold</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-sm">₹</span>
              <input 
                type="number"
                value={formData.monthlyAllowance}
                onChange={(e) => setFormData({...formData, monthlyAllowance: e.target.value})}
                className="w-full bg-on-surface/5 h-12 pl-12 pr-4 rounded-xl border border-on-surface/10 focus:border-primary focus:ring-0 text-sm font-black transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-primary uppercase tracking-[0.2em] pl-1">Operational Badges</label>
            <div className="flex flex-wrap gap-2">
              {['Budget Master', 'First ₹1k Saved', 'ROI Specialist'].map((badge) => {
                const earned = userProfile?.badges?.includes(badge);
                return (
                  <div 
                    key={badge}
                    className={cn(
                      "px-3 py-1.5 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all",
                      earned ? "bg-primary/20 border-primary/30 text-primary" : "bg-on-surface/5 border-on-surface/10 text-on-surface-variant opacity-40 grayscale"
                    )}
                  >
                    {badge}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="space-y-3 pt-4">
          <button 
            onClick={handleSave}
            disabled={isSubmitting || !formData.name.trim()}
            className="w-full h-14 bg-primary text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-primary/20 disabled:opacity-50"
          >
            {isSubmitting ? 'Syncing...' : 'Save Intel'} <Check size={18} />
          </button>
          
          <button 
            onClick={() => signOutUser()}
            className="w-full h-12 bg-on-surface/5 hover:bg-red-500/10 text-on-surface-variant hover:text-red-500 rounded-xl font-bold uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all active:scale-95 opacity-60 hover:opacity-100"
          >
            <LogOut size={16} /> Terminate Session
          </button>
        </div>
      </GlassCard>
    </div>
  );
};
