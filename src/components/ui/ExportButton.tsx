import { useState } from 'react';
import { TaskType } from '../../types';

interface ExportButtonProps {
  output: string;
  parsedOutput?: unknown;
  taskType: TaskType;
}

export default function ExportButton({ output, parsedOutput, taskType }: ExportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getFilename = (ext: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `stratos-${taskType}-${date}.${ext}`;
  };

  const download = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExport = (format: 'txt' | 'json' | 'md' | 'html') => {
    setIsOpen(false);

    switch (format) {
      case 'txt': {
        const plain = output.replace(/[#*_`~]/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
        download(plain, getFilename('txt'), 'text/plain');
        break;
      }
      case 'json': {
        const json = parsedOutput ? JSON.stringify(parsedOutput, null, 2) : JSON.stringify({ output }, null, 2);
        download(json, getFilename('json'), 'application/json');
        break;
      }
      case 'md': {
        download(output, getFilename('md'), 'text/markdown');
        break;
      }
      case 'html': {
        const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{font-family:system-ui;max-width:800px;margin:0 auto;padding:2rem;background:#061220;color:#fff;line-height:1.6}pre{background:#0A2540;padding:1rem;border-radius:8px;overflow:auto}code{font-family:monospace}a{color:#00D4FF}</style></head><body>${output}</body></html>`;
        download(html, getFilename('html'), 'text/html');
        break;
      }
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-3 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
        aria-label="Export output"
        aria-expanded={isOpen}
      >
        <span className="material-symbols-outlined text-sm">download</span>
        Export
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-1 bg-[#0A2540] border border-white/10 rounded-lg shadow-lg z-10 min-w-[120px]">
          {(['txt', 'json', 'md', 'html'] as const).map(format => (
            <button
              key={format}
              onClick={() => handleExport(format)}
              className="w-full text-left px-3 py-2 text-sm hover:bg-white/10 transition-colors first:rounded-t-lg last:rounded-b-lg"
            >
              {format.toUpperCase()}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
