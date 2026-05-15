import { useState } from "react";
import { AnimatePresence } from "motion/react";
import LandingPage from "./components/pages/LandingPage";
import LoadingPage from "./components/pages/LoadingPage";
import DashboardPage from "./components/pages/DashboardPage";
import Sidebar from "./components/layout/Sidebar";
import TopBar from "./components/layout/TopBar";
import HistoryDrawer from "./components/drawers/HistoryDrawer";
import SettingsDrawer from "./components/drawers/SettingsDrawer";
import { Gauge } from "lucide-react";

type AppStage = "landing" | "loading" | "dashboard";

export default function App() {
  const [stage, setStage] = useState<AppStage>("landing");
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen bg-background text-on-background relative overflow-hidden selection:bg-primary-container selection:text-on-primary-container">
      {/* Dynamic Header */}
      {stage !== "loading" && <TopBar />}

      <div className="flex flex-1 pt-16 h-screen overflow-hidden">
        {/* Dynamic Sidebar */}
        {stage === "dashboard" && (
          <Sidebar 
            onOpenHistory={() => setIsHistoryOpen(true)} 
            onOpenSettings={() => setIsSettingsOpen(true)} 
          />
        )}

        {/* Main Content Area */}
        <AnimatePresence mode="wait">
          {stage === "landing" && (
            <LandingPage key="landing" onLoad={() => setStage("loading")} />
          )}
          {stage === "loading" && (
            <LoadingPage key="loading" onComplete={() => setStage("dashboard")} />
          )}
          {stage === "dashboard" && (
            <DashboardPage key="dashboard" />
          )}
        </AnimatePresence>
      </div>

      {/* Dynamic Footer */}
      {stage === "landing" && (
        <footer className="bg-surface-container-lowest/20 backdrop-blur-sm text-outline border-t border-white/5 flex justify-between items-center px-8 py-3 relative z-20">
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-primary">Stratos Office</span>
            <span className="text-xs text-outline/60">© 2024 Stratos Office. Private & Secure AI.</span>
          </div>
          <div className="flex items-center gap-6">
            <a className="text-xs text-outline/80 hover:text-primary transition-colors" href="#">Privacy</a>
            <a className="text-xs text-outline/80 hover:text-primary transition-colors" href="#">Terms</a>
            <a className="text-xs text-outline/80 hover:text-primary transition-colors" href="#">API Status</a>
          </div>
        </footer>
      )}

      {stage === "dashboard" && (
        <footer className="fixed bottom-0 z-50 flex justify-between items-center w-full px-8 h-10 bg-surface-container-lowest/20 backdrop-blur-sm border-t border-white/5">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_#00e5cc]"></div>
              <span className="text-[10px] font-bold text-on-surface uppercase tracking-wider">Gemma 4 Ready</span>
            </div>
            <div className="flex items-center gap-3 border-l border-white/10 pl-6">
              <Gauge className="w-3.5 h-3.5 text-outline" />
              <span className="text-[10px] font-bold text-outline uppercase tracking-wider">
                Token speed: <span className="text-primary-fixed-dim">124 t/s</span>
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
              <span className="text-[10px] text-primary font-bold tracking-widest">v4.0.2-pro</span>
            </div>
          </div>
        </footer>
      )}

      {/* Drawers */}
      <HistoryDrawer 
        isOpen={isHistoryOpen} 
        onClose={() => setIsHistoryOpen(false)} 
      />
      <SettingsDrawer 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </div>
  );
}
