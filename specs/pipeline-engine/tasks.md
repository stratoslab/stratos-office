# Tasks: Pipeline Engine

## Phase 1: Foundation

### Task 1: Add Pipeline Types
**File:** `src/types/index.ts`

Add the following types:
- `PipelineStep`, `InputMapping`, `PipelineTemplate`, `PipelineRun`, `PipelineStepRun`
- `PipelineLifecycle` = `'idle' | 'submitting' | 'running' | 'complete' | 'error' | 'cancelled'`

**Done when:** TypeScript compiles without errors. Types are exported and importable.

---

### Task 2: Create Pipeline Templates
**File:** `src/pipelineTemplates.ts` (new)

Define all 8 built-in pipeline templates with their steps and input mappings:
1. Due Diligence Engine (4 steps)
2. Meeting Intelligence (4 steps)
3. Product Discovery (4 steps)
4. Compliance Auditor (4 steps)
5. Research Synthesis (4 steps)
6. Negotiation Prep (4 steps)
7. Incident Response (4 steps)
8. Customer Intelligence (4 steps)

Export:
- `BUILTIN_PIPELINES: PipelineTemplate[]`
- `getPipelineTemplate(id: string): PipelineTemplate | undefined`
- `getAllPipelineTemplates(): PipelineTemplate[]`

**Done when:** All 8 templates are defined with correct task types and input mappings. `getPipelineTemplate` returns the right template for each ID.

---

### Task 3: Extend buildTaskMessages for Pipeline Context
**File:** `src/taskRouter.ts`

Update `buildTaskMessages` to accept an optional `pipelineContext` parameter:
```typescript
pipelineContext?: {
  previousOutputs: Array<{ text: string; parsed?: unknown }>;
  currentStepIndex: number;
}
```

When `pipelineContext` is provided:
- Resolve `{step_N_output}` and `{step_N_parsed}` template variables in the prompt
- For the `research` task, also pass through `searchResults` and `pageContent`

**Done when:** Existing tests pass. New test verifies template variable resolution. Calling without pipelineContext works identically to before.

---

### Task 4: Create PipelineContext
**File:** `src/context/PipelineContext.tsx` (new)

Core orchestration engine. Implements:
- `loadTemplate(templateId: string)` — Load a pipeline template
- `setPipelineInput(files: File[], text?: string)` — Set initial inputs
- `runPipeline()` — Execute all steps sequentially through the worker
- `cancelPipeline()` — Interrupt current step
- `retryStep(stepIndex: number)` — Re-run a failed step
- `skipStep(stepIndex: number)` — Skip a step
- `resetPipeline()` — Clear all state

Uses `ModelContext.workerRef` directly (not TaskContext). Manages:
- Step-by-step execution with output chaining
- Real-time streaming output per step
- Error handling with pause/resume/skip
- Token count aggregation across steps

**Done when:** Pipeline can execute a 2-step template end-to-end with output chaining. Tests verify: sequential execution, output passing, cancellation, error recovery.

---

### Task 5: Create PipelineProvider Wrapper
**File:** `src/context/PipelineContext.tsx`

Add the React context provider that wraps the pipeline state and exposes it via `usePipeline()` hook.

**Done when:** `usePipeline()` returns all pipeline state and methods. Provider can be added to App.tsx without breaking existing functionality.

---

## Phase 2: Core UI

### Task 6: PipelineStepIndicator Component
**File:** `src/components/pipelines/PipelineStepIndicator.tsx` (new)

Visual progress indicator showing all pipeline steps.

Props:
- `steps: PipelineStepRun[]`
- `currentStepIndex: number`
- `layout: 'horizontal' | 'vertical'`

Shows per-step: number, label, status icon (pending/running/complete/error/skipped).

**Done when:** Renders correctly for all step states. Responsive: horizontal on desktop, vertical on mobile. Touch targets ≥ 44px.

---

### Task 7: PipelineOutputPanel Component
**File:** `src/components/pipelines/PipelineOutputPanel.tsx` (new)

Shows pipeline output during and after execution.

Features:
- During execution: current step's streaming output + collapsed summaries of completed steps
- After completion: all step outputs as expandable sections
- Each section has copy button
- "Combined Output" toggle merges all steps with headers

**Done when:** Streams output in real-time during execution. Shows all step outputs after completion. Combined output renders correctly.

---

### Task 8: PipelineWorkspace Component
**File:** `src/components/pipelines/PipelineWorkspace.tsx` (new)

Main container that combines:
- Pipeline header (name, description, cancel button)
- PipelineStepIndicator
- Input panel (file upload + text input)
- PipelineOutputPanel

Layout: responsive, matching existing TaskWorkspace patterns.

**Done when:** Full pipeline execution UI works end-to-end. User can upload files, run pipeline, see progress, and view results.

---

### Task 9: Integrate PipelineWorkspace into DashboardPage
**File:** `src/components/pages/DashboardPage.tsx`

Add pipeline routing in DashboardPage:
- When a pipeline template is selected, show `PipelineWorkspace` instead of `TaskWorkspace`
- Add "Pipelines" as a new category in the sidebar
- Pipeline templates appear alongside task categories

**Done when:** Selecting a pipeline from the sidebar opens the pipeline workspace. Existing task selection still works.

---

## Phase 3: Pipeline Landing & Builder

### Task 10: PipelineSelector Landing Page
**File:** `src/components/pipelines/PipelineSelector.tsx` (new)

Grid of pipeline template cards (similar to dashboard quick start cards).

Each card shows: icon, name, description, step count, estimated tokens.
"Create Custom Pipeline" button at top.

**Done when:** Renders all 8 built-in templates in a responsive grid. Clicking a card loads that pipeline.

---

### Task 11: PipelineBuilder Component
**File:** `src/components/pipelines/PipelineBuilder.tsx` (new)

UI for creating custom pipelines:
- Searchable task library (all 30 tasks)
- Add/remove/reorder steps
- Configure input mapping per step (auto-connect or manual)
- Preview data flow between steps
- Save to localStorage

**Done when:** User can create a custom pipeline, save it, and it appears in the sidebar alongside built-in templates.

---

### Task 12: Custom Pipeline Storage
**File:** `src/pipelineStore.ts` (new)

localStorage-based storage for custom pipelines:
- `saveCustomPipeline(pipeline: PipelineTemplate)`
- `loadCustomPipelines(): PipelineTemplate[]`
- `deleteCustomPipeline(id: string)`
- `updateCustomPipeline(id: string, updates: Partial<PipelineTemplate>)`

Key: `stratos-pipeline-templates`
Limit: 50KB total, 20 custom pipelines max.

**Done when:** Custom pipelines persist across page reloads. Delete and update work correctly.

---

## Phase 4: History & Export

### Task 13: Extend History Store for Pipelines
**File:** `src/historyStore.ts`

Add `pipelineId` and `stepCount` fields to `TaskEntry`.
Add `getPipelineRuns(pipelineId: string)` query function.

**Done when:** Pipeline runs are stored in history with pipeline metadata. Query returns all runs for a given pipeline.

---

### Task 14: Pipeline History in HistoryDrawer
**File:** `src/components/drawers/HistoryDrawer.tsx`

Update history drawer to show pipeline runs:
- Pipeline runs show with a pipeline icon and step count
- Clicking expands to show all step outputs
- "Re-run" button opens pipeline workspace with same template

**Done when:** Pipeline runs appear in history alongside single-task runs. Re-run works correctly.

---

### Task 15: Pipeline Export
**File:** `src/components/pipelines/PipelineExportButton.tsx` (new)

Export pipeline results in multiple formats:
- Markdown: all steps as sections with headers
- JSON: structured with step metadata
- PDF: via existing make-pdf integration

**Done when:** All three export formats work. Exported files include pipeline name, date, and all step outputs.

---

## Phase 5: Polish & Integration

### Task 16: Update App.tsx with PipelineProvider
**File:** `src/App.tsx`

Wrap existing providers with `PipelineProvider`:
```
<ModelProvider>
  <TaskProvider>
    <PipelineProvider>
      <AppContent />
    </PipelineProvider>
  </TaskProvider>
</ModelProvider>
```

**Done when:** App renders without errors. Both single-task and pipeline workflows work.

---

### Task 17: Pipeline Category in Sidebar
**File:** `src/components/layout/Sidebar.tsx`

Add "Pipelines" category to sidebar navigation:
- Shows all built-in + custom pipeline templates
- Clicking a pipeline loads it in PipelineWorkspace
- Custom pipelines show with an edit icon

**Done when:** Pipelines appear in sidebar. Navigation works for both built-in and custom pipelines.

---

### Task 18: Pipeline Error States UI
**File:** `src/components/pipelines/PipelineErrorDialog.tsx` (new)

Modal dialog shown when a step fails:
- Shows error message and failed step details
- Three action buttons: Retry, Skip, Abort
- Visual feedback for each action

**Done when:** Error dialog renders correctly. Retry re-executes the step. Skip marks step as skipped and continues. Abort cancels the pipeline.

---

### Task 19: Write Integration Tests
**Files:** `src/context/__tests__/PipelineContext.test.tsx`, `src/components/pipelines/__tests__/*.test.tsx`

Test coverage:
- PipelineContext: sequential execution, output chaining, cancellation, error recovery
- PipelineStepIndicator: all states, responsive layout
- PipelineOutputPanel: streaming, combined output, copy
- PipelineWorkspace: end-to-end pipeline run

**Done when:** All tests pass. Coverage ≥ 80% for new files.

---

### Task 20: Update Existing Tests for buildTaskMessages Changes
**Files:** Update existing test files that import `buildTaskMessages`

Ensure all existing tests still pass after the pipelineContext parameter addition.

**Done when:** `npm run lint` and `npx vitest --run` pass with zero failures.

---

## Execution Order

```
Phase 1 (Foundation):     1 → 2 → 3 → 4 → 5
Phase 2 (Core UI):        6 → 7 → 8 → 9
Phase 3 (Landing/Builder): 10 → 11 → 12
Phase 4 (History/Export): 13 → 14 → 15
Phase 5 (Polish):         16 → 17 → 18 → 19 → 20
```

Phases can run in parallel within a phase where dependencies allow:
- Phase 2 tasks 6, 7 can be done in parallel (independent components)
- Phase 3 tasks 10, 11, 12 can be done in parallel
- Phase 4 tasks 13, 14, 15 must be sequential (13 is dependency for 14 and 15)
