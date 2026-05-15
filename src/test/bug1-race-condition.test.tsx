/**
 * Bug 1 — React Effect Ordering Race Condition
 *
 * Exploration test: proves that `workerRef.current` is `null` when
 * `AppContent`'s `useEffect` calls `checkWebGPU()`, so `postMessage`
 * is never called and the stage is stuck on "checking" indefinitely.
 *
 * **Validates: Requirements 1.1, 1.2**
 *
 * EXPECTED OUTCOME: This test FAILS on unfixed code.
 * Failure confirms the bug exists.
 *
 * Counterexample documented:
 *   `workerRef.current` is `null` at the time `checkWebGPU()` is called;
 *   no "check" message is posted; stage remains "checking" indefinitely.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, act } from '@testing-library/react';
import App from '../App';

// ---------------------------------------------------------------------------
// Mock Worker
// ---------------------------------------------------------------------------

/** Captures all postMessage calls made to any Worker instance. */
const postMessageMock = vi.fn();

/**
 * Minimal Worker mock.
 * - Stores the instance so tests can inspect it.
 * - Records every postMessage call.
 * - Provides addEventListener / removeEventListener stubs.
 */
class MockWorker {
  static instances: MockWorker[] = [];

  onmessage: ((event: MessageEvent) => void) | null = null;
  private listeners: Map<string, Array<(e: MessageEvent) => void>> = new Map();

  constructor(_url: string | URL, _options?: WorkerOptions) {
    MockWorker.instances.push(this);
  }

  postMessage(message: unknown) {
    postMessageMock(message);
  }

  addEventListener(type: string, listener: (e: MessageEvent) => void) {
    if (!this.listeners.has(type)) this.listeners.set(type, []);
    this.listeners.get(type)!.push(listener);
  }

  removeEventListener(type: string, listener: (e: MessageEvent) => void) {
    const arr = this.listeners.get(type);
    if (arr) {
      const idx = arr.indexOf(listener);
      if (idx !== -1) arr.splice(idx, 1);
    }
  }

  terminate() {}
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Bug 1 — React effect ordering race condition (exploration)', () => {
  beforeEach(() => {
    MockWorker.instances = [];
    postMessageMock.mockClear();
    // Replace the global Worker with our mock
    vi.stubGlobal('Worker', MockWorker);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it(
    'should call postMessage({ type: "check" }) when App mounts ' +
      '(FAILS on unfixed code — proves race condition)',
    async () => {
      /**
       * On unfixed code:
       *   1. React renders <ModelProvider><AppContent /></ModelProvider>
       *   2. React runs AppContent's useEffect FIRST (child before parent)
       *   3. checkWebGPU() is called → workerRef.current is null → postMessage is dropped
       *   4. ModelProvider's useEffect runs SECOND → worker is created, but check is never sent
       *
       * Therefore postMessage is never called with { type: "check" }.
       *
       * This assertion FAILS on unfixed code, confirming the bug.
       */
      await act(async () => {
        render(<App />);
      });

      // Assert that the worker received the WebGPU check message.
      // On unfixed code this FAILS because workerRef.current was null
      // when AppContent's effect fired, so postMessage was never called.
      expect(postMessageMock).toHaveBeenCalledWith({ type: 'check' });
    },
  );
});
