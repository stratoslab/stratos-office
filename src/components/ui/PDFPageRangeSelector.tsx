import { useState, useCallback } from 'react';

interface PDFPageRangeSelectorProps {
  pageCount: number;
  onChange: (range: { start: number; end: number }) => void;
  tokenEstimate: number;
}

export default function PDFPageRangeSelector({ pageCount, onChange, tokenEstimate }: PDFPageRangeSelectorProps) {
  const [mode, setMode] = useState<'all' | 'first50' | 'custom'>('first50');
  const [customStart, setCustomStart] = useState(1);
  const [customEnd, setCustomEnd] = useState(Math.min(50, pageCount));

  const updateRange = useCallback((start: number, end: number) => {
    onChange({ start, end });
  }, [onChange]);

  const handleModeChange = useCallback((newMode: 'all' | 'first50' | 'custom') => {
    setMode(newMode);
    if (newMode === 'all') {
      updateRange(1, pageCount);
    } else if (newMode === 'first50') {
      updateRange(1, Math.min(50, pageCount));
    }
  }, [pageCount, updateRange]);

  const handleCustomChange = useCallback((start: number, end: number) => {
    setCustomStart(start);
    setCustomEnd(end);
    updateRange(start, end);
  }, [updateRange]);

  return (
    <div className="bg-[#1A3A5C]/50 border border-white/10 rounded-xl p-4 space-y-3">
      <p className="text-amber-400 text-sm">
        This PDF has {pageCount} pages. Processing all pages may be slow.
      </p>
      <div className="flex gap-2">
        <button
          onClick={() => handleModeChange('first50')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'first50' ? 'bg-[#00D4FF] text-[#061220]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          First 50 pages
        </button>
        <button
          onClick={() => handleModeChange('all')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'all' ? 'bg-[#00D4FF] text-[#061220]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          All pages
        </button>
        <button
          onClick={() => handleModeChange('custom')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'custom' ? 'bg-[#00D4FF] text-[#061220]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          Custom range
        </button>
      </div>
      {mode === 'custom' && (
        <div className="flex items-center gap-2">
          <input
            type="number"
            min={1}
            max={pageCount}
            value={customStart}
            onChange={(e) => handleCustomChange(Number(e.target.value), customEnd)}
            className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-sm"
            aria-label="Start page"
          />
          <span className="text-gray-400">to</span>
          <input
            type="number"
            min={1}
            max={pageCount}
            value={customEnd}
            onChange={(e) => handleCustomChange(customStart, Number(e.target.value))}
            className="w-20 px-2 py-1 bg-white/5 border border-white/20 rounded-lg text-sm"
            aria-label="End page"
          />
        </div>
      )}
      <p className="text-xs text-gray-500">
        Estimated input: ~{tokenEstimate.toLocaleString()} tokens
      </p>
    </div>
  );
}
