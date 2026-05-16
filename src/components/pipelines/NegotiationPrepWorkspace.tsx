import { useCallback, useState } from 'react';
import { PipelineTemplate } from '../../types';
import { usePipeline } from '../../context/PipelineContext';
import PipelineStepIndicator from './PipelineStepIndicator';
import PipelineOutputPanel from './PipelineOutputPanel';
import { TranscriptPanel, EmailDraftDisplay } from './PipelineOutputHelpers';
import MaterialIcon from '../ui/MaterialIcon';
import FileUploadZone from '../ui/FileUploadZone';

interface NegotiationPrepWorkspaceProps {
  template: PipelineTemplate;
}

export default function NegotiationPrepWorkspace({ template }: NegotiationPrepWorkspaceProps) {
  const { run, streamingOutput, setPipelineInput, runPipeline, cancelPipeline, retryStep, skipStep, resetPipeline } = usePipeline();
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [audioFiles, setAudioFiles] = useState<File[]>([]);

  const handleContractFile = useCallback((file: File, dataUrl: string) => {
    setContractFile(file);
    setPipelineInput({ files: [file], imageDataUrl: dataUrl });
  }, [setPipelineInput]);

  const handleAudioFile = useCallback((file: File) => {
    setAudioFiles(prev => [...prev, file]);
    setPipelineInput({ files: [file] });
  }, [setPipelineInput]);

  const isRunning = run?.status === 'running' || run?.status === 'submitting';
  const isError = run?.status === 'error';
  const isComplete = run?.status === 'complete';

  const toneColors = [
    { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444', label: 'Firm' },
    { bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.3)', text: '#3b82f6', label: 'Collaborative' },
    { bg: 'rgba(168, 85, 247, 0.1)', border: 'rgba(168, 85, 247, 0.3)', text: '#a855f7', label: 'Walk-Away' },
  ];

  if (!run) {
    return (
      <div className="flex flex-col lg:flex-row gap-4 md:gap-6 h-full p-3 md:p-4 lg:p-0">
        <div className="lg:w-1/2 space-y-3 md:space-y-4">
          <div className="min-w-0">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">{template.name}</h2>
            <p className="text-xs md:text-sm text-gray-400">{template.description}</p>
          </div>

          <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 space-y-4">
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Upload Documents</h3>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Contract</label>
              <FileUploadZone taskType="contract_analyzer" onFile={handleContractFile} onError={() => {}} />
              {contractFile && <div className="mt-1 text-xs" style={{ color: 'var(--secondary)' }}>{contractFile.name}</div>}
            </div>

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Negotiation Call Recordings</label>
              <FileUploadZone taskType="transcription" onFile={handleAudioFile} onError={() => {}} />
              {audioFiles.length > 0 && <div className="mt-1 text-xs" style={{ color: 'var(--secondary)' }}>{audioFiles.length} recording(s)</div>}
            </div>

            <button
              onClick={runPipeline}
              disabled={isRunning || !contractFile}
              className="w-full py-3 rounded-xl font-medium transition-colors min-h-[44px] bg-[#00D4FF] text-[#061220] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Negotiation Prep'}
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
              {step.taskType === 'transcription' && step.output && <TranscriptPanel text={step.output} />}
              {step.taskType === 'tone_rewriter' && step.output && (
                <div className="space-y-2">
                  {toneColors.map((tc, i) => (
                    <div key={i} className="p-2 rounded-lg border" style={{ background: tc.bg, borderColor: tc.border }}>
                      <span className="text-xs font-bold" style={{ color: tc.text }}>{tc.label}</span>
                      <p className="text-sm mt-1 whitespace-pre-wrap" style={{ color: 'var(--on-surface-variant)' }}>{step.output}</p>
                    </div>
                  ))}
                </div>
              )}
              {step.taskType === 'email_draft' && step.parsedOutput && <EmailDraftDisplay data={step.parsedOutput} />}
              {step.output && !step.parsedOutput && step.taskType !== 'transcription' && step.taskType !== 'tone_rewriter' && (
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
