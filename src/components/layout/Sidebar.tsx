import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TaskType, TaskCategory } from '../../types';
import { useTask } from '../../context/TaskContext';
import { usePipeline } from '../../context/PipelineContext';
import { TASK_CONFIGS } from '../../taskRouter';
import { useModel } from '../../context/ModelContext';
import { loadSettings } from '../../settingsStore';
import MaterialIcon from '../ui/MaterialIcon';

interface SidebarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const categories: { key: TaskCategory; label: string; icon: string }[] = [
  { key: 'documents', label: 'Documents', icon: 'description' },
  { key: 'visual', label: 'Visual', icon: 'image' },
  { key: 'audio', label: 'Audio', icon: 'mic' },
  { key: 'text', label: 'Text & Writing', icon: 'edit_note' },
  { key: 'research', label: 'Research', icon: 'search' },
  { key: 'privacy', label: 'Privacy-First', icon: 'verified_user' },
];

export default function Sidebar({ onOpenHistory, onOpenSettings, mobileOpen, onMobileClose }: SidebarProps) {
  const { state } = useModel();
  const { activeTask, selectTask } = useTask();
  const { activeTemplate, resetPipeline } = usePipeline();
  const [expandedCategory, setExpandedCategory] = useState<TaskCategory | null>('documents');
  const isReady = state.stage === 'ready';
  const settings = loadSettings();

  const goHome = () => {
    selectTask(null);
    resetPipeline();
    onMobileClose?.();
  };

  const toggleCategory = (key: TaskCategory) => {
    if (key === 'research' && settings.offlineMode) return;
    setExpandedCategory(prev => prev === key ? null : key);
  };

  const selectTaskType = (taskType: TaskType) => {
    selectTask(taskType);
    onMobileClose?.();
  };

  const visibleCategories = categories.filter(cat => !(cat.key === 'research' && settings.offlineMode));

  const sidebarContent = (
    <div
      className="flex flex-col h-full flex-shrink-0 z-20"
      style={{
        background: 'rgba(4, 32, 59, 0.4)',
        backdropFilter: 'blur(24px)',
      }}
    >
      {/* Header with close button on mobile */}
      <div className="px-4 md:px-6 mb-4 md:mb-6 mt-4 md:mt-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={goHome}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden"
              style={{
                background: 'var(--primary-container)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
              }}
            >
              <img src="/stratos-logo-white.png" alt="Stratos Office" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <p
                className="text-[12px] font-semibold tracking-[0.05em] uppercase"
                style={{ color: 'var(--primary-container)' }}
              >
                Stratos Office
              </p>
              <p className="text-[14px]" style={{ color: 'var(--on-surface-variant)' }}>
                {isReady ? 'Gemma 4 Active' : 'Loading...'}
              </p>
            </div>
          </div>
          <button
            onClick={onMobileClose}
            className="md:hidden p-2 rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center transition-colors"
            style={{ color: 'var(--outline)' }}
            aria-label="Close navigation"
          >
            <MaterialIcon name="close" size={20} />
          </button>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {/* Pipelines section */}
        <button
          onClick={() => { selectTask(null); resetPipeline(); onMobileClose?.(); }}
          className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-colors min-h-[44px] mb-2"
          style={{
            color: activeTemplate ? 'var(--primary-fixed-dim)' : 'var(--on-surface-variant)',
            background: activeTemplate ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
          }}
        >
          <MaterialIcon name="account_tree" size={20} />
          <span className="text-sm font-medium flex-1 text-left">Pipelines</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(0,229,204,0.1)', color: 'var(--secondary)' }}>8</span>
        </button>

        {visibleCategories.map(cat => {
          const tasks = Object.values(TASK_CONFIGS).filter(t => t.category === cat.key);
          const isExpanded = expandedCategory === cat.key;
          const hasActiveTask = tasks.some(t => t.taskType === activeTask);

          return (
            <div key={cat.key}>
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-colors min-h-[44px]"
                style={{
                  color: hasActiveTask ? 'var(--primary-fixed-dim)' : 'var(--on-surface-variant)',
                  background: hasActiveTask ? 'rgba(0, 212, 255, 0.1)' : 'transparent',
                }}
              >
                <MaterialIcon name={cat.icon} size={20} />
                <span className="text-sm font-medium flex-1 text-left">{cat.label}</span>
                <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={16} />
              </button>
              {isExpanded && (
                <div className="ml-4 mt-1 space-y-0.5 border-l border-white/10 pl-2">
                  {tasks.map(task => (
                    <button
                      key={task.taskType}
                      onClick={() => selectTaskType(task.taskType)}
                      disabled={!isReady}
                      className="w-full flex items-center gap-2 px-3 py-2 md:py-1.5 rounded-lg text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed min-h-[44px]"
                      style={{
                        color: activeTask === task.taskType ? 'var(--primary-fixed-dim)' : 'var(--on-surface-variant)',
                        background: activeTask === task.taskType ? 'rgba(0, 212, 255, 0.05)' : 'transparent',
                      }}
                      title={!isReady ? 'Model must be loaded first' : undefined}
                    >
                      <MaterialIcon name={task.icon} size={16} />
                      <span className="text-xs">{task.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pt-4 space-y-1" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <button
          onClick={onOpenHistory}
          className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-colors min-h-[44px]"
          style={{ color: 'var(--on-surface-variant)' }}
        >
          <MaterialIcon name="history" size={20} />
          <span className="text-sm font-medium">History</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-3 md:py-2 rounded-lg transition-colors min-h-[44px]"
          style={{ color: 'var(--on-surface-variant)' }}
        >
          <MaterialIcon name="settings" size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex flex-col h-full py-6"
        style={{
          borderRight: '1px solid rgba(255,255,255,0.1)',
          width: '280px',
        }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              className="fixed inset-0 z-[55] md:hidden"
              style={{ background: 'rgba(0, 20, 42, 0.6)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 w-full z-[60] md:hidden flex flex-col shadow-2xl"
              style={{
                maxWidth: '300px',
                borderRight: '1px solid rgba(255,255,255,0.1)',
              }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
