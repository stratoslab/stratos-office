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

interface OutputPanelProps {
  taskType: TaskType;
}

export default function OutputPanel({ taskType }: OutputPanelProps) {
  const { streamingOutput, finalOutput, parsedOutput, lifecycle, tps, cancelTask } = useTask();
  const config = getTaskConfig(taskType);
  const isGenerating = lifecycle === 'generating';
  const output = finalOutput || streamingOutput;

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
  };

  const renderOutput = () => {
    if (taskType === 'object_detection' && parsedOutput) {
      const imageDataUrl = '';
      return <BoundingBoxCanvas imageDataUrl={imageDataUrl} detections={parsedOutput as any[]} />;
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

    if (config.outputFormat === 'table' || config.outputFormat === 'markdown') {
      return <MarkdownRenderer content={output} />;
    }

    return <MarkdownRenderer content={output} />;
  };

  if (!output && !isGenerating) {
    return (
      <div className="bg-[#0A2540]/50 rounded-xl p-6 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Output will appear here after running the task.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A2540]/50 rounded-xl p-6 relative">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-gray-400">Output</h3>
        <div className="flex items-center gap-2">
          {isGenerating && (
            <button
              onClick={cancelTask}
              className="flex items-center gap-1 px-2 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm"
              aria-label="Stop generation"
            >
              <span className="material-symbols-outlined text-sm">stop</span>
              Stop
            </button>
          )}
          {output && (
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm"
              aria-label="Copy output"
            >
              <span className="material-symbols-outlined text-sm">content_copy</span>
              Copy
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
