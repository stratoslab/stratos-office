export type ModelStage =
  | 'idle'
  | 'checking'
  | 'unsupported'
  | 'downloading'
  | 'loading'
  | 'ready'
  | 'error';

export interface ModelState {
  stage: ModelStage;
  progress: number;
  currentFile: string;
  totalFiles: number;
  completedFiles: number;
  estimatedTimeRemaining: string;
  error: string | null;
  tps: number | null;
  numTokens: number | null;
  isGenerating: boolean;
}

export type TaskType =
  | 'ocr'
  | 'document_parse'
  | 'handwriting'
  | 'table_extract'
  | 'form_extract'
  | 'pdf_qa'
  | 'contract_analyzer'
  | 'redline_comparison'
  | 'chart_extract'
  | 'screen_analysis'
  | 'wireframe_to_html'
  | 'slide_analyzer'
  | 'whiteboard_ocr'
  | 'object_detection'
  | 'transcription'
  | 'meeting_minutes'
  | 'voice_to_email'
  | 'multilingual_transcription'
  | 'interview_transcriber'
  | 'email_draft'
  | 'email_reply'
  | 'tone_rewriter'
  | 'summarize'
  | 'meeting_prep'
  | 'report_generator'
  | 'code_review'
  | 'general_text'
  | 'research'
  | 'deep_doc_qa'
  | 'medical_summarizer'
  | 'legal_analyzer'
  | 'financial_parser';

export type TaskCategory =
  | 'documents'
  | 'visual'
  | 'audio'
  | 'text'
  | 'research'
  | 'privacy';

export type OutputFormat = 'text' | 'markdown' | 'json' | 'html' | 'table';

export interface TaskConfig {
  taskType: TaskType;
  category: TaskCategory;
  label: string;
  description: string;
  icon: string;
  max_new_tokens: number;
  requiresImage: boolean;
  requiresAudio: boolean;
  requiresPDF: boolean;
  requiresText: boolean;
  supportsWebcam: boolean;
  enableThinkingByDefault: boolean;
  supportsThinkingMode: boolean;
  outputFormat: OutputFormat;
  twoPassPipeline: boolean;
  requiresPrivacyNotice: boolean;
  requiresDisclaimer: boolean;
  disclaimerText?: string;
}

export type TaskLifecycle = 'idle' | 'submitting' | 'generating' | 'complete' | 'error';

export interface TaskEntry {
  id: string;
  type: TaskType;
  category: TaskCategory;
  inputSummary: string;
  output: string;
  parsedOutput?: unknown;
  status: 'complete' | 'error' | 'cancelled';
  timestamp: string;
  durationMs: number;
  tokenCount: number | null;
  tps: number | null;
}

export interface AppSettings {
  offlineMode: boolean;
  thinkingModeDefault: boolean;
  theme: 'dark' | 'light';
}

export const DEFAULT_SETTINGS: AppSettings = {
  offlineMode: false,
  thinkingModeDefault: false,
  theme: 'dark',
};

export interface ParseError {
  error: 'parse_failed';
  raw: string;
}

export function isParseError(v: unknown): v is ParseError {
  return typeof v === 'object' && v !== null && (v as ParseError).error === 'parse_failed';
}

export interface DocumentParseResult {
  vendor: string | null;
  date: string | null;
  total: number | null;
  currency: string | null;
  line_items: Array<{ description: string; quantity: number | null; unit_price: number | null; total: number | null }>;
  tax: number | null;
}

export interface ContractAnalysisResult {
  summary: string;
  key_clauses: Array<{ clause_title: string; text: string; page: number | null }>;
  flagged_terms: Array<{ term: string; risk_level: 'low' | 'medium' | 'high'; explanation: string }>;
  overall_risk: 'low' | 'medium' | 'high';
}

export interface RedlineResult {
  additions: string[];
  deletions: string[];
  modifications: Array<{ original: string; revised: string; commentary: string }>;
  summary: string;
}

export interface ChartExtractResult {
  chart_type: string;
  title: string | null;
  x_axis: { label: string; unit: string | null };
  y_axis: { label: string; unit: string | null };
  series: Array<{ name: string; data_points: Array<{ x: string | number; y: string | number }> }>;
  trends: string[];
}

export interface ScreenAnalysisResult {
  page_title: string | null;
  layout_description: string;
  elements: Array<{ type: string; label: string; position_description: string; action: string | null }>;
}

export interface SlideAnalysisResult {
  slide_title: string;
  key_points: string[];
  speaker_notes: string;
  summary: string;
}

export interface ObjectDetectionResult {
  label: string;
  confidence: string;
  bbox: { x_min: number; y_min: number; x_max: number; y_max: number };
}

export interface MeetingMinutesResult {
  meeting_title: string;
  date: string | null;
  attendees: string[] | null;
  agenda_items: string[];
  discussion_summary: string;
  decisions: string[];
  action_items: Array<{ owner: string; task: string; due_date: string | null }>;
}

export interface EmailDraftResult {
  subject: string;
  to: string | null;
  body: string;
  tone: string;
}

export interface EmailReplyResult {
  tone: string;
  subject: string;
  body: string;
}

export interface MeetingPrepResult {
  meeting_context: string;
  key_talking_points: string[];
  questions_to_ask: string[];
  background_notes: string;
}

export interface CodeReviewResult {
  language: string;
  overall_assessment: string;
  issues: Array<{ severity: 'critical' | 'warning' | 'suggestion'; line_reference: string | null; description: string; suggested_fix: string }>;
  positive_aspects: string[];
}

export interface ResearchResult {
  answer: string;
  sources: Array<{ title: string; url: string; snippet: string }>;
  confidence: 'high' | 'medium' | 'low';
}

export interface MultilingualTranscriptionResult {
  detected_language: string;
  original_transcript: string;
  english_translation: string;
}

export interface MedicalSummaryResult {
  document_type: string;
  summary: string;
  key_findings: string[];
  values_out_of_range: Array<{ test: string; value: string; normal_range: string }>;
  disclaimer: string;
}

export interface LegalAnalysisResult {
  document_type: string;
  parties: string[];
  key_terms: Array<{ term: string; description: string }>;
  obligations: string[];
  risk_flags: Array<{ flag: string; severity: 'low' | 'medium' | 'high'; explanation: string }>;
  disclaimer: string;
}

export interface FinancialParserResult {
  document_type: string;
  period: string;
  account_holder: string | null;
  opening_balance: number | null;
  closing_balance: number | null;
  transactions: Array<{ date: string; description: string; amount: number; type: 'credit' | 'debit' }>;
  total_credits: number;
  total_debits: number;
  disclaimer: string;
}

export interface WorkerMessage {
  type: 'check' | 'load' | 'generate' | 'task' | 'cancel_task' | 'interrupt' | 'reset';
  data?: unknown;
}

export interface TaskWorkerMessage {
  type: 'task';
  data: {
    taskId: string;
    taskType: TaskType;
    messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>;
    enableThinking: boolean;
    maxNewTokens: number;
    pass: 1 | 2;
    passOneOutput?: string;
  };
}

export interface WorkerResponse {
  status: 'check' | 'loading' | 'init' | 'progress' | 'ready' |
          'start' | 'update' | 'complete' | 'error' |
          'task_start' | 'task_update' | 'task_complete' | 'task_error';
  data?: unknown;
  progress?: number;
  output?: string;
  numTokens?: number;
  tps?: number;
  taskId?: string;
  supported?: boolean;
}
