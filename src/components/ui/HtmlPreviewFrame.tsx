import { useState } from 'react';

interface HtmlPreviewFrameProps {
  html: string;
}

export default function HtmlPreviewFrame({ html }: HtmlPreviewFrameProps) {
  const [mode, setMode] = useState<'code' | 'preview'>('code');

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={() => setMode('code')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'code' ? 'bg-[#00D4FF] text-[#061220]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          Code
        </button>
        <button
          onClick={() => setMode('preview')}
          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${mode === 'preview' ? 'bg-[#00D4FF] text-[#061220]' : 'bg-white/10 hover:bg-white/20'}`}
        >
          Preview
        </button>
      </div>
      {mode === 'code' ? (
        <pre className="bg-[#0A2540]/50 rounded-lg p-4 overflow-auto font-mono text-sm text-gray-300">
          {html}
        </pre>
      ) : (
        <iframe
          srcDoc={html}
          sandbox="allow-scripts"
          className="w-full h-96 bg-white rounded-lg border border-white/10"
          title="HTML Preview"
        />
      )}
    </div>
  );
}
