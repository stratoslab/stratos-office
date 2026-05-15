# Stratos Office — Development Plan

> **Goal:** Transform the Canva-generated UI shell into a fully functional AI Office Assistant with real Gemma 4 WebGPU inference, model download UX, task execution, and all integrations.

---

## Current State

### What We Have (UI Shell)
- **React + TypeScript + Tailwind CSS** app from Canva
- **7 components** fully built as visual mockups:
  - `LandingPage.tsx` — Landing with "Load Gemma 4" button
  - `LoadingPage.tsx` — Progress bar (currently simulated with fake timer)
  - `DashboardPage.tsx` — Quick-start task cards grid
  - `Sidebar.tsx` — Task category navigation
  - `TopBar.tsx` — Header with search, notifications, user
  - `HistoryDrawer.tsx` — Task history panel (mock data)
  - `SettingsDrawer.tsx` — Settings panel (sliders, toggles — not wired)
- **Design system** in `index.css` — Tailwind theme with dark navy/cyan palette, glass-morphism, animations
- **Dependencies**: `motion` (animations), `lucide-react` (icons), `@tailwindcss/vite`, `react`, `vite`

### What's Missing (Everything Functional)
- ❌ No Gemma 4 model loading
- ❌ No Web Worker for inference
- ❌ No Transformers.js integration
- ❌ No task routing or execution
- ❌ No file upload / webcam / microphone
- ❌ No real model download progress
- ❌ No model state management
- ❌ No actual task input/output flow
- ❌ Settings not wired to anything
- ❌ History not persisted
- ❌ Footer stats are hardcoded

---

## Architecture Decision

### Tech Stack
| Layer | Choice | Why |
|---|---|---|
| **Framework** | React + TypeScript (keep Canva output) | Already built, good DX |
| **Styling** | Tailwind CSS v4 (keep) | Already configured, matches design |
| **Animations** | motion/react (keep) | Already in use, smooth transitions |
| **ML Runtime** | Transformers.js + ONNX Runtime Web | Browser-only Gemma 4 inference |
| **Model** | `onnx-community/gemma-4-E2B-it-ONNX` | Only variant that fits in browser WebGPU |
| **Inference** | Web Worker (separate thread) | Non-blocking UI during generation |
| **State** | React context + useReducer | Shared model state across components |
| **Storage** | IndexedDB (via idb-keyval) | Task history persistence |

### Key Shift from Canva Output
The Canva app uses `@google/genai` (Gemini API — cloud-based). We replace this entirely with:
- `@huggingface/transformers` for local Gemma 4 inference
- Web Worker for model loading and generation
- No API keys needed, no data leaves the device

---

## Phase 1: Foundation — Model Engine & State Management

### 1.1 Set Up Dependencies
- Remove `@google/genai`, `express`, `dotenv` (not needed for browser-only app)
- Add `@huggingface/transformers` (forked version from Stratos-Gemma-4 project)
- Add `idb-keyval` for IndexedDB task history
- Keep: `react`, `react-dom`, `motion`, `lucide-react`, `tailwindcss`, `vite`

### 1.2 Create Model State Context
**File:** `src/context/ModelContext.tsx`

Manages the entire model lifecycle as a shared state:

```typescript
type ModelStage = 'idle' | 'checking' | 'unsupported' | 'downloading' | 'loading' | 'ready' | 'error';

interface ModelState {
  stage: ModelStage;
  progress: number;           // 0-100
  currentFile: string;        // "Downloading tokenizer.json..."
  totalFiles: number;
  completedFiles: number;
  estimatedTimeRemaining: string;
  error: string | null;
  tps: number | null;
  numTokens: number | null;
  isGenerating: boolean;
}
```

- `ModelProvider` wraps the app
- `useModel()` hook for any component to read state
- `loadModel()` action to start download
- `interrupt()` action to stop generation
- `reset()` action to clear state

### 1.3 Create the Web Worker
**File:** `src/worker.ts`

Ported from `Stratos-Gemma-4/src/worker.js` with TypeScript types:

- `ModelSession` class with load/generate/interrupt/reset
- Fetch interceptor for download progress tracking
- Message protocol:
  - **In:** `check`, `load`, `generate`, `interrupt`, `reset`
  - **Out:** `check`, `loading`, `progress`, `ready`, `start`, `update`, `complete`, `error`

### 1.4 Wire LoadingPage to Real Model Loading
**Current:** Simulated progress bar with `setInterval`
**New:**
- Listen to worker `progress` messages → update real progress
- Listen to `loading` messages → update `currentFile` text
- Listen to `ready` → transition to dashboard
- Listen to `error` → show error state with retry button
- Calculate ETA based on download speed
- Show per-file progress (tokenizer → config → encoders → decoder)

### 1.5 Wire LandingPage WebGPU Check
**Current:** Button always enabled
**New:**
- On mount, send `check` to worker
- If `supported: false`, disable button, show "WebGPU Unavailable" message with browser requirements
- If `supported: true`, button enabled

---

## Phase 2: Task System — Router, Prompts, Parser

### 2.1 Task Router
**File:** `src/lib/taskRouter.ts`

- Define `TaskType` enum (all 13 task types)
- `TASK_CATEGORIES` mapping for sidebar grouping
- `getTaskConfig(taskType)` → returns `max_new_tokens`, input requirements
- `handleTask(task, workerRef)` → sends task to worker
- `cancelTask(taskId, workerRef)` → cancels running task

### 2.2 Prompt Templates
**Files:** `src/prompts/` (port from Stratos-Gemma-4)

- `ocr.ts` — documentOCR, receiptInvoiceParse, handwritingTranscription, tableExtraction
- `audio.ts` — meetingTranscription, voiceCommand, speechTranslation
- `visual.ts` — chartExtraction, formExtraction, screenAnalysis
- `text.ts` — emailDraft, summarize, codeReview, generalTextTask
- `research.ts` — researchPrompt, searchQueryGeneration
- `index.ts` — `getPrompt(taskType, options)` API

### 2.3 Output Parser
**File:** `src/lib/outputParser.ts`

- `parseJSON(text)` — extract JSON from model response
- `validateSchema(data, schema)` — validate structured output
- `extractText(rawText)` — get plain text from response

### 2.4 Task History
**File:** `src/lib/taskHistory.ts`

- `saveTask(task)` → IndexedDB via idb-keyval
- `getTasks()` → retrieve all tasks
- `deleteTask(id)` → remove single task
- `clearAll()` → wipe history
- Task entry: `{ id, type, input, output, status, timestamp, duration }`

---

## Phase 3: Task Workspace — Input → Process → Output

### 3.1 Create TaskWorkspace Component
**File:** `src/components/workspace/TaskWorkspace.tsx`

This replaces the static `DashboardPage` when a task is selected. It's the core interaction surface:

```
┌─────────────────────────────────────────────────────┐
│  ← Back    Document OCR                    [Run]    │  Header
├─────────────────────────────────────────────────────┤
│                                                     │
│  Input Area                                         │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Upload] [Webcam] [Microphone]              │    │
│  │                                             │    │
│  │ Drop files here or use buttons above        │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
│  [Thinking mode: OFF]  [Max tokens: 512]            │  Options
├─────────────────────────────────────────────────────┤
│                                                     │
│  Output Area (appears after Run)                    │
│  ┌─────────────────────────────────────────────┐    │
│  │ [Copy] [Download ▼]                         │    │
│  │                                             │    │
│  │ Streaming text appears here...              │    │
│  │                                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 3.2 Input Components
**Files:** `src/components/workspace/`

- `FileUpload.tsx` — Drag-and-drop zone + file picker button
  - Validates file type (MIME + extension) and size (50MB max)
  - Shows preview (image thumbnail, audio waveform placeholder)
  - Supports: PNG, JPG, JPEG, WebP, GIF, BMP, WebM, WAV, MP3, OGG, M4A, PDF
- `WebcamCapture.tsx` — Inline webcam view
  - Start/stop camera
  - Capture frame → data URL
  - Front/rear camera toggle (mobile)
- `AudioRecorder.tsx` — Inline recording UI
  - Record/stop/pause
  - Visual audio level meter
  - Duration display
  - Converts to 16kHz mono for Gemma 4

### 3.3 Output Display
**File:** `src/components/workspace/OutputDisplay.tsx`

- Streaming text output with cursor animation
- JSON output with syntax highlighting (collapsible)
- Markdown rendering
- Copy to clipboard button
- Download dropdown (TXT, JSON, MD)
- Task status indicator (running, complete, error)

### 3.4 Wire Dashboard Cards to TaskWorkspace
**File:** `src/components/pages/DashboardPage.tsx` (modify)

- Each card's `onClick` → set active task type in context, show TaskWorkspace
- Add "Back to Dashboard" button in TaskWorkspace header
- Keep quick-start grid as default view

---

## Phase 4: Wire Everything Together

### 4.1 App.tsx — State Orchestration
**File:** `src/App.tsx` (modify)

Current flow: `landing → loading (fake) → dashboard`
New flow:
```
landing → loading (real model download) → dashboard
                                    ↓
                              TaskWorkspace (when task selected)
```

- Wrap everything in `ModelProvider`
- `stage` state driven by `ModelContext` (not local `useState`)
- Pass worker ref through context
- Connect footer stats to real `tps` and `numTokens` from context

### 4.2 Sidebar — Task Navigation
**File:** `src/components/layout/Sidebar.tsx` (modify)

- Each category click expands sub-items
- Sub-item click → sets active task type, opens TaskWorkspace
- "New Analysis" button → resets to dashboard
- Active task highlighted

### 4.3 HistoryDrawer — Real Data
**File:** `src/components/drawers/HistoryDrawer.tsx` (modify)

- Replace mock data with `getTasks()` from IndexedDB
- Click task → view full input/output
- Search/filter tasks
- Delete individual tasks
- Clear all with confirmation

### 4.4 SettingsDrawer — Functional Controls
**File:** `src/components/drawers/SettingsDrawer.tsx` (modify)

- Max tokens slider → updates context, affects next task
- Temperature slider → updates context
- Thinking mode toggle → updates context
- Offline mode toggle → disables web features
- Clear cache → clears IndexedDB + model cache
- Dark/light mode → toggles Tailwind theme
- Font size → updates CSS variable

---

## Phase 5: File Structure (Final)

```
stratos-office/
├── src/
│   ├── main.tsx                          # Entry point
│   ├── App.tsx                           # Root component (modified)
│   ├── index.css                         # Tailwind + custom styles (keep)
│   ├── worker.ts                         # Web Worker: model + inference (NEW)
│   ├── context/
│   │   └── ModelContext.tsx              # Model state management (NEW)
│   ├── lib/
│   │   ├── taskRouter.ts                 # Task routing logic (NEW)
│   │   ├── outputParser.ts               # JSON extraction (NEW)
│   │   └── taskHistory.ts                # IndexedDB history (NEW)
│   ├── prompts/
│   │   ├── index.ts                      # getPrompt() API (NEW)
│   │   ├── ocr.ts                        # OCR prompts (NEW)
│   │   ├── audio.ts                      # Audio prompts (NEW)
│   │   ├── visual.ts                     # Visual prompts (NEW)
│   │   ├── text.ts                       # Text prompts (NEW)
│   │   └── research.ts                   # Research prompts (NEW)
│   ├── components/
│   │   ├── pages/
│   │   │   ├── LandingPage.tsx           # Modified (WebGPU check)
│   │   │   ├── LoadingPage.tsx           # Modified (real progress)
│   │   │   └── DashboardPage.tsx         # Modified (task selection)
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx               # Modified (task navigation)
│   │   │   └── TopBar.tsx                # Keep as-is
│   │   ├── drawers/
│   │   │   ├── HistoryDrawer.tsx         # Modified (real data)
│   │   │   └── SettingsDrawer.tsx        # Modified (functional)
│   │   └── workspace/                    # NEW directory
│   │       ├── TaskWorkspace.tsx         # Main task interface
│   │       ├── FileUpload.tsx            # File upload component
│   │       ├── WebcamCapture.tsx         # Webcam component
│   │       ├── AudioRecorder.tsx         # Audio recording component
│   │       └── OutputDisplay.tsx         # Output display component
│   └── types/
│       └── index.ts                      # Shared TypeScript types (NEW)
├── public/
│   ├── stratos-logo-white.png
│   ├── stratos-favicon.png
│   └── background.jpg
├── docs/                                 # Documentation
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── .gitignore
```

---

## Phase 6: Model Download UX Details

### Download Progress States

The model downloads ~15 files totaling ~1-2 GB. We track and display each:

| Stage | Files | Display Text |
|---|---|---|
| 1 | config.json, generation_config.json, processor_config.json | "Loading configuration..." |
| 2 | tokenizer_config.json, tokenizer.json | "Loading tokenizer..." |
| 3 | preprocessor_config.json | "Loading preprocessor..." |
| 4 | audio_encoder_fp16.onnx + .data | "Downloading audio encoder..." |
| 5 | vision_encoder_fp16.onnx + .data | "Downloading vision encoder..." |
| 6 | embed_tokens_q4f16.onnx + .data | "Downloading token embeddings..." |
| 7 | decoder_model_merged_q4f16.onnx + .data | "Downloading model decoder..." |
| 8 | — | "Initializing WebGPU..." |
| 9 | — | "Model ready!" |

### Progress Calculation
- Transformers.js `progress_callback` provides per-file and total progress
- `progress_total` → main progress bar (0-100%)
- `download` status → current file name for display text
- ETA calculated from: `(total_bytes - downloaded_bytes) / bytes_per_second`

### Error Handling
- Network failure → show error message + "Retry" button
- WebGPU unsupported → show browser requirements on landing page
- Out of memory → suggest closing other tabs, reduce max tokens
- Corrupted cache → "Clear cache and retry" option

---

## Phase 7: Implementation Order

### Sprint 1: Model Engine (Days 1-2)
1. Set up dependencies, clean package.json
2. Create `worker.ts` with model loading
3. Create `ModelContext.tsx` with state management
4. Wire `LandingPage` WebGPU check
5. Wire `LoadingPage` to real download progress
6. Test: model downloads and reaches "ready" state

### Sprint 2: Task System (Days 3-4)
7. Create `taskRouter.ts` with task types and routing
8. Create all prompt template files
9. Create `outputParser.ts`
10. Create `taskHistory.ts` with IndexedDB
11. Add `task` message type to worker
12. Test: send a text task, get streaming response

### Sprint 3: Task Workspace (Days 5-7)
13. Create `TaskWorkspace.tsx` layout
14. Create `FileUpload.tsx` with drag-and-drop
15. Create `WebcamCapture.tsx`
16. Create `AudioRecorder.tsx`
17. Create `OutputDisplay.tsx` with streaming
18. Wire dashboard cards to open TaskWorkspace
19. Test: run OCR task with image, see output

### Sprint 4: Wire Everything (Days 8-9)
20. Modify `Sidebar.tsx` for task navigation
21. Modify `HistoryDrawer.tsx` with real data
22. Modify `SettingsDrawer.tsx` with functional controls
23. Modify `App.tsx` to use ModelContext
24. Wire footer stats to real TPS/token count
25. Test: full flow from landing → task → output → history

### Sprint 5: Polish (Day 10)
26. Error handling for all failure modes
27. Loading states for all async operations
28. Keyboard shortcuts
29. Accessibility audit (ARIA labels, focus management)
30. Performance optimization (tensor disposal, memory cleanup)

---

## Key Integration Points

### Worker ↔ Main Thread Communication

```typescript
// Main thread → Worker
worker.postMessage({ type: "load" });
worker.postMessage({ type: "generate", data: { messages, enableThinking } });
worker.postMessage({ type: "task", data: { taskId, taskType, input, options } });
worker.postMessage({ type: "interrupt" });

// Worker → Main thread
{ status: "progress", progress: 47 }
{ status: "loading", data: "Downloading vision encoder..." }
{ status: "ready" }
{ status: "update", output: " token text" }
{ status: "complete", numTokens: 348, tps: 12.4 }
{ status: "task_result", data: { taskId, result, error } }
{ status: "error", data: "Error message" }
```

### ModelContext → Component Flow

```
ModelContext
├── stage → LandingPage (enable/disable button)
├── stage → LoadingPage (show/hide, progress bar)
├── stage → App.tsx (which screen to show)
├── progress → LoadingPage (progress bar width)
├── currentFile → LoadingPage (status text)
├── tps, numTokens → App.tsx footer
├── isGenerating → TaskWorkspace (show stop button)
└── loadModel(), interrupt(), reset() → All components
```

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Model too large for some GPUs | Users can't run app | Detect VRAM, show warning, suggest lighter tasks |
| Download takes too long | User abandonment | Show accurate ETA, allow resume, cache aggressively |
| WebGPU not available | App doesn't work | Clear message on landing page, browser requirements |
| Memory exhaustion during long tasks | Browser crash | Token limits, context truncation, memory warnings |
| Transformers.js fork compatibility | Build failures | Use same fork version as Stratos-Gemma-4, test early |
