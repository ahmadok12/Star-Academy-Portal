import { AlertTriangle, CheckCircle2, X } from 'lucide-react';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'primary',
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const iconConfig = {
    danger: { icon: AlertTriangle, bg: 'bg-red-50 text-red-600 border-red-200' },
    warning: { icon: AlertTriangle, bg: 'bg-amber-50 text-amber-600 border-amber-200' },
    primary: { icon: CheckCircle2, bg: 'bg-slate-100 text-slate-800 border-slate-200' },
  }[type];

  const Icon = iconConfig.icon;

  const confirmBtnStyles = {
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-amber-600 hover:bg-amber-700 text-white',
    primary: 'bg-slate-900 hover:bg-slate-800 text-white',
  }[type];

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="fixed inset-0" onClick={onClose} aria-hidden="true" />
      
      <div className="relative bg-white w-full max-w-md rounded-2xl sm:rounded-3xl shadow-modal border border-slate-200/90 p-6 overflow-hidden animate-modal-in z-10">
        <div className="flex items-start space-x-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${iconConfig.bg}`}>
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-slate-900">{title}</h3>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{message}</p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white hover:bg-slate-50 rounded-xl border border-slate-200 transition"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`px-4 py-2 text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 ${confirmBtnStyles}`}
          >
            {isLoading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
