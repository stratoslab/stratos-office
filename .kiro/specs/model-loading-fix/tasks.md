# Implementation Plan

## Overview

Five bugs prevent the Stratos Office model from loading. Tasks are ordered by dependency: Bug 1 (primary blocker — stuck on "Checking...") is fixed first, followed by Bug 2 (progress bar), Bug 3 (wrong init label), Bug 4 (stale config), and Bug 5 (COEP/fonts). Each bug follows the exploratory workflow: write a failing test on unfixed code, implement the fix, then verify the test passes.

## Task Dependency Graph

```json
{
  "waves": [
    { "wave": 1, "tasks": ["1", "2"] },
    { "wave": 2, "tasks": ["3"] },
    { "wave": 3, "tasks": ["4", "5"] },
    { "wave": 4, "tasks": ["6"] },
    { "wave": 5, "tasks": ["7"] },
    { "wave": 6, "tasks": ["8", "9", "10"] },
    { "wave": 7, "tasks": ["11"] }
  ]
}
```

## Tasks

- [x] 1. Write bug condition exploration test — React effect ordering race (Bug 1)
  - **Property 1: Bug Condition** - WebGPU Check Fires Before Worker Exists
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface the counterexample that proves `workerRef.current` is `null` when `checkWebGPU()` is called
  - **Scoped PBT Approach**: Scope to the concrete failing case — mount `ModelProvider` + `AppContent` with a mocked worker factory; assert that `postMessage({ type: "check" })` is called on the worker
  - Mount `ModelProvider` wrapping `AppContent` in a test environment; mock `Worker` constructor to capture `postMessage` calls
  - Assert that `postMessage` is called with `{ type: "check" }` during mount
  - Run test on UNFIXED code — `workerRef.current` is `null` when `AppContent`'s effect fires, so `postMessage` is never called
  - **EXPECTED OUTCOME**: Test FAILS (proves the race condition exists)
  - Document counterexample: "`workerRef.current` is `null` at the time `checkWebGPU()` is called; no `"check"` message is posted; stage remains `"checking"` indefinitely"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2_

- [x] 2. Write preservation property tests — non-buggy worker message mappings (Bug 1 / Bug 3 baseline)
  - **Property 2: Preservation** - Existing Worker Message Mappings Unchanged
  - **IMPORTANT**: Follow observation-first methodology — observe behavior on UNFIXED code first
  - Observe: posting `{ status: "check", supported: true }` to `ModelContext` sets `stage = "idle"` on unfixed code
  - Observe: posting `{ status: "check", supported: false }` sets `stage = "unsupported"` on unfixed code
  - Observe: posting `{ status: "loading", data: "..." }` sets `stage = "downloading"` on unfixed code
  - Observe: posting `{ status: "ready" }` sets `stage = "ready"` on unfixed code
  - Observe: posting `{ status: "error", data: "..." }` sets `stage = "error"` on unfixed code
  - Write property-based tests: for all worker messages with `status` NOT equal to `"init"`, the fixed `ModelContext` handler SHALL produce the same `stage` as the original
  - Verify tests PASS on UNFIXED code (confirms baseline behavior to preserve)
  - **EXPECTED OUTCOME**: Tests PASS on unfixed code
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 3. Fix Bug 1 — React effect ordering race condition

  - [x] 3.1 Set `initialState.stage` to `"checking"` in `src/context/ModelContext.tsx`
    - Change `stage: "idle"` to `stage: "checking"` in the `initialState` object at the top of `ModelContext.tsx`
    - This ensures the UI immediately shows the checking state before the worker responds
    - _Bug_Condition: `isBugCondition_Bug1` — child effect fires before parent effect creates worker_
    - _Requirements: 2.1_

  - [x] 3.2 Post `{ type: "check" }` inside `ModelProvider`'s `useEffect` immediately after attaching the message listener
    - In `ModelProvider`'s `useEffect`, after `worker.addEventListener("message", ...)`, add `worker.postMessage({ type: "check" })`
    - The worker exists at this point, so the message will not be dropped
    - _Expected_Behavior: `workerRef.current ≠ null` at time of `postMessage`; stage transitions to `"idle"` or `"unsupported"`_
    - _Requirements: 2.1, 2.2_

  - [x] 3.3 Remove `checkWebGPU` from `ModelContextValue` interface and `ModelProvider` value prop in `src/context/ModelContext.tsx`
    - Remove `checkWebGPU: () => void` from the `ModelContextValue` interface
    - Remove `checkWebGPU` from the `<ModelContext.Provider value={{ ... }}>` prop
    - Keep the `checkWebGPU` callback function body or delete it — it is no longer exposed
    - _Preservation: all other context values (`loadModel`, `generate`, `interrupt`, `reset`, `clearError`) remain unchanged_
    - _Requirements: 2.2_

  - [x] 3.4 Remove the `checkWebGPU` `useEffect` from `AppContent` in `src/App.tsx`
    - Remove `const { state, checkWebGPU } = useModel()` and replace with `const { state } = useModel()`
    - Remove the `useEffect(() => { checkWebGPU(); }, [checkWebGPU])` block entirely
    - _Bug_Condition: eliminates the child-effect call that races against parent-effect worker creation_
    - _Preservation: all other `AppContent` rendering logic remains unchanged_
    - _Requirements: 2.2_

  - [x] 3.5 Verify bug condition exploration test (task 1) now passes
    - **Property 1: Expected Behavior** - WebGPU Check Fires After Worker Creation
    - **IMPORTANT**: Re-run the SAME test from task 1 — do NOT write a new test
    - The test from task 1 asserts `postMessage({ type: "check" })` is called during mount
    - When this test passes, it confirms the worker exists before the check message is sent
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 1 is fixed)
    - _Requirements: 2.1, 2.2_

  - [x] 3.6 Verify preservation tests (task 2) still pass after Bug 1 fix
    - **Property 2: Preservation** - Existing Worker Message Mappings Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in message handling)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7_

- [x] 4. Write bug condition exploration test — progress bar stays at 0% (Bug 2)
  - **Property 2: Bug Condition** - Progress Callback Ignores `status: "progress"` Events
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface the counterexample that proves `self.postMessage` is never called for `status: "progress"` events
  - **Scoped PBT Approach**: Call the `progress_callback` directly with `{ status: "progress", file: "model.onnx", loaded: 1000, total: 10000 }`; assert `self.postMessage` is called with `{ status: "progress", progress: 10 }`
  - Mock `self.postMessage` in the worker test environment; invoke `progress_callback` with a `status: "progress"` event
  - Assert that `postMessage` is called with a `progress` value of `10` (i.e., `round(1000/10000 * 100)`)
  - Run test on UNFIXED code — the callback only handles `"progress_total"` which Transformers.js never emits
  - **EXPECTED OUTCOME**: Test FAILS (proves the dead `"progress_total"` branch is the bug)
  - Document counterexample: "`self.postMessage` is not called for `status: "progress"` events; the `"progress_total"` branch is never reached; progress bar stays at 0%"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.3, 1.4_

- [x] 5. Write preservation property tests — non-progress callback branches (Bug 2 baseline)
  - **Property 2: Preservation** - Non-Progress Callback Branches Unchanged
  - **IMPORTANT**: Follow observation-first methodology — observe behavior on UNFIXED code first
  - Observe: `progress_callback({ status: "download", name: "model.onnx" })` posts `{ status: "loading", data: "Downloading model.onnx..." }` on unfixed code
  - Observe: `progress_callback({ status: "done", file: "model.onnx" })` posts `{ status: "loading", data: "Loaded model.onnx" }` on unfixed code
  - Observe: `progress_callback({ status: "init", file: "model.onnx" })` posts `{ status: "loading", data: "Initializing model.onnx..." }` on unfixed code (note: this will change after Bug 3 fix — record the current behavior now)
  - Write property-based tests: for all `progress_callback` info objects with `status` NOT equal to `"progress"`, the fixed worker SHALL post the same messages as the original
  - Verify tests PASS on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS on unfixed code
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.3, 3.4_

- [x] 6. Fix Bug 2 — progress bar stays at 0%

  - [x] 6.1 Declare `fileProgress` Map inside `_load` in `src/worker.js`
    - At the top of the `_load` method body, before the `progress_callback` closure, add: `const fileProgress = new Map();`
    - This map stores per-file `{ loaded, total }` byte counts keyed by filename
    - _Bug_Condition: `isBugCondition_Bug2` — `info.status === "progress"` with non-null `loaded`/`total`_
    - _Requirements: 2.3_

  - [x] 6.2 Add `info.status === "progress"` handler in `progress_callback` in `src/worker.js`
    - Replace the `"progress_total"` branch with a `"progress"` branch:
      ```js
      if (info.status === "progress") {
        const key = info.file ?? info.name ?? "unknown";
        fileProgress.set(key, { loaded: info.loaded ?? 0, total: info.total ?? 0 });
        const totalLoaded = [...fileProgress.values()].reduce((s, e) => s + e.loaded, 0);
        const totalBytes  = [...fileProgress.values()].reduce((s, e) => s + e.total, 0);
        const overallPercent = totalBytes > 0 ? Math.round((totalLoaded / totalBytes) * 100) : 0;
        self.postMessage({ status: "progress", progress: overallPercent });
        return;
      }
      ```
    - Guard against `totalBytes === 0` to avoid posting `NaN`
    - _Expected_Behavior: `postedProgress = round(sumLoaded / sumTotal * 100)`, always ≥ 0, never NaN_
    - _Requirements: 2.3, 2.4_

  - [x] 6.3 Remove the dead `"progress_total"` branch from `progress_callback` in `src/worker.js`
    - Delete the `if (info.status === "progress_total") { ... }` block entirely
    - Transformers.js never emits this status; the branch is unreachable dead code
    - _Preservation: `"download"`, `"init"`, and `"done"` branches remain unchanged_
    - _Requirements: 2.3_

  - [x] 6.4 Verify bug condition exploration test (task 4) now passes
    - **Property 2: Expected Behavior** - Progress Accumulates Across Files
    - **IMPORTANT**: Re-run the SAME test from task 4 — do NOT write a new test
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 2 is fixed; progress bar will advance)
    - _Requirements: 2.3, 2.4_

  - [x] 6.5 Verify preservation tests (task 5) still pass after Bug 2 fix
    - **Property 2: Preservation** - Non-Progress Callback Branches Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 5 — do NOT write new tests
    - **EXPECTED OUTCOME**: Tests PASS (confirms `"download"`, `"done"` branches are unaffected)
    - _Requirements: 3.3, 3.4_

- [x] 7. Write bug condition exploration test — wrong label during init (Bug 3)
  - **Property 3: Bug Condition** - `status: "init"` Message Not Mapped to `"loading"` Stage
  - **CRITICAL**: This test MUST FAIL on unfixed code — failure confirms the bug exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **GOAL**: Surface the counterexample that proves `ModelContext` does not handle `status: "init"` messages
  - **Scoped PBT Approach**: Post `{ status: "init", data: "Initializing model.onnx..." }` to `ModelContext`'s worker message handler; assert `state.stage === "loading"`
  - Simulate a worker message event with `{ status: "init", data: "Initializing model.onnx..." }` in a `ModelContext` unit test
  - Assert that `state.stage` becomes `"loading"` after the message is processed
  - Run test on UNFIXED code — no `"init"` case exists in the switch; stage remains `"downloading"`
  - **EXPECTED OUTCOME**: Test FAILS (proves the missing `case "init":` is the bug)
  - Document counterexample: "No `"init"` case in switch; message falls through to default (no-op); `stage` remains `"downloading"`; UI shows 'Downloading Model Files' during 30+ second init phase"
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.5, 1.6_

- [x] 8. Fix Bug 3 — wrong label during model initialization

  - [x] 8.1 Change `info.status === "init"` branch in `progress_callback` to post `status: "init"` in `src/worker.js`
    - Find the `if (info.status === "init")` block in `_load`'s `progress_callback`
    - Change `status: "loading"` to `status: "init"` in the `self.postMessage` call:
      ```js
      // Before
      self.postMessage({ status: "loading", data: `Initializing ${info.file ?? info.name ?? "model file"}...` });
      // After
      self.postMessage({ status: "init",    data: `Initializing ${info.file ?? info.name ?? "model file"}...` });
      ```
    - The `"download"` and `"done"` branches continue to post `status: "loading"` — do not change them
    - _Bug_Condition: `isBugCondition_Bug3` — `workerMessage.status === "init"`_
    - _Requirements: 2.5, 2.6_

  - [x] 8.2 Add `case "init":` to the worker message handler switch in `src/context/ModelContext.tsx`
    - In the `worker.addEventListener("message", ...)` switch statement, add a new case before `case "loading":`:
      ```ts
      case "init":
        setState((prev) => ({
          ...prev,
          stage: "loading",
          currentFile: typeof data === "string" ? data : prev.currentFile,
        }));
        break;
      ```
    - The existing `case "loading":` continues to set `stage: "downloading"` — do not change it
    - _Expected_Behavior: `state.stage === "loading"` when `status === "init"` message received_
    - _Preservation: `case "loading":` still maps to `stage: "downloading"`_
    - _Requirements: 2.5, 2.6_

  - [x] 8.3 Verify bug condition exploration test (task 7) now passes
    - **Property 3: Expected Behavior** - Init Phase Maps to "loading" Stage
    - **IMPORTANT**: Re-run the SAME test from task 7 — do NOT write a new test
    - **EXPECTED OUTCOME**: Test PASSES (confirms Bug 3 is fixed; "Loading Gemma 4" label shown during init)
    - _Requirements: 2.5, 2.6_

  - [x] 8.4 Verify preservation tests (task 2) still pass after Bug 3 fix
    - **Property 2: Preservation** - Existing Worker Message Mappings Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 — do NOT write new tests
    - Specifically verify `{ status: "loading" }` still maps to `stage: "downloading"` (not `"loading"`)
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions in other message mappings)
    - _Requirements: 3.3, 3.4_

- [x] 9. Fix Bug 4 — delete stale `vite.config.js`

  - [x] 9.1 Delete `vite.config.js` from the project root
    - Delete the file at `vite.config.js` in the project root
    - Verify `vite.config.ts` still exists and is the only Vite config file
    - The broken alias `@huggingface/transformers → ./transformers.js/...` is eliminated
    - _Bug_Condition: `isBugCondition_Bug4` — both `vite.config.js` and `vite.config.ts` exist_
    - _Expected_Behavior: only `vite.config.ts` exists in project root_
    - _Preservation: `vite.config.ts` content is unchanged — COEP, COOP, worker format all intact_
    - _Requirements: 2.7_

- [x] 10. Fix Bug 5 — COEP header and Google Fonts cross-origin violations

  - [x] 10.1 Change COEP from `"credentialless"` to `"require-corp"` in `vite.config.ts`
    - In `vite.config.ts`, update the server headers object:
      ```ts
      // Before
      'Cross-Origin-Embedder-Policy': 'credentialless',
      // After
      'Cross-Origin-Embedder-Policy': 'require-corp',
      ```
    - `Cross-Origin-Opener-Policy: same-origin` must remain unchanged
    - `worker.format: 'es'` must remain unchanged
    - _Bug_Condition: `isBugCondition_Bug5` — COEP is `"credentialless"`_
    - _Expected_Behavior: `SharedArrayBuffer` available in Firefox and Safari_
    - _Preservation: COOP header and worker format unchanged_
    - _Requirements: 2.8, 3.8, 3.9_

  - [x] 10.2 Remove the three Google Fonts `<link>` tags from `index.html`
    - Remove these three lines from `<head>` in `index.html`:
      ```html
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
      ```
    - The inline `<style>` block (`font-family: "Outfit", system-ui, sans-serif`) may remain — `Outfit` will not load and the browser falls through to `system-ui`
    - _Bug_Condition: Google Fonts cross-origin `<link>` tags violate CORP under `require-corp`_
    - _Requirements: 2.9_

  - [x] 10.3 Remove the Google Fonts `@import` and update `font-family` in `src/index.css`
    - Remove the first line of `src/index.css`:
      ```css
      @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');
      ```
    - Update the `body` rule's `font-family` to include a safe fallback stack:
      ```css
      body {
        font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
        ...
      }
      ```
    - All other CSS rules remain unchanged
    - _Bug_Condition: `@import url(...)` from Google Fonts violates CORP under `require-corp`_
    - _Expected_Behavior: no cross-origin font requests; text renders via system font fallback_
    - _Requirements: 2.9_

  - [x] 10.4 Verify COEP and font fix
    - Assert `vite.config.ts` contains `'Cross-Origin-Embedder-Policy': 'require-corp'`
    - Assert `vite.config.ts` still contains `'Cross-Origin-Opener-Policy': 'same-origin'`
    - Assert `index.html` contains no `fonts.googleapis.com` or `fonts.gstatic.com` `<link>` tags
    - Assert `src/index.css` contains no `@import url(` line referencing Google Fonts
    - _Requirements: 2.8, 2.9, 3.8, 3.9_

- [x] 11. Checkpoint — ensure all tests pass and app loads correctly
  - Re-run all exploration tests (tasks 1, 4, 7) — all should PASS after fixes
  - Re-run all preservation tests (tasks 2, 5) — all should PASS
  - Run `npm run build` (or `vite build`) and verify it succeeds with only `vite.config.ts` present
  - Start the dev server and verify response headers include `Cross-Origin-Embedder-Policy: require-corp` and `Cross-Origin-Opener-Policy: same-origin`
  - Manually verify the app loads in browser: stage transitions `"checking"` → `"idle"` without any manual trigger; progress bar advances during download; "Loading Gemma 4" label appears during init phase
  - Ask the user if any questions arise before marking complete

## Notes

- Write exploration tests (tasks 1, 4, 7) BEFORE implementing any fix — they must FAIL on unfixed code to confirm the bug
- Follow the observation-first methodology for preservation tests (tasks 2, 5) — run on unfixed code first to record baseline behavior
- Bug 4 (task 9) and Bug 5 (task 10) are independent of the other bugs and can be done in any order relative to each other
- Bug 3's fix in `worker.js` (task 8.1) changes what `progress_callback` posts for `"init"` events — re-run the Bug 2 preservation tests (task 5) after task 8 to confirm the `"download"` and `"done"` branches are still unaffected
- After all fixes, run `npm run build` to confirm only `vite.config.ts` is present and the build succeeds
