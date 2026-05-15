import { motion } from "motion/react";
import { Cpu, FileAudio, Brain, Zap, ShieldCheck, AlertTriangle } from "lucide-react";
import { useModel } from "../../context/ModelContext";

export default function LandingPage() {
  const { state, loadModel } = useModel();

  const isSupported = state.stage !== "unsupported";

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-grow flex items-center justify-center pt-16 px-4 md:px-12 relative"
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-container/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary-container/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="glass-panel w-full max-w-4xl p-8 md:p-16 rounded-3xl text-center flex flex-col items-center z-10">
        <div className="mb-10">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 mb-6 mx-auto">
            <Cpu className="text-primary w-10 h-10" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-on-surface mb-2 tracking-tight">Stratos Office</h1>
          <p className="text-xl text-primary-fixed-dim">AI Office Assistant — Private, local AI for your daily work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <Cpu className="text-secondary mb-4 w-8 h-8" />
            <h3 className="font-bold text-on-surface mb-2">Advanced OCR</h3>
            <p className="text-sm text-on-surface-variant">Instant, privacy-first optical character recognition for any document format.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <FileAudio className="text-secondary mb-4 w-8 h-8" />
            <h3 className="font-bold text-on-surface mb-2">Live Transcription</h3>
            <p className="text-sm text-on-surface-variant">Convert meetings and voice notes to text using local neural processing.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <Brain className="text-secondary mb-4 w-8 h-8" />
            <h3 className="font-bold text-on-surface mb-2">Gemma 4 Engine</h3>
            <p className="text-sm text-on-surface-variant">High-performance LLM capabilities without ever sending data to a cloud server.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          {state.stage === "unsupported" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-4 bg-error-container/20 rounded-xl border border-error/30">
                <AlertTriangle className="text-error w-6 h-6" />
                <div className="text-left">
                  <p className="text-error font-bold text-sm">WebGPU Not Available</p>
                  <p className="text-error/80 text-xs mt-1">Please use Chrome 113+ or Edge 113+ with hardware acceleration enabled.</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={loadModel}
              disabled={state.stage === "checking"}
              className="bg-primary-container hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed text-on-background px-12 py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 duration-100 flex items-center gap-3 shadow-[0_0_20px_rgba(0,212,255,0.3)]"
            >
              <Zap className="fill-current w-6 h-6" />
              {state.stage === "checking" ? "Checking..." : "Load Gemma 4"}
            </button>
          )}

          <div className="flex flex-col gap-2 items-center max-w-lg">
            <p className="text-on-surface-variant italic">
              Powered by <span className="text-secondary-fixed-dim font-medium">Transformers.js</span>. Local execution ensures 100% privacy.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary-fixed-dim text-xs font-semibold rounded-full border border-primary/20">WebGPU Required</span>
              <span className="px-4 py-1.5 bg-primary-container/10 text-primary-fixed-dim text-xs font-semibold rounded-full border border-primary/20">4GB+ RAM Recommended</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center">
          <div className="flex items-center gap-3 opacity-60">
            <ShieldCheck className="text-secondary fill-current w-6 h-6" />
            <span className="text-xs text-on-surface-variant font-bold uppercase tracking-widest">End-to-End Local Privacy</span>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
