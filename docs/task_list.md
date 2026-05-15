# AI Office Assistant — Task List

> **Project:** Stratos Office → AI Office Assistant
> **Base:** Browser-only Vite/React app with Gemma 4 E2B ONNX on WebGPU

---

## Phase 1: Core Infrastructure

### 1.1 Task Router System
- [ ] Create `src/taskRouter.js` — central task routing module
- [ ] Define task types: `ocr`, `document_parse`, `handwriting`, `chart_extract`, `table_extract`, `form_extract`, `screen_analysis`, `transcription`, `voice_command`, `research`, `email_draft`, `summarize`, `text_task`
- [ ] Implement `handleTask(task)` function that routes to correct pipeline
- [ ] Add task result normalization (consistent output format across all task types)
- [ ] Add task history tracking (in-memory array, later persisted)

### 1.2 Prompt Template Library
- [ ] Create `src/prompts/` directory
- [ ] `src/prompts/ocr.js` — document OCR, receipt/invoice parsing, handwriting
- [ ] `src/prompts/audio.js` — meeting transcription, voice commands
- [ ] `src/prompts/visual.js` — chart extraction, table extraction, screen analysis, form extraction
- [ ] `src/prompts/text.js` — email drafting, summarization, general text tasks
- [ ] `src/prompts/research.js` — web research with MCP tool integration
- [ ] Export all prompts as a single `promptTemplates` object with `getPrompt(taskType, options)` API

### 1.3 Structured Output Parsing
- [ ] Create `src/outputParser.js` — extract JSON from model responses
- [ ] Implement `parseJSON(text)` — finds JSON blocks in model output, handles markdown code fences
- [ ] Implement `validateSchema(data, schema)` — basic JSON schema validation
- [ ] Add fallback: if parsing fails, return raw text with warning flag
- [ ] Add retry logic: if JSON is invalid, send correction prompt to model

### 1.4 Worker Protocol Extension
- [ ] Extend `worker.js` message types to support task routing
- [ ] Add `"task"` message type: `{ type: "task", data: { taskType, input, options } }`
- [ ] Add `"task_result"` response: `{ status: "task_result", data: { taskType, result, raw, parsed, error } }`
- [ ] Keep existing `"generate"` message type for backward compatibility
- [ ] Add task cancellation support: `{ type: "cancel_task", data: { taskId } }`

---

## Phase 2: File & Media Handling

### 2.1 File Upload System
- [ ] Create `src/fileHandler.js` — unified file upload utility
- [ ] Support image files: PNG, JPG, JPEG, WebP, GIF, BMP
- [ ] Support audio files: WebM, WAV, MP3, OGG, M4A
- [ ] Support document files: PDF (convert to image for OCR)
- [ ] Implement file size validation (max 50MB per file)
- [ ] Implement file type detection (MIME type + extension)
- [ ] Add drag-and-drop support
- [ ] Add file preview component (image thumbnail, audio waveform placeholder)

### 2.2 PDF Processing
- [ ] Add `pdf.js` dependency (Mozilla's PDF.js) for browser-side PDF rendering
- [ ] Implement `pdfToImages(pdfFile)` — render each PDF page to canvas → data URL
- [ ] Add page selection UI (select specific pages for OCR)
- [ ] Handle multi-page PDFs (process sequentially, aggregate results)
- [ ] Add progress indicator for multi-page processing

### 2.3 Webcam Integration
- [ ] Create `src/webcam.js` — webcam capture module
- [ ] Add frame capture with quality settings
- [ ] Add continuous capture mode (capture every N seconds for live OCR)
- [ ] Add screenshot annotation (draw bounding boxes on captured frame)
- [ ] Support front/rear camera selection (mobile)

### 2.4 Microphone Integration
- [ ] Create `src/audioRecorder.js` — microphone recording module
- [ ] Add audio level meter (visual feedback during recording)
- [ ] Add recording duration display
- [ ] Support pause/resume recording
- [ ] Convert recorded audio to required format (16kHz mono for Gemma 4)

---

## Phase 3: Task Implementations

### 3.1 OCR Tasks
- [ ] **Document OCR**: Image → extracted text with formatting
- [ ] **Receipt/Invoice Parsing**: Image → structured JSON
- [ ] **Handwriting Transcription**: Image → typed text
- [ ] **Table Extraction**: Image → markdown/JSON table

### 3.2 Visual Analysis Tasks
- [ ] **Chart/Graph Parsing**: Image → data points + trends
- [ ] **Form Field Extraction**: Image → structured form data
- [ ] **Screen/UI Analysis**: Image → UI element description

### 3.3 Audio Tasks
- [ ] **Meeting Transcription**: Audio → formatted transcript
- [ ] **Voice Commands**: Audio → intent + response
- [ ] **Speech-to-Text Translation**: Audio → translated text

### 3.4 Text Tasks
- [ ] **Email Drafting**: Text input → drafted email
- [ ] **Summarization**: Text/image/audio → summary
- [ ] **Code Review**: Code text → review comments

---

## Phase 4: Web Integration (TinyFish MCP)

### 4.1 MCP Client
- [ ] Create `src/mcpClient.js` — MCP protocol client
- [ ] Implement `mcpCall(tool, params)` — generic tool call function
- [ ] Implement `search(query)` — web search tool
- [ ] Implement `fetch(url)` — page content extraction tool
- [ ] Add error handling (network errors, rate limits, invalid responses)
- [ ] Add request caching (cache search results for 5 minutes)

### 4.2 Research Task Pipeline
- [ ] Implement `runResearchTask(query, prompt)` in worker
- [ ] Step 1: Call `search(query)` via MCP
- [ ] Step 2: Call `fetch(topResult.url)` for top 1-3 results
- [ ] Step 3: Send search results + page content to Gemma 4 for synthesis
- [ ] Step 4: Return synthesized answer with source citations
- [ ] Add source attribution (list URLs used)

### 4.3 Proxy Server (Optional, for Production)
- [ ] Create lightweight Node.js proxy server
- [ ] Handle MCP authentication (TinyFish API key)
- [ ] Handle CORS for browser requests
- [ ] Add rate limiting
- [ ] Deploy to Vercel/Render/Fly.io

---

## Phase 5: UI/UX

### 5.1 Task Selector
- [ ] Create `src/components/TaskSelector.jsx` — task category picker
- [ ] Group tasks by category: Documents, Audio, Visual, Text, Research
- [ ] Show task description and expected input/output for each task
- [ ] Highlight recently used tasks
- [ ] Support keyboard navigation

### 5.2 Input Area
- [ ] Create `src/components/InputArea.jsx` — unified input component
- [ ] Support text input (textarea with auto-resize)
- [ ] Support file upload (drag-and-drop + file picker)
- [ ] Support webcam capture (inline camera view)
- [ ] Support microphone recording (inline recording UI)
- [ ] Show input type indicators (text, image, audio, file)
- [ ] Add input validation and error messages

### 5.3 Output Display
- [ ] Create `src/components/OutputDisplay.jsx` — task result viewer
- [ ] Display formatted text output
- [ ] Display parsed JSON with syntax highlighting
- [ ] Display markdown output (rendered)
- [ ] Display tables (interactive, sortable)
- [ ] Add copy-to-clipboard button
- [ ] Add download button (TXT, JSON, MD)
- [ ] Add export to file system (if supported)

### 5.4 Task History
- [ ] Create `src/components/TaskHistory.jsx` — sidebar or panel
- [ ] List recent tasks with type, timestamp, status
- [ ] Click to view full task input/output
- [ ] Support search/filter in history
- [ ] Support delete individual tasks
- [ ] Support clear all history
- [ ] Persist history to IndexedDB (optional)

### 5.5 Settings Panel
- [ ] Create `src/components/Settings.jsx`
- [ ] Model settings: max tokens, temperature, thinking mode toggle
- [ ] Cache settings: clear model cache button
- [ ] Privacy settings: offline-only mode toggle
- [ ] Display: theme toggle (dark/light), font size
- [ ] About: model info, version, browser compatibility

### 5.6 Landing Page
- [ ] Design landing page reflecting office assistant capabilities
- [ ] Show task categories as quick-start cards
- [ ] Keep "Load Gemma 4" button with WebGPU check
- [ ] Add privacy statement prominently
- [ ] Add system requirements (WebGPU browser, RAM)

---

## Phase 6: Performance & Optimization

### 6.1 Model Loading Optimization
- [ ] Show detailed loading progress (per-file download progress)
- [ ] Add estimated time remaining
- [ ] Add retry logic for failed downloads
- [ ] Cache model files in IndexedDB as fallback
- [ ] Preload critical model files first (tokenizer, config)

### 6.2 Inference Optimization
- [ ] Tune `max_new_tokens` per task type (shorter for OCR, longer for research)
- [ ] Implement token budget management (avoid OOM on long contexts)
- [ ] Add context window management (truncate old messages if approaching limit)
- [ ] Add streaming output for all task types

### 6.3 Memory Management
- [ ] Dispose of unused tensors after each task
- [ ] Clear audio/image buffers after processing
- [ ] Add memory warning if approaching limits
- [ ] Implement model unload/reload cycle

---

## Phase 7: Testing & Polish

### 7.1 Task Testing
- [ ] Test each task type with sample inputs
- [ ] Verify OCR accuracy on clean documents
- [ ] Verify OCR accuracy on noisy/handwritten documents
- [ ] Verify audio transcription accuracy
- [ ] Verify JSON parsing for structured outputs
- [ ] Test edge cases: empty input, oversized files, unsupported formats

### 7.2 Browser Testing
- [ ] Test on Chrome (latest)
- [ ] Test on Edge (latest)
- [ ] Test on Chrome mobile (Android)
- [ ] Test with various GPU configurations (integrated, discrete)
- [ ] Test with low memory conditions (4GB RAM devices)

### 7.3 Error Handling
- [ ] Graceful WebGPU failure (show error, suggest browser)
- [ ] Model download failure (retry, show error)
- [ ] Inference failure (retry, show error)
- [ ] File upload errors (size, type, corruption)
- [ ] Network errors (for MCP/research tasks)
- [ ] Add error recovery suggestions

### 7.4 Accessibility
- [ ] Keyboard navigation for all interactive elements
- [ ] Screen reader support (ARIA labels)
- [ ] Color contrast compliance (WCAG AA)
- [ ] Focus management (focus on new output)
- [ ] Reduced motion support

---

## Phase 8: Documentation & Deployment

### 8.1 User Documentation
- [ ] Create `USER_GUIDE.md` — how to use each task
- [ ] Add in-app help tooltips
- [ ] Add task examples (sample inputs/outputs)
- [ ] Document keyboard shortcuts

### 8.2 Developer Documentation
- [ ] Create `ARCHITECTURE.md` with full technical documentation
- [ ] Add `CONTRIBUTING.md` — how to add new tasks
- [ ] Document prompt template system
- [ ] Document task router extension pattern

### 8.3 Deployment
- [ ] Build for production: `npm run build`
- [ ] Deploy to static hosting (Vercel, Netlify, GitHub Pages)
- [ ] Configure custom domain (optional)
- [ ] Add PWA manifest for installable app (optional)
- [ ] Add service worker for offline model access (advanced)

---

## Priority Order

1. **Phase 1** (Task Router + Prompts) — Foundation for everything else
2. **Phase 3** (Task Implementations) — Core functionality
3. **Phase 2** (File/Media Handling) — Input flexibility
4. **Phase 5** (UI/UX) — User-facing interface
5. **Phase 4** (Web Integration) — Research capabilities
6. **Phase 6** (Performance) — Optimization
7. **Phase 7** (Testing) — Quality assurance
8. **Phase 8** (Docs/Deploy) — Shipping

---

## Key Files to Create

### New Files
```
src/
├── taskRouter.js           # Task routing logic
├── outputParser.js         # JSON extraction from model output
├── fileHandler.js          # File upload utility
├── audioRecorder.js        # Microphone recording
├── webcam.js               # Webcam capture
├── mcpClient.js            # MCP protocol client
├── prompts/
│   ├── index.js            # Prompt template exports
│   ├── ocr.js              # OCR prompts
│   ├── audio.js            # Audio prompts
│   ├── visual.js           # Visual analysis prompts
│   ├── text.js             # Text task prompts
│   └── research.js         # Research prompts
├── components/
│   ├── TaskSelector.jsx    # Task category picker
│   ├── InputArea.jsx       # Unified input component
│   ├── OutputDisplay.jsx   # Task result viewer
│   ├── TaskHistory.jsx     # History sidebar
│   └── Settings.jsx        # Settings panel
└── worker.js               # Extended (add task handling)
```

### Modified Files
```
src/App.jsx                 # Major refactor for office assistant UI
src/index.css               # New styles for office assistant components
vite.config.js              # Add pdf.js alias if needed
package.json                # Add pdf.js dependency
```
