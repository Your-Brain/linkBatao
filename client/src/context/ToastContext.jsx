import React, { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info, X, Radio } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Notification Container - Highest z-index to always render on top of modals */}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map(toast => {
            let toastStyle = 'border-purple-500/40 text-purple-200 bg-[#0d081e]/98 shadow-[0_0_25px_rgba(147,51,234,0.35)]';
            let IconComponent = <Radio className="w-4 h-4 text-purple-400 shrink-0 animate-pulse" />;

            if (toast.type === 'success' || toast.type === 'approved') {
              toastStyle = 'border-emerald-500/50 text-emerald-200 bg-[#07131b]/98 shadow-[0_0_25px_rgba(16,185,129,0.35)]';
              IconComponent = <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
            } else if (toast.type === 'error' || toast.type === 'rejected') {
              toastStyle = 'border-rose-500/50 text-rose-200 bg-[#1a070e]/98 shadow-[0_0_25px_rgba(244,63,94,0.35)]';
              IconComponent = <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
            } else if (toast.type === 'warning' || toast.type === 'pending') {
              toastStyle = 'border-amber-500/50 text-amber-200 bg-[#1a0f07]/98 shadow-[0_0_25px_rgba(245,158,11,0.35)]';
              IconComponent = <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />;
            }

            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, y: 20, scale: 0.92 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 15, scale: 0.95 }}
                transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className={`pointer-events-auto flex items-start justify-between gap-3 px-4 py-3 rounded-2xl shadow-2xl border text-left hud-bracket ${toastStyle}`}
              >
                <div className="flex items-start gap-2.5 min-w-0 pt-0.5">
                  {IconComponent}
                  <span className="text-xs font-mono font-medium break-words leading-relaxed select-text">{toast.message}</span>
                </div>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="text-purple-400/60 hover:text-white transition-colors cursor-pointer shrink-0 p-1 rounded hover:bg-white/10"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
