import { useState } from 'react';
import { TaskType, TaskCategory } from '../../types';
import { useTask } from '../../context/TaskContext';
import { TASK_CONFIGS } from '../../taskRouter';
import { useModel } from '../../context/ModelContext';
import { loadSettings } from '../../settingsStore';
import MaterialIcon from '../ui/MaterialIcon';

interface SidebarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

const categories: { key: TaskCategory; label: string; icon: string }[] = [
  { key: 'documents', label: 'Documents', icon: 'description' },
  { key: 'visual', label: 'Visual', icon: 'image' },
  { key: 'audio', label: 'Audio', icon: 'mic' },
  { key: 'text', label: 'Text & Writing', icon: 'edit_note' },
  { key: 'research', label: 'Research', icon: 'search' },
  { key: 'privacy', label: 'Privacy-First', icon: 'verified_user' },
];

export default function Sidebar({ onOpenHistory, onOpenSettings }: SidebarProps) {
  const { state } = useModel();
  const { activeTask, selectTask } = useTask();
  const [expandedCategory, setExpandedCategory] = useState<TaskCategory | null>('documents');
  const isReady = state.stage === 'ready';
  const settings = loadSettings();

  const toggleCategory = (key: TaskCategory) => {
    if (key === 'research' && settings.offlineMode) return;
    setExpandedCategory(prev => prev === key ? null : key);
  };

  const selectTaskType = (taskType: TaskType) => {
    selectTask(taskType);
  };

  const visibleCategories = categories.filter(cat => !(cat.key === 'research' && settings.offlineMode));

  return (
    <aside
      className="hidden md:flex flex-col h-full py-6 flex-shrink-0 z-20"
      style={{
        background: 'rgba(4, 32, 59, 0.4)',
        backdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255,255,255,0.1)',
        width: '280px',
      }}
    >
      <div className="px-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
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
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {visibleCategories.map(cat => {
          const tasks = Object.values(TASK_CONFIGS).filter(t => t.category === cat.key);
          const isExpanded = expandedCategory === cat.key;
          const hasActiveTask = tasks.some(t => t.taskType === activeTask);

          return (
            <div key={cat.key}>
              <button
                onClick={() => toggleCategory(cat.key)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
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
                      className="w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-left transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--on-surface-variant)' }}
        >
          <MaterialIcon name="history" size={20} />
          <span className="text-sm font-medium">History</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors"
          style={{ color: 'var(--on-surface-variant)' }}
        >
          <MaterialIcon name="settings" size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </aside>
  );
}
