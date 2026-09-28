import React, { useEffect } from 'react';
import { X, LucideIcon } from 'lucide-react';

interface FormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  badge?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

export const FormDialog: React.FC<FormDialogProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  badge,
  icon: Icon,
  children,
  footer,
  maxWidth = 'lg',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-3xl',
    '2xl': 'max-w-4xl',
  }[maxWidth];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />
      
      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className={`relative bg-white w-full ${maxWidthClasses} max-h-[92vh] rounded-2xl sm:rounded-3xl shadow-modal border border-slate-200/90 flex flex-col overflow-hidden animate-modal-in z-10`}
      >
        {/* Modal Header */}
        <header className="px-6 py-4 sm:py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center space-x-3.5">
            {Icon && (
              <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs shrink-0">
                <Icon className="w-5 h-5 stroke-[1.8]" />
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 id="modal-title" className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
                  {title}
                </h2>
                {badge && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-mono font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                    {badge}
                  </span>
                )}
              </div>
              {subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-lg border border-slate-200 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors flex items-center justify-center"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto custom-scroll flex-1 text-slate-800 space-y-4">
          {children}
        </div>

        {/* Optional Footer */}
        {footer && (
          <footer className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-3 shrink-0">
            {footer}
          </footer>
        )}
      </section>
    </div>
  );
};
