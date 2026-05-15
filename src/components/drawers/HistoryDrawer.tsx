import { motion, AnimatePresence } from "motion/react";
import { X, Search, FileText, Image as ImageIcon, BarChart3, FileEdit, Trash2, ShieldAlert } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDrawer({ isOpen, onClose }: HistoryDrawerProps) {
  const historyItems = [
    { icon: FileText, label: "Document OCR", time: "2 min ago", status: "Success", color: "text-secondary-container" },
    { icon: ImageIcon, label: "Visual Synthesis", time: "15 min ago", status: "Success", color: "text-secondary-container" },
    { icon: BarChart3, label: "Data Clustering", time: "Now", status: "In Progress", color: "text-primary-container", active: true },
    { icon: FileEdit, label: "Audit Summary", time: "1h ago", status: "Success", color: "text-secondary-container" },
    { icon: ShieldAlert, label: "Batch Import", time: "2h ago", status: "Failed", color: "text-error" },
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
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[60]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[360px] z-[70] glass-panel flex flex-col shadow-2xl border-l border-white/10"
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-6 border-b border-white/10 shrink-0">
              <h2 className="text-xl font-bold text-on-background">Task History</h2>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors text-outline"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search */}
            <div className="p-6 shrink-0">
              <div className="relative group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-outline w-4 h-4 group-focus-within:text-primary transition-colors" />
                <input 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm text-on-background focus:ring-1 focus:ring-primary focus:border-primary placeholder:text-outline/50 outline-none transition-all" 
                  placeholder="Search tasks..." 
                  type="text" 
                />
              </div>
            </div>

            {/* History List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-2 py-2">
              {historyItems.map((item, idx) => (
                <div 
                  key={idx}
                  className={`glass-panel p-3 rounded-xl border-white/5 hover:border-primary/20 transition-all cursor-pointer group ${item.active ? 'bg-primary/5' : ''}`}
                >
                  <div className="flex gap-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center transition-transform group-hover:scale-110 ${item.status === 'Failed' ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <span className="text-sm font-bold text-on-surface">{item.label}</span>
                        <span className="text-[10px] text-outline font-medium">{item.time}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full ${item.status === 'In Progress' ? 'bg-primary-container animate-pulse' : (item.status === 'Failed' ? 'bg-error' : 'bg-secondary-container ai-pulse')}`}></div>
                        <span className={`text-[10px] font-bold ${item.color}`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-surface-container-lowest/20 backdrop-blur-sm">
              <button className="w-full py-3 bg-error-container/20 text-error font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-error-container/30 transition-all flex items-center justify-center gap-2 active:scale-[0.98]">
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
