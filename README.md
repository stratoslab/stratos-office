# Stratos Office — AI Office Assistant

> **Private, browser-only AI office assistant powered by Gemma 4 on WebGPU.**

Stratos Office is a browser-based AI office assistant that runs **100% locally** on your device. No prompts, documents, or audio ever leave your browser. It uses Google's **Gemma 4 E2B** model with ONNX on WebGPU for multimodal inference — text, images, and audio all processed on-device.

## Capabilities

| Category | Tasks |
|---|---|
| **Documents** | Document OCR, Receipt/Invoice parsing, Handwriting transcription, Table extraction, Form field extraction |
| **Visual** | Chart/graph data extraction, Screen/UI analysis |
| **Audio** | Meeting transcription, Voice commands, Speech-to-text translation |
| **Text** | Email drafting, Summarization, Code review, General text tasks |
| **Research** | Web research with search + page content synthesis (optional, via MCP) |

## Key Features

- **100% client-side** — no backend server, no API keys, no data leaves your device
- **WebGPU accelerated** — runs on your GPU via the browser
- **Multimodal** — accepts text, images (PNG, JPG, WebP), audio (WebM, WAV, MP3), and PDFs
- **Task-based UI** — pick a task type, provide input, get structured output
- **Task history** — track and revisit past tasks
- **Export** — download results as TXT, JSON, or Markdown
- **Offline mode** — once the model is cached, everything works without internet

## Tech Stack

- **Model**: `onnx-community/gemma-4-E2B-it-ONNX` (Gemma 4 2B, Q4 quantized)
- **Runtime**: Transformers.js + ONNX Runtime Web on WebGPU
- **Frontend**: Vite + React (swappable to any framework)
- **Architecture**: Web Worker for inference, main thread for UI
- **Optional**: TinyFish MCP for web search/fetch integration

## Quick Start

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` in Chrome or Edge.

## Browser Requirements

- Chrome 113+ or Edge 113+ (WebGPU required)
- ~2-4 GB VRAM available
- 4+ GB RAM recommended

## Project Structure

```
stratos-office/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main application UI
│   ├── worker.js             # Web Worker: model loading + inference
│   ├── taskRouter.js         # Task routing logic
│   ├── outputParser.js       # JSON extraction from model output
│   ├── fileHandler.js        # File upload utility
│   ├── webcam.js             # Webcam capture
│   ├── audioRecorder.js      # Microphone recording
│   ├── mcpClient.js          # MCP protocol client (optional)
│   ├── prompts/              # Prompt template library
│   │   ├── index.js
│   │   ├── ocr.js
│   │   ├── audio.js
│   │   ├── visual.js
│   │   ├── text.js
│   │   └── research.js
│   └── components/           # UI components
│       ├── TaskSelector.jsx
│       ├── InputArea.jsx
│       ├── OutputDisplay.jsx
│       ├── TaskHistory.jsx
│       └── Settings.jsx
├── public/
│   ├── stratos-logo-white.png
│   └── stratos-favicon.png
├── index.html
├── package.json
└── vite.config.js
```

## Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Full technical architecture
- [USER_GUIDE.md](./USER_GUIDE.md) — How to use each task
- [CONTRIBUTING.md](./CONTRIBUTING.md) — How to add new tasks
- [DESIGN.md](./DESIGN.md) — Design system and UI guidelines
- [task_list.md](./task_list.md) — Development task list

## Privacy

All inference runs locally. No data is sent to external servers. The model files are downloaded once from HuggingFace and cached in your browser. Optional web research features (via MCP) do send search queries externally — a local-only mode is always available.

## License

Private project. All rights reserved.
