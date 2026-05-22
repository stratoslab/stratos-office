# 06_SELECTED_5_PR_PLAN.md — stratos-office

## Selected Top 5 PR Candidates

Ranked by: impact (user-facing vs internal), difficulty (low/medium), and readiness (no license conflict needed).

---

### PR #1: Add `npm test` script to package.json

**Why this PR**: Tests currently require `npx vitest run` — this is non-standard and breaks the expected `npm test` workflow. This is a low-risk DX improvement that any maintainer would accept immediately.

**Branch**: `main`
**Difficulty**: Trivial — 1 line change to package.json
**Risk**: None — purely additive script entry

**Change**:
```json
// package.json
{
  "scripts": {
+   "test": "vitest run",
    "test:ui": "vitest --ui"
  }
}
```

**Verification**: Run `npm test` → should run full vitest suite

---

### PR #2: Add `init` status mapping in ModelContext (or normalize worker output)

**Why this PR**: The worker sends `{ status: "init" }` messages during model initialization, but the ModelContext doesn't handle this status. The loading screen shows the previous label (e.g., "Checking") instead of "Initializing model..." during the init phase. The `fix/model-loading-bugs` branch mentions fixing 5 model loading bugs — this is one of them.

**Branch**: `fix/model-loading-bugs` or `main`
**Difficulty**: Low — add one case to the ModelContext message switch
**Risk**: Low — additive change, doesn't alter existing behavior

**Change**: In `src/context/ModelContext.tsx`, add `init` case to the message switch:
```typescript
case 'init':
  setState(s => ({ ...s, stage: 'loading', progressLabel: info.data }));
  break;
```

**Verification**: Load model in browser — should show "Initializing..." label during init phase

---

### PR #3: Fix worker error handler double-post of `complete`

**Why this PR**: The worker's `error` listener posts both `{ status: "error" }` and then `{ status: "complete", numTokens: 0, tps: 0 }`. The spurious `complete` post can cause the UI to exit the error state prematurely and show a zero-token completion. This is a correctness fix.

**Branch**: `main`
**Difficulty**: Low — remove 1 postMessage call from error handler
**Risk**: Low — fixes incorrect behavior on error path

**Change** in `src/worker.js`:
```javascript
// In error listener, remove:
self.postMessage({ status: "complete", numTokens: 0, tps: 0 });
```

**Verification**: Trigger a model error — UI should stay in error state, not flash to "complete"

---

### PR #4: Restore audio recording functionality removed by `feat/ui-design-alignment`

**Why this PR**: `feat/ui-design-alignment` deleted `src/audioRecorder.ts` and removed the `AudioRecorderWidget` component, but the audio task types (transcription, meeting_minutes, voice_to_email, multilingual_transcription, interview_transcriber) still exist in `TASK_CONFIGS`. This leaves 5 registered task types with no way to record audio — the UI has no audio capture path.

**Branch**: `feat/ui-design-alignment`
**Difficulty**: Medium — requires restoring the audioRecorder module and wiring up the UI
**Risk**: Medium — could conflict with other changes in that branch

**Options**:
- **Option A (restore)**: Restore `src/audioRecorder.ts` from upstream/main and re-add `AudioRecorderWidget` to the workspace UI
- **Option B (remove)**: Remove audio task types from `TASK_CONFIGS` in `feat/ui-design-alignment` and update the docs

**Verification**: Select an audio task → recording UI should appear and work

---

### PR #5: Add `package.json` `"license": "UNLICENSED"` field

**Why this PR**: The repo has `"license": null` in package.json, which npm treats as "all rights reserved." This is correct but npm warns about it. Setting `"license": "UNLICENSED"` is the explicit npm-accepted way to express "proprietary/no license." Also create a minimal `LICENSE` file noting proprietary status.

**Branch**: `main`
**Difficulty**: Trivial — 1 line change
**Risk**: None — clarifies existing legal stance

**Change**:
```json
// package.json
{
  "license": "UNLICENSED"
}
```

```text
// LICENSE
Proprietary — Stratos Office. All rights reserved.
```

**Verification**: `npm install` should show no license warnings

---

## Rejected from Top 5 (with reason)

- **"Add CONTRIBUTING.md to main"** — Only exists in `fix/model-loading-bugs` branch; too tied to docs that may change
- **"Add .env.example"** — TinyFish API key setup is a niche feature; more exploratory
- **"Fix redline_comparison task config"** — Requires deeper understanding of the feature; medium risk
- **"Normalize worker message protocol"** — Internal refactor; impact unclear without user research

## Execution Order

1. **PR #1** (`npm test` script) — Start here, fastest merge
2. **PR #3** (worker error double-post) — Tiny, correctness fix
3. **PR #5** (`UNLICENSED` field) — Trivial, clarifies legal status
4. **PR #2** (`init` status mapping) — Needs confirmation it's not already fixed in a branch
5. **PR #4** (audio recording restoration) — Most impactful but highest conflict risk with `feat/ui-design-alignment`