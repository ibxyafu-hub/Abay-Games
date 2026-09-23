import React, { useEffect } from 'react';
import { ToastMessage } from '../types';
import { CheckCircle2, Info, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onDismiss();
    }, 2500);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  return (
    <AnimatePresence>
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: [0.22, 0.9, 0.32, 1] }}
          className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-xs w-[90%] bg-[#0E1A2B] text-white px-4 py-3 rounded-xl shadow-xl flex items-center space-x-3 border border-white/10"
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-[#2E9BFF] shrink-0" />
          ) : toast.type === 'warning' ? (
            <AlertCircle className="w-5 h-5 text-[#FF5A6E] shrink-0" />
          ) : (
            <Info className="w-5 h-5 text-[#17B8D6] shrink-0" />
          )}
          <p className="text-xs font-medium text-white/90 leading-tight">
            {toast.message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
