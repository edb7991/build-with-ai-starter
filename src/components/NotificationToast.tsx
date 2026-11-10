import React from 'react';
import { AlertCircle, CheckCircle2, TrendingDown, TrendingUp, X, Bell } from 'lucide-react';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'alert';
}

interface NotificationToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm pointer-events-none">
      {toasts.map((t) => {
        let borderClass = 'border-[#e0e3eb] bg-white text-[#181b24]';
        let icon = <CheckCircle2 className="w-4 h-4 text-[#089981]" />;

        if (t.type === 'alert') {
          borderClass = 'border-[#ffdad6] bg-[#fdebed] text-[#ba1a1a]';
          icon = <Bell className="w-4 h-4 text-[#ba1a1a]" />;
        } else if (t.type === 'warning') {
          borderClass = 'border-[#fde68a] bg-[#fffbeb] text-[#b45309]';
          icon = <AlertCircle className="w-4 h-4 text-[#d97706]" />;
        } else if (t.type === 'info') {
          borderClass = 'border-[#c3c5d8] bg-white text-[#181b24]';
          icon = <TrendingUp className="w-4 h-4 text-[#0049db]" />;
        }

        return (
          <div
            key={t.id}
            className={`pointer-events-auto p-3 rounded-xl border shadow-lg flex items-start gap-2.5 transition-all transform animate-in slide-in-from-bottom-2 duration-200 ${borderClass}`}
          >
            <div className="mt-0.5 shrink-0">{icon}</div>
            <div className="flex-1 pr-1">
              <h5 className="text-xs font-bold leading-tight">{t.title}</h5>
              <p className="text-[11px] opacity-90 mt-0.5 leading-snug">{t.message}</p>
            </div>
            <button
              onClick={() => onDismiss(t.id)}
              className="text-[#737687] hover:text-[#181b24] p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
