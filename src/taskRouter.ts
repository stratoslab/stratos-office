import { TaskType, TaskCategory, TaskConfig, OutputFormat } from './types';
import { getPrompt } from './prompts';

export const TASK_CONFIGS: Record<TaskType, TaskConfig> = {
  ocr: { taskType: 'ocr', category: 'documents', label: 'Document OCR', description: 'Extract all text from an image', icon: 'document_scanner', max_new_tokens: 512, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  document_parse: { taskType: 'document_parse', category: 'documents', label: 'Document Parse', description: 'Extract structured data from receipts/invoices', icon: 'receipt_long', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  handwriting: { taskType: 'handwriting', category: 'documents', label: 'Handwriting Transcription', description: 'Convert handwritten notes to typed text', icon: 'edit_note', max_new_tokens: 512, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  table_extract: { taskType: 'table_extract', category: 'documents', label: 'Table Extraction', description: 'Extract tables from images into structured format', icon: 'grid_on', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'table', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  form_extract: { taskType: 'form_extract', category: 'documents', label: 'Form Extraction', description: 'Extract form fields into structured JSON', icon: 'assignment', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  pdf_qa: { taskType: 'pdf_qa', category: 'documents', label: 'Multi-Page PDF Q&A', description: 'Ask questions about PDF content', icon: 'description', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'text', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  contract_analyzer: { taskType: 'contract_analyzer', category: 'documents', label: 'Contract Analyzer', description: 'Analyze contracts for risks and key clauses', icon: 'gavel', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: false, supportsWebcam: false, enableThinkingByDefault: true, supportsThinkingMode: true, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  redline_comparison: { taskType: 'redline_comparison', category: 'documents', label: 'Redline Comparison', description: 'Compare two document versions', icon: 'compare_arrows', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: true, supportsWebcam: false, enableThinkingByDefault: true, supportsThinkingMode: true, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  chart_extract: { taskType: 'chart_extract', category: 'visual', label: 'Chart Data Extraction', description: 'Extract data from charts and graphs', icon: 'bar_chart', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  screen_analysis: { taskType: 'screen_analysis', category: 'visual', label: 'Screen Analysis', description: 'Describe UI elements in screenshots', icon: 'web', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  wireframe_to_html: { taskType: 'wireframe_to_html', category: 'visual', label: 'Wireframe to HTML', description: 'Convert wireframes to working HTML/CSS', icon: 'code', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'html', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  slide_analyzer: { taskType: 'slide_analyzer', category: 'visual', label: 'Slide Analyzer', description: 'Generate speaker notes from slides', icon: 'slideshow', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  whiteboard_ocr: { taskType: 'whiteboard_ocr', category: 'visual', label: 'Whiteboard OCR', description: 'Convert whiteboard photos to notes', icon: 'whiteboard', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  object_detection: { taskType: 'object_detection', category: 'visual', label: 'Object Detection', description: 'Detect objects with bounding boxes', icon: 'center_focus_strong', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: false, requiresText: false, supportsWebcam: true, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  transcription: { taskType: 'transcription', category: 'audio', label: 'Meeting Transcription', description: 'Transcribe audio or video', icon: 'transcribe', max_new_tokens: 2048, requiresImage: false, requiresAudio: true, requiresPDF: false, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  meeting_minutes: { taskType: 'meeting_minutes', category: 'audio', label: 'Meeting Minutes', description: 'Generate structured minutes from audio/video', icon: 'note_add', max_new_tokens: 2048, requiresImage: false, requiresAudio: true, requiresPDF: false, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: true, requiresPrivacyNotice: false, requiresDisclaimer: false },
  voice_to_email: { taskType: 'voice_to_email', category: 'audio', label: 'Voice to Email', description: 'Speak or record video, get a polished email', icon: 'mail', max_new_tokens: 1024, requiresImage: false, requiresAudio: true, requiresPDF: false, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: true, requiresPrivacyNotice: false, requiresDisclaimer: false },
  multilingual_transcription: { taskType: 'multilingual_transcription', category: 'audio', label: 'Multilingual Transcription', description: 'Transcribe and translate audio/video', icon: 'translate', max_new_tokens: 2048, requiresImage: false, requiresAudio: true, requiresPDF: false, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  interview_transcriber: { taskType: 'interview_transcriber', category: 'audio', label: 'Interview Transcriber', description: 'Format interview audio as Q&A', icon: 'record_voice_over', max_new_tokens: 2048, requiresImage: false, requiresAudio: true, requiresPDF: false, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  email_draft: { taskType: 'email_draft', category: 'text', label: 'Email Drafting', description: 'Draft professional emails', icon: 'drafts', max_new_tokens: 1024, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  email_reply: { taskType: 'email_reply', category: 'text', label: 'Email Reply Drafts', description: 'Get three reply options with different tones', icon: 'reply_all', max_new_tokens: 1536, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  tone_rewriter: { taskType: 'tone_rewriter', category: 'text', label: 'Tone Rewriter', description: 'Rewrite text in a different tone', icon: 'format_color_text', max_new_tokens: 1024, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'text', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  summarize: { taskType: 'summarize', category: 'text', label: 'Summarization', description: 'Summarize content into bullet points', icon: 'summarize', max_new_tokens: 512, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  meeting_prep: { taskType: 'meeting_prep', category: 'text', label: 'Meeting Prep Brief', description: 'Generate meeting preparation brief', icon: 'event_note', max_new_tokens: 1024, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  report_generator: { taskType: 'report_generator', category: 'text', label: 'Report Generator', description: 'Turn notes into a formatted report', icon: 'article', max_new_tokens: 2048, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  code_review: { taskType: 'code_review', category: 'text', label: 'Code Review', description: 'Review code with suggestions', icon: 'code', max_new_tokens: 2048, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: true, supportsThinkingMode: true, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  general_text: { taskType: 'general_text', category: 'text', label: 'General Text', description: 'Free-form text input', icon: 'text_fields', max_new_tokens: 2048, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: true, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  research: { taskType: 'research', category: 'research', label: 'Web Research', description: 'Comprehensive answers from model knowledge', icon: 'search', max_new_tokens: 2048, requiresImage: false, requiresAudio: false, requiresPDF: false, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'markdown', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  deep_doc_qa: { taskType: 'deep_doc_qa', category: 'research', label: 'Deep Document Q&A', description: 'Ask questions about long documents', icon: 'find_in_page', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: true, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'text', twoPassPipeline: false, requiresPrivacyNotice: false, requiresDisclaimer: false },
  medical_summarizer: { taskType: 'medical_summarizer', category: 'privacy', label: 'Medical Summarizer', description: 'Plain-language medical summaries', icon: 'local_hospital', max_new_tokens: 1024, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: true, requiresDisclaimer: true, disclaimerText: 'This summary is AI-generated and not a substitute for professional medical advice.' },
  legal_analyzer: { taskType: 'legal_analyzer', category: 'privacy', label: 'Legal Document Analyzer', description: 'Key terms and risk flags for legal docs', icon: 'balance', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: false, supportsWebcam: false, enableThinkingByDefault: true, supportsThinkingMode: true, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: true, requiresDisclaimer: true, disclaimerText: 'This analysis is AI-generated and not legal advice. Consult a qualified attorney.' },
  financial_parser: { taskType: 'financial_parser', category: 'privacy', label: 'Financial Statement Parser', description: 'Structured financial data extraction', icon: 'account_balance', max_new_tokens: 2048, requiresImage: true, requiresAudio: false, requiresPDF: true, requiresText: false, supportsWebcam: false, enableThinkingByDefault: false, supportsThinkingMode: false, outputFormat: 'json', twoPassPipeline: false, requiresPrivacyNotice: true, requiresDisclaimer: true, disclaimerText: 'This data is AI-extracted and may contain errors. Verify against original documents.' },
};

export function getTaskConfig(taskType: TaskType): TaskConfig {
  return TASK_CONFIGS[taskType];
}

export function getTokenBudget(taskType: TaskType): number {
  return TASK_CONFIGS[taskType].max_new_tokens;
}

export function buildTaskMessages(
  taskType: TaskType,
  input: { text?: string; imageDataUrl?: string; audioData?: Float32Array; pdfText?: string; question?: string; tone?: string; language?: string },
  options?: { enableThinking?: boolean; passOneOutput?: string }
): Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> {
  const config = TASK_CONFIGS[taskType];
  const systemPrompt = getPrompt(taskType, { language: input.language, tone: input.tone, question: input.question });

  if (config.twoPassPipeline && options?.passOneOutput) {
    const messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> = [];
    if (systemPrompt) {
      messages.push({ role: 'system', content: systemPrompt });
    }
    messages.push({ role: 'user', content: `Transcript: ${options.passOneOutput}\n\nGenerate the structured output from this transcript.` });
    return messages;
  }

  const contentParts: Array<{ type: string; [key: string]: unknown }> = [];

  if (input.imageDataUrl && config.requiresImage) {
    contentParts.push({ type: 'image', image: input.imageDataUrl });
  }
  if (input.audioData) {
    contentParts.push({ type: 'audio', audio: Array.from(input.audioData) });
  }
  if (input.pdfText) {
    contentParts.push({ type: 'text', text: input.pdfText });
  }
  if (input.text && !input.pdfText) {
    contentParts.push({ type: 'text', text: input.text });
  }

  const messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }> = [];

  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }

  if (contentParts.length === 1 && contentParts[0].type === 'text') {
    messages.push({ role: 'user', content: contentParts[0].text as string });
  } else if (contentParts.length > 0) {
    messages.push({ role: 'user', content: contentParts });
  } else if (input.text) {
    messages.push({ role: 'user', content: input.text });
  }

  return messages;
}
