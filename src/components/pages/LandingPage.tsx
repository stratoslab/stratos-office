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
      style={{ minHeight: "calc(100vh - 4rem)" }}
    >
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(0, 212, 255, 0.1)", filter: "blur(120px)" }}></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full pointer-events-none" style={{ background: "rgba(0, 229, 204, 0.1)", filter: "blur(120px)" }}></div>

      <div className="glass-panel w-full max-w-4xl p-8 md:p-16 rounded-3xl text-center flex flex-col items-center z-10">
        <div className="mb-10">
          <div className="w-16 h-16 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 mb-6 mx-auto">
            <Cpu className="w-10 h-10" style={{ color: "var(--primary)" }} />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight" style={{ color: "var(--on-surface)" }}>Stratos Office</h1>
          <p className="text-xl" style={{ color: "var(--primary-fixed-dim)" }}>AI Office Assistant — Private, local AI for your daily work</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full mb-16">
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <Cpu className="mb-4 w-8 h-8" style={{ color: "var(--secondary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--on-surface)" }}>Advanced OCR</h3>
            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>Instant, privacy-first optical character recognition for any document format.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <FileAudio className="mb-4 w-8 h-8" style={{ color: "var(--secondary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--on-surface)" }}>Live Transcription</h3>
            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>Convert meetings and voice notes to text using local neural processing.</p>
          </div>
          <div className="glass-panel p-6 rounded-2xl border border-white/5 text-left hover:scale-105 transition-transform duration-300">
            <Brain className="mb-4 w-8 h-8" style={{ color: "var(--secondary)" }} />
            <h3 className="font-bold mb-2" style={{ color: "var(--on-surface)" }}>Gemma 4 Engine</h3>
            <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>High-performance LLM capabilities without ever sending data to a cloud server.</p>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 w-full">
          {state.stage === "unsupported" ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 px-6 py-4 rounded-xl border" style={{ background: "rgba(147, 0, 10, 0.2)", borderColor: "rgba(255, 180, 171, 0.3)" }}>
                <AlertTriangle className="w-6 h-6" style={{ color: "var(--error)" }} />
                <div className="text-left">
                  <p className="font-bold text-sm" style={{ color: "var(--error)" }}>WebGPU Not Available</p>
                  <p className="text-xs mt-1" style={{ color: "rgba(255, 180, 171, 0.8)" }}>Please use Chrome 113+ or Edge 113+ with hardware acceleration enabled.</p>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={loadModel}
              disabled={state.stage === "checking"}
              className="disabled:opacity-50 disabled:cursor-not-allowed px-12 py-4 rounded-xl text-xl font-bold transition-all transform active:scale-95 duration-100 flex items-center gap-3"
              style={{ background: "var(--primary-container)", color: "var(--on-background)", boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)" }}
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              <Zap className="fill-current w-6 h-6" />
              {state.stage === "checking" ? "Checking..." : "Load Gemma 4"}
            </button>
          )}

          <div className="flex flex-col gap-2 items-center max-w-lg">
            <p className="italic" style={{ color: "var(--on-surface-variant)" }}>
              Powered by <span className="font-medium" style={{ color: "var(--secondary-fixed-dim)" }}>Transformers.js</span>. Local execution ensures 100% privacy.
            </p>
            <div className="flex items-center gap-3 mt-2">
              <span className="px-4 py-1.5 text-xs font-semibold rounded-full border" style={{ background: "rgba(0, 212, 255, 0.1)", color: "var(--primary-fixed-dim)", borderColor: "rgba(168, 232, 255, 0.2)" }}>WebGPU Required</span>
              <span className="px-4 py-1.5 text-xs font-semibold rounded-full border" style={{ background: "rgba(0, 212, 255, 0.1)", color: "var(--primary-fixed-dim)", borderColor: "rgba(168, 232, 255, 0.2)" }}>4GB+ RAM Recommended</span>
            </div>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-white/5 w-full flex justify-center">
          <div className="flex items-center gap-3 opacity-60">
            <ShieldCheck className="fill-current w-6 h-6" style={{ color: "var(--secondary)" }} />
            <span className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--on-surface-variant)" }}>End-to-End Local Privacy</span>
          </div>
        </div>
      </div>
    </motion.main>
  );
}
