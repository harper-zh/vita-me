
import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Fixed: Inherit from HTMLMotionProps<"button"> to ensure compatibility with motion.button components and avoid type mismatch for event handlers like onAnimationStart
interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'accent' | 'ghost';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  className, 
  isLoading, 
  ...props 
}) => {
  const variants = {
    primary: "bg-primary text-white hover:bg-sage-600 shadow-sage-200",
    accent: "bg-accent text-white hover:opacity-90 shadow-pink-100",
    ghost: "bg-white/40 text-sage-600 hover:bg-white/60",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "px-6 py-3 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50",
        variants[variant],
        className
      )}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      ) : children}
    </motion.button>
  );
};
