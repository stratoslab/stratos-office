import { 
  Microscope, 
  Plus, 
  FileText, 
  Image as ImageIcon, 
  Mic, 
  FileEdit, 
  History, 
  Settings,
  Brain
} from "lucide-react";

interface SidebarProps {
  onOpenHistory: () => void;
  onOpenSettings: () => void;
}

export default function Sidebar({ onOpenHistory, onOpenSettings }: SidebarProps) {
  const menuItems = [
    { icon: FileText, label: "Documents", active: true },
    { icon: ImageIcon, label: "Visual" },
    { icon: Mic, label: "Audio" },
    { icon: FileEdit, label: "Text" },
    { icon: Brain, label: "Research" },
  ];

  return (
    <aside className="hidden md:flex flex-col h-full py-6 flex-shrink-0 z-20" style={{ background: "rgba(4, 32, 59, 0.4)", backdropFilter: "blur(24px)", borderRight: "1px solid rgba(255,255,255,0.1)", width: "256px" }}>
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "var(--primary-container)", boxShadow: "0 0 20px rgba(0, 212, 255, 0.2)" }}>
            <Microscope className="w-6 h-6 fill-current" style={{ color: "var(--on-primary-container)" }} />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--primary-container)" }}>Stratos Office</p>
            <p className="text-sm font-medium" style={{ color: "var(--on-surface-variant)" }}>Gemma 4 Active</p>
          </div>
        </div>
        <button className="w-full py-3 text-sm font-bold rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2" style={{ background: "var(--primary-container)", color: "var(--on-primary-container)" }}
          onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
          onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
        >
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className="flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out"
            style={item.active 
              ? { background: "rgba(0, 212, 255, 0.1)", color: "var(--primary-fixed-dim)", borderRight: "2px solid var(--primary-fixed-dim)" }
              : { color: "var(--on-surface-variant)" }
            }
            onMouseEnter={(e) => { if (!item.active) e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
            onMouseLeave={(e) => { if (!item.active) e.currentTarget.style.background = "transparent"; }}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto px-3 pt-6 space-y-1" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
        <button
          onClick={onOpenHistory}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out"
          style={{ color: "var(--on-surface-variant)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <History className="w-5 h-5" />
          <span className="text-sm font-semibold">History</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out"
          style={{ color: "var(--on-surface-variant)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings</span>
        </button>
      </div>
    </aside>
  );
}
