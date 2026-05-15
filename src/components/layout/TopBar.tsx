import MaterialIcon from "../ui/MaterialIcon";

interface TopBarProps {
  onOpenSettings: () => void;
}

export default function TopBar({ onOpenSettings }: TopBarProps) {
  return (
    <header
      className="fixed top-0 z-50 flex justify-between items-center w-full px-6 h-16 border-b shadow-sm"
      style={{
        background: "rgba(0, 20, 42, 0.4)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.1)",
      }}
    >
      {/* Brand with logo */}
      <div className="flex items-center gap-3">
        <img src="/stratos-logo-white.png" alt="Stratos Office" className="h-7 w-auto" />
        <span className="text-xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
          Stratos Office
        </span>
      </div>

      {/* Search + actions */}
      <div className="flex items-center gap-6">
        {/* Search bar */}
        <div
          className="hidden md:flex items-center rounded-full px-4 py-1.5 border transition-all"
          style={{
            background: "rgba(30, 54, 82, 0.3)",
            borderColor: "rgba(255,255,255,0.05)",
          }}
        >
          <MaterialIcon name="search" size={18} className="mr-2" style={{ color: "var(--outline)" }} />
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-64 placeholder:opacity-50 outline-none"
            style={{ color: "var(--on-surface-variant)" }}
            placeholder="Search insights..."
            type="text"
          />
        </div>

        {/* Icon buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center justify-center"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Settings"
          >
            <MaterialIcon name="settings" size={20} />
          </button>

          <button
            className="p-2 rounded-full transition-colors active:scale-95 duration-100 relative flex items-center justify-center"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Notifications"
          >
            <MaterialIcon name="notifications" size={20} />
            <span
              className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full border"
              style={{
                background: "var(--secondary)",
                borderColor: "var(--surface)",
                boxShadow: "0 0 10px rgba(0, 229, 204, 0.5)",
              }}
            />
          </button>

          {/* Avatar */}
          <div
            className="flex items-center gap-3 pl-4 border-l ml-2"
            style={{ borderColor: "rgba(255,255,255,0.1)" }}
          >
            <div
              className="w-8 h-8 rounded-full border overflow-hidden transition-transform hover:scale-110 cursor-pointer flex items-center justify-center"
              style={{
                borderColor: "rgba(168, 232, 255, 0.2)",
                background: "var(--surface-container-high)",
              }}
            >
              <MaterialIcon name="account_circle" size={32} style={{ color: "var(--on-surface-variant)" }} />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
