import React from 'react';
import { motion } from 'motion/react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="relative w-10 h-10 flex items-center justify-center">
        {/* Abstract Pocket/Wallet Background */}
        <motion.div 
          className="absolute inset-0 bg-gradient-to-br from-primary to-emerald-400 rounded-2xl"
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
          <div className="w-1.5 h-3 bg-white rounded-full" />
          <div className="w-1.5 h-6 bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]" />
          <div className="w-1.5 h-4 bg-white rounded-full" />
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
    </div>
  );
};
