# Bugfix Requirements Document

## Introduction

In the audio task workspace (e.g. meeting transcription), the "Run Task" button is incorrectly enabled while a recording is actively in progress. The `isSubmitDisabled` logic in `InputPanel.tsx` only checks whether `taskInput.audioData` is absent, but does not account for the `isRecording` state managed internally by `AudioRecorderWidget`. This means a user can click "Run Task" mid-recording — before the audio buffer has been captured and saved — leading to a task submission with no audio data or stale/empty audio data.

The fix requires `AudioRecorderWidget` to expose its `isRecording` state upward so `InputPanel` can factor it into the submit-disabled logic.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user starts a recording (clicks Record) and the recording is actively in progress (`isRecording = true` in `AudioRecorderWidget`) THEN the system displays the "Run Task" button as enabled and clickable

1.2 WHEN a user clicks "Run Task" while a recording is in progress THEN the system submits the task without a complete audio buffer (since `onAudio` has not yet fired and `taskInput.audioData` is not yet populated)

### Expected Behavior (Correct)

2.1 WHEN a recording is actively in progress (`isRecording = true`) THEN the system SHALL disable the "Run Task" button and display a tooltip hint such as "Stop recording first"

2.2 WHEN the user stops the recording and the `onAudio` callback fires (populating `taskInput.audioData`) THEN the system SHALL enable the "Run Task" button

### Unchanged Behavior (Regression Prevention)

3.1 WHEN no recording has been started and no audio file has been uploaded THEN the system SHALL CONTINUE TO keep the "Run Task" button disabled (existing `!taskInput.audioData` guard)

3.2 WHEN a recording has been completed and `taskInput.audioData` is populated THEN the system SHALL CONTINUE TO enable the "Run Task" button normally

3.3 WHEN the user is on a non-audio task workspace (image, text, PDF, research) THEN the system SHALL CONTINUE TO apply the existing submit-disabled logic unchanged

3.4 WHEN a user uploads an audio file via `FileUploadZone` (instead of recording) THEN the system SHALL CONTINUE TO enable the "Run Task" button once the file is loaded
