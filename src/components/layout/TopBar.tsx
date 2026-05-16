import MaterialIcon from "../ui/MaterialIcon";

interface TopBarProps {
  onOpenSettings: () => void;
  onOpenMobileSidebar?: () => void;
}

export default function TopBar({ onOpenSettings, onOpenMobileSidebar }: TopBarProps) {
  return (
    <header
      className="fixed top-0 z-50 flex justify-between items-center w-full px-4 md:px-6 border-b shadow-sm"
      style={{
        background: "rgba(0, 20, 42, 0.4)",
        backdropFilter: "blur(12px)",
        borderColor: "rgba(255,255,255,0.1)",
        height: "var(--topbar-height, 64px)",
      }}
    >
      {/* Left: hamburger (mobile) + brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 -ml-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
          style={{ color: "var(--on-surface-variant)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
          aria-label="Open navigation menu"
        >
          <MaterialIcon name="menu" size={24} />
        </button>
        <img src="/stratos-logo-white.png" alt="Stratos Office" className="h-6 w-auto md:h-7" />
        <span className="text-lg md:text-xl font-bold tracking-tight" style={{ color: "var(--primary)" }}>
          Stratos Office
        </span>
      </div>

      {/* Search + actions */}
      <div className="flex items-center gap-2 md:gap-6">
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
        <div className="flex items-center gap-1 md:gap-3">
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-full transition-colors active:scale-95 duration-100 flex items-center justify-center min-w-[44px] min-h-[44px]"
            style={{ color: "var(--on-surface-variant)" }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255,255,255,0.05)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
            aria-label="Settings"
          >
            <MaterialIcon name="settings" size={20} />
          </button>

          <button
            className="p-2 rounded-full transition-colors active:scale-95 duration-100 relative flex items-center justify-center min-w-[44px] min-h-[44px] hidden sm:flex"
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
            className="hidden sm:flex items-center gap-3 pl-4 border-l ml-2"
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
