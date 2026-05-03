import React from 'react';
import { cn } from '../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface GlassCardProps extends HTMLMotionProps<"div"> {
  children: React.ReactNode;
  activeScale?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({ 
  children, 
  className, 
  activeScale = false,
  ...props 
}) => {
  return (
    <motion.div
      whileTap={activeScale ? { scale: 0.98 } : undefined}
      className={cn(
        "glass-card rounded-[24px] overflow-hidden",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
