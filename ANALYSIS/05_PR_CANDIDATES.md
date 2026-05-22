# 05_PR_CANDIDATES.md — stratos-office

## Quality Audit Findings

### 🔴 Critical Issues

1. **No LICENSE file** — Repo explicitly states "Private project. All rights reserved." with no OSI license. Contributions are legally problematic.
2. **Missing `audioRecorder.ts`** — The `feat/ui-design-alignment` branch deleted `src/audioRecorder.ts` entirely. Audio recording functionality was removed from the UI but the audio task types remain registered in `TASK_CONFIGS`. This means audio tasks (transcription, meeting_minutes, voice_to_email, multilingual_transcription, interview_transcriber) are registered but the recorder UI was gutted.
3. **Stale `index.html`** — `feat/ui-design-alignment` modified `index.html` but the file in main may be out of sync with the design branch.

### 🟡 Medium Issues

4. **`redline_comparison` task config mismatch** — Task config has `requiresImage: true` but it needs two PDF/text inputs for the diff feature. The first uploaded file won't be processed as a PDF in the same way as `pdf_qa`.
5. **No `"init"` status mapping in ModelContext** — The worker posts `{ status: "init", data: "..." }` messages during model initialization, but tests show ModelContext doesn't handle this status (Bug 3 — init label not mapped to "loading" stage).
6. **Duplicate message protocol** — `worker.js` has two overlapping code paths: `generate()` (status: `start`/`update`/`complete`) and `handleTask()` (status: `task_start`/`task_update`/`task_complete`). These could be unified.
7. **No environment config** — TinyFish API key is stored in `localStorage` with no documented setup. No `.env.example`.
8. **Worker error still posts `{ status: "complete", numTokens: 0, tps: 0 }`** — After an error is posted, the error handler immediately posts a success completion. This double-post could cause UI confusion.
9. **`package.json` private vs repo visibility** — `"private": true` in package.json, but the GitHub repo is public. This is intentional but potentially confusing.

### 🟢 Minor / Opportunities

10. **No `CONTRIBUTING.md` in main** — Only exists in `fix/model-loading-bugs` branch. Main has no contribution guide.
11. **No CI/CD** — No GitHub Actions or any automated pipeline (no `.github/workflows/`).
12. **No code owners** — No `CODEOWNERS` file.
13. **Tests can't run via `npm test`** — The package.json has no `test` script, only `lint`. Tests must be run via `npx vitest run`.
14. **Single-committer repo** — All 55 commits from single author (`dhonampemba@gmail.com`).
15. **WebGPU feature detection could be deeper** — Only checks `navigator.gpu` existence and `shader-f16` feature. Doesn't test actual inference capability.
16. **No rate limiting on model responses** — 30s timeout exists but no per-user throttling.

---

## PR Candidate Ideas

### Candidate 1: Restore audio recording UI
- **Branch**: `feat/ui-design-alignment` deleted `audioRecorder.ts` but audio tasks still exist
- **Problem**: Audio tasks (5 types) are registered but recording functionality was removed
- **Action**: Either restore `audioRecorder.ts` or remove audio task types from `TASK_CONFIGS`
- **Impact**: Restores broken audio workflow

### Candidate 2: Add `init` status to ModelContext
- **Branch**: `fix/model-loading-bugs` mentions resolving 5 model loading bugs
- **Problem**: `{ status: "init" }` from worker is not mapped to a UI stage
- **Action**: Add `init` case to the ModelContext message switch
- **Impact**: Fixes loading screen label showing "Checking" during initialization

### Candidate 3: Fix `redline_comparison` file input handling
- **Problem**: Task uses `requiresImage: true` but needs PDF/text for two files
- **Action**: Change `requiresImage: false` and update fileHandler to accept dual PDFs for this task
- **Impact**: Redline comparison will correctly handle PDF inputs

### Candidate 4: Add `test` npm script
- **Problem**: `npm test` fails — no test script in package.json
- **Action**: Add `"test": "vitest run"` to scripts
- **Impact**: Standard DX improvement; `npm run test` should work

### Candidate 5: Add `init` progress mapping in worker
- **Problem**: Worker posts `init` status but ModelContext doesn't handle it
- **Action**: In worker, change `status: "init"` to `status: "loading"` (or handle `init` in context)
- **Impact**: Consistent loading stage naming

### Candidate 6: Add missing `CONTRIBUTING.md` to main
- **Problem**: CONTRIBUTING.md only exists in `fix/model-loading-bugs` branch
- **Action**: Merge/adapt the CONTRIBUTING.md from that branch to main
- **Impact**: Documents how to contribute for outside collaborators

### Candidate 7: Worker error double-post fix
- **Problem**: Error handler posts both `{ status: "error" }` and `{ status: "complete", numTokens: 0, tps: 0 }`
- **Action**: Remove the spurious complete post after error
- **Impact**: Cleaner error state handling in UI

### Candidate 8: Add `package.json` test script + `.npmrc` for vitest
- **Problem**: Tests run via `npx vitest run` not `npm test`
- **Action**: Add `"test": "vitest run"` to package.json
- **Impact**: Standard npm workflow

### Candidate 9: Add `.env.example` for TinyFish API key
- **Problem**: No documented way to set up TinyFish API key
- **Action**: Create `.env.example` with `VITE_TINYFISH_API_KEY=`
- **Impact**: Easier onboarding for web search feature

### Candidate 10: Add `package.json` license field
- **Problem**: `"license": null` in package.json — should specify "UNLICENSED" or "Proprietary"
- **Action**: Add `"license": "UNLICENSED"` to package.json
- **Impact**: Clarity that this is not open source