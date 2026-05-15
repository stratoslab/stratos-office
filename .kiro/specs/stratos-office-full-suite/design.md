# Design Document: Stratos Office Full Suite

## Overview

Stratos Office Full Suite transforms the existing shell application into a fully functional, production-quality AI office assistant. The existing codebase provides a working model loading pipeline (Web Worker + Transformers.js + WebGPU), a React/TypeScript/Tailwind/Framer Motion UI shell, and basic layout components. This design extends those foundations into 30+ task types across five categories, with a complete task routing system, streaming output, history persistence, and a polished responsive UI.

All inference runs entirely in the browser. No user data leaves the device except when the Research task explicitly calls the MCP search/fetch tools, which the user can disable via Offline Mode.

### Key Design Decisions

1. **Additive extension, not rewrite.** The existing `ModelContext`, `worker.js`, and layout components are preserved and extended. New context (`TaskContext`) is layered on top.
2. **Worker owns all inference.** The main thread never calls Transformers.js directly. All task routing, prompt assembly, and generation happen inside the worker.
3. **Output_Parser is a pure module.** No browser APIs, no side effects — fully unit-testable in Node.js.
4. **IndexedDB for history, localStorage for settings.** IndexedDB handles the 200-entry task history (binary-safe, larger quota). localStorage handles the small settings object.
5. **MCP is optional.** The Research pipeline degrades gracefully when offline mode is on or when MCP calls fail.
6. **Two-pass pipeline for audio tasks.** Meeting Minutes and Voice-to-Email transcribe first, then generate structured output in a second worker call.
7. **Icon system: Material Symbols Outlined.** The requirements doc (Req 1.5) references Lucide icons, but the existing codebase has already migrated to Google Material Symbols Outlined (see `DESIGN_ALIGNMENT_PLAN.md`). All icon references in this design use Material Symbols icon names. This is a documented deviation from Req 1.5.

### New External Dependencies

| Dependency | Version | Purpose |
|---|---|---|
| `pdfjs-dist` | ^4.x | PDF text layer extraction and page rendering for Multi-Page PDF Q&A (Req 11), Contract Analyzer (Req 12), Redline Comparison (Req 13), and Privacy tasks (Req 35-37). Loaded via `pdfjsLib.getDocument()` in `fileHandler.ts`. |
| `react-markdown` + `remark-gfm` | latest | Markdown rendering in `MarkdownRenderer.tsx` for streaming output (Req 3). |
| `prismjs` or `highlight.js` | latest | Syntax highlighting for code blocks in `MarkdownRenderer.tsx` and `JsonTreeView.tsx`. |

---

## Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser Main Thread                         │
│                                                                       │
│  ┌──────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  ModelContext │  │              TaskContext                      │  │
│  │  (existing)   │  │  activeTask, taskInput, streamingOutput,     │  │
│  │  stage, tps,  │  │  taskHistory, taskLifecycle state machine    │  │
│  │  isGenerating │  └──────────────────┬───────────────────────────┘  │
│  └──────┬────────┘                     │                              │
│         │                             │                              │
│  ┌──────▼─────────────────────────────▼───────────────────────────┐  │
│  │                        App.tsx                                   │  │
│  │  ┌──────────┐  ┌──────────────────────────────────────────────┐ │  │
│  │  │ Sidebar  │  │              TaskWorkspace                    │ │  │
│  │  │ (nav)    │  │  ┌─────────────────┐  ┌──────────────────┐   │ │  │
│  │  │          │  │  │   InputPanel    │  │   OutputPanel    │   │ │  │
│  │  │          │  │  │ FileUploadZone  │  │ StreamingOutput  │   │ │  │
│  │  │          │  │  │ AudioRecorder   │  │ MarkdownRenderer │   │ │  │
│  │  │          │  │  │ WebcamCapture   │  │ JsonTreeView     │   │ │  │
│  │  │          │  │  │ Textarea        │  │ BoundingBoxCanvas│   │ │  │
│  │  └──────────┘  │  └─────────────────┘  └──────────────────┘   │ │  │
│  │                └──────────────────────────────────────────────┘ │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐   │
│  │HistoryDrawer │  │SettingsDrawer│  │      MCP_Client           │   │
│  │(IndexedDB)   │  │(localStorage)│  │  search + fetch_content   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────────┘   │
└──────────────────────────────────┬──────────────────────────────────┘
                                   │ postMessage / onmessage
┌──────────────────────────────────▼──────────────────────────────────┐
│                        Web Worker (worker.js)                         │
│                                                                       │
│  ┌─────────────────────────────────────────────────────────────────┐ │
│  │                       Task_Router                                │ │
│  │  Maps taskType → { promptTemplate, maxNewTokens, pipeline }     │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
│                                 │                                     │
│  ┌──────────────────────────────▼──────────────────────────────────┐ │
│  │                    ModelSession (existing)                        │ │
│  │  AutoProcessor + Gemma4ForConditionalGeneration + TextStreamer   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │ (optional)
┌──────────────────────────────────▼──────────────────────────────────┐
│                     External MCP Server (TinyFish)                    │
│                  search tool + fetch_content tool                     │
└─────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy Diagram

```
App
├── ModelProvider (existing)
│   └── TaskProvider (new)
│       └── AppContent
│           ├── TopBar
│           ├── Sidebar
│           │   ├── CategoryNavItem (×6)
│           │   │   └── TaskSubItem (×N per category)
│           │   ├── HistoryButton
│           │   └── SettingsButton
│           ├── AnimatePresence
│           │   ├── LandingPage (stage: idle/checking/unsupported)
│           │   ├── LoadingPage (stage: downloading/loading/error)
│           │   └── DashboardPage (stage: ready)
│           │       ├── TaskWorkspace (when task selected)
│           │       │   ├── TaskHeader (title, description, ThinkingModeToggle)
│           │       │   ├── InputPanel
│           │       │   │   ├── FileUploadZone (image/audio/pdf tasks)
│           │       │   │   ├── AudioRecorderWidget (audio tasks)
│           │       │   │   ├── WebcamCapture (webcam tasks)
│           │       │   │   ├── Textarea (text tasks)
│           │       │   │   ├── PDFPageRangeSelector (Req 11.2: page range picker for PDFs >50 pages)
│           │       │   │   └── TokenEstimateDisplay (Req 11.5, 34.3: estimated token count before submission)
│           │       │   └── OutputPanel
│           │       │       ├── StreamingOutput
│           │       │       ├── MarkdownRenderer
│           │       │       ├── JsonTreeView
│           │       │       ├── BoundingBoxCanvas
│           │       │       ├── HtmlPreviewFrame
│           │       │       ├── DiffView (Req 13.3: side-by-side diff for redline comparison)
│           │       │       ├── ExportButton
│           │       │       ├── DisclaimerBanner (privacy tasks)
│           │       │       └── ContextLimitWarning (Req 11.7: shown when doc text exceeds 128K context)
│           │       └── DashboardGrid (when no task selected)
│           ├── HistoryDrawer
│           └── SettingsDrawer
```

---

## File Structure

```
src/
├── App.tsx                          # Updated: wraps TaskProvider, passes activeTask to Sidebar/Dashboard
├── worker.js                        # Updated: handles "task" and "cancel_task" message types
├── taskRouter.ts                    # NEW: maps TaskType → TaskConfig + prompt assembly
├── outputParser.ts                  # NEW: parseJSON, extractText, markdownTableToJSON, jsonToMarkdownTable
├── fileHandler.ts                   # NEW: validate, readAsDataURL, generatePreview, estimateTokens; uses pdfjs-dist for PDF text layer extraction (Req 11.1)
├── audioRecorder.ts                 # NEW: MediaRecorder wrapper, 16kHz PCM conversion
├── webcamCapture.ts                 # NEW: getUserMedia wrapper, frame capture
├── mcpClient.ts                     # NEW: search(), fetchContent() with 10s timeout per call (Req 33.2, 33.4), result caching, graceful degradation on failure
├── historyStore.ts                  # NEW: IndexedDB CRUD for TaskEntry, FIFO eviction at 200
├── settingsStore.ts                 # NEW: localStorage get/set for AppSettings
├── prompts/
│   ├── index.ts                     # NEW: getPrompt(taskType, options?) → string
│   ├── documents.ts                 # NEW: ocr, document_parse, handwriting, table_extract, form_extract,
│   │                                #       pdf_qa, contract_analyzer, redline_comparison
│   ├── visual.ts                    # NEW: chart_extract, screen_analysis, wireframe_to_html,
│   │                                #       slide_analyzer, whiteboard_ocr, object_detection
│   ├── audio.ts                     # NEW: transcription, meeting_minutes, voice_to_email,
│   │                                #       multilingual_transcription, interview_transcriber
│   ├── text.ts                      # NEW: email_draft, email_reply, tone_rewriter, summarize,
│   │                                #       meeting_prep, report_generator, code_review, general_text
│   ├── research.ts                  # NEW: research, deep_doc_qa
│   └── privacy.ts                   # NEW: medical_summarizer, legal_analyzer, financial_parser
├── context/
│   ├── ModelContext.tsx             # Existing (unchanged)
│   └── TaskContext.tsx              # NEW: activeTask, taskInput, lifecycle, streamingOutput
├── types/
│   └── index.ts                     # Updated: extended TaskType union, TaskConfig, TaskEntry,
│                                    #          AppSettings, ParseError, structured output types
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx               # Existing (minor update: search connects to task filter)
│   │   └── Sidebar.tsx              # Updated: category expand/collapse, task sub-items, routing
│   ├── pages/
│   │   ├── LandingPage.tsx          # Existing (unchanged)
│   │   ├── LoadingPage.tsx          # Existing (unchanged)
│   │   └── DashboardPage.tsx        # Updated: renders TaskWorkspace or DashboardGrid
│   ├── workspace/
│   │   ├── TaskWorkspace.tsx        # NEW: split-panel layout, task header
│   │   ├── InputPanel.tsx           # NEW: conditional input rendering by task type
│   │   ├── OutputPanel.tsx          # NEW: output rendering, copy/stop/export controls
│   │   └── StreamingOutput.tsx      # NEW: token-by-token display with blinking cursor
│   ├── tasks/
│   │   ├── DocumentsWorkspace.tsx   # NEW: shared layout for document tasks
│   │   ├── VisualWorkspace.tsx      # NEW: shared layout for visual tasks
│   │   ├── AudioWorkspace.tsx       # NEW: shared layout for audio tasks
│   │   ├── TextWorkspace.tsx        # NEW: shared layout for text tasks
│   │   ├── ResearchWorkspace.tsx    # NEW: research-specific layout with citations
│   │   └── PrivacyWorkspace.tsx     # NEW: privacy tasks with disclaimer banner
│   ├── drawers/
│   │   ├── HistoryDrawer.tsx        # Updated: real IndexedDB data, task icons, timestamps, delete/clear-all (Req 5)
│   │   └── SettingsDrawer.tsx       # Updated: Model ID, quantization, WebGPU status, current TPS, browser cache estimate, Offline Mode toggle, Thinking Mode Default toggle, Clear Model Cache, theme toggle (Req 41)
│   └── ui/
│       ├── MaterialIcon.tsx         # Existing (unchanged)
│       ├── FileUploadZone.tsx       # NEW: drag-drop, file validation, preview, size/MIME error display (Req 2.6-2.7)
│       ├── AudioRecorderWidget.tsx  # NEW: record/stop/pause, level meter, duration, 30-min limit (Req 40)
│       ├── WebcamCapture.tsx        # NEW: live preview, capture button
│       ├── JsonTreeView.tsx         # NEW: collapsible syntax-highlighted JSON tree
│       ├── MarkdownRenderer.tsx     # NEW: renders Markdown with code highlighting
│       ├── ExportButton.tsx         # NEW: dropdown with TXT/JSON/MD/HTML options, filename pattern (Req 4.7)
│       ├── ThinkingModeToggle.tsx   # NEW: toggle with tooltip
│       ├── BoundingBoxCanvas.tsx    # NEW: canvas overlay for object detection bounding boxes (Req 19.3)
│       ├── HtmlPreviewFrame.tsx     # NEW: sandboxed iframe for wireframe-to-HTML preview (Req 16.4)
│       ├── PrivacyNotice.tsx        # NEW: local-processing confirmation banner (Req 35.4, 36.4, 37.4)
│       ├── DisclaimerBanner.tsx     # NEW: medical/legal/financial disclaimer (Req 35.3, 36.3, 37.3)
│       ├── PDFPageRangeSelector.tsx # NEW: page range picker for PDFs >50 pages with token estimate warning (Req 11.2)
│       ├── TokenEstimateDisplay.tsx # NEW: shows estimated token count of document before submission (Req 11.5, 34.3)
│       ├── ContextLimitWarning.tsx  # NEW: warning banner when combined text exceeds 128K context limit (Req 11.7)
│       └── DiffView.tsx             # NEW: side-by-side diff view with green additions, red deletions with strikethrough (Req 13.3)
└── test/
    ├── outputParser.test.ts         # NEW: property-based tests for Output_Parser
    ├── promptTemplates.test.ts      # NEW: property-based tests for getPrompt
    ├── historyStore.test.ts         # NEW: property-based tests for History_Store
    ├── fileHandler.test.ts          # NEW: property-based tests for File_Handler
    ├── taskRouter.test.ts           # NEW: property-based tests for Task_Router
    └── exportFilename.test.ts       # NEW: property-based tests for export filename
```

---

## Data Models

### Extended `types/index.ts`

```typescript
// ─── Model Stage (existing, unchanged) ───────────────────────────────────────
export type ModelStage =
  | 'idle' | 'checking' | 'unsupported'
  | 'downloading' | 'loading' | 'ready' | 'error';

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

// ─── Task Types (extended from 13 to 30+) ────────────────────────────────────
export type TaskType =
  // Documents
  | 'ocr'
  | 'document_parse'
  | 'handwriting'
  | 'table_extract'
  | 'form_extract'
  | 'pdf_qa'
  | 'contract_analyzer'
  | 'redline_comparison'
  // Visual
  | 'chart_extract'
  | 'screen_analysis'
  | 'wireframe_to_html'
  | 'slide_analyzer'
  | 'whiteboard_ocr'
  | 'object_detection'
  // Audio
  | 'transcription'
  | 'meeting_minutes'
  | 'voice_to_email'
  | 'multilingual_transcription'
  | 'interview_transcriber'
  // Text & Writing
  | 'email_draft'
  | 'email_reply'
  | 'tone_rewriter'
  | 'summarize'
  | 'meeting_prep'
  | 'report_generator'
  | 'code_review'
  | 'general_text'
  // Research
  | 'research'
  | 'deep_doc_qa'
  // Privacy-First Specialized
  | 'medical_summarizer'
  | 'legal_analyzer'
  | 'financial_parser';

export type TaskCategory =
  | 'documents' | 'visual' | 'audio' | 'text' | 'research' | 'privacy';

export type OutputFormat = 'text' | 'markdown' | 'json' | 'html' | 'table';

// ─── Task Config (extended) ───────────────────────────────────────────────────
export interface TaskConfig {
  taskType: TaskType;
  category: TaskCategory;
  label: string;
  description: string;
  icon: string;                        // Material Symbols icon name
  max_new_tokens: number;
  requiresImage: boolean;
  requiresAudio: boolean;
  requiresPDF: boolean;
  requiresText: boolean;
  supportsWebcam: boolean;
  enableThinkingByDefault: boolean;
  supportsThinkingMode: boolean;
  outputFormat: OutputFormat;
  twoPassPipeline: boolean;            // true for meeting_minutes, voice_to_email
  requiresPrivacyNotice: boolean;      // true for medical, legal, financial
  requiresDisclaimer: boolean;
  disclaimerText?: string;
}

// ─── Task Lifecycle ───────────────────────────────────────────────────────────
export type TaskLifecycle = 'idle' | 'submitting' | 'generating' | 'complete' | 'error';

// ─── Task Entry (history record) ─────────────────────────────────────────────
export interface TaskEntry {
  id: string;                          // crypto.randomUUID()
  type: TaskType;
  category: TaskCategory;
  inputSummary: string;                // first 200 chars of text input or filename
  output: string;                      // full raw output string
  parsedOutput?: unknown;              // parsed JSON if applicable
  status: 'complete' | 'error' | 'cancelled';
  timestamp: string;                   // ISO 8601
  durationMs: number;
  tokenCount: number | null;
  tps: number | null;
}

// ─── App Settings ─────────────────────────────────────────────────────────────
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

// ─── Output Parser Types ──────────────────────────────────────────────────────
export interface ParseError {
  error: 'parse_failed';
  raw: string;
}

export function isParseError(v: unknown): v is ParseError {
  return typeof v === 'object' && v !== null && (v as ParseError).error === 'parse_failed';
}

// ─── Structured Output Shapes ─────────────────────────────────────────────────
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

// ─── Worker Message Protocol (extended) ──────────────────────────────────────
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
    pass: 1 | 2;                       // for two-pass pipelines
    passOneOutput?: string;            // transcript from pass 1, used in pass 2
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
```

---

## MCP Client Behavior Specification (Req 33)

### Timeout & Retry Policy

| Operation | Timeout | On Failure |
|---|---|---|
| `search()` call | 10 seconds (Req 33.2) | Abort, treat as search-level failure, show "Web search unavailable" notice (Req 33.8) |
| `fetchContent()` per URL | 10 seconds (Req 33.4) | Skip URL, log warning, continue with remaining URLs |
| Combined fetch | — | If all fetches fail, send only search metadata (titles, URLs, snippets) to Worker (Req 33.9) |

### Content Truncation (Req 33.5)

- Each fetched page truncated to **8,000 characters** max
- Combined total of all page content capped at **24,000 characters**
- Truncation applied before sending to Worker

### Caching Strategy

- Search results cached by query string with 5-minute TTL
- Fetched page content cached by URL with 15-minute TTL
- Cache bypassed when user re-submits same query within TTL (fresh results preferred)

### Graceful Degradation

1. **Offline Mode enabled** → Research task submit button disabled, tooltip: "Web research requires Offline Mode to be disabled" (Req 33.10)
2. **Search fails** → Show dismissible "Web search unavailable" notice + "Run without web search" button that re-submits as General Text task (Req 33.8)
3. **All fetches fail** → Show "Could not retrieve page content — answer based on search snippets only" notice (Req 33.9)
4. **Partial fetch success** → Proceed with successfully fetched content only, no user-facing notice needed

---

## PDF Processing Pipeline (Req 11, 12, 13, 35-37)

### pdf.js Integration

`fileHandler.ts` uses `pdfjs-dist` for:
- **Text layer extraction**: `pdfjsLib.getDocument({ data: file }).then(pdf => { ... })` then iterate pages calling `page.getTextContent()` to extract text
- **Page rendering to canvas**: `page.render({ canvasContext, viewport })` for visual tasks that need page images
- **Page count**: `pdf.numPages` used to determine if page range selector is needed

### Page Range Selector (Req 11.2)

**Component:** `PDFPageRangeSelector.tsx`
- Triggered when `pdf.numPages > 50`
- Displays: "This PDF has {N} pages. Processing all pages may be slow."
- Provides: "All pages" toggle, "Custom range" input (start-end), "First 10 pages" quick select
- Default: First 50 pages selected
- Updates token estimate in real-time as range changes

### Token Estimation (Req 11.5, 34.3)

**Component:** `TokenEstimateDisplay.tsx`
- Calculates estimated tokens as `Math.ceil(textLength / 4)` (rough character-to-token ratio)
- Displayed before user submits: "Estimated input: ~{N} tokens"
- Color-coded: green (<50K), amber (50K-100K), red (>100K approaching 128K limit)

### Context Limit Truncation (Req 11.7)

**Component:** `ContextLimitWarning.tsx`
- Triggered when combined page text exceeds 128K token limit (~512K characters)
- Truncation strategy: keep most recent pages that fit within limit
- Warning displayed: "Document exceeds context limit. Only the last {N} pages will be processed."
- Shown as amber banner above the submit button

---

## Diff View Component (Req 13.3)

**Component:** `DiffView.tsx`

Renders the `RedlineResult` output with:
- **Additions**: Green background (`bg-green-900/30`), green left border (`border-l-2 border-green-500`)
- **Deletions**: Red background (`bg-red-900/30`), red left border, strikethrough text (`line-through`)
- **Modifications**: Side-by-side two-column layout:
  - Left column: original text with amber tint
  - Right column: revised text with cyan tint
  - Commentary displayed below both columns in italic
- **Summary**: Displayed as a standalone section above the diff

---

## Settings Drawer Detailed Specification (Req 41)

**Component:** `SettingsDrawer.tsx`

### Display Sections

| Section | Content | Source |
|---|---|---|
| **Model Info** | Model ID (`onnx-community/gemma-4-E2B-it-ONNX`), quantization type (from Transformers.js config) | `ModelContext` |
| **Performance** | WebGPU status (`available` / `unavailable`), current TPS (if generating, else "—"), tokens generated (if generating) | `ModelContext` |
| **Storage** | Browser cache usage estimate (via `caches.match()` + `cache.keys()` size calculation) | Browser Cache API |
| **Privacy** | Offline Mode toggle — when enabled, disables all MCP calls, hides Research category | `settingsStore.ts` |
| **AI Behavior** | Thinking Mode Default toggle — sets default state for all tasks that support it | `settingsStore.ts` |
| **Appearance** | Theme toggle (Dark / Light) — switches CSS custom properties via `data-theme` attribute on `<html>` | `settingsStore.ts` |
| **Maintenance** | "Clear Model Cache" button — calls `caches.delete()` for Transformers.js cache, requires confirmation dialog | Browser Cache API |

### Persistence

All settings persisted to `localStorage` under key `stratos-settings`. Applied immediately without page reload (Req 41.7).

---

## Icon System Deviation Note

**Requirements doc (Req 1.5)** specifies Lucide icons. **This design** uses Google Material Symbols Outlined, matching the existing codebase migration documented in `DESIGN_ALIGNMENT_PLAN.md`. All `icon` fields in `TaskConfig` reference Material Symbols icon names (e.g., `document_scanner`, `receipt_long`, `transcribe`). This is a tracked deviation from Req 1.5 and should be reconciled in a future requirements revision.
