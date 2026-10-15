import React from 'react';
import { X, CheckCircle2 } from 'lucide-react';

interface ToastProps {
  message: string | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, onClose }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900/95 border border-emerald-500/50 text-slate-100 px-4 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
      <p className="text-xs sm:text-sm font-medium flex-1 text-slate-200">{message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Fechar notificação"
        className="text-slate-400 hover:text-white text-xs font-bold p-1 rounded-lg hover:bg-slate-800 transition cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
