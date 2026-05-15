import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MaterialIcon from '../ui/MaterialIcon';
import { useModel } from '../../context/ModelContext';
import { loadSettings, saveSettings, updateSetting, isTinyfishConnected, getTinyfishKeyMasked, removeTinyfishKey } from '../../settingsStore';
import { validateKey } from '../../mcpClient';
import { AppSettings } from '../../types';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  const { state } = useModel();
  const [settings, setSettings] = useState<AppSettings>(loadSettings());
  const [tinyfishConnected, setTinyfishConnected] = useState(isTinyfishConnected());
  const [tinyfishKeyMasked, setTinyfishKeyMasked] = useState<string | null>(getTinyfishKeyMasked());
  const [showChangeKey, setShowChangeKey] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [keyValidation, setKeyValidation] = useState<'idle' | 'validating' | 'valid' | 'invalid' | 'network_error'>('idle');

  useEffect(() => {
    if (isOpen) {
      setSettings(loadSettings());
      setTinyfishConnected(isTinyfishConnected());
      setTinyfishKeyMasked(getTinyfishKeyMasked());
    }
  }, [isOpen]);

  const toggleSetting = useCallback(<K extends keyof AppSettings>(key: K) => {
    setSettings(prev => {
      const next = { ...prev, [key]: !prev[key] };
      saveSettings(next);
      return next;
    });
  }, []);

  const handleThemeToggle = useCallback(() => {
    setSettings(prev => {
      const newTheme: 'dark' | 'light' = prev.theme === 'dark' ? 'light' : 'dark';
      const next = { ...prev, theme: newTheme };
      saveSettings(next);
      document.documentElement.setAttribute('data-theme', newTheme);
      return next;
    });
  }, []);

  const handleClearCache = useCallback(() => {
    if (confirm('Clear the model cache? This will require re-downloading the model.')) {
      caches.keys().then(names => names.forEach(name => caches.delete(name)));
    }
  }, []);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose} className="fixed inset-0 z-[60]" style={{ background: 'rgba(0, 20, 42, 0.6)', backdropFilter: 'blur(4px)' }} />
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-y-0 right-0 w-full z-[70] glass-panel flex flex-col shadow-2xl" style={{ maxWidth: '360px', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
            <div className="h-16 px-6 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div className="flex items-center gap-3" style={{ color: 'var(--primary)' }}>
                <MaterialIcon name="settings" size={20} />
                <h2 className="text-xl font-bold">Settings</h2>
              </div>
              <button onClick={onClose} className="p-2 rounded-full transition-colors" style={{ color: 'var(--outline)' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} aria-label="Close settings">
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-8">
              {/* 1. Model Info */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="psychology" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Model Info</h3>
                </div>
                <div className="rounded-2xl p-4 space-y-3 border" style={{ background: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.05)' }}>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--outline)' }}>Model ID</span>
                    <span className="text-xs font-mono" style={{ color: 'var(--on-surface)' }}>gemma-4-E2B-it</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--outline)' }}>Quantization</span>
                    <span className="text-xs" style={{ color: 'var(--on-surface)' }}>q4f16</span>
                  </div>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 2. Performance */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="speed" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Performance</h3>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>WebGPU Status</span>
                  <span className={`text-xs font-bold ${state.stage === 'ready' ? 'text-green-400' : 'text-amber-400'}`}>{state.stage === 'ready' ? 'Available' : state.stage}</span>
                </div>
                {state.tps !== null && state.tps > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Current TPS</span>
                    <span className="text-xs font-bold" style={{ color: 'var(--primary-fixed-dim)' }}>{state.tps.toFixed(1)}</span>
                  </div>
                )}
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 3. Storage */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="storage" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Storage</h3>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Browser Cache</span>
                  <span className="text-xs" style={{ color: 'var(--on-surface-variant)' }}>Managed by browser</span>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 4. Privacy */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="shield" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Privacy</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Offline Mode</span>
                    <p className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--outline)' }}>Disable all external MCP calls</p>
                  </div>
                  <button onClick={() => toggleSetting('offlineMode')} className="w-10 h-5 rounded-full relative cursor-pointer transition-colors" style={{ background: settings.offlineMode ? 'var(--primary-container)' : 'var(--surface-variant)' }}>
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all" style={{ left: settings.offlineMode ? '22px' : '2px' }} />
                  </button>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 5. Web Search */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="search" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Web Search</h3>
                </div>
                {tinyfishConnected ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                        <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Connected</span>
                      </div>
                      <span className="text-xs font-mono" style={{ color: 'var(--on-surface-variant)' }} aria-label={`API key ending in ${tinyfishKeyMasked?.slice(-4)}`}>{tinyfishKeyMasked}</span>
                    </div>
                    {showChangeKey ? (
                      <div className="space-y-2">
                        <input
                          type="password"
                          value={newKey}
                          onChange={(e) => setNewKey(e.target.value)}
                          placeholder="tf_..."
                          disabled={keyValidation === 'validating'}
                          className="w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/20 focus:border-[#00D4FF] focus:outline-none disabled:opacity-50"
                          style={{ color: 'var(--on-surface)' }}
                        />
                        {keyValidation === 'invalid' && <p className="text-xs text-red-400">Invalid API key</p>}
                        {keyValidation === 'network_error' && <p className="text-xs text-red-400">Could not reach TinyFish</p>}
                        {keyValidation === 'valid' && <p className="text-xs text-green-400">Key updated ✓</p>}
                        <div className="flex gap-2">
                          <button
                            onClick={async () => {
                              if (!newKey.trim()) return;
                              setKeyValidation('validating');
                              const result = await validateKey(newKey.trim());
                              setKeyValidation(result);
                              if (result === 'valid') {
                                localStorage.setItem('stratos-tinyfish-key', newKey.trim());
                                setTinyfishConnected(true);
                                setTinyfishKeyMasked(getTinyfishKeyMasked());
                                setNewKey('');
                                setTimeout(() => { setShowChangeKey(false); setKeyValidation('idle'); }, 1500);
                              } else {
                                setTimeout(() => setKeyValidation('idle'), 3000);
                              }
                            }}
                            disabled={keyValidation === 'validating' || !newKey.trim()}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50"
                            style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
                          >
                            {keyValidation === 'validating' ? 'Validating...' : 'Save & Connect'}
                          </button>
                          <button onClick={() => { setShowChangeKey(false); setNewKey(''); setKeyValidation('idle'); }} className="px-3 py-1.5 rounded-lg text-xs" style={{ color: 'var(--outline)' }}>Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => setShowChangeKey(true)} className="px-3 py-1.5 rounded-lg text-xs font-medium" style={{ color: 'var(--primary-fixed-dim)' }}>Change key</button>
                        <button
                          onClick={() => { removeTinyfishKey(); setTinyfishConnected(false); setTinyfishKeyMasked(null); }}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium"
                          style={{ color: 'var(--error)' }}
                        >
                          Disconnect
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: 'var(--outline)' }} />
                      <span className="text-sm font-medium" style={{ color: 'var(--on-surface-variant)' }}>Not connected</span>
                    </div>
                    <button
                      onClick={() => { onClose(); }}
                      className="px-4 py-2 rounded-lg text-sm font-medium"
                      style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}
                    >
                      Connect Web Search
                    </button>
                  </div>
                )}
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 6. AI Behavior */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="brain" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>AI Behavior</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Thinking Mode Default</span>
                    <p className="text-[10px] font-medium tracking-wide" style={{ color: 'var(--outline)' }}>Enable reasoning by default</p>
                  </div>
                  <button onClick={() => toggleSetting('thinkingModeDefault')} className="w-10 h-5 rounded-full relative cursor-pointer transition-colors" style={{ background: settings.thinkingModeDefault ? 'var(--primary-container)' : 'var(--surface-variant)' }}>
                    <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all" style={{ left: settings.thinkingModeDefault ? '22px' : '2px' }} />
                  </button>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 7. Appearance */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="palette" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Appearance</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Theme</span>
                  <div className="flex p-1 rounded-full border" style={{ background: 'var(--surface-container-high)', borderColor: 'rgba(255,255,255,0.05)' }}>
                    <button onClick={() => { if (settings.theme !== 'dark') handleThemeToggle(); }} className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5" style={settings.theme === 'dark' ? { background: 'var(--primary-container)', color: 'var(--on-primary-container)', boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : { color: 'var(--outline)' }}>
                      <MaterialIcon name="dark_mode" size={12} />
                      Dark
                    </button>
                    <button onClick={() => { if (settings.theme !== 'light') handleThemeToggle(); }} className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors hover:text-white" style={settings.theme === 'light' ? { background: 'var(--primary-container)', color: 'var(--on-primary-container)', boxShadow: '0 0 10px rgba(0, 212, 255, 0.3)' } : { color: 'var(--outline)' }}>
                      <MaterialIcon name="light_mode" size={12} />
                      Light
                    </button>
                  </div>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: 'rgba(255,255,255,0.05)' }} />

              {/* 8. Maintenance */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="build" size={20} style={{ color: 'var(--secondary)' }} />
                  <h3 className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--outline)' }}>Maintenance</h3>
                </div>
                <button onClick={handleClearCache} className="w-full py-2.5 flex items-center justify-between px-3 -mx-3 rounded-lg transition-colors group" style={{ color: 'var(--error)' }} onMouseEnter={e => (e.currentTarget.style.background = 'rgba(147, 0, 10, 0.1)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                  <span className="text-sm font-medium">Clear Model Cache</span>
                  <MaterialIcon name="delete_forever" size={18} className="group-hover:scale-110 transition-transform" />
                </button>
              </section>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
