import React from 'react';
import { EntityStatus } from '../../types/database.types';

interface StatusBadgeProps {
  status?: EntityStatus;
  isCurrent?: boolean;
  className?: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, isCurrent, className = '' }) => {
  if (isCurrent) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-xs ${className}`}>
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
        Current
      </span>
    );
  }

  const isActive = status === 'active';

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border shadow-xs ${
        isActive
          ? 'bg-emerald-50/70 text-emerald-700 border-emerald-200/50'
          : 'bg-slate-100 text-slate-600 border-slate-200'
      } ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          isActive ? 'bg-emerald-500' : 'bg-slate-400'
        }`}
      ></span>
      {isActive ? 'Active' : 'Inactive'}
    </span>
  );
};
