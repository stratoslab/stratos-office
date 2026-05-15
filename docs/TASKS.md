# Implementation Plan: Stratos Office Full Suite

## Overview

This plan converts the Stratos Office Full Suite design into incremental coding tasks. Each task builds on the previous ones, starting from the type system and pure utilities, progressing through infrastructure modules, prompt templates, task routing, worker updates, context, UI primitives, workspace components, and finally layout integration and tests. The design document uses TypeScript throughout, so all implementation tasks use TypeScript/TSX.

---

## Tasks

- [ ] 1. Extend type system and install new dependencies
  - [ ] 1.1 Extend `src/types/index.ts` with all new types from the design
    - Replace the existing `TaskType` union (13 types) with the full 30+ type union from the design
    - Add `TaskCategory`, `OutputFormat`, extended `TaskConfig`, `TaskLifecycle`, extended `TaskEntry`, `AppSettings`, `DEFAULT_SETTINGS`, `ParseError`, `isParseError`, all structured output interfaces (`DocumentParseResult`, `ContractAnalysisResult`, `RedlineResult`, `ChartExtractResult`, `ScreenAnalysisResult`, `SlideAnalysisResult`, `ObjectDetectionResult`, `MeetingMinutesResult`, `EmailDraftResult`, `EmailReplyResult`, `MeetingPrepResult`, `CodeReviewResult`, `ResearchResult`, `MultilingualTranscriptionResult`, `MedicalSummaryResult`, `LegalAnalysisResult`, `FinancialParserResult`)
    - Add extended `WorkerMessage`, `TaskWorkerMessage`, and `WorkerResponse` types
    - _Requirements: 1, 2, 3, 4, 5, 6–37, 38, 39_

  - [ ] 1.2 Install new runtime dependencies
    - Add `pdfjs-dist@^4.x`, `react-markdown`, `remark-gfm`, and `highlight.js` to `package.json` dependencies
    - Verify `vitest` and `@testing-library/react` are already present in devDependencies (they are)
    - _Requirements: 11.1, 3.4_


- [ ] 2. Implement pure utility modules
  - [ ] 2.1 Create `src/outputParser.ts`
    - Implement `parseJSON(text: string): object | ParseError`:
      - Strip all `<think>...</think>` blocks (including nested) before any other processing
      - If a ` ```json ... ``` ` fenced block is present, extract its content and attempt `JSON.parse`; use the first `json`/`JSON` fence if multiple are present
      - If no fence is found, scan from position 0 for the first `{` or `[` and attempt `JSON.parse` from that position
      - Return `{ error: "parse_failed", raw: <original input> }` on any `JSON.parse` failure, empty/whitespace input, or when neither `{` nor `[` is found — never throw
      - Return parsed arrays directly (not wrapped in an object)
    - Implement `extractText(text: string): string`:
      - Remove all `<think>...</think>` blocks including delimiters
      - Remove all Markdown fenced code blocks including delimiters and language tags
      - Trim leading/trailing whitespace; return `""` if result is empty
    - Implement `markdownTableToJSON(table: string): Array<Record<string, string>> | ParseError`:
      - Parse header row, separator row (cells must be dashes + optional colons only), and data rows
      - Return array of objects keyed by trimmed header values
      - Return `{ error: "parse_failed", raw: table }` if structure is invalid
    - Implement `jsonToMarkdownTable(rows: Array<Record<string, string>>): string | ParseError`:
      - Accept non-empty array with consistent key sets
      - Return Markdown table string (header row, separator row, data rows)
      - Return `{ error: "parse_failed", raw: "" }` for empty array or inconsistent keys
    - Module must have no browser API dependencies (pure Node.js-compatible)
    - _Requirements: 38.1–38.13_

  - [ ] 2.2 Create `src/settingsStore.ts`
    - Implement `loadSettings(): AppSettings` — reads from `localStorage` key `stratos-settings`, merges with `DEFAULT_SETTINGS` for missing keys
    - Implement `saveSettings(settings: AppSettings): void` — serializes to JSON and writes to `localStorage`
    - Implement `updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): void` — loads, patches, saves
    - No browser API dependencies beyond `localStorage` (safe to call in main thread only)
    - _Requirements: 41.7_


- [ ] 3. Implement infrastructure modules
  - [ ] 3.1 Create `src/historyStore.ts`
    - Open (or create) an IndexedDB database named `stratos-history` with an object store `entries` keyed by `id`
    - Implement `addEntry(entry: TaskEntry): Promise<void>`:
      - Insert the entry
      - After insert, count total entries; if count > 200, delete the oldest entry by `timestamp` (FIFO eviction)
    - Implement `getAllEntries(): Promise<TaskEntry[]>` — returns all entries sorted by `timestamp` descending
    - Implement `deleteEntry(id: string): Promise<void>` — removes the entry with the given id
    - Implement `clearAll(): Promise<void>` — deletes all entries from the store
    - Implement `getEntryCount(): Promise<number>` — returns current count
    - _Requirements: 5.1, 5.4, 5.5, 5.6, 5.7_

  - [ ] 3.2 Create `src/fileHandler.ts`
    - Implement `validate(file: File, taskType: TaskType): { accepted: boolean; error?: string }`:
      - Reject files > 50 MB with message "File exceeds the 50 MB maximum size"
      - Reject files whose MIME type is not in the accepted set for the given `taskType`; include accepted formats in the error message
      - Return `{ accepted: true }` on success
    - Implement `readAsDataURL(file: File): Promise<string>` — wraps `FileReader.readAsDataURL`
    - Implement `generatePreview(file: File): Promise<string | null>`:
      - For image files: return a data URL thumbnail (max 200×200, using `OffscreenCanvas` or `canvas`)
      - For audio files: return `null` (duration/waveform handled by `AudioRecorderWidget`)
      - For PDF files: return `null` (preview handled by pdf.js in `PDFPageRangeSelector`)
    - Implement `estimateTokens(text: string): number` — returns `Math.ceil(text.length / 4)`
    - Implement `extractPDFText(file: File, pageRange?: { start: number; end: number }): Promise<{ text: string; pageCount: number }>`:
      - Use `pdfjs-dist` to load the PDF from an `ArrayBuffer`
      - Iterate pages in the given range (default: all pages), calling `page.getTextContent()` and joining spans
      - Return concatenated text and total page count
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8, 11.1, 11.2, 42.6_

  - [ ] 3.3 Create `src/audioRecorder.ts`
    - Implement `AudioRecorder` class:
      - `start(): Promise<void>` — calls `navigator.mediaDevices.getUserMedia({ audio: true })`, creates `MediaRecorder`, begins recording; throws descriptive error if permission denied
      - `pause(): void` and `resume(): void` — delegate to `MediaRecorder`
      - `stop(): Promise<Float32Array>` — finalizes recording, decodes audio via `AudioContext.decodeAudioData`, resamples to 16 kHz mono PCM, returns `Float32Array`
      - `getElapsedSeconds(): number` — returns elapsed recording time
      - `getLevel(): number` — returns current audio level (0–1) via `AnalyserNode`
      - Enforce 30-minute maximum; emit a `warning` event at 25 minutes
    - _Requirements: 40.1–40.6_

  - [ ] 3.4 Create `src/webcamCapture.ts`
    - Implement `WebcamCapture` class:
      - `start(): Promise<MediaStream>` — calls `getUserMedia({ video: true })`, returns stream for live preview
      - `captureFrame(videoElement: HTMLVideoElement): string` — draws current frame to an `OffscreenCanvas` and returns a data URL
      - `stop(stream: MediaStream): void` — stops all tracks
    - _Requirements: 2.4_

  - [ ] 3.5 Create `src/mcpClient.ts`
    - Implement `search(query: string): Promise<Array<{ url: string; title: string; snippet: string }>>`:
      - Call the MCP search tool with the exact query string
      - Enforce a 10-second timeout using `AbortController`; throw a typed `McpSearchError` on timeout or network failure
      - Cache results by query string with a 5-minute TTL (in-memory `Map`)
      - Return up to 5 result objects
    - Implement `fetchContent(url: string): Promise<string>`:
      - Call the MCP fetch tool for the given URL
      - Enforce a 10-second timeout per call
      - Truncate returned content to 8,000 characters
      - Cache by URL with a 15-minute TTL
      - Return empty string on failure (do not throw — caller handles partial results)
    - Implement `fetchMultiple(urls: string[]): Promise<string[]>` — calls `fetchContent` for each URL, collects results, caps combined total at 24,000 characters
    - _Requirements: 33.1–33.5, 33.8, 33.9_


- [ ] 4. Implement prompt template system
  - [ ] 4.1 Create `src/prompts/documents.ts`
    - Export named prompt strings or factory functions for: `ocr`, `document_parse`, `handwriting`, `table_extract`, `form_extract`, `pdf_qa`, `contract_analyzer`, `redline_comparison`
    - Each prompt must instruct the model to return the output format specified in the corresponding requirement (plain text, JSON with required fields, Markdown table, etc.)
    - _Requirements: 6.1, 7.1, 8.1, 9.1, 10.1, 11.3, 12.1, 13.1_

  - [ ] 4.2 Create `src/prompts/visual.ts`
    - Export prompts for: `chart_extract`, `screen_analysis`, `wireframe_to_html`, `slide_analyzer`, `whiteboard_ocr`, `object_detection`
    - `wireframe_to_html` prompt must request a complete, self-contained HTML document
    - `object_detection` prompt must request JSON array with `label`, `confidence`, `bbox` fields (fractions 0.0–1.0)
    - _Requirements: 14.1, 15.1, 16.1, 17.1, 18.1, 19.1_

  - [ ] 4.3 Create `src/prompts/audio.ts`
    - Export prompts for: `transcription`, `meeting_minutes`, `voice_to_email`, `multilingual_transcription`, `interview_transcriber`
    - `multilingual_transcription` prompt must request both original-language transcript and English translation in a single pass
    - `interview_transcriber` prompt must request Q&A format with `**Q:**` / `**A:**` blocks
    - _Requirements: 20.1, 21.1, 22.1, 23.1, 24.1_

  - [ ] 4.4 Create `src/prompts/text.ts`
    - Export prompts for: `email_draft`, `email_reply`, `tone_rewriter`, `summarize`, `meeting_prep`, `report_generator`, `code_review`, `general_text`
    - `email_reply` prompt must request exactly three reply options as a JSON array
    - `general_text` prompt must be an empty system prompt (raw user message only)
    - _Requirements: 25.1, 26.1, 27.2, 28.1, 29.1, 30.1, 31.1, 32.1_

  - [ ] 4.5 Create `src/prompts/research.ts`
    - Export prompts for: `research`, `deep_doc_qa`
    - `research` prompt must instruct the model to synthesize an answer with inline citation markers and return the `ResearchResult` JSON shape
    - _Requirements: 33.5, 34.1_

  - [ ] 4.6 Create `src/prompts/privacy.ts`
    - Export prompts for: `medical_summarizer`, `legal_analyzer`, `financial_parser`
    - Each prompt must include the fixed disclaimer string in the output schema instruction
    - _Requirements: 35.1, 36.1, 37.1_

  - [ ] 4.7 Create `src/prompts/index.ts`
    - Implement `getPrompt(taskType: TaskType, options?: { language?: string; tone?: string }): string`
    - Import from all category files and dispatch by `taskType`
    - Throw `Error("Unknown task type: <taskType>")` for any unrecognized type
    - Interpolate `options.language` into multilingual prompts when provided
    - Interpolate `options.tone` into tone rewriter prompt when provided
    - _Requirements: 39.1–39.5_


- [ ] 5. Implement task router
  - [ ] 5.1 Create `src/taskRouter.ts`
    - Export `TASK_CONFIGS: Record<TaskType, TaskConfig>` — a complete map of all 30+ task types to their `TaskConfig` objects, including `max_new_tokens`, `requiresImage`, `requiresAudio`, `requiresPDF`, `requiresText`, `supportsWebcam`, `enableThinkingByDefault`, `supportsThinkingMode`, `outputFormat`, `twoPassPipeline`, `requiresPrivacyNotice`, `requiresDisclaimer`, `disclaimerText`, `label`, `description`, `icon`, `category`
    - Export `getTaskConfig(taskType: TaskType): TaskConfig` — returns the config for the given type
    - Export `getTokenBudget(taskType: TaskType): number` — returns `max_new_tokens` for the given type
    - Export `buildTaskMessages(taskType: TaskType, input: { text?: string; imageDataUrl?: string; audioData?: Float32Array; pdfText?: string }, options?: { enableThinking?: boolean; passOneOutput?: string }): Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>`:
      - Calls `getPrompt(taskType)` to get the system prompt
      - Assembles the correct message array for the given input modalities
      - For two-pass tasks (pass 2), uses `passOneOutput` as the transcript in the message
    - Thinking mode enabled by default for: `contract_analyzer`, `redline_comparison`, `code_review`, `legal_analyzer`
    - _Requirements: 6.5, 7.5, 8.4, 9.5, 10.5, 11.6, 12.4–12.5, 13.4–13.5, 14.5, 15.4, 16.5, 17.4, 18.4, 19.5, 20.4, 21.4, 22.5, 23.4, 24.4, 25.4, 26.5, 27.5, 28.4, 29.4, 30.4, 31.4–31.5, 32.5, 33.11, 34.4, 35.5, 36.5–36.6, 37.5_


- [ ] 6. Update worker and add task context
  - [ ] 6.1 Update `src/worker.js` to handle task messages
    - Add a `"task"` message handler that:
      - Reads `data.taskType`, `data.messages`, `data.enableThinking`, `data.maxNewTokens`, `data.pass`, and `data.passOneOutput` from the message payload
      - Calls the existing `generate()` function with the assembled messages
      - Emits `task_start`, `task_update`, `task_complete`, and `task_error` status messages (in addition to the existing `start`/`update`/`complete`/`error` messages) so `TaskContext` can correlate responses to the originating task ID
      - For two-pass tasks (pass 1 complete), emits a `task_pass1_complete` message with the transcript text so the main thread can initiate pass 2
    - Add a `"cancel_task"` message handler that calls `session.interrupt()`
    - Preserve all existing `check`, `load`, `generate`, `interrupt`, and `reset` handlers unchanged
    - _Requirements: 2.10, 3.7, 21.1, 22.1, 42.1_

  - [ ] 6.2 Create `src/context/TaskContext.tsx`
    - Implement `TaskProvider` and `useTask` hook
    - State: `activeTask: TaskType | null`, `taskInput: TaskInput`, `lifecycle: TaskLifecycle`, `streamingOutput: string`, `finalOutput: string`, `parsedOutput: unknown`, `enableThinking: boolean`, `error: string | null`
    - `TaskInput` type: `{ text?: string; file?: File; imageDataUrl?: string; audioData?: Float32Array; pdfText?: string; pdfPageCount?: number; secondFile?: File }`
    - Actions: `selectTask(taskType)`, `setInput(partial TaskInput)`, `submitTask()`, `cancelTask()`, `clearOutput()`, `setEnableThinking(bool)`
    - `submitTask()` implementation:
      - Validates input via `fileHandler.validate` if a file is present
      - Calls `buildTaskMessages` from `taskRouter.ts`
      - Posts a `"task"` message to the worker via `workerRef` from `ModelContext`
      - Listens for `task_update` messages to append to `streamingOutput`
      - On `task_complete`: runs `outputParser.parseJSON` or `outputParser.extractText` depending on the task's `outputFormat`; saves a `TaskEntry` to `historyStore`
      - Handles two-pass pipeline: on `task_pass1_complete`, automatically posts pass 2 message
    - _Requirements: 3.1–3.9, 5.1, 21.1, 22.1_


- [ ] 7. Build UI primitive components
  - [ ] 7.1 Create `src/components/ui/FileUploadZone.tsx`
    - Accept props: `taskType: TaskType`, `onFile: (file: File, dataUrl: string) => void`, `onError: (msg: string) => void`, `preview?: string | null`
    - Render a drag-and-drop zone with dashed border; accept files via drag-drop or click-to-browse
    - On file selection, call `fileHandler.validate(file, taskType)`; on rejection, call `onError` with the error message
    - On acceptance, call `fileHandler.readAsDataURL(file)` and `fileHandler.generatePreview(file)`, then call `onFile`
    - Display image thumbnail preview when `preview` prop is set
    - Show accepted formats and max size in the zone label
    - _Requirements: 2.1, 2.2, 2.5, 2.6, 2.7, 2.8_

  - [ ] 7.2 Create `src/components/ui/AudioRecorderWidget.tsx`
    - Accept props: `onAudio: (pcm: Float32Array) => void`, `onError: (msg: string) => void`
    - Render Record / Pause / Stop buttons using `MaterialIcon`
    - Display live audio level meter (animated bar) and elapsed time while recording
    - Show warning banner at 25 minutes; stop automatically at 30 minutes
    - On stop, call `audioRecorder.stop()` and pass the `Float32Array` to `onAudio`
    - Display permission-denied error message if `getUserMedia` is rejected
    - _Requirements: 40.1–40.6_

  - [ ] 7.3 Create `src/components/ui/WebcamCapture.tsx`
    - Accept props: `onFrame: (dataUrl: string) => void`, `onError: (msg: string) => void`
    - Render a "Open Camera" button; on click, call `webcamCapture.start()` and display live `<video>` preview
    - Render a "Capture" button that calls `webcamCapture.captureFrame()` and passes the data URL to `onFrame`
    - Render a "Close" button that calls `webcamCapture.stop()`
    - _Requirements: 2.4_

  - [ ] 7.4 Create `src/components/ui/ThinkingModeToggle.tsx`
    - Accept props: `enabled: boolean`, `onChange: (v: boolean) => void`, `disabled?: boolean`
    - Render a labeled toggle switch with a tooltip explaining chain-of-thought reasoning
    - _Requirements: 2.9, 2.10_

  - [ ] 7.5 Create `src/components/ui/PDFPageRangeSelector.tsx`
    - Accept props: `pageCount: number`, `onChange: (range: { start: number; end: number }) => void`, `tokenEstimate: number`
    - Only render when `pageCount > 50`
    - Provide "All pages", "First 50 pages" quick-select buttons and a custom start/end number input
    - Display warning: "This PDF has {pageCount} pages. Processing all pages may be slow."
    - Update token estimate display in real time as range changes
    - _Requirements: 11.2_

  - [ ] 7.6 Create `src/components/ui/TokenEstimateDisplay.tsx`
    - Accept props: `tokenCount: number`
    - Display "Estimated input: ~{N} tokens"
    - Color-code: green for < 50K, amber for 50K–100K, red for > 100K
    - _Requirements: 11.5, 34.3_

  - [ ] 7.7 Create `src/components/ui/ContextLimitWarning.tsx`
    - Accept props: `tokenCount: number`, `pageCount?: number`
    - Render an amber banner when `tokenCount > 128000 * 0.9` (approaching limit)
    - Display: "Document exceeds context limit. Only the last {N} pages will be processed."
    - _Requirements: 11.7_

  - [ ] 7.8 Create `src/components/ui/PrivacyNotice.tsx`
    - Accept props: `taskType: TaskType`
    - Render a dismissible banner confirming all processing is local and no data leaves the browser
    - _Requirements: 35.4, 36.4, 37.4_

  - [ ] 7.9 Create `src/components/ui/DisclaimerBanner.tsx`
    - Accept props: `text: string`
    - Render a prominent, non-dismissible banner with the disclaimer text
    - _Requirements: 35.3, 36.3, 37.3_


- [ ] 8. Build output renderer components
  - [ ] 8.1 Create `src/components/ui/MarkdownRenderer.tsx`
    - Accept props: `content: string`, `className?: string`
    - Use `react-markdown` with `remark-gfm` plugin to render headings, bold, italic, lists, code blocks, and tables
    - Apply `highlight.js` syntax highlighting to fenced code blocks
    - Render tables with alternating row shading matching the Stratos dark theme
    - Use JetBrains Mono for all code output
    - _Requirements: 3.4, 9.3_

  - [ ] 8.2 Create `src/components/ui/JsonTreeView.tsx`
    - Accept props: `data: unknown`, `className?: string`
    - Render a collapsible, syntax-highlighted JSON tree view
    - Color-code: strings in green, numbers in cyan, booleans in amber, null in red, keys in white
    - Support expand/collapse of objects and arrays
    - _Requirements: 3.5, 7.4, 10.4_

  - [ ] 8.3 Create `src/components/ui/BoundingBoxCanvas.tsx`
    - Accept props: `imageDataUrl: string`, `detections: ObjectDetectionResult[]`
    - Render the image on an HTML `<canvas>` element
    - Overlay labeled bounding boxes using `bbox` coordinates (fractions of image dimensions)
    - Draw label text above each box with a filled background for readability
    - _Requirements: 19.3_

  - [ ] 8.4 Create `src/components/ui/HtmlPreviewFrame.tsx`
    - Accept props: `html: string`
    - Render the HTML string in a sandboxed `<iframe>` with `sandbox="allow-scripts"` and `srcdoc`
    - Provide a "Preview" / "Code" toggle button to switch between rendered view and syntax-highlighted source
    - _Requirements: 16.4_

  - [ ] 8.5 Create `src/components/ui/DiffView.tsx`
    - Accept props: `result: RedlineResult`
    - Render `result.summary` as a standalone section above the diff
    - Render additions with green background and green left border
    - Render deletions with red background, red left border, and strikethrough text
    - Render modifications as a two-column layout: original (amber tint) on the left, revised (cyan tint) on the right, commentary in italic below
    - _Requirements: 13.3_

  - [ ] 8.6 Create `src/components/ui/ExportButton.tsx`
    - Accept props: `output: string`, `parsedOutput?: unknown`, `taskType: TaskType`
    - Render a button with a dropdown offering TXT, JSON, Markdown, and HTML export options
    - TXT: strip Markdown formatting, download as `.txt`
    - JSON: download parsed JSON if available, else `{ "output": "<text>" }` as `.json`
    - Markdown: download raw output as `.md`
    - HTML: download output rendered as a self-contained HTML document with inline Stratos styles as `.html`
    - Name files using pattern `stratos-<task-type>-<ISO-date>.<extension>`
    - _Requirements: 4.1–4.7_


- [ ] 9. Build core workspace components
  - [ ] 9.1 Create `src/components/workspace/StreamingOutput.tsx`
    - Accept props: `content: string`, `isGenerating: boolean`, `tps?: number | null`, `elapsedMs?: number`
    - Display a blinking cursor when `isGenerating` is true and `content` is empty (generation started)
    - Append tokens to the display in real time as `content` grows
    - Show elapsed time and current TPS in a status bar below the output while generating
    - Hide cursor and show final token count and TPS when `isGenerating` becomes false
    - Announce completion to screen readers via an ARIA live region
    - _Requirements: 3.1–3.3, 3.9_

  - [ ] 9.2 Create `src/components/workspace/OutputPanel.tsx`
    - Accept props: `taskType: TaskType`, `output: string`, `parsedOutput: unknown`, `isGenerating: boolean`, `tps?: number | null`
    - Render `StreamingOutput` while generating
    - After generation, render the appropriate output component based on `taskConfig.outputFormat`:
      - `markdown` → `MarkdownRenderer`
      - `json` → `JsonTreeView`
      - `html` → `HtmlPreviewFrame`
      - `table` → `MarkdownRenderer` (tables rendered by remark-gfm)
      - `text` → plain `<pre>` or `MarkdownRenderer`
    - Special cases: `object_detection` → `BoundingBoxCanvas`; `redline_comparison` → `DiffView`
    - Render `ExportButton` in the top-right corner when output is non-empty
    - Render a Copy button that copies `output` to clipboard
    - Render a Stop button (calls `cancelTask()`) while `isGenerating` is true
    - Show "Generation stopped" notice when task was cancelled with partial output
    - Render `DisclaimerBanner` for privacy tasks
    - _Requirements: 3.4–3.9, 4.1_

  - [ ] 9.3 Create `src/components/workspace/InputPanel.tsx`
    - Accept props: `taskType: TaskType`, `taskConfig: TaskConfig`
    - Conditionally render input controls based on `taskConfig` flags:
      - `requiresImage` → `FileUploadZone` (image MIME types)
      - `requiresAudio` → `FileUploadZone` (audio MIME types) + `AudioRecorderWidget`
      - `requiresPDF` → `FileUploadZone` (PDF MIME type) + `PDFPageRangeSelector` (when page count > 50) + `TokenEstimateDisplay` + `ContextLimitWarning`
      - `requiresText` → resizable `<textarea>` with placeholder
      - `supportsWebcam` → `WebcamCapture`
      - `redline_comparison` → two `FileUploadZone` instances (Document A and Document B)
    - Render `ThinkingModeToggle` when `taskConfig.supportsThinkingMode` is true
    - Render `PrivacyNotice` when `taskConfig.requiresPrivacyNotice` is true
    - Render a Submit button; disable it when model is not ready or required inputs are missing
    - Disable Submit and show tooltip when `offlineMode` is enabled and `taskType === 'research'`
    - _Requirements: 2.1–2.10, 33.10_

  - [ ] 9.4 Create `src/components/workspace/TaskWorkspace.tsx`
    - Accept props: `taskType: TaskType`
    - Render a split-panel layout: `InputPanel` on the left, `OutputPanel` on the right
    - Render a task header with the task label, description, and `ThinkingModeToggle` (if supported)
    - On narrow viewports (< 768px), stack panels vertically
    - _Requirements: 2, 3, 46.1–46.3_


- [ ] 10. Checkpoint — core pipeline working
  - Ensure all tests pass, ask the user if questions arise.
  - At this point the full pipeline from file input → task routing → worker → streaming output → export should be functional for at least one task type (e.g., `ocr`).

- [ ] 11. Build task category workspace components
  - [ ] 11.1 Create `src/components/tasks/DocumentsWorkspace.tsx`
    - Shared layout wrapper for all document tasks (`ocr`, `document_parse`, `handwriting`, `table_extract`, `form_extract`, `pdf_qa`, `contract_analyzer`, `redline_comparison`)
    - Renders `TaskWorkspace` with the correct `taskType` prop
    - For `contract_analyzer`: renders color-coded risk badges (green/amber/red) in the output area after parsing `ContractAnalysisResult`
    - For `redline_comparison`: renders `DiffView` component
    - _Requirements: 6–13_

  - [ ] 11.2 Create `src/components/tasks/VisualWorkspace.tsx`
    - Shared layout wrapper for visual tasks (`chart_extract`, `screen_analysis`, `wireframe_to_html`, `slide_analyzer`, `whiteboard_ocr`, `object_detection`)
    - For `object_detection`: renders `BoundingBoxCanvas` with the uploaded image and parsed detections
    - For `wireframe_to_html`: renders `HtmlPreviewFrame` with the generated HTML
    - For `screen_analysis`: renders element list as a structured table
    - _Requirements: 14–19_

  - [ ] 11.3 Create `src/components/tasks/AudioWorkspace.tsx`
    - Shared layout wrapper for audio tasks (`transcription`, `meeting_minutes`, `voice_to_email`, `multilingual_transcription`, `interview_transcriber`)
    - For `multilingual_transcription`: renders original transcript and English translation side by side
    - For `voice_to_email` and `email_draft`: renders styled email preview panel with subject, recipient, and body fields
    - For `interview_transcriber`: renders Q&A transcript with distinct visual styling for `**Q:**` and `**A:**` blocks
    - _Requirements: 20–24_

  - [ ] 11.4 Create `src/components/tasks/TextWorkspace.tsx`
    - Shared layout wrapper for text tasks (`email_draft`, `email_reply`, `tone_rewriter`, `summarize`, `meeting_prep`, `report_generator`, `code_review`, `general_text`)
    - For `email_reply`: renders three reply option cards labeled with tone; expands selected card to show full body with copy/export
    - For `tone_rewriter`: renders original and rewritten text side by side
    - For `code_review`: renders issues with color-coded severity badges (red/amber/blue)
    - For `meeting_prep`: renders structured document view with labeled sections
    - _Requirements: 25–32_

  - [ ] 11.5 Create `src/components/tasks/ResearchWorkspace.tsx`
    - Renders `TaskWorkspace` for `research` and `deep_doc_qa` tasks
    - For `research`: renders inline citation markers in the answer text and a numbered sources list below with hyperlinks
    - Shows "Web search unavailable" dismissible notice with "Run without web search" button when MCP search fails
    - Shows "Could not retrieve page content — answer based on search snippets only" notice when all fetches fail
    - Disables submit button with tooltip when `offlineMode` is enabled
    - _Requirements: 33.6–33.10, 34_

  - [ ] 11.6 Create `src/components/tasks/PrivacyWorkspace.tsx`
    - Renders `TaskWorkspace` for `medical_summarizer`, `legal_analyzer`, `financial_parser`
    - Always renders `PrivacyNotice` before submission and `DisclaimerBanner` below output
    - For `legal_analyzer`: renders risk flags with color-coded severity badges
    - For `financial_parser`: renders transactions table
    - _Requirements: 35–37_


- [ ] 12. Update layout components
  - [ ] 12.1 Update `src/components/layout/Sidebar.tsx`
    - Add category expand/collapse state for each of the 6 categories (Documents, Visual, Audio, Text & Writing, Research, Privacy-First Specialized Tasks)
    - Render category items with `MaterialIcon` and label; clicking a category expands its task sub-items
    - Render task sub-items with icon and label; clicking a task calls `selectTask(taskType)` from `TaskContext`
    - Highlight the active task with Accent Blue (`#00D4FF`)
    - Disable all task items when `state.stage !== 'ready'`; show tooltip "Model must be loaded first"
    - Hide the Research category when `offlineMode` is enabled in settings
    - Responsive behavior:
      - < 768px: collapse to icon-only bar; provide toggle button to expand as drawer overlay
      - 768px–1024px: icon-only bar (64px wide) with tooltips on hover
      - > 1024px: full sidebar (280px wide) with labels
    - _Requirements: 1.1–1.8, 33.10, 41.3, 46.1–46.3_

  - [ ] 12.2 Update `src/components/pages/DashboardPage.tsx`
    - Read `activeTask` from `TaskContext`
    - When `activeTask` is null, render a `DashboardGrid` showing category cards as the home screen
    - When `activeTask` is set, render the appropriate category workspace component:
      - Documents tasks → `DocumentsWorkspace`
      - Visual tasks → `VisualWorkspace`
      - Audio tasks → `AudioWorkspace`
      - Text tasks → `TextWorkspace`
      - Research tasks → `ResearchWorkspace`
      - Privacy tasks → `PrivacyWorkspace`
    - _Requirements: 1.2, 1.3_


- [ ] 13. Update drawer components
  - [ ] 13.1 Update `src/components/drawers/HistoryDrawer.tsx`
    - On open, call `historyStore.getAllEntries()` and render the list sorted by timestamp descending
    - Each entry shows: task type icon (`MaterialIcon`), input summary (truncated to 200 chars), relative time (e.g., "2 hours ago")
    - Clicking an entry calls `selectTask(entry.type)` and populates the output panel with `entry.output`
    - Each entry has a delete icon button; clicking it calls `historyStore.deleteEntry(entry.id)` and removes the entry from the list immediately
    - Render a "Clear All History" button that shows a confirmation dialog before calling `historyStore.clearAll()`
    - _Requirements: 5.2–5.5_

  - [ ] 13.2 Update `src/components/drawers/SettingsDrawer.tsx`
    - Render all settings sections from the design:
      - **Model Info**: Model ID and quantization type (from `ModelContext`)
      - **Performance**: WebGPU status, current TPS, tokens generated
      - **Storage**: browser cache usage estimate (via Cache API)
      - **Privacy**: Offline Mode toggle (persisted via `settingsStore`)
      - **AI Behavior**: Thinking Mode Default toggle (persisted via `settingsStore`)
      - **Appearance**: Dark/Light theme toggle (persisted via `settingsStore`, applied via `data-theme` on `<html>`)
      - **Maintenance**: "Clear Model Cache" button with confirmation dialog (calls `caches.delete()`)
    - All setting changes apply immediately without page reload
    - _Requirements: 41.1–41.7_

- [ ] 14. Wire up App.tsx and apply accessibility
  - [ ] 14.1 Update `src/App.tsx` to wrap with `TaskProvider`
    - Import `TaskProvider` from `TaskContext`
    - Wrap `<ModelProvider>` children with `<TaskProvider>` so all components can access task state
    - Pass `activeTask` from `TaskContext` to `Sidebar` for active-item highlighting
    - _Requirements: 1.3_

  - [ ] 14.2 Apply accessibility requirements across all new components
    - Add ARIA labels to all icon-only buttons (Stop, Copy, Export, Record, Capture, Delete, Clear All)
    - Add ARIA live regions (`aria-live="polite"`) to `StreamingOutput` for token announcements and task completion
    - Ensure logical tab order throughout `TaskWorkspace`, `InputPanel`, `OutputPanel`
    - Add `role="status"` to TPS and progress indicators
    - Add descriptive `alt` text to uploaded image previews in `FileUploadZone`
    - Wrap all `Framer Motion` animations with `useReducedMotion()` check; disable animations when `prefers-reduced-motion` is set
    - _Requirements: 44.1–44.7_


- [ ] 15. Checkpoint — full UI integration
  - Ensure all tests pass, ask the user if questions arise.
  - At this point the complete UI should be navigable: sidebar shows all categories and tasks, selecting a task renders the correct workspace, submitting a task streams output, history drawer shows past results, settings drawer persists changes.

- [ ] 16. Write tests
  - [ ] 16.1 Create `src/test/outputParser.test.ts`
    - Write unit tests for all `outputParser` functions covering the happy path and edge cases
    - _Requirements: 38.1–38.13_

  - [ ]* 16.2 Write property test for Output_Parser JSON round-trip
    - **Property 1: Output_Parser JSON Round-Trip**
    - For any valid JS object `obj`, `parseJSON(JSON.stringify(obj))` deep-equals `obj`
    - **Validates: Requirement 38**

  - [ ]* 16.3 Write property test for Output_Parser Markdown fence stripping
    - **Property 2: Output_Parser Markdown Fence Stripping**
    - For any valid JS object `obj`, `parseJSON("```json\n" + JSON.stringify(obj) + "\n```")` deep-equals `obj`
    - **Validates: Requirement 38**

  - [ ]* 16.4 Write property test for Output_Parser error containment
    - **Property 3: Output_Parser Error Containment**
    - For any string `s` where `JSON.parse(s)` throws, `parseJSON(s)` returns `{ error: "parse_failed", raw: s }` and does not throw
    - **Validates: Requirement 38**

  - [ ]* 16.5 Write property test for Output_Parser extractText idempotence
    - **Property 4: Output_Parser extractText Idempotence**
    - For any string `s`, `extractText(extractText(s)) === extractText(s)`
    - **Validates: Requirement 38**

  - [ ]* 16.6 Write property test for Output_Parser table round-trip
    - **Property 14: Output_Parser Table-to-JSON Round-Trip**
    - For any valid Markdown table string `t`, `jsonToMarkdownTable(markdownTableToJSON(t))` produces a table with the same headers and data values
    - **Validates: Requirement 9, 38**

  - [ ] 16.7 Create `src/test/promptTemplates.test.ts`
    - Write unit tests verifying `getPrompt` returns non-empty strings for all defined task types and throws for unknown types
    - _Requirements: 39.1–39.5_

  - [ ]* 16.8 Write property test for Prompt_Template non-empty output
    - **Property 5: Prompt_Template Non-Empty Output**
    - For every task type in `DEFINED_TASK_TYPES`, `getPrompt(taskType).length > 0`
    - **Validates: Requirement 39**

  - [ ]* 16.9 Write property test for Prompt_Template unknown type error
    - **Property 6: Prompt_Template Unknown Type Error**
    - For any string `s` not in `DEFINED_TASK_TYPES`, `getPrompt(s)` throws an `Error`
    - **Validates: Requirement 39**

  - [ ] 16.10 Create `src/test/historyStore.test.ts`
    - Write unit tests for `addEntry`, `getAllEntries`, `deleteEntry`, `clearAll`, and FIFO eviction
    - _Requirements: 5.1–5.7_

  - [ ]* 16.11 Write property test for History_Store capacity invariant
    - **Property 7: History_Store Capacity Invariant**
    - After any sequence of `addEntry` calls of length N, `getEntryCount() <= 200`
    - **Validates: Requirement 5**

  - [ ]* 16.12 Write property test for History_Store FIFO eviction
    - **Property 8: History_Store FIFO Eviction**
    - Given store at capacity (200 entries), after `addEntry(newEntry)`: count is still 200, new entry is present, oldest entry is absent
    - **Validates: Requirement 5**

  - [ ]* 16.13 Write property test for History_Store delete reduces count
    - **Property 9: History_Store Delete Reduces Count**
    - For any entry `e` in the store, after `deleteEntry(e.id)`: count decreases by 1 and `contains(e.id)` is false
    - **Validates: Requirement 5**

  - [ ] 16.14 Create `src/test/fileHandler.test.ts`
    - Write unit tests for `validate`, `estimateTokens`, and MIME/size rejection logic
    - _Requirements: 2.6, 2.7_

  - [ ]* 16.15 Write property test for File_Handler MIME type validation
    - **Property 10: File_Handler MIME Type Validation**
    - For any file with MIME type not in the accepted set for a given task, `validate(file, taskType).accepted === false`
    - **Validates: Requirement 2**

  - [ ]* 16.16 Write property test for File_Handler size validation
    - **Property 11: File_Handler Size Validation**
    - For any file with `size > 52428800`, `validate(file, taskType).accepted === false` regardless of MIME type
    - **Validates: Requirement 2**

  - [ ] 16.17 Create `src/test/taskRouter.test.ts`
    - Write unit tests verifying `getTaskConfig` returns correct configs and `buildTaskMessages` assembles correct message arrays
    - _Requirements: 6–37_

  - [ ]* 16.18 Write property test for Task_Router token budget invariant
    - **Property 12: Task_Router Token Budget Invariant**
    - For every task type, `getTokenBudget(taskType) > 0 && getTokenBudget(taskType) <= 2048`
    - **Validates: Requirements 6–37**

  - [ ] 16.19 Create `src/test/exportFilename.test.ts`
    - Write unit tests verifying the export filename pattern for all task types and formats
    - _Requirements: 4.7_

  - [ ]* 16.20 Write property test for export filename format
    - **Property 13: Export Filename Format**
    - For any task type and export format, the generated filename matches `/^stratos-[a-z_]+-\d{4}-\d{2}-\d{2}\.[a-z]+$/`
    - **Validates: Requirement 4**

  - [ ]* 16.21 Write property test for Settings persistence round-trip
    - **Property 15: Settings Persistence Round-Trip**
    - For any valid `AppSettings` object `s`, `saveSettings(s)` followed by `loadSettings()` returns an object deeply equal to `s`
    - **Validates: Requirement 41**

- [ ] 17. Final checkpoint — all tests pass
  - Ensure all tests pass, ask the user if questions arise.


---

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- The dependency order strictly follows: types → pure utilities → infrastructure → prompts → task router → worker → context → UI primitives → output renderers → workspace → category workspaces → layout → drawers → App.tsx → tests
- Property tests (Properties 1–15) validate universal correctness invariants; unit tests validate specific examples and edge cases
- The two-pass pipeline (meeting_minutes, voice_to_email) is handled entirely in `TaskContext` and `worker.js` — no special workspace component is needed
- `pdfjs-dist` must be configured with a worker URL; set `pdfjsLib.GlobalWorkerOptions.workerSrc` in `fileHandler.ts` using the CDN URL or a bundled worker
- All Framer Motion animations must respect `prefers-reduced-motion` via the `useReducedMotion()` hook

---

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "1.2"] },
    { "id": 1, "tasks": ["2.1", "2.2"] },
    { "id": 2, "tasks": ["3.1", "3.2", "3.3", "3.4", "3.5"] },
    { "id": 3, "tasks": ["4.1", "4.2", "4.3", "4.4", "4.5", "4.6"] },
    { "id": 4, "tasks": ["4.7"] },
    { "id": 5, "tasks": ["5.1"] },
    { "id": 6, "tasks": ["6.1"] },
    { "id": 7, "tasks": ["6.2"] },
    { "id": 8, "tasks": ["7.1", "7.2", "7.3", "7.4", "7.5", "7.6", "7.7", "7.8", "7.9"] },
    { "id": 9, "tasks": ["8.1", "8.2", "8.3", "8.4", "8.5", "8.6"] },
    { "id": 10, "tasks": ["9.1", "9.2", "9.3"] },
    { "id": 11, "tasks": ["9.4"] },
    { "id": 12, "tasks": ["11.1", "11.2", "11.3", "11.4", "11.5", "11.6"] },
    { "id": 13, "tasks": ["12.1", "12.2"] },
    { "id": 14, "tasks": ["13.1", "13.2"] },
    { "id": 15, "tasks": ["14.1", "14.2"] },
    { "id": 16, "tasks": ["16.1", "16.7", "16.10", "16.14", "16.17", "16.19"] },
    { "id": 17, "tasks": ["16.2", "16.3", "16.4", "16.5", "16.6", "16.8", "16.9", "16.11", "16.12", "16.13", "16.15", "16.16", "16.18", "16.20", "16.21"] }
  ]
}
```
