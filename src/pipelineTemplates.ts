import { PipelineTemplate } from './types';

export const BUILTIN_PIPELINES: PipelineTemplate[] = [
  {
    id: 'due-diligence',
    name: 'Due Diligence Engine',
    description: 'Analyze financial statements, contracts, and legal exposure to produce an investment memo.',
    icon: 'account_balance',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'pdf', label: 'Financial statements' },
      { type: 'pdf', label: 'Contracts' },
    ],
    steps: [
      { taskType: 'financial_parser', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Extract Financial Data' },
      { taskType: 'contract_analyzer', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Analyze Contracts' },
      { taskType: 'legal_analyzer', inputMapping: { type: 'combined', fields: ['text', 'pdfText'] }, label: 'Assess Legal Risk' },
      { taskType: 'report_generator', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Generate Investment Memo' },
    ],
  },
  {
    id: 'meeting-intelligence',
    name: 'Meeting Intelligence',
    description: 'Transcribe meetings, generate minutes, draft follow-up emails, and prep for the next meeting.',
    icon: 'groups',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'audio', label: 'Meeting recording' },
    ],
    steps: [
      { taskType: 'transcription', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Transcribe Audio' },
      { taskType: 'meeting_minutes', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Generate Minutes' },
      { taskType: 'email_draft', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Draft Follow-Up Emails' },
      { taskType: 'meeting_prep', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Prep Next Meeting' },
    ],
  },
  {
    id: 'product-discovery',
    name: 'Product Discovery Sprint',
    description: 'Convert whiteboard sketches to HTML, analyze competitor screens, and generate a PRD.',
    icon: 'lightbulb',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'image', label: 'Whiteboard photos' },
      { type: 'image', label: 'Competitor screenshots' },
    ],
    steps: [
      { taskType: 'whiteboard_ocr', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Extract Whiteboard Notes' },
      { taskType: 'wireframe_to_html', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Convert to HTML' },
      { taskType: 'screen_analysis', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Analyze Screens' },
      { taskType: 'report_generator', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Generate PRD' },
    ],
  },
  {
    id: 'compliance-auditor',
    name: 'Compliance Auditor',
    description: 'Analyze contracts, flag legal risks, summarize medical records, and produce compliance reports.',
    icon: 'verified_user',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'pdf', label: 'Contracts' },
      { type: 'pdf', label: 'Medical records' },
    ],
    steps: [
      { taskType: 'contract_analyzer', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Analyze Contracts' },
      { taskType: 'legal_analyzer', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Flag Legal Risks' },
      { taskType: 'medical_summarizer', inputMapping: { type: 'combined', fields: ['text', 'pdfText'] }, label: 'Summarize Medical Records' },
      { taskType: 'report_generator', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Generate Compliance Report' },
    ],
  },
  {
    id: 'research-synthesis',
    name: 'Research Synthesis',
    description: 'Search the web, analyze research papers, extract chart data, and synthesize a cited report.',
    icon: 'search',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'text', label: 'Research question' },
      { type: 'pdf', label: 'Research papers (optional)' },
    ],
    steps: [
      { taskType: 'research', inputMapping: { type: 'text', field: 'text' }, label: 'Web Research' },
      { taskType: 'deep_doc_qa', inputMapping: { type: 'combined', fields: ['text', 'pdfText'] }, label: 'Analyze Papers' },
      { taskType: 'chart_extract', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Extract Chart Data' },
      { taskType: 'report_generator', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Synthesize Report' },
    ],
  },
  {
    id: 'negotiation-prep',
    name: 'Negotiation Prep',
    description: 'Analyze contracts, transcribe past calls, draft counter-proposals in multiple tones.',
    icon: 'handshake',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'pdf', label: 'Contract' },
      { type: 'audio', label: 'Past negotiation calls' },
    ],
    steps: [
      { taskType: 'contract_analyzer', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Analyze Contract' },
      { taskType: 'transcription', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Transcribe Calls' },
      { taskType: 'tone_rewriter', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Rewrite Counter-Proposals' },
      { taskType: 'email_draft', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Draft Follow-Up Emails' },
    ],
  },
  {
    id: 'incident-response',
    name: 'Incident Response',
    description: 'Analyze error screenshots, review relevant code, generate post-mortem, and draft stakeholder comms.',
    icon: 'bug_report',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'image', label: 'Error screenshots' },
      { type: 'text', label: 'Relevant code' },
    ],
    steps: [
      { taskType: 'screen_analysis', inputMapping: { type: 'file', field: 'imageDataUrl' }, label: 'Analyze Error Screenshots' },
      { taskType: 'code_review', inputMapping: { type: 'text', field: 'text' }, label: 'Review Code' },
      { taskType: 'report_generator', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Generate Post-Mortem' },
      { taskType: 'email_draft', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Draft Stakeholder Comms' },
    ],
  },
  {
    id: 'customer-intelligence',
    name: 'Customer Intelligence',
    description: 'Transcribe support calls, summarize pain points, and draft customer replies.',
    icon: 'support_agent',
    category: 'pipeline',
    isBuiltIn: true,
    expectedInputs: [
      { type: 'audio', label: 'Support call recordings' },
    ],
    steps: [
      { taskType: 'transcription', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Transcribe Calls' },
      { taskType: 'summarize', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Summarize Pain Points' },
      { taskType: 'tone_rewriter', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Adapt Response Tone' },
      { taskType: 'email_reply', inputMapping: { type: 'raw_output', field: 'text' }, label: 'Draft Customer Replies' },
    ],
  },
];

export function getPipelineTemplate(id: string): PipelineTemplate | undefined {
  return BUILTIN_PIPELINES.find(t => t.id === id);
}

export function getAllPipelineTemplates(): PipelineTemplate[] {
  return BUILTIN_PIPELINES;
}
