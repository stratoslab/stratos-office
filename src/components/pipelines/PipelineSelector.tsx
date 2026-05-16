import { motion } from 'motion/react';
import MaterialIcon from '../ui/MaterialIcon';
import { PipelineTemplate } from '../../types';

interface PipelineSelectorProps {
  templates: PipelineTemplate[];
  onSelect: (template: PipelineTemplate) => void;
  onCreateCustom: () => void;
}

export default function PipelineSelector({ templates, onSelect, onCreateCustom }: PipelineSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-10 relative pb-16 md:pb-28"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full -z-10 pointer-events-none"
        style={{ background: 'rgba(168, 232, 255, 0.05)', filter: 'blur(120px)' }}
      />

      <header className="mb-6 md:mb-10">
        <h1 className="text-2xl md:text-3xl font-bold mb-1" style={{ color: 'var(--on-surface)' }}>
          Pipeline Templates
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--on-surface-variant)' }}>
          Chain multiple AI tasks into powerful workflows. Run complex analyses with a single click.
        </p>
      </header>

      <button
        onClick={onCreateCustom}
        className="w-full glass-panel rounded-2xl p-4 md:p-6 mb-6 md:mb-10 text-left transition-all duration-300 border-dashed min-h-[44px]"
        style={{ borderColor: 'rgba(0, 212, 255, 0.3)', borderWidth: '2px' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(0, 212, 255, 0.1)', color: 'var(--primary-fixed-dim)' }}
          >
            <MaterialIcon name="add" size={24} />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-bold" style={{ color: 'var(--primary-fixed-dim)' }}>Create Custom Pipeline</h3>
            <p className="text-xs md:text-sm" style={{ color: 'var(--outline)' }}>Build your own workflow from 30+ AI tasks</p>
          </div>
        </div>
      </button>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {templates.map(template => (
          <div
            key={template.id}
            className="glass-panel rounded-2xl p-4 md:p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => onSelect(template)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--surface-container-highest)', color: 'var(--primary-fixed-dim)' }}
              >
                <MaterialIcon name={template.icon} size={20} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded-full" style={{ background: 'rgba(0, 229, 204, 0.1)', color: 'var(--secondary)' }}>
                  {template.steps.length} steps
                </span>
                <MaterialIcon name="north_east" size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--outline)' }} />
              </div>
            </div>
            <h3 className="text-base md:text-xl font-bold mb-1" style={{ color: 'var(--on-surface)' }}>{template.name}</h3>
            <p className="text-xs md:text-sm mb-4 md:mb-6" style={{ color: 'var(--outline)' }}>{template.description}</p>
            <div className="space-y-1">
              {template.steps.map((step, i) => (
                <div key={i} className="flex items-center gap-2 text-[10px]" style={{ color: 'var(--on-surface-variant)' }}>
                  <span className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
                    {i + 1}
                  </span>
                  <span className="truncate">{step.label ?? step.taskType}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
