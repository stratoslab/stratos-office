# Stratos Office — AI Office Assistant

> **Private, browser-only AI that runs entirely on your device. No data ever leaves your browser.**

Stratos Office is an AI office assistant powered by Google's **Gemma 4** running locally in your browser via WebGPU. Upload a document, record your voice, or type a request — everything is processed on your machine.

## How It Works

### 1. Load the Model
When you first open Stratos Office, click **"Load Gemma 4"**. The app downloads the model (~1-2 GB) and caches it in your browser. This happens once — every visit after that is instant.

### 2. Pick a Task
Choose from five categories of tasks:

| Category | Tasks |
|---|---|
| **Documents** | OCR, Receipt/Invoice parsing, Handwriting transcription, Table extraction, Form extraction |
| **Visual** | Chart/graph data extraction, Screen/UI analysis |
| **Audio** | Meeting transcription, Voice commands, Speech-to-text translation |
| **Text** | Email drafting, Summarization, Code review |
| **Research** | Web research with live search and synthesis |

### 3. Provide Input
Each task accepts the input type it needs:
- **Text** — type your instructions directly
- **Image** — upload a file (PNG, JPG, WebP), drag-and-drop, or capture with your webcam
- **Audio** — upload a file (WebM, WAV, MP3) or record with your microphone
- **PDF** — upload a PDF, which is rendered page-by-page for processing

### 4. Get Results
The model processes your input locally and streams the response back in real time. Results appear as formatted text, structured JSON, rendered markdown, or interactive tables. You can copy to clipboard or download as TXT, JSON, or Markdown.

### 5. Track & Export
Every task is saved to your history. Search, revisit, or export past results at any time.

## Why Local?

| | Cloud AI | Stratos Office |
|---|---|---|
| Data leaves your device | Yes | No |
| API keys required | Yes | No |
| Server needed | Yes | No |
| Works offline (after first load) | No | Yes |
| Per-request cost | Yes | Free |
| Privacy | Depends on provider | Complete |

## System Requirements

- **Browser**: Chrome 113+ or Edge 113+ (WebGPU required)
- **GPU**: Any modern GPU (integrated or discrete)
- **RAM**: 4 GB+ recommended
- **Storage**: ~2 GB for model cache

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` in Chrome or Edge.

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — Technical architecture
- [User Guide](./docs/USER_GUIDE.md) — How to use each task
- [Design System](./docs/DESIGN.md) — UI guidelines and design tokens
- [Contributing](./docs/CONTRIBUTING.md) — How to add new tasks
- [Task List](./docs/task_list.md) — Development roadmap

## Privacy

All inference runs locally on your device. No prompts, documents, images, or audio are sent to any external server. The model files are downloaded once from HuggingFace and cached in your browser. Optional web research features send search queries externally — toggle **Offline Mode** in Settings to disable them entirely.

## Tech Stack

- **Model**: Gemma 4 E2B (2B parameters, Q4 quantized, ONNX format)
- **Runtime**: Transformers.js + ONNX Runtime Web on WebGPU
- **Frontend**: Vite + React
- **Architecture**: Web Worker for inference, main thread for UI

## License

Private project. All rights reserved.
