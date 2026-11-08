import React from 'react';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

const variants = {
  primary: 'bg-primary hover:bg-primary-deep text-white shadow-sm shadow-primary/20 focus-visible:ring-primary',
  secondary: 'bg-primary-light hover:bg-lavender text-primary-deep font-semibold focus-visible:ring-primary',
  outline: 'border border-border hover:bg-surface-subtle text-content-primary focus-visible:ring-primary',
  danger: 'bg-health-danger hover:bg-rose-700 text-white shadow-sm shadow-health-danger/20 focus-visible:ring-health-danger',
  ghost: 'hover:bg-surface-subtle text-content-secondary hover:text-content-primary focus-visible:ring-primary',
};

const sizes = {
  sm: 'px-3 py-1.5 text-xs font-medium rounded-lg',
  md: 'px-4 py-2.5 text-sm font-medium rounded-xl',
  lg: 'px-6 py-3 text-base font-semibold rounded-2xl',
};

export const Button = React.forwardRef(
  ({ children, variant = 'primary', size = 'md', className = '', isLoading = false, disabled = false, icon: Icon, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
        disabled={disabled || isLoading}
        className={`inline-flex items-center justify-center gap-2 transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : Icon ? (
          <Icon className="w-4 h-4" />
        ) : null}
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
export default Button;

