import { useState, useCallback } from 'react';
import { motion } from 'motion/react';
import MaterialIcon from './ui/MaterialIcon';

const PASSWORD_HASH = '43c27b4e263fa191a6a7ec198cd4d5b47d17413c49d77dc533a01720707e3202';
const STORAGE_KEY = 'stratos-demo-access';

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(password: string): Promise<boolean> {
  const hash = await sha256(password);
  return hash === PASSWORD_HASH;
}

interface DemoGateProps {
  children: React.ReactNode;
}

export default function DemoGate({ children }: DemoGateProps) {
  const [unlocked, setUnlocked] = useState(() => sessionStorage.getItem(STORAGE_KEY) === '1');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;

    setChecking(true);
    setError(null);

    const valid = await verifyPassword(password);
    setChecking(false);

    if (valid) {
      sessionStorage.setItem(STORAGE_KEY, '1');
      setUnlocked(true);
    } else {
      setError('Incorrect password. Please try again.');
      setPassword('');
    }
  }, [password]);

  if (unlocked) {
    return <>{children}</>;
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        background: 'linear-gradient(135deg, #04203b 0%, #0a2540 50%, #04203b 100%)',
      }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(0, 212, 255, 0.08)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(0, 229, 204, 0.08)', filter: 'blur(120px)' }} />

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-md relative z-10"
      >
        <div
          className="rounded-2xl p-8 md:p-10 border"
          style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
          }}
        >
          <div className="text-center mb-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border"
              style={{
                background: 'rgba(0, 212, 255, 0.1)',
                borderColor: 'rgba(0, 212, 255, 0.2)',
              }}
            >
              <MaterialIcon name="lock" size={28} style={{ color: 'var(--primary-fixed-dim, #00D4FF)' }} />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: 'var(--on-surface, #fff)' }}>
              Stratos Office
            </h1>
            <p className="text-sm" style={{ color: 'var(--on-surface-variant, #859398)' }}>
              Enter the demo password to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(null); }}
                placeholder="Demo password"
                autoFocus
                autoComplete="off"
                className="w-full px-4 py-3 rounded-xl border text-sm focus:outline-none transition-colors"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  borderColor: error ? 'rgba(255, 180, 171, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                  color: 'var(--on-surface, #fff)',
                }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'rgba(147, 0, 10, 0.15)' }}>
                <MaterialIcon name="error_outline" size={16} style={{ color: 'var(--error, #FFB4AB)' }} />
                <p className="text-xs" style={{ color: 'var(--error, #FFB4AB)' }}>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={checking || !password.trim()}
              className="w-full py-3 rounded-xl font-medium transition-all min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: 'var(--primary-container, #00D4FF)',
                color: 'var(--on-primary-container, #061220)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.2)',
              }}
            >
              {checking ? (
                <>
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                <>
                  <MaterialIcon name="bolt" size={18} filled />
                  Unlock Demo
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.05)' }}>
            <div className="flex items-center justify-center gap-2 opacity-50">
              <MaterialIcon name="verified_user" size={14} style={{ color: 'var(--outline, #859398)' }} />
              <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--outline, #859398)' }}>
                Private &amp; Local
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.main>
  );
}
