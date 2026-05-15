import { TaskType } from './types';

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp']);
const AUDIO_MIMES = new Set(['audio/webm', 'audio/wav', 'audio/mp3', 'audio/ogg', 'audio/m4a', 'audio/mpeg']);
const PDF_MIMES = new Set(['application/pdf']);
const TEXT_MIMES = new Set(['text/plain', 'text/markdown', 'text/html', 'text/csv']);

const MAX_SIZE = 50 * 1024 * 1024;

function getAcceptedMimes(taskType: TaskType): Set<string> {
  switch (taskType) {
    case 'ocr':
    case 'document_parse':
    case 'handwriting':
    case 'table_extract':
    case 'form_extract':
    case 'chart_extract':
    case 'screen_analysis':
    case 'wireframe_to_html':
    case 'slide_analyzer':
    case 'whiteboard_ocr':
    case 'object_detection':
    case 'medical_summarizer':
    case 'legal_analyzer':
    case 'financial_parser':
      return IMAGE_MIMES;
    case 'transcription':
    case 'meeting_minutes':
    case 'voice_to_email':
    case 'multilingual_transcription':
    case 'interview_transcriber':
      return AUDIO_MIMES;
    case 'pdf_qa':
    case 'contract_analyzer':
    case 'redline_comparison':
    case 'deep_doc_qa':
      return new Set([...IMAGE_MIMES, ...PDF_MIMES, ...TEXT_MIMES]);
    case 'email_draft':
    case 'email_reply':
    case 'tone_rewriter':
    case 'summarize':
    case 'meeting_prep':
    case 'report_generator':
    case 'code_review':
    case 'general_text':
    case 'research':
      return TEXT_MIMES;
    default:
      return new Set();
  }
}

function getMimeLabel(mimes: Set<string>): string {
  if (mimes === IMAGE_MIMES) return 'PNG, JPG, JPEG, WebP, GIF, BMP';
  if (mimes === AUDIO_MIMES) return 'WebM, WAV, MP3, OGG, M4A';
  if (mimes === PDF_MIMES) return 'PDF';
  if (mimes === TEXT_MIMES) return 'TXT, Markdown, HTML, CSV';
  return Array.from(mimes).join(', ');
}

export function validate(file: File, taskType: TaskType): { accepted: boolean; error?: string } {
  if (file.size > MAX_SIZE) {
    return { accepted: false, error: 'File exceeds the 50 MB maximum size' };
  }

  const accepted = getAcceptedMimes(taskType);
  if (accepted.size === 0 || !accepted.has(file.type)) {
    return { accepted: false, error: `Unsupported file type. Accepted formats: ${getMimeLabel(accepted)}` };
  }

  return { accepted: true };
}

export function readAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function generatePreview(file: File): Promise<string | null> {
  if (IMAGE_MIMES.has(file.type)) {
    return readAsDataURL(file);
  }
  return null;
}

export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

export async function extractPDFText(
  file: File,
  pageRange?: { start: number; end: number }
): Promise<{ text: string; pageCount: number }> {
  const pdfjsLib = await import('pdfjs-dist');
  const pdfjsWorker = await import('pdfjs-dist/build/pdf.worker.mjs');
  pdfjsLib.GlobalWorkerOptions.workerPort = new pdfjsWorker.WorkerMessagePort();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const pageCount = pdf.numPages;

  const start = pageRange?.start ?? 1;
  const end = pageRange?.end ?? pageCount;

  let text = '';
  for (let i = start; i <= end; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => item.str)
      .join(' ');
    text += pageText + '\n';
  }

  return { text, pageCount };
}
