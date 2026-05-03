import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../lib/utils';

export const Logo: React.FC<{ className?: string; withText?: boolean; size?: 'sm' | 'md' | 'lg' | 'xl' }> = ({ className, withText = false, size = 'md' }) => {
  const sizes = {
    sm: { icon: 'w-6 h-6', text: 'text-base', bar1: 'w-0.5 h-1.5', bar2: 'w-0.5 h-3', bar3: 'w-0.5 h-2', gap: 'gap-1' },
    md: { icon: 'w-10 h-10', text: 'text-xl', bar1: 'w-1.5 h-3', bar2: 'w-1.5 h-6', bar3: 'w-1.5 h-4', gap: 'gap-2' },
    lg: { icon: 'w-14 h-14', text: 'text-3xl', bar1: 'w-2 h-4', bar2: 'w-2 h-8', bar3: 'w-2 h-6', gap: 'gap-3' },
    xl: { icon: 'w-20 h-20', text: 'text-5xl', bar1: 'w-3 h-6', bar2: 'w-3 h-12', bar3: 'w-3 h-9', gap: 'gap-4' }
  };

  const currentSize = sizes[size];

  return (
    <div className={cn("flex items-center", currentSize.gap, className)}>
      <div className={cn("relative flex items-center justify-center", currentSize.icon)}>
        {/* Abstract Pocket/Wallet Background */}
        <motion.div 
          className="absolute inset-0 bg-linear-to-br from-[#6366F1] to-[#10B981] rounded-2xl shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        />
        <motion.div 
          className="relative z-10 flex items-end gap-0.5"
          initial={{ y: 5, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {/* IQ Bar Chart Concept */}
          <div className={cn("bg-white rounded-full", currentSize.bar1)} />
          <div className={cn("bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]", currentSize.bar2)} />
          <div className={cn("bg-white rounded-full", currentSize.bar3)} />
        </motion.div>
        
        {/* Pocket Flare/Stitch */}
        <motion.div 
          className="absolute top-2 right-2 w-1.5 h-1.5 bg-white/40 rounded-full"
          animate={{ 
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ repeat: Infinity, duration: 3 }}
        />
      </div>

      {withText && (
        <h1 className={cn("font-black tracking-tighter leading-none flex items-center", currentSize.text)}>
          <span className="text-white">Pocket</span>
          <span className="bg-clip-text text-transparent bg-linear-to-r from-[#6366F1] to-[#10B981] drop-shadow-[0_0_10px_rgba(99,102,241,0.5)] ml-px">IQ</span>
        </h1>
      )}
    </div>
  );
};
