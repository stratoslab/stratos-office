import { motion, AnimatePresence } from "motion/react";
import MaterialIcon from "../ui/MaterialIcon";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

type Category = "primary" | "secondary" | "tertiary" | "error";

const historyItems: {
  icon: string;
  label: string;
  time: string;
  status: string;
  category: Category;
  active?: boolean;
}[] = [
  { icon: "description", label: "Document OCR", time: "2 min ago", status: "Success", category: "primary" },
  { icon: "image", label: "Visual Synthesis", time: "15 min ago", status: "Success", category: "secondary" },
  { icon: "analytics", label: "Data Clustering", time: "Now", status: "In Progress", category: "primary", active: true },
  { icon: "edit_note", label: "Audit Summary", time: "1h ago", status: "Success", category: "tertiary" },
  { icon: "sync_problem", label: "Batch Import", time: "2h ago", status: "Failed", category: "error" },
];

const categoryStyles: Record<Category, { bg: string; color: string }> = {
  primary: { bg: "rgba(168, 232, 255, 0.1)", color: "var(--primary)" },
  secondary: { bg: "rgba(111, 255, 232, 0.1)", color: "var(--secondary)" },
  tertiary: { bg: "rgba(254, 181, 40, 0.1)", color: "var(--tertiary-container)" },
  error: { bg: "rgba(255, 180, 171, 0.1)", color: "var(--error)" },
};

const statusDotColor: Record<string, string> = {
  "In Progress": "var(--primary-container)",
  Failed: "var(--error)",
  Success: "var(--secondary-container)",
};

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
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
              className="h-16 flex items-center justify-between px-6 shrink-0"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}
            >
              <h2 className="text-xl font-bold" style={{ color: "var(--on-background)" }}>
                Task History
              </h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "var(--outline)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                aria-label="Close history"
              >
                <MaterialIcon name="close" size={20} />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 shrink-0">
              <div className="relative">
                <MaterialIcon
                  name="search"
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2"
                  style={{ color: "var(--outline)" }}
                />
                <input
                  className="w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all"
                  style={{
                    background: "rgba(255,255,255,0.05)",
                    borderColor: "rgba(255,255,255,0.1)",
                    color: "var(--on-background)",
                  }}
                  placeholder="Search tasks..."
                  type="text"
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2">
              {historyItems.map((item, idx) => {
                const { bg, color } = categoryStyles[item.category];
                return (
                  <div
                    key={idx}
                    className="glass-panel p-3 rounded-xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                    style={item.active ? { background: "rgba(168, 232, 255, 0.05)" } : {}}
                  >
                    <div className="flex gap-4">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 shrink-0"
                        style={{ background: bg, color }}
                      >
                        <MaterialIcon name={item.icon} size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <span className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>
                            {item.label}
                          </span>
                          <span className="text-[10px] font-medium ml-2 shrink-0" style={{ color: "var(--outline)" }}>
                            {item.time}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          <div
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusDotColor[item.status] ?? "var(--outline)" }}
                          />
                          <span className="text-[10px] font-bold" style={{ color }}>
                            {item.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div
              className="p-6"
              style={{
                borderTop: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(0, 15, 33, 0.2)",
              }}
            >
              <button
                className="w-full py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: "rgba(147, 0, 10, 0.2)", color: "var(--error)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(147, 0, 10, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(147, 0, 10, 0.2)")}
              >
                <MaterialIcon name="delete_sweep" size={18} />
                Clear All History
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
