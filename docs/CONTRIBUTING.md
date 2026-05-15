# Contributing to Stratos Office

> How to add new tasks, extend the system, and contribute to the project.

---

## Adding a New Task

### Step 1: Add the Task Type

In `src/types/index.ts`, add your task type to the `TaskType` union:

```typescript
export type TaskType =
  // ... existing types
  | 'my_new_task';
```

### Step 2: Create the Prompt Template

Add a prompt string or factory function in the appropriate `src/prompts/` category file:

```typescript
// src/prompts/text.ts
export const myNewTask = (options?: { tone?: string }) =>
  `Your prompt template here. ${options?.tone ? `Use a ${options.tone} tone.` : ''}`;
```

Export it from `src/prompts/index.ts`:

```typescript
import { myNewTask } from './text.ts';

export function getPrompt(taskType: TaskType, options?: PromptOptions): string {
  switch (taskType) {
    // ... existing cases
    case 'my_new_task': return myNewTask(options);
    default: throw new Error(`Unknown task type: ${taskType}`);
  }
}
```

### Step 3: Add the Task Config

In `src/taskRouter.ts`, add an entry to `TASK_CONFIGS`:

```typescript
my_new_task: {
  taskType: 'my_new_task',
  category: 'text',
  label: 'My New Task',
  description: 'What this task does in one sentence.',
  icon: 'edit_note',                  // Material Symbols icon name
  max_new_tokens: 1024,
  requiresImage: false,
  requiresAudio: false,
  requiresPDF: false,
  requiresText: true,
  supportsWebcam: false,
  enableThinkingByDefault: false,
  supportsThinkingMode: true,
  outputFormat: 'markdown',
  twoPassPipeline: false,
  requiresPrivacyNotice: false,
  requiresDisclaimer: false,
},
```

### Step 4: Add a Structured Output Type (if needed)

If your task returns structured JSON, add an interface to `src/types/index.ts`:

```typescript
export interface MyNewTaskResult {
  field_one: string;
  field_two: string[];
}
```

### Step 5: Wire the UI

The task will automatically appear in the sidebar under its category. The `InputPanel` and `OutputPanel` render based on `TaskConfig` flags — no additional wiring needed for standard input/output patterns.

For custom output rendering (e.g., a specialized view like `DiffView` or `BoundingBoxCanvas`), add a case to the appropriate category workspace component in `src/components/tasks/`.

### Step 6: Test

```bash
npm run test
```

Verify:
- `getPrompt('my_new_task')` returns a non-empty string
- `getTaskConfig('my_new_task')` returns the correct config
- `getTokenBudget('my_new_task')` returns a value > 0 and ≤ 2048
- The task appears in the sidebar and the workspace renders correctly

---

## Project Structure

```
src/
├── types/index.ts          # All TypeScript types — start here
├── prompts/                # Prompt templates by category
├── taskRouter.ts           # Task configs + message builder
├── outputParser.ts         # JSON/text extraction (pure module)
├── fileHandler.ts          # File validation + PDF extraction
├── audioRecorder.ts        # MediaRecorder + PCM conversion
├── webcamCapture.ts        # Camera capture
├── mcpClient.ts            # MCP search/fetch
├── historyStore.ts         # IndexedDB history
├── settingsStore.ts        # localStorage settings
├── context/
│   ├── ModelContext.tsx    # Model lifecycle state
│   └── TaskContext.tsx     # Task state + lifecycle
├── components/
│   ├── layout/             # TopBar, Sidebar
│   ├── pages/              # LandingPage, LoadingPage, DashboardPage
│   ├── workspace/          # TaskWorkspace, InputPanel, OutputPanel, StreamingOutput
│   ├── tasks/              # Category workspace components
│   ├── drawers/            # HistoryDrawer, SettingsDrawer
│   └── ui/                 # Primitives: FileUploadZone, MarkdownRenderer, etc.
└── test/                   # Property-based tests
```

---

## Development Setup

```bash
git clone <repo-url>
cd stratos-office
npm install
npm run dev
```

Open `http://127.0.0.1:5173/` in Chrome 113+ or Edge 113+ (WebGPU required).

```bash
npm run build    # Production build
npm run test     # Run tests (Vitest)
```

---

## Code Conventions

### File Naming
- TypeScript modules: `camelCase.ts`
- React components: `PascalCase.tsx`
- Prompt files: `camelCase.ts` in `src/prompts/`
- Test files: `camelCase.test.ts` in `src/test/`

### TypeScript
- Use named exports (avoid default exports for utilities)
- All public functions must have explicit return types
- Use `unknown` instead of `any`
- `outputParser.ts` must have zero browser API dependencies

### Worker Communication
- Always use the defined message protocol in `types/index.ts`
- Include `taskId` for all task-related messages
- Handle errors gracefully — always post an error status rather than throwing

### Prompt Templates
- Return a string
- Accept an `options` object for customization (language, tone, etc.)
- Specify the exact output format (JSON schema, Markdown structure) in the prompt
- Keep prompts clear and specific — the model should not need to guess the format

### Accessibility
- All icon-only buttons must have `aria-label`
- Dynamic content (streaming output, errors) must use `aria-live="polite"`
- All Framer Motion animations must check `useReducedMotion()`

---

## Adding a New Input Type

Accepted MIME types are defined per task in `src/fileHandler.ts`. To add a new format, add its MIME type to the accepted set for the relevant task types in `fileHandler.ts` and update the `FileUploadZone` label text.

---

## Adding a New Output Renderer

1. Create a new component in `src/components/ui/`
2. Add a new `OutputFormat` value to `types/index.ts` if needed
3. Add a case in `OutputPanel.tsx` to render the new component
4. Add the `outputFormat` to the relevant `TaskConfig` entries in `taskRouter.ts`

---

## Testing

### Running Tests

```bash
npm run test          # Run all tests
npm run test --watch  # Watch mode
```

### Property-Based Tests

The test suite covers 15 correctness properties. When adding a new module, add property-based tests for:
- Round-trip properties (serialize → deserialize → equals original)
- Invariants (output always satisfies a constraint)
- Error conditions (invalid input never throws, always returns error object)

### Manual Testing Checklist

- [ ] Task appears in sidebar under correct category
- [ ] Task workspace renders correct input controls
- [ ] Submitting the task streams output
- [ ] Output renders in the correct format (markdown/JSON/HTML/etc.)
- [ ] Export works for all formats (TXT, JSON, MD, HTML)
- [ ] Task is saved to history
- [ ] History entry can be clicked to restore output
- [ ] Error handling works (invalid input, network errors)
- [ ] Thinking mode toggle works if supported

---

## Architecture Decisions

### Why Web Workers?
Model inference blocks the main thread for seconds at a time. Web Workers run inference in a background thread, keeping the UI fully responsive during generation.

### Why a Pure outputParser?
`outputParser.ts` has no browser API dependencies, making it fully unit-testable in Node.js without a browser environment. This is critical for property-based testing.

### Why IndexedDB for history?
IndexedDB has a much larger quota than localStorage and is binary-safe. The 200-entry FIFO limit keeps storage bounded.

### Why Two-Pass for Audio Tasks?
`meeting_minutes` and `voice_to_email` need to first transcribe audio (audio → text), then generate structured output (text → JSON). Doing both in one pass produces worse results than two focused passes.

### Why Task-Based Architecture?
A task-based approach (vs. free-form chat) provides:
- Clear user intent — the model knows exactly what to produce
- Consistent, typed output formats
- Task-specific UI elements (email preview, diff view, bounding boxes)
- Easier testing and validation

---

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Full technical architecture
- [DESIGN.md](./DESIGN.md) — Design system and component specs
- [DEVELOPMENT_PLAN.md](./DEVELOPMENT_PLAN.md) — Implementation roadmap
- [USER_GUIDE.md](./USER_GUIDE.md) — User-facing documentation
- [Spec: Requirements](./../.kiro/specs/stratos-office-full-suite/requirements.md)
- [Spec: Design](./../.kiro/specs/stratos-office-full-suite/design.md)
- [Spec: Tasks](./../.kiro/specs/stratos-office-full-suite/tasks.md)
