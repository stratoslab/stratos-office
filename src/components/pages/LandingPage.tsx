import { motion } from 'motion/react';
import { useModel } from '../../context/ModelContext';
import MaterialIcon from '../ui/MaterialIcon';

const categories = [
  {
    icon: 'description',
    label: 'Documents',
    color: 'var(--primary-fixed-dim)',
    tasks: ['Document OCR', 'Receipt Parser', 'Handwriting Transcription', 'Table Extraction', 'Form Extraction', 'PDF Q&A', 'Contract Analyzer', 'Redline Comparison'],
  },
  {
    icon: 'image',
    label: 'Visual',
    color: 'var(--secondary)',
    tasks: ['Chart Data Extraction', 'Screen Analysis', 'Wireframe to HTML', 'Slide Analyzer', 'Whiteboard OCR', 'Object Detection'],
  },
  {
    icon: 'mic',
    label: 'Audio',
    color: 'var(--tertiary-container)',
    tasks: ['Meeting Transcription', 'Meeting Minutes', 'Voice to Email', 'Multilingual Transcription', 'Interview Transcriber'],
  },
  {
    icon: 'edit_note',
    label: 'Text & Writing',
    color: 'var(--primary-fixed-dim)',
    tasks: ['Email Drafting', 'Email Reply Drafts', 'Tone Rewriter', 'Summarization', 'Meeting Prep', 'Report Generator', 'Code Review', 'General Text'],
  },
  {
    icon: 'search',
    label: 'Research',
    color: 'var(--primary-fixed-dim)',
    tasks: ['Web Research with MCP', 'Deep Document Q&A'],
  },
  {
    icon: 'verified_user',
    label: 'Privacy-First',
    color: 'var(--tertiary-container)',
    tasks: ['Medical Summarizer', 'Legal Document Analyzer', 'Financial Statement Parser'],
  },
];

export default function LandingPage() {
  const { state, loadModel } = useModel();
  const isUnsupported = state.stage === 'unsupported';

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex flex-col items-center pt-16 px-4 md:px-12 relative overflow-y-auto"
      style={{ minHeight: 'calc(100vh - 4rem)' }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(0, 212, 255, 0.1)', filter: 'blur(120px)' }} />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: 'rgba(0, 229, 204, 0.1)', filter: 'blur(120px)' }} />

      <div className="w-full max-w-6xl z-10 pb-16">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20 mb-6 mx-auto p-3">
            <img src="/stratos-logo-white.png" alt="Stratos Office" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight" style={{ color: 'var(--on-surface)' }}>
            Stratos Office
          </h1>
          <p className="text-xl" style={{ color: 'var(--primary-fixed-dim)' }}>
            AI Office Assistant — Private, local AI for your daily work
          </p>
          <p className="text-sm mt-3 max-w-2xl mx-auto" style={{ color: 'var(--on-surface-variant)' }}>
            30+ AI-powered tasks across documents, visual, audio, text, research, and privacy categories.
            All inference runs locally in your browser — no data ever leaves your device.
          </p>
        </div>

        {/* Category showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
          {categories.map(cat => (
            <div
              key={cat.label}
              className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-white/15 transition-colors"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--surface-container-highest)', color: cat.color }}>
                  <MaterialIcon name={cat.icon} size={22} />
                </div>
                <h3 className="font-bold text-base" style={{ color: 'var(--on-surface)' }}>{cat.label}</h3>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {cat.tasks.map(task => (
                  <span
                    key={task}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium"
                    style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--on-surface-variant)' }}
                  >
                    {task}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="flex flex-col items-center gap-6">
          {isUnsupported ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl border" style={{ background: 'rgba(147, 0, 10, 0.2)', borderColor: 'rgba(255, 180, 171, 0.3)' }}>
                <MaterialIcon name="warning" size={24} style={{ color: 'var(--error)' }} />
                <div className="text-left">
                  <p className="font-bold text-sm" style={{ color: 'var(--error)' }}>WebGPU Not Available</p>
                  <p className="text-xs mt-1" style={{ color: 'rgba(255, 180, 171, 0.8)' }}>
                    Please use Chrome 113+ or Edge 113+ with hardware acceleration enabled.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={loadModel}
              disabled={state.stage === 'checking'}
              className="disabled:opacity-50 disabled:cursor-not-allowed px-12 py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 duration-100 flex items-center gap-3"
              style={{
                background: 'var(--primary-container)',
                color: 'var(--on-primary-container)',
                boxShadow: '0 0 20px rgba(0, 212, 255, 0.3)',
              }}
              onMouseEnter={e => (e.currentTarget.style.filter = 'brightness(1.1)')}
              onMouseLeave={e => (e.currentTarget.style.filter = 'brightness(1)')}
            >
              <MaterialIcon name="bolt" size={24} filled />
              {state.stage === 'checking' ? 'Checking...' : 'Load Gemma 4'}
            </button>
          )}

          <div className="flex flex-col gap-2 items-center max-w-lg">
            <p className="italic" style={{ color: 'var(--on-surface-variant)' }}>
              Powered by{' '}
              <span className="font-medium" style={{ color: 'var(--secondary-fixed-dim)' }}>
                Transformers.js
              </span>
              . Local execution ensures 100% privacy.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-4 py-1.5 text-xs font-semibold rounded-full border" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary-fixed-dim)', borderColor: 'rgba(168, 232, 255, 0.2)' }}>
                WebGPU Required
              </span>
              <span className="px-4 py-1.5 text-xs font-semibold rounded-full border" style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary-fixed-dim)', borderColor: 'rgba(168, 232, 255, 0.2)' }}>
                4GB+ RAM Recommended
              </span>
            </div>
          </div>
        </div>

        {/* Privacy badge */}
        <div className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center">
          <div className="flex items-center gap-3 opacity-60">
            <MaterialIcon name="verified_user" size={24} filled style={{ color: 'var(--secondary)' }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--on-surface-variant)' }}>
              End-to-End Local Privacy
            </span>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
