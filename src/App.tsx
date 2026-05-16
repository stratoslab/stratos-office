import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { ModelProvider, useModel } from "./context/ModelContext";
import { TaskProvider } from "./context/TaskContext";
import LandingPage from "./components/pages/LandingPage";
import LoadingPage from "./components/pages/LoadingPage";
import DashboardPage from "./components/pages/DashboardPage";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import HistoryDrawer from "./components/drawers/HistoryDrawer";
import SettingsDrawer from "./components/drawers/SettingsDrawer";
import MaterialIcon from "./components/ui/MaterialIcon";

function AppContent() {
  const { state } = useModel();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const isDashboard = state.stage === "ready";

  return (
    <div
      className="flex flex-col min-h-screen relative overflow-hidden"
      style={{ background: "var(--background)", color: "var(--on-background)" }}
    >
      {isDashboard && (
        <TopBar
          onOpenSettings={() => setSettingsOpen(true)}
        />
      )}

      <div className={`flex flex-1 overflow-hidden ${isDashboard ? "pt-16" : ""}`}>
        {isDashboard && (
          <Sidebar
            onOpenHistory={() => setHistoryOpen(true)}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        )}

        <AnimatePresence mode="wait">
          {(state.stage === "idle" || state.stage === "checking" || state.stage === "unsupported") && (
            <LandingPage key="landing" />
          )}
          {(state.stage === "downloading" || state.stage === "loading") && (
            <LoadingPage key="loading" />
          )}
          {state.stage === "ready" && (
            <DashboardPage key="dashboard" />
          )}
          {state.stage === "error" && (
            <LoadingPage key="error" />
          )}
        </AnimatePresence>
      </div>

      {/* Drawers */}
      <HistoryDrawer isOpen={historyOpen} onClose={() => setHistoryOpen(false)} />
      <SettingsDrawer isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />

      {/* Landing footer */}
      {state.stage === "idle" && (
        <footer
          className="border-t flex justify-between items-center px-8 py-3 relative z-20"
          style={{
            background: "rgba(0, 15, 33, 0.2)",
            backdropFilter: "blur(8px)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-3">
            <img src="/stratos-logo-white.png" alt="Stratos Office" className="h-5 w-auto opacity-80" />
            <span className="text-xs" style={{ color: "rgba(133, 147, 152, 0.6)" }}>
              © 2024 Stratos Office. Private &amp; Secure AI.
            </span>
          </div>
          <div className="flex items-center gap-6">
            <a className="text-xs hover:underline transition-colors" style={{ color: "rgba(133, 147, 152, 0.8)" }} href="#">Privacy</a>
            <a className="text-xs hover:underline transition-colors" style={{ color: "rgba(133, 147, 152, 0.8)" }} href="#">Terms</a>
            <a className="text-xs hover:underline transition-colors" style={{ color: "rgba(133, 147, 152, 0.8)" }} href="#">API Status</a>
          </div>
        </footer>
      )}

      {/* Dashboard footer */}
      {isDashboard && (
        <footer
          className="fixed bottom-0 z-50 flex justify-between items-center w-full px-8 h-10 border-t"
          style={{
            background: "rgba(0, 15, 33, 0.2)",
            backdropFilter: "blur(8px)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div
                className="w-2 h-2 rounded-full"
                style={{ background: "var(--secondary)", boxShadow: "0 0 8px #00e5cc" }}
              />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--on-surface)" }}>
                Gemma 4 Ready
              </span>
            </div>
            <div
              className="flex items-center gap-3 border-l pl-6"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <MaterialIcon name="speed" size={14} style={{ color: "var(--outline)" }} />
              <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--outline)" }}>
                Token speed:{" "}
                <span style={{ color: "var(--primary-fixed-dim)" }}>
                  {state.tps ? `${state.tps.toFixed(1)} t/s` : "—"}
                </span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center gap-6">
              <a className="text-[10px] font-bold hover:underline uppercase tracking-widest" style={{ color: "var(--outline)" }} href="#">Privacy</a>
              <a className="text-[10px] font-bold hover:underline uppercase tracking-widest" style={{ color: "var(--outline)" }} href="#">Terms</a>
              <a className="text-[10px] font-bold hover:underline uppercase tracking-widest" style={{ color: "var(--outline)" }} href="#">API Status</a>
            </div>
            <div
              className="flex items-center gap-2 border-l pl-6"
              style={{ borderColor: "rgba(255,255,255,0.1)" }}
            >
              <span className="text-[10px] uppercase font-bold tracking-widest opacity-60" style={{ color: "var(--outline)" }}>
                Version:
              </span>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "var(--primary)" }}>
                v0.1.0
              </span>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ModelProvider>
      <TaskProvider>
        <AppContent />
      </TaskProvider>
    </ModelProvider>
  );
}
