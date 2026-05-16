import { motion } from "motion/react";
import { useModel } from "../../context/ModelContext";
import MaterialIcon from "../ui/MaterialIcon";

export default function LoadingPage() {
  const { state, loadModel, resumeDownload, clearError } = useModel();

  const rounded = Math.round(state.progress);
  const isDownloadError = state.downloadError !== null;

  if (state.stage === "error") {
    return (
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="w-full h-full flex flex-col justify-center items-center overflow-hidden p-4"
      >
        <div className="w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-10">
            <div
              className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
              style={{
                background: isDownloadError ? "var(--warning-container)" : "var(--error-container)",
                boxShadow: isDownloadError ? "0 0 20px rgba(255, 212, 130, 0.4)" : "0 0 20px rgba(255, 180, 171, 0.4)",
              }}
            >
              <MaterialIcon
                name={isDownloadError ? "wifi_off" : "warning"}
                size={24}
                style={{ color: isDownloadError ? "var(--on-warning-container)" : "var(--on-error-container)" }}
              />
            </div>
            <span className="text-lg md:text-2xl font-bold tracking-tight" style={{ color: isDownloadError ? "var(--warning)" : "var(--error)" }}>
              {isDownloadError ? "Download Interrupted" : "Loading Failed"}
            </span>
          </div>

          <div className="glass-panel w-full rounded-2xl p-6 md:p-10 flex flex-col items-center">
            {isDownloadError ? (
              <>
                <p className="text-center mb-2" style={{ color: "var(--on-surface-variant)" }}>
                  {state.downloadError.message}
                </p>
                {state.downloadError.cachedPercent > 0 && (
                  <p className="text-center mb-6 text-sm" style={{ color: "var(--primary-fixed-dim)" }}>
                    {state.downloadError.cachedPercent}% already cached — resuming will continue from where it left off.
                  </p>
                )}
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={resumeDownload}
                    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    style={{ background: "var(--primary-container)", color: "var(--on-primary-container)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    <MaterialIcon name="download" size={18} />
                    Resume Download
                  </button>
                  <button
                    onClick={() => { clearError(); loadModel(); }}
                    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    style={{ background: "var(--surface-container-highest)", color: "var(--on-surface)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    <MaterialIcon name="refresh" size={18} />
                    Start Over
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-center mb-6" style={{ color: "var(--on-surface-variant)" }}>
                  {state.error || "An unknown error occurred."}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => {
                      clearError();
                      loadModel();
                    }}
                    className="px-6 py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 min-h-[44px]"
                    style={{ background: "var(--primary-container)", color: "var(--on-primary-container)" }}
                    onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                    onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
                  >
                    <MaterialIcon name="refresh" size={18} />
                    Retry
                  </button>
                </div>
              </>
            )}
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
      className="w-full h-full flex flex-col justify-center items-center overflow-hidden p-4"
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
        <div className="flex items-center gap-2 md:gap-3 mb-6 md:mb-10">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center p-2"
            style={{
              background: "var(--primary-container)",
              boxShadow: "0 0 20px rgba(0, 212, 255, 0.4)",
            }}
          >
            <img src="/stratos-logo-white.png" alt="Stratos Office" className="w-full h-full object-contain" />
          </div>
          <span className="text-lg md:text-2xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
            Stratos Office
          </span>
        </div>

        {/* Loading card */}
        <div className="glass-panel w-full rounded-2xl p-6 md:p-10 flex flex-col items-center">
          <h1 className="text-lg md:text-2xl font-bold mb-4 md:mb-8 text-center" style={{ color: "var(--on-surface)" }}>
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
            {state.downloadRetry?.active ? (
              <div className="flex items-center justify-center gap-2" style={{ color: "var(--warning)" }}>
                <MaterialIcon name="wifi_find" size={16} />
                <span className="text-sm">
                  Connection lost — retrying ({state.downloadRetry.attempt}/{state.downloadRetry.maxRetries}) in {state.downloadRetry.delay}s…
                </span>
              </div>
            ) : (
              <>
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
              </>
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
