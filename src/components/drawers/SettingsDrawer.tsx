import { motion, AnimatePresence } from "motion/react";
import { X, Settings, BrainCircuit, Shield, Palette, Info, Save, Moon, Sun, Trash2 } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[360px] z-[70] glass-panel flex flex-col shadow-2xl border-l border-white/10"
          >
            {/* Panel Header */}
            <div className="h-16 px-6 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <Settings className="w-5 h-5" />
                <h2 className="text-xl font-bold">System Settings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-outline"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">
              {/* Section: Model Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <BrainCircuit className="text-secondary w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase text-outline tracking-[0.2em]">Model Settings</h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-on-surface">Max tokens</span>
                      <span className="text-xs font-bold text-primary-fixed-dim">2,048</span>
                    </div>
                    <input className="custom-slider" max="4096" min="256" type="range" defaultValue={2048}/>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium text-on-surface">Temperature</span>
                      <span className="text-xs font-bold text-primary-fixed-dim">0.7</span>
                    </div>
                    <input className="custom-slider" max="1" min="0" step="0.1" type="range" defaultValue={0.7}/>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-on-surface">Thinking mode</span>
                    <p className="text-[10px] text-outline font-medium tracking-wide">Enable detailed reasoning steps</p>
                  </div>
                  <div className="w-10 h-5 bg-primary-container rounded-full relative cursor-pointer">
                    <div className="absolute top-0.5 left-[22px] w-4 h-4 bg-white rounded-full transition-all"></div>
                  </div>
                </div>
              </section>

              <div className="h-px bg-white/5 w-full"></div>

              {/* Section: Privacy */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Shield className="text-secondary w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase text-outline tracking-[0.2em]">Privacy</h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium text-on-surface">Offline mode</span>
                    <p className="text-[10px] text-outline font-medium tracking-wide">Process data locally when possible</p>
                  </div>
                  <div className="w-10 h-5 bg-surface-variant rounded-full relative cursor-pointer">
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all"></div>
                  </div>
                </div>
                <button className="w-full py-2.5 flex items-center justify-between text-error hover:bg-error-container/10 px-3 -mx-3 rounded-lg transition-colors group">
                  <span className="text-sm font-medium">Clear cache</span>
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </button>
              </section>

              <div className="h-px bg-white/5 w-full"></div>

              {/* Section: Display */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Palette className="text-secondary w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase text-outline tracking-[0.2em]">Display</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-on-surface">Dark mode</span>
                  <div className="flex bg-surface-container-high p-1 rounded-full border border-white/5">
                    <button className="px-3 py-1 rounded-full bg-primary-container text-on-primary-container text-[10px] font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(0,212,255,0.3)]">
                      <Moon className="w-3 h-3 fill-current" />
                      On
                    </button>
                    <button className="px-3 py-1 rounded-full text-outline text-[10px] font-bold flex items-center gap-1.5 transition-colors hover:text-white">
                      <Sun className="w-3 h-3" />
                      Off
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-sm font-medium text-on-surface">Font size</span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Small", "Normal", "Large"].map((size) => (
                      <button 
                        key={size}
                        className={`py-2 border rounded-xl text-[10px] font-bold transition-all ${
                          size === "Normal" 
                            ? "border-primary text-primary bg-primary/5 shadow-[0_0_10px_rgba(168,232,255,0.1)]" 
                            : "border-white/10 text-outline hover:border-primary/40"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="h-px bg-white/5 w-full"></div>

              {/* Section: About */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <Info className="text-secondary w-5 h-5" />
                  <h3 className="text-[10px] font-bold uppercase text-outline tracking-[0.2em]">About</h3>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 space-y-3 border border-white/5">
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">System Version</span>
                    <span className="text-xs font-bold text-on-surface">v4.2.0-stable</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Model Architecture</span>
                    <span className="text-xs font-bold text-on-surface">Stratos-Gemma-4-8B</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-wider">Last Updated</span>
                    <span className="text-xs font-bold text-on-surface">Oct 24, 2024</span>
                  </div>
                </div>
                <div className="flex justify-center gap-8 pt-2">
                  <a className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest" href="#">Release Notes</a>
                  <a className="text-[10px] font-bold text-primary hover:underline uppercase tracking-widest" href="#">Support</a>
                </div>
              </section>
            </div>

            {/* Panel Footer Action */}
            <div className="p-6 border-t border-white/10 bg-surface-container-low/40">
              <button className="w-full bg-primary-container text-on-primary-container py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.98] transition-all shadow-[0_0_20px_rgba(0,212,255,0.3)]">
                <Save className="w-5 h-5" />
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
