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
  | 'chart_extract'
  | 'table_extract'
  | 'form_extract'
  | 'screen_analysis'
  | 'transcription'
  | 'voice_command'
  | 'research'
  | 'email_draft'
  | 'summarize'
  | 'text_task';

export interface TaskConfig {
  max_new_tokens: number;
  requiresImage: boolean;
  requiresAudio: boolean;
}

export interface TaskEntry {
  id: string;
  type: TaskType;
  input: string | null;
  output: string | null;
  status: 'running' | 'complete' | 'error' | 'cancelled';
  timestamp: string;
  duration: number | null;
}

export interface WorkerMessage {
  type: string;
  data?: unknown;
}

export interface WorkerResponse {
  status: string;
  data?: unknown;
  progress?: number;
  output?: string;
  numTokens?: number;
  tps?: number;
}
