# Stratos Office — Technical Architecture

> **Purpose:** Complete technical reference for the Stratos Office Full Suite. Describes every module, data flow, and integration point so any developer can understand, extend, or rebuild the system from scratch.

---

## 1. Project Overview

Stratos Office is a **browser-only, fully local multimodal AI office assistant** powered by Google's **Gemma 4 E2B** model running entirely in the browser via **WebGPU**. No prompts, images, audio, or documents ever leave the user's device.

### Key Characteristics

| Property | Detail |
|---|---|
| **Inference** | 100% client-side — no backend server |
| **Acceleration** | WebGPU via ONNX Runtime Web |
| **Modalities** | Text, image, audio, PDF |
| **Task types** | 30+ across 6 categories |
| **Model** | Gemma 4 E2B — Q4F16 quantized, ~3.2 GB VRAM |
| **Context window** | 128K tokens |
| **History** | IndexedDB, 200-entry FIFO, persists across sessions |
| **Settings** | localStorage, applied immediately |
| **Web features** | Optional MCP search/fetch (TinyFish), disableable via Offline Mode |

---

## 2. Model: Gemma 4 E2B

```
Model ID: onnx-community/gemma-4-E2B-it-ONNX
Quantization: q4f16 (4-bit weights, 16-bit activations)
VRAM: ~3.2 GB
Context: 128K tokens
```

### Capabilities

| Capability | Task Categories |
|---|---|
| Text generation + reasoning | Text & Writing, Research |
| Image understanding (OCR, detection, analysis) | Documents, Visual |
| Audio transcription + translation | Audio |
| Structured JSON output (native) | All structured tasks |
| Chain-of-thought (Thinking Mode) | Contract Analyzer, Code Review, Legal Analyzer, Redline Comparison, General Text |
| Native function calling | Research pipeline |
| Variable aspect ratio image input | All image tasks |

### Known Limitations

- Hallucinations on noisy/low-quality scans
- Dense visual layouts may cause counting errors
- Browser VRAM constrained to ~3.2 GB (Q4F16)
- No native video streaming (frame-capture only)
- Audio support (E2B/E4B only) — not available on larger variants

---

## 3. Technology Stack

### Core

| Technology | Version | Purpose |
|---|---|---|
| **Transformers.js** | 4.x (CDN) | JavaScript ML inference library |
| **ONNX Runtime Web** | bundled | ONNX model execution on WebGPU |
| **WebGPU** | browser API | GPU compute |
| **React** | 18+ | UI framework |
| **TypeScript** | 5+ | Type safety |
| **Vite** | 5+ | Build tool and dev server |
| **Tailwind CSS** | 4.x | Utility-first styling |
| **Framer Motion** | latest | Animations |

### New Dependencies (Full Suite)

| Dependency | Version | Purpose |
|---|---|---|
| `pdfjs-dist` | ^4.x | PDF text extraction and page rendering |
| `react-markdown` | latest | Markdown rendering in output panel |
| `remark-gfm` | latest | GitHub Flavored Markdown (tables, strikethrough) |
| `highlight.js` | latest | Syntax highlighting for code blocks and JSON |

### Icon System

**Google Material Symbols Outlined** (font-based, loaded via Google Fonts CDN). All icon references use Material Symbols names (e.g., `document_scanner`, `receipt_long`, `transcribe`). Wrapped by `src/components/ui/MaterialIcon.tsx`.

---

## 4. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Browser Main Thread                         │
│                                                                       │
│  ┌──────────────┐  ┌──────────────────────────────────────────────┐  │
│  │  ModelContext │  │              TaskContext                      │  │
│  │  stage, tps,  │  │  activeTask, taskInput, streamingOutput,     │  │
│  │  isGenerating │  │  lifecycle, parsedOutput                     │  │
│  └──────┬────────┘  └──────────────────┬───────────────────────────┘  │
│         │                              │                              │
│  ┌──────▼──────────────────────────────▼───────────────────────────┐  │
│  │                           App.tsx                                │  │
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
│  │                       Task_Router (taskRouter.ts)                │ │
│  │  Maps taskType → { promptTemplate, maxNewTokens, pipeline }     │ │
│  └──────────────────────────────┬──────────────────────────────────┘ │
│                                 │                                     │
│  ┌──────────────────────────────▼──────────────────────────────────┐ │
│  │                    ModelSession                                   │ │
│  │  AutoProcessor + Gemma4ForConditionalGeneration + TextStreamer   │ │
│  └─────────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
                                   │ (optional)
┌──────────────────────────────────▼──────────────────────────────────┐
│                     External MCP Server (TinyFish)                    │
│                  search tool + fetch_content tool                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 5. File Structure

```
src/
├── App.tsx                          # Root: wraps ModelProvider + TaskProvider
├── main.tsx                         # Entry point
├── index.css                        # Tailwind + CSS custom properties (design tokens)
├── worker.js                        # Web Worker: model loading + inference + task routing
├── taskRouter.ts                    # Maps TaskType → TaskConfig + builds task messages
├── outputParser.ts                  # parseJSON, extractText, markdownTableToJSON, jsonToMarkdownTable
├── fileHandler.ts                   # validate, readAsDataURL, generatePreview, estimateTokens, extractPDFText
├── audioRecorder.ts                 # MediaRecorder wrapper, 16kHz PCM conversion
├── webcamCapture.ts                 # getUserMedia wrapper, frame capture
├── mcpClient.ts                     # search(), fetchContent() — 10s timeouts, caching, graceful degradation
├── historyStore.ts                  # IndexedDB CRUD for TaskEntry, FIFO eviction at 200
├── settingsStore.ts                 # localStorage get/set for AppSettings
├── prompts/
│   ├── index.ts                     # getPrompt(taskType, options?) → string
│   ├── documents.ts                 # ocr, document_parse, handwriting, table_extract, form_extract,
│   │                                #   pdf_qa, contract_analyzer, redline_comparison
│   ├── visual.ts                    # chart_extract, screen_analysis, wireframe_to_html,
│   │                                #   slide_analyzer, whiteboard_ocr, object_detection
│   ├── audio.ts                     # transcription, meeting_minutes, voice_to_email,
│   │                                #   multilingual_transcription, interview_transcriber
│   ├── text.ts                      # email_draft, email_reply, tone_rewriter, summarize,
│   │                                #   meeting_prep, report_generator, code_review, general_text
│   ├── research.ts                  # research, deep_doc_qa
│   └── privacy.ts                   # medical_summarizer, legal_analyzer, financial_parser
├── context/
│   ├── ModelContext.tsx             # Model lifecycle state (stage, progress, tps, isGenerating)
│   └── TaskContext.tsx              # Task state (activeTask, input, lifecycle, streamingOutput)
├── types/
│   └── index.ts                     # All TypeScript types (see Section 8)
├── components/
│   ├── layout/
│   │   ├── TopBar.tsx               # Fixed header: logo, search, settings, avatar
│   │   └── Sidebar.tsx              # Category nav with expand/collapse + task sub-items
│   ├── pages/
│   │   ├── LandingPage.tsx          # Pre-load: WebGPU check, "Load Gemma 4" CTA
│   │   ├── LoadingPage.tsx          # Model download: progress bar, ETA, file names
│   │   └── DashboardPage.tsx        # Post-load: TaskWorkspace or DashboardGrid
│   ├── workspace/
│   │   ├── TaskWorkspace.tsx        # Split-panel: InputPanel + OutputPanel
│   │   ├── InputPanel.tsx           # Conditional inputs by task type
│   │   ├── OutputPanel.tsx          # Output rendering + copy/stop/export controls
│   │   └── StreamingOutput.tsx      # Token-by-token display with blinking cursor
│   ├── tasks/
│   │   ├── DocumentsWorkspace.tsx   # Documents category (OCR → Redline)
│   │   ├── VisualWorkspace.tsx      # Visual category (Chart → Object Detection)
│   │   ├── AudioWorkspace.tsx       # Audio category (Transcription → Interview)
│   │   ├── TextWorkspace.tsx        # Text category (Email → General)
│   │   ├── ResearchWorkspace.tsx    # Research + citations + MCP fallback UI
│   │   └── PrivacyWorkspace.tsx     # Medical / Legal / Financial + disclaimers
│   ├── drawers/
│   │   ├── HistoryDrawer.tsx        # IndexedDB history: list, click-to-restore, delete, clear-all
│   │   └── SettingsDrawer.tsx       # Model info, TPS, Offline Mode, Thinking Mode, theme, cache
│   └── ui/
│       ├── MaterialIcon.tsx         # Google Material Symbols Outlined wrapper
│       ├── FileUploadZone.tsx       # Drag-drop + MIME/size validation + preview
│       ├── AudioRecorderWidget.tsx  # Record/pause/stop + level meter + 30-min limit
│       ├── WebcamCapture.tsx        # Live preview + frame capture
│       ├── JsonTreeView.tsx         # Collapsible syntax-highlighted JSON tree
│       ├── MarkdownRenderer.tsx     # react-markdown + remark-gfm + highlight.js
│       ├── ExportButton.tsx         # TXT/JSON/MD/HTML dropdown, filename pattern
│       ├── ThinkingModeToggle.tsx   # Toggle with tooltip
│       ├── BoundingBoxCanvas.tsx    # Canvas overlay for object detection
│       ├── HtmlPreviewFrame.tsx     # Sandboxed iframe for wireframe-to-HTML
│       ├── PrivacyNotice.tsx        # Local-processing confirmation banner
│       ├── DisclaimerBanner.tsx     # Medical/legal/financial disclaimer (non-dismissible)
│       ├── PDFPageRangeSelector.tsx # Page range picker for PDFs >50 pages
│       ├── TokenEstimateDisplay.tsx # Estimated token count, color-coded
│       ├── ContextLimitWarning.tsx  # Amber banner when doc exceeds 128K context
│       └── DiffView.tsx             # Side-by-side diff: green additions, red deletions
└── test/
    ├── outputParser.test.ts         # Property-based tests (Properties 1–6, 14)
    ├── promptTemplates.test.ts      # Property-based tests (Properties 5–6)
    ├── historyStore.test.ts         # Property-based tests (Properties 7–9)
    ├── fileHandler.test.ts          # Property-based tests (Properties 10–11)
    ├── taskRouter.test.ts           # Property-based tests (Property 12)
    └── exportFilename.test.ts       # Property-based tests (Property 13)
```

---

## 6. Task Types (30+)

### Documents

| Task Type | Input | Output | Max Tokens |
|---|---|---|---|
| `ocr` | Image | Plain text | 512 |
| `document_parse` | Image | JSON (vendor, date, total, line_items) | 1024 |
| `handwriting` | Image | Plain text | 512 |
| `table_extract` | Image | Markdown table | 1024 |
| `form_extract` | Image | JSON (field → value) | 1024 |
| `pdf_qa` | PDF + text | Plain text with citations | 2048 |
| `contract_analyzer` | PDF | JSON (summary, clauses, risk flags) | 2048 |
| `redline_comparison` | PDF × 2 | JSON (additions, deletions, modifications) | 2048 |

### Visual

| Task Type | Input | Output | Max Tokens |
|---|---|---|---|
| `chart_extract` | Image | JSON (chart_type, series, trends) | 1024 |
| `screen_analysis` | Image | JSON (elements, layout) | 1024 |
| `wireframe_to_html` | Image | HTML string | 2048 |
| `slide_analyzer` | Image | JSON (key_points, speaker_notes) | 1024 |
| `whiteboard_ocr` | Image | Markdown | 1024 |
| `object_detection` | Image | JSON array (label, bbox fractions) | 1024 |

### Audio

| Task Type | Input | Output | Max Tokens | Pipeline |
|---|---|---|---|---|
| `transcription` | Audio | Markdown transcript | 2048 | Single pass |
| `meeting_minutes` | Audio | JSON (title, attendees, action_items) | 2048 | Two-pass |
| `voice_to_email` | Audio | JSON (subject, to, body, tone) | 1024 | Two-pass |
| `multilingual_transcription` | Audio | JSON (detected_language, original, translation) | 2048 | Single pass |
| `interview_transcriber` | Audio | Markdown Q&A | 2048 | Single pass |

### Text & Writing

| Task Type | Input | Output | Max Tokens |
|---|---|---|---|
| `email_draft` | Text | JSON (subject, to, body, tone) | 1024 |
| `email_reply` | Text | JSON array (3 × tone/subject/body) | 1536 |
| `tone_rewriter` | Text + tone | Plain text | 1024 |
| `summarize` | Text/Image/Audio | Markdown bullets | 512 |
| `meeting_prep` | Text | JSON (talking_points, questions) | 1024 |
| `report_generator` | Text | Markdown report | 2048 |
| `code_review` | Text | JSON (issues with severity) | 2048 |
| `general_text` | Text | Markdown | 2048 |

### Research

| Task Type | Input | Output | Max Tokens |
|---|---|---|---|
| `research` | Text query | JSON (answer, sources, confidence) | 2048 |
| `deep_doc_qa` | Text/PDF + question | Plain text | 2048 |

### Privacy-First Specialized

| Task Type | Input | Output | Max Tokens | Disclaimer |
|---|---|---|---|---|
| `medical_summarizer` | Image/PDF | JSON (summary, key_findings, values_out_of_range) | 1024 | Required |
| `legal_analyzer` | Image/PDF | JSON (parties, key_terms, risk_flags) | 2048 | Required |
| `financial_parser` | Image/PDF | JSON (transactions, totals) | 2048 | Required |

---

## 7. Worker Message Protocol

### Messages TO Worker

| Type | Payload | Description |
|---|---|---|
| `"check"` | — | Check WebGPU support |
| `"load"` | — | Start model download + initialization |
| `"generate"` | `{ messages, enableThinking, maxNewTokens }` | Free-form generation |
| `"task"` | `{ taskId, taskType, messages, enableThinking, maxNewTokens, pass, passOneOutput? }` | Run a typed task |
| `"cancel_task"` | `{ taskId }` | Cancel running task (calls interrupt) |
| `"interrupt"` | — | Stop current generation |
| `"reset"` | — | Reset stopping criteria |

### Messages FROM Worker

| Status | Payload | Description |
|---|---|---|
| `"check"` | `{ supported: boolean }` | WebGPU support result |
| `"loading"` | `string` | Download status message |
| `"init"` | `string` | Initialization status |
| `"progress"` | `{ progress: number }` | 0–100% loading progress |
| `"ready"` | — | Model ready for inference |
| `"start"` | — | Generation started |
| `"update"` | `{ output: string }` | New token text |
| `"complete"` | `{ tps, numTokens }` | Generation finished |
| `"task_start"` | `{ taskId, taskType }` | Task started |
| `"task_update"` | `{ taskId, output }` | Task streaming token |
| `"task_complete"` | `{ taskId, output, numTokens, tps }` | Task finished |
| `"task_pass1_complete"` | `{ taskId, transcript }` | Pass 1 done (two-pass tasks) |
| `"task_error"` | `{ taskId, error }` | Task failed |
| `"error"` | `string` | Worker-level error |

---

## 8. Data Models

### TaskConfig

```typescript
interface TaskConfig {
  taskType: TaskType;
  category: TaskCategory;
  label: string;
  description: string;
  icon: string;                     // Material Symbols name
  max_new_tokens: number;
  requiresImage: boolean;
  requiresAudio: boolean;
  requiresPDF: boolean;
  requiresText: boolean;
  supportsWebcam: boolean;
  enableThinkingByDefault: boolean;
  supportsThinkingMode: boolean;
  outputFormat: 'text' | 'markdown' | 'json' | 'html' | 'table';
  twoPassPipeline: boolean;         // meeting_minutes, voice_to_email
  requiresPrivacyNotice: boolean;
  requiresDisclaimer: boolean;
  disclaimerText?: string;
}
```

### TaskEntry (History Record)

```typescript
interface TaskEntry {
  id: string;                       // crypto.randomUUID()
  type: TaskType;
  category: TaskCategory;
  inputSummary: string;             // first 200 chars of input or filename
  output: string;                   // full raw output
  parsedOutput?: unknown;           // parsed JSON if applicable
  status: 'complete' | 'error' | 'cancelled';
  timestamp: string;                // ISO 8601
  durationMs: number;
  tokenCount: number | null;
  tps: number | null;
}
```

### AppSettings

```typescript
interface AppSettings {
  offlineMode: boolean;
  thinkingModeDefault: boolean;
  theme: 'dark' | 'light';
}
```

---

## 9. Prompt Template System

All prompts live in `src/prompts/` organized by category. The public API is:

```typescript
import { getPrompt } from './prompts/index.ts';

const prompt = getPrompt('ocr');
// → "Extract all text from this image..."

const prompt = getPrompt('multilingual_transcription', { language: 'Spanish' });
// → "Transcribe this audio in Spanish and provide an English translation..."
```

- Throws `Error("Unknown task type: <taskType>")` for unrecognized types
- Accepts `options.language` for multilingual tasks
- Accepts `options.tone` for tone rewriter

---

## 10. Output Parser

`src/outputParser.ts` — pure TypeScript module, no browser API dependencies.

```typescript
// Extract JSON from model output (handles fences, think blocks, position scanning)
parseJSON(text: string): object | ParseError

// Strip think blocks and code fences, return clean plain text
extractText(text: string): string

// Convert Markdown table string to JSON array
markdownTableToJSON(table: string): Array<Record<string, string>> | ParseError

// Convert JSON array to Markdown table string
jsonToMarkdownTable(rows: Array<Record<string, string>>): string | ParseError
```

`ParseError` shape: `{ error: 'parse_failed'; raw: string }`

---

## 11. MCP Client (Research Pipeline)

`src/mcpClient.ts` — optional, disabled when Offline Mode is on.

| Operation | Timeout | On Failure |
|---|---|---|
| `search(query)` | 10 seconds | Show "Web search unavailable" + fallback to General Text |
| `fetchContent(url)` | 10 seconds per URL | Skip URL, continue with remaining |
| Combined fetch | — | If all fail, send only search snippets to Worker |

Content limits: 8,000 chars per page, 24,000 chars combined total.

Caching: search results 5-min TTL, page content 15-min TTL (in-memory Map).

---

## 12. PDF Processing

`src/fileHandler.ts` uses `pdfjs-dist`:

- `extractPDFText(file, pageRange?)` — iterates pages via `page.getTextContent()`, returns concatenated text + page count
- Page range selector shown when `numPages > 50`
- Token estimate: `Math.ceil(textLength / 4)` characters → tokens
- Context limit warning at ~512K characters (~128K tokens)
- Truncation strategy: keep most recent pages that fit

---

## 13. History Store

`src/historyStore.ts` — IndexedDB database `stratos-history`, object store `entries`.

- Max 200 entries — FIFO eviction on insert
- Sorted by `timestamp` descending
- Persists across browser sessions
- Never synced to any remote service

---

## 14. Settings Store

`src/settingsStore.ts` — localStorage key `stratos-settings`.

- `loadSettings()` — merges with `DEFAULT_SETTINGS` for missing keys
- `saveSettings(settings)` — full write
- `updateSetting(key, value)` — load → patch → save
- Applied immediately without page reload

---

## 15. Model Loading Pipeline

```javascript
const MODEL_ID = "onnx-community/gemma-4-E2B-it-ONNX";

const [processor, model] = await Promise.all([
  AutoProcessor.from_pretrained(MODEL_ID, { progress_callback }),
  Gemma4ForConditionalGeneration.from_pretrained(MODEL_ID, {
    dtype: "q4f16",
    device: "webgpu",
    progress_callback,
  }),
]);
```

Transformers.js uses the browser **Cache API** — after first download (~1–2 GB), subsequent loads are near-instant.

---

## 16. Inference Pipeline

### Single-Pass Tasks

```javascript
const messages = [
  { role: "user", content: [
    { type: "image", image: imageDataUrl },   // optional
    { type: "audio", audio: audioFloat32 },   // optional
    { type: "text", text: promptString },
  ]},
];

const prompt = processor.apply_chat_template(messages, {
  add_generation_prompt: true,
  enable_thinking: false,           // true for thinking-mode tasks
});

const inputs = processor(prompt, image, audio, { add_special_tokens: false });

const streamer = new TextStreamer(processor.tokenizer, {
  skip_prompt: true,
  skip_special_tokens: true,
  callback_function: (text) => self.postMessage({ status: "task_update", output: text }),
});

await model.generate({ ...inputs, max_new_tokens, do_sample: false, streamer });
```

### Two-Pass Tasks (meeting_minutes, voice_to_email)

1. **Pass 1**: Transcribe audio → emit `task_pass1_complete` with transcript
2. **Pass 2**: Main thread sends pass 2 message with `passOneOutput` = transcript → generate structured output

---

## 17. Performance

| Metric | Value |
|---|---|
| Download size | ~1–2 GB (first load) |
| First load time | 30–120 seconds |
| Inference speed | 5–20 tokens/sec (GPU dependent) |
| VRAM usage | ~3.2 GB (Q4F16) |
| Total RAM | ~4–8 GB |
| TTFT target | < 5 seconds (discrete GPU) |

---

## 18. Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 113+ | Full support |
| Edge 113+ | Full support |
| Firefox | No WebGPU — unsupported |
| Safari | No WebGPU — unsupported |

---

## 19. Security & Privacy

- All inference is local — no data leaves the device
- No API keys required for core functionality
- No analytics, telemetry, or tracking scripts
- Media permissions requested only for the active task
- History stored only in local IndexedDB — never synced remotely
- MCP web features are optional — Offline Mode disables them entirely
- Model files downloaded once from HuggingFace and cached in browser Cache API

---

## 20. Glossary

| Term | Definition |
|---|---|
| **WebGPU** | Modern browser API for GPU compute |
| **ONNX** | Open Neural Network Exchange format |
| **Transformers.js** | Hugging Face ML inference library for the browser |
| **Q4F16** | 4-bit weight quantization with 16-bit activations |
| **KV cache** | Key-Value cache for autoregressive generation |
| **Web Worker** | Background JS thread for non-blocking inference |
| **TextStreamer** | Token-by-token streaming utility in Transformers.js |
| **TTFT** | Time To First Token |
| **TPS** | Tokens Per Second |
| **MCP** | Model Context Protocol — tool calling standard |
| **Two-pass pipeline** | Tasks that transcribe audio first, then generate structured output |
| **Thinking Mode** | Chain-of-thought reasoning via `enable_thinking: true` |
| **FIFO eviction** | First-in, first-out removal when history exceeds 200 entries |
| **ParseError** | `{ error: 'parse_failed'; raw: string }` — returned by outputParser on failure |
