# Model Loading Fix — Bugfix Design

## Overview

Five bugs in the Stratos Office app prevent the model from loading correctly. The primary bug (Bug 1) causes the UI to get permanently stuck on "Checking..." due to a React effect ordering race condition where `AppContent`'s `useEffect` fires before `ModelProvider`'s `useEffect` has created the worker. The remaining bugs cause the progress bar to stay at 0% (Bug 2), show the wrong loading label during WASM initialization (Bug 3), introduce a stale conflicting Vite config (Bug 4), and use a COEP header that may block `SharedArrayBuffer` in non-Chrome browsers while also breaking Google Fonts under `require-corp` (Bug 5).

The fix strategy is minimal and targeted: move the WebGPU check into the worker creation effect, fix the progress accumulation logic in the worker, add an `"init"` message case in `ModelContext`, delete `vite.config.js`, and update the COEP header and font loading strategy.

---

## Glossary

- **Bug_Condition (C)**: The condition that identifies inputs or states that trigger each bug
- **Property (P)**: The desired correct behavior when the bug condition holds
- **Preservation**: Existing behaviors that must remain unchanged after the fix
- **`checkWebGPU`**: The function in `ModelContext.tsx` that posts `{ type: "check" }` to the worker and sets `stage` to `"checking"`
- **`workerRef`**: The `useRef` in `ModelProvider` that holds the `Worker` instance; it is `null` until `ModelProvider`'s `useEffect` runs
- **`progress_callback`**: The callback passed to `AutoProcessor.from_pretrained` and `Gemma4ForConditionalGeneration.from_pretrained` in `worker.js`; called by Transformers.js with per-file download progress events
- **`stage`**: The `ModelStage` field in `ModelState` that drives which page component is rendered (`"idle"`, `"checking"`, `"downloading"`, `"loading"`, `"ready"`, `"error"`, `"unsupported"`)
- **COEP**: `Cross-Origin-Embedder-Policy` HTTP header required for `SharedArrayBuffer` access; `require-corp` is the spec-compliant value
- **CORP**: `Cross-Origin-Resource-Policy` header that third-party resources must serve when COEP is `require-corp`

---

## Bug Details

### Bug 1 — React Effect Ordering Race Condition

#### Bug Condition

React guarantees that child `useEffect` hooks run before parent `useEffect` hooks during the initial mount. `AppContent` is a child of `ModelProvider`. When `AppContent`'s `useEffect` calls `checkWebGPU()`, `ModelProvider`'s `useEffect` has not yet run, so `workerRef.current` is `null`. The `postMessage` call is silently dropped. The stage is set to `"checking"` but no response ever arrives.

```
FUNCTION isBugCondition_Bug1(mountOrder)
  INPUT: mountOrder — React effect execution order at mount
  OUTPUT: boolean

  RETURN mountOrder.childEffectRunsBeforeParentEffect = true
    AND workerRef.current = null
    AND checkWebGPU called from child useEffect
END FUNCTION
```

#### Examples

- **Actual**: App mounts → `AppContent.useEffect` fires → `checkWebGPU()` called → `workerRef.current` is `null` → `postMessage` dropped → stage stuck at `"checking"` forever
- **After fix**: App mounts → `ModelProvider.useEffect` fires → worker created → `{ type: "check" }` posted immediately → worker responds → stage transitions to `"idle"` or `"unsupported"`

---

### Bug 2 — Progress Bar Stays at 0%

#### Bug Condition

The `progress_callback` in `worker.js` only handles `info.status === "progress_total"`. Transformers.js never emits `"progress_total"` — it emits `"progress"` with per-file `loaded` and `total` byte fields. The handler for `"progress"` is absent, so no progress messages are ever posted to the main thread.

```
FUNCTION isBugCondition_Bug2(callbackInfo)
  INPUT: callbackInfo — object emitted by Transformers.js progress_callback
  OUTPUT: boolean

  RETURN callbackInfo.status = "progress"
    AND callbackInfo.loaded IS NOT NULL
    AND callbackInfo.total IS NOT NULL
END FUNCTION
```

#### Examples

- **Actual**: Transformers.js emits `{ status: "progress", file: "model.onnx", loaded: 52428800, total: 524288000 }` → callback ignores it → progress bar stays at 0%
- **After fix**: Same event → per-file map updated → overall percent computed → `{ status: "progress", progress: 10 }` posted → progress bar advances to 10%

---

### Bug 3 — Wrong Label During Model Initialization

#### Bug Condition

The worker posts `{ status: "loading", data: "Initializing ..." }` for `info.status === "init"` events. `ModelContext` maps all `status: "loading"` messages to `stage: "downloading"`, so `LoadingPage` always shows "Downloading Model Files" — even during the 30+ second WASM/model initialization phase that follows the download.

```
FUNCTION isBugCondition_Bug3(workerMessage)
  INPUT: workerMessage — message received from worker in ModelContext
  OUTPUT: boolean

  RETURN workerMessage.status = "init"
END FUNCTION
```

#### Examples

- **Actual**: Worker posts `{ status: "loading", data: "Initializing model.onnx..." }` → `ModelContext` sets `stage = "downloading"` → UI shows "Downloading Model Files" during init
- **After fix**: Worker posts `{ status: "init", data: "Initializing model.onnx..." }` → `ModelContext` maps `"init"` → `stage = "loading"` → UI shows "Loading Gemma 4"

---

### Bug 4 — Stale Conflicting Vite Config

#### Bug Condition

`vite.config.js` exists alongside `vite.config.ts`. The `.js` file contains a broken alias pointing to a non-existent local `transformers.js/` directory. Vite's config resolution order means `.js` may take precedence over `.ts` in some versions, and the alias would cause build failures if it were ever resolved.

#### Examples

- **Actual**: Two config files coexist; `vite.config.js` has `alias: { "@huggingface/transformers": path.resolve(__dirname, "transformers.js/...") }` pointing to a path that does not exist
- **After fix**: Only `vite.config.ts` exists; no broken alias

---

### Bug 5 — COEP Header Blocks SharedArrayBuffer and Google Fonts

#### Bug Condition

`vite.config.ts` sets `Cross-Origin-Embedder-Policy: credentialless`. This value is not universally supported for enabling `SharedArrayBuffer` — the spec requires `require-corp`. Additionally, `index.html` loads Google Fonts via cross-origin `<link>` tags, and `src/index.css` imports Google Fonts via `@import url(...)`. Google Fonts does not serve `Cross-Origin-Resource-Policy` headers, so switching to `require-corp` would block those requests.

```
FUNCTION isBugCondition_Bug5(config)
  INPUT: config — server headers and HTML font loading strategy
  OUTPUT: boolean

  RETURN config.COEP = "credentialless"
    OR (config.COEP = "require-corp" AND config.googleFontsLinksPresent = true)
END FUNCTION
```

#### Examples

- **Actual (Firefox/Safari)**: `credentialless` COEP → `SharedArrayBuffer` unavailable → WebGPU model loading fails
- **After fix**: `require-corp` COEP + no Google Fonts cross-origin requests → `SharedArrayBuffer` available in all supported browsers; fonts fall back to system stack

---

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- WebGPU support check result (`"idle"` or `"unsupported"`) must remain identical
- `stage` transitions for `"downloading"` → `"ready"` must remain unchanged
- `stage` transitions for `"error"` must remain unchanged
- Token generation, streaming, `tps` reporting, and interrupt behavior must remain unchanged
- `Cross-Origin-Opener-Policy: same-origin` header must remain unchanged
- Worker `format: 'es'` build setting must remain unchanged
- All non-`"init"` worker message mappings in `ModelContext` must remain unchanged
- All non-`"progress"` progress callback branches in `worker.js` must remain unchanged

**Scope:**
All inputs that do NOT match the five bug conditions above should be completely unaffected by these fixes. This includes:
- Mouse/keyboard interactions with the UI
- Model generation requests and responses
- Error handling paths
- Worker message types other than `"init"` and `"progress"`

---

## Hypothesized Root Cause

### Bug 1
React's effect execution order: child effects run before parent effects on initial mount. The original design assumed `ModelProvider`'s effect would run first (creating the worker), but React does not guarantee this — it guarantees the opposite. The `checkWebGPU` call was placed in `AppContent` as a "trigger on mount" pattern, which is correct in isolation but breaks when the dependency (`workerRef`) is initialized in a parent effect.

### Bug 2
The `progress_callback` was written to handle a `"progress_total"` status that Transformers.js does not emit. The actual status emitted during download is `"progress"` with `loaded`/`total` byte fields per file. The handler was likely written against an older or incorrect version of the Transformers.js API.

### Bug 3
The worker uses `status: "loading"` for both download-phase messages (`info.status === "download"`, `"done"`) and init-phase messages (`info.status === "init"`). `ModelContext` cannot distinguish between them. The fix is to give init-phase messages their own distinct status (`"init"`) so `ModelContext` can map them to the correct stage.

### Bug 4
`vite.config.js` is a leftover from an earlier development phase when the project attempted to use a locally cloned `transformers.js` repo. It was never deleted when the project switched to the CDN import strategy.

### Bug 5
`credentialless` was likely chosen as a more permissive COEP value to avoid breaking cross-origin resources. However, it does not satisfy the `SharedArrayBuffer` requirement in Firefox and Safari. The correct value is `require-corp`, but that requires all cross-origin resources to opt in via CORP headers — which Google Fonts does not do.

---

## Correctness Properties

Property 1: Bug Condition — WebGPU Check Fires After Worker Creation

_For any_ app mount sequence, the fixed `ModelProvider` useEffect SHALL post `{ type: "check" }` to the worker within the same effect that creates the worker, guaranteeing `workerRef.current` is non-null at the time of the `postMessage` call, and the stage SHALL transition from `"checking"` to either `"idle"` or `"unsupported"`.

**Validates: Requirements 2.1, 2.2**

Property 2: Bug Condition — Progress Accumulates Across Files

_For any_ sequence of `progress_callback` invocations where `info.status === "progress"` with non-zero `total`, the fixed worker SHALL maintain a per-file byte map, compute `overallPercent = sum(loaded) / sum(total) * 100`, and post `{ status: "progress", progress: Math.round(overallPercent) }` to the main thread, resulting in a progress value strictly greater than 0 once any bytes have been received.

**Validates: Requirements 2.3, 2.4**

Property 3: Bug Condition — Init Phase Maps to "loading" Stage

_For any_ worker message where `status === "init"`, the fixed `ModelContext` message handler SHALL set `stage` to `"loading"`, causing `LoadingPage` to display the initialization label rather than the download label.

**Validates: Requirements 2.5, 2.6**

Property 4: Bug Condition — Single Vite Config

_For any_ build or dev-server invocation, the fixed project root SHALL contain only `vite.config.ts` and no `vite.config.js`, eliminating the broken alias and the config resolution ambiguity.

**Validates: Requirements 2.7**

Property 5: Bug Condition — COEP require-corp Without Cross-Origin Fonts

_For any_ browser that supports `SharedArrayBuffer` via `require-corp`, the fixed app SHALL serve `Cross-Origin-Embedder-Policy: require-corp` and SHALL NOT include cross-origin Google Fonts `<link>` tags in `index.html` or `@import url(...)` from Google Fonts in CSS, so that `SharedArrayBuffer` is available and no CORP violations occur.

**Validates: Requirements 2.8, 2.9**

Property 6: Preservation — Non-Buggy Inputs Unchanged

_For any_ input where none of the five bug conditions hold (non-init worker messages, non-progress callbacks, generation/interrupt/reset flows, existing COOP header, worker ES module format), the fixed code SHALL produce exactly the same behavior as the original code.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9**

---

## Fix Implementation

### Bug 1 — `src/context/ModelContext.tsx` and `src/App.tsx`

**File**: `src/context/ModelContext.tsx`

**Changes**:

1. **Set initial stage to `"checking"`**: Change `initialState.stage` from `"idle"` to `"checking"` so the UI immediately shows the checking state before the worker even responds.

   ```ts
   // Before
   const initialState: ModelState = {
     stage: "idle",
     ...
   };

   // After
   const initialState: ModelState = {
     stage: "checking",
     ...
   };
   ```

2. **Post `{ type: "check" }` inside the worker creation effect**: After attaching the message listener, immediately post the check message. The worker exists at this point, so the message will not be dropped.

   ```ts
   // Inside ModelProvider's useEffect, after worker.addEventListener(...)
   worker.postMessage({ type: "check" });
   ```

3. **Remove `checkWebGPU` from the public context API** (or convert it to a no-op): Since the check is now automatic, external callers should not be able to trigger a redundant check. The simplest approach is to remove it from the `ModelContextValue` interface and the `Provider` value prop. If downstream consumers reference it, convert it to a no-op.

**File**: `src/App.tsx`

4. **Remove the `useEffect` that calls `checkWebGPU()`** from `AppContent`. Also remove the `checkWebGPU` destructure from `useModel()`.

   ```tsx
   // Before
   function AppContent() {
     const { state, checkWebGPU } = useModel();
     useEffect(() => {
       checkWebGPU();
     }, [checkWebGPU]);
     ...
   }

   // After
   function AppContent() {
     const { state } = useModel();
     // No useEffect for checkWebGPU
     ...
   }
   ```

---

### Bug 2 — `src/worker.js`

**File**: `src/worker.js`

**Function**: `_load` → `progress_callback`

**Changes**:

1. **Declare a per-file byte map** before the `progress_callback` closure, scoped to the `_load` method:

   ```js
   const fileProgress = new Map(); // filename → { loaded, total }
   ```

2. **Handle `info.status === "progress"`**: Update the map entry and compute the overall percentage. Guard against `total === 0` to avoid `NaN`.

   ```js
   if (info.status === "progress") {
     const key = info.file ?? info.name ?? "unknown";
     fileProgress.set(key, {
       loaded: info.loaded ?? 0,
       total: info.total ?? 0,
     });
     const totalLoaded = [...fileProgress.values()].reduce((s, e) => s + e.loaded, 0);
     const totalBytes = [...fileProgress.values()].reduce((s, e) => s + e.total, 0);
     const overallPercent = totalBytes > 0
       ? Math.round((totalLoaded / totalBytes) * 100)
       : 0;
     self.postMessage({ status: "progress", progress: overallPercent });
     return;
   }
   ```

3. **Remove the `"progress_total"` branch** (it is dead code — Transformers.js never emits this status).

---

### Bug 3 — `src/worker.js` and `src/context/ModelContext.tsx`

**File**: `src/worker.js`

**Function**: `_load` → `progress_callback`

**Change**: For `info.status === "init"`, post `status: "init"` instead of `status: "loading"`:

```js
// Before
if (info.status === "init") {
  self.postMessage({
    status: "loading",
    data: `Initializing ${info.file ?? info.name ?? "model file"}...`,
  });
}

// After
if (info.status === "init") {
  self.postMessage({
    status: "init",
    data: `Initializing ${info.file ?? info.name ?? "model file"}...`,
  });
}
```

Also update the initial `session.load()` call message to use `status: "loading"` (it already does — no change needed there).

**File**: `src/context/ModelContext.tsx`

**Change**: Add a `case "init":` branch in the worker message handler switch statement:

```ts
case "init":
  setState((prev) => ({
    ...prev,
    stage: "loading",
    currentFile: typeof data === "string" ? data : prev.currentFile,
  }));
  break;
```

Also update the `WorkerResponse` type in `src/types/index.ts` if needed — the `status` field is already typed as `string`, so no change is required there.

---

### Bug 4 — Project Root

**File**: `vite.config.js`

**Change**: Delete the file entirely.

```
rm vite.config.js
```

No other changes required. `vite.config.ts` already contains the correct configuration.

---

### Bug 5 — `vite.config.ts`, `index.html`, `src/index.css`

**File**: `vite.config.ts`

**Change**: Update COEP from `"credentialless"` to `"require-corp"`:

```ts
// Before
'Cross-Origin-Embedder-Policy': 'credentialless',

// After
'Cross-Origin-Embedder-Policy': 'require-corp',
```

**File**: `index.html`

**Change**: Remove the three Google Fonts `<link>` tags (two `preconnect` and one stylesheet):

```html
<!-- Remove these three lines -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet" />
```

The inline `<style>` block in `index.html` that sets `font-family: "Outfit", system-ui, sans-serif` can remain — `Outfit` will simply not load and the browser will fall through to `system-ui`.

**File**: `src/index.css`

**Change**: Remove the Google Fonts `@import` line and update the `font-family` declaration to use a safe fallback stack:

```css
/* Remove this line */
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap');

/* Update body font-family */
body {
  font-family: 'Outfit', 'Inter', system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  ...
}
```

`Outfit` will not load (no CDN import), but the fallback chain ensures readable text across all platforms.

---

## Testing Strategy

### Validation Approach

Testing follows a two-phase approach for each bug: first run exploratory tests on the unfixed code to surface counterexamples and confirm the root cause, then run fix-checking and preservation-checking tests on the fixed code.

---

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate each bug on unfixed code. Confirm or refute the root cause analysis.

**Bug 1 — Test Plan**: Mount `ModelProvider` + `AppContent` in a test environment with a mocked worker. Assert that `workerRef.current` is `null` when `AppContent`'s effect fires. Observe that `postMessage` is never called on the worker.

**Bug 1 — Expected Counterexample**: `workerRef.current` is `null` at the time `checkWebGPU()` is called; no `"check"` message is posted; stage remains `"checking"` indefinitely.

**Bug 2 — Test Plan**: Call the `progress_callback` directly with `{ status: "progress", file: "model.onnx", loaded: 1000, total: 10000 }`. Assert that `self.postMessage` is called with a progress value > 0.

**Bug 2 — Expected Counterexample**: `self.postMessage` is not called for `status: "progress"` events; the `"progress_total"` branch is never reached.

**Bug 3 — Test Plan**: Post `{ status: "init", data: "Initializing..." }` to `ModelContext`'s message handler. Assert that `state.stage` becomes `"loading"`.

**Bug 3 — Expected Counterexample**: No `"init"` case exists; the message falls through to the default (no-op); `stage` remains `"downloading"`.

**Bug 4 — Test Plan**: Check that both `vite.config.js` and `vite.config.ts` exist in the project root. Verify the alias in `vite.config.js` points to a non-existent path.

**Bug 5 — Test Plan**: Read `vite.config.ts` and assert `COEP === "credentialless"`. Read `index.html` and assert Google Fonts `<link>` tags are present.

---

### Fix Checking

**Goal**: Verify that for all inputs where each bug condition holds, the fixed code produces the expected behavior.

**Bug 1:**
```
FOR ALL mountSequence WHERE isBugCondition_Bug1(mountSequence) DO
  result := mountApp_fixed(mountSequence)
  ASSERT workerRef.current ≠ null AT TIME OF postMessage({ type: "check" })
  ASSERT stage TRANSITIONS TO ("idle" OR "unsupported")
END FOR
```

**Bug 2:**
```
FOR ALL callbackInfo WHERE isBugCondition_Bug2(callbackInfo) DO
  result := progressCallback_fixed(callbackInfo)
  ASSERT result.postedProgress = round(totalLoaded / totalBytes * 100)
  ASSERT result.postedProgress > 0 WHEN totalBytes > 0
END FOR
```

**Bug 3:**
```
FOR ALL workerMessage WHERE isBugCondition_Bug3(workerMessage) DO
  result := handleWorkerMessage_fixed(workerMessage)
  ASSERT result.stage = "loading"
END FOR
```

**Bug 4:**
```
ASSERT fileExists("vite.config.js") = false
ASSERT fileExists("vite.config.ts") = true
```

**Bug 5:**
```
ASSERT viteConfig.COEP = "require-corp"
ASSERT index.html CONTAINS NO googleFontsLinks
ASSERT index.css CONTAINS NO googleFontsImport
```

---

### Preservation Checking

**Goal**: Verify that for all inputs where the bug conditions do NOT hold, the fixed code produces the same result as the original code.

```
FOR ALL input WHERE NOT isBugCondition_Bug1(input)
                AND NOT isBugCondition_Bug2(input)
                AND NOT isBugCondition_Bug3(input) DO
  ASSERT originalHandler(input) = fixedHandler(input)
END FOR
```

Property-based testing is recommended for Bug 2 and Bug 3 preservation because:
- It generates many random callback/message inputs automatically
- It catches edge cases (zero-byte files, unknown statuses, missing fields) that manual tests miss
- It provides strong guarantees that non-buggy paths are unaffected

**Preservation Test Cases**:
1. **Non-progress callbacks**: `{ status: "download" }`, `{ status: "done" }`, `{ status: "init" }` (after Bug 3 fix, `"init"` is no longer a `"loading"` message — verify `"download"` and `"done"` still map to `stage: "downloading"`)
2. **Non-init worker messages**: `{ status: "loading" }`, `{ status: "ready" }`, `{ status: "check" }`, `{ status: "error" }`, `{ status: "start" }`, `{ status: "complete" }` — all must map to the same stages as before
3. **COOP header**: Assert `Cross-Origin-Opener-Policy: same-origin` is still present in `vite.config.ts` after the COEP change
4. **Worker format**: Assert `worker.format === "es"` is still present in `vite.config.ts`
5. **Generation flow**: End-to-end test that model loads, generates tokens, and reports `tps` correctly after all fixes

---

### Unit Tests

- Test that `ModelProvider`'s `useEffect` posts `{ type: "check" }` immediately after creating the worker (Bug 1)
- Test that `AppContent` no longer calls `checkWebGPU()` on mount (Bug 1)
- Test `progress_callback` with a sequence of per-file progress events and assert cumulative percentage (Bug 2)
- Test `progress_callback` with `total: 0` and assert no `NaN` is posted (Bug 2 edge case)
- Test `ModelContext` message handler with `{ status: "init" }` → `stage === "loading"` (Bug 3)
- Test `ModelContext` message handler with `{ status: "loading" }` → `stage === "downloading"` (Bug 3 preservation)
- Test that `vite.config.js` does not exist after fix (Bug 4)
- Test that `vite.config.ts` COEP is `"require-corp"` (Bug 5)

### Property-Based Tests

- Generate random sequences of `{ status: "progress", file, loaded, total }` events and verify the posted progress is always `round(sumLoaded / sumTotal * 100)` and never `NaN` (Bug 2)
- Generate random worker message objects with `status` values other than `"init"` and verify `ModelContext` maps them identically before and after the fix (Bug 3 preservation)
- Generate random `progress_callback` info objects with statuses other than `"progress"` and verify the worker posts the same messages before and after the Bug 2 fix (Bug 2 preservation)

### Integration Tests

- Full mount test: app mounts → stage transitions `"checking"` → `"idle"` without any manual `checkWebGPU()` call (Bug 1)
- Progress bar test: simulate a multi-file download sequence and verify progress advances from 0 to 100 (Bug 2)
- Loading label test: simulate download phase then init phase and verify stage transitions `"downloading"` → `"loading"` → `"ready"` (Bug 3)
- Build test: run `vite build` and verify it succeeds with only `vite.config.ts` present (Bug 4)
- Header test: start dev server and verify response headers include `COEP: require-corp` and `COOP: same-origin` (Bug 5)
