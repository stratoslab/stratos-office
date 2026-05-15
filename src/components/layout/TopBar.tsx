import { Search, Settings, Bell, User } from "lucide-react";

export default function TopBar() {
  return (
    <header className="fixed top-0 z-50 flex justify-between items-center w-full px-6 h-16 border-b shadow-sm" style={{ background: "rgba(0, 20, 42, 0.4)", backdropFilter: "blur(12px)", borderColor: "rgba(255,255,255,0.1)" }}>
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>Stratos Office</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center rounded-full px-4 py-1.5 border group focus-within:border-primary-container/30 transition-all" style={{ background: "rgba(30, 54, 82, 0.3)", borderColor: "rgba(255,255,255,0.05)" }}>
          <Search className="w-4 h-4 mr-2 transition-colors" style={{ color: "var(--outline)" }} />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:opacity-50 outline-none" 
            style={{ color: "var(--on-surface-variant)" }}
            placeholder="Search insights..." 
            type="text" 
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center justify-center" style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full transition-colors active:scale-95 duration-100 relative flex items-center justify-center" style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border" style={{ background: "var(--secondary)", borderColor: "var(--surface)", boxShadow: "0 0 10px rgba(0, 229, 204, 0.5)" }}></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l ml-2" style={{ borderColor: "rgba(255,255,255,0.1)" }}>
            <div className="w-8 h-8 rounded-full border overflow-hidden transition-transform hover:scale-110 cursor-pointer" style={{ borderColor: "rgba(168, 232, 255, 0.2)", background: "var(--surface-container-high)" }}>
              <img 
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=100" 
                alt="User profile" 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
