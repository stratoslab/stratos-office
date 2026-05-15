# Contributing to Stratos Office

> How to add new tasks, extend the system, and contribute to the project.

---

## Adding a New Task

### Step 1: Define the Task Type

Add your task type to `src/taskRouter.js`:

```js
const TASK_TYPES = {
  // ... existing types
  my_new_task: "my_new_task",
};
```

### Step 2: Create the Prompt Template

Add a prompt function in the appropriate `src/prompts/` file, or create a new file:

```js
// src/prompts/myCategory.js
export function myNewTask(context = "") {
  return `Your prompt template here. ${context}`;
}
```

Export it from `src/prompts/index.js`:

```js
import * as myCategory from "./myCategory.js";

const promptTemplates = {
  // ... existing categories
  myCategory: {
    myNewTask: myCategory.myNewTask,
  },
};

const taskTypeToPromptMap = {
  // ... existing mappings
  my_new_task: "myNewTask",
};
```

### Step 3: Add Task Configuration

Add your task config in `src/taskRouter.js`:

```js
function getTaskConfig(taskType) {
  const configs = {
    // ... existing configs
    my_new_task: {
      max_new_tokens: 1024,
      requiresImage: false,
      requiresAudio: false,
    },
  };
  return configs[taskType] || configs.text_task;
}
```

### Step 4: Handle the Task in the Worker

The worker already supports the `"task"` message type. Your task will be routed automatically based on the prompt template. If your task needs special input processing (e.g., custom image preprocessing), add it to the worker's `runTask` function.

### Step 5: Add UI Support

Add your task to the `TaskSelector` component:

```jsx
// src/components/TaskSelector.jsx
const taskGroups = [
  {
    category: "My Category",
    tasks: [
      {
        type: "my_new_task",
        label: "My New Task",
        description: "Description of what this task does",
        icon: "icon-name",
      },
    ],
  },
  // ... existing groups
];
```

### Step 6: Test Your Task

1. Run the dev server: `npm run dev`
2. Select your new task type
3. Provide appropriate input
4. Verify the output matches expectations

---

## Project Structure

```
stratos-office/
├── src/
│   ├── main.jsx              # Entry point
│   ├── App.jsx               # Main application
│   ├── worker.js             # Web Worker (model + inference)
│   ├── taskRouter.js         # Task routing + history
│   ├── outputParser.js       # JSON extraction
│   ├── fileHandler.js        # File upload
│   ├── webcam.js             # Webcam capture
│   ├── audioRecorder.js      # Audio recording
│   ├── mcpClient.js          # MCP client (optional)
│   ├── prompts/              # Prompt templates
│   └── components/           # UI components
├── public/                   # Static assets
├── index.html
├── package.json
└── vite.config.js
```

---

## Development Setup

```bash
# Clone the repository
git clone <repo-url>
cd stratos-office

# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

---

## Code Conventions

### File Naming
- JavaScript: `camelCase.js` (utilities, modules)
- React components: `PascalCase.jsx`
- Prompt files: `lowercase.js` in `prompts/`

### Imports
- Use ES module imports
- Group imports: external libraries, internal modules, local files
- Use named exports (avoid default exports)

### Worker Communication
- Always use the defined message protocol
- Include `taskId` for task-related messages
- Handle errors gracefully and post error status

### Prompt Templates
- Return a string (the prompt text)
- Accept an `options` object for customization
- Keep prompts clear and specific
- Specify output format when structured data is expected

---

## Adding a New Input Type

### Image Formats

Supported formats are defined in `src/fileHandler.js`:

```js
const SUPPORTED_IMAGE_TYPES = [
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/bmp",
];
```

### Audio Formats

```js
const SUPPORTED_AUDIO_TYPES = [
  "audio/webm",
  "audio/wav",
  "audio/mp3",
  "audio/ogg",
  "audio/m4a",
];
```

To add a new format, add its MIME type to the appropriate array.

---

## Adding a New Output Format

The `OutputDisplay` component handles different output types. To add a new display format:

1. Add a new renderer in `src/components/OutputDisplay.jsx`
2. Handle the format detection based on the output content type
3. Add an export option for the new format

---

## Testing

### Manual Testing Checklist

- [ ] Task routes correctly in taskRouter
- [ ] Prompt template returns appropriate text
- [ ] Worker processes the task without errors
- [ ] Output is displayed correctly in the UI
- [ ] Export functionality works
- [ ] Error handling works (invalid input, network errors)
- [ ] Task history records the task correctly

### Edge Cases to Test

- Empty input
- Oversized files (>50MB)
- Unsupported file formats
- Network disconnection during model load
- GPU memory exhaustion
- Concurrent task cancellation

---

## Pull Request Process

1. Create a feature branch: `git checkout -b feature/my-new-task`
2. Make your changes
3. Test thoroughly
4. Commit with a descriptive message
5. Push and create a pull request
6. Request review from a team member

---

## Architecture Decisions

### Why Web Workers?

Model inference is computationally intensive and would block the main thread. Web Workers run inference in a background thread, keeping the UI responsive.

### Why Prompt Templates?

Separating prompts from the task logic makes it easy to:
- Iterate on prompt quality without code changes
- A/B test different prompts
- Localize prompts for different languages
- Share prompts across projects

### Why Task-Based Architecture?

A task-based approach (vs. free-form chat) provides:
- Clear user intent (the model knows what to do)
- Consistent output formats
- Better UX with task-specific UI elements
- Easier testing and validation

---

## Resources

- [ARCHITECTURE.md](./ARCHITECTURE.md) — Full technical architecture
- [USER_GUIDE.md](./USER_GUIDE.md) — User-facing documentation
- [DESIGN.md](./DESIGN.md) — Design system
- [task_list.md](./task_list.md) — Development roadmap
