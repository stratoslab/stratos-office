# Web Search Setup — Implementation Tasks

## Overview

These tasks implement the TinyFish API key setup flow for the Web Research feature. All work is browser-side — no backend required. The user gets a free key from tinyfish.ai, pastes it once, and it's stored in `localStorage`.

**Prerequisites:** The core `mcpClient.ts`, `ResearchWorkspace.tsx`, and `SettingsDrawer.tsx` stubs must exist (created in the main full-suite tasks). These tasks extend them.

**Estimated scope:** 6 tasks, ~8 files touched.

---

## Tasks

- [ ] 1. Extend MCP client with key management and typed errors

  **Files:** `src/mcpClient.ts`

  - Add `getApiKey(): string | null` — reads `localStorage.getItem('stratos-tinyfish-key')`; called on every request, never cached in memory
  - Add `validateKey(key: string): Promise<'valid' | 'invalid' | 'network_error'>` — POSTs `{ query: 'test', limit: 1 }` to `https://search.tinyfish.ai/search` with the key as `X-API-Key`; uses `AbortSignal.timeout(10_000)`; returns `'valid'` on HTTP 200, `'invalid'` on 401/403, `'network_error'` on timeout or other failure
  - Add `McpAuthError` class (extends `Error`, `name: 'McpAuthError'`) — thrown when a live call returns 401/403; handler must also call `localStorage.removeItem('stratos-tinyfish-key')`
  - Add `McpNetworkError` class (extends `Error`, `name: 'McpNetworkError'`) — thrown on timeout or non-auth HTTP errors
  - Update `search(query)` to: (1) call `getApiKey()` and throw `McpAuthError` if null, (2) include `X-API-Key` header, (3) throw `McpAuthError` on 401/403 after removing stored key, (4) throw `McpNetworkError` on other failures
  - Update `fetchContent(url)` with the same key injection and error handling pattern
  - Ensure the key value is never logged or included in any thrown error message
  - _Requirements: Req 3.1–3.4, Req 2.1–2.6_

- [ ] 2. Add `isTinyfishConnected` helper to settings store

  **Files:** `src/settingsStore.ts`

  - Add `isTinyfishConnected(): boolean` — returns `Boolean(localStorage.getItem('stratos-tinyfish-key'))`
  - Add `getTinyfishKeyMasked(): string | null` — returns the last 4 characters of the stored key prefixed with `••••••••••••`, or `null` if no key is stored (e.g., `"••••••••••••ab3f"`)
  - Add `removeTinyfishKey(): void` — calls `localStorage.removeItem('stratos-tinyfish-key')`
  - _Requirements: Req 4.1, Req 6.1–6.2_

- [ ] 3. Create Toast notification component

  **Files:** `src/components/ui/Toast.tsx`

  - Accept props: `message: string`, `type: 'success' | 'error'`, `onDismiss: () => void`
  - Render a fixed-position toast in the bottom-right corner
  - Auto-dismiss after 3 seconds via `useEffect` with `setTimeout`
  - Success style: green tint background `rgba(16, 185, 129, 0.15)`, border `rgba(16, 185, 129, 0.3)`, `check_circle` icon
  - Error style: red tint background `rgba(239, 68, 68, 0.15)`, border `rgba(239, 68, 68, 0.3)`, `error` icon
  - Animate in with Framer Motion `y: 20 → 0, opacity: 0 → 1`; respect `useReducedMotion()`
  - Include `role="status"` and `aria-live="polite"` for screen reader announcement
  - _Requirements: Req 2.3 (success toast), Req 8.3_

- [ ] 4. Create WebSearchSetupPrompt component

  **Files:** `src/components/tasks/WebSearchSetupPrompt.tsx`

  - Accept props: `onConnected: () => void`, `onSkip: (query?: string) => void`
  - Render a centered glass-panel card (max-width 480px) with:
    - Heading "Connect Web Search" with `search` icon
    - Explanation text
    - "Get your free key →" secondary button with `open_in_new` icon that calls `window.open('https://tinyfish.ai', '_blank', 'noopener')`
    - Numbered step list (3 steps)
    - Labeled text input (`id="tinyfish-key-input"`, `aria-describedby="key-steps"`, placeholder `tf_...`, `type="password"` to mask while typing)
    - Inline error message area (`aria-live="polite"`) — hidden until error occurs
    - "Save & Connect" primary button (full width)
    - "Skip — use model knowledge only" secondary link
  - On "Save & Connect" click:
    1. Set loading state: disable input + button, show spinner, set `aria-busy="true"` on button
    2. Call `mcpClient.validateKey(inputValue)`
    3. On `'valid'`: store key via `localStorage.setItem('stratos-tinyfish-key', inputValue)`, show one-time privacy notice modal (if `stratos-key-notice-shown` not in localStorage), then call `onConnected()`
    4. On `'invalid'`: show error "Invalid API key — please check and try again", re-enable form
    5. On `'network_error'`: show error "Could not reach TinyFish — check your connection and try again", re-enable form
  - One-time privacy notice modal: shown once after first successful save; sets `localStorage.setItem('stratos-key-notice-shown', '1')` on dismiss; contains the privacy explanation and a "Got it" button
  - On "Skip" click: call `onSkip()`
  - _Requirements: Req 1.1–1.4, Req 2.1–2.6, Req 6.4, Req 8.1–8.4_

- [ ] 5. Update ResearchWorkspace to handle setup and offline states

  **Files:** `src/components/tasks/ResearchWorkspace.tsx`

  - On mount, check `isTinyfishConnected()` and `settings.offlineMode`
  - IF `offlineMode` is true: render the Offline Mode banner (amber, `lock` icon, message + Settings link) above the normal workspace; disable the submit button
  - IF `offlineMode` is false AND no key stored: render `<WebSearchSetupPrompt>` instead of the normal workspace
    - `onConnected` callback: set local state to show normal workspace, show success toast "Web search connected ✓"
    - `onSkip` callback: navigate to General Text task or submit current query as General Text
  - IF key is stored and `offlineMode` is false: render normal Research workspace
  - Handle `McpAuthError` thrown during a live search call: remove key from localStorage, show dismissible banner "Your TinyFish API key is no longer valid. Please reconnect in Settings.", disable submit button, re-show setup prompt on next navigation
  - _Requirements: Req 1.1, Req 3.3, Req 5.1–5.4_

- [ ] 6. Add Web Search section to SettingsDrawer

  **Files:** `src/components/drawers/SettingsDrawer.tsx`

  - Add a "Web Search" section below the Privacy section
  - Read connection state via `isTinyfishConnected()` and `getTinyfishKeyMasked()` on each render (not cached)
  - **Not connected state:**
    - Grey status dot + "Not connected" label
    - "Connect Web Search" button that opens `WebSearchSetupPrompt` in a modal or navigates to Research task
  - **Connected state:**
    - Green status dot + "Connected" label
    - Masked key display with `aria-label="API key ending in <last 4 chars>"`
    - "Disconnect" danger-style button: calls `removeTinyfishKey()`, updates UI immediately
    - "Change key" link: toggles inline key input field
  - **Change key inline form:**
    - Text input (same style as setup prompt), "Save & Connect" button, "Cancel" link
    - Follows same validation flow as Task 4 (calls `validateKey`, stores on success, shows error on failure)
    - On success: show inline "Key updated ✓" message, collapse form
  - Never display the full key value — only the masked version
  - _Requirements: Req 4.1–4.4, Req 6.4_

---

## Dependency Order

```
Task 1 (mcpClient key management)
    └── Task 2 (settingsStore helpers)
            └── Task 3 (Toast component)
                    └── Task 4 (WebSearchSetupPrompt)
                            ├── Task 5 (ResearchWorkspace)
                            └── Task 6 (SettingsDrawer Web Search section)
```

Tasks 5 and 6 can be done in parallel after Task 4 is complete.

---

## Acceptance Checklist

After all tasks are complete, verify:

- [ ] Opening Web Research with no key shows the setup prompt
- [ ] "Get your free key →" opens tinyfish.ai in a new tab
- [ ] Entering a valid key shows success toast and opens the workspace
- [ ] Entering an invalid key shows inline error, does not store the key
- [ ] Network failure during validation shows appropriate error
- [ ] Privacy notice modal appears once after first successful key save
- [ ] Settings → Web Search shows "Connected" with masked key
- [ ] "Disconnect" removes the key and shows "Not connected"
- [ ] "Change key" validates and updates the stored key
- [ ] Enabling Offline Mode disables Research submit and shows banner
- [ ] A revoked key (401 on live call) removes the key and shows reconnect banner
- [ ] The full API key value is never visible in the UI or console
- [ ] All interactive elements are keyboard accessible
- [ ] Screen readers announce validation results via live regions
