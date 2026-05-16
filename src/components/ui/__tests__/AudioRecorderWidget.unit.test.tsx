/**
 * Unit Tests — AudioRecorderWidget callback behavior — Task 3.4
 *
 * Tests that `onRecordingChange` is called correctly on start/stop transitions,
 * is NOT called on pause/resume, and is safely optional (no crash when omitted).
 *
 * **Validates: Requirements 2.1, 2.2**
 */

import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act, fireEvent } from '@testing-library/react';
import AudioRecorderWidget from '../AudioRecorderWidget';

// ---------------------------------------------------------------------------
// Mock AudioRecorder so tests run without real browser media APIs
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
// Tests
// ---------------------------------------------------------------------------

describe('AudioRecorderWidget — onRecordingChange callback behavior', () => {
  const noop = vi.fn();

  beforeEach(() => {
    noop.mockClear();
  });

  it('calls onRecordingChange(true) when recording starts', async () => {
    const onRecordingChange = vi.fn();

    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        onRecordingChange={onRecordingChange}
      />,
    );

    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    expect(onRecordingChange).toHaveBeenCalledTimes(1);
    expect(onRecordingChange).toHaveBeenCalledWith(true);
  });

  it('calls onRecordingChange(false) when recording stops', async () => {
    const onRecordingChange = vi.fn();

    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        onRecordingChange={onRecordingChange}
      />,
    );

    // Start recording first
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    onRecordingChange.mockClear();

    // Stop recording
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(onRecordingChange).toHaveBeenCalledTimes(1);
    expect(onRecordingChange).toHaveBeenCalledWith(false);
  });

  it('does not crash when onRecordingChange is not provided (optional prop)', async () => {
    // Render without onRecordingChange — should not throw
    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        // onRecordingChange intentionally omitted
      />,
    );

    const recordButton = screen.getByRole('button', { name: /start recording/i });

    // Start recording — no crash expected
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Stop recording — no crash expected
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // If we reach here without throwing, the test passes
    expect(true).toBe(true);
  });

  it('does NOT call onRecordingChange on pause', async () => {
    const onRecordingChange = vi.fn();

    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        onRecordingChange={onRecordingChange}
      />,
    );

    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    onRecordingChange.mockClear();

    // Pause recording — should NOT trigger onRecordingChange
    const pauseButton = screen.getByRole('button', { name: /pause recording/i });
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    expect(onRecordingChange).not.toHaveBeenCalled();
  });

  it('does NOT call onRecordingChange on resume', async () => {
    const onRecordingChange = vi.fn();

    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        onRecordingChange={onRecordingChange}
      />,
    );

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

    onRecordingChange.mockClear();

    // Resume recording — should NOT trigger onRecordingChange
    const resumeButton = screen.getByRole('button', { name: /resume recording/i });
    await act(async () => {
      fireEvent.click(resumeButton);
    });

    expect(onRecordingChange).not.toHaveBeenCalled();
  });

  it('does NOT call onRecordingChange on pause or resume — only on start/stop transitions', async () => {
    const onRecordingChange = vi.fn();

    render(
      <AudioRecorderWidget
        onAudio={noop}
        onError={noop}
        onRecordingChange={onRecordingChange}
      />,
    );

    // Start → pause → resume → stop
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });
    // Called once with true
    expect(onRecordingChange).toHaveBeenLastCalledWith(true);
    expect(onRecordingChange).toHaveBeenCalledTimes(1);

    const pauseButton = screen.getByRole('button', { name: /pause recording/i });
    await act(async () => {
      fireEvent.click(pauseButton);
    });
    // Still only called once — pause does not trigger callback
    expect(onRecordingChange).toHaveBeenCalledTimes(1);

    const resumeButton = screen.getByRole('button', { name: /resume recording/i });
    await act(async () => {
      fireEvent.click(resumeButton);
    });
    // Still only called once — resume does not trigger callback
    expect(onRecordingChange).toHaveBeenCalledTimes(1);

    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });
    // Now called twice total — stop triggers callback with false
    expect(onRecordingChange).toHaveBeenCalledTimes(2);
    expect(onRecordingChange).toHaveBeenLastCalledWith(false);
  });
});
