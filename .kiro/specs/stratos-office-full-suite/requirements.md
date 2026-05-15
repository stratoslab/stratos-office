# Requirements Document

## Introduction

Stratos Office Full Suite is a comprehensive, browser-only AI office assistant powered by Gemma 4 E2B running via Transformers.js on WebGPU. The suite extends the existing Stratos Office application — which already has a working model loading pipeline, landing page, dashboard shell, and basic layout components — into a fully functional, production-quality AI office tool.

All inference runs entirely on the user's device. No data, prompts, images, or audio ever leave the browser. The suite covers five task categories: Documents, Visual, Audio, Text & Writing, and Research, plus a Privacy-First Specialized Tasks category for sensitive document types. A polished dark-mode UI consistent with the existing Stratos design system ties all capabilities together.

The application targets Chrome 113+ and Edge 113+ (WebGPU required). It is built with React, TypeScript, Vite, Tailwind CSS, and Framer Motion, using a Web Worker for non-blocking inference.

---

## Glossary

- **Suite**: The complete Stratos Office Full Suite application described in this document.
- **Model**: The Gemma 4 E2B ONNX model (`onnx-community/gemma-4-E2B-it-ONNX`) loaded via Transformers.js.
- **Worker**: The Web Worker (`worker.js`) that hosts the Model and executes all inference tasks off the main thread.
- **Task**: A single unit of work submitted by the user (e.g., OCR an image, transcribe audio, draft an email).
- **Task_Router**: The module inside the Worker that maps a task type to the correct prompt template and inference pipeline.
- **Prompt_Template**: A structured string that encodes the task instruction and any system context sent to the Model.
- **Output_Parser**: The module that extracts structured JSON or plain text from raw Model output.
- **File_Handler**: The browser-side module that validates, reads, and pre-processes uploaded files (images, audio, PDF).
- **PDF_Processor**: The pdf.js-based module that renders PDF pages to canvas data URLs for Model input.
- **Audio_Recorder**: The browser MediaRecorder-based module that captures microphone input and converts it to 16 kHz mono PCM.
- **Webcam_Capture**: The browser getUserMedia-based module that captures still frames from the device camera.
- **MCP_Client**: The optional Model Context Protocol client that calls external search and fetch tools for the Research task category.
- **History_Store**: The in-browser (localStorage / IndexedDB) store that persists completed Task entries across sessions.
- **Task_Entry**: A record of one completed or failed Task, including type, input summary, output, status, timestamp, and duration.
- **Thinking_Mode**: An optional chain-of-thought reasoning pass enabled by `enable_thinking: true` in the chat template.
- **Streaming_Output**: Token-by-token display of Model output as it is generated, before the full response is complete.
- **Export**: Saving Task output to a file in TXT, JSON, Markdown, or HTML format.
- **WebGPU**: The browser GPU compute API required for Model inference.
- **TTFT**: Time To First Token — latency from task submission to first streamed token.
- **TPS**: Tokens Per Second — inference throughput metric.
- **EARS**: Easy Approach to Requirements Syntax — the pattern system used for all acceptance criteria in this document.
- **WCAG_AA**: Web Content Accessibility Guidelines 2.1 Level AA — the accessibility standard the Suite must meet.

---

## Requirements

### Requirement 1: Task Category Navigation

**User Story:** As a user, I want to navigate between task categories using a sidebar, so that I can quickly find and launch any of the Suite's capabilities.

#### Acceptance Criteria

1. THE Suite SHALL render a persistent sidebar containing navigation items for the categories: Documents, Visual, Audio, Text & Writing, Research, and Privacy-First Specialized Tasks.
2. WHEN a user selects a category in the sidebar, THE Suite SHALL update the main workspace to display the task list for that category without a full page reload.
3. WHEN a user selects a specific task within a category, THE Suite SHALL render the task workspace panel for that task.
4. WHILE the Model is not yet loaded, THE Suite SHALL display each sidebar task item in a disabled state with a tooltip indicating the Model must be loaded first.
5. THE Suite SHALL display an icon and label for each sidebar category item using the Lucide icon set consistent with the existing design system.
6. WHILE the viewport width is less than 768px, THE Suite SHALL collapse the sidebar to an icon-only bar and provide a toggle button to expand it as a drawer overlay.
7. WHILE the viewport width is between 768px and 1024px, THE Suite SHALL render the sidebar as an icon-only bar with tooltips on hover.
8. THE Suite SHALL highlight the currently active task in the sidebar with the Accent Blue (`#00D4FF`) color.

---

### Requirement 2: Task Workspace Panel

**User Story:** As a user, I want each task to have a dedicated input panel with the appropriate input controls, so that I can provide the right type of input for each task without confusion.

#### Acceptance Criteria

1. WHEN a task requiring image input is selected, THE Suite SHALL render a file upload zone that accepts PNG, JPG, JPEG, WebP, GIF, and BMP files up to 50 MB.
2. WHEN a task requiring audio input is selected, THE Suite SHALL render both a file upload zone accepting WebM, WAV, MP3, OGG, and M4A files up to 50 MB, and an in-browser audio recorder button.
3. WHEN a task requiring text input is selected, THE Suite SHALL render a resizable textarea with a placeholder describing the expected input.
4. WHEN a task supporting webcam capture is selected, THE Suite SHALL render a camera capture button that opens a live preview and allows the user to take a still frame.
5. WHEN a task supporting PDF input is selected, THE Suite SHALL render a file upload zone accepting PDF files up to 50 MB.
6. WHEN a user uploads a file exceeding 50 MB, THE File_Handler SHALL reject the file and display an error message stating the maximum allowed size.
7. WHEN a user uploads a file with an unsupported MIME type, THE File_Handler SHALL reject the file and display an error message listing the accepted formats.
8. THE Suite SHALL display a thumbnail preview for uploaded images and a waveform or duration indicator for uploaded audio files.
9. THE Suite SHALL provide a Thinking Mode toggle on tasks where chain-of-thought reasoning improves output quality (document parsing, contract analysis, research, code review, redline comparison).
10. WHEN the Thinking Mode toggle is enabled, THE Worker SHALL pass `enable_thinking: true` to the chat template for that task.

---

### Requirement 3: Streaming Output Display

**User Story:** As a user, I want to see the Model's response appear token by token as it is generated, so that I get immediate feedback and do not have to wait for the full response.

#### Acceptance Criteria

1. WHEN the Worker emits a `status: "start"` message, THE Suite SHALL clear the output panel and display a blinking cursor to indicate generation has begun.
2. WHEN the Worker emits a `status: "update"` message, THE Suite SHALL append the new token text to the output panel in real time.
3. WHEN the Worker emits a `status: "complete"` message, THE Suite SHALL hide the blinking cursor and display the final token count and TPS in the status bar.
4. THE Suite SHALL render Markdown formatting (headings, bold, italic, lists, code blocks, tables) in the output panel using a Markdown renderer.
5. THE Suite SHALL render JSON output in a syntax-highlighted, collapsible tree view when the task output type is structured JSON.
6. THE Suite SHALL provide a Copy button in the top-right corner of the output panel that copies the full output text to the clipboard.
7. THE Suite SHALL provide a Stop button that, when clicked, sends an `interrupt` message to the Worker and halts generation.
8. WHEN generation is stopped by the user, THE Suite SHALL display a "Generation stopped" notice and retain the partial output.
9. WHILE generation is in progress, THE Suite SHALL display a progress indicator showing elapsed time and current TPS.

---

### Requirement 4: Export Options

**User Story:** As a user, I want to export task output in multiple formats, so that I can use the results in other applications.

#### Acceptance Criteria

1. WHEN a task has completed output, THE Suite SHALL display an Export button with a dropdown offering TXT, JSON, Markdown, and HTML format options.
2. WHEN the user selects TXT export, THE Suite SHALL download a `.txt` file containing the plain text of the output, stripping all Markdown formatting.
3. WHEN the user selects JSON export and the output is structured JSON, THE Suite SHALL download a `.json` file containing the parsed JSON object.
4. WHEN the user selects JSON export and the output is plain text, THE Suite SHALL download a `.json` file containing `{ "output": "<text>" }`.
5. WHEN the user selects Markdown export, THE Suite SHALL download a `.md` file containing the raw Markdown output.
6. WHEN the user selects HTML export, THE Suite SHALL download a `.html` file containing the output rendered as a self-contained HTML document with inline styles matching the Stratos design system.
7. THE Suite SHALL name exported files using the pattern `stratos-<task-type>-<ISO-date>.<extension>`.

---

### Requirement 5: Task History

**User Story:** As a user, I want to view and re-open past task results, so that I can reference previous outputs without re-running tasks.

#### Acceptance Criteria

1. WHEN a task completes successfully, THE History_Store SHALL persist a Task_Entry containing: task type, input summary (first 200 characters), full output, status, ISO timestamp, and duration in milliseconds.
2. WHEN the user opens the History Drawer, THE Suite SHALL display a list of Task_Entry records sorted by timestamp descending, showing task type icon, input summary, and relative time.
3. WHEN the user clicks a Task_Entry in the History Drawer, THE Suite SHALL navigate to the corresponding task workspace and populate the output panel with the stored output.
4. WHEN the user clicks the delete icon on a Task_Entry, THE History_Store SHALL remove that entry and THE Suite SHALL update the list immediately.
5. THE Suite SHALL provide a "Clear All History" button in the History Drawer that removes all Task_Entry records after a confirmation dialog.
6. THE History_Store SHALL retain at most 200 Task_Entry records; WHEN a new entry would exceed this limit, THE History_Store SHALL delete the oldest entry.
7. THE History_Store SHALL persist Task_Entry records across browser sessions using IndexedDB.

---

### Requirement 6: Document OCR

**User Story:** As a user, I want to extract all text from an image of a document, so that I can get a digital, editable copy of printed or scanned content.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the OCR task, THE Task_Router SHALL send the image and the OCR Prompt_Template to the Worker.
2. WHEN the Worker completes OCR generation, THE Output_Parser SHALL return the extracted text as a plain string preserving line breaks and paragraph structure.
3. IF the uploaded image contains no detectable text, THEN THE Output_Parser SHALL return a message stating no text was found rather than an empty string.
4. THE Suite SHALL display the OCR output in the output panel with Markdown formatting preserved.
5. THE Task_Router SHALL set `max_new_tokens` to 512 for OCR tasks.

---

### Requirement 7: Document Parse (Receipt / Invoice Extraction)

**User Story:** As a user, I want to extract structured data from a receipt or invoice image, so that I can get machine-readable fields without manual data entry.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Document Parse task, THE Task_Router SHALL send the image and the document parse Prompt_Template requesting JSON output to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL extract and return a JSON object containing at minimum: `vendor`, `date`, `total`, `currency`, `line_items` (array of `{ description, quantity, unit_price, total }`), and `tax`.
3. IF the Output_Parser cannot extract valid JSON from the Model output, THEN THE Output_Parser SHALL retry the generation once with a correction prompt before returning an error.
4. THE Suite SHALL render the parsed JSON in a syntax-highlighted tree view in the output panel.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Document Parse tasks.

---

### Requirement 8: Handwriting Transcription

**User Story:** As a user, I want to convert a photo of handwritten notes into typed text, so that I can search, edit, and share the content digitally.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Handwriting Transcription task, THE Task_Router SHALL send the image and the handwriting Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the transcribed text preserving paragraph and list structure where detectable.
3. THE Suite SHALL display the transcribed text in the output panel with copy and export options.
4. THE Task_Router SHALL set `max_new_tokens` to 512 for Handwriting Transcription tasks.

---

### Requirement 9: Table Extraction

**User Story:** As a user, I want to extract a table from an image into a structured format, so that I can import the data into a spreadsheet or database.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Table Extraction task, THE Task_Router SHALL send the image and the table extraction Prompt_Template requesting Markdown table output to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the table as a Markdown table string.
3. THE Suite SHALL render the Markdown table in the output panel with alternating row shading.
4. WHEN the user selects JSON export for a Table Extraction result, THE Output_Parser SHALL convert the Markdown table to a JSON array of objects using the header row as keys.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Table Extraction tasks.

---

### Requirement 10: Form Extraction

**User Story:** As a user, I want to extract all fields and values from a form image into structured JSON, so that I can process form data programmatically.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Form Extraction task, THE Task_Router SHALL send the image and the form extraction Prompt_Template requesting JSON output to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object where each key is a form field label and each value is the filled-in content or `null` if blank.
3. IF the Output_Parser cannot extract valid JSON, THEN THE Output_Parser SHALL retry once with a correction prompt before returning an error.
4. THE Suite SHALL render the form field JSON in a key-value table view in the output panel.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Form Extraction tasks.

---

### Requirement 11: Multi-Page PDF Q&A

**User Story:** As a user, I want to upload a PDF and ask questions about its content, so that I can quickly find information in long documents without reading them in full.

#### Acceptance Criteria

1. WHEN the user uploads a PDF file, THE PDF_Processor SHALL render each page to a canvas data URL and extract the text layer using pdf.js.
2. WHEN the PDF contains more than 50 pages, THE PDF_Processor SHALL display a page range selector allowing the user to choose which pages to include, and SHALL warn that processing all pages may be slow.
3. WHEN the user submits a question, THE Task_Router SHALL construct a message containing the extracted text from all selected pages (up to the 128K context limit) and the user's question.
4. WHEN the Worker completes generation, THE Output_Parser SHALL return the answer as plain text with page number citations where applicable.
5. THE Suite SHALL display a page count and estimated token usage before the user submits the task.
6. THE Task_Router SHALL set `max_new_tokens` to 2048 for PDF Q&A tasks.
7. IF the combined page text exceeds the 128K context limit, THEN THE Task_Router SHALL truncate to the most recent pages that fit and display a warning to the user.

---

### Requirement 12: Contract Analyzer

**User Story:** As a user, I want to upload a contract PDF and receive a risk summary with key clauses and flagged terms, so that I can quickly understand the legal implications without reading every line.

#### Acceptance Criteria

1. WHEN the user uploads a PDF and submits the Contract Analyzer task, THE PDF_Processor SHALL extract the full text and THE Task_Router SHALL send it with the contract analysis Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `summary` (string), `key_clauses` (array of `{ clause_title, text, page }`), `flagged_terms` (array of `{ term, risk_level, explanation }`), and `overall_risk` (`low` | `medium` | `high`).
3. THE Suite SHALL render the contract analysis result with color-coded risk badges: green for low, amber for medium, red for high.
4. THE Task_Router SHALL enable Thinking_Mode by default for Contract Analyzer tasks.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for Contract Analyzer tasks.

---

### Requirement 13: Redline Comparison

**User Story:** As a user, I want to compare two versions of a document and receive a commentary on the differences, so that I can understand what changed between drafts.

#### Acceptance Criteria

1. WHEN the user uploads two text or PDF documents and submits the Redline Comparison task, THE Suite SHALL extract the text from both documents and THE Task_Router SHALL send both texts with the redline Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `additions` (array of added passages), `deletions` (array of removed passages), `modifications` (array of `{ original, revised, commentary }`), and `summary` (string).
3. THE Suite SHALL render additions in green, deletions in red with strikethrough, and modifications with a side-by-side diff view.
4. THE Task_Router SHALL enable Thinking_Mode by default for Redline Comparison tasks.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for Redline Comparison tasks.

---

### Requirement 14: Chart / Graph Data Extraction

**User Story:** As a user, I want to extract the underlying data and trends from a chart or graph image, so that I can work with the data programmatically or include it in a report.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Chart Extraction task, THE Task_Router SHALL send the image and the chart extraction Prompt_Template requesting JSON output to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `chart_type` (string), `title` (string or null), `x_axis` (label + unit), `y_axis` (label + unit), `series` (array of `{ name, data_points: [{ x, y }] }`), and `trends` (array of trend description strings).
3. IF the Output_Parser cannot extract valid JSON, THEN THE Output_Parser SHALL retry once with a correction prompt.
4. THE Suite SHALL render the extracted data as a summary table alongside the JSON tree view.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Chart Extraction tasks.

---

### Requirement 15: Screen / UI Analysis

**User Story:** As a user, I want to upload a screenshot and receive a description of the UI elements present, so that I can document interfaces or identify components for automation.

#### Acceptance Criteria

1. WHEN the user uploads a screenshot and submits the Screen Analysis task, THE Task_Router SHALL send the image and the screen analysis Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `page_title` (string or null), `layout_description` (string), `elements` (array of `{ type, label, position_description, action }`).
3. THE Suite SHALL render the element list as a structured table in the output panel.
4. THE Task_Router SHALL set `max_new_tokens` to 1024 for Screen Analysis tasks.

---

### Requirement 16: Wireframe-to-HTML

**User Story:** As a user, I want to upload a wireframe sketch or screenshot and receive working HTML/CSS code, so that I can rapidly prototype UI from hand-drawn or low-fidelity designs.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Wireframe-to-HTML task, THE Task_Router SHALL send the image and the wireframe-to-HTML Prompt_Template requesting a complete HTML document to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL extract the HTML code block from the Model output and return it as a string.
3. THE Suite SHALL render the HTML output in a syntax-highlighted code block using JetBrains Mono.
4. THE Suite SHALL provide a "Preview" button that renders the generated HTML in a sandboxed `<iframe>` within the output panel.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for Wireframe-to-HTML tasks.

---

### Requirement 17: Slide Analyzer

**User Story:** As a user, I want to upload a presentation slide screenshot and receive speaker notes and a summary, so that I can prepare for a presentation or review slides quickly.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Slide Analyzer task, THE Task_Router SHALL send the image and the slide analysis Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `slide_title` (string), `key_points` (array of strings), `speaker_notes` (string), and `summary` (string).
3. THE Suite SHALL render the key points as a bulleted list and the speaker notes in a distinct styled block.
4. THE Task_Router SHALL set `max_new_tokens` to 1024 for Slide Analyzer tasks.

---

### Requirement 18: Whiteboard OCR

**User Story:** As a user, I want to photograph a whiteboard and receive clean typed notes, so that I can capture meeting content without manual transcription.

#### Acceptance Criteria

1. WHEN the user uploads a whiteboard photo and submits the Whiteboard OCR task, THE Task_Router SHALL send the image and the whiteboard OCR Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the whiteboard content as structured Markdown, preserving headings, lists, diagrams described in text, and equations where present.
3. THE Suite SHALL display the Markdown output with full rendering in the output panel.
4. THE Task_Router SHALL set `max_new_tokens` to 1024 for Whiteboard OCR tasks.

---

### Requirement 19: Object Detection

**User Story:** As a user, I want to detect and locate objects in an image with bounding box coordinates, so that I can use the results for downstream processing or annotation.

#### Acceptance Criteria

1. WHEN the user uploads an image and submits the Object Detection task, THE Task_Router SHALL send the image and the object detection Prompt_Template requesting JSON bounding box output to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON array of objects, each containing: `label` (string), `confidence` (string description), `bbox` (`{ x_min, y_min, x_max, y_max }` as fractions of image dimensions 0.0–1.0).
3. THE Suite SHALL overlay labeled bounding boxes on a copy of the uploaded image using an HTML Canvas element.
4. IF the Output_Parser cannot extract valid JSON, THEN THE Output_Parser SHALL retry once with a correction prompt.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Object Detection tasks.

---

### Requirement 20: Meeting Transcription

**User Story:** As a user, I want to upload or record a meeting audio file and receive a formatted transcript, so that I have a written record of the meeting.

#### Acceptance Criteria

1. WHEN the user provides an audio file or recording and submits the Meeting Transcription task, THE Audio_Recorder SHALL convert the audio to 16 kHz mono PCM before passing it to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the transcript as a Markdown document with speaker-turn paragraphs and timestamps where detectable.
3. THE Suite SHALL display the transcript in the output panel with copy and export options.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Meeting Transcription tasks.

---

### Requirement 21: Meeting Minutes Generator

**User Story:** As a user, I want to upload meeting audio and receive structured meeting minutes with action items, so that I can distribute a professional summary to attendees.

#### Acceptance Criteria

1. WHEN the user provides an audio file and submits the Meeting Minutes task, THE Task_Router SHALL first transcribe the audio and then send the transcript with the meeting minutes Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `meeting_title` (string), `date` (string or null), `attendees` (array of strings or null), `agenda_items` (array of strings), `discussion_summary` (string), `decisions` (array of strings), and `action_items` (array of `{ owner, task, due_date }`).
3. THE Suite SHALL render the minutes in a formatted document view with sections for each JSON field.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Meeting Minutes tasks.

---

### Requirement 22: Voice-to-Email

**User Story:** As a user, I want to speak a message and receive a polished email draft, so that I can compose emails hands-free.

#### Acceptance Criteria

1. WHEN the user records or uploads audio and submits the Voice-to-Email task, THE Task_Router SHALL transcribe the audio and then send the transcript with the voice-to-email Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `subject` (string), `to` (string or null), `body` (string), and `tone` (string).
3. THE Suite SHALL render the email draft in a styled email preview panel with subject, recipient, and body fields.
4. THE Suite SHALL provide a Copy button that copies the email body to the clipboard.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Voice-to-Email tasks.

---

### Requirement 23: Multilingual Transcription and Translation

**User Story:** As a user, I want to transcribe audio in any language and receive both the original transcript and an English translation, so that I can understand content in languages I do not speak.

#### Acceptance Criteria

1. WHEN the user provides audio and submits the Multilingual Transcription task, THE Task_Router SHALL send the audio with a Prompt_Template requesting both the original-language transcript and an English translation in a single pass.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `detected_language` (string), `original_transcript` (string), and `english_translation` (string).
3. THE Suite SHALL display the original transcript and translation side by side in the output panel.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Multilingual Transcription tasks.

---

### Requirement 24: Interview Transcriber

**User Story:** As a user, I want to transcribe an interview audio file into a formatted Q&A transcript, so that I can publish or review interview content easily.

#### Acceptance Criteria

1. WHEN the user provides audio and submits the Interview Transcriber task, THE Task_Router SHALL send the audio with the interview transcription Prompt_Template requesting Q&A format output.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the transcript as a Markdown document with alternating `**Q:**` and `**A:**` blocks.
3. THE Suite SHALL render the Q&A transcript with distinct visual styling for questions and answers.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Interview Transcriber tasks.

---

### Requirement 25: Email Drafting

**User Story:** As a user, I want to describe an email I need to send and receive a complete draft, so that I can compose professional emails faster.

#### Acceptance Criteria

1. WHEN the user enters a description and submits the Email Drafting task, THE Task_Router SHALL send the description with the email drafting Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `subject` (string), `to` (string or null), `body` (string), and `tone` (string).
3. THE Suite SHALL render the email draft in a styled email preview panel.
4. THE Task_Router SHALL set `max_new_tokens` to 1024 for Email Drafting tasks.

---

### Requirement 26: Email Reply Drafts

**User Story:** As a user, I want to paste a received email and get three reply options with different tones, so that I can choose the most appropriate response quickly.

#### Acceptance Criteria

1. WHEN the user pastes an email and submits the Email Reply task, THE Task_Router SHALL send the email text with the reply drafting Prompt_Template requesting three reply options to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON array of exactly three objects, each containing: `tone` (string), `subject` (string), and `body` (string).
3. THE Suite SHALL render the three reply options as selectable cards, each labeled with its tone.
4. WHEN the user selects a reply card, THE Suite SHALL expand it to show the full body with copy and export options.
5. THE Task_Router SHALL set `max_new_tokens` to 1536 for Email Reply tasks.

---

### Requirement 27: Tone Rewriter

**User Story:** As a user, I want to paste text and select a target tone, so that I can rewrite content to match a specific communication style.

#### Acceptance Criteria

1. THE Suite SHALL provide a tone selector with at minimum the following options: Professional, Casual, Formal, Friendly, Concise, and Persuasive.
2. WHEN the user enters text, selects a tone, and submits the Tone Rewriter task, THE Task_Router SHALL send the text and selected tone with the tone rewriter Prompt_Template to the Worker.
3. WHEN the Worker completes generation, THE Output_Parser SHALL return the rewritten text as a plain string.
4. THE Suite SHALL display the original and rewritten text side by side in the output panel.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Tone Rewriter tasks.

---

### Requirement 28: Summarization

**User Story:** As a user, I want to summarize text, image, or audio content into bullet points, so that I can quickly grasp the key information.

#### Acceptance Criteria

1. WHEN the user provides text, an image, or audio and submits the Summarization task, THE Task_Router SHALL send the appropriate input with the summarization Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the summary as a Markdown bulleted list.
3. THE Suite SHALL render the bulleted summary in the output panel.
4. THE Task_Router SHALL set `max_new_tokens` to 512 for Summarization tasks.

---

### Requirement 29: Meeting Prep Brief

**User Story:** As a user, I want to enter a meeting agenda or topic and receive a preparation brief with talking points, so that I can walk into meetings well-prepared.

#### Acceptance Criteria

1. WHEN the user enters an agenda or topic and submits the Meeting Prep task, THE Task_Router SHALL send the input with the meeting prep Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `meeting_context` (string), `key_talking_points` (array of strings), `questions_to_ask` (array of strings), and `background_notes` (string).
3. THE Suite SHALL render the brief in a structured document view with labeled sections.
4. THE Task_Router SHALL set `max_new_tokens` to 1024 for Meeting Prep tasks.

---

### Requirement 30: Report Generator

**User Story:** As a user, I want to enter bullet points and receive a formatted report, so that I can turn rough notes into a professional document quickly.

#### Acceptance Criteria

1. WHEN the user enters bullet points and submits the Report Generator task, THE Task_Router SHALL send the input with the report generation Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the report as a Markdown document with an executive summary, body sections, and a conclusion.
3. THE Suite SHALL render the Markdown report in the output panel with full formatting.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Report Generator tasks.

---

### Requirement 31: Code Review

**User Story:** As a user, I want to paste code and receive a review with suggestions, so that I can improve code quality without waiting for a human reviewer.

#### Acceptance Criteria

1. WHEN the user pastes code and submits the Code Review task, THE Task_Router SHALL send the code with the code review Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `language` (string), `overall_assessment` (string), `issues` (array of `{ severity: "critical"|"warning"|"suggestion", line_reference, description, suggested_fix }`), and `positive_aspects` (array of strings).
3. THE Suite SHALL render issues with color-coded severity badges: red for critical, amber for warning, blue for suggestion.
4. THE Task_Router SHALL enable Thinking_Mode by default for Code Review tasks.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for Code Review tasks.

---

### Requirement 32: General Text Task

**User Story:** As a user, I want a free-form text input where I can ask the Model anything, so that I can use the Model for tasks not covered by the specialized task types.

#### Acceptance Criteria

1. WHEN the user enters any text and submits the General Text task, THE Task_Router SHALL send the text as a user message with no additional system prompt to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the raw Model output as a string.
3. THE Suite SHALL render the output with Markdown formatting in the output panel.
4. THE Suite SHALL provide the Thinking Mode toggle for General Text tasks.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for General Text tasks.

---

### Requirement 33: Web Research with MCP

**User Story:** As a user, I want to enter a research query and receive a synthesized answer with citations from live web sources, so that I can get up-to-date information without leaving the application.

#### Background

Web research requires calling the TinyFish Search and Fetch APIs, which are free but require an `X-API-Key` header on every request. The user must obtain a free API key from [tinyfish.ai](https://tinyfish.ai) and enter it once in Settings. The key is stored in `localStorage` under `stratos-tinyfish-key` and is never transmitted anywhere except to the TinyFish API endpoints.

#### Acceptance Criteria

1. WHEN the user navigates to the Research task and no TinyFish API key is stored in `localStorage`, THE Suite SHALL display a full-panel setup prompt containing: (a) a brief explanation that web search requires a free TinyFish API key, (b) a "Get your free key →" button that opens `https://tinyfish.ai` in a new browser tab, (c) a labeled text input for the user to paste their API key, and (d) a "Save & Connect" button that validates and saves the key.
2. WHEN the user clicks "Save & Connect", THE MCP_Client SHALL make a test call to the TinyFish Search API with the query `"test"` using the provided key; IF the call returns HTTP 200, THE Suite SHALL store the key in `localStorage` under `stratos-tinyfish-key`, dismiss the setup prompt, and show a "Connected" success state; IF the call returns HTTP 401 or 403, THE Suite SHALL display an inline error "Invalid API key — please check and try again" without storing the key.
3. WHEN a valid TinyFish API key is stored, THE MCP_Client SHALL include it as the `X-API-Key` header on all Search and Fetch API calls.
4. WHEN the user enters a non-empty query and submits the Research task, THE MCP_Client SHALL call the TinyFish Search API with the exact query string and retrieve up to 5 result objects, each containing at minimum a `url`, `title`, and `snippet`; IF the search tool returns fewer than 5 results, THE MCP_Client SHALL proceed with however many results were returned.
5. WHEN the search call does not return a response within 10 seconds, THE MCP_Client SHALL abort the call and treat it as a search-level failure (see criterion 10).
6. WHEN search results are returned, THE MCP_Client SHALL call the TinyFish Fetch API for the top 3 URLs in result-rank order; IF fewer than 3 usable URLs are returned, THE MCP_Client SHALL call the fetch API for all available URLs.
7. WHEN the fetch API is called for a URL, THE MCP_Client SHALL enforce a 10-second timeout per call; IF a call does not respond within 10 seconds or returns an HTTP error status, THE MCP_Client SHALL skip that URL, log a warning, and continue with the remaining URLs.
8. WHEN at least one URL is successfully fetched, THE Task_Router SHALL truncate each fetched page's content to a maximum of 8,000 characters and SHALL cap the combined total of all page content sent to the Worker at 24,000 characters; THE Task_Router SHALL then send the search result metadata and the truncated page content with the research Prompt_Template to the Worker.
9. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `answer` (non-empty string), `sources` (array of 1–5 objects each with `title` (string), `url` (valid URL string), and `snippet` (string of at most 300 characters)), and `confidence` (one of the literal strings `"high"`, `"medium"`, or `"low"`); IF the Output_Parser cannot extract valid JSON, THEN THE Output_Parser SHALL retry once with a correction prompt before returning an error object.
10. WHEN the completed output is rendered, THE Suite SHALL display inline citation markers (e.g., `[1]`, `[2]`) within the answer text at positions where a source was referenced, and SHALL render a numbered sources list below the answer where each citation number is a hyperlink to the corresponding `url`.
11. IF the MCP_Client search call fails (network error, timeout, HTTP 4xx/5xx), THEN THE Suite SHALL display a dismissible notice stating "Web search unavailable" and SHALL offer a "Run without web search" button that re-submits the query as a General Text task using only the Model's training knowledge.
12. IF all fetch calls fail or return no usable content after the search succeeds, THEN THE Suite SHALL display a notice stating "Could not retrieve page content — answer based on search snippets only" and SHALL proceed to send only the search result metadata (titles, URLs, snippets) to the Worker without any full page content.
13. WHEN the Research task is active and Offline Mode is enabled in Settings, THE Suite SHALL disable the Research task submit button and display a tooltip stating "Web research requires Offline Mode to be disabled."
14. THE Settings Drawer SHALL provide a "Web Search" section showing the current connection status (Connected / Not connected), a "Disconnect" button that removes the stored key from `localStorage`, and a "Change key" link that re-shows the key input field.
15. THE Task_Router SHALL set `max_new_tokens` to 2048 for Research tasks.

---

### Requirement 34: Deep Document Q&A

**User Story:** As a user, I want to paste or upload a long document and ask questions about it, so that I can extract specific information from dense content.

#### Acceptance Criteria

1. WHEN the user provides a document (text paste or PDF upload) and a question, THE Task_Router SHALL construct a message with the full document text and the question, respecting the 128K context limit.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return the answer as plain text with document section references where applicable.
3. THE Suite SHALL display the estimated token count of the document before submission.
4. THE Task_Router SHALL set `max_new_tokens` to 2048 for Deep Document Q&A tasks.

---

### Requirement 35: Medical Document Summarizer

**User Story:** As a user, I want to upload medical records or lab results and receive a plain-language summary, so that I can understand my health information without medical training.

#### Acceptance Criteria

1. WHEN the user uploads a medical document (image or PDF) and submits the Medical Summarizer task, THE Task_Router SHALL send the document content with the medical summary Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `document_type` (string), `summary` (string in plain language), `key_findings` (array of strings), `values_out_of_range` (array of `{ test, value, normal_range }` or empty array), and `disclaimer` (fixed string: "This summary is AI-generated and not a substitute for professional medical advice.").
3. THE Suite SHALL always display the disclaimer prominently below the output.
4. THE Suite SHALL display a privacy notice before the user submits, confirming all processing is local.
5. THE Task_Router SHALL set `max_new_tokens` to 1024 for Medical Summarizer tasks.

---

### Requirement 36: Legal Document Analyzer

**User Story:** As a user, I want to upload a contract, NDA, or lease and receive key terms and risk flags, so that I can understand legal documents without a lawyer for initial review.

#### Acceptance Criteria

1. WHEN the user uploads a legal document (PDF or image) and submits the Legal Analyzer task, THE Task_Router SHALL send the document content with the legal analysis Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `document_type` (string), `parties` (array of strings), `key_terms` (array of `{ term, description }`), `obligations` (array of strings), `risk_flags` (array of `{ flag, severity, explanation }`), and `disclaimer` (fixed string: "This analysis is AI-generated and not legal advice. Consult a qualified attorney.").
3. THE Suite SHALL always display the disclaimer prominently below the output.
4. THE Suite SHALL display a privacy notice before submission confirming all processing is local.
5. THE Task_Router SHALL enable Thinking_Mode by default for Legal Analyzer tasks.
6. THE Task_Router SHALL set `max_new_tokens` to 2048 for Legal Analyzer tasks.

---

### Requirement 37: Financial Statement Parser

**User Story:** As a user, I want to upload a bank statement or tax document and receive structured financial data, so that I can analyze my finances without manual data entry.

#### Acceptance Criteria

1. WHEN the user uploads a financial document (PDF or image) and submits the Financial Parser task, THE Task_Router SHALL send the document content with the financial parsing Prompt_Template to the Worker.
2. WHEN the Worker completes generation, THE Output_Parser SHALL return a JSON object containing: `document_type` (string), `period` (string), `account_holder` (string or null), `opening_balance` (number or null), `closing_balance` (number or null), `transactions` (array of `{ date, description, amount, type: "credit"|"debit" }`), `total_credits` (number), `total_debits` (number), and `disclaimer` (fixed string: "This data is AI-extracted and may contain errors. Verify against original documents.").
3. THE Suite SHALL always display the disclaimer prominently below the output.
4. THE Suite SHALL display a privacy notice before submission confirming all processing is local.
5. THE Task_Router SHALL set `max_new_tokens` to 2048 for Financial Parser tasks.

---

### Requirement 38: Output Parser (JSON Extraction)

**User Story:** As a developer, I want the Output_Parser to reliably extract structured JSON from Model output, so that all structured task results are machine-readable.

#### Acceptance Criteria

1. THE Output_Parser SHALL expose a `parseJSON(text: string): object | ParseError` function where `ParseError` is defined as `{ error: "parse_failed"; raw: string }`.
2. WHEN `parseJSON` is called with a string containing a fenced code block of the form ` ```json\n...\n``` ` (case-insensitive language tag), THE Output_Parser SHALL extract only the content between the opening and closing fence markers before attempting JSON.parse; IF multiple fenced blocks are present, THE Output_Parser SHALL use the first one whose language tag is `json` or `JSON`.
3. WHEN `parseJSON` is called with a string that contains no fenced code block, THE Output_Parser SHALL scan the string from position 0 for the first occurrence of `{` or `[` and attempt JSON.parse starting from that position; IF neither character is found, THE Output_Parser SHALL return `{ error: "parse_failed", raw: <original string> }`.
4. WHEN `parseJSON` is called with a string that contains a `<think>...</think>` block before the JSON, THE Output_Parser SHALL strip all `<think>...</think>` blocks (including nested occurrences) before applying fence-stripping or position-scanning.
5. IF JSON.parse throws any error (SyntaxError or otherwise), THEN `parseJSON` SHALL return `{ error: "parse_failed", raw: <the original unmodified input string> }` and SHALL NOT throw or re-throw any exception.
6. WHEN `parseJSON` is called with an empty string (`""`), a string containing only whitespace, or `null` coerced to string, THE Output_Parser SHALL return `{ error: "parse_failed", raw: <input> }` without attempting JSON.parse.
7. WHEN `parseJSON` successfully parses a top-level JSON array (i.e., the root value is `[...]`), THE Output_Parser SHALL return the parsed array directly, not wrapped in an object.
8. THE Output_Parser SHALL expose an `extractText(text: string): string` function that: (a) removes all `<think>...</think>` blocks including their delimiters, (b) removes all Markdown fenced code blocks including their delimiters and language tags, (c) trims leading and trailing whitespace from the result, and (d) returns an empty string `""` if the result after stripping is empty.
9. WHEN `extractText` is called with a string containing no `<think>` blocks and no fenced code blocks, THE Output_Parser SHALL return the input string with only leading and trailing whitespace trimmed, leaving all other content unchanged.
10. THE Output_Parser SHALL expose a `markdownTableToJSON(table: string): Array<Record<string, string>> | ParseError` function that: (a) parses a Markdown table string with a header row, a separator row, and one or more data rows; (b) returns a JSON array where each element is an object whose keys are the trimmed header cell values and whose values are the trimmed data cell strings; (c) returns `{ error: "parse_failed", raw: table }` if the input does not contain at least one header row, one separator row, and one data row.
11. THE Output_Parser SHALL expose a `jsonToMarkdownTable(rows: Array<Record<string, string>>): string | ParseError` function that: (a) accepts a non-empty array of objects with identical key sets; (b) returns a Markdown table string with a header row derived from the keys of the first object, a separator row of dashes, and one data row per input object; (c) returns `{ error: "parse_failed", raw: "" }` if the input array is empty or if objects have inconsistent key sets.
12. WHEN `markdownTableToJSON` is called with a table whose separator row contains cells that are not composed entirely of dashes and optional colons (i.e., not a valid Markdown table separator), THE Output_Parser SHALL return `{ error: "parse_failed", raw: <input> }`.
13. THE Output_Parser SHALL be implemented as a pure TypeScript module with no side effects, no global state, and no dependencies on browser APIs, so that all functions are unit-testable in a Node.js environment.

---

### Requirement 39: Prompt Template System

**User Story:** As a developer, I want a centralized prompt template system, so that all task prompts are consistent, maintainable, and testable.

#### Acceptance Criteria

1. THE Prompt_Template system SHALL expose a `getPrompt(taskType: string, options?: object): string` function that returns the correct prompt string for each task type.
2. WHEN an unknown `taskType` is passed, THE Prompt_Template system SHALL throw an `Error` with the message `"Unknown task type: <taskType>"`.
3. THE Prompt_Template system SHALL store all prompt strings in `src/prompts/` organized by category file (documents.ts, visual.ts, audio.ts, text.ts, research.ts, privacy.ts).
4. WHEN `options` contains a `language` field, THE Prompt_Template system SHALL interpolate the language into the prompt for multilingual tasks.
5. THE Prompt_Template system SHALL include a round-trip test: for every task type, `getPrompt(taskType)` SHALL return a non-empty string.

---

### Requirement 40: Audio Recorder

**User Story:** As a user, I want to record audio directly in the browser for audio tasks, so that I do not need to use an external recording application.

#### Acceptance Criteria

1. WHEN the user clicks the Record button, THE Audio_Recorder SHALL request microphone permission via `navigator.mediaDevices.getUserMedia`.
2. IF microphone permission is denied, THEN THE Audio_Recorder SHALL display an error message explaining how to grant permission in browser settings.
3. WHILE recording is active, THE Audio_Recorder SHALL display a live audio level meter and elapsed recording time.
4. WHEN the user clicks Stop, THE Audio_Recorder SHALL finalize the recording and convert it to 16 kHz mono PCM Float32Array.
5. THE Audio_Recorder SHALL support pause and resume during recording.
6. THE Audio_Recorder SHALL limit recordings to a maximum of 30 minutes and display a warning at 25 minutes.

---

### Requirement 41: Settings Panel

**User Story:** As a user, I want to configure application settings, so that I can customize the Suite's behavior to my preferences.

#### Acceptance Criteria

1. THE Suite SHALL provide a Settings Drawer accessible from the TopBar settings icon.
2. THE Settings Drawer SHALL display: Model ID, quantization type, WebGPU status, current TPS (if available), and browser cache usage estimate.
3. THE Settings Drawer SHALL provide a toggle for Offline Mode that, when enabled, disables all MCP_Client calls and hides the Research task category.
4. THE Settings Drawer SHALL provide a toggle for Thinking Mode Default that sets the default state of the Thinking Mode toggle for all tasks that support it.
5. THE Settings Drawer SHALL provide a "Clear Model Cache" button that calls `caches.delete()` for the Transformers.js cache after a confirmation dialog.
6. THE Settings Drawer SHALL provide a theme toggle (Dark / Light) that switches the application color scheme.
7. WHEN the user changes a setting, THE Suite SHALL persist the setting to localStorage and apply it immediately without a page reload.
8. THE Settings Drawer SHALL provide a "Web Search" section that displays the TinyFish API key connection status and allows the user to connect, disconnect, or change their key (see Requirement 33, criterion 14).

---

## Non-Functional Requirements

### Requirement 42: Performance

**User Story:** As a user, I want the application to remain responsive during inference, so that I can continue interacting with the UI while the Model generates output.

#### Acceptance Criteria

1. THE Worker SHALL run all Model inference in a Web Worker thread so that the main UI thread is never blocked during generation.
2. WHEN the Model is loaded and idle, THE Suite SHALL respond to user interactions (navigation, typing, file upload) within 100ms.
3. WHEN a task is submitted, THE Suite SHALL display the first streamed token within 5 seconds on a device with a discrete GPU supporting WebGPU.
4. THE Suite SHALL display TPS in the status bar, updated every second during generation.
5. THE Suite SHALL display a loading progress bar with percentage during Model download and initialization.
6. WHEN a file is uploaded, THE File_Handler SHALL complete MIME type validation and preview generation within 500ms for files up to 50 MB.

---

### Requirement 43: Privacy and Security

**User Story:** As a user, I want assurance that my data never leaves my device, so that I can use the Suite for sensitive documents with confidence.

#### Acceptance Criteria

1. THE Suite SHALL perform all Model inference locally in the browser with no network requests to any inference backend.
2. THE Suite SHALL not transmit any user-provided text, images, audio, or document content to any external server, except when the user explicitly enables the Research task which calls the MCP_Client.
3. WHEN the Research task is used, THE Suite SHALL display a notice that the search query will be sent to an external search service.
4. THE Suite SHALL not include any analytics, telemetry, or tracking scripts.
5. THE Suite SHALL request only the browser permissions required for the active task (microphone for audio tasks, camera for webcam capture).
6. THE History_Store SHALL store all Task_Entry records only in the user's local browser storage (IndexedDB) and never sync them to a remote service.

---

### Requirement 44: Accessibility

**User Story:** As a user with accessibility needs, I want the Suite to be fully usable with assistive technologies, so that I am not excluded from using AI office tools.

#### Acceptance Criteria

1. THE Suite SHALL meet WCAG_AA contrast requirements (minimum 4.5:1 for normal text, 3:1 for large text) for all text and interactive elements in both dark and light modes.
2. THE Suite SHALL provide visible focus indicators on all interactive elements when navigating by keyboard.
3. THE Suite SHALL be fully operable using keyboard navigation alone, with logical tab order throughout the application.
4. THE Suite SHALL provide ARIA labels on all icon-only buttons, form controls, and status indicators.
5. THE Suite SHALL respect the `prefers-reduced-motion` media query by disabling or reducing Framer Motion animations when the user has enabled reduced motion in their OS settings.
6. THE Suite SHALL provide descriptive `alt` text for all non-decorative images, including uploaded file previews.
7. THE Suite SHALL announce dynamic content changes (new output tokens, task completion, errors) to screen readers using ARIA live regions.

---

### Requirement 45: Browser Compatibility

**User Story:** As a user on a supported browser, I want the Suite to work reliably, so that I do not encounter unexpected failures.

#### Acceptance Criteria

1. THE Suite SHALL function correctly on Chrome 113 and later.
2. THE Suite SHALL function correctly on Edge 113 and later.
3. WHEN the Suite is opened on a browser that does not support WebGPU (Firefox, Safari, older Chrome/Edge), THE Suite SHALL display a clear unsupported browser message with instructions to use Chrome 113+ or Edge 113+.
4. THE Suite SHALL not require any browser extensions or plugins beyond the base browser.
5. THE Suite SHALL function correctly on Windows, macOS, and Linux operating systems.

---

### Requirement 46: Responsive Design

**User Story:** As a user on any device, I want the Suite to adapt its layout to my screen size, so that I can use it on mobile, tablet, and desktop.

#### Acceptance Criteria

1. WHILE the viewport width is less than 768px, THE Suite SHALL render a single-column layout with the sidebar accessible as a full-screen drawer overlay.
2. WHILE the viewport width is between 768px and 1024px, THE Suite SHALL render the sidebar as an icon-only bar (64px wide) with tooltips.
3. WHILE the viewport width is greater than 1024px, THE Suite SHALL render the full sidebar (280px wide) alongside the main workspace.
4. THE Suite SHALL use the Outfit font for all body and heading text and JetBrains Mono for all code output, consistent with the existing design system.
5. THE Suite SHALL use the Stratos color palette (Stratos Blue `#0A2540`, Accent Blue `#00D4FF`, Accent Cyan `#00E5CC`) for all UI elements.

---

## Correctness Properties

The following properties are suitable for property-based testing. They focus on the Suite's own logic — the Output_Parser, Prompt_Template system, History_Store, File_Handler, and task routing — rather than the Model's inference behavior or external services.

---

### Property 1: Output_Parser JSON Round-Trip (Round-Trip Property)

**Requirement reference:** Requirement 38

For any valid JavaScript object `obj`, serializing it to a JSON string and then passing that string to `Output_Parser.parseJSON` SHALL return an object deeply equal to `obj`.

```
FOR ALL valid JavaScript objects obj:
  Output_Parser.parseJSON(JSON.stringify(obj)) deep-equals obj
```

This is a round-trip property. It verifies that `parseJSON` correctly inverts `JSON.stringify` for all valid inputs, catching any off-by-one errors in fence stripping or position detection.

---

### Property 2: Output_Parser Markdown Fence Stripping (Round-Trip Property)

**Requirement reference:** Requirement 38

For any valid JavaScript object `obj`, wrapping its JSON representation in a Markdown code fence and passing it to `Output_Parser.parseJSON` SHALL return an object deeply equal to `obj`.

```
FOR ALL valid JavaScript objects obj:
  let fenced = "```json\n" + JSON.stringify(obj) + "\n```"
  Output_Parser.parseJSON(fenced) deep-equals obj
```

---

### Property 3: Output_Parser Error Containment (Error Conditions)

**Requirement reference:** Requirement 38

For any string that is not valid JSON, `Output_Parser.parseJSON` SHALL return an object with an `error` field and SHALL NOT throw an exception.

```
FOR ALL strings s where JSON.parse(s) throws:
  let result = Output_Parser.parseJSON(s)
  result.error is defined AND result.raw === s
  (no exception is thrown)
```

---

### Property 4: Output_Parser extractText Idempotence (Idempotence)

**Requirement reference:** Requirement 38

Applying `Output_Parser.extractText` twice to any string SHALL produce the same result as applying it once.

```
FOR ALL strings s:
  Output_Parser.extractText(Output_Parser.extractText(s)) === Output_Parser.extractText(s)
```

---

### Property 5: Prompt_Template Non-Empty Output (Invariant)

**Requirement reference:** Requirement 39

For every defined task type, `getPrompt(taskType)` SHALL return a non-empty string.

```
FOR ALL taskType in DEFINED_TASK_TYPES:
  getPrompt(taskType).length > 0
```

---

### Property 6: Prompt_Template Unknown Type Error (Error Conditions)

**Requirement reference:** Requirement 39

For any string that is not a defined task type, `getPrompt` SHALL throw an Error.

```
FOR ALL strings s where s NOT IN DEFINED_TASK_TYPES:
  getPrompt(s) throws Error
```

---

### Property 7: History_Store Capacity Invariant (Invariant)

**Requirement reference:** Requirement 5

After any sequence of `addEntry` calls, the number of entries in the History_Store SHALL never exceed 200.

```
FOR ALL sequences of addEntry calls of length N:
  History_Store.count() <= 200
```

---

### Property 8: History_Store FIFO Eviction (Metamorphic Property)

**Requirement reference:** Requirement 5

When the History_Store is at capacity (200 entries) and a new entry is added, the oldest entry SHALL be removed and the new entry SHALL be present.

```
GIVEN History_Store.count() === 200
WHEN addEntry(newEntry) is called
THEN History_Store.count() === 200
AND History_Store.contains(newEntry) === true
AND History_Store.contains(oldestEntry) === false
```

---

### Property 9: History_Store Delete Reduces Count (Metamorphic Property)

**Requirement reference:** Requirement 5

For any entry `e` present in the History_Store, calling `deleteEntry(e.id)` SHALL reduce the count by exactly 1 and SHALL result in `contains(e.id)` returning false.

```
FOR ALL entries e in History_Store:
  let countBefore = History_Store.count()
  deleteEntry(e.id)
  History_Store.count() === countBefore - 1
  History_Store.contains(e.id) === false
```

---

### Property 10: File_Handler MIME Type Validation (Error Conditions)

**Requirement reference:** Requirement 2

For any file with a MIME type not in the accepted set for a given task, `File_Handler.validate(file, taskType)` SHALL return a rejection result and SHALL NOT return a success result.

```
FOR ALL files f where f.type NOT IN acceptedMimeTypes(taskType):
  File_Handler.validate(f, taskType).accepted === false
```

---

### Property 11: File_Handler Size Validation (Error Conditions)

**Requirement reference:** Requirement 2

For any file with `size > 50 * 1024 * 1024` bytes, `File_Handler.validate(file, taskType)` SHALL return a rejection result regardless of MIME type.

```
FOR ALL files f where f.size > 52428800:
  File_Handler.validate(f, taskType).accepted === false
```

---

### Property 12: Task_Router Token Budget Invariant (Invariant)

**Requirement reference:** Requirements 6–37

For every task type, the `max_new_tokens` value set by the Task_Router SHALL be greater than 0 and SHALL not exceed 2048.

```
FOR ALL taskType in DEFINED_TASK_TYPES:
  let budget = Task_Router.getTokenBudget(taskType)
  budget > 0 AND budget <= 2048
```

---

### Property 13: Export Filename Format (Invariant)

**Requirement reference:** Requirement 4

For any task type and export format, the filename generated by the export function SHALL match the pattern `stratos-<task-type>-<ISO-date>.<extension>`.

```
FOR ALL taskType in DEFINED_TASK_TYPES, format in ["txt", "json", "md", "html"]:
  let filename = generateExportFilename(taskType, format)
  filename matches /^stratos-[a-z_]+-\d{4}-\d{2}-\d{2}\.[a-z]+$/
```

---

### Property 14: Output_Parser Table-to-JSON Round-Trip (Round-Trip Property)

**Requirement reference:** Requirement 9

For any Markdown table string with a valid header row and at least one data row, converting to JSON and back to Markdown SHALL produce a table with the same headers and data values.

```
FOR ALL valid Markdown table strings t:
  let json = Output_Parser.markdownTableToJSON(t)
  let roundTripped = Output_Parser.jsonToMarkdownTable(json)
  headers(roundTripped) === headers(t)
  dataValues(roundTripped) deep-equals dataValues(t)
```

---

### Property 15: Settings Persistence Round-Trip (Round-Trip Property)

**Requirement reference:** Requirement 41

For any valid settings object, saving it to localStorage and reading it back SHALL produce an object deeply equal to the original.

```
FOR ALL valid settings objects s:
  Settings.save(s)
  Settings.load() deep-equals s
```
