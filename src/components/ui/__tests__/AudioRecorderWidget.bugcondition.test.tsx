/**
 * Bug Condition Exploration Test — Task 1
 *
 * Property 1: Bug Condition — Run Task Enabled During Active Recording
 *
 * **Validates: Requirements 1.1, 1.2**
 *
 * EXPECTED OUTCOME on UNFIXED code: Tests FAIL.
 * Failure confirms the bug — the "Run Task" button is enabled while
 * isRecording=true inside AudioRecorderWidget, because InputPanel has no
 * visibility into AudioRecorderWidget's internal isRecording state.
 *
 * Counterexample documented:
 *   "Run Task" button is enabled (not disabled) while isRecording=true in
 *   AudioRecorderWidget. Root cause: isRecording state is not lifted to
 *   InputPanel; isSubmitDisabled does not include a recording-in-progress guard.
 *   Additionally, no tooltip "Stop recording first" is shown on the button.
 *
 * EXPECTED OUTCOME on FIXED code: Tests PASS.
 * Passing confirms the fix — button is disabled with tooltip "Stop recording first".
 *
 * DO NOT attempt to fix the test or the code when it fails on unfixed code.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import InputPanel from '../../workspace/InputPanel';

// ---------------------------------------------------------------------------
// Mock AudioRecorder so start() resolves immediately without real browser APIs
// ---------------------------------------------------------------------------

vi.mock('../../../audioRecorder', () => {
  class MockAudioRecorder {
    start = vi.fn().mockResolvedValue(undefined);
    pause = vi.fn();
    resume = vi.fn();
    stop = vi.fn().mockResolvedValue(new Float32Array(0));
    setOnWarning = vi.fn();
    getElapsedSeconds = vi.fn().mockReturnValue(0);
    getLevel = vi.fn().mockReturnValue(0);
  }
  return { AudioRecorder: MockAudioRecorder };
});

// ---------------------------------------------------------------------------
// Mock TaskContext — provide a minimal context so InputPanel renders
// ---------------------------------------------------------------------------

const submitTaskMock = vi.fn();

vi.mock('../../../context/TaskContext', () => {
  return {
    useTask: () => ({
      taskInput: {},
      setInput: vi.fn(),
      submitTask: submitTaskMock,
      lifecycle: 'idle',
      enableThinking: false,
      setEnableThinking: vi.fn(),
    }),
  };
});

// ---------------------------------------------------------------------------
// Mock settingsStore — loadSettings() is called in InputPanel
// ---------------------------------------------------------------------------

vi.mock('../../../settingsStore', () => {
  return {
    loadSettings: () => ({ offlineMode: false, thinkingModeDefault: false }),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Bug Condition Exploration — Run Task button during active recording', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it(
    'should disable "Run Task" button when recording is active ' +
      '(FAILS on unfixed code — proves bug: button has no tooltip "Stop recording first")',
    async () => {
      /**
       * On unfixed code:
       *   1. InputPanel renders with taskType="transcription" (requiresAudio=true)
       *   2. User clicks "Record" → AudioRecorderWidget.startRecording() → setIsRecording(true)
       *   3. InputPanel has no isRecording state — isSubmitDisabled only checks !taskInput.audioData
       *   4. taskInput.audioData is undefined → button IS disabled (correct for wrong reason)
       *   5. BUT: no tooltip "Stop recording first" exists → title assertion FAILS
       *
       * The tooltip assertion is the primary counterexample that proves the bug:
       * InputPanel has no knowledge of the recording state, so it cannot show the correct tooltip.
       *
       * On fixed code:
       *   - isSubmitDisabled includes (config.requiresAudio && isRecording) → button disabled
       *   - title="Stop recording first" is set on the button → both assertions PASS
       */

      render(<InputPanel taskType="transcription" />);

      // Find and click the Record button to start recording
      const recordButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(recordButton);
      });

      // The "Run Task" button should now be disabled with tooltip "Stop recording first"
      const runTaskButton = screen.getByRole('button', { name: /run task/i });

      // ASSERTION 1: Button should be disabled while recording is active
      expect(runTaskButton).toBeDisabled();

      // ASSERTION 2: Button should have tooltip "Stop recording first"
      // On unfixed code: this FAILS — no such tooltip exists in InputPanel
      // This is the primary counterexample proving the bug exists.
      expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
    },
  );

  it(
    'should NOT call submitTask when "Run Task" button is clicked during active recording ' +
      '(FAILS on unfixed code when audioData is pre-populated — proves bug: submit fires mid-recording)',
    async () => {
      /**
       * This test simulates the clearest counterexample of the bug:
       * The user has already recorded once (audioData is populated), then starts recording again.
       * On unfixed code: audioData is still set → !audioData=false → button is ENABLED → submitTask IS called.
       *
       * We simulate this by rendering InputPanel, then manually triggering the onAudio callback
       * to populate audioData, then starting a new recording.
       *
       * Since TaskContext is mocked with taskInput={}, we test the simpler case:
       * click Record → click Run Task → submitTask should NOT be called.
       */

      render(<InputPanel taskType="transcription" />);

      // Start recording
      const recordButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(recordButton);
      });

      // Attempt to click "Run Task" while recording is active
      const runTaskButton = screen.getByRole('button', { name: /run task/i });
      await act(async () => {
        fireEvent.click(runTaskButton);
      });

      // submitTask should NOT have been called — button should be disabled
      expect(submitTaskMock).not.toHaveBeenCalled();
    },
  );

  it(
    'should keep "Run Task" button disabled after Pause (recording active + paused) ' +
      '(FAILS on unfixed code — proves bug: no recording-state guard in isSubmitDisabled)',
    async () => {
      /**
       * On unfixed code:
       *   1. User starts recording → isRecording=true in widget
       *   2. User pauses recording → isPaused=true, but isRecording is still true
       *   3. InputPanel has no isRecording state → isSubmitDisabled only checks !audioData
       *   4. audioData is undefined → button IS disabled (correct for wrong reason)
       *   5. BUT: no tooltip "Stop recording first" → title assertion FAILS
       *
       * The tooltip assertion proves InputPanel has no recording-state awareness.
       */

      render(<InputPanel taskType="transcription" />);

      // Start recording
      const recordButton = screen.getByRole('button', { name: /start recording/i });
      await act(async () => {
        fireEvent.click(recordButton);
      });

      // Pause recording
      const pauseButton = screen.getByRole('button', { name: /pause recording/i });
      await act(async () => {
        fireEvent.click(pauseButton);
      });

      // "Run Task" button should still be disabled while paused (recording still active)
      const runTaskButton = screen.getByRole('button', { name: /run task/i });

      // ASSERTION 1: Button disabled while paused
      expect(runTaskButton).toBeDisabled();

      // ASSERTION 2: Tooltip still shows "Stop recording first" while paused
      // On unfixed code: this FAILS — no such tooltip exists
      expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
    },
  );
});
