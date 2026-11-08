import React from 'react';

export const Skeleton = ({ className = '' }) => {
  return (
    <div className={`bg-gray-200/70 rounded-xl animate-pulse shimmer-effect ${className}`} />
  );
};

export const CardSkeleton = () => {
  return (
    <div className="bg-white rounded-2xl border border-border/80 p-6 shadow-card space-y-4">
      <div className="flex justify-between items-center">
        <Skeleton className="w-24 h-4" />
        <Skeleton className="w-8 h-8 rounded-full" />
      </div>
      <Skeleton className="w-32 h-8" />
      <Skeleton className="w-48 h-3" />
    </div>
  );
};

export const TableSkeleton = ({ rows = 5 }) => {
  return (
    <div className="bg-white rounded-2xl border border-border/80 shadow-card overflow-hidden">
      <div className="p-4 border-b border-border/60">
        <Skeleton className="w-36 h-5" />
      </div>
      <div className="divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="p-4 flex items-center justify-between gap-4">
            <Skeleton className="w-28 h-4" />
            <Skeleton className="w-36 h-4" />
            <Skeleton className="w-20 h-6 rounded-full" />
            <Skeleton className="w-16 h-8 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Skeleton;
