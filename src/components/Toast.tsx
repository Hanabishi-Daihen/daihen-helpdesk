import React from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface ToastProps {
  show: boolean;
  message: string;
  type?: 'success' | 'error';
}

export const Toast: React.FC<ToastProps> = ({ show, message, type = 'success' }) => {
  if (!show) return null;

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 md:right-6 z-[80] fade-in">
      <div
        className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl border text-xs font-bold backdrop-blur-md ${
          type === 'error'
            ? 'bg-[#fcebeb]/95 border-[#f5b8b8] text-[#c64545]'
            : 'bg-[#181715]/95 border-[#252320] text-[#faf9f5]'
        }`}
      >
        {type === 'error' ? (
          <AlertCircle size={16} className="text-[#c64545] shrink-0" />
        ) : (
          <CheckCircle2 size={16} className="text-[#5db872] shrink-0" />
        )}
        <span className="truncate max-w-xs">{message}</span>
      </div>
    </div>
  );
};
