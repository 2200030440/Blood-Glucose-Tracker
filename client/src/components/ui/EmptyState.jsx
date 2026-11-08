import React from 'react';
import { Activity, Plus } from 'lucide-react';
import Button from './Button.jsx';

export const EmptyState = ({
  title = 'No readings recorded',
  message = 'No readings yet. Start tracking your glucose to see your health insights here.',
  actionText,
  onAction,
  icon: Icon = Activity,
  className = '',
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-3xl bg-surface-subtle/50 border border-dashed border-border/80 ${className}`}>
      <div className="w-14 h-14 rounded-2xl bg-lavender flex items-center justify-center text-primary-deep mb-4 shadow-sm">
        <Icon className="w-7 h-7" />
      </div>
      <h4 className="text-base font-bold text-content-primary mb-1.5">{title}</h4>
      <p className="text-sm text-content-secondary max-w-md mb-6 leading-relaxed">
        {message}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={Plus} size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
