import { motion, AnimatePresence } from "motion/react";
import MaterialIcon from "../ui/MaterialIcon";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsDrawer({ isOpen, onClose }: SettingsDrawerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0, 20, 42, 0.6)", backdropFilter: "blur(4px)" }}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full z-[70] glass-panel flex flex-col shadow-2xl"
            style={{ maxWidth: "360px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
          >
            {/* Header */}
            <div
              className="h-16 px-6 flex items-center justify-between"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <div className="flex items-center gap-3" style={{ color: "var(--primary)" }}>
                <MaterialIcon name="settings" size={20} />
                <h2 className="text-xl font-bold">System Settings</h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ color: "var(--outline)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                aria-label="Close settings"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 space-y-10">

              {/* Model Settings */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="psychology" size={20} style={{ color: "var(--secondary)" }} />
                  <h3
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--outline)" }}
                  >
                    Model Settings
                  </h3>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                        Max tokens
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--primary-fixed-dim)" }}>
                        2,048
                      </span>
                    </div>
                    <input className="custom-slider" max="4096" min="256" type="range" defaultValue={2048} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                        Temperature
                      </span>
                      <span className="text-xs font-bold" style={{ color: "var(--primary-fixed-dim)" }}>
                        0.7
                      </span>
                    </div>
                    <input className="custom-slider" max="1" min="0" step="0.1" type="range" defaultValue={0.7} />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                      Thinking mode
                    </span>
                    <p className="text-[10px] font-medium tracking-wide" style={{ color: "var(--outline)" }}>
                      Enable detailed reasoning steps
                    </p>
                  </div>
                  <div
                    className="w-10 h-5 rounded-full relative cursor-pointer"
                    style={{ background: "var(--primary-container)" }}
                  >
                    <div className="absolute top-0.5 left-[22px] w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* Privacy */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="shield" size={20} style={{ color: "var(--secondary)" }} />
                  <h3
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--outline)" }}
                  >
                    Privacy
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                      Offline mode
                    </span>
                    <p className="text-[10px] font-medium tracking-wide" style={{ color: "var(--outline)" }}>
                      Process data locally when possible
                    </p>
                  </div>
                  <div
                    className="w-10 h-5 rounded-full relative cursor-pointer"
                    style={{ background: "var(--surface-variant)" }}
                  >
                    <div className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-all" />
                  </div>
                </div>
                <button
                  className="w-full py-2.5 flex items-center justify-between px-3 -mx-3 rounded-lg transition-colors group"
                  style={{ color: "var(--error)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(147, 0, 10, 0.1)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <span className="text-sm font-medium">Clear cache</span>
                  <MaterialIcon
                    name="delete_forever"
                    size={18}
                    className="group-hover:scale-110 transition-transform"
                  />
                </button>
              </section>

              <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* Display */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="palette" size={20} style={{ color: "var(--secondary)" }} />
                  <h3
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--outline)" }}
                  >
                    Display
                  </h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                    Dark mode
                  </span>
                  <div
                    className="flex p-1 rounded-full border"
                    style={{
                      background: "var(--surface-container-high)",
                      borderColor: "rgba(255,255,255,0.05)",
                    }}
                  >
                    <button
                      className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5"
                      style={{
                        background: "var(--primary-container)",
                        color: "var(--on-primary-container)",
                        boxShadow: "0 0 10px rgba(0, 212, 255, 0.3)",
                      }}
                    >
                      <MaterialIcon name="dark_mode" size={12} filled />
                      On
                    </button>
                    <button
                      className="px-3 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 transition-colors hover:text-white"
                      style={{ color: "var(--outline)" }}
                    >
                      <MaterialIcon name="light_mode" size={12} />
                      Off
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <span className="text-sm font-medium" style={{ color: "var(--on-surface)" }}>
                    Font size
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {["Small", "Normal", "Large"].map((size) => (
                      <button
                        key={size}
                        className="py-2 border rounded-xl text-[10px] font-bold transition-all"
                        style={
                          size === "Normal"
                            ? {
                                borderColor: "var(--primary)",
                                color: "var(--primary)",
                                background: "rgba(168, 232, 255, 0.05)",
                                boxShadow: "0 0 10px rgba(168, 232, 255, 0.1)",
                              }
                            : { borderColor: "rgba(255,255,255,0.1)", color: "var(--outline)" }
                        }
                        onMouseEnter={(e) => {
                          if (size !== "Normal") e.currentTarget.style.borderColor = "rgba(168, 232, 255, 0.4)";
                        }}
                        onMouseLeave={(e) => {
                          if (size !== "Normal") e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                        }}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              <div className="h-px w-full" style={{ background: "rgba(255,255,255,0.05)" }} />

              {/* About */}
              <section className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                  <MaterialIcon name="info" size={20} style={{ color: "var(--secondary)" }} />
                  <h3
                    className="text-[10px] font-bold uppercase tracking-[0.2em]"
                    style={{ color: "var(--outline)" }}
                  >
                    About
                  </h3>
                </div>
                <div
                  className="rounded-2xl p-4 space-y-3 border"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.05)",
                  }}
                >
                  <div className="flex justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--outline)" }}
                    >
                      System Version
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>
                      v4.2.0-stable
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--outline)" }}
                    >
                      Model Architecture
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>
                      Stratos-Gemma-4-8B
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider"
                      style={{ color: "var(--outline)" }}
                    >
                      Last Updated
                    </span>
                    <span className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>
                      Oct 24, 2024
                    </span>
                  </div>
                </div>
                <div className="flex justify-center gap-8 pt-2">
                  <a
                    className="text-[10px] font-bold hover:underline uppercase tracking-widest"
                    style={{ color: "var(--primary)" }}
                    href="#"
                  >
                    Release Notes
                  </a>
                  <a
                    className="text-[10px] font-bold hover:underline uppercase tracking-widest"
                    style={{ color: "var(--primary)" }}
                    href="#"
                  >
                    Support
                  </a>
                </div>
              </section>
            </div>

            {/* Save footer */}
            <div
              className="p-6"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0, 28, 55, 0.4)",
              }}
            >
              <button
                className="w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                style={{
                  background: "var(--primary-container)",
                  color: "var(--on-primary-container)",
                  boxShadow: "0 0 20px rgba(0, 212, 255, 0.3)",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
              >
                <MaterialIcon name="save" size={20} />
                Apply Changes
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
