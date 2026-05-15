import { useState, useCallback } from 'react';
import MaterialIcon from '../ui/MaterialIcon';
import { validateKey } from '../../mcpClient';

interface WebSearchSetupPromptProps {
  onConnected: () => void;
  onSkip: (query?: string) => void;
}

const STORAGE_KEY = 'stratos-tinyfish-key';
const NOTICE_KEY = 'stratos-key-notice-shown';

export default function WebSearchSetupPrompt({ onConnected, onSkip }: WebSearchSetupPromptProps) {
  const [key, setKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showNotice, setShowNotice] = useState(false);

  const handleConnect = useCallback(async () => {
    if (!key.trim()) return;

    setLoading(true);
    setError(null);

    const result = await validateKey(key.trim());

    if (result === 'valid') {
      localStorage.setItem(STORAGE_KEY, key.trim());
      const noticeShown = localStorage.getItem(NOTICE_KEY);
      if (!noticeShown) {
        setShowNotice(true);
      } else {
        onConnected();
      }
    } else if (result === 'invalid') {
      setError('Invalid API key — please check and try again');
      setLoading(false);
    } else {
      setError('Could not reach TinyFish — check your connection and try again');
      setLoading(false);
    }
  }, [key, onConnected]);

  const handleNoticeDismiss = useCallback(() => {
    localStorage.setItem(NOTICE_KEY, '1');
    setShowNotice(false);
    onConnected();
  }, [onConnected]);

  return (
    <>
      <div className="flex items-center justify-center min-h-[400px] p-6">
        <div className="glass-panel rounded-2xl p-8 w-full max-w-md" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
          <div className="flex items-center gap-3 mb-6">
            <MaterialIcon name="search" size={24} style={{ color: 'var(--primary-fixed-dim)' }} />
            <h2 className="text-xl font-bold" style={{ color: 'var(--on-surface)' }}>Connect Web Search</h2>
          </div>

          <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            Web Research requires a free API key from TinyFish. Your key is stored locally and never sent anywhere except the search endpoint.
          </p>

          <button
            onClick={() => window.open('https://tinyfish.ai', '_blank', 'noopener')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium mb-6 transition-colors"
            style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--primary-fixed-dim)', border: '1px solid rgba(255,255,255,0.1)' }}
          >
            Get your free key →
            <MaterialIcon name="open_in_new" size={14} />
          </button>

          <ol id="key-steps" className="text-xs space-y-2 mb-6" style={{ color: 'var(--on-surface-variant)' }}>
            <li className="flex gap-2"><span className="font-bold" style={{ color: 'var(--primary-fixed-dim)' }}>1.</span> Sign up at tinyfish.ai</li>
            <li className="flex gap-2"><span className="font-bold" style={{ color: 'var(--primary-fixed-dim)' }}>2.</span> Copy your API key (starts with <code className="font-mono">tf_</code>)</li>
            <li className="flex gap-2"><span className="font-bold" style={{ color: 'var(--primary-fixed-dim)' }}>3.</span> Paste it below and click Save</li>
          </ol>

          <input
            id="tinyfish-key-input"
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder="tf_..."
            disabled={loading}
            className="w-full px-4 py-3 rounded-xl text-sm bg-white/5 border border-white/20 focus:border-[#00D4FF] focus:outline-none transition-colors disabled:opacity-50"
            style={{ color: 'var(--on-surface)' }}
            aria-describedby="key-steps"
          />

          {error && (
            <p className="text-sm mt-2 text-red-400" aria-live="polite">{error}</p>
          )}

          <button
            onClick={handleConnect}
            disabled={loading || !key.trim()}
            className="w-full mt-4 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
            aria-busy={loading}
          >
            {loading && <span className="material-symbols-outlined animate-spin" style={{ fontSize: 18 }}>progress_activity</span>}
            {loading ? 'Validating...' : 'Save & Connect'}
          </button>

          <button
            onClick={() => onSkip()}
            className="w-full mt-3 py-2 text-sm transition-colors"
            style={{ color: 'var(--outline)' }}
          >
            Skip — use model knowledge only
          </button>
        </div>
      </div>

      {showNotice && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background: 'rgba(0, 20, 42, 0.6)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-panel rounded-2xl p-8 w-full max-w-md mx-4" style={{ borderColor: 'rgba(255,255,255,0.1)' }}>
            <div className="flex items-center gap-3 mb-4">
              <MaterialIcon name="verified_user" size={24} style={{ color: 'var(--secondary)' }} />
              <h3 className="text-lg font-bold" style={{ color: 'var(--on-surface)' }}>Privacy Notice</h3>
            </div>
            <p className="text-sm mb-6" style={{ color: 'var(--on-surface-variant)' }}>
              Your API key is stored only in your browser's localStorage. It is never transmitted to any server except the TinyFish search endpoint when you run a Web Research task. No analytics, telemetry, or tracking is included in this application.
            </p>
            <button
              onClick={handleNoticeDismiss}
              className="w-full py-3 rounded-xl font-medium transition-colors"
              style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
