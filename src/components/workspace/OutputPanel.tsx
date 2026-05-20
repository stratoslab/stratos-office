import { TaskType } from '../../types';
import { useTask } from '../../context/TaskContext';
import StreamingOutput from './StreamingOutput';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import JsonTreeView from '../ui/JsonTreeView';
import HtmlPreviewFrame from '../ui/HtmlPreviewFrame';
import BoundingBoxCanvas from '../ui/BoundingBoxCanvas';
import DiffView from '../ui/DiffView';
import ExportButton from '../ui/ExportButton';
import DisclaimerBanner from '../ui/DisclaimerBanner';
import { getTaskConfig } from '../../taskRouter';
import MaterialIcon from '../ui/MaterialIcon';

interface OutputPanelProps {
  taskType: TaskType;
}

export default function OutputPanel({ taskType }: OutputPanelProps) {
  const { streamingOutput, finalOutput, parsedOutput, lifecycle, tps, cancelTask, taskInput, error, chunkProgress } = useTask();
  const config = getTaskConfig(taskType);
  const isGenerating = lifecycle === 'generating';
  const isSubmitting = lifecycle === 'submitting';
  const output = finalOutput || streamingOutput;

  console.log('[OutputPanel] render', { lifecycle, hasOutput: !!output, hasError: !!error, streamingLength: streamingOutput.length, chunkProgress });

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const renderOutput = () => {
    if (taskType === 'object_detection') {
      return <MarkdownRenderer content={output} />;
    }

    if (taskType === 'redline_comparison' && parsedOutput) {
      return <DiffView result={parsedOutput as any} />;
    }

    if (config.outputFormat === 'json' && parsedOutput) {
      return <JsonTreeView data={parsedOutput} />;
    }

    if (config.outputFormat === 'html') {
      return <HtmlPreviewFrame html={output} />;
    }

    return <MarkdownRenderer content={output} />;
  };

  if (isSubmitting) {
    return (
      <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 min-h-[200px] flex flex-col items-center justify-center gap-3">
        <div className="relative">
          <svg className="animate-spin h-8 w-8" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ color: 'rgba(0,212,255,0.2)' }} />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" style={{ color: 'var(--primary-fixed-dim)' }} />
          </svg>
        </div>
        <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>Processing...</p>
        <p className="text-xs" style={{ color: 'var(--outline)' }}>
          {taskInput.file?.type === 'application/pdf' ? 'Extracting text from PDF' : 'Preparing task for model'}
        </p>
      </div>
    );
  }

  if (chunkProgress && isGenerating) {
    return (
      <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 min-h-[200px] flex flex-col items-center justify-center gap-4">
        <div className="w-full max-w-md">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium" style={{ color: 'var(--on-surface)' }}>
              Analyzing document...
            </p>
            <p className="text-xs" style={{ color: 'var(--outline)' }}>
              Section {chunkProgress.current} of {chunkProgress.total}
            </p>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${(chunkProgress.current / chunkProgress.total) * 100}%`,
                background: 'var(--primary-fixed-dim)',
              }}
            />
          </div>
        </div>
        {streamingOutput && (
          <div className="w-full max-w-md mt-2 p-3 rounded-lg bg-white/5 max-h-[200px] overflow-y-auto">
            <p className="text-xs whitespace-pre-wrap" style={{ color: 'var(--on-surface-variant)' }}>
              {streamingOutput}
            </p>
          </div>
        )}
        <button
          onClick={cancelTask}
          className="flex items-center gap-1 px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
        >
          <span className="material-symbols-outlined text-sm">stop</span>
          Cancel
        </button>
      </div>
    );
  }

  if (!output && !isGenerating) {
    return (
      <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Output will appear here after running the task.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 relative">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs md:text-sm font-medium text-gray-400">Output</h3>
        <div className="flex items-center gap-1.5 md:gap-2">
          {isGenerating && (
            <button
              onClick={cancelTask}
              className="flex items-center gap-1 px-2 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm min-h-[36px]"
              aria-label="Stop generation"
            >
              <span className="material-symbols-outlined text-sm">stop</span>
              <span className="hidden sm:inline">Stop</span>
            </button>
          )}
          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm min-h-[36px]"
              aria-label="Copy output"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              <span className="hidden sm:inline">Copy</span>
            </button>
          )}
          {output && lifecycle === 'complete' && (
            <ExportButton output={output} parsedOutput={parsedOutput} taskType={taskType} />
          )}
        </div>
      </div>

      {renderOutput()}

      {isGenerating && (
        <StreamingOutput content={streamingOutput} isGenerating={true} tps={tps} />
      )}

      {lifecycle === 'complete' && config.requiresDisclaimer && config.disclaimerText && (
        <div className="mt-4">
          <DisclaimerBanner text={config.disclaimerText} />
        </div>
      )}
    </div>
  );
}
