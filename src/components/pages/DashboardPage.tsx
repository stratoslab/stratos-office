import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import MaterialIcon from '../ui/MaterialIcon';
import Toast from '../ui/Toast';
import { useTask } from '../../context/TaskContext';
import { usePipeline } from '../../context/PipelineContext';
import { TASK_CONFIGS } from '../../taskRouter';
import { getAllPipelineTemplates, getPipelineTemplate } from '../../pipelineTemplates';
import DocumentsWorkspace from '../tasks/DocumentsWorkspace';
import VisualWorkspace from '../tasks/VisualWorkspace';
import AudioWorkspace from '../tasks/AudioWorkspace';
import TextWorkspace from '../tasks/TextWorkspace';
import ResearchWorkspace from '../tasks/ResearchWorkspace';
import PrivacyWorkspace from '../tasks/PrivacyWorkspace';
import PipelineSelector from '../pipelines/PipelineSelector';
import DueDiligenceWorkspace from '../pipelines/DueDiligenceWorkspace';
import MeetingIntelligenceWorkspace from '../pipelines/MeetingIntelligenceWorkspace';
import ProductDiscoveryWorkspace from '../pipelines/ProductDiscoveryWorkspace';
import ComplianceAuditorWorkspace from '../pipelines/ComplianceAuditorWorkspace';
import ResearchSynthesisWorkspace from '../pipelines/ResearchSynthesisWorkspace';
import NegotiationPrepWorkspace from '../pipelines/NegotiationPrepWorkspace';
import IncidentResponseWorkspace from '../pipelines/IncidentResponseWorkspace';
import CustomerIntelligenceWorkspace from '../pipelines/CustomerIntelligenceWorkspace';

const quickStartTasks: Array<{ taskType: keyof typeof TASK_CONFIGS; icon: string; title: string; description: string; tags: string[] }> = [
  { taskType: 'ocr', icon: 'document_scanner', title: 'Document OCR', description: 'Extract all text from images and scans.', tags: ['Documents', 'OCR'] },
  { taskType: 'document_parse', icon: 'receipt_long', title: 'Receipt Parser', description: 'Extract structured data from receipts and invoices.', tags: ['Documents', 'Financial'] },
  { taskType: 'transcription', icon: 'transcribe', title: 'Meeting Transcription', description: 'Transcribe audio or video to text.', tags: ['Audio', 'Video', 'Live'] },
  { taskType: 'email_draft', icon: 'mail', title: 'Email Draft', description: 'Compose professional emails from descriptions.', tags: ['Text', 'NLP'] },
  { taskType: 'chart_extract', icon: 'monitoring', title: 'Chart Extract', description: 'Extract data from chart and graph images.', tags: ['Visual', 'Data'] },
  { taskType: 'research', icon: 'search', title: 'Web Research', description: 'Comprehensive answers from model knowledge.', tags: ['Research', 'AI'] },
  { taskType: 'contract_analyzer', icon: 'gavel', title: 'Contract Analyzer', description: 'Analyze contracts for risks and key clauses.', tags: ['Documents', 'Legal'] },
  { taskType: 'code_review', icon: 'code', title: 'Code Review', description: 'Review code with severity-rated suggestions.', tags: ['Text', 'Dev'] },
  { taskType: 'medical_summarizer', icon: 'local_hospital', title: 'Medical Summarizer', description: 'Plain-language summaries of medical records.', tags: ['Privacy', 'Health'] },
];

export default function DashboardPage() {
  const { activeTask, selectTask } = useTask();
  const { activeTemplate, loadTemplate, resetPipeline } = usePipeline();
  const [showPipelineSelector, setShowPipelineSelector] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const handleSelectPipeline = (template: Parameters<typeof loadTemplate>[0]) => {
    loadTemplate(template);
    setShowPipelineSelector(false);
  };

  const handleCreateCustom = () => {
    setShowPipelineSelector(false);
    setToast({ message: 'Custom pipeline builder coming soon', type: 'info' });
  };

  if (activeTemplate && !showPipelineSelector) {
    switch (activeTemplate.id) {
      case 'due-diligence': return <DueDiligenceWorkspace template={activeTemplate} />;
      case 'meeting-intelligence': return <MeetingIntelligenceWorkspace template={activeTemplate} />;
      case 'product-discovery': return <ProductDiscoveryWorkspace template={activeTemplate} />;
      case 'compliance-auditor': return <ComplianceAuditorWorkspace template={activeTemplate} />;
      case 'research-synthesis': return <ResearchSynthesisWorkspace template={activeTemplate} />;
      case 'negotiation-prep': return <NegotiationPrepWorkspace template={activeTemplate} />;
      case 'incident-response': return <IncidentResponseWorkspace template={activeTemplate} />;
      case 'customer-intelligence': return <CustomerIntelligenceWorkspace template={activeTemplate} />;
      default: return null;
    }
  }

  if (showPipelineSelector) {
    return (
      <PipelineSelector
        templates={getAllPipelineTemplates()}
        onSelect={handleSelectPipeline}
        onCreateCustom={handleCreateCustom}
      />
    );
  }

  if (activeTask) {
    const config = TASK_CONFIGS[activeTask];
    if (!config) return null;

    switch (config.category) {
      case 'documents': return <DocumentsWorkspace taskType={activeTask} />;
      case 'visual': return <VisualWorkspace taskType={activeTask} />;
      case 'audio': return <AudioWorkspace taskType={activeTask} />;
      case 'text': return <TextWorkspace taskType={activeTask} />;
      case 'research': return <ResearchWorkspace taskType={activeTask} />;
      case 'privacy': return <PrivacyWorkspace taskType={activeTask} />;
      default: return null;
    }
  }

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
          Welcome back, Strategist
        </h1>
        <p className="text-sm md:text-base" style={{ color: 'var(--on-surface-variant)' }}>
          Your AI workspace is primed and ready — 30+ tasks across 6 categories.
        </p>
      </header>

      {/* Quick start cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-10">
        {quickStartTasks.map(card => (
          <div
            key={card.taskType}
            className="glass-panel rounded-2xl p-4 md:p-6 group cursor-pointer transition-all duration-300 relative overflow-hidden"
            style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            onClick={() => selectTask(card.taskType)}
            onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(0, 212, 255, 0.5)')}
            onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)')}
          >
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <div
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center"
                style={{ background: 'var(--surface-container-highest)', color: 'var(--primary-fixed-dim)' }}
              >
                <MaterialIcon name={card.icon} size={20} />
              </div>
              <MaterialIcon name="north_east" size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--outline)' }} />
            </div>
            <h3 className="text-base md:text-xl font-bold mb-1" style={{ color: 'var(--on-surface)' }}>{card.title}</h3>
            <p className="text-xs md:text-sm mb-4 md:mb-6" style={{ color: 'var(--outline)' }}>{card.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              {card.tags.map(tag => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-full text-[10px] font-bold"
                  style={{ background: 'rgba(0, 229, 204, 0.1)', color: 'var(--secondary)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* All tasks by category */}
      <section className="mb-6 md:mb-10">
        <div className="flex items-center gap-3 mb-3 md:mb-4">
          <MaterialIcon name="account_tree" size={18} style={{ color: 'var(--primary-fixed-dim)' }} />
          <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--on-surface)' }}>Pipelines</h2>
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--outline)' }}>{getAllPipelineTemplates().length} templates</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
          <button
            onClick={() => setShowPipelineSelector(true)}
            className="glass-panel rounded-xl p-3 md:p-4 text-left hover:border-[#00D4FF]/50 transition-colors group min-h-[44px] border-dashed"
            style={{ borderColor: 'rgba(0, 212, 255, 0.2)', borderWidth: '2px' }}
          >
            <MaterialIcon name="add" size={18} className="mb-1 md:mb-2 group-hover:text-[#00D4FF] transition-colors" style={{ color: 'var(--primary-fixed-dim)' }} />
            <p className="text-[11px] md:text-xs font-medium" style={{ color: 'var(--primary-fixed-dim)' }}>Browse Pipelines</p>
          </button>
          {getAllPipelineTemplates().slice(0, 5).map(pipeline => (
            <button
              key={pipeline.id}
              onClick={() => handleSelectPipeline(pipeline)}
              className="glass-panel rounded-xl p-3 md:p-4 text-left hover:border-[#00D4FF]/50 transition-colors group min-h-[44px]"
              style={{ borderColor: 'rgba(255,255,255,0.05)' }}
            >
              <MaterialIcon name={pipeline.icon} size={18} className="mb-1 md:mb-2 group-hover:text-[#00D4FF] transition-colors" style={{ color: 'var(--on-surface-variant)' }} />
              <p className="text-[11px] md:text-xs font-medium" style={{ color: 'var(--on-surface)' }}>{pipeline.name}</p>
            </button>
          ))}
        </div>
      </section>

      {(['documents', 'visual', 'audio', 'text', 'research', 'privacy'] as const).map(category => {
        const tasks = Object.values(TASK_CONFIGS).filter(t => t.category === category);
        const catInfo = {
          documents: { label: 'Documents', icon: 'description' },
          visual: { label: 'Visual', icon: 'image' },
          audio: { label: 'Audio', icon: 'mic' },
          text: { label: 'Text & Writing', icon: 'edit_note' },
          research: { label: 'Research', icon: 'search' },
          privacy: { label: 'Privacy-First', icon: 'verified_user' },
        }[category];

        return (
          <section key={category} className="mb-6 md:mb-10">
            <div className="flex items-center gap-3 mb-3 md:mb-4">
              <MaterialIcon name={catInfo.icon} size={18} style={{ color: 'var(--primary-fixed-dim)' }} />
              <h2 className="text-base md:text-lg font-bold" style={{ color: 'var(--on-surface)' }}>{catInfo.label}</h2>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--outline)' }}>{tasks.length} tasks</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 md:gap-3">
              {tasks.map(task => (
                <button
                  key={task.taskType}
                  onClick={() => selectTask(task.taskType)}
                  className="glass-panel rounded-xl p-3 md:p-4 text-left hover:border-[#00D4FF]/50 transition-colors group min-h-[44px]"
                  style={{ borderColor: 'rgba(255,255,255,0.05)' }}
                >
                  <MaterialIcon name={task.icon} size={18} className="mb-1 md:mb-2 group-hover:text-[#00D4FF] transition-colors" style={{ color: 'var(--on-surface-variant)' }} />
                  <p className="text-[11px] md:text-xs font-medium" style={{ color: 'var(--on-surface)' }}>{task.label}</p>
                </button>
              ))}
            </div>
          </section>
        );
      })}
      <AnimatePresence>
        {toast && <Toast message={toast.message} type={toast.type} onDismiss={() => setToast(null)} />}
      </AnimatePresence>
    </motion.div>
  );
}
