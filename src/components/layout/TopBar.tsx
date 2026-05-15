import { Search, Settings, Bell, User } from "lucide-react";

export default function TopBar() {
  return (
    <header className="fixed top-0 z-50 flex justify-between items-center w-full px-6 h-16 bg-surface/40 backdrop-blur-md border-b border-white/10 shadow-sm">
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold text-primary tracking-tight">Stratos Office</span>
      </div>

      <div className="flex items-center gap-6">
        <div className="hidden md:flex items-center bg-surface-variant/30 rounded-full px-4 py-1.5 border border-white/5 group focus-within:border-primary-container/30 transition-all">
          <Search className="text-outline w-4 h-4 mr-2 group-focus-within:text-primary-container transition-colors" />
          <input 
            className="bg-transparent border-none focus:ring-0 text-sm text-on-surface-variant w-64 placeholder:text-outline/50" 
            placeholder="Search insights..." 
            type="text" 
          />
        </div>

        <div className="flex items-center gap-3">
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant active:scale-95 duration-100 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </button>
          <button className="p-2 rounded-full hover:bg-white/5 transition-colors text-on-surface-variant active:scale-95 duration-100 relative flex items-center justify-center">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-secondary rounded-full border border-surface shadow-[0_0_10px_rgba(0,229,204,0.5)]"></span>
          </button>
          <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
            <div className="w-8 h-8 rounded-full border border-primary/20 overflow-hidden bg-surface-container-high transition-transform hover:scale-110 cursor-pointer">
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
