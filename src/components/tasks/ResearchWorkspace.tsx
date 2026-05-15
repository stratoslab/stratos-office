import { useState, useEffect } from 'react';
import { TaskType } from '../../types';
import TaskWorkspace from '../workspace/TaskWorkspace';
import WebSearchSetupPrompt from './WebSearchSetupPrompt';
import Toast from '../ui/Toast';
import MaterialIcon from '../ui/MaterialIcon';
import { isTinyfishConnected, loadSettings } from '../../settingsStore';
import { McpAuthError } from '../../mcpClient';
import { useTask } from '../../context/TaskContext';

interface ResearchWorkspaceProps {
  taskType: TaskType;
}

export default function ResearchWorkspace({ taskType }: ResearchWorkspaceProps) {
  const { selectTask } = useTask();
  const [connected, setConnected] = useState(isTinyfishConnected());
  const [offlineMode, setOfflineMode] = useState(loadSettings().offlineMode);
  const [showToast, setShowToast] = useState(false);
  const [authError, setAuthError] = useState(false);

  useEffect(() => {
    setConnected(isTinyfishConnected());
    setOfflineMode(loadSettings().offlineMode);
  }, [taskType]);

  useEffect(() => {
    const handler = () => {
      setConnected(isTinyfishConnected());
      setOfflineMode(loadSettings().offlineMode);
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const handleConnected = () => {
    setConnected(true);
    setShowToast(true);
  };

  const handleSkip = () => {
    selectTask('general_text');
  };

  const handleDismissToast = () => {
    setShowToast(false);
  };

  if (offlineMode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 gap-4">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center" style={{ borderColor: 'rgba(245, 158, 11, 0.3)' }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <MaterialIcon name="lock" size={32} style={{ color: 'var(--warning)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>Offline Mode Enabled</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            Web research requires an internet connection. Disable Offline Mode in Settings to use this feature.
          </p>
          <button
            onClick={() => selectTask('general_text')}
            className="px-6 py-3 rounded-xl font-medium transition-colors"
            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
          >
            Use General Text Instead
          </button>
        </div>
      </div>
    );
  }

  if (authError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-6 gap-4">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md text-center" style={{ borderColor: 'rgba(239, 68, 68, 0.3)' }}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <MaterialIcon name="error" size={32} style={{ color: 'var(--error)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>API Key Invalid</h2>
          </div>
          <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            Your TinyFish API key is no longer valid. Please reconnect in Settings.
          </p>
          <button
            onClick={() => { setAuthError(false); setConnected(false); }}
            className="px-6 py-3 rounded-xl font-medium transition-colors"
            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
          >
            Reconnect Web Search
          </button>
        </div>
      </div>
    );
  }

  if (!connected) {
    return (
      <>
        <WebSearchSetupPrompt onConnected={handleConnected} onSkip={handleSkip} />
        {showToast && (
          <Toast message="Web search connected ✓" type="success" onDismiss={handleDismissToast} />
        )}
      </>
    );
  }

  return (
    <>
      <TaskWorkspace taskType={taskType} />
      {showToast && (
        <Toast message="Web search connected ✓" type="success" onDismiss={handleDismissToast} />
      )}
    </>
  );
}
