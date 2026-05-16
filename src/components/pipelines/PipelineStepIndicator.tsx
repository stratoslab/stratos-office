import { PipelineStepRun } from '../../types';
import MaterialIcon from '../ui/MaterialIcon';

interface PipelineStepIndicatorProps {
  steps: PipelineStepRun[];
  currentStepIndex: number;
  layout?: 'horizontal' | 'vertical';
}

export default function PipelineStepIndicator({ steps, currentStepIndex, layout = 'horizontal' }: PipelineStepIndicatorProps) {
  const getStatusIcon = (step: PipelineStepRun) => {
    switch (step.status) {
      case 'pending':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--outline)' }}>
            {step.stepIndex + 1}
          </div>
        );
      case 'running':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)' }}>
            <span className="material-symbols-outlined text-sm animate-spin">progress_activity</span>
          </div>
        );
      case 'complete':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)', color: 'var(--on-secondary)' }}>
            <MaterialIcon name="check" size={18} />
          </div>
        );
      case 'error':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--error)', color: 'var(--on-error)' }}>
            <MaterialIcon name="close" size={18} />
          </div>
        );
      case 'skipped':
        return (
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-dashed" style={{ borderColor: 'var(--outline)', color: 'var(--outline)' }}>
            {step.stepIndex + 1}
          </div>
        );
    }
  };

  const getStatusLabel = (step: PipelineStepRun) => {
    switch (step.status) {
      case 'pending': return 'Waiting';
      case 'running': return 'Running...';
      case 'complete': return 'Complete';
      case 'error': return 'Failed';
      case 'skipped': return 'Skipped';
    }
  };

  if (layout === 'vertical') {
    return (
      <div className="space-y-3">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              {getStatusIcon(step)}
              {i < steps.length - 1 && (
                <div className="w-0.5 h-6 mt-1" style={{ background: step.status === 'complete' ? 'var(--secondary)' : 'rgba(255,255,255,0.1)' }} />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: step.status === 'running' ? 'var(--primary-fixed-dim)' : 'var(--on-surface)' }}>
                {step.label}
              </p>
              <p className="text-xs" style={{ color: step.status === 'error' ? 'var(--error)' : 'var(--outline)' }}>
                {getStatusLabel(step)}
              </p>
              {step.error && (
                <p className="text-xs mt-1 text-red-400">{step.error}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {steps.map((step, i) => (
        <div key={i} className="flex items-center gap-2 flex-shrink-0">
          <div className="flex flex-col items-center gap-1">
            {getStatusIcon(step)}
            <p className="text-[10px] font-medium truncate max-w-[80px]" style={{ color: step.status === 'running' ? 'var(--primary-fixed-dim)' : 'var(--outline)' }}>
              {step.label}
            </p>
            <p className="text-[9px]" style={{ color: step.status === 'error' ? 'var(--error)' : 'var(--outline)' }}>
              {getStatusLabel(step)}
            </p>
          </div>
          {i < steps.length - 1 && (
            <div className="w-6 h-0.5 flex-shrink-0" style={{ background: step.status === 'complete' ? 'var(--secondary)' : 'rgba(255,255,255,0.1)' }} />
          )}
        </div>
      ))}
    </div>
  );
}
