# Bugfix Requirements Document

## Introduction

Five bugs in the Stratos Office app (React + Vite + Transformers.js WebGPU) prevent the model from loading correctly and degrade the user experience. The primary issue causes the UI to get permanently stuck on "Checking..." due to a React effect ordering race condition. Secondary issues include a progress bar that never advances, an incorrect loading label during model initialization, a stale conflicting Vite config file, and a COEP header that can block `SharedArrayBuffer` in non-Chrome browsers. Together these bugs make the app non-functional on first load.

---

## Bug Analysis

### Current Behavior (Defect)

**Bug 1 — React effect ordering race condition (PRIMARY)**

1.1 WHEN `AppContent` (child component) mounts and its `useEffect` calls `checkWebGPU()`, THEN the system silently drops the `postMessage` because React runs child effects before parent effects, so `workerRef.current` is still `null` at that point.

1.2 WHEN `checkWebGPU()` fires before the worker is created, THEN the system sets `stage` to `"checking"` but never receives a response, leaving the UI stuck on "Checking..." indefinitely.

**Bug 2 — Progress bar stays at 0%**

1.3 WHEN Transformers.js emits a `progress_callback` with `info.status === "progress"` during model file download, THEN the system ignores it because the callback only handles `info.status === "progress_total"`, which Transformers.js never emits.

1.4 WHEN the download is in progress, THEN the system posts no progress updates to the main thread, so the progress bar remains at 0% for the entire download duration.

**Bug 3 — Wrong label during model initialization**

1.5 WHEN the worker emits a message with `status: "loading"` (which covers both download and WASM/model initialization phases), THEN the system maps it to stage `"downloading"`, so `LoadingPage` always shows "Downloading Model Files" even during the 30+ second WASM/model initialization phase that follows the download.

1.6 WHEN the worker emits a message with `status: "init"` during WASM/model initialization, THEN the system does not map it to stage `"loading"`, so the stage never becomes `"loading"` and the correct "Loading Gemma 4" label is never shown.

**Bug 4 — Stale conflicting Vite config**

1.7 WHEN `vite.config.js` exists alongside `vite.config.ts` in the project root, THEN the system contains a broken alias pointing to a non-existent local `transformers.js/` directory, creating a maintenance hazard and potential for future build confusion.

**Bug 5 — COEP header may block SharedArrayBuffer**

1.8 WHEN `vite.config.ts` sets `Cross-Origin-Embedder-Policy: credentialless`, THEN the system may fail to enable `SharedArrayBuffer` in browsers other than Chrome, because `credentialless` is not universally supported per the `SharedArrayBuffer` specification requirement of `COEP: require-corp`.

1.9 WHEN `index.html` loads Google Fonts via cross-origin `<link>` tags and COEP is set to `require-corp`, THEN the system blocks the font requests because Google Fonts does not serve `Cross-Origin-Resource-Policy` headers.

---

### Expected Behavior (Correct)

**Bug 1 — React effect ordering race condition**

2.1 WHEN the worker is created inside `ModelProvider`'s `useEffect`, THEN the system SHALL immediately call `checkWebGPU()` (i.e., post the `"check"` message) within the same effect, guaranteeing the worker exists before the message is sent.

2.2 WHEN `ModelProvider` handles the initial WebGPU check internally, THEN the system SHALL NOT require `AppContent` to call `checkWebGPU()` in a separate `useEffect`, eliminating the race condition entirely.

**Bug 2 — Progress bar stays at 0%**

2.3 WHEN Transformers.js emits `info.status === "progress"` with per-file `loaded` and `total` byte fields in the `progress_callback`, THEN the system SHALL accumulate per-file byte counts and compute an overall download percentage.

2.4 WHEN the overall download percentage is computed, THEN the system SHALL post `{ status: "progress", progress: overallPercent }` to the main thread so the progress bar advances continuously during the download.

**Bug 3 — Wrong label during model initialization**

2.5 WHEN the worker emits `status: "init"` during WASM/model initialization, THEN the system SHALL map that message to stage `"loading"` in `ModelContext`, so `LoadingPage` displays the correct "Loading Gemma 4" label during that phase.

2.6 WHEN the worker emits `status: "loading"` during file download, THEN the system SHALL continue to map that message to stage `"downloading"` so the "Downloading Model Files" label is shown only during the actual download phase.

**Bug 4 — Stale conflicting Vite config**

2.7 WHEN the project is built or served, THEN the system SHALL have only one Vite config file (`vite.config.ts`) in the project root, with `vite.config.js` deleted.

**Bug 5 — COEP header may block SharedArrayBuffer**

2.8 WHEN the dev server (and production build) serves the app, THEN the system SHALL set `Cross-Origin-Embedder-Policy: require-corp` so that `SharedArrayBuffer` is reliably available across all supported browsers.

2.9 WHEN COEP is set to `require-corp`, THEN the system SHALL NOT load Google Fonts via cross-origin `<link>` tags in `index.html`; instead it SHALL use a system font stack fallback in CSS (or self-host the fonts) to avoid cross-origin resource policy violations.

---

### Unchanged Behavior (Regression Prevention)

3.1 WHEN WebGPU is supported by the browser, THEN the system SHALL CONTINUE TO transition `stage` from `"checking"` to `"idle"` after a successful WebGPU check.

3.2 WHEN WebGPU is not supported by the browser, THEN the system SHALL CONTINUE TO transition `stage` to `"unsupported"` and display the appropriate unsupported message.

3.3 WHEN the user initiates model loading from `LandingPage`, THEN the system SHALL CONTINUE TO transition `stage` to `"downloading"` and begin downloading the model.

3.4 WHEN the model finishes loading, THEN the system SHALL CONTINUE TO transition `stage` to `"ready"` and display `DashboardPage`.

3.5 WHEN the model is ready and the user submits a prompt, THEN the system SHALL CONTINUE TO stream generated tokens and update `tps` on completion.

3.6 WHEN an error occurs during model loading or generation, THEN the system SHALL CONTINUE TO transition `stage` to `"error"` and display the error message.

3.7 WHEN the user interrupts generation, THEN the system SHALL CONTINUE TO stop token streaming and post a `"complete"` message.

3.8 WHEN `Cross-Origin-Opener-Policy: same-origin` is set in `vite.config.ts`, THEN the system SHALL CONTINUE TO serve that header unchanged.

3.9 WHEN the worker format is set to `es` in `vite.config.ts`, THEN the system SHALL CONTINUE TO build the worker as an ES module.

---

## Bug Condition Pseudocode

### Bug 1 — Fix Checking

```pascal
FUNCTION isBugCondition_Bug1(mountOrder)
  INPUT: mountOrder — the React effect execution order at mount
  OUTPUT: boolean

  // Bug fires when child effect runs before worker is created by parent effect
  RETURN mountOrder.childEffectRunsBeforeParentEffect = true
    AND workerRef.current = null
    AND checkWebGPU called from child useEffect
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition_Bug1(X) DO
  result ← checkWebGPU'(X)   // after fix: called inside ModelProvider useEffect
  ASSERT workerRef.current ≠ null AT TIME OF postMessage
  ASSERT stage transitions FROM "checking" TO ("idle" OR "unsupported")
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_Bug1(X) DO
  ASSERT F(X) = F'(X)   // WebGPU check result unchanged
END FOR
```

### Bug 2 — Fix Checking

```pascal
FUNCTION isBugCondition_Bug2(callbackInfo)
  INPUT: callbackInfo — object emitted by Transformers.js progress_callback
  OUTPUT: boolean

  RETURN callbackInfo.status = "progress"
    AND callbackInfo.loaded IS NOT NULL
    AND callbackInfo.total IS NOT NULL
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition_Bug2(X) DO
  result ← progressCallback'(X)
  ASSERT result.postedProgress > 0
  ASSERT result.postedProgress = round((totalLoaded / totalBytes) * 100)
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_Bug2(X) DO
  ASSERT F(X) = F'(X)   // non-progress callbacks unaffected
END FOR
```

### Bug 3 — Fix Checking

```pascal
FUNCTION isBugCondition_Bug3(workerMessage)
  INPUT: workerMessage — message received from worker
  OUTPUT: boolean

  RETURN workerMessage.status = "init"
END FUNCTION

// Property: Fix Checking
FOR ALL X WHERE isBugCondition_Bug3(X) DO
  result ← handleWorkerMessage'(X)
  ASSERT result.stage = "loading"
END FOR

// Property: Preservation Checking
FOR ALL X WHERE NOT isBugCondition_Bug3(X) DO
  ASSERT F(X) = F'(X)   // all other message mappings unchanged
END FOR
```
