# Web Search — Implementation Guide

> How web research works in Stratos Office, how the TinyFish API key flow is implemented, and the full UX design for connecting and managing the key.

---

## Overview

Stratos Office runs entirely in the browser with no backend. The one exception is **Web Research** — to search the live web, the app calls the [TinyFish](https://tinyfish.ai) Search and Fetch APIs directly from the browser.

TinyFish Search and Fetch are **free** with no credit card required. Every request needs an `X-API-Key` header. The user gets their key once from tinyfish.ai, pastes it into Settings, and the app stores it in `localStorage`. That's it — no server, no proxy, no OAuth dance.

---

## Why Not OAuth / "Click to Connect"?

The MCP OAuth 2.1 flow (where the user clicks "Authorize" and it just works) requires a registered OAuth client with a server-side redirect URI. Stratos Office has no backend, so there's nowhere to receive the OAuth callback. The API key approach is the correct pattern for a fully browser-side app.

The UX goal is to make the one-time setup feel as smooth as possible — guided, clear, and fast.

---

## localStorage Key

```
stratos-tinyfish-key   →   "tf_xxxxxxxxxxxxxxxx"
```

The key is stored in plain text in `localStorage`. This is the same security model as any browser-based API key (e.g., OpenAI Playground). The key only ever leaves the browser in the `X-API-Key` header of requests to `https://api.tinyfish.ai`.

---

## API Endpoints Used

| Operation | Endpoint | Purpose |
|---|---|---|
| Search | `GET https://api.tinyfish.ai/v1/search?q=<query>` | Returns up to 5 results (title, url, snippet) |
| Fetch | `POST https://api.tinyfish.ai/v1/fetch` | Returns page content as clean text |
| Key validation | Same search endpoint with query `"test"` | Used to validate key on first save |

Both endpoints require:
```
X-API-Key: <user's key>
Content-Type: application/json
```

---

## UX Flow

### State 1 — No key stored (first visit to Research)

The Research workspace shows a full-panel setup prompt instead of the task input. It never shows a broken or disabled state — it guides the user directly to getting connected.

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🔍  Connect Web Search                                │
│                                                         │
│   Web research uses TinyFish to search the live web     │
│   and fetch page content. It's free — no credit card.   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  1. Get your free API key                       │   │
│   │     [  Get free key at tinyfish.ai  →  ]        │   │
│   │                                                 │   │
│   │  2. Paste it here                               │   │
│   │     [ tf_...________________________ ] [👁]     │   │
│   │                                                 │   │
│   │  3. Connect                                     │   │
│   │     [        Save & Connect        ]            │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   🔒 Your key is stored only in this browser.           │
│      It never leaves your device except to tinyfish.ai  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Behaviour:**
- "Get free key at tinyfish.ai →" opens `https://tinyfish.ai` in a new tab
- The key input is `type="password"` by default with a show/hide toggle (👁)
- "Save & Connect" is disabled until the input is non-empty
- Pressing Enter in the input triggers "Save & Connect"

---

### State 2 — Validating key (after "Save & Connect" click)

```
│     [  ⟳  Connecting...  ]            │
```

- Button shows a spinner and "Connecting..." text
- Input is disabled during validation
- Makes a test search call: `GET /v1/search?q=test` with the provided key
- Timeout: 8 seconds

---

### State 3a — Key valid (success)

The setup prompt animates out and the normal Research workspace slides in with a brief success toast:

```
✓  Connected to TinyFish  ·  Web search ready
```

The Research task input is now fully active.

---

### State 3b — Key invalid (HTTP 401/403)

```
│   ┌─────────────────────────────────────────────────┐   │
│   │  ✗  Invalid API key — please check and try again │   │
│   │     [ tf_...________________________ ] [👁]     │   │
│   │     [        Save & Connect        ]            │   │
│   └─────────────────────────────────────────────────┘   │
```

- Input border turns red
- Error message appears inline below the input
- Input is re-enabled for correction
- The invalid key is NOT stored

---

### State 3c — Network error during validation

```
│   ✗  Could not reach TinyFish — check your connection   │
│      [  Try again  ]                                    │
```

- Key is not stored
- "Try again" re-attempts validation with the same key

---

### State 4 — Connected (normal Research workspace)

The Research task works normally. The Settings drawer shows the connection status.

**Settings drawer — Web Search section:**

```
┌─────────────────────────────────────────────────────────┐
│  Web Search                                             │
│                                                         │
│  ● Connected to TinyFish                               │
│    Key: tf_••••••••••••••••  [Change]  [Disconnect]    │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

- Key is shown masked (`tf_` prefix + bullets)
- "Change" re-shows the key input field inline (pre-filled with current key)
- "Disconnect" removes the key from localStorage after a one-line confirmation: "Remove your TinyFish key? You can reconnect anytime."

---

### State 5 — Offline Mode enabled

When the user enables Offline Mode in Settings, the Research category is hidden from the sidebar entirely. If they navigate directly to a research URL, they see:

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   🛡  Offline Mode is on                                │
│                                                         │
│   Web research is disabled. Turn off Offline Mode       │
│   in Settings to use web search.                        │
│                                                         │
│   [ Open Settings ]                                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation

### `src/settingsStore.ts` — Add key management

```typescript
const TINYFISH_KEY = 'stratos-tinyfish-key';

export function getTinyfishKey(): string | null {
  return localStorage.getItem(TINYFISH_KEY);
}

export function saveTinyfishKey(key: string): void {
  localStorage.setItem(TINYFISH_KEY, key);
}

export function removeTinyfishKey(): void {
  localStorage.removeItem(TINYFISH_KEY);
}

export function hasTinyfishKey(): boolean {
  const key = localStorage.getItem(TINYFISH_KEY);
  return typeof key === 'string' && key.trim().length > 0;
}
```

---

### `src/mcpClient.ts` — Direct REST calls with key

```typescript
const SEARCH_BASE = 'https://api.tinyfish.ai/v1/search';
const FETCH_BASE  = 'https://api.tinyfish.ai/v1/fetch';

function getHeaders(): HeadersInit {
  const key = getTinyfishKey();
  if (!key) throw new McpAuthError('No TinyFish API key configured');
  return {
    'X-API-Key': key,
    'Content-Type': 'application/json',
  };
}

export async function validateKey(key: string): Promise<'valid' | 'invalid' | 'network_error'> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(`${SEARCH_BASE}?q=test`, {
      headers: { 'X-API-Key': key, 'Content-Type': 'application/json' },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (res.status === 200) return 'valid';
    if (res.status === 401 || res.status === 403) return 'invalid';
    return 'network_error';
  } catch {
    return 'network_error';
  }
}

export async function search(query: string): Promise<SearchResult[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${SEARCH_BASE}?q=${encodeURIComponent(query)}`, {
      headers: getHeaders(),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) throw new McpSearchError(`Search failed: ${res.status}`);
    const data = await res.json();
    return (data.results ?? []).slice(0, 5);
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
}

export async function fetchContent(url: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(FETCH_BASE, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ url }),
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return '';                    // skip failed fetches silently
    const data = await res.json();
    const content: string = data.content ?? data.text ?? '';
    return content.slice(0, 8000);             // truncate per spec
  } catch {
    clearTimeout(timeout);
    return '';
  }
}
```

---

### `src/components/tasks/ResearchWorkspace.tsx` — Setup prompt component

The component checks `hasTinyfishKey()` on mount and renders either the setup prompt or the normal task workspace.

```typescript
type SetupState = 'idle' | 'validating' | 'error_invalid' | 'error_network';

function TinyfishSetup({ onConnected }: { onConnected: () => void }) {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [state, setState] = useState<SetupState>('idle');

  async function handleConnect() {
    if (!key.trim()) return;
    setState('validating');
    const result = await validateKey(key.trim());
    if (result === 'valid') {
      saveTinyfishKey(key.trim());
      onConnected();
    } else if (result === 'invalid') {
      setState('error_invalid');
    } else {
      setState('error_network');
    }
  }

  return (
    // ... render setup UI per the wireframes above
  );
}
```

Key UX details:
- `autoFocus` on the key input when the setup prompt mounts
- `onKeyDown` on the input: `Enter` → `handleConnect()`
- The "Get free key" button uses `target="_blank" rel="noopener noreferrer"`
- Success state: call `onConnected()` which triggers a CSS transition to slide in the task workspace

---

### `src/components/drawers/SettingsDrawer.tsx` — Web Search section

```typescript
function WebSearchSection() {
  const [connected, setConnected] = useState(hasTinyfishKey());
  const [changing, setChanging] = useState(false);

  function handleDisconnect() {
    if (confirm('Remove your TinyFish key? You can reconnect anytime.')) {
      removeTinyfishKey();
      setConnected(false);
    }
  }

  if (!connected) {
    return (
      <div>
        <p>Not connected</p>
        <button onClick={() => setChanging(true)}>Connect</button>
      </div>
    );
  }

  const maskedKey = `tf_${'•'.repeat(16)}`;

  return (
    <div>
      <span>● Connected</span>
      <span>{maskedKey}</span>
      <button onClick={() => setChanging(true)}>Change</button>
      <button onClick={handleDisconnect}>Disconnect</button>
      {changing && (
        <TinyfishKeyInput
          onSaved={() => { setConnected(true); setChanging(false); }}
          onCancel={() => setChanging(false)}
        />
      )}
    </div>
  );
}
```

---

## Security Notes

| Concern | Mitigation |
|---|---|
| Key visible in DevTools | Expected — same as any browser-side API key. TinyFish free tier keys have limited scope (search + fetch only). |
| Key in localStorage | Cleared when user clicks Disconnect or clears browser data. Never synced to any remote service. |
| Key in network requests | Only sent to `api.tinyfish.ai` over HTTPS. Never included in any other request. |
| Key exposure in history | Task history (IndexedDB) stores query text and results only — never the API key. |

---

## Graceful Degradation

If the user has a key but the TinyFish API is down or rate-limited:

1. Search fails → show "Web search unavailable" notice + "Run without web search" button
2. Search succeeds but all fetches fail → proceed with snippets only, show notice
3. Partial fetch failure → proceed silently with successfully fetched content

The Research task always has a fallback path to the model's training knowledge.

---

## User Guide Addition

Add this to `docs/USER_GUIDE.md` under the Research section:

> **First-time setup:** Web research requires a free TinyFish API key. When you first open the Research task, you'll see a setup prompt with a link to get your key. It takes about 30 seconds — sign up at tinyfish.ai, copy your key, paste it in, and click Connect. Your key is stored only in this browser and never sent anywhere except to tinyfish.ai.

---

## README Addition

The README privacy section should note:

> Web Research requires a free [TinyFish](https://tinyfish.ai) API key. The key is stored locally in your browser and only sent to `api.tinyfish.ai`. All other tasks are fully offline.
