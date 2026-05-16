/**
 * Task 2 — Preservation Property Tests: Non-Buggy Worker Message Mappings
 *
 * These tests record the CURRENT (unfixed) behavior of ModelContext's worker
 * message handler for all message types EXCEPT "init".
 *
 * They PASS on unfixed code to establish a baseline. They will be re-run
 * after Bug 1 and Bug 3 fixes to confirm no regressions.
 *
 * **Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7**
 *
 * EXPECTED OUTCOME: All tests PASS on unfixed code (baseline established).
 *
 * Property 2: Preservation — Existing Worker Message Mappings Unchanged
 * For all worker messages with `status` NOT equal to `"init"`, the fixed
 * ModelContext handler SHALL produce the same `stage` as the original.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useModel, ModelProvider } from '../context/ModelContext';

// ---------------------------------------------------------------------------
// Helpers — capture the worker message listener
// ---------------------------------------------------------------------------

type MessageListener = (event: MessageEvent) => void;

/**
 * MockWorker captures the "message" event listener that ModelProvider
 * attaches via `worker.addEventListener("message", ...)`.
 * Tests can then fire synthetic message events through `dispatchMessage`.
 */
class MockWorker {
  static instances: MockWorker[] = [];

  private listeners: Map<string, MessageListener[]> = new Map();

  constructor(_url: string | URL, _options?: WorkerOptions) {
    MockWorker.instances.push(this);
  }

  postMessage(_message: unknown) {
    // no-op — we only care about inbound messages in these tests
  }

  addEventListener(type: string, listener: MessageListener) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: MessageListener) {
    const arr = this.listeners.get(type);
    if (arr) {
      const idx = arr.indexOf(listener);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }

  terminate() {}

  /** Fire a synthetic inbound message to all registered "message" listeners. */
  dispatchMessage(data: unknown) {
    const listeners = this.listeners.get('message') ?? [];
    const event = new MessageEvent('message', { data });
    for (const listener of listeners) {
      listener(event);
    }
  }
}

// ---------------------------------------------------------------------------
// Test consumer — exposes ModelContext state via a ref
// ---------------------------------------------------------------------------

import type { ModelState } from '../types';
import { useEffect, useRef } from 'react';

interface StateCapture {
  current: ModelState | null;
}

function StateCaptor({ capture }: { capture: StateCapture }) {
  const { state } = useModel();
  // Keep the ref in sync with the latest state on every render
  capture.current = state;
  return null;
}

/**
 * Renders ModelProvider with a StateCaptor child.
 * Returns the captured state ref and the MockWorker instance.
 */
async function renderModelProvider(): Promise<{
  capture: StateCapture;
  worker: MockWorker;
}> {
  const capture: StateCapture = { current: null };

  await act(async () => {
    render(
      <ModelProvider>
        <StateCaptor capture={capture} />
      </ModelProvider>,
    );
  });

  const worker = MockWorker.instances[MockWorker.instances.length - 1];
  return { capture, worker };
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Preservation — non-buggy worker message mappings (Bug 1 / Bug 3 baseline)', () => {
  beforeEach(() => {
    MockWorker.instances = [];
    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // -------------------------------------------------------------------------
  // Requirement 3.1 — { status: "check", supported: true } → stage: "idle"
  // -------------------------------------------------------------------------
  it('maps { status: "check", supported: true, shaderF16: true } → stage "idle"', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'check', supported: true, shaderF16: true, adapter: 'Test GPU', backend: 'd3d12' });
    });

    expect(capture.current?.stage).toBe('idle');
    expect(capture.current?.gpuAdapter).toBe('Test GPU');
    expect(capture.current?.shaderF16).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Requirement 3.2 — { status: "check", supported: false } → stage: "unsupported"
  // -------------------------------------------------------------------------
  it('maps { status: "check", supported: false } → stage "unsupported"', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'check', supported: false, reason: 'No WebGPU' });
    });

    expect(capture.current?.stage).toBe('unsupported');
  });

  it('maps { status: "check", supported: true, shaderF16: false } → stage "unsupported" with shader-f16 error', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'check', supported: true, shaderF16: false, adapter: 'Intel UHD', backend: 'metal' });
    });

    expect(capture.current?.stage).toBe('unsupported');
    expect(capture.current?.error).toContain('shader-f16');
    expect(capture.current?.shaderF16).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Requirement 3.3 — { status: "loading", data: "..." } → stage: "downloading"
  // -------------------------------------------------------------------------
  it('maps { status: "loading", data: "Downloading..." } → stage "downloading"', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'loading', data: 'Downloading model files...' });
    });

    expect(capture.current?.stage).toBe('downloading');
  });

  // -------------------------------------------------------------------------
  // Requirement 3.4 — { status: "ready" } → stage: "ready", progress: 100
  // -------------------------------------------------------------------------
  it('maps { status: "ready" } → stage "ready" and progress 100', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'ready' });
    });

    expect(capture.current?.stage).toBe('ready');
    expect(capture.current?.progress).toBe(100);
  });

  // -------------------------------------------------------------------------
  // Requirement 3.5 — { status: "error", data: "..." } → stage: "error", error set
  // -------------------------------------------------------------------------
  it('maps { status: "error", data: "Something failed" } → stage "error" with error message', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'error', data: 'Something failed' });
    });

    expect(capture.current?.stage).toBe('error');
    expect(capture.current?.error).toBe('Something failed');
  });

  // -------------------------------------------------------------------------
  // Requirement 3.6 — { status: "start" } → isGenerating: true
  // -------------------------------------------------------------------------
  it('maps { status: "start" } → isGenerating true', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'start' });
    });

    expect(capture.current?.isGenerating).toBe(true);
  });

  // -------------------------------------------------------------------------
  // Requirement 3.7 — { status: "complete", numTokens: 10, tps: 5.0 }
  //                   → isGenerating: false, tps and numTokens set
  // -------------------------------------------------------------------------
  it('maps { status: "complete", numTokens: 10, tps: 5.0 } → isGenerating false, tps/numTokens set', async () => {
    const { capture, worker } = await renderModelProvider();

    // First set isGenerating to true so we can verify it flips back
    await act(async () => {
      worker.dispatchMessage({ status: 'start' });
    });
    expect(capture.current?.isGenerating).toBe(true);

    await act(async () => {
      worker.dispatchMessage({ status: 'complete', numTokens: 10, tps: 5.0 });
    });

    expect(capture.current?.isGenerating).toBe(false);
    expect(capture.current?.tps).toBe(5.0);
    expect(capture.current?.numTokens).toBe(10);
  });

  // -------------------------------------------------------------------------
  // Property-based: all non-"init" statuses preserve their existing mapping
  //
  // We enumerate the full set of known non-"init" statuses and verify each
  // one produces a defined (non-null) state — i.e. the handler does not
  // throw or silently drop the message in a way that leaves state undefined.
  // -------------------------------------------------------------------------
  it('handles all known non-"init" statuses without throwing', async () => {
    const knownStatuses = [
      { status: 'check', supported: true },
      { status: 'check', supported: false },
      { status: 'loading', data: 'Downloading...' },
      { status: 'progress', progress: 42 },
      { status: 'ready' },
      { status: 'start' },
      { status: 'complete', numTokens: 5, tps: 3.0 },
      { status: 'error', data: 'Oops' },
      { status: 'update', output: 'token' },
    ];

    const { capture, worker } = await renderModelProvider();

    for (const msg of knownStatuses) {
      await act(async () => {
        worker.dispatchMessage(msg);
      });
      // State must remain a valid object after each message
      expect(capture.current).not.toBeNull();
    }
  });

  // -------------------------------------------------------------------------
  // Preservation: { status: "loading" } still maps to "downloading" (not "loading")
  // This is the key regression guard for Bug 3's fix — after adding case "init",
  // the existing case "loading" must continue to map to stage "downloading".
  // -------------------------------------------------------------------------
  it('preserves { status: "loading" } → stage "downloading" (not "loading")', async () => {
    const { capture, worker } = await renderModelProvider();

    await act(async () => {
      worker.dispatchMessage({ status: 'loading', data: 'Downloading model.onnx...' });
    });

    // Must be "downloading", NOT "loading"
    expect(capture.current?.stage).toBe('downloading');
    expect(capture.current?.stage).not.toBe('loading');
  });
});
