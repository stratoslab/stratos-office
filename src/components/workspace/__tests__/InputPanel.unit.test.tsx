/**
 * Unit Tests — InputPanel state wiring — Task 3.5
 *
 * Tests that InputPanel correctly tracks isRecording state via the
 * onRecordingChange callback from AudioRecorderWidget, and that
 * isSubmitDisabled reflects the recording state correctly.
 *
 * **Validates: Requirements 2.1, 2.2, 3.1, 3.2**
 *
 * These tests run on FIXED code and should all PASS.
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import InputPanel from '../InputPanel';

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
// Mock TaskContext — flexible enough to inject different taskInput values
// ---------------------------------------------------------------------------

const submitTaskMock = vi.fn();
let mockTaskInput: Record<string, unknown> = {};

vi.mock('../../../context/TaskContext', () => {
  return {
    useTask: () => ({
      taskInput: mockTaskInput,
      setInput: vi.fn((update: Record<string, unknown>) => {
        mockTaskInput = { ...mockTaskInput, ...update };
      }),
      submitTask: submitTaskMock,
      lifecycle: 'idle',
      enableThinking: false,
      setEnableThinking: vi.fn(),
    }),
  };
});

// ---------------------------------------------------------------------------
// Mock settingsStore — offlineMode=false so isResearchOffline is always false
// ---------------------------------------------------------------------------

vi.mock('../../../settingsStore', () => {
  return {
    loadSettings: () => ({ offlineMode: false, thinkingModeDefault: false }),
  };
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('InputPanel — isRecording state wiring via onRecordingChange', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('sets isRecording=true when onRecordingChange fires with true (Record button clicked)', async () => {
    /**
     * When the user clicks the Record button, AudioRecorderWidget calls
     * onRecordingChange(true). InputPanel should update its isRecording state
     * to true, which causes isSubmitDisabled to become true (for audio tasks).
     *
     * We verify this by checking the "Run Task" button is disabled AND has
     * the tooltip "Stop recording first" — both require isRecording=true in InputPanel.
     */
    render(<InputPanel taskType="transcription" />);

    // Initially: no recording, no audioData → button disabled (missing audio)
    const runTaskButton = screen.getByRole('button', { name: /run task/i });
    expect(runTaskButton).toBeDisabled();

    // Click Record → triggers startRecording → onRecordingChange(true) → isRecording=true
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // isRecording=true → isSubmitDisabled includes (config.requiresAudio && isRecording)
    // Button should be disabled with the recording-specific tooltip
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('sets isRecording=false when onRecordingChange fires with false (Stop button clicked)', async () => {
    /**
     * When the user clicks the Stop button, AudioRecorderWidget calls
     * onRecordingChange(false). InputPanel should update its isRecording state
     * to false. The "Stop recording first" tooltip should no longer appear.
     *
     * After stopping, audioData is populated (mock stop() returns Float32Array(0)),
     * but since Float32Array(0) is truthy, the button should become enabled.
     */
    // Pre-populate audioData so the button is enabled after stop
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2]) };

    render(<InputPanel taskType="transcription" />);

    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // While recording: button disabled with tooltip
    const runTaskButton = screen.getByRole('button', { name: /run task/i });
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');

    // Stop recording → onRecordingChange(false) → isRecording=false
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // isRecording=false → recording-specific disable condition is gone
    // audioData is present → button should be enabled
    expect(runTaskButton).not.toBeDisabled();
    // Tooltip should no longer be "Stop recording first"
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('isSubmitDisabled is true when requiresAudio=true and isRecording=true', async () => {
    /**
     * Core bug fix verification:
     * When config.requiresAudio=true AND isRecording=true, isSubmitDisabled must be true.
     *
     * This is the primary property that was broken before the fix.
     * We verify it by starting a recording and checking the button is disabled
     * with the correct tooltip.
     */
    render(<InputPanel taskType="transcription" />);

    // Click Record to set isRecording=true
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    const runTaskButton = screen.getByRole('button', { name: /run task/i });

    // isSubmitDisabled must be true
    expect(runTaskButton).toBeDisabled();

    // The specific reason must be the recording state (not just missing audioData)
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('isSubmitDisabled is false when requiresAudio=true, isRecording=false, and audioData is populated', async () => {
    /**
     * Preservation check:
     * When config.requiresAudio=true AND isRecording=false AND audioData is present,
     * isSubmitDisabled must be false — the button should be enabled.
     *
     * This verifies the fix does not break the happy path where the user has
     * completed a recording and the button should be enabled.
     *
     * We simulate this by:
     * 1. Pre-populating audioData in taskInput
     * 2. Never starting a recording (isRecording stays false)
     * 3. Verifying the button is enabled
     */
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2, 0.3]) };

    render(<InputPanel taskType="transcription" />);

    const runTaskButton = screen.getByRole('button', { name: /run task/i });

    // isRecording=false (never started), audioData present → button enabled
    expect(runTaskButton).not.toBeDisabled();

    // No recording tooltip
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });
});
