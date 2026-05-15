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
    <aside className="hidden md:flex flex-col h-full py-6 bg-surface-container/40 backdrop-blur-xl border-r border-white/10 w-64 flex-shrink-0 z-20">
      <div className="px-6 mb-10">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center shadow-lg shadow-primary-container/20">
            <Microscope className="text-on-primary-container w-6 h-6 fill-current" />
          </div>
          <div>
            <p className="text-xs font-bold text-primary-container uppercase tracking-wider">Stratos Office</p>
            <p className="text-sm text-on-surface-variant font-medium">Gemma 4 Active</p>
          </div>
        </div>
        <button className="w-full py-3 bg-primary-container text-on-primary-container text-sm font-bold rounded-xl hover:brightness-110 transition-all duration-200 active:scale-95 flex items-center justify-center gap-2">
          <Plus className="w-4 h-4" />
          New Analysis
        </button>
      </div>

      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <a
            key={item.label}
            href="#"
            className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 ease-in-out ${
              item.active 
                ? "bg-primary-container/10 text-primary-fixed-dim border-r-2 border-primary-fixed-dim" 
                : "text-on-surface-variant hover:bg-white/5"
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm font-semibold">{item.label}</span>
          </a>
        ))}
      </nav>

      <div className="mt-auto px-3 pt-6 border-t border-white/5 space-y-1">
        <button
          onClick={onOpenHistory}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 transition-all duration-200 ease-in-out"
        >
          <History className="w-5 h-5" />
          <span className="text-sm font-semibold">History</span>
        </button>
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-on-surface-variant hover:bg-white/5 transition-all duration-200 ease-in-out"
        >
          <Settings className="w-5 h-5" />
          <span className="text-sm font-semibold">Settings</span>
        </button>
      </div>
    </aside>
  );
}
