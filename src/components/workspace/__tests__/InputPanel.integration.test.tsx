/**
 * Integration Tests — Full Recording Flow — Task 4
 *
 * Tests the complete end-to-end recording flows through InputPanel, verifying
 * that the "Run Task" button state and tooltip are correct at every step.
 *
 * These tests run on FIXED code and should all PASS.
 *
 * **Validates: Requirements 2.1, 2.2, 3.1, 3.2, 3.3, 3.4**
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
    stop = vi.fn().mockResolvedValue(new Float32Array([0.1, 0.2, 0.3]));
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
      get taskInput() {
        return mockTaskInput;
      },
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
// Mock settingsStore — default: offlineMode=false
// ---------------------------------------------------------------------------

let mockOfflineMode = false;

vi.mock('../../../settingsStore', () => {
  return {
    loadSettings: () => ({ offlineMode: mockOfflineMode, thinkingModeDefault: false }),
  };
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function renderAudioWorkspace() {
  mockTaskInput = {};
  return render(<InputPanel taskType="transcription" />);
}

function getRunTaskButton() {
  return screen.getByRole('button', { name: /run task/i });
}

// ---------------------------------------------------------------------------
// Full Recording Flow
// ---------------------------------------------------------------------------

describe('Integration — Full recording flow', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
    mockOfflineMode = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('disables "Run Task" with tooltip "Stop recording first" after clicking Record', async () => {
    /**
     * Flow: open audio workspace → click Record → assert button disabled with correct tooltip.
     *
     * Before recording: button is disabled because audioData is absent.
     * After clicking Record: button is disabled because isRecording=true (new condition).
     * The tooltip "Stop recording first" distinguishes the recording-specific disable reason.
     */
    renderAudioWorkspace();

    // Initial state: no recording, no audioData → disabled (missing audio)
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    // No recording tooltip yet
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');

    // Click Record
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Now: isRecording=true → disabled with recording-specific tooltip
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('enables "Run Task" after clicking Stop once onAudio fires', async () => {
    /**
     * Flow: click Record → click Stop → assert button enabled once onAudio fires.
     *
     * When Stop is clicked:
     * 1. onRecordingChange(false) fires → isRecording=false
     * 2. stop() resolves with PCM data → onAudio(pcm) fires → setInput({ audioData: pcm })
     * 3. isRecording=false AND audioData present → button enabled
     *
     * Note: The TaskContext mock's setInput updates mockTaskInput but does not trigger
     * a React re-render on its own. We pre-populate audioData to simulate the state
     * after onAudio fires (the same pattern used in InputPanel.unit.test.tsx).
     * This correctly tests that isRecording=false + audioData present → button enabled.
     */
    // Pre-populate audioData to simulate the state after onAudio fires
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2, 0.3]) };
    render(<InputPanel taskType="transcription" />);

    // Start recording — isRecording=true → button disabled with tooltip
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Verify disabled while recording
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');

    // Stop recording — triggers onRecordingChange(false) → isRecording=false
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // isRecording=false, audioData present (pre-populated) → button enabled
    expect(runTaskButton).not.toBeDisabled();
    // Recording tooltip gone
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });
});

// ---------------------------------------------------------------------------
// Pause Flow
// ---------------------------------------------------------------------------

describe('Integration — Pause flow', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
    mockOfflineMode = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('keeps "Run Task" disabled after Pause (recording still active while paused)', async () => {
    /**
     * Flow: Record → Pause → assert button still disabled.
     *
     * Pausing does NOT stop the recording — isRecording remains true.
     * The button must stay disabled with the same tooltip.
     */
    renderAudioWorkspace();

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

    // Still disabled — recording is active (just paused)
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('keeps "Run Task" disabled after Resume (recording still active)', async () => {
    /**
     * Flow: Record → Pause → Resume → assert button still disabled.
     *
     * Resuming also does NOT stop the recording — isRecording remains true.
     */
    renderAudioWorkspace();

    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Pause
    const pauseButton = screen.getByRole('button', { name: /pause recording/i });
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    // Resume
    const resumeButton = screen.getByRole('button', { name: /resume recording/i });
    await act(async () => {
      fireEvent.click(resumeButton);
    });

    // Still disabled — recording is active again
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('enables "Run Task" after Record → Pause → Resume → Stop sequence', async () => {
    /**
     * Full pause flow: Record → Pause → Resume → Stop → assert button enabled.
     *
     * Only Stop ends the recording. After Stop:
     * - isRecording=false
     * - audioData present (pre-populated to simulate onAudio firing)
     * - Button becomes enabled
     *
     * Note: Pre-populate audioData using the same pattern as InputPanel.unit.test.tsx,
     * since the TaskContext mock's setInput doesn't trigger React re-renders.
     */
    // Pre-populate audioData to simulate the state after onAudio fires
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2, 0.3]) };
    render(<InputPanel taskType="transcription" />);

    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    // Pause
    const pauseButton = screen.getByRole('button', { name: /pause recording/i });
    await act(async () => {
      fireEvent.click(pauseButton);
    });

    // Resume
    const resumeButton = screen.getByRole('button', { name: /resume recording/i });
    await act(async () => {
      fireEvent.click(resumeButton);
    });

    // Stop
    const stopButton = screen.getByRole('button', { name: /stop recording/i });
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // isRecording=false, audioData present → button enabled
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).not.toBeDisabled();
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });
});

// ---------------------------------------------------------------------------
// File Upload Flow
// ---------------------------------------------------------------------------

describe('Integration — File upload flow (no recording)', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
    mockOfflineMode = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('enables "Run Task" when audioData is pre-populated via file upload (isRecording never set)', () => {
    /**
     * File upload flow: the actual upload goes through FileUploadZone → handleFile →
     * extractAudio → setInput({ audioData: pcm }). We simulate the end state by
     * pre-populating audioData in the TaskContext mock.
     *
     * isRecording is never set to true — the button should be enabled purely because
     * audioData is present, without any recording having taken place.
     */
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2, 0.3, 0.4, 0.5]) };
    render(<InputPanel taskType="transcription" />);

    const runTaskButton = getRunTaskButton();

    // audioData present, isRecording=false → enabled
    expect(runTaskButton).not.toBeDisabled();
    // No recording tooltip
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('disables "Run Task" before file upload completes (audioData absent)', () => {
    /**
     * Before the file upload completes, audioData is absent → button disabled.
     * isRecording is never set to true in this flow.
     */
    mockTaskInput = {};
    render(<InputPanel taskType="transcription" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    // The disable reason is missing audioData, not recording — no recording tooltip
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('enables "Run Task" for all audio task types once audioData is populated via upload', () => {
    /**
     * Full sweep: all audio task types should enable the button when audioData is present
     * via file upload (isRecording never set to true).
     */
    const audioTaskTypes = [
      'transcription',
      'meeting_minutes',
      'voice_to_email',
      'multilingual_transcription',
      'interview_transcriber',
    ] as const;

    const audioData = new Float32Array([0.1, 0.2, 0.3]);

    for (const taskType of audioTaskTypes) {
      mockTaskInput = { audioData };
      const { unmount } = render(<InputPanel taskType={taskType} />);
      const runTaskButton = screen.getByRole('button', { name: /run task/i });
      expect(runTaskButton).not.toBeDisabled();
      expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// Non-Audio Workspace
// ---------------------------------------------------------------------------

describe('Integration — Non-audio workspace', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
    mockOfflineMode = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders text workspace without any recording UI or recording-related state', () => {
    /**
     * Text workspace (email_draft): requiresAudio=false.
     * No AudioRecorderWidget is rendered, so isRecording is never set to true.
     * Button behavior is identical to the original code.
     */
    mockTaskInput = {};
    render(<InputPanel taskType="email_draft" />);

    // No Record button in a text workspace
    expect(screen.queryByRole('button', { name: /start recording/i })).toBeNull();

    // Run Task button is disabled because text is absent
    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();

    // No recording tooltip — this workspace has nothing to do with recording
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('enables "Run Task" for text workspace when text is present (identical to original behavior)', () => {
    /**
     * Text workspace with text present → button enabled.
     * isRecording is never introduced — behavior is identical to original code.
     */
    mockTaskInput = { text: 'Hello, please draft an email.' };
    render(<InputPanel taskType="email_draft" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).not.toBeDisabled();
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('disables "Run Task" for image workspace when imageDataUrl is absent', () => {
    /**
     * Image workspace (ocr): requiresAudio=false, requiresImage=true.
     * No recording UI, no isRecording state. Button disabled because imageDataUrl absent.
     */
    mockTaskInput = {};
    render(<InputPanel taskType="ocr" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('enables "Run Task" for image workspace when imageDataUrl is present', () => {
    /**
     * Image workspace with imageDataUrl present → button enabled.
     * isRecording is never introduced.
     */
    mockTaskInput = { imageDataUrl: 'data:image/png;base64,abc123' };
    render(<InputPanel taskType="ocr" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).not.toBeDisabled();
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('never shows "Stop recording first" tooltip on any non-audio task type', () => {
    /**
     * Non-audio tasks should never show the recording tooltip, regardless of state.
     * The fix only adds (config.requiresAudio && isRecording) which is always false
     * for non-audio tasks.
     */
    const nonAudioCases: Array<{
      taskType: Parameters<typeof InputPanel>[0]['taskType'];
      taskInput: Record<string, unknown>;
    }> = [
      { taskType: 'email_draft', taskInput: {} },
      { taskType: 'email_draft', taskInput: { text: 'Hello' } },
      { taskType: 'ocr', taskInput: {} },
      { taskType: 'ocr', taskInput: { imageDataUrl: 'data:image/png;base64,x' } },
      { taskType: 'summarize', taskInput: {} },
      { taskType: 'summarize', taskInput: { text: 'Summary' } },
    ];

    for (const { taskType, taskInput } of nonAudioCases) {
      mockTaskInput = taskInput;
      const { unmount } = render(<InputPanel taskType={taskType} />);
      const runTaskButton = screen.getByRole('button', { name: /run task/i });
      expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
      unmount();
    }
  });
});

// ---------------------------------------------------------------------------
// Tooltip Precedence
// ---------------------------------------------------------------------------

describe('Integration — Tooltip precedence', () => {
  beforeEach(() => {
    submitTaskMock.mockClear();
    mockTaskInput = {};
    mockOfflineMode = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('shows research offline tooltip when isResearchOffline=true and isRecording=false', () => {
    /**
     * When offlineMode=true and taskType="research":
     * - isResearchOffline=true
     * - isRecording=false (no recording in progress)
     * → tooltip should show the research offline message, not the recording message.
     *
     * Tooltip precedence: recording > research offline (per submitTitle logic in InputPanel).
     * When isRecording=false, the research offline tooltip takes effect.
     */
    mockOfflineMode = true;
    mockTaskInput = {};
    render(<InputPanel taskType="research" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    expect(runTaskButton).toHaveAttribute(
      'title',
      'Web research requires Offline Mode to be disabled',
    );
    // Not the recording tooltip
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
  });

  it('shows "Stop recording first" tooltip when isRecording=true, even if isResearchOffline would apply', async () => {
    /**
     * Tooltip precedence test:
     * When isRecording=true, the recording tooltip takes priority over any other tooltip.
     *
     * Note: research task (requiresAudio=false) never sets isRecording=true, so we use
     * an audio task type. The submitTitle logic checks isRecording first:
     *   const submitTitle = (config.requiresAudio && isRecording)
     *     ? 'Stop recording first'
     *     : isResearchOffline
     *       ? 'Web research requires Offline Mode to be disabled'
     *       : undefined;
     *
     * For an audio task with isRecording=true, the recording tooltip always wins.
     * (isResearchOffline is false for audio tasks since taskType !== 'research')
     */
    mockOfflineMode = false;
    mockTaskInput = {};
    render(<InputPanel taskType="transcription" />);

    // Start recording
    const recordButton = screen.getByRole('button', { name: /start recording/i });
    await act(async () => {
      fireEvent.click(recordButton);
    });

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    // Recording tooltip takes priority
    expect(runTaskButton).toHaveAttribute('title', 'Stop recording first');
  });

  it('shows no tooltip when button is enabled (no recording, no offline mode)', () => {
    /**
     * When the button is enabled (audioData present, not recording, not offline),
     * no tooltip should be shown.
     */
    mockOfflineMode = false;
    mockTaskInput = { audioData: new Float32Array([0.1, 0.2]) };
    render(<InputPanel taskType="transcription" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).not.toBeDisabled();
    // No tooltip when enabled
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
    expect(runTaskButton).not.toHaveAttribute(
      'title',
      'Web research requires Offline Mode to be disabled',
    );
  });

  it('shows no tooltip for non-audio, non-research tasks regardless of state', () => {
    /**
     * For tasks that are neither audio nor research, no tooltip should appear.
     * The submitTitle logic returns undefined for these cases.
     */
    mockOfflineMode = false;
    mockTaskInput = {};
    render(<InputPanel taskType="email_draft" />);

    const runTaskButton = getRunTaskButton();
    expect(runTaskButton).toBeDisabled();
    // No tooltip for text tasks
    expect(runTaskButton).not.toHaveAttribute('title', 'Stop recording first');
    expect(runTaskButton).not.toHaveAttribute(
      'title',
      'Web research requires Offline Mode to be disabled',
    );
  });
});
