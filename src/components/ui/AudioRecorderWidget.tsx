import { useState, useRef, useCallback, useEffect } from 'react';
import { AudioRecorder } from '../../audioRecorder';

interface AudioRecorderWidgetProps {
  onAudio: (pcm: Float32Array) => void;
  onError: (msg: string) => void;
  onRecordingChange?: (recording: boolean) => void;
}

export default function AudioRecorderWidget({ onAudio, onError, onRecordingChange }: AudioRecorderWidgetProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [level, setLevel] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const recorderRef = useRef<AudioRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    recorderRef.current = new AudioRecorder();
    recorderRef.current.setOnWarning(() => setShowWarning(true));
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = window.setInterval(() => {
        setElapsed(recorderRef.current?.getElapsedSeconds() ?? 0);
        setLevel(recorderRef.current?.getLevel() ?? 0);
      }, 100);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  const startRecording = useCallback(async () => {
    try {
      await recorderRef.current?.start();
      setIsRecording(true);
      onRecordingChange?.(true);
      setIsPaused(false);
      setElapsed(0);
      setShowWarning(false);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to start recording');
    }
  }, [onError, onRecordingChange]);

  const pauseRecording = useCallback(() => {
    recorderRef.current?.pause();
    setIsPaused(true);
  }, []);

  const resumeRecording = useCallback(() => {
    recorderRef.current?.resume();
    setIsPaused(false);
  }, []);

  const stopRecording = useCallback(async () => {
    setIsRecording(false);
    onRecordingChange?.(false);
    setIsPaused(false);
    try {
      const pcm = await recorderRef.current?.stop();
      if (pcm) onAudio(pcm);
    } catch (e) {
      onError(e instanceof Error ? e.message : 'Failed to stop recording');
    }
  }, [onAudio, onError, onRecordingChange]);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  if (!isRecording) {
    return (
      <button
        onClick={startRecording}
        className="flex items-center gap-2 px-4 py-2.5 bg-[#00D4FF] text-[#061220] rounded-lg font-medium hover:brightness-110 transition-colors min-h-[44px]"
        aria-label="Start recording"
      >
        <span className="material-symbols-outlined">mic</span>
        Record
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {showWarning && (
        <div className="text-amber-400 text-sm bg-amber-900/20 px-3 py-2 rounded-lg">
          Recording will stop at 30 minutes.
        </div>
      )}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#00D4FF] transition-all duration-100"
            style={{ width: `${level * 100}%` }}
          />
        </div>
        <span className="text-sm font-mono text-gray-400">{formatTime(elapsed)}</span>
      </div>
      <div className="flex gap-2">
        {!isPaused ? (
          <button onClick={pauseRecording} className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] flex items-center justify-center" aria-label="Pause recording">
            <span className="material-symbols-outlined text-sm">pause</span>
          </button>
        ) : (
          <button onClick={resumeRecording} className="px-3 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors min-h-[44px] flex items-center justify-center" aria-label="Resume recording">
            <span className="material-symbols-outlined text-sm">play_arrow</span>
          </button>
        )}
        <button onClick={stopRecording} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors min-h-[44px] flex items-center justify-center" aria-label="Stop recording">
          <span className="material-symbols-outlined text-sm">stop</span>
        </button>
      </div>
    </div>
  );
}
