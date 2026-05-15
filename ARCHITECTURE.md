# Stratos Office — Technical Architecture Document

> **Purpose:** This document describes the full architecture of the Stratos Office AI Office Assistant so that a developer can understand, extend, or rebuild it from scratch.

---

## 1. Project Overview

Stratos Office is a **browser-only, fully local multimodal AI office assistant** that runs Google's **Gemma 4** model entirely in the browser using **WebGPU**. No prompts, images, or audio ever leave the user's device.

### Key Characteristics

- **100% client-side inference** — no backend server needed
- **WebGPU acceleration** — runs on the GPU via the browser
- **Multimodal** — accepts text, images, audio, and PDF input
- **Task-based architecture** — each task type has its own prompt template and output format
- **Quantized model** — uses Q4 (4-bit) quantization for browser feasibility
- **Cached after first load** — model files are stored in the browser cache

---

## 2. Model: Gemma 4 E2B

```
Model ID: onnx-community/gemma-4-E2B-it-ONNX
```

Gemma 4 is a **multimodal large language model** from Google DeepMind. The E2B (2B parameter) variant is the largest that fits in browser WebGPU (~2-4 GB VRAM).

### Capabilities Used

| Capability | Office Task |
|---|---|
| Text generation | Email drafting, summarization, code review |
| Image understanding | OCR, document parsing, chart extraction, screen analysis |
| Audio transcription | Meeting transcription, voice commands |
| Structured output | JSON extraction for receipts, forms, tables |
| Chain-of-thought | Complex reasoning tasks (optional "thinking mode") |

### Known Limitations

- Hallucinations on noisy/low-quality scans
- Dense visual layouts may cause counting errors
- Browser memory constrained to ~2-4 GB VRAM
- No native video streaming (frame-capture only)

---

## 3. Technology Stack

### Core

| Technology | Purpose |
|---|---|
| **Transformers.js** | JavaScript ML inference library |
| **ONNX Runtime Web** | ONNX model execution on WebGPU |
| **WebGPU** | GPU compute in the browser |
| **Vite** | Build tool and dev server |
| **React** | UI framework (swappable) |

### Optional

| Technology | Purpose |
|---|---|
| **pdf.js** | Browser-side PDF rendering |
| **TinyFish MCP** | Web search and page content extraction |

---

## 4. Architecture

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                   Browser UI                     │
│                                                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ Task     │ │ Input    │ │ Output Display   │  │
│  │ Selector │ │ Area     │ │ + Export         │  │
│  └────┬─────┘ └────┬─────┘ └────────┬─────────┘  │
│       │             │                │            │
└───────┼─────────────┼────────────────┼────────────┘
        │             │                │
        ▼             ▼                ▼
┌─────────────────────────────────────────────────┐
│              Web Worker (Background)              │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │  Task Router                                  │  │
│  │  - Routes to correct pipeline by task type   │  │
│  │  - Manages task history and cancellation     │  │
│  └──────────────────┬──────────────────────────┘  │
│                     │                              │
│  ┌──────────────────▼──────────────────────────┐  │
│  │  Gemma 4 Inference Engine                    │  │
│  │  - AutoProcessor (chat template + encoding)  │  │
│  │  - WebGPU execution                          │  │
│  │  - TextStreamer (token-by-token output)      │  │
│  └─────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
          │
          ▼ (optional)
┌─────────────────────────────────────────────────┐
│              MCP Server (External)                │
│  - Search tool (web search)                      │
│  - Fetch tool (page content extraction)          │
└─────────────────────────────────────────────────┘
```

### 4.2 File Structure

```
stratos-office/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main application UI
│   ├── worker.js             # Web Worker: model + inference
│   ├── taskRouter.js         # Task routing logic
│   ├── outputParser.js       # JSON extraction
│   ├── fileHandler.js        # File upload utility
│   ├── webcam.js             # Webcam capture
│   ├── audioRecorder.js      # Microphone recording
│   ├── mcpClient.js          # MCP protocol client
│   ├── prompts/              # Prompt templates
│   └── components/           # React components
├── public/                   # Static assets
├── index.html
├── package.json
└── vite.config.js
```

---

## 5. Task Router System

### 5.1 Task Types

| Task Type | Input | Output | Category |
|---|---|---|---|
| `ocr` | Image | Extracted text | Documents |
| `document_parse` | Image | Structured JSON | Documents |
| `handwriting` | Image | Typed text | Documents |
| `table_extract` | Image | Markdown/JSON table | Documents |
| `form_extract` | Image | Form field JSON | Documents |
| `chart_extract` | Image | Data points + trends | Visual |
| `screen_analysis` | Image | UI element description | Visual |
| `transcription` | Audio | Formatted transcript | Audio |
| `voice_command` | Audio | Intent + response | Audio |
| `email_draft` | Text | Drafted email JSON | Text |
| `summarize` | Text/Image/Audio | Summary bullet points | Text |
| `text_task` | Text | General text response | Text |
| `research` | Text query | Synthesized answer | Research |

### 5.2 Worker Message Protocol

**Messages TO worker:**

| Type | Data | Description |
|---|---|---|
| `"check"` | — | Check WebGPU support |
| `"load"` | — | Start loading model |
| `"generate"` | `{ messages, enableThinking }` | Run generation |
| `"task"` | `{ taskId, taskType, input, options }` | Run a task |
| `"cancel_task"` | `{ taskId }` | Cancel a running task |
| `"interrupt"` | — | Stop current generation |
| `"reset"` | — | Reset stopping criteria |

**Messages FROM worker:**

| Status | Data | Description |
|---|---|---|
| `"check"` | `{ supported: boolean }` | WebGPU support result |
| `"loading"` | `string` | Loading status message |
| `"progress"` | `{ progress: number }` | 0-100% loading progress |
| `"ready"` | — | Model is ready |
| `"start"` | — | Generation started |
| `"update"` | `{ output: string }` | New token text |
| `"complete"` | `{ tps, numTokens }` | Generation finished |
| `"task_start"` | `{ taskId, taskType }` | Task started |
| `"task_update"` | `{ taskId, output }` | Task streaming output |
| `"task_result"` | `{ taskId, taskType, result, error }` | Task completed |
| `"error"` | `string` | Error message |

---

## 6. Prompt Template System

Prompt templates live in `src/prompts/` and are organized by category:

```
src/prompts/
├── index.js        # Exports getPrompt(taskType, options) API
├── ocr.js          # documentOCR, receiptInvoiceParse, handwritingTranscription, tableExtraction
├── audio.js        # meetingTranscription, voiceCommand, speechTranslation
├── visual.js       # chartExtraction, formExtraction, screenAnalysis
├── text.js         # emailDraft, summarize, codeReview, generalTextTask
└── research.js     # researchPrompt, searchQueryGeneration
```

Usage:
```js
import { getPrompt } from "./prompts/index.js";

const prompt = getPrompt("ocr", { /* options */ });
// Returns the appropriate prompt string for the task type
```

---

## 7. Output Parsing

The `outputParser.js` module handles extracting structured data from model responses:

- **`parseJSON(text)`** — Finds and parses JSON from model output, handles markdown code fences
- **`validateSchema(data, schema)`** — Validates parsed JSON against a schema
- **`createCorrectionPrompt(originalText, error)`** — Generates a retry prompt for invalid JSON
- **`extractText(rawText)`** — Extracts plain text from structured responses

---

## 8. File & Media Handling

### 8.1 File Handler (`fileHandler.js`)

- Supports: PNG, JPG, JPEG, WebP, GIF, BMP (images); WebM, WAV, MP3, OGG, M4A (audio); PDF (documents)
- Max file size: 50MB
- MIME type detection + extension validation
- Drag-and-drop support
- File preview generation

### 8.2 PDF Processing

- Uses Mozilla's pdf.js for browser-side rendering
- Each PDF page rendered to canvas → data URL
- Multi-page processing with progress indicator
- Page selection UI

### 8.3 Webcam (`webcam.js`)

- Frame capture with quality settings
- Continuous capture mode for live OCR
- Front/rear camera selection (mobile)
- Screenshot annotation support

### 8.4 Audio Recorder (`audioRecorder.js`)

- Audio level meter (visual feedback)
- Recording duration display
- Pause/resume support
- Converts to 16kHz mono for Gemma 4

---

## 9. Web Integration (MCP)

### 9.1 MCP Client (`mcpClient.js`)

- Generic `mcpCall(tool, params)` function
- `search(query)` — web search
- `fetch(url)` — page content extraction
- Request caching (5-minute TTL for search results)
- Error handling for network failures and rate limits

### 9.2 Research Pipeline

1. Call `search(query)` via MCP
2. Call `fetch(topResult.url)` for top 1-3 results
3. Send search results + page content to Gemma 4
4. Return synthesized answer with source citations

---

## 10. Model Loading Pipeline

```js
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

### Caching

Transformers.js uses the browser's **Cache API**. After first load (~1-2 GB download), subsequent visits are much faster.

---

## 11. Inference Pipeline

### 11.1 Preparing Inputs

```js
const messages = [
  { role: "user", content: [
    { type: "image", image: imageDataUrl },  // optional
    { type: "audio", audio: audioUrl },       // optional
    { type: "text", text: "Your prompt" },
  ]},
];

const prompt = processor.apply_chat_template(messages, {
  add_generation_prompt: true,
  enable_thinking: false,
});

const inputs = processor(prompt, image, audio, { add_special_tokens: false });
```

### 11.2 Generation with Streaming

```js
const streamer = new TextStreamer(processor.tokenizer, {
  skip_prompt: true,
  skip_special_tokens: true,
  callback_function: (text) => {
    // Stream each token to UI
  },
});

const outputs = await model.generate({
  ...inputs,
  max_new_tokens: 1024,
  do_sample: false,
  streamer,
  stopping_criteria: [stoppingCriteria],
});
```

---

## 12. Performance

| Metric | Value |
|---|---|
| Download size | ~1-2 GB (first load) |
| First load time | 30-120 seconds |
| Inference speed | 5-20 tokens/sec (GPU dependent) |
| VRAM usage | ~2-4 GB |
| Total RAM | ~4-8 GB |

### Per-Task Token Budgets

| Task | Max Tokens |
|---|---|
| OCR | 512 |
| Document parse | 1024 |
| Handwriting | 512 |
| Chart extract | 1024 |
| Table extract | 1024 |
| Form extract | 1024 |
| Screen analysis | 1024 |
| Transcription | 2048 |
| Voice command | 512 |
| Research | 2048 |
| Email draft | 1024 |
| Summarize | 512 |
| Text task | 1024 |

---

## 13. Browser Compatibility

| Browser | Support |
|---|---|
| Chrome 113+ | Full support |
| Edge 113+ | Full support |
| Firefox | No WebGPU |
| Safari | No WebGPU |

---

## 14. Security & Privacy

- **All inference is local** — no data leaves the device
- **No API keys** required for core functionality
- **No server** required
- **Model files** downloaded once from HuggingFace and cached
- **Media permissions** handled by browser
- **Web features** (MCP) are optional — local-only mode always available

---

## 15. Glossary

| Term | Definition |
|---|---|
| **WebGPU** | Modern browser API for GPU compute |
| **ONNX** | Open Neural Network Exchange format |
| **Transformers.js** | Hugging Face port for browser inference |
| **Q4 quantization** | 4-bit quantization, ~8x smaller than FP32 |
| **KV cache** | Key-Value cache for autoregressive generation |
| **Web Worker** | Background JS thread for non-blocking inference |
| **TextStreamer** | Token-by-token streaming utility |
| **TTFT** | Time To First Token |
| **TPS** | Tokens Per Second |
| **MCP** | Model Context Protocol for tool calling |
