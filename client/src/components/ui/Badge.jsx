import React from 'react';

const variants = {
  default: 'bg-surface-subtle text-content-secondary border-border',
  primary: 'bg-primary-light text-primary-deep border-primary/20',
  success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  warning: 'bg-amber-50 text-amber-700 border-amber-200',
  danger: 'bg-rose-50 text-rose-700 border-rose-200',
  lavender: 'bg-lavender text-primary-deep border-primary/10',
};

const sizes = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-xs font-semibold',
  lg: 'px-3 py-1.5 text-sm font-semibold',
};

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
