import { useCallback, useState } from 'react';
import { PipelineTemplate } from '../../types';
import { usePipeline } from '../../context/PipelineContext';
import PipelineStepIndicator from './PipelineStepIndicator';
import PipelineOutputPanel from './PipelineOutputPanel';
import { SearchResultList } from './PipelineOutputHelpers';
import MaterialIcon from '../ui/MaterialIcon';
import FileUploadZone from '../ui/FileUploadZone';

interface ResearchSynthesisWorkspaceProps {
  template: PipelineTemplate;
}

export default function ResearchSynthesisWorkspace({ template }: ResearchSynthesisWorkspaceProps) {
  const { run, streamingOutput, setPipelineInput, runPipeline, cancelPipeline, retryStep, skipStep, resetPipeline } = usePipeline();
  const [question, setQuestion] = useState('');
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  const handlePdfFile = useCallback((file: File) => {
    setPdfFiles(prev => [...prev, file]);
    setPipelineInput({ files: [file], text: question });
  }, [setPipelineInput, question]);

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
            <h3 className="text-xs md:text-sm font-medium text-gray-400">Research Question</h3>

            <textarea
              value={question}
              onChange={(e) => { setQuestion(e.target.value); setPipelineInput({ text: e.target.value }); }}
              placeholder="Enter your research question..."
              className="w-full min-h-[80px] bg-white/5 border border-white/20 rounded-xl p-3 text-sm text-white placeholder-gray-500 focus:border-[#00D4FF] focus:outline-none resize-y"
              aria-label="Research question"
            />

            <div>
              <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--on-surface-variant)' }}>Research Papers (optional)</label>
              <FileUploadZone taskType="deep_doc_qa" onFile={handlePdfFile} onError={() => {}} />
              {pdfFiles.length > 0 && <div className="mt-1 text-xs" style={{ color: 'var(--secondary)' }}>{pdfFiles.length} paper(s)</div>}
            </div>

            <button
              onClick={runPipeline}
              disabled={isRunning || !question.trim()}
              className="w-full py-3 rounded-xl font-medium transition-colors min-h-[44px] bg-[#00D4FF] text-[#061220] hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRunning ? 'Running...' : 'Run Research'}
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
          {question && (
            <div className="p-2 rounded-lg border border-white/10">
              <span className="text-xs text-gray-400">Question: </span>
              <span className="text-sm" style={{ color: 'var(--on-surface)' }}>{question}</span>
            </div>
          )}
          {run.steps.filter(s => s.status === 'complete').map((step) => (
            <div key={step.stepIndex} className="border border-white/10 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2" style={{ color: 'var(--on-surface)' }}>{step.label}</h4>
              {step.taskType === 'research' && step.parsedOutput && (
                <SearchResultList data={(step.parsedOutput as Record<string, unknown>)?.sources} />
              )}
              {step.taskType === 'research' && !step.parsedOutput && step.output && (
                <div className="text-sm whitespace-pre-wrap" style={{ color: 'var(--on-surface-variant)' }}>{step.output}</div>
              )}
              {step.output && !step.parsedOutput && step.taskType !== 'research' && (
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
