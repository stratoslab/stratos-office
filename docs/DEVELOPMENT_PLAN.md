# Stratos Office — Development Plan

> **Goal:** Implement the Stratos Office Full Suite — a complete, production-quality browser-only AI office assistant with 30+ task types, beautiful UI, and full Gemma 4 E2B WebGPU inference.

This plan is derived from the formal spec in `.kiro/specs/stratos-office-full-suite/`. The authoritative task list is in `.kiro/specs/stratos-office-full-suite/tasks.md`. This document provides the high-level roadmap and context.

---

## Current State

The existing codebase has:
- ✅ Working model loading pipeline (`worker.js`, `ModelContext.tsx`)
- ✅ Landing page, loading page with real progress, basic dashboard shell
- ✅ Sidebar, TopBar, HistoryDrawer, SettingsDrawer (UI shells, not wired)
- ✅ Material Symbols icon system (`MaterialIcon.tsx`)
- ✅ Design tokens in `index.css` (dark navy/cyan palette, glass-morphism)
- ✅ React + TypeScript + Vite + Tailwind + Framer Motion stack
- ❌ No task routing or execution
- ❌ No file upload / webcam / microphone
- ❌ No output parsing or prompt templates
- ❌ No real history persistence (IndexedDB)
- ❌ No settings persistence (localStorage)
- ❌ No task workspace UI

---

## Architecture Overview

See `ARCHITECTURE.md` for the full technical reference. Key decisions:

1. **Additive extension** — existing `ModelContext`, `worker.js`, and layout components are preserved and extended
2. **Worker owns all inference** — main thread never calls Transformers.js directly
3. **`TaskContext` layered on top** — new context for task state, lifecycle, streaming output
4. **`outputParser.ts` is pure** — no browser APIs, fully unit-testable in Node.js
5. **IndexedDB for history, localStorage for settings**
6. **Two-pass pipeline** for `meeting_minutes` and `voice_to_email` (transcribe → structure)
7. **MCP is optional** — Research degrades gracefully when offline or when calls fail

---

## Implementation Phases

### Phase 1 — Foundation (Types + Pure Utilities)

**Tasks 1.1–2.2**

- Extend `src/types/index.ts`: 13 → 30+ task types, all structured output interfaces, `TaskConfig`, `TaskEntry`, `AppSettings`, `ParseError`
- Install new dependencies: `pdfjs-dist`, `react-markdown`, `remark-gfm`, `highlight.js`
- Create `src/outputParser.ts`: `parseJSON`, `extractText`, `markdownTableToJSON`, `jsonToMarkdownTable`
- Create `src/settingsStore.ts`: `loadSettings`, `saveSettings`, `updateSetting`

**Milestone:** Types compile, outputParser unit tests pass.

---

### Phase 2 — Infrastructure Modules

**Tasks 3.1–3.5**

- `src/historyStore.ts` — IndexedDB CRUD, FIFO eviction at 200 entries
- `src/fileHandler.ts` — validate (MIME + size), readAsDataURL, generatePreview, estimateTokens, extractPDFText (pdfjs-dist)
- `src/audioRecorder.ts` — MediaRecorder, 16kHz PCM conversion, level meter, 30-min limit
- `src/webcamCapture.ts` — getUserMedia, frame capture
- `src/mcpClient.ts` — search + fetchContent with 10s timeouts, content truncation, caching, graceful degradation

**Milestone:** File upload validates correctly, PDF text extraction works, audio records and converts.

---

### Phase 3 — Prompt Templates + Task Router

**Tasks 4.1–5.1**

- `src/prompts/documents.ts` — 8 document task prompts
- `src/prompts/visual.ts` — 6 visual task prompts
- `src/prompts/audio.ts` — 5 audio task prompts
- `src/prompts/text.ts` — 8 text task prompts
- `src/prompts/research.ts` — 2 research prompts
- `src/prompts/privacy.ts` — 3 privacy task prompts
- `src/prompts/index.ts` — `getPrompt(taskType, options?)` dispatcher
- `src/taskRouter.ts` — `TASK_CONFIGS`, `getTaskConfig`, `getTokenBudget`, `buildTaskMessages`

**Milestone:** `getPrompt('ocr')` returns a non-empty string for all 30+ task types.

---

### Phase 4 — Worker + TaskContext

**Tasks 6.1–6.2**

- Update `src/worker.js`: add `"task"` and `"cancel_task"` handlers, two-pass pipeline support (`task_pass1_complete`)
- Create `src/context/TaskContext.tsx`: `activeTask`, `taskInput`, `lifecycle`, `streamingOutput`, `submitTask`, `cancelTask`

**Milestone:** Submitting an OCR task from the console streams tokens and saves to history.

---

### Phase 5 — UI Primitives

**Tasks 7.1–7.9**

- `FileUploadZone` — drag-drop, MIME/size validation, preview
- `AudioRecorderWidget` — record/pause/stop, level meter, 30-min warning
- `WebcamCapture` — live preview, capture button
- `ThinkingModeToggle` — labeled toggle with tooltip
- `PDFPageRangeSelector` — page range picker for PDFs >50 pages
- `TokenEstimateDisplay` — color-coded token count
- `ContextLimitWarning` — amber banner at 128K limit
- `PrivacyNotice` — local-processing confirmation
- `DisclaimerBanner` — non-dismissible medical/legal/financial disclaimer

---

### Phase 6 — Output Renderers

**Tasks 8.1–8.6**

- `MarkdownRenderer` — react-markdown + remark-gfm + highlight.js
- `JsonTreeView` — collapsible syntax-highlighted JSON tree
- `BoundingBoxCanvas` — canvas overlay for object detection
- `HtmlPreviewFrame` — sandboxed iframe for wireframe-to-HTML
- `DiffView` — green additions, red deletions, side-by-side modifications
- `ExportButton` — TXT/JSON/MD/HTML dropdown, `stratos-<task>-<date>.<ext>` filename

---

### Phase 7 — Core Workspace

**Tasks 9.1–9.4**

- `StreamingOutput` — token-by-token display, blinking cursor, TPS status bar, ARIA live region
- `OutputPanel` — routes to correct renderer by `outputFormat`, copy/stop/export controls
- `InputPanel` — conditional inputs by `TaskConfig` flags, submit button, offline mode guard
- `TaskWorkspace` — split-panel layout, task header, responsive stacking

**Milestone (Checkpoint 1):** Full pipeline working end-to-end for at least one task (e.g., OCR).

---

### Phase 8 — Category Workspaces

**Tasks 11.1–11.6**

- `DocumentsWorkspace` — contract risk badges, DiffView for redline
- `VisualWorkspace` — BoundingBoxCanvas for object detection, HtmlPreviewFrame for wireframe
- `AudioWorkspace` — side-by-side multilingual output, email preview panel, Q&A styling
- `TextWorkspace` — reply option cards, side-by-side tone rewriter, severity badges for code review
- `ResearchWorkspace` — inline citations, MCP fallback notices, offline mode guard
- `PrivacyWorkspace` — PrivacyNotice + DisclaimerBanner for all three privacy tasks

---

### Phase 9 — Layout + Drawers + Integration

**Tasks 12.1–14.2**

- Update `Sidebar` — category expand/collapse, task sub-items, active highlighting, responsive behavior, offline mode hides Research
- Update `DashboardPage` — renders TaskWorkspace or DashboardGrid based on `activeTask`
- Update `HistoryDrawer` — real IndexedDB data, delete/clear-all
- Update `SettingsDrawer` — all 7 settings sections (model info, TPS, offline mode, thinking mode, theme, cache, storage)
- Update `App.tsx` — wrap with `TaskProvider`
- Accessibility pass — ARIA labels, live regions, focus management, reduced motion

**Milestone (Checkpoint 2):** Full UI navigable — all categories, all tasks, history, settings.

---

### Phase 10 — Tests

**Tasks 16.1–16.21**

Property-based tests covering all 15 correctness properties from the requirements:

| Test File | Properties Covered |
|---|---|
| `outputParser.test.ts` | 1 (JSON round-trip), 2 (fence stripping), 3 (error containment), 4 (extractText idempotence), 14 (table round-trip) |
| `promptTemplates.test.ts` | 5 (non-empty output), 6 (unknown type error) |
| `historyStore.test.ts` | 7 (capacity invariant), 8 (FIFO eviction), 9 (delete reduces count) |
| `fileHandler.test.ts` | 10 (MIME validation), 11 (size validation) |
| `taskRouter.test.ts` | 12 (token budget invariant) |
| `exportFilename.test.ts` | 13 (filename format) |
| `settingsStore` (inline) | 15 (settings persistence round-trip) |

---

## New Dependencies

```bash
npm install pdfjs-dist react-markdown remark-gfm highlight.js
```

No backend dependencies. All inference is browser-only.

---

## Key Files Reference

| File | Status | Purpose |
|---|---|---|
| `src/types/index.ts` | Update | Extend to 30+ task types + all interfaces |
| `src/worker.js` | Update | Add task + cancel_task handlers |
| `src/App.tsx` | Update | Wrap with TaskProvider |
| `src/taskRouter.ts` | New | Task configs + message builder |
| `src/outputParser.ts` | New | JSON/text extraction (pure module) |
| `src/fileHandler.ts` | New | File validation + PDF extraction |
| `src/audioRecorder.ts` | New | MediaRecorder + PCM conversion |
| `src/webcamCapture.ts` | New | Camera capture |
| `src/mcpClient.ts` | New | MCP search/fetch with timeouts |
| `src/historyStore.ts` | New | IndexedDB history |
| `src/settingsStore.ts` | New | localStorage settings |
| `src/prompts/*.ts` | New | All 30+ prompt templates |
| `src/context/TaskContext.tsx` | New | Task state management |
| `src/components/workspace/*.tsx` | New | Core workspace components |
| `src/components/tasks/*.tsx` | New | Category workspace components |
| `src/components/ui/*.tsx` | New | UI primitives + renderers |
| `src/components/layout/Sidebar.tsx` | Update | Category nav + task sub-items |
| `src/components/pages/DashboardPage.tsx` | Update | TaskWorkspace routing |
| `src/components/drawers/HistoryDrawer.tsx` | Update | Real IndexedDB data |
| `src/components/drawers/SettingsDrawer.tsx` | Update | All settings sections |

---

## Authoritative References

- **Requirements**: `.kiro/specs/stratos-office-full-suite/requirements.md`
- **Design**: `.kiro/specs/stratos-office-full-suite/design.md`
- **Task list**: `.kiro/specs/stratos-office-full-suite/tasks.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Design system**: `docs/DESIGN.md`
