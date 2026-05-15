import { motion } from "motion/react";
import { useModel } from "../../context/ModelContext";
import MaterialIcon from "../ui/MaterialIcon";

export default function LoadingPage() {
  const { state, loadModel, clearError } = useModel();

  const rounded = Math.round(state.progress);

  if (state.stage === "error") {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="min-h-screen flex flex-col justify-center items-center overflow-hidden p-4"
      >
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center gap-3 mb-10">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: "var(--error-container)",
                boxShadow: "0 0 20px rgba(255, 180, 171, 0.4)",
              }}
            >
              <MaterialIcon name="warning" size={32} style={{ color: "var(--on-error-container)" }} />
            </div>
            <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--error)" }}>
              Loading Failed
            </span>
          </div>

          <div className="glass-panel w-full rounded-2xl p-10 flex flex-col items-center">
            <p className="text-center mb-6" style={{ color: "var(--on-surface-variant)" }}>
              {state.error || "An unknown error occurred."}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => {
                  clearError();
                  loadModel();
                }}
                className="px-8 py-3 rounded-xl font-bold transition-all flex items-center gap-2"
                style={{ background: "var(--primary-container)", color: "var(--on-primary-container)" }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                <MaterialIcon name="refresh" size={18} />
                Retry
              </button>
            </div>
          </div>
        </div>
      </motion.main>
    );
  }

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="min-h-screen flex flex-col justify-center items-center overflow-hidden p-4"
    >
      {/* Background blobs */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: "rgba(0, 212, 255, 0.1)", filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full"
          style={{ background: "rgba(0, 229, 204, 0.05)", filter: "blur(150px)" }}
        />
      </div>

      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Brand header */}
        <div className="flex items-center gap-3 mb-10">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center p-2"
            style={{
              background: "var(--primary-container)",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
            }}
          >
            <img src="/stratos-logo-white.png" alt="Stratos Office" className="w-full h-full object-contain" />
          </div>
          <span className="text-2xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
            Stratos Office
          </span>
        </div>

        {/* Loading card */}
        <div className="glass-panel w-full rounded-2xl p-10 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-8 text-center" style={{ color: "var(--on-surface)" }}>
            Preparing Stratos Office
          </h1>

          {/* Progress bar */}
          <div className="w-full mb-8">
            <div className="flex justify-between items-end mb-2">
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.05em]"
                style={{ color: "var(--primary-fixed-dim)" }}
              >
                {state.currentFile ? "Downloading" : "System Initialization"}
              </span>
              <span className="text-2xl font-semibold" style={{ color: "var(--primary-fixed-dim)" }}>
                {rounded}%
              </span>
            </div>
            <div
              className="w-full h-2 rounded-full overflow-hidden relative"
              style={{ background: "var(--surface-container-highest)" }}
            >
              <motion.div
                className="absolute top-0 left-0 h-full rounded-full"
                style={{
                  width: `${rounded}%`,
                  background: "var(--primary-container)",
                  boxShadow: "0 0 15px rgba(0, 212, 255, 0.5)",
                }}
              />
              <div className="absolute top-0 left-0 h-full w-full shimmer opacity-50" />
            </div>
          </div>

          {/* Status text */}
          <div className="text-center space-y-2">
            <p style={{ color: "var(--on-surface-variant)" }}>
              {state.currentFile || "Downloading model files… This happens once and is cached."}
            </p>
            {state.estimatedTimeRemaining && (
              <div
                className="flex items-center justify-center gap-2"
                style={{ color: "var(--outline)" }}
              >
                <MaterialIcon name="schedule" size={16} />
                <span className="text-[10px] font-bold uppercase tracking-wider">
                  Estimated time remaining: {state.estimatedTimeRemaining}
                </span>
              </div>
            )}
          </div>

          {/* Pulse dots */}
          <div className="mt-10 flex items-center gap-1.5">
            <div
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: "var(--secondary-container)" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse delay-75"
              style={{ background: "rgba(0, 229, 204, 0.6)" }}
            />
            <div
              className="w-2 h-2 rounded-full animate-pulse delay-150"
              style={{ background: "rgba(0, 229, 204, 0.3)" }}
            />
            <span
              className="text-[10px] font-bold ml-2 uppercase tracking-tighter"
              style={{ color: "var(--secondary)" }}
            >
              {state.stage === "downloading" ? "Downloading Model Files" : "Loading Gemma 4"}
            </span>
          </div>
        </div>

        {/* Footer badge */}
        <div className="mt-12 flex flex-col items-center opacity-60">
          <div className="flex items-center gap-2 mb-1">
            <MaterialIcon name="verified_user" size={16} style={{ color: "var(--outline)" }} />
            <span className="text-[10px] font-medium tracking-wide" style={{ color: "var(--outline)" }}>
              End-to-End Encrypted Environment
            </span>
          </div>
          <p className="text-[10px]" style={{ color: "var(--outline)" }}>
            © 2024 Stratos Office. Private &amp; Secure AI.
          </p>
        </div>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-10 right-10 opacity-20 hidden md:block">
        <div
          className="w-32 h-32 border-t-2 border-r-2 rounded-tr-3xl"
          style={{ borderColor: "var(--primary-container)" }}
        />
      </div>
      <div className="absolute bottom-10 left-10 opacity-20 hidden md:block">
        <div
          className="w-32 h-32 border-b-2 border-l-2 rounded-bl-3xl"
          style={{ borderColor: "var(--primary-container)" }}
        />
      </div>
    </motion.main>
  );
}
