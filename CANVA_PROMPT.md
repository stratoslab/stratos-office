# Canva UI Design Prompt — Stratos Office

Copy and paste this entire prompt into Canva's AI design tool to generate the UI mockups.

---

## Prompt

Design a modern, dark-themed web application UI for "Stratos Office" — an AI Office Assistant that runs entirely in the browser. The app uses a dark navy blue color scheme with bright cyan/teal accent colors.

### Overall Style
- Dark mode primary design
- Background: Deep navy blue (#0A2540 to #061220 gradient)
- Accent color: Bright cyan/teal (#00D4FF)
- Secondary accent: Light teal (#00E5CC)
- Cards and panels: Semi-transparent dark blue with subtle borders
- Font: Clean, modern sans-serif (Outfit or similar)
- Professional, enterprise-grade aesthetic — not playful or casual
- Minimal, clean, task-focused layout

### Page 1: Landing Page

Create a full-screen landing page with:
- Centered content panel with glass-morphism effect (frosted glass look)
- Stratos logo at top (placeholder for a white logo image)
- Large heading: "Stratos Office"
- Subtitle: "AI Office Assistant — Private, local AI for your daily work"
- Brief description paragraph: "Run OCR, transcription, email drafting, document parsing, and web research — all powered by Gemma 4 running entirely in your browser. No data ever leaves your device."
- Prominent "Load Gemma 4" button in bright cyan/teal
- Below the button: "Uses Transformers.js and ONNX Runtime Web. No prompts or media leave this device."
- Small text at bottom: "Requires Chrome 113+ or Edge 113+ with WebGPU. 4GB+ RAM recommended."
- Privacy badge or shield icon near the bottom
- Background: Subtle gradient or abstract geometric pattern in dark navy

### Page 2: Loading Screen

Create a loading screen with:
- Stratos logo at top
- Heading: "Preparing Stratos Office"
- Large horizontal progress bar (cyan/teal fill on dark track)
- Percentage display below progress bar (e.g., "47%")
- Status text: "Downloading model files... This happens once and is cached."
- Estimated time remaining text
- Subtle animated dots or spinner
- Background: Same dark navy as landing page

### Page 3: Main App — Dashboard View

Create the main application interface with:
- Top header bar (64px height):
  - Left: Stratos logo + "Stratos Office" text + "AI Office Assistant" subtitle
  - Right: Settings gear icon, theme toggle (moon/sun icon), user avatar placeholder

- Left sidebar (280px wide):
  - Section headers with icons for task categories:
    - "Documents" with file icon — sub-items: OCR, Receipt/Invoice, Handwriting, Table Extract, Form Extract
    - "Visual" with image icon — sub-items: Chart Extract, Screen Analysis
    - "Audio" with microphone icon — sub-items: Transcription, Voice Command
    - "Text" with type icon — sub-items: Email Draft, Summarize, Code Review
    - "Research" with search icon — sub-items: Web Research
  - Recently used tasks section at bottom
  - Active task highlighted with cyan left border

- Main content area:
  - If no task selected: Show a grid of quick-start cards (2x3 or 3x2 grid)
    - Each card: Icon + task name + one-line description
    - Cards have subtle hover effect (border highlight in cyan)
    - Card titles: "Document OCR", "Receipt Parser", "Meeting Transcription", "Email Draft", "Chart Extract", "Web Research"
  
  - If task selected: Show input/output layout:
    - Top: Task title with back arrow to return to dashboard
    - Input area: Large text box with placeholder text, file upload zone (drag-and-drop with dashed border), webcam capture button, microphone record button
    - Action bar: "Run" button (cyan), "Clear" button (outline), thinking mode toggle
    - Output area below: Formatted result with copy button (top-right), download dropdown (TXT, JSON, MD)
    - If JSON output: Syntax-highlighted with collapsible sections
    - If text output: Clean formatted text with proper line breaks

- Bottom status bar (40px height):
  - Left: Status indicator (green dot + "Ready" or blue dot + "Processing...")
  - Center: Token speed display (e.g., "12.4 tokens/s • 348 tokens")
  - Right: Version number

### Page 4: Task History Panel

Create a slide-in task history panel (from the right side):
- Panel header: "Task History" with close (X) button
- Search bar at top with magnifying glass icon
- List of past tasks, each showing:
  - Task type icon + name (e.g., "Document OCR")
  - Timestamp (e.g., "2 min ago")
  - Status indicator (green check for success, red X for error)
  - First line of output as preview
- Click on any task expands to show full input and output
- "Clear All History" button at bottom (red text, confirmation dialog)

### Page 5: Settings Panel

Create a slide-in settings panel (from the right side, 360px wide):
- Panel header: "Settings" with close (X) button
- Sections separated by subtle divider lines:

  **Model Settings:**
  - Max Tokens: Slider or number input (default: 1024)
  - Temperature: Slider (0.0 to 1.0, default: 0.0)
  - Thinking Mode: Toggle switch (off by default)

  **Privacy:**
  - Offline Mode: Toggle switch (on = no web features)
  - Clear Model Cache: Red text button with warning icon

  **Display:**
  - Theme: Toggle between Dark (selected) and Light
  - Font Size: Small / Medium / Large selector

  **About:**
  - App version: "Stratos Office v0.1.0"
  - Model: "Gemma 4 E2B (ONNX, Q4 quantized)"
  - Browser compatibility badges: Chrome, Edge
  - "Built with Transformers.js + WebGPU"

### Design Notes
- All panels use smooth slide-in animations
- Buttons have subtle hover effects (brightness increase)
- Focus states visible with cyan outline rings
- Cards have 12px border radius
- Consistent 8px spacing grid throughout
- Icons should be simple, line-style (Lucide or Heroicons style)
- No gradients on buttons — solid colors only
- Subtle shadows on elevated elements (cards, panels)
- The overall feel should be: professional, trustworthy, efficient, private
