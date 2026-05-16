# Requirements: Pipeline Engine

## Overview

Add a pipeline execution engine that chains multiple tasks together, feeding outputs from earlier steps as inputs to later steps. This transforms Stratos Office from 30 isolated tools into a composable intelligence platform.

---

## User Stories

### US-1: Run Pre-Built Pipeline Templates
As a user, I want to select from curated pipeline templates (e.g., "Meeting Intelligence", "Due Diligence") so that I can process complex workflows with a single click instead of running tasks one at a time.

**Acceptance Criteria:**
- Pipeline templates appear as a new category in the sidebar called "Pipelines"
- Each template shows its name, description, icon, and the ordered list of tasks it chains
- Selecting a template opens a pipeline workspace with file input area and a visual step indicator
- Running the pipeline executes all steps sequentially, showing real-time progress
- Final output is displayed after all steps complete

### US-2: Drop Files and Auto-Route Through Pipeline
As a user, I want to drop a folder of mixed files (PDFs, audio, images, text) and have the pipeline automatically route each file through the appropriate task chain, so that I don't need to manually sort inputs.

**Acceptance Criteria:**
- File upload zone accepts multiple files of any supported type
- Each file is validated and routed to the first task in the pipeline that accepts its type
- Files that don't match any task in the pipeline show a warning but don't block execution
- Pipeline execution continues even if individual files fail validation

### US-3: See Real-Time Pipeline Progress
As a user, I want to see which step of the pipeline is currently running, what the intermediate outputs look like, and how many steps remain, so that I understand the pipeline's state at any moment.

**Acceptance Criteria:**
- A step indicator shows all pipeline steps with status icons (pending, running, complete, error)
- The currently running step shows streaming output in real-time
- Completed steps show a summary of their output (first 200 chars or structured preview)
- Failed steps show the error message and offer a "retry" button
- Total estimated time is shown based on token budgets of remaining steps

### US-4: Use Intermediate Outputs as Inputs
As a pipeline, I want to pass the output of step N as input text to step N+1, so that each step builds on the previous analysis.

**Acceptance Criteria:**
- The output of each step (both `finalOutput` and `parsedOutput` if JSON) is available as input to the next step
- For text/markdown outputs: passed as `text` input to the next task
- For JSON outputs: passed as `text` input with a JSON.stringify prefix, AND as `parsedOutput` if the next task's prompt references structured data
- The `buildTaskMessages` function accepts a `pipelineContext` parameter containing previous step outputs
- Each step's prompt can reference previous outputs via template variables like `{step_1_output}`, `{step_2_parsed}`

### US-5: Customize Pipeline Templates
As a power user, I want to create my own pipeline by selecting tasks from the existing library and ordering them, so that I can build workflows specific to my domain.

**Acceptance Criteria:**
- A "Create Pipeline" button opens a pipeline builder UI
- User selects tasks from the existing 30-task library via a searchable list
- User can reorder tasks via drag-and-drop
- User can configure how outputs flow between steps (auto-connect or manual mapping)
- Custom pipelines are saved to localStorage and appear alongside built-in templates
- Custom pipelines can be edited, duplicated, or deleted

### US-6: Handle Partial Pipeline Failures Gracefully
As a user, I want the pipeline to continue executing remaining steps when one step fails (if possible), so that I still get partial results instead of losing everything.

**Acceptance Criteria:**
- When a step fails, the pipeline pauses and shows the error
- User can choose to: retry the failed step, skip it and continue, or abort the pipeline
- If skipped, downstream steps receive the last successful output as their input
- The final report includes a "pipeline health" summary showing which steps succeeded/failed/skipped
- All completed steps' outputs are saved to history even if the pipeline is aborted

### US-7: Export Pipeline Results
As a user, I want to export the complete pipeline output (all step results combined) as a single document, so that I can share the full analysis with stakeholders.

**Acceptance Criteria:**
- Export button offers formats: markdown (all steps as sections), PDF, JSON (structured)
- Markdown export includes step headers, each step's output, and a pipeline summary
- PDF export uses the existing make-pdf skill with proper formatting
- JSON export includes all step outputs, timestamps, token counts, and pipeline metadata

### US-8: Pipeline History and Re-Run
As a user, I want to see my past pipeline runs in the history drawer and re-run them with new inputs, so that I can process similar workflows repeatedly.

**Acceptance Criteria:**
- Pipeline runs appear in the history drawer with a pipeline icon and step count
- Clicking a past run shows the full pipeline output with all intermediate steps
- A "Re-run" button opens the pipeline workspace with the same template but empty inputs
- Pipeline history entries include total tokens, total duration, and final status

---

## Correctness Properties

### P-1: Output Chaining Integrity
The output of step N must be passed to step N+1 without modification, except for format conversion (JSON → string for text inputs). No data loss or truncation is allowed between steps.

### P-2: Cancellation Safety
Cancelling a pipeline must:
- Immediately interrupt the currently running task in the worker
- Not execute any subsequent steps
- Preserve all completed step outputs in the UI
- Not corrupt the TaskContext state (user can start a new task after cancellation)

### P-3: Memory Safety
Pipeline execution must not accumulate unbounded state. Intermediate outputs from completed steps should be stored efficiently. The pipeline must handle outputs up to the model's max context window (2048 tokens per step).

### P-4: Type Compatibility
A task can only receive as input the data types it is configured to accept. The pipeline engine must validate that step N's output format is compatible with step N+1's input requirements before execution.

### P-5: Idempotent Re-Runs
Re-running the same pipeline with the same inputs must produce identical results (assuming deterministic model inference with `do_sample: false`).

### P-6: No Cross-Session Contamination
Pipeline state (intermediate outputs, step progress) must be scoped to the current pipeline run. Starting a new pipeline must clear all state from previous runs.

---

## Non-Functional Requirements

### N-1: Performance
- Pipeline UI must remain responsive during execution (no main thread blocking)
- Step transitions must be instant (< 100ms between steps)
- Streaming output must update at least 10 times per second

### N-2: Storage
- Pipeline templates (built-in + custom) must be stored in localStorage
- Custom pipeline definitions must not exceed 50KB total
- Pipeline history entries must be limited to the most recent 50 runs

### N-3: Compatibility
- Pipeline engine must work with all 30 existing tasks without modification to their prompts or configs
- The existing two-pass pipeline (meeting_minutes, voice_to_email) must continue to work unchanged
- All existing single-task workflows must function identically

### N-4: Accessibility
- All pipeline UI elements must meet WCAG 2.1 AA standards
- Step indicators must be accessible to screen readers
- Keyboard navigation must support stepping through pipeline controls

---

## Out of Scope (Future Phases)

- Parallel task execution (steps that don't depend on each other)
- Conditional branching (if step N output contains X, go to step A, else step B)
- Loop constructs (repeat step N until condition met)
- External API chaining beyond TinyFish (e.g., calling other services between steps)
- Real-time collaboration on pipeline runs
- Pipeline versioning and rollback
