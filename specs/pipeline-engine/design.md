# Design: Pipeline Engine

## Architecture Overview

The pipeline engine is a new orchestration layer that sits alongside the existing TaskContext. It reuses the worker infrastructure from ModelContext but manages multi-step execution, output chaining, and pipeline state independently.

```
┌─────────────────────────────────────────────────┐
│                  PipelineContext                 │
│  ┌──────────┐  ┌──────────┐  ┌───────────────┐  │
│  │ Template  │  │ Step     │  │ Output        │  │
│  │ Manager   │  │ Executor │  │ Assembler     │  │
│  └──────────┘  └──────────┘  └───────────────┘  │
└──────────────────────┬──────────────────────────┘
                       │ uses
┌──────────────────────▼──────────────────────────┐
│              ModelContext (worker)               │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              worker.js (Gemma 4)                 │
└─────────────────────────────────────────────────┘
```

TaskContext remains unchanged for single-task workflows. PipelineContext handles multi-step orchestration directly through ModelContext's workerRef.

---

## Data Models

### PipelineStep

```typescript
interface PipelineStep {
  taskType: TaskType;
  // How the previous step's output becomes this step's input
  inputMapping: InputMapping;
  // Optional: override the default prompt for this step
  promptOverride?: string;
  // Optional: custom label for this step in the UI
  label?: string;
}

type InputMapping =
  | { type: 'text'; field: 'text' | 'pdfText' | 'question' }
  | { type: 'parsed_json'; field: 'text' }       // JSON.stringify the parsed output
  | { type: 'raw_output'; field: 'text' }         // Pass raw finalOutput as text
  | { type: 'file'; field: 'imageDataUrl' }       // For visual tasks needing images
  | { type: 'combined'; fields: Array<'text' | 'pdfText' | 'imageDataUrl'> };
```

### PipelineTemplate

```typescript
interface PipelineTemplate {
  id: string;              // e.g., "due-diligence", "meeting-intelligence"
  name: string;
  description: string;
  icon: string;            // Material icon name
  steps: PipelineStep[];
  category: TaskCategory | 'pipeline';
  isBuiltIn: boolean;
  // Optional: files this pipeline expects
  expectedInputs?: Array<{ type: 'image' | 'audio' | 'pdf' | 'text'; label: string }>;
}
```

### PipelineRun

```typescript
interface PipelineRun {
  id: string;              // crypto.randomUUID()
  templateId: string;
  steps: PipelineStepRun[];
  status: 'idle' | 'submitting' | 'running' | 'complete' | 'error' | 'cancelled';
  currentStepIndex: number;
  startedAt: string;
  completedAt?: string;
  totalTokens: number;
  totalDurationMs: number;
}

interface PipelineStepRun {
  stepIndex: number;
  taskType: TaskType;
  label: string;
  status: 'pending' | 'running' | 'complete' | 'error' | 'skipped';
  input: Record<string, unknown>;  // What was passed to this step
  output?: string;
  parsedOutput?: unknown;
  error?: string;
  tokenCount?: number;
  tps?: number;
  durationMs?: number;
}
```

---

## Component Breakdown

### 1. PipelineContext (src/context/PipelineContext.tsx)

The core orchestration layer. Manages pipeline state and step execution.

**Key methods:**
- `loadTemplate(templateId: string)` — Load a pipeline template
- `setPipelineInput(files: File[], text?: string)` — Set initial inputs
- `runPipeline()` — Execute all steps sequentially
- `cancelPipeline()` — Interrupt current step, preserve completed outputs
- `retryStep(stepIndex: number)` — Re-run a failed step
- `skipStep(stepIndex: number)` — Skip a step, pass last output forward

**State management:**
```typescript
interface PipelineState {
  activeTemplate: PipelineTemplate | null;
  run: PipelineRun | null;
  streamingOutput: string;    // Current step's streaming output
  tps: number | null;
}
```

**Execution flow:**
```
runPipeline() {
  for each step in template.steps:
    1. Build messages using buildTaskMessages()
       - Pass previous step's output via pipelineContext parameter
    2. Post task to worker
    3. Stream output updates to UI
    4. On complete: store output, move to next step
    5. On error: pause, show retry/skip/abort options
}
```

### 2. PipelineWorkspace (src/components/pipelines/PipelineWorkspace.tsx)

Main container component for pipeline execution.

**Layout:**
```
┌──────────────────────────────────────────────┐
│ Pipeline Header (name, description, cancel)  │
├──────────────────────────────────────────────┤
│ Step Indicator (horizontal on desktop,       │
│ vertical on mobile)                          │
├──────────────┬───────────────────────────────┤
│ Input Panel  │  Output Panel                 │
│ (files, text)│  (current step + history)     │
└──────────────┴───────────────────────────────┘
```

### 3. PipelineStepIndicator (src/components/pipelines/PipelineStepIndicator.tsx)

Visual progress indicator showing all steps.

**States per step:**
- Pending: gray circle with step number
- Running: spinning loader with step name
- Complete: green checkmark with step name
- Error: red X with error tooltip
- Skipped: dashed gray circle

### 4. PipelineOutputPanel (src/components/pipelines/PipelineOutputPanel.tsx)

Shows the pipeline's combined output.

**Modes:**
- During execution: shows current step's streaming output + collapsed summaries of completed steps
- After completion: shows all step outputs as expandable sections, plus a combined final output
- Each section has its own copy/export button

### 5. PipelineBuilder (src/components/pipelines/PipelineBuilder.tsx)

UI for creating custom pipelines.

**Features:**
- Searchable task library (all 30 tasks)
- Drag-and-drop reordering
- Input mapping configuration per step
- Preview of how data flows between steps
- Save/duplicate/delete custom pipelines

### 6. PipelineSelector (src/components/pipelines/PipelineSelector.tsx)

Landing page for pipelines, similar to DashboardPage but for pipeline templates.

**Layout:**
- Grid of pipeline template cards (like quick start cards on dashboard)
- Each card shows: icon, name, description, step count, estimated tokens
- "Create Custom Pipeline" button at top

---

## Output Chaining Mechanism

### How Step N → Step N+1 Works

```typescript
function buildStepInput(
  step: PipelineStep,
  previousOutput: { text: string; parsed?: unknown } | null,
  initialInput: TaskInput
): Parameters<typeof buildTaskMessages>[1] {
  if (!previousOutput) {
    // First step: use initial inputs directly
    return {
      text: initialInput.text,
      imageDataUrl: initialInput.imageDataUrl,
      audioData: initialInput.audioData,
      pdfText: initialInput.pdfText,
    };
  }

  const { inputMapping } = step;
  const baseInput: Parameters<typeof buildTaskMessages>[1] = {};

  switch (inputMapping.type) {
    case 'text':
      baseInput[inputMapping.field] = previousOutput.text;
      break;
    case 'parsed_json':
      baseInput.text = JSON.stringify(previousOutput.parsed, null, 2);
      break;
    case 'raw_output':
      baseInput.text = previousOutput.text;
      break;
    case 'file':
      baseInput.imageDataUrl = initialInput.imageDataUrl;
      break;
  }

  // Always preserve original files for multi-modal tasks
  if (initialInput.imageDataUrl) baseInput.imageDataUrl = initialInput.imageDataUrl;
  if (initialInput.audioData) baseInput.audioData = initialInput.audioData;
  if (initialInput.pdfText) baseInput.pdfText = initialInput.pdfText;

  return baseInput;
}
```

### Prompt Template Variables

Step prompts can reference previous outputs:

```typescript
function resolvePromptTemplate(
  basePrompt: string,
  stepIndex: number,
  stepOutputs: Array<{ text: string; parsed?: unknown }>
): string {
  let prompt = basePrompt;

  for (let i = 0; i < stepOutputs.length; i++) {
    prompt = prompt.replace(
      new RegExp(`\\{step_${i + 1}_output\\}`, 'g'),
      stepOutputs[i].text
    );
    if (stepOutputs[i].parsed) {
      prompt = prompt.replace(
        new RegExp(`\\{step_${i + 1}_parsed\\}`, 'g'),
        JSON.stringify(stepOutputs[i].parsed, null, 2)
      );
    }
  }

  return prompt;
}
```

---

## Built-In Pipeline Templates

### 1. Due Diligence Engine
```
financial_parser → contract_analyzer → legal_analyzer → report_generator
Input: PDFs (financial statements, contracts)
Output: Investment memo with risk scoring
```

### 2. Meeting Intelligence
```
transcription → meeting_minutes → email_draft → meeting_prep
Input: Audio/video recording
Output: Minutes, follow-up emails, next meeting prep
```

### 3. Product Discovery
```
whiteboard_ocr → wireframe_to_html → screen_analysis → report_generator
Input: Whiteboard photos, screenshots
Output: Product requirements document
```

### 4. Compliance Auditor
```
contract_analyzer → legal_analyzer → medical_summarizer → report_generator
Input: Contracts, medical records (PDFs)
Output: Compliance report with regulation citations
```

### 5. Research Synthesis
```
research → deep_doc_qa → chart_extract → report_generator
Input: Research question + research papers (PDFs)
Output: Cited research report with extracted data
```

### 6. Negotiation Prep
```
contract_analyzer → transcription → tone_rewriter → email_draft
Input: Contract PDF + negotiation call recordings
Output: Counter-proposals in multiple tones
```

### 7. Incident Response
```
screen_analysis → code_review → report_generator → email_draft
Input: Error screenshots + relevant code (text)
Output: Post-mortem + stakeholder communication
```

### 8. Customer Intelligence
```
transcription → summarize → tone_rewriter → email_reply
Input: Support call recordings
Output: Summarized pain points + customer replies
```

---

## Storage

### Pipeline Templates
- Built-in templates: hardcoded in `src/pipelineTemplates.ts`
- Custom templates: stored in localStorage under `stratos-pipeline-templates`
- Key format: `{ id, name, description, icon, steps, isBuiltIn: false, createdAt }`

### Pipeline History
- Stored in existing `historyStore.ts` with a new `pipelineId` field
- New query: `getPipelineRuns(pipelineId: string)` returns all runs for a template
- Limited to 50 most recent runs per template

---

## Integration Points

### With Existing TaskContext
- No changes to TaskContext — it continues to handle single-task workflows
- PipelineContext uses ModelContext's workerRef directly
- Both contexts can coexist; PipelineProvider wraps TaskProvider in App.tsx

### With buildTaskMessages
- Extended to accept `pipelineContext?: { previousOutputs: Array<{ text: string; parsed?: unknown }> }`
- When pipelineContext is provided, prompts are resolved with template variables
- Backward compatible: existing calls without pipelineContext work unchanged

### With worker.js
- No changes needed — the worker already handles sequential task execution
- PipelineContext manages the sequencing at the React level

### With History
- Each pipeline run creates one history entry with `pipelineId` and `stepCount`
- Individual step outputs are stored in a separate `pipelineHistoryStore`
- History drawer shows pipeline runs with expandable step details

---

## Error Handling Strategy

### Step Failure
```
Step fails → Pipeline pauses → User sees:
  ┌─────────────────────────────────────┐
  │ Step 3 of 4 failed: contract_analyzer│
  │ Error: Failed to read image file    │
  │                                     │
  │ [Retry]  [Skip]  [Abort]            │
  └─────────────────────────────────────┘
```

- **Retry**: Re-execute the same step with the same inputs
- **Skip**: Mark step as skipped, pass last successful output to next step
- **Abort**: Cancel pipeline, save all completed outputs

### Pipeline Cancellation
- Send `cancel_task` to worker
- Mark current step as 'cancelled'
- Mark remaining steps as 'skipped'
- Save all completed outputs to history

### Memory Management
- Intermediate outputs are stored in PipelineContext state
- On pipeline complete/cancel, outputs are moved to history store
- Context state is cleared after move
- No unbounded accumulation

---

## UI/UX Decisions

### Mobile Layout
- Step indicator: vertical timeline on left, content on right
- Input/Output panels: stacked vertically
- Step details: collapsible accordions

### Desktop Layout
- Step indicator: horizontal bar at top
- Input panel: left column (30%)
- Output panel: right column (70%)
- Completed steps: collapsible sidebar on the left

### Streaming During Pipeline
- Only the current step streams
- Previous steps show static output
- Next steps show "Waiting for previous step..."
- TPS counter shows current step's speed

### Pipeline Completion
- Final output is the last step's output by default
- Option to view "Combined Output" (all steps merged with headers)
- Export button offers: current step, combined, or individual steps
