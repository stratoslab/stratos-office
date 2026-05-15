# Web Search Setup — Requirements

## Introduction

Stratos Office is a fully local, browser-only AI assistant. The one feature that requires an external service is **Web Research** — searching the live web and synthesizing answers with citations. This is powered by the [TinyFish](https://tinyfish.ai) Search and Fetch APIs.

TinyFish Search and Fetch are **free** with no credit card required. They do require an API key for authentication. This document defines the requirements for how Stratos Office handles that key — getting it, storing it, using it, and removing it — entirely within the browser with no backend.

### Key Constraints

- **No backend** — the API key is stored only in the user's browser (`localStorage`)
- **No OAuth redirect** — TinyFish's MCP OAuth flow requires a server-side redirect URI; this app has no server, so we use direct API key entry instead
- **Key never leaves the browser** — it is only sent to TinyFish API endpoints (`https://search.tinyfish.ai`, `https://fetch.tinyfish.ai`) as an `X-API-Key` header
- **Fully optional** — users who never use Web Research never need a key; all other tasks work without it

---

## Glossary

- **TinyFish** — the external web search and fetch service at [tinyfish.ai](https://tinyfish.ai)
- **API Key** — a free credential from TinyFish, passed as `X-API-Key` on every request
- **localStorage key** — `stratos-tinyfish-key` — where the API key is stored in the browser
- **Setup Prompt** — the in-app UI shown when the user opens Web Research without a saved key
- **Connection Status** — whether a valid TinyFish API key is currently stored and verified
- **Offline Mode** — a Settings toggle that disables all external calls including TinyFish

---

## Requirements

### Requirement 1: First-Time Setup Prompt

**User Story:** As a user opening Web Research for the first time, I want clear guidance on how to get and connect a free TinyFish API key, so that I can start searching without leaving the app confused.

#### Acceptance Criteria

1. WHEN the user navigates to the Web Research task and no TinyFish API key is stored in `localStorage` under `stratos-tinyfish-key`, THE Suite SHALL display a full-panel setup prompt instead of the normal task workspace.
2. THE setup prompt SHALL contain the following elements in order:
   - A heading: "Connect Web Search"
   - A brief explanation: "Web Research uses TinyFish — a free search API. You'll need a free API key to get started."
   - A "Get your free key →" button that opens `https://tinyfish.ai` in a new browser tab
   - A numbered step list: (1) Sign up at tinyfish.ai, (2) Go to your dashboard and copy your API key, (3) Paste it below
   - A labeled text input: "TinyFish API Key" with placeholder `tf_...`
   - A "Save & Connect" primary button
   - A "Skip — use model knowledge only" secondary link that dismisses the prompt and submits the query as a General Text task
3. THE setup prompt SHALL be dismissible via the "Skip" link without requiring a key.
4. WHEN the user dismisses via "Skip", THE Suite SHALL submit the current query (if any) as a General Text task and display a persistent banner: "Web search not connected. Results are from model training data only."

---

### Requirement 2: API Key Validation

**User Story:** As a user entering my API key, I want immediate feedback on whether it is valid, so that I don't waste time submitting tasks with a broken key.

#### Acceptance Criteria

1. WHEN the user clicks "Save & Connect", THE Suite SHALL disable the button and show a loading spinner while validation is in progress.
2. THE MCP_Client SHALL make a validation call to the TinyFish Search API with the query `"test"` and the provided key in the `X-API-Key` header.
3. IF the validation call returns HTTP 200, THE Suite SHALL:
   - Store the key in `localStorage` under `stratos-tinyfish-key`
   - Dismiss the setup prompt
   - Show a brief success toast: "Web search connected ✓"
   - Render the normal Web Research task workspace
4. IF the validation call returns HTTP 401 or HTTP 403, THE Suite SHALL:
   - Display an inline error below the input: "Invalid API key — please check and try again"
   - Re-enable the "Save & Connect" button
   - NOT store the key
5. IF the validation call fails due to a network error or timeout (> 10 seconds), THE Suite SHALL display: "Could not reach TinyFish — check your connection and try again" and re-enable the button.
6. THE Suite SHALL never store a key that has not passed validation.

---

### Requirement 3: Authenticated API Calls

**User Story:** As a user with a connected key, I want web search to work transparently without me having to think about authentication, so that the experience feels seamless.

#### Acceptance Criteria

1. WHEN a valid TinyFish API key is stored in `localStorage`, THE MCP_Client SHALL automatically include it as the `X-API-Key` header on all Search and Fetch API calls.
2. THE MCP_Client SHALL read the key from `localStorage` on each call — not cache it in memory — so that a key change in Settings takes effect immediately on the next call.
3. IF a Search or Fetch API call returns HTTP 401 or HTTP 403 (key revoked or expired), THE Suite SHALL:
   - Remove the stored key from `localStorage`
   - Display a dismissible banner: "Your TinyFish API key is no longer valid. Please reconnect in Settings."
   - Disable the Research task submit button until a new key is saved
4. THE MCP_Client SHALL NOT log or expose the API key value in any console output, error messages, or UI text.

---

### Requirement 4: Settings — Web Search Section

**User Story:** As a user, I want to manage my TinyFish API key from Settings, so that I can disconnect, update, or check my connection status at any time.

#### Acceptance Criteria

1. THE Settings Drawer SHALL contain a "Web Search" section with the following states:

   **State A — Not connected** (no key in localStorage):
   - Status indicator: grey dot + "Not connected"
   - "Connect Web Search" button that opens the setup prompt

   **State B — Connected** (valid key stored):
   - Status indicator: green dot + "Connected"
   - Masked key display: shows only the last 4 characters, e.g., `••••••••••••ab3f`
   - "Disconnect" button
   - "Change key" link that shows the key input field inline

2. WHEN the user clicks "Disconnect", THE Suite SHALL remove the key from `localStorage` and update the section to State A immediately, without a page reload.
3. WHEN the user clicks "Change key", THE Suite SHALL show an inline text input pre-filled with the masked key display, a "Save & Connect" button, and a "Cancel" link; saving follows the same validation flow as Requirement 2.
4. THE Settings Drawer SHALL NOT display the full API key value at any point — only the masked version.

---

### Requirement 5: Offline Mode Interaction

**User Story:** As a user who has enabled Offline Mode, I want web search to be fully disabled, so that I can be certain no data leaves my device.

#### Acceptance Criteria

1. WHEN Offline Mode is enabled in Settings, THE Suite SHALL disable the Research task submit button regardless of whether a TinyFish API key is stored.
2. WHEN Offline Mode is enabled and the user navigates to Web Research, THE Suite SHALL display a banner: "Offline Mode is on — web search is disabled. Disable Offline Mode in Settings to use web search."
3. WHEN Offline Mode is enabled, THE MCP_Client SHALL not make any network calls, even if a valid key is stored.
4. WHEN Offline Mode is disabled, THE Suite SHALL restore the Research task to its normal state (setup prompt if no key, normal workspace if key is present).

---

### Requirement 6: Key Persistence and Security

**User Story:** As a user, I want my API key to persist across browser sessions so I don't have to re-enter it every visit, and I want to understand how it is stored.

#### Acceptance Criteria

1. THE Suite SHALL store the TinyFish API key in `localStorage` under the key `stratos-tinyfish-key` so that it persists across browser sessions on the same device.
2. THE Suite SHALL NOT store the API key in `sessionStorage`, cookies, IndexedDB, or any other storage mechanism.
3. THE Suite SHALL NOT transmit the API key to any endpoint other than `https://search.tinyfish.ai` and `https://fetch.tinyfish.ai`.
4. THE Suite SHALL display a one-time notice on first key save: "Your API key is stored locally in your browser. It is never sent to any Stratos server."
5. IF the user clears browser data or localStorage, THE Suite SHALL treat the key as absent and show the setup prompt on next Research task visit.

---

## Non-Functional Requirements

### Requirement 7: Performance

#### Acceptance Criteria

1. THE validation call (Requirement 2) SHALL complete within 10 seconds; if it does not, THE Suite SHALL treat it as a network failure.
2. THE setup prompt SHALL render within 100ms of the user navigating to the Research task with no stored key.

### Requirement 8: Accessibility

#### Acceptance Criteria

1. THE API key input field SHALL have an associated `<label>` element and an `aria-describedby` pointing to the step instructions.
2. THE "Save & Connect" button SHALL have `aria-busy="true"` and `aria-label="Validating key..."` while the validation call is in progress.
3. Success and error messages SHALL be announced to screen readers via `aria-live="polite"` regions.
4. THE masked key display SHALL have `aria-label="API key ending in <last 4 chars>"` for screen reader users.
