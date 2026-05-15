import { useEffect } from "react";
import { AnimatePresence } from "motion/react";
import { ModelProvider, useModel } from "./context/ModelContext";
import LandingPage from "./components/pages/LandingPage";
import LoadingPage from "./components/pages/LoadingPage";
import DashboardPage from "./components/pages/DashboardPage";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import HistoryDrawer from "./components/drawers/HistoryDrawer";
import SettingsDrawer from "./components/drawers/SettingsDrawer";
import { Gauge } from "lucide-react";

function AppContent() {
  const { state, checkWebGPU } = useModel();

  useEffect(() => {
    checkWebGPU();
  }, [checkWebGPU]);

  const isDashboard = state.stage === "ready";

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {isDashboard && <TopBar />}

      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
        {isDashboard && (
          <Sidebar
            onOpenHistory={() => {}}
            onOpenSettings={() => {}}
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

      {state.stage === "idle" && (
        <footer className="bg-surface-container-lowest/20 backdrop-blur-sm text-outline border-t border-white/5 flex justify-between items-center px-8 py-3 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">Stratos Office</span>
            <span className="text-xs text-outline/60">© 2024 Stratos Office. Private & Secure AI.</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="text-xs text-outline/80 hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="text-xs text-outline/80 hover:text-primary transition-colors" href="#">Terms</a>
          </div>
        </footer>
      )}

      {isDashboard && (
        <footer className="fixed bottom-0 z-50 flex justify-between items-center w-full px-8 h-10 bg-surface-container-lowest/20 backdrop-blur-sm border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#00e5cc]"></div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Gemma 4 Ready</span>
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <Gauge className="w-3.5 h-3.5 text-outline" />
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                Token speed: <span className="text-primary-fixed-dim">{state.tps ? `${state.tps.toFixed(1)} t/s` : "—"}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <div className="hidden sm:flex items-center gap-6">
              <a className="text-[10px] font-bold text-outline hover:text-primary transition-colors uppercase tracking-widest" href="#">Privacy</a>
              <a className="text-[10px] font-bold text-outline hover:text-primary transition-colors uppercase tracking-widest" href="#">Terms</a>
            </div>
            <div className="flex items-center gap-2 border-l border-white/10 pl-6">
              <span className="text-[10px] text-outline uppercase font-bold tracking-widest opacity-60">Version:</span>
              <span className="text-[10px] text-primary font-bold tracking-widest">v0.1.0</span>
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
      <AppContent />
    </ModelProvider>
  );
}
