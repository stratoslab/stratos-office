/**
 * Bug 3 — Wrong Label During Model Initialization
 *
 * Exploration test: proves that ModelContext has no `case "init":` in its
 * worker message handler switch, so dispatching { status: "init" } leaves
 * state.stage unchanged (it does NOT become "loading").
 *
 * **Validates: Requirements 1.5, 1.6**
 *
 * EXPECTED OUTCOME on unfixed code: Test FAILS.
 * Failure confirms the bug — stage never becomes "loading" during init phase.
 *
 * Counterexample documented:
 *   No `case "init":` in switch; message falls through to default (no-op);
 *   stage remains "downloading"; UI shows "Downloading Model Files" during
 *   the 30+ second WASM/model initialization phase.
 *
 * EXPECTED OUTCOME on fixed code: Test PASSES.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { useModel, ModelProvider } from '../context/ModelContext';
import type { ModelState } from '../types';

// ---------------------------------------------------------------------------
// MockWorker — captures the message listener so tests can dispatch messages
// ---------------------------------------------------------------------------

type MessageListener = (event: MessageEvent) => void;

class MockWorker {
  static instances: MockWorker[] = [];
  private listeners: Map<string, MessageListener[]> = new Map();

  constructor(_url: string | URL, _options?: WorkerOptions) {
    MockWorker.instances.push(this);
  }

  postMessage(_message: unknown) {}

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

  dispatchMessage(data: unknown) {
    const listeners = this.listeners.get('message') ?? [];
    const event = new MessageEvent('message', { data });
    for (const listener of listeners) listener(event);
  }
}

// ---------------------------------------------------------------------------
// StateCaptor — exposes ModelContext state via a ref
// ---------------------------------------------------------------------------

interface StateCapture { current: ModelState | null; }

function StateCaptor({ capture }: { capture: StateCapture }) {
  const { state } = useModel();
  capture.current = state;
  return null;
}

async function renderModelProvider() {
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

describe('Bug 3 — init message not mapped to "loading" stage', () => {
  beforeEach(() => {
    MockWorker.instances = [];
    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    'should set state.stage to "loading" when worker dispatches { status: "init" } ' +
      '(FAILS on unfixed code — proves missing case "init": in switch)',
    async () => {
      /**
       * On unfixed code:
       *   1. Worker posts { status: "init", data: "Initializing model.onnx..." }
       *   2. ModelContext switch has no case "init": — falls through to default (no-op)
       *   3. state.stage remains "downloading" (or whatever it was)
       *   4. LoadingPage shows "Downloading Model Files" during 30+ second init phase
       *
       * On fixed code:
       *   1. Worker posts { status: "init", data: "Initializing model.onnx..." }
       *   2. ModelContext case "init": sets stage = "loading"
       *   3. LoadingPage shows "Loading Gemma 4"
       *
       * This assertion FAILS on unfixed code, confirming the bug.
       */
      const { capture, worker } = await renderModelProvider();

      // First put the stage into "downloading" (simulating download phase)
      await act(async () => {
        worker.dispatchMessage({ status: 'loading', data: 'Downloading model.onnx...' });
      });
      expect(capture.current?.stage).toBe('downloading');

      // Now dispatch the init message — should transition to "loading"
      await act(async () => {
        worker.dispatchMessage({ status: 'init', data: 'Initializing model.onnx...' });
      });

      // On unfixed code: stage stays "downloading" → test FAILS (confirms bug)
      // On fixed code:   stage becomes "loading"   → test PASSES (confirms fix)
      expect(capture.current?.stage).toBe('loading');
    },
  );
});
