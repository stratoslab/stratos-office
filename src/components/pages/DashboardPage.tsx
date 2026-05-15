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
      className="flex-1 overflow-y-auto p-6 md:p-10 bg-background relative pb-28"
    >
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 blur-[120px] rounded-full -z-10 pointer-events-none"></div>

      <header className="mb-10">
        <h1 className="text-3xl font-bold text-on-surface mb-1">Welcome back, Strategist</h1>
        <p className="text-on-surface-variant">Your AI workspace is primed and ready for new insights.</p>
      </header>

      {/* Quick Start Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card 1 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <Scan className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Document OCR</h3>
          <p className="text-sm text-outline mb-6">Extract structured data from scanned PDFs and images with 99.9% accuracy.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">v2.4 Engine</span>
            <span className="px-3 py-1 rounded-full bg-surface-variant/50 text-outline text-[10px] font-bold">High Priority</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <Receipt className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Receipt Parser</h3>
          <p className="text-sm text-outline mb-6">Automatically categorize expenses and export directly to financial ledgers.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">Financial AI</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <FileAudio className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Meeting Transcription</h3>
          <p className="text-sm text-outline mb-6">Real-time speaker identification and action item summary generation.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">Live Sync</span>
            <span className="px-3 py-1 rounded-full bg-surface-variant/50 text-outline text-[10px] font-bold">Multilingual</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <Mail className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Email Draft</h3>
          <p className="text-sm text-outline mb-6">Context-aware drafting based on your unique communication style and history.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">NLP Core</span>
          </div>
        </div>

        {/* Card 5 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <BarChart3 className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Chart Extract</h3>
          <p className="text-sm text-outline mb-6">Transform images of charts and graphs into raw CSV or Excel datasets.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">Vision Pro</span>
          </div>
        </div>

        {/* Card 6 */}
        <div className="glass-panel rounded-2xl p-6 group cursor-pointer hover:border-primary-container/50 transition-all duration-300 relative overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <div className="w-12 h-12 rounded-xl bg-surface-container-highest flex items-center justify-center text-primary-fixed-dim">
              <SearchCheck className="w-6 h-6" />
            </div>
            <ArrowUpRight className="text-outline opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-on-surface mb-1">Web Research</h3>
          <p className="text-sm text-outline mb-6">Deep-dive internet analysis with source verification and citation mapping.</p>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-secondary-container/10 text-secondary text-[10px] font-bold">Deep Web</span>
            <span className="px-3 py-1 rounded-full bg-surface-variant/50 text-outline text-[10px] font-bold">Academic</span>
          </div>
        </div>
      </div>

      {/* Dashboard Insight Section */}
      <section className="mt-12">
        <div className="glass-panel rounded-3xl overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-1/2 p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-2.5 h-2.5 rounded-full bg-secondary ai-pulse"></div>
                <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">AI Intelligence Digest</span>
              </div>
              <h2 className="text-3xl font-bold text-on-surface mb-4">Current Analysis: Enterprise Logistics</h2>
              <p className="text-on-surface-variant mb-8 leading-relaxed">
                Stratos is currently processing 1,204 pending documents from your connected cloud storage. Predicted completion time is approximately 4 minutes.
              </p>
              <div className="flex flex-wrap gap-10">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Queue Depth</span>
                  <span className="text-2xl font-bold text-primary">1.2k</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Compute Usage</span>
                  <span className="text-2xl font-bold text-secondary">42%</span>
                </div>
                <div className="w-px h-10 bg-white/10"></div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Threat Level</span>
                  <span className="text-2xl font-bold text-on-surface">None</span>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 min-h-[300px] relative bg-surface-container-highest overflow-hidden">
              <img 
                alt="Data visualization" 
                className="w-full h-full object-cover mix-blend-screen opacity-40 group-hover:scale-110 transition-transform duration-[20s]"
                src="https://images.unsplash.com/photo-1639322537228-f710d846310a?auto=format&fit=crop&q=80&w=1000" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-surface-container-highest to-transparent"></div>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}
