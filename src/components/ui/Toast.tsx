import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import MaterialIcon from './MaterialIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const isSuccess = type === 'success';

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { y: 20, opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      className="fixed bottom-6 right-6 z-[100] glass-panel rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm shadow-lg"
      style={{
        background: isSuccess ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
        border: `1px solid ${isSuccess ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
      }}
      role="status"
      aria-live="polite"
    >
      <MaterialIcon
        name={isSuccess ? 'check_circle' : 'error'}
        size={20}
        style={{ color: isSuccess ? '#10B981' : '#EF4444' }}
      />
      <span className="text-sm" style={{ color: 'var(--on-surface)' }}>{message}</span>
      <button
        onClick={onDismiss}
        className="ml-2 p-1 rounded hover:bg-white/10 transition-colors"
        aria-label="Dismiss notification"
      >
        <MaterialIcon name="close" size={16} style={{ color: 'var(--outline)' }} />
      </button>
    </motion.div>
  );
}
