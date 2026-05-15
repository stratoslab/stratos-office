import { TaskType } from '../types';
import * as documents from './documents';
import * as visual from './visual';
import * as audio from './audio';
import * as text from './text';
import * as research from './research';
import * as privacy from './privacy';

const promptMap: Record<string, string | ((options?: { language?: string; tone?: string; question?: string }) => string)> = {
  ocr: documents.ocr,
  document_parse: documents.document_parse,
  handwriting: documents.handwriting,
  table_extract: documents.table_extract,
  form_extract: documents.form_extract,
  pdf_qa: (opts) => documents.pdf_qa.replace('{question}', opts?.question ?? ''),
  contract_analyzer: documents.contract_analyzer,
  redline_comparison: documents.redline_comparison,
  chart_extract: visual.chart_extract,
  screen_analysis: visual.screen_analysis,
  wireframe_to_html: visual.wireframe_to_html,
  slide_analyzer: visual.slide_analyzer,
  whiteboard_ocr: visual.whiteboard_ocr,
  object_detection: visual.object_detection,
  transcription: audio.transcription,
  meeting_minutes: audio.meeting_minutes,
  voice_to_email: audio.voice_to_email,
  multilingual_transcription: (opts) => {
    let prompt = audio.multilingual_transcription;
    if (opts?.language) {
      prompt += `\n\nThe audio is in ${opts.language}.`;
    }
    return prompt;
  },
  interview_transcriber: audio.interview_transcriber,
  email_draft: text.email_draft,
  email_reply: text.email_reply,
  tone_rewriter: (opts) => text.tone_rewriter.replace('{tone}', opts?.tone ?? 'professional'),
  summarize: text.summarize,
  meeting_prep: text.meeting_prep,
  report_generator: text.report_generator,
  code_review: text.code_review,
  general_text: text.general_text,
  research: research.research,
  deep_doc_qa: (opts) => research.deep_doc_qa.replace('{question}', opts?.question ?? ''),
  medical_summarizer: privacy.medical_summarizer,
  legal_analyzer: privacy.legal_analyzer,
  financial_parser: privacy.financial_parser,
};

export function getPrompt(taskType: TaskType, options?: { language?: string; tone?: string; question?: string }): string {
  if (!(taskType in promptMap)) {
    throw new Error(`Unknown task type: ${taskType}`);
  }
  const entry = promptMap[taskType];
  if (typeof entry === 'function') {
    return entry(options);
  }
  return entry;
}
