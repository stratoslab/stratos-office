interface ThinkingModeToggleProps {
  enabled: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

export default function ThinkingModeToggle({ enabled, onChange, disabled }: ThinkingModeToggleProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer" title="Enable chain-of-thought reasoning for deeper analysis">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
          aria-label="Thinking mode"
        />
        <div className="w-10 h-5 bg-white/10 rounded-full peer-checked:bg-[#00D4FF]/30 transition-colors" />
        <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 peer-checked:bg-[#00D4FF] transition-transform" />
      </div>
      <span className="text-sm text-gray-400">Thinking Mode</span>
    </label>
  );
}
