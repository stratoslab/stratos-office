import { useEffect } from 'react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import MaterialIcon from './MaterialIcon';

interface ToastProps {
  message: string;
  type: 'success' | 'error' | 'info';
  onDismiss: () => void;
}

export default function Toast({ message, type, onDismiss }: ToastProps) {
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [onDismiss]);

  const colors = {
    success: { bg: 'rgba(16, 185, 129, 0.15)', border: 'rgba(16, 185, 129, 0.3)', icon: '#10B981', icon_name: 'check_circle' },
    error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', icon: '#EF4444', icon_name: 'error' },
    info: { bg: 'rgba(0, 212, 255, 0.15)', border: 'rgba(0, 212, 255, 0.3)', icon: '#00D4FF', icon_name: 'info' },
  };
  const c = colors[type];

  return (
    <motion.div
      initial={reducedMotion ? { opacity: 1 } : { y: 20, opacity: 0 }}
      animate={reducedMotion ? { opacity: 1 } : { y: 0, opacity: 1 }}
      exit={reducedMotion ? { opacity: 0 } : { y: 20, opacity: 0 }}
      className="fixed bottom-6 right-6 z-[100] glass-panel rounded-xl px-4 py-3 flex items-center gap-3 max-w-sm shadow-lg"
      style={{
        background: c.bg,
        border: `1px solid ${c.border}`,
      }}
      role="status"
      aria-live="polite"
    >
      <MaterialIcon
        name={c.icon_name}
        size={20}
        style={{ color: c.icon }}
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
