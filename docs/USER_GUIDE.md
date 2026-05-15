# Stratos Office — User Guide

> How to use each task in the AI Office Assistant.

---

## Getting Started

### System Requirements

- **Browser**: Chrome 113+ or Edge 113+
- **GPU**: WebGPU-compatible graphics (most modern GPUs)
- **RAM**: 4+ GB recommended
- **Storage**: ~2 GB for model cache (first download)

### First Launch

1. Open Stratos Office in Chrome or Edge
2. Click **"Load Gemma 4"** on the landing page
3. Wait for the model to download (~1-2 GB, 30-120 seconds)
4. The model is cached after first load — subsequent visits are instant

---

## Task Categories

### Documents

#### Document OCR

**What it does**: Extracts all text from an image of a document.

**How to use**:
1. Select **Documents → Document OCR**
2. Upload an image (PNG, JPG, WebP) or capture with webcam
3. Click **Run**
4. Extracted text appears in the output panel

**Tips**:
- Use high-resolution images for best results
- Works with scanned documents, screenshots, photos
- Preserves formatting, line breaks, and paragraph structure

#### Receipt/Invoice Parsing

**What it does**: Parses a receipt or invoice photo into structured data.

**How to use**:
1. Select **Documents → Receipt/Invoice**
2. Upload a photo of the receipt/invoice
3. Click **Run**
4. Output includes vendor, date, items, subtotal, tax, and total

**Output format**:
```json
{
  "vendor": "Store Name",
  "date": "2026-01-15",
  "items": [{"name": "Item", "quantity": 1, "price": 9.99}],
  "subtotal": 9.99,
  "tax": 0.80,
  "total": 10.79
}
```

#### Handwriting Transcription

**What it does**: Converts handwritten text to typed text.

**How to use**:
1. Select **Documents → Handwriting**
2. Upload a photo of handwritten notes
3. Click **Run**
4. Unclear words are marked with `[?]`

#### Table Extraction

**What it does**: Converts a table in an image to markdown or JSON.

**How to use**:
1. Select **Documents → Table Extract**
2. Upload an image containing a table
3. Click **Run**
4. Output is a formatted markdown table

#### Form Field Extraction

**What it does**: Extracts all form fields and their values from a document.

**How to use**:
1. Select **Documents → Form Extract**
2. Upload a form document image
3. Click **Run**
4. Output is a JSON array of field objects

---

### Visual

#### Chart/Graph Parsing

**What it does**: Extracts data points, trends, and metadata from charts.

**How to use**:
1. Select **Visual → Chart Extract**
2. Upload a chart or graph image
3. Click **Run**
4. Output includes chart type, data points, trends, and axis labels

#### Screen/UI Analysis

**What it does**: Describes the user interface shown in a screenshot.

**How to use**:
1. Select **Visual → Screen Analysis**
2. Upload a screenshot
3. Click **Run**
4. Output lists text labels, interactive elements, layout, and notifications

---

### Audio

#### Meeting Transcription

**What it does**: Transcribes audio recordings with speaker turns.

**How to use**:
1. Select **Audio → Transcription**
2. Upload an audio file (WebM, WAV, MP3, OGG, M4A) or record with microphone
3. Click **Run**
4. Formatted transcript appears with speaker labels

#### Voice Commands

**What it does**: Listens to voice input and identifies intent.

**How to use**:
1. Select **Audio → Voice Command**
2. Click the microphone button and speak
3. Click stop when done
4. Output includes transcription, intent classification, and suggested action

---

### Text

#### Email Drafting

**What it does**: Drafts a professional email from your instructions.

**How to use**:
1. Select **Text → Email Draft**
2. Type your instructions (e.g., "Write a follow-up email to John about the Q1 report")
3. Click **Run**
4. Output includes subject, body, and tone

#### Summarization

**What it does**: Summarizes text, documents, or audio in bullet points.

**How to use**:
1. Select **Text → Summarize**
2. Provide text input, or upload an image/audio
3. Click **Run**
4. Output is 3-5 bullet points of key information

#### Code Review

**What it does**: Reviews code for bugs, style issues, and improvements.

**How to use**:
1. Select **Text → Code Review**
2. Paste your code
3. Click **Run**
4. Output includes issues (by severity), suggestions, and overall assessment

---

### Research

#### Web Research

**What it does**: Searches the web and synthesizes an answer with citations.

**How to use**:
1. Select **Research → Web Research**
2. Type your question or topic
3. Click **Run**
4. Output includes a comprehensive answer with source URLs

**Note**: This feature sends search queries to an external API. Use **Offline Mode** in Settings to disable web features.

---

## Input Methods

### Text Input
- Type directly in the text area
- Press **Enter** to send, **Shift+Enter** for new line

### File Upload
- Click the upload button or drag-and-drop files
- Supported: PNG, JPG, JPEG, WebP, GIF, BMP, WebM, WAV, MP3, OGG, M4A, PDF
- Max file size: 50MB

### Webcam Capture
- Click the camera button to start webcam
- Click **Capture** to take a photo
- Use for live document OCR or screen analysis

### Microphone Recording
- Click the microphone button to start recording
- Click again to stop
- Audio level meter shows recording activity

---

## Output Options

### Viewing Results
- **Text output**: Displayed in formatted text
- **JSON output**: Syntax-highlighted with collapsible sections
- **Markdown output**: Rendered with proper formatting
- **Tables**: Interactive and sortable

### Exporting Results
- **Copy to clipboard**: Click the copy button
- **Download as TXT**: Plain text format
- **Download as JSON**: Structured data format
- **Download as MD**: Markdown format

---

## Settings

### Model Settings
- **Max tokens**: Control output length per task
- **Temperature**: Adjust creativity (lower = more deterministic)
- **Thinking mode**: Enable chain-of-thought reasoning

### Privacy Settings
- **Offline mode**: Disable all web features (MCP, search)
- **Clear cache**: Remove cached model files

### Display Settings
- **Theme**: Dark/light mode toggle
- **Font size**: Adjust text size

---

## Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Enter` | Send message / Run task |
| `Shift + Enter` | New line in text area |
| `Ctrl/Cmd + K` | Focus search in task history |
| `Ctrl/Cmd + E` | Export current result |
| `Esc` | Cancel current task / Close panel |

---

## Troubleshooting

### "WebGPU Unavailable"
- Use Chrome 113+ or Edge 113+
- Ensure hardware acceleration is enabled
- Check that your GPU supports WebGPU

### Model Download Fails
- Check your internet connection
- Try again — downloads resume from where they left off
- Model files are cached, so you won't re-download everything

### Slow Inference
- Close other browser tabs to free up GPU memory
- Reduce max tokens in Settings
- Check that hardware acceleration is enabled

### Poor OCR Accuracy
- Use higher resolution images
- Ensure text is clearly visible and not blurry
- Try cropping to the text area only
