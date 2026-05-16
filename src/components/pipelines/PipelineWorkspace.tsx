import { useCallback, useState } from 'react';
import { PipelineTemplate } from '../../types';
import { usePipeline } from '../../context/PipelineContext';
import PipelineStepIndicator from './PipelineStepIndicator';
import PipelineOutputPanel from './PipelineOutputPanel';
import MaterialIcon from '../ui/MaterialIcon';
import FileUploadZone from '../ui/FileUploadZone';

interface PipelineWorkspaceProps {
  template: PipelineTemplate;
}

export default function PipelineWorkspace({ template }: PipelineWorkspaceProps) {
  const { run, streamingOutput, loadTemplate, setPipelineInput, runPipeline, cancelPipeline, retryStep, skipStep, resetPipeline } = usePipeline();
  const [inputText, setInputText] = useState('');

  const handleFile = useCallback(async (file: File, dataUrl: string) => {
    setPipelineInput({ files: [file], imageDataUrl: dataUrl });
  }, [setPipelineInput]);

  const isRunning = run?.status === 'running' || run?.status === 'submitting';
  const isComplete = run?.status === 'complete';
  const isError = run?.status === 'error';
  const isCancelled = run?.status === 'cancelled';

  if (!run) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 md:p-4 lg:p-0">
        <div className="lg:w-1/2 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between">
            <div className="min-w-0 flex-1 mr-3">
              <h2 className="text-lg md:text-xl font-semibold text-white truncate">{template.name}</h2>
              <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{template.description}</p>
            </div>
          </div>

          <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Input</h3>

            {template.expectedInputs?.some(i => i.type === 'image') && (
              <FileUploadZone taskType="ocr" onFile={handleFile} onError={() => {}} />
            )}

            {template.expectedInputs?.some(i => i.type === 'audio') && (
              <FileUploadZone taskType="transcription" onFile={handleFile} onError={() => {}} />
            )}

            {template.expectedInputs?.some(i => i.type === 'pdf') && (
              <FileUploadZone taskType="pdf_qa" onFile={handleFile} onError={() => {}} />
            )}

            {template.expectedInputs?.some(i => i.type === 'text') && (
              <textarea
                value={inputText}
                onChange={(e) => { setInputText(e.target.value); setPipelineInput({ text: e.target.value }); }}
                placeholder="Enter your input..."
                className="w-full min-h-[100px] md:min-h-[120px] bg-white/5 border border-white/20 rounded-xl p-3 md:p-4 text-sm text-white placeholder-gray-500 focus:border-[#00D4FF] focus:outline-none resize-y"
                aria-label="Pipeline input"
              />
            )}

            <button
              onClick={runPipeline}
              disabled={isRunning}
              className={`w-full py-3 md:py-3.5 rounded-xl font-medium transition-colors min-h-[44px] ${
                isRunning
                  ? 'bg-white/5 text-gray-500 cursor-not-allowed'
                  : 'bg-[#00D4FF] text-[#061220] hover:brightness-110'
              }`}
              aria-label="Run pipeline"
            >
              {isRunning ? 'Running...' : 'Run Pipeline'}
            </button>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6">
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-3">Pipeline Steps</h3>
            <PipelineStepIndicator
              steps={template.steps.map((step, i) => ({
                stepIndex: i,
                taskType: step.taskType,
                label: step.label ?? step.taskType,
                status: 'pending',
                input: {},
              }))}
              currentStepIndex={0}
              layout="vertical"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 md:p-4 lg:p-0">
      <div className="lg:w-1/2 space-y-3 md:space-y-4">
        <div className="flex items-center justify-between">
          <div className="min-w-0 flex-1 mr-3">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">{template.name}</h2>
            <p className="text-xs md:text-sm text-gray-400 line-clamp-2">{template.description}</p>
          </div>
          <div className="flex items-center gap-2">
            {isRunning && (
              <button
                onClick={cancelPipeline}
                className="flex items-center gap-1 px-2 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors text-sm min-h-[36px]"
                aria-label="Cancel pipeline"
              >
                <MaterialIcon name="stop" size={16} />
                <span className="hidden sm:inline">Cancel</span>
              </button>
            )}
            {(isComplete || isError || isCancelled) && (
              <button
                onClick={resetPipeline}
                className="flex items-center gap-1 px-2 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm min-h-[36px]"
                aria-label="Reset pipeline"
              >
                <MaterialIcon name="refresh" size={16} />
                <span className="hidden sm:inline">New Run</span>
              </button>
            )}
          </div>
        </div>

        <PipelineStepIndicator
          steps={run.steps}
          currentStepIndex={run.currentStepIndex}
          layout="horizontal"
        />

        {isError && run.steps.find(s => s.status === 'error') && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const errorIdx = run.steps.findIndex(s => s.status === 'error');
                if (errorIdx >= 0) retryStep(errorIdx);
              }}
              className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-[#00D4FF] text-[#061220] hover:brightness-110"
            >
              Retry
            </button>
            <button
              onClick={() => {
                const errorIdx = run.steps.findIndex(s => s.status === 'error');
                if (errorIdx >= 0) skipStep(errorIdx);
              }}
              className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-white/10 text-white hover:bg-white/20"
            >
              Skip
            </button>
            <button
              onClick={cancelPipeline}
              className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-red-500/20 text-red-400 hover:bg-red-500/30"
            >
              Abort
            </button>
          </div>
        )}
      </div>

      <div className="lg:w-1/2">
        <PipelineOutputPanel
          steps={run.steps}
          streamingOutput={streamingOutput}
          currentStepIndex={run.currentStepIndex}
          status={run.status}
        />
      </div>
    </div>
  );
}
