# 01_REPO_MAP.md — stratos-office

## File Tree (key paths)

```
stratos-office/
├── ANALYSIS/                    # This analysis output
├── docs/                       # Documentation
│   ├── architecture.html      # (main branch only)
│   └── architecture.json       # (main branch only)
├── public/                     # Static assets
│   ├── _headers                # Vercel headers config
│   ├── background.jpg
│   ├── pdf.worker.min.mjs      # PDF.js worker bundle
│   └── stratos-*.png           # Logo/favicon
├── src/
│   ├── App.tsx                 # Root component
│   ├── audioRecorder.ts        # Web Audio API recording
│   ├── documentChunker.ts      # PDF → text chunking
│   ├── fileHandler.ts          # File upload/drag-drop
│   ├── historyStore.ts         # IndexedDB task history
│   ├── index.css               # Global styles
│   ├── main.tsx                # React entry point
│   ├── mcpClient.ts            # TinyFish MCP web search client
│   ├── outputParser.ts         # JSON/markdown output parsing
│   ├── pipelineTemplates.ts    # Multi-step pipeline definitions
│   ├── settingsStore.ts        # localStorage settings
│   ├── taskRouter.ts           # Task config registry + message builder
│   ├── webcamCapture.ts        # Camera capture utility
│   ├── worker.js               # Web Worker for model inference
│   ├── components/
│   │   ├── ui/
│   │   │   └── WebcamCapture.tsx
│   │   ├── drawers/
│   │   │   ├── HistoryDrawer.tsx
│   │   │   └── SettingsDrawer.tsx
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   └── TopBar.tsx
│   │   └── pages/
│   │       ├── DashboardPage.tsx
│   │       └── LoadingPage.tsx
│   ├── context/
│   │   ├── ModelContext.tsx    # Model loading state
│   │   ├── PipelineContext.tsx
│   │   └── TaskContext.tsx
│   ├── prompts/
│   │   ├── index.ts
│   │   ├── audio.ts
│   │   ├── documents.ts
│   │   ├── privacy.ts
│   │   ├── research.ts
│   │   ├── text.ts
│   │   └── visual.ts
│   ├── test/                   # Vitest test suite
│   │   ├── setup.ts
│   │   ├── bug1-race-condition.test.tsx
│   │   ├── bug2-progress-callback.test.ts
│   │   ├── bug3-init-label.test.tsx
│   │   ├── exportFilename.test.ts
│   │   ├── fileHandler.test.ts
│   │   ├── historyStore.test.ts
│   │   ├── outputParser.test.ts
│   │   ├── pipelineIntegration.test.tsx
│   │   ├── preservation-message-mappings.test.tsx
│   │   ├── preservation-progress-callback.test.ts
│   │   ├── promptTemplates.test.ts
│   │   └── taskRouter.test.ts
│   └── types/
│       └── index.ts
├── package.json
├── package-lock.json
├── tsconfig.json
├── vite.config.ts
├── vitest.config.ts
├── vercel.json
└── index.html
```

## Source Code Breakdown

### Core Inference Pipeline
| File | Purpose |
|---|---|
| `src/worker.js` | Web Worker running Transformers.js/ONNX model |
| `src/context/ModelContext.tsx` | React context for model loading state |
| `src/taskRouter.ts` | Task configs (37 tasks), message builder |
| `src/outputParser.ts` | Parse JSON from model output |
| `src/pipelineTemplates.ts` | Multi-step pipeline definitions |

### Input Handling
| File | Purpose |
|---|---|
| `src/fileHandler.ts` | Drag-drop, file validation, base64 encode |
| `src/audioRecorder.ts` | MediaRecorder API, live level meter |
| `src/webcamCapture.ts` | getUserMedia camera capture |
| `src/documentChunker.ts` | PDF text extraction + chunking |

### UI Layer
| File | Purpose |
|---|---|
| `src/App.tsx` | Main layout, routing |
| `src/components/layout/Sidebar.tsx` | Task category navigation |
| `src/components/pages/DashboardPage.tsx` | Task selection UI |
| `src/components/pages/LoadingPage.tsx` | Model loading screen |
| `src/components/drawers/HistoryDrawer.tsx` | Task history panel |
| `src/components/drawers/SettingsDrawer.tsx` | Settings panel |

### Data / State
| File | Purpose |
|---|---|
| `src/historyStore.ts` | IndexedDB persistence for task history |
| `src/settingsStore.ts` | localStorage for user preferences |
| `src/mcpClient.ts` | TinyFish MCP API client |

### Prompts (per category)
| File | Tasks covered |
|---|---|
| `src/prompts/documents.ts` | OCR, parse, handwriting, table, form, pdf_qa, contract, redline |
| `src/prompts/visual.ts` | chart, screen, wireframe, slide, whiteboard, object_detect |
| `src/prompts/audio.ts` | transcription, meeting_minutes, voice_to_email, multilingual, interview |
| `src/prompts/text.ts` | email_draft, email_reply, tone_rewriter, summarize, meeting_prep, report, code, general |
| `src/prompts/research.ts` | research, deep_doc_qa |
| `src/prompts/privacy.ts` | medical_summarizer, legal_analyzer, financial_parser |

## Branch Comparison Summary

### `feat/ui-design-alignment` (vs upstream/main)
Large deletion of pipeline workspace components. Removes DemoGate. Mobile responsive redesign + audio UX fixes. Adds video transcription support.

### `fix/model-loading-bugs` (vs upstream/main)
- 5 model loading bug fixes (stuck on Checking, progress bar, init label, stale config, COEP)
- Replaces Tailwind custom colors with CSS variables
- Refactors worker to use plain JS with CDN transformers import
- Adds comprehensive docs (ARCHITECTURE.md, DESIGN.md, CONTRIBUTING.md, DEVELOPMENT_PLAN.md, USER_GUIDE.md)
- Adds task_list.md
- Adds .kiro spec files

## Test Suite

- 13 test files in `src/test/`
- Uses Vitest + jsdom + @testing-library
- Setup file: `src/test/setup.ts` (imports `fake-indexeddb`)
- No `npm test` script — run via `vitest run`
- Lint: `tsc --noEmit` passes ✅
- TypeScript config: `tsconfig.json` (strict mode)

## Package Metadata

```
name: stratos-office
private: true
version: 0.1.0
type: module
scripts: dev, build, preview, clean, lint
dependencies: react@19, react-dom@19, react-markdown, remark-gfm, highlight.js, pdfjs-dist@4, motion
devDependencies: vite@6, typescript@5.8, tailwindcss@4, vitest@4, jsdom, @testing-library/*
```