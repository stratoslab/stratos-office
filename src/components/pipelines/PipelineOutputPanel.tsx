import { useState } from 'react';
import { PipelineStepRun } from '../../types';
import MarkdownRenderer from '../ui/MarkdownRenderer';
import MaterialIcon from '../ui/MaterialIcon';

interface PipelineOutputPanelProps {
  steps: PipelineStepRun[];
  streamingOutput: string;
  currentStepIndex: number;
  status: 'idle' | 'submitting' | 'running' | 'complete' | 'error' | 'cancelled';
}

export default function PipelineOutputPanel({ steps, streamingOutput, currentStepIndex, status }: PipelineOutputPanelProps) {
  const [expandedSteps, setExpandedSteps] = useState<Set<number>>(new Set());
  const [showCombined, setShowCombined] = useState(false);

  const toggleStep = (index: number) => {
    setExpandedSteps(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const completedSteps = steps.filter(s => s.status === 'complete' || s.status === 'skipped');
  const runningStep = steps.find(s => s.status === 'running');
  const errorStep = steps.find(s => s.status === 'error');

  const combinedOutput = steps
    .filter(s => s.status === 'complete' && s.output)
    .map(s => `## ${s.label}\n\n${s.output}`)
    .join('\n\n---\n\n');

  if (status === 'idle' || status === 'submitting') {
    return (
      <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 min-h-[200px] flex items-center justify-center">
        <p className="text-gray-500 text-sm">Pipeline output will appear here after running.</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 relative">
      <div className="flex items-center justify-between mb-3 md:mb-4">
        <h3 className="text-xs md:text-sm font-medium text-gray-400">Pipeline Output</h3>
        {status === 'complete' && (
          <button
            onClick={() => setShowCombined(!showCombined)}
            className="flex items-center gap-1 px-2 py-1.5 bg-white/10 rounded-lg hover:bg-white/20 transition-colors text-sm min-h-[36px]"
            style={{ color: showCombined ? 'var(--primary-fixed-dim)' : 'var(--on-surface-variant)' }}
          >
            <MaterialIcon name={showCombined ? 'view_agenda' : 'view_stream'} size={16} />
            {showCombined ? 'Individual' : 'Combined'}
          </button>
        )}
      </div>

      {showCombined && status === 'complete' && combinedOutput ? (
        <div className="prose prose-invert prose-sm max-w-none">
          <MarkdownRenderer content={combinedOutput} />
        </div>
      ) : (
        <div className="space-y-3">
          {completedSteps.map((step, i) => {
            const actualIndex = steps.indexOf(step);
            const isExpanded = expandedSteps.has(actualIndex);
            return (
              <div key={actualIndex} className="border border-white/10 rounded-lg overflow-hidden">
                <button
                  onClick={() => toggleStep(actualIndex)}
                  className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-white/5 transition-colors min-h-[44px]"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <MaterialIcon name="check_circle" size={16} style={{ color: 'var(--secondary)' }} />
                    <span className="text-sm font-medium truncate">{step.label}</span>
                    {step.tokenCount && (
                      <span className="text-[10px] text-gray-500 flex-shrink-0">{step.tokenCount} tokens</span>
                    )}
                  </div>
                  <MaterialIcon name={isExpanded ? 'expand_less' : 'expand_more'} size={16} style={{ color: 'var(--outline)' }} />
                </button>
                {isExpanded && step.output && (
                  <div className="px-3 pb-3">
                    <MarkdownRenderer content={step.output} />
                  </div>
                )}
              </div>
            );
          })}

          {runningStep && (
            <div className="border border-[#00D4FF]/30 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-symbols-outlined text-sm animate-spin" style={{ color: 'var(--primary-fixed-dim)' }}>progress_activity</span>
                <span className="text-sm font-medium" style={{ color: 'var(--primary-fixed-dim)' }}>{runningStep.label}</span>
              </div>
              {streamingOutput && (
                <div className="text-sm" style={{ color: 'var(--on-surface-variant)' }}>
                  <MarkdownRenderer content={streamingOutput} />
                </div>
              )}
            </div>
          )}

          {errorStep && (
            <div className="border border-red-500/30 rounded-lg p-3 bg-red-500/5">
              <div className="flex items-center gap-2 mb-2">
                <MaterialIcon name="error" size={16} style={{ color: 'var(--error)' }} />
                <span className="text-sm font-medium text-red-400">{errorStep.label}</span>
              </div>
              <p className="text-sm text-red-400">{errorStep.error}</p>
            </div>
          )}

          {steps.filter(s => s.status === 'pending').length > 0 && (
            <div className="text-sm text-gray-500 italic">
              {steps.filter(s => s.status === 'pending').length} step(s) remaining...
            </div>
          )}
        </div>
      )}
    </div>
  );
}
