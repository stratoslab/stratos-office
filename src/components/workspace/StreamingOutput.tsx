import { useEffect, useState } from 'react';

interface StreamingOutputProps {
  content: string;
  isGenerating: boolean;
  tps?: number | null;
  elapsedMs?: number;
}

export default function StreamingOutput({ content, isGenerating, tps, elapsedMs }: StreamingOutputProps) {
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = setInterval(() => setShowCursor(prev => !prev), 530);
    return () => clearInterval(interval);
  }, [isGenerating]);

  return (
    <div>
      <div className="min-h-[100px] whitespace-pre-wrap font-mono text-sm text-gray-200">
        {content}
        {isGenerating && (
          <span className={`inline-block w-2 h-4 bg-[#00D4FF] ${showCursor ? 'opacity-100' : 'opacity-0'} transition-opacity`} />
        )}
      </div>
      {isGenerating && (
        <div className="flex items-center gap-4 mt-3 text-xs text-gray-500" role="status" aria-live="polite">
          <span>Elapsed: {elapsedMs ? `${(elapsedMs / 1000).toFixed(1)}s` : '0.0s'}</span>
          {tps && <span>TPS: {tps.toFixed(1)}</span>}
        </div>
      )}
      {!isGenerating && content && (
        <div className="text-xs text-gray-500 mt-2" aria-live="polite">
          Generation complete
        </div>
      )}
    </div>
  );
}
