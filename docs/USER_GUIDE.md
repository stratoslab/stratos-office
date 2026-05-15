# Stratos Office — User Guide

> How to use every task in the AI Office Assistant.

---

## Getting Started

### System Requirements

- **Browser**: Chrome 113+ or Edge 113+ (WebGPU required)
- **GPU**: Any modern GPU with WebGPU support (integrated or discrete)
- **RAM**: 4 GB+ recommended (8 GB for best performance)
- **Storage**: ~2 GB for model cache (first download only)

### First Launch

1. Open Stratos Office in Chrome or Edge
2. Click **"Load Gemma 4"** on the landing page
3. The model downloads once (~1–2 GB, 30–120 seconds depending on connection)
4. After the first download, the model is cached — every subsequent visit loads in seconds
5. Once loaded, the dashboard appears and all tasks are available

### Privacy

Everything runs locally on your device. No text, images, audio, or documents are ever sent to any server. The only exception is the **Web Research** task, which sends your search query to an external search service — you can disable this entirely with **Offline Mode** in Settings.

---

## Navigation

The sidebar on the left organizes all tasks into six categories. Click a category to expand it and see its tasks. Click any task to open its workspace.

| Category | Tasks |
|---|---|
| **Documents** | OCR, Receipt/Invoice, Handwriting, Table Extract, Form Extract, PDF Q&A, Contract Analyzer, Redline Comparison |
| **Visual** | Chart Extract, Screen Analysis, Wireframe to HTML, Slide Analyzer, Whiteboard OCR, Object Detection |
| **Audio** | Meeting Transcription, Meeting Minutes, Voice to Email, Multilingual Transcription, Interview Transcriber |
| **Text & Writing** | Email Draft, Email Reply, Tone Rewriter, Summarize, Meeting Prep, Report Generator, Code Review, General Text |
| **Research** | Web Research, Deep Document Q&A |
| **Privacy-First** | Medical Summarizer, Legal Analyzer, Financial Parser |

---

## Input Methods

### File Upload
- Click the upload zone or drag and drop a file
- Supported images: PNG, JPG, JPEG, WebP, GIF, BMP
- Supported audio: WebM, WAV, MP3, OGG, M4A
- Supported documents: PDF
- Maximum file size: 50 MB

### Webcam Capture
- Click **Open Camera** to start a live preview
- Click **Capture** to take a still frame
- Available for image-based tasks (OCR, Screen Analysis, etc.)

### Microphone Recording
- Click **Record** to start recording
- A live audio level meter shows recording activity
- Click **Stop** when done — audio is automatically converted for the model
- Maximum recording length: 30 minutes (warning at 25 minutes)

### Text Input
- Type directly in the text area
- The area auto-resizes as you type

---

## Output Options

### Viewing Results
- **Markdown**: Rendered with headings, lists, code blocks, and tables
- **JSON**: Syntax-highlighted, collapsible tree view
- **HTML**: Rendered in a sandboxed preview with a Code/Preview toggle
- **Diff**: Color-coded additions (green), deletions (red), modifications (side-by-side)

### Exporting Results
- Click **Export** and choose a format:
  - **TXT** — plain text, Markdown stripped
  - **JSON** — structured data (or `{ "output": "..." }` for text tasks)
  - **Markdown** — raw Markdown
  - **HTML** — self-contained HTML document with Stratos styling
- Files are named `stratos-<task>-<date>.<ext>`

### Copy to Clipboard
- Click the **Copy** button in the top-right of the output panel

---

## Thinking Mode

Some tasks support **Thinking Mode** — a chain-of-thought reasoning pass that produces more thorough results at the cost of more tokens and time. Toggle it on/off in the task header.

Thinking Mode is enabled by default for: Contract Analyzer, Redline Comparison, Code Review, Legal Analyzer.

---

## Task Reference

### Documents

#### Document OCR
Extracts all text from an image of a document, preserving line breaks and paragraph structure.

**Input:** Image (PNG, JPG, WebP, etc.) or webcam capture
**Output:** Plain text

#### Receipt / Invoice Parser
Extracts structured data from a receipt or invoice photo.

**Input:** Image
**Output:** JSON — vendor, date, total, currency, line items, tax

#### Handwriting Transcription
Converts a photo of handwritten notes to typed text.

**Input:** Image
**Output:** Plain text

#### Table Extraction
Extracts a table from an image into a structured format.

**Input:** Image
**Output:** Markdown table (exportable as JSON array)

#### Form Field Extraction
Extracts all form fields and their values from a document image.

**Input:** Image
**Output:** JSON — field label → value

#### Multi-Page PDF Q&A
Upload a PDF and ask questions about its content using the model's 128K context window.

**Input:** PDF + text question
**Output:** Plain text answer with page citations

**Tips:**
- PDFs over 50 pages show a page range selector — choose which pages to include
- The token estimate shows how much context your document uses
- An amber warning appears if the document approaches the 128K limit

#### Contract Analyzer
Analyzes a contract PDF for risk, key clauses, and flagged terms.

**Input:** PDF
**Output:** Summary, key clauses, flagged terms with risk levels (low/medium/high), overall risk rating

#### Redline Comparison
Compares two document versions and shows what changed.

**Input:** Two PDFs or text documents
**Output:** Color-coded diff — green additions, red deletions, side-by-side modifications

---

### Visual

#### Chart / Graph Data Extraction
Extracts data points, trends, and axis labels from a chart image.

**Input:** Image
**Output:** JSON — chart type, series data, trends

#### Screen / UI Analysis
Describes the UI elements in a screenshot.

**Input:** Image or webcam capture
**Output:** JSON — page title, layout description, element list

#### Wireframe to HTML
Converts a wireframe sketch or screenshot into working HTML/CSS.

**Input:** Image
**Output:** HTML code with a live preview option

#### Slide Analyzer
Generates speaker notes and a summary from a presentation slide screenshot.

**Input:** Image
**Output:** Slide title, key points, speaker notes, summary

#### Whiteboard OCR
Converts a whiteboard photo to clean typed notes.

**Input:** Image or webcam capture
**Output:** Markdown — preserves headings, lists, equations

#### Object Detection
Detects and locates objects in an image with bounding box coordinates.

**Input:** Image
**Output:** Labeled bounding boxes overlaid on the image + JSON array

---

### Audio

#### Meeting Transcription
Transcribes an audio recording with speaker turns and timestamps.

**Input:** Audio file or microphone recording
**Output:** Markdown transcript

#### Meeting Minutes Generator
Generates structured meeting minutes with action items from audio.

**Input:** Audio file or microphone recording
**Output:** JSON — title, attendees, agenda, decisions, action items (owner + task + due date)

#### Voice to Email
Speak a message and receive a polished email draft.

**Input:** Audio file or microphone recording
**Output:** Email preview — subject, recipient, body, tone

#### Multilingual Transcription + Translation
Transcribes audio in any language and provides an English translation.

**Input:** Audio file or microphone recording
**Output:** Detected language, original transcript, English translation (side by side)

#### Interview Transcriber
Transcribes an interview into a formatted Q&A document.

**Input:** Audio file or microphone recording
**Output:** Markdown with alternating **Q:** and **A:** blocks

---

### Text & Writing

#### Email Draft
Drafts a professional email from your description.

**Input:** Text description of the email you need
**Output:** Email preview — subject, recipient, body, tone

#### Email Reply Drafts
Paste a received email and get three reply options with different tones.

**Input:** Text (the email you received)
**Output:** Three selectable reply cards — click to expand and copy

#### Tone Rewriter
Rewrites text in a different tone.

**Input:** Text + tone selection (Professional, Casual, Formal, Friendly, Concise, Persuasive)
**Output:** Original and rewritten text side by side

#### Summarization
Summarizes text, image, or audio content into bullet points.

**Input:** Text, image, or audio
**Output:** Markdown bullet list

#### Meeting Prep Brief
Generates a preparation brief with talking points from an agenda or topic.

**Input:** Text (agenda or meeting topic)
**Output:** Meeting context, key talking points, questions to ask, background notes

#### Report Generator
Turns bullet points into a formatted report.

**Input:** Text (bullet points or rough notes)
**Output:** Markdown report with executive summary, body sections, conclusion

#### Code Review
Reviews code for bugs, style issues, and improvements.

**Input:** Text (paste your code)
**Output:** Issues with severity badges (critical/warning/suggestion), positive aspects, overall assessment

#### General Text
Free-form text input — ask the model anything.

**Input:** Text
**Output:** Markdown

---

### Research

#### Web Research
Searches the web and synthesizes an answer with citations.

**First-time setup:** Web research requires a free TinyFish API key. When you first open the Research task, a setup prompt walks you through it:

1. Click **"Get free key at tinyfish.ai →"** — opens tinyfish.ai in a new tab
2. Sign up (free, no credit card) and copy your API key
3. Paste it into the input field and click **"Save & Connect"**
4. The app validates the key and stores it locally — you're connected

The key is stored only in your browser's `localStorage` and is only ever sent to `api.tinyfish.ai` over HTTPS. You can disconnect or change it anytime in Settings → Web Search.

**Input:** Text query
**Output:** Answer with inline citation numbers, numbered sources list with links

**Note:** Enable **Offline Mode** in Settings to disable web features entirely.

#### Deep Document Q&A
Ask questions about a long document using the full 128K context window.

**Input:** Text paste or PDF upload + text question
**Output:** Plain text answer with document section references

---

### Privacy-First Specialized

All three tasks in this category display a **privacy notice** before submission (confirming all processing is local) and a **disclaimer** below the output.

#### Medical Document Summarizer
Summarizes lab results or medical records in plain language.

**Input:** Image or PDF
**Output:** Document type, plain-language summary, key findings, out-of-range values

> ⚠️ This summary is AI-generated and not a substitute for professional medical advice.

#### Legal Document Analyzer
Analyzes contracts, NDAs, and leases for key terms and risk flags.

**Input:** Image or PDF
**Output:** Document type, parties, key terms, obligations, risk flags with severity

> ⚠️ This analysis is AI-generated and not legal advice. Consult a qualified attorney.

#### Financial Statement Parser
Extracts structured data from bank statements or tax documents.

**Input:** Image or PDF
**Output:** Period, account holder, opening/closing balance, transaction list, totals

> ⚠️ This data is AI-extracted and may contain errors. Verify against original documents.

---

## Settings

Open Settings from the top bar or sidebar.

| Setting | Description |
|---|---|
| **Model Info** | Shows model ID, quantization type, WebGPU status |
| **Performance** | Current TPS and token count during generation |
| **Storage** | Browser cache usage estimate |
| **Offline Mode** | Disables all web features (MCP search/fetch). Research task is hidden when enabled. |
| **Thinking Mode Default** | Sets the default state of the Thinking Mode toggle for all tasks that support it |
| **Theme** | Dark / Light mode toggle |
| **Clear Model Cache** | Removes cached model files — you'll need to re-download on next visit |

---

## Troubleshooting

### "WebGPU Not Available"
Use Chrome 113+ or Edge 113+. Ensure hardware acceleration is enabled in browser settings (`chrome://settings/system`).

### Model Download Fails
Check your internet connection and try again. The download resumes from where it left off. If the issue persists, try clearing the model cache in Settings and reloading.

### Slow Inference
- Close other browser tabs to free GPU memory
- Ensure hardware acceleration is enabled
- Integrated GPUs will be slower than discrete GPUs — 5–10 t/s is normal for integrated

### Poor OCR / Transcription Accuracy
- Use higher resolution images for OCR tasks
- Ensure text is clearly visible and not blurry
- For audio, use a quiet environment and speak clearly
- Try enabling Thinking Mode for complex documents

### Research Task Not Working
- Check that Offline Mode is disabled in Settings
- Verify your internet connection
- If the search service is unavailable, use "Run without web search" to get an answer from the model's training knowledge
