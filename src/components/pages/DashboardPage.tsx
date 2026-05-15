import { motion } from "motion/react";
import { 
  Scan, 
  Receipt, 
  FileAudio, 
  Mail, 
  BarChart3, 
  SearchCheck, 
  ArrowUpRight,
  Zap,
  MoreHorizontal
} from "lucide-react";

export default function DashboardPage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-6 md:p-10 relative pb-28"
      style={{ background: "var(--background)" }}
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -z-10 pointer-events-none" style={{ background: "rgba(168, 232, 255, 0.05)", filter: "blur(120px)" }}></div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Welcome back, Strategist</h1>
        <p style={{ color: "var(--on-surface-variant)" }}>Your AI workspace is primed and ready for new insights.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <Scan className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Document OCR</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Extract structured data from scanned PDFs and images with 99.9% accuracy.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>v2.4 Engine</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(30, 54, 82, 0.5)", color: "var(--outline)" }}>High Priority</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <Receipt className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Receipt Parser</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Automatically categorize expenses and export directly to financial ledgers.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>Financial AI</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <FileAudio className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Meeting Transcription</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Real-time speaker identification and action item summary generation.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>Live Sync</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(30, 54, 82, 0.5)", color: "var(--outline)" }}>Multilingual</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <Mail className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Email Draft</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Context-aware drafting based on your unique communication style and history.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>NLP Core</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <BarChart3 className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Chart Extract</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Transform images of charts and graphs into raw CSV or Excel datasets.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>Vision Pro</span>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = "rgba(0, 212, 255, 0.5)")}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)")}
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: "var(--surface-container-highest)", color: "var(--primary-fixed-dim)" }}>
              <SearchCheck className="w-6 h-6" />
            </div>
            <ArrowUpRight className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" style={{ color: "var(--outline)" }} />
          </div>
          <h3 className="text-xl font-bold mb-1" style={{ color: "var(--on-surface)" }}>Web Research</h3>
          <p className="text-sm mb-6" style={{ color: "var(--outline)" }}>Deep-dive internet analysis with source verification and citation mapping.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(0, 229, 204, 0.1)", color: "var(--secondary)" }}>Deep Web</span>
            <span className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: "rgba(30, 54, 82, 0.5)", color: "var(--outline)" }}>Academic</span>
          </div>
        </div>
      </div>

      <section className="mt-12">
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full ai-pulse" style={{ background: "var(--secondary)" }}></div>
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "var(--secondary)" }}>AI Intelligence Digest</span>
              </div>
              <h2 className="text-3xl font-bold mb-4" style={{ color: "var(--on-surface)" }}>Current Analysis: Enterprise Logistics</h2>
              <p className="mb-8 leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                Stratos is currently processing 1,204 pending documents from your connected cloud storage. Predicted completion time is approximately 4 minutes.
              </p>
              <div className="flex flex-wrap gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--outline)" }}>Queue Depth</span>
                  <span className="text-2xl font-bold" style={{ color: "var(--primary)" }}>1.2k</span>
                </div>
                <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.1)" }}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--outline)" }}>Compute Usage</span>
                  <span className="text-2xl font-bold" style={{ color: "var(--secondary)" }}>42%</span>
                </div>
                <div className="w-px h-10" style={{ background: "rgba(255,255,255,0.1)" }}></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: "var(--outline)" }}>Threat Level</span>
                  <span className="text-2xl font-bold" style={{ color: "var(--on-surface)" }}>None</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 min-h-[300px] relative overflow-hidden" style={{ background: "var(--surface-container-highest)" }}>
              <img 
                alt="Data visualization" 
                className="w-full h-full object-cover opacity-40"
                style={{ mixBlendMode: "screen" }}
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000" 
              />
              <div className="absolute inset-0" style={{ background: "linear-gradient(to right, var(--surface-container-highest), transparent)" }}></div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
