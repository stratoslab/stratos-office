# Stratos Office

**Private, browser-only AI office assistant. No server. No API keys. No data leaves your device.**

Stratos Office runs Google's Gemma 4 E2B entirely in your browser using WebGPU. Every task — OCR, transcription, contract analysis, code review, web research — happens locally on your machine.

---

## Features

### 30+ AI Tasks Across 6 Categories

**Documents**
- Document OCR — extract text from any scanned image
- Receipt / Invoice Parser — structured JSON from photos
- Handwriting Transcription — convert handwritten notes to typed text
- Table Extraction — image tables to Markdown or JSON
- Form Field Extraction — extract all fields and values from form images
- Multi-Page PDF Q&A — ask questions across entire documents (128K context)
- Contract Analyzer — risk summary, key clauses, flagged terms
- Redline Comparison — color-coded diff between two document versions

**Visual**
- Chart / Graph Extraction — data points, trends, axis labels from chart images
- Screen / UI Analysis — describe UI elements in any screenshot
- Wireframe to HTML — convert sketches or mockups to working HTML/CSS
- Slide Analyzer — speaker notes and summary from presentation screenshots
- Whiteboard OCR — clean typed notes from whiteboard photos
- Object Detection — bounding boxes with labels overlaid on images

**Audio**
- Meeting Transcription — formatted transcript with speaker turns
- Meeting Minutes — structured minutes with action items and owners
- Voice to Email — speak a message, get a polished email draft
- Multilingual Transcription — transcribe and translate in one pass (140+ languages)
- Interview Transcriber — formatted Q&A transcript from recordings

**Text & Writing**
- Email Draft — compose professional emails from a description
- Email Reply Drafts — three reply options with different tones
- Tone Rewriter — rewrite any text in Professional, Casual, Formal, Friendly, Concise, or Persuasive tone
- Summarization — bullet-point summaries from text, images, or audio
- Meeting Prep Brief — talking points and questions from an agenda
- Report Generator — formatted report from rough bullet points
- Code Review — issues with severity badges, suggestions, overall assessment
- General Text — free-form chat with the model

**Research**
- Web Research — synthesized answer with inline citations from live sources
- Deep Document Q&A — question-answer over long documents using full context window

**Privacy-First Specialized**
- Medical Document Summarizer — plain-language summary of lab results and records
- Legal Document Analyzer — key terms, obligations, and risk flags from contracts and NDAs
- Financial Statement Parser — structured transaction data from bank statements and tax docs

### Everything Else
- Token-by-token streaming output
- Thinking Mode (chain-of-thought) for complex tasks
- Export results as TXT, JSON, Markdown, or HTML
- Full task history — 200 entries, persists across sessions (IndexedDB)
- Webcam capture for image tasks
- In-browser audio recording with live level meter
- PDF page range selector for large documents
- Offline Mode — disable all web features for complete air-gap privacy
- Dark and light theme

---

## System Requirements

| | |
|---|---|
| **Browser** | Chrome 113+ or Edge 113+ |
| **GPU** | Any WebGPU-capable GPU (integrated or discrete) |
| **RAM** | 4 GB minimum, 8 GB recommended |
| **Storage** | ~2 GB for model cache (downloaded once) |

Firefox and Safari are not supported — WebGPU is required.

---

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` in Chrome or Edge.

On first launch, click **Load Gemma 4** to download the model (~1–2 GB). This happens once and is cached — every subsequent visit loads in seconds.

```bash
npm run build    # Production build
npm run test     # Run property-based tests
```

---

## Privacy

All inference runs locally. No prompts, documents, images, or audio are ever sent to any external server.

The one exception is **Web Research**, which calls the [TinyFish](https://tinyfish.ai) Search and Fetch APIs. This requires a free TinyFish API key — you enter it once in Settings and it's stored only in your browser's `localStorage`. It's never sent anywhere except to `api.tinyfish.ai` over HTTPS.

Toggle **Offline Mode** in Settings to disable all web features entirely and run in fully air-gapped mode.

---

## Tech Stack

| | |
|---|---|
| **Model** | Gemma 4 E2B — 2.3B effective params, Q4F16, ONNX |
| **ML Runtime** | Transformers.js v4 + ONNX Runtime Web on WebGPU |
| **Inference thread** | Web Worker (non-blocking) |
| **Frontend** | React 18 + TypeScript + Vite |
| **Styling** | Tailwind CSS v4 |
| **Animations** | Framer Motion |
| **Icons** | Google Material Symbols Outlined |
| **PDF** | pdfjs-dist v4 |
| **Markdown** | react-markdown + remark-gfm + highlight.js |
| **History** | IndexedDB |
| **Settings** | localStorage |
| **Web search** | TinyFish MCP (optional) |

---

## Documentation

| | |
|---|---|
| [Architecture](./docs/ARCHITECTURE.md) | Modules, data flow, worker protocol, all data models |
| [Design System](./docs/DESIGN.md) | Colors, typography, components, motion, accessibility |
| [Development Plan](./docs/DEVELOPMENT_PLAN.md) | Implementation phases and roadmap |
| [Web Search Setup](./docs/WEB_SEARCH_SETUP.md) | TinyFish API key flow, UX design, implementation guide |
| [Contributing](./docs/CONTRIBUTING.md) | How to add new tasks |
| [User Guide](./docs/USER_GUIDE.md) | How to use every task |

---

## API Reference

### Model API (`worker.js`)

| Method | Description |
|--------|-------------|
| `load()` | Download and initialize Gemma 4 E2B model (~1–2 GB, cached) |
| `generate(prompt)` | Run inference on a text prompt, returns full response |
| `task(messages, taskType)` | Run multimodal task with system prompt routing, streaming output |
| `interrupt()` | Cancel ongoing generation mid-stream |
| `reset()` | Clear model state and cache |

### Task Context API (`TaskContext`)

| Method | Description |
|--------|-------------|
| `selectTask(taskType)` | Set active task type |
| `setInput(input)` | Set task input (file, text, or both) |
| `submitTask()` | Execute the active task |
| `cancelTask()` | Cancel running task |
| `clearOutput()` | Clear output panel |

### File Handler API (`fileHandler.ts`)

| Method | Description |
|--------|-------------|
| `validate(file, taskType)` | Validate MIME type + 50 MB size limit |
| `readAsDataURL(file)` | Convert image to base64 data URL |
| `extractAudio(file)` | Decode audio → 16 kHz mono Float32Array |
| `extractPDFText(file)` | Extract text from PDF using pdfjs-dist |
| `estimateTokens(text)` | Heuristic: `chars / 4` |

### Audio Recorder API (`audioRecorder.ts`)

| Method | Description |
|--------|-------------|
| `start()` | Begin recording from microphone |
| `pause()` / `resume()` | Pause or resume recording |
| `stop()` | Stop and decode to 16 kHz mono PCM Float32Array |

### Web Search API (`mcpClient.ts`)

| Method | Description |
|--------|-------------|
| `search(query)` | Search via TinyFish API (`GET api.search.tinyfish.ai`) |
| `fetchContent(url)` | Fetch single page as Markdown |
| `fetchMultiple(urls)` | Batch fetch multiple URLs |

### Settings API (`settingsStore.ts`)

| Key | Type | Description |
|-----|------|-------------|
| `stratos-settings` | object | `{ offlineMode, thinkingModeDefault, theme }` |
| `stratos-tinyfish-key` | string | TinyFish API key (optional) |

### History API (`historyStore.ts`)

| Method | Description |
|--------|-------------|
| `addEntry(entry)` | Save task entry to IndexedDB |
| `getAllEntries()` | Fetch all entries sorted by timestamp desc |
| `deleteEntry(id)` | Delete a specific entry |
| `clearAll()` | Clear all history |

---

## License

Private project. All rights reserved.
