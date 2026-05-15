import { useState } from 'react';
import { TaskType } from '../../types';

interface PrivacyNoticeProps {
  taskType: TaskType;
}

export default function PrivacyNotice({ taskType }: PrivacyNoticeProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div className="bg-[#00D4FF]/5 border border-[#00D4FF]/20 rounded-lg px-4 py-3 flex items-start justify-between gap-3">
      <div>
        <p className="text-sm text-[#00D4FF]">
          All processing happens locally in your browser. No data leaves your device.
        </p>
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-gray-400 hover:text-white transition-colors"
        aria-label="Dismiss privacy notice"
      >
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}
