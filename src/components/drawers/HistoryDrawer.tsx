import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MaterialIcon from '../ui/MaterialIcon';
import { TaskEntry } from '../../types';
import { getAllEntries, deleteEntry, clearAll } from '../../historyStore';
import { getTaskConfig } from '../../taskRouter';
import { useTask } from '../../context/TaskContext';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryColors: Record<string, { bg: string; color: string }> = {
  documents: { bg: 'rgba(168, 232, 255, 0.1)', color: 'var(--primary)' },
  visual: { bg: 'rgba(111, 255, 232, 0.1)', color: 'var(--secondary)' },
  audio: { bg: 'rgba(254, 181, 40, 0.1)', color: 'var(--tertiary-container)' },
  text: { bg: 'rgba(168, 232, 255, 0.1)', color: 'var(--primary)' },
  research: { bg: 'rgba(168, 232, 255, 0.1)', color: 'var(--primary)' },
  privacy: { bg: 'rgba(254, 181, 40, 0.1)', color: 'var(--tertiary-container)' },
};

function relativeTime(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diff = Math.floor((now.getTime() - then.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const [entries, setEntries] = useState<TaskEntry[]>([]);
  const { selectTask } = useTask();

  const loadEntries = useCallback(() => {
    getAllEntries().then(setEntries);
  }, []);

  useEffect(() => {
    if (isOpen) loadEntries();
  }, [isOpen, loadEntries]);

  const handleDelete = useCallback(async (id: string) => {
    await deleteEntry(id);
    setEntries(prev => prev.filter(e => e.id !== id));
  }, []);

  const handleClearAll = useCallback(async () => {
    if (confirm('Clear all history?')) {
      await clearAll();
      setEntries([]);
    }
  }, []);

  const handleEntryClick = useCallback((entry: TaskEntry) => {
    selectTask(entry.type);
    onClose();
  }, [selectTask, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0, 20, 42, 0.6)', backdropFilter: 'blur(4px)' }}
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full z-[70] glass-panel flex flex-col shadow-2xl"
            style={{ maxWidth: '360px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
          >
            <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 shrink-0" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <h2 className="text-lg md:text-xl font-bold" style={{ color: 'var(--on-background)' }}>Task History</h2>
              <button onClick={onClose} className="w-10 h-10 md:w-8 md:h-8 rounded-full flex items-center justify-center transition-colors min-w-[44px] min-h-[44px]" style={{ color: 'var(--outline)' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} aria-label="Close history">
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 py-4">
              {entries.length === 0 && (
                <p className="text-center text-gray-500 text-sm py-8">No task history yet.</p>
              )}
              {entries.map(entry => {
                const config = getTaskConfig(entry.type);
                const colors = categoryColors[entry.category] ?? categoryColors.documents;
                return (
                  <div
                    key={entry.id}
                    className="glass-panel p-3 rounded-xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                    onClick={() => handleEntryClick(entry)}
                  >
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shrink-0" style={{ background: colors.bg, color: colors.color }}>
                        <MaterialIcon name={config?.icon ?? 'description'} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold truncate" style={{ color: 'var(--on-surface)' }}>{entry.inputSummary || config?.label}</span>
                          <span className="text-[10px] font-medium ml-2 shrink-0" style={{ color: 'var(--outline)' }}>{relativeTime(entry.timestamp)}</span>
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full" style={{ background: entry.status === 'complete' ? 'var(--secondary-container)' : entry.status === 'error' ? 'var(--error)' : 'var(--outline)' }} />
                            <span className="text-[10px] font-bold" style={{ color: colors.color }}>{entry.status}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDelete(entry.id); }}
                            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
                            aria-label="Delete entry"
                          >
                            <MaterialIcon name="delete" size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0, 15, 33, 0.2)' }}>
              <button
                onClick={handleClearAll}
                className="w-full py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: 'rgba(147, 0, 10, 0.2)', color: 'var(--error)' }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(147, 0, 10, 0.3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(147, 0, 10, 0.2)')}
              >
                <MaterialIcon name="delete_sweep" size={18} />
                Clear All History
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
