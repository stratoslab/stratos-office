# 00_STATE.md — stratos-office

## Repository Identity

| Field | Value |
|---|---|
| **Upstream** | `stratoslab/stratos-office` |
| **Fork** | `okwn/stratos-office` |
| **Local clone** | `/root/oss-pr-campaign/repos/stratos-office` |
| **Default branch** | `main` (matches upstream main) |
| **License** | Private / All rights reserved (NOT OSI) |
| **Archived** | No |
| **Language** | JavaScript/TypeScript |

## Upstream Branches

| Branch | Head (latest commit) | Status on origin |
|---|---|---|
| `upstream/main` | `6e76c25` — fix: integrity audit fixes, demo gate, and production hardening | Behind origin/main (no commits differ, just fork metadata) |
| `upstream/feat/ui-design-alignment` | `cdeb788` — chore: remove .kiro specs and docs from repo | Matches origin/feat/ui-design-alignment |
| `upstream/fix/model-loading-bugs` | `01e68c3` — fix: resolve 5 model loading bugs | Matches origin/fix/model-loading-bugs |

## Local Branch State

- `main` is clean, synced with upstream/main
- `feat/ui-design-alignment` is clean, synced with upstream/feat/ui-design-alignment
- `fix/model-loading-bugs` is clean, synced with upstream/fix/model-loading-bugs
- All three upstream branches tracked as remote branches

## Fork Metadata

- Fork created: 2026-05-22T16:01:16Z
- Forker: `okwn` (this account)
- Source: `stratoslab/stratos-office`
- Fork is public, not archived
- **No license** — "Private project. All rights reserved."

## Issues / Pull Requests (upstream)

- **Issues**: 0 open, 0 closed
- **PRs**: None visible (repo has `has_issues: true`, `has_pull_requests: true` but no activity)
- Upstream org: `stratoslab` (Organization, created 2026-05-15)

## Key Tech Stack

- **Model**: Gemma 4 E2B (2.3B params, Q4F16, ONNX) via Transformers.js + ONNX Runtime Web on WebGPU
- **Runtime**: Web Worker (non-blocking inference)
- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Framer Motion
- **PDF**: pdfjs-dist v4
- **Markdown**: react-markdown + remark-gfm + highlight.js
- **History**: IndexedDB (via fake-indexeddb for tests)
- **Settings**: localStorage
- **Web search**: TinyFish MCP (optional)
- **Test framework**: Vitest + jsdom + @testing-library

## Notable Observations

1. **No license** — this is proprietary/private code. Contributions may be welcomed but legally constrained.
2. **No CI/CD workflows** — no `.github/workflows/`, no GitHub Actions
3. **No CONTRIBUTING.md** — the `docs/CONTRIBUTING.md` exists only in `fix/model-loading-bugs` branch, not in main
4. **No existing issues or PRs** in upstream
5. The `feat/ui-design-alignment` branch removes the DemoGate component and pipeline workspaces (large deletion)
6. The `fix/model-loading-bugs` branch adds substantial docs and a CONTRIBUTING.md guide
7. Tests exist but `npm test` script is missing — tests use Vitest directly via `vitest run`
8. Lint (`tsc --noEmit`) passes cleanly

## Status

✅ Fork created, cloned, remotes configured. Ready for analysis and PR candidate selection.