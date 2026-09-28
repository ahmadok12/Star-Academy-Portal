import React from 'react';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  message?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ message = 'Loading data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-3 bg-white/60 rounded-2xl border border-slate-100">
      <Loader2 className="w-6 h-6 animate-spin text-slate-700" />
      <p className="text-xs font-medium text-slate-500">{message}</p>
    </div>
  );
};
