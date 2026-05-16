import { TaskType } from './types';

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp']);
const AUDIO_MIMES = new Set([
  'audio/webm', 'audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/mpeg',
  'audio/ogg', 'audio/opus', 'audio/x-m4a', 'audio/m4a', 'audio/mp4',
  'audio/aac', 'audio/x-aac', 'audio/flac', 'audio/x-flac',
]);
const VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
  'video/x-msvideo', 'video/x-matroska', 'video/avi',
]);
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
      return new Set([...AUDIO_MIMES, ...VIDEO_MIMES]);
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
  if (mimes === AUDIO_MIMES) return 'WebM, WAV, MP3, OGG, M4A, AAC, FLAC';
  if (mimes === PDF_MIMES) return 'PDF';
  if (mimes === TEXT_MIMES) return 'TXT, Markdown, HTML, CSV';
  // Audio + video combined
  if ([...AUDIO_MIMES, ...VIDEO_MIMES].every(m => mimes.has(m))) {
    return 'Audio: WebM, WAV, MP3, OGG, M4A, AAC, FLAC | Video: MP4, WebM, MOV, AVI, MKV';
  }
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

/**
 * Extract audio from a video or audio file as a 16kHz mono Float32Array.
 * Uses the browser's AudioContext to decode any format the browser supports
 * (MP4, WebM, MOV, AVI, WAV, MP3, M4A, etc.) and resamples to 16kHz mono.
 */
export async function extractAudio(file: File): Promise<Float32Array> {
  const arrayBuffer = await file.arrayBuffer();
  const audioCtx = new AudioContext({ sampleRate: 16000 });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    // Convert to mono: average all channels
    let pcm: Float32Array;
    if (audioBuffer.numberOfChannels === 1) {
      pcm = audioBuffer.getChannelData(0);
    } else {
      const length = audioBuffer.length;
      pcm = new Float32Array(length);
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const channelData = audioBuffer.getChannelData(ch);
        for (let i = 0; i < length; i++) {
          pcm[i] += channelData[i] / audioBuffer.numberOfChannels;
        }
      }
    }
    return pcm;
  } finally {
    await audioCtx.close();
  }
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
