import { motion, AnimatePresence } from "motion/react";
import { X, Search, FileText, Image as ImageIcon, BarChart3, FileEdit, Trash2, ShieldAlert } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const historyItems = [
    { icon: FileText, label: "Document OCR", time: "2 min ago", status: "Success", color: "var(--secondary-container)" },
    { icon: ImageIcon, label: "Visual Synthesis", time: "15 min ago", status: "Success", color: "var(--secondary-container)" },
    { icon: BarChart3, label: "Data Clustering", time: "Now", status: "In Progress", color: "var(--primary-container)", active: true },
    { icon: FileEdit, label: "Audit Summary", time: "1h ago", status: "Success", color: "var(--secondary-container)" },
    { icon: ShieldAlert, label: "Batch Import", time: "2h ago", status: "Failed", color: "var(--error)" },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: "rgba(0, 20, 42, 0.6)", backdropFilter: "blur(4px)" }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full z-[70] glass-panel flex flex-col shadow-2xl"
            style={{ maxWidth: "360px", borderLeft: "1px solid rgba(255,255,255,0.1)" }}
          >
            <div className="h-16 flex items-center justify-between px-6 shrink-0" style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <h2 className="text-xl font-bold" style={{ color: "var(--on-background)" }}>Task History</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors"
                style={{ color: "var(--outline)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.1)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 shrink-0">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors" style={{ color: "var(--outline)" }} />
                <input 
                  className="w-full border rounded-xl py-2.5 pl-10 pr-4 text-sm outline-none transition-all" 
                  style={{ background: "rgba(255,255,255,0.05)", borderColor: "rgba(255,255,255,0.1)", color: "var(--on-background)" }}
                  placeholder="Search tasks..." 
                  type="text" 
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2">
              {historyItems.map((item, idx) => (
                <div 
                  key={idx}
                  className="glass-panel p-3 rounded-xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group"
                  style={item.active ? { background: "rgba(168, 232, 255, 0.05)" } : {}}
                >
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110"
                      style={item.status === 'Failed' ? { background: "rgba(255, 180, 171, 0.1)", color: "var(--error)" } : { background: "rgba(168, 232, 255, 0.1)", color: "var(--primary)" }}
                    >
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>{item.label}</span>
                        <span className="text-[10px] font-medium" style={{ color: "var(--outline)" }}>{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full"
                          style={item.status === 'In Progress' ? { background: "var(--primary-container)" } : (item.status === 'Failed' ? { background: "var(--error)" } : { background: "var(--secondary-container)" })}
                        ></div>
                        <span className="text-[10px] font-bold" style={{ color: item.color }}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-surface-container-lowest/20 backdrop-blur-sm" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", background: "rgba(0, 15, 33, 0.2)" }}>
              <button className="w-full py-3 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                style={{ background: "rgba(147, 0, 10, 0.2)", color: "var(--error)" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(147, 0, 10, 0.3)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "rgba(147, 0, 10, 0.2)")}
              >
                <Trash2 className="w-4 h-4" />
                Clear All History
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
