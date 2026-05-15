# Web Search Setup — Design

## Overview

This document covers the UI design and technical implementation for connecting Stratos Office to the TinyFish web search API. The feature is entirely browser-side — no backend, no OAuth redirect. The user gets a free TinyFish API key, pastes it once, and it's stored in `localStorage`.

---

## User Flow

```
User opens Web Research
        │
        ▼
Key in localStorage?
   │           │
  YES          NO
   │           │
   ▼           ▼
Normal      Setup Prompt
Workspace   ─────────────────────────────────────────
            │  Connect Web Search                    │
            │                                        │
            │  Web Research uses TinyFish — a free   │
            │  search API. You'll need a free key.   │
            │                                        │
            │  [Get your free key →]  (opens tab)    │
            │                                        │
            │  Steps:                                │
            │  1. Sign up at tinyfish.ai             │
            │  2. Copy your API key from dashboard   │
            │  3. Paste it below                     │
            │                                        │
            │  TinyFish API Key                      │
            │  ┌──────────────────────────────────┐  │
            │  │ tf_...                           │  │
            │  └──────────────────────────────────┘  │
            │                                        │
            │  [Save & Connect]                      │
            │  Skip — use model knowledge only       │
            └────────────────────────────────────────┘
                        │
              ┌─────────┴──────────┐
              │                    │
           Valid key           Invalid key
              │                    │
              ▼                    ▼
        Store in           Show inline error
        localStorage       "Invalid API key —
        Show success       please check and
        toast              try again"
        Open workspace
```

---

## Component: SetupPrompt

**File:** `src/components/tasks/WebSearchSetupPrompt.tsx`

### Layout

Full-panel replacement for the Research workspace when no key is stored. Centered card, max-width 480px, glass-panel styling.

```
┌─────────────────────────────────────────────┐
│                                             │
│  🔍  Connect Web Search                     │
│                                             │
│  Web Research uses TinyFish — a free        │
│  search API. You'll need a free API key     │
│  to get started.                            │
│                                             │
│  ┌─────────────────────────────────────┐    │
│  │  [Get your free key →]              │    │  ← opens tinyfish.ai in new tab
│  └─────────────────────────────────────┘    │
│                                             │
│  How to get your key:                       │
│  1  Sign up at tinyfish.ai                  │
│  2  Go to your dashboard → API Keys         │
│  3  Copy your key and paste it below        │
│                                             │
│  TinyFish API Key                           │
│  ┌─────────────────────────────────────┐    │
│  │  tf_...                             │    │
│  └─────────────────────────────────────┘    │
│  ⚠ Invalid API key — please check...        │  ← shown on 401/403
│                                             │
│  [        Save & Connect        ]           │  ← primary button
│                                             │
│  Skip — use model knowledge only            │  ← secondary link
│                                             │
└─────────────────────────────────────────────┘
```

### States

| State | Description |
|---|---|
| **Idle** | Input empty or partially filled, button enabled |
| **Loading** | Button shows spinner + "Validating...", input disabled |
| **Error** | Inline error message below input, button re-enabled |
| **Success** | Toast shown, prompt unmounts, workspace renders |

### Styling

- Card: `glass-panel` with `border: 1px solid rgba(255,255,255,0.08)`
- "Get your free key" button: secondary style with `open_in_new` icon
- Input: standard input style, `border-color: var(--error)` on error state
- Error text: `var(--error)`, 14px, with `warning` icon
- "Save & Connect": primary button, full width
- "Skip" link: `var(--outline)`, 14px, centered below button
- Step numbers: `var(--primary)` color, bold

---

## Component: Settings — Web Search Section

**File:** `src/components/drawers/SettingsDrawer.tsx` (new section)

### State A — Not Connected

```
Web Search
─────────────────────────────────────────────
  ⚫  Not connected

  [  Connect Web Search  ]
```

### State B — Connected

```
Web Search
─────────────────────────────────────────────
  🟢  Connected

  Key: ••••••••••••ab3f

  [Disconnect]   Change key
```

### State C — Change Key (inline)

```
Web Search
─────────────────────────────────────────────
  🟢  Connected

  TinyFish API Key
  ┌──────────────────────────────────────┐
  │  tf_...                              │
  └──────────────────────────────────────┘

  [Save & Connect]   Cancel
```

### Styling

- Section header: `text-[10px] font-bold uppercase tracking-widest`, `var(--outline)`
- Status dot: 8px circle, `var(--secondary)` (green) or `var(--outline)` (grey)
- Masked key: `font-mono text-sm`, `var(--on-surface-variant)`
- Disconnect button: danger style (`var(--error)` text, transparent background)
- Change key: `var(--primary)` link style, 14px

---

## Component: Offline Mode Banner

Shown inside the Research workspace when Offline Mode is enabled.

```
┌─────────────────────────────────────────────────────────────┐
│  🔒  Offline Mode is on — web search is disabled.           │
│      Disable Offline Mode in Settings to use web search.    │
└─────────────────────────────────────────────────────────────┘
```

- Background: `rgba(245, 158, 11, 0.08)` — amber tint
- Border: `1px solid rgba(245, 158, 11, 0.25)`
- Icon: `lock` Material Symbol, `var(--warning)`

---

## MCP Client Implementation

**File:** `src/mcpClient.ts`

### API Endpoints

| Operation | Endpoint |
|---|---|
| Search | `https://search.tinyfish.ai/search` |
| Fetch | `https://fetch.tinyfish.ai/fetch` |

### Key Retrieval

```typescript
function getApiKey(): string | null {
  return localStorage.getItem('stratos-tinyfish-key');
}
```

Read on every call — not cached in memory — so Settings changes take effect immediately.

### Request Pattern

```typescript
async function search(query: string): Promise<SearchResult[]> {
  const key = getApiKey();
  if (!key) throw new McpAuthError('No TinyFish API key configured');

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);

  try {
    const res = await fetch('https://search.tinyfish.ai/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': key,
      },
      body: JSON.stringify({ query, limit: 5 }),
      signal: controller.signal,
    });

    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem('stratos-tinyfish-key');
      throw new McpAuthError('API key revoked — please reconnect in Settings');
    }

    if (!res.ok) throw new McpNetworkError(`Search failed: ${res.status}`);

    return (await res.json()).results;
  } finally {
    clearTimeout(timeout);
  }
}
```

### Error Types

```typescript
class McpAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpAuthError';
  }
}

class McpNetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'McpNetworkError';
  }
}
```

`McpAuthError` → triggers key removal + reconnect banner in UI
`McpNetworkError` → triggers "Web search unavailable" notice + fallback button

### Validation Call

```typescript
async function validateKey(key: string): Promise<'valid' | 'invalid' | 'network_error'> {
  try {
    const res = await fetch('https://search.tinyfish.ai/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-API-Key': key },
      body: JSON.stringify({ query: 'test', limit: 1 }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.status === 401 || res.status === 403) return 'invalid';
    if (res.ok) return 'valid';
    return 'network_error';
  } catch {
    return 'network_error';
  }
}
```

---

## AppSettings Extension

Add `tinyfishKeyConnected` as a derived boolean (not stored — computed from localStorage):

```typescript
// settingsStore.ts
export function isTinyfishConnected(): boolean {
  return Boolean(localStorage.getItem('stratos-tinyfish-key'));
}
```

The key itself is stored separately under `stratos-tinyfish-key`, not inside the `stratos-settings` object, so it is never accidentally included in settings exports or logs.

---

## Toast Notification

On successful key save, show a brief success toast:

```
┌──────────────────────────────────┐
│  ✓  Web search connected         │
└──────────────────────────────────┘
```

- Duration: 3 seconds, auto-dismiss
- Position: bottom-right
- Background: `rgba(16, 185, 129, 0.15)` — green tint
- Border: `1px solid rgba(16, 185, 129, 0.3)`
- Icon: `check_circle` Material Symbol, `var(--success)`

---

## One-Time Privacy Notice

Shown once (tracked in localStorage under `stratos-key-notice-shown`) immediately after first successful key save, as a modal:

```
┌─────────────────────────────────────────────┐
│  🔒  Your key is stored locally             │
│                                             │
│  Your TinyFish API key is saved only in     │
│  your browser's localStorage. It is never  │
│  sent to any Stratos server — only to       │
│  TinyFish's search and fetch endpoints.     │
│                                             │
│  [  Got it  ]                               │
└─────────────────────────────────────────────┘
```

---

## File Changes Summary

| File | Change |
|---|---|
| `src/mcpClient.ts` | Add `getApiKey()`, `validateKey()`, `McpAuthError`, `McpNetworkError`; update `search()` and `fetchContent()` to use stored key |
| `src/settingsStore.ts` | Add `isTinyfishConnected()` helper |
| `src/components/tasks/WebSearchSetupPrompt.tsx` | New component — setup flow |
| `src/components/tasks/ResearchWorkspace.tsx` | Render `WebSearchSetupPrompt` when no key; render offline banner when Offline Mode on |
| `src/components/drawers/SettingsDrawer.tsx` | Add Web Search section with connection status, disconnect, change key |
| `src/components/ui/Toast.tsx` | New component — success/error toast |
