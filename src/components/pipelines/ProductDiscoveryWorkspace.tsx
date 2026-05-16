import { useCallback, useState } from 'react';
import { PipelineTemplate } from '../../types';
import { usePipeline } from '../../context/PipelineContext';
import PipelineStepIndicator from './PipelineStepIndicator';
import PipelineOutputPanel from './PipelineOutputPanel';
import MaterialIcon from '../ui/MaterialIcon';
import FileUploadZone from '../ui/FileUploadZone';
import HtmlPreviewFrame from '../ui/HtmlPreviewFrame';

interface ProductDiscoveryWorkspaceProps {
  template: PipelineTemplate;
}

export default function ProductDiscoveryWorkspace({ template }: ProductDiscoveryWorkspaceProps) {
  const { run, streamingOutput, setPipelineInput, runPipeline, cancelPipeline, retryStep, skipStep, resetPipeline } = usePipeline();
  const [whiteboardFiles, setWhiteboardFiles] = useState<File[]>([]);
  const [screenshotFiles, setScreenshotFiles] = useState<File[]>([]);

  const handleWhiteboardFile = useCallback((file: File, dataUrl: string) => {
    setWhiteboardFiles(prev => [...prev, file]);
    setPipelineInput({ files: [file], imageDataUrl: dataUrl });
  }, [setPipelineInput]);

  const handleScreenshotFile = useCallback((file: File, dataUrl: string) => {
    setScreenshotFiles(prev => [...prev, file]);
    setPipelineInput({ files: [file], imageDataUrl: dataUrl });
  }, [setPipelineInput]);

  const isRunning = run?.status === 'running' || run?.status === 'submitting';
  const isError = run?.status === 'error';
  const isComplete = run?.status === 'complete';

  if (!run) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 md:p-4 lg:p-0">
        <div className="lg:w-1/2 space-y-3 md:space-y-4">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">{template.name}</h2>
            <p className="text-xs md:text-sm text-gray-400">{template.description}</p>
          </div>

          <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Upload Images</h3>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Whiteboard Photos</label>
              <FileUploadZone taskType="whiteboard_ocr" onFile={handleWhiteboardFile} onError={() => {}} />
              {whiteboardFiles.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {whiteboardFiles.map((f, i) => (
                    <div key={i} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0, 229, 204, 0.1)', color: 'var(--secondary)' }}>{f.name}</div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Competitor Screenshots</label>
              <FileUploadZone taskType="screen_analysis" onFile={handleScreenshotFile} onError={() => {}} />
              {screenshotFiles.length > 0 && (
                <div className="mt-2 flex gap-2 flex-wrap">
                  {screenshotFiles.map((f, i) => (
                    <div key={i} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(0, 229, 204, 0.1)', color: 'var(--secondary)' }}>{f.name}</div>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={runPipeline}
              disabled={isRunning || (whiteboardFiles.length === 0 && screenshotFiles.length === 0)}
              className="w-full py-3 rounded-xl font-medium transition-colors min-h-[44px] bg-[#00D4FF] text-[#061220] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Product Discovery'}
            </button>
          </div>
        </div>

        <div className="lg:w-1/2">
          <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6">
            <h3 className="text-xs md:text-sm font-medium text-gray-400 mb-3">Pipeline Steps</h3>
            <PipelineStepIndicator
              steps={template.steps.map((step, i) => ({ stepIndex: i, taskType: step.taskType, label: step.label ?? step.taskType, status: 'pending', input: {} }))}
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
          <h2 className="text-lg md:text-xl font-semibold text-white truncate">{template.name}</h2>
          <div className="flex items-center gap-2">
            {isRunning && (
              <button onClick={cancelPipeline} className="flex items-center gap-1 px-2 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm min-h-[36px]">
                <MaterialIcon name="stop" size={16} /><span className="hidden sm:inline">Cancel</span>
              </button>
            )}
            {(isComplete || isError) && (
              <button onClick={resetPipeline} className="flex items-center gap-1 px-2 py-1.5 bg-white/10 rounded-lg text-sm min-h-[36px]">
                <MaterialIcon name="refresh" size={16} /><span className="hidden sm:inline">New Run</span>
              </button>
            )}
          </div>
        </div>

        <PipelineStepIndicator steps={run.steps} currentStepIndex={run.currentStepIndex} layout="horizontal" />

        {isError && (
          <div className="flex items-center gap-2">
            <button onClick={() => { const i = run.steps.findIndex(s => s.status === 'error'); if (i >= 0) retryStep(i); }} className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-[#00D4FF] text-[#061220]">Retry</button>
            <button onClick={() => { const i = run.steps.findIndex(s => s.status === 'error'); if (i >= 0) skipStep(i); }} className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-white/10">Skip</button>
            <button onClick={cancelPipeline} className="flex-1 py-2 rounded-lg font-medium text-sm min-h-[44px] bg-red-500/20 text-red-400">Abort</button>
          </div>
        )}

        <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 space-y-4">
          <h3 className="text-xs md:text-sm font-medium text-gray-400">Step Outputs</h3>
          {run.steps.filter(s => s.status === 'complete').map((step) => (
            <div key={step.stepIndex} className="border border-white/10 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>{step.label}</h4>
              {step.taskType === 'wireframe_to_html' && step.output && <HtmlPreviewFrame html={step.output} />}
              {step.taskType === 'screen_analysis' && step.parsedOutput && (
                <div className="text-sm space-y-1" style={{ color: 'var(--on-surface-variant)' }}>
                  {((step.parsedOutput as Record<string, unknown>)?.elements as Array<Record<string, unknown>>)?.map((el, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>{String(el.type ?? '')}</span>
                      <span>{String(el.label ?? '')}</span>
                    </div>
                  ))}
                </div>
              )}
              {step.output && !step.parsedOutput && step.taskType !== 'wireframe_to_html' && (
                <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--on-surface-variant)' }}>{step.output.slice(0, 300)}...</div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="lg:w-1/2">
        <PipelineOutputPanel steps={run.steps} streamingOutput={streamingOutput} currentStepIndex={run.currentStepIndex} status={run.status} />
      </div>
    </div>
  );
}
