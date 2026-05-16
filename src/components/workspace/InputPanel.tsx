import { useState, useCallback } from 'react';
import { TaskType } from '../../types';
import { useTask } from '../../context/TaskContext';
import { getTaskConfig } from '../../taskRouter';
import { estimateTokens, extractPDFText, extractAudio } from '../../fileHandler';
import FileUploadZone from '../ui/FileUploadZone';
import AudioRecorderWidget from '../ui/AudioRecorderWidget';
import WebcamCaptureComponent from '../ui/WebcamCapture';
import ThinkingModeToggle from '../ui/ThinkingModeToggle';
import PDFPageRangeSelector from '../ui/PDFPageRangeSelector';
import TokenEstimateDisplay from '../ui/TokenEstimateDisplay';
import ContextLimitWarning from '../ui/ContextLimitWarning';
import PrivacyNotice from '../ui/PrivacyNotice';
import { loadSettings } from '../../settingsStore';

const IMAGE_MIMES = new Set(['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif', 'image/bmp']);
const AUDIO_MIMES = new Set([
  'audio/webm', 'audio/wav', 'audio/x-wav', 'audio/mp3', 'audio/mpeg',
  'audio/ogg', 'audio/opus', 'audio/x-m4a', 'audio/m4a', 'audio/mp4',
  'audio/aac', 'audio/x-aac', 'audio/flac', 'audio/x-flac',
]);
const VIDEO_MIMES = new Set([
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v',
  'video/x-msvideo', 'video/x-matroska', 'video/avi',
]);
const TEXT_MIMES = new Set(['text/plain', 'text/markdown', 'text/html', 'text/csv']);

interface InputPanelProps {
  taskType: TaskType;
}

export default function InputPanel({ taskType }: InputPanelProps) {
  const config = getTaskConfig(taskType);
  const { taskInput, setInput, submitTask, lifecycle, enableThinking, setEnableThinking } = useTask();
  const [error, setError] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [pdfPageCount, setPdfPageCount] = useState<number>(0);
  const [pdfRange, setPdfRange] = useState<{ start: number; end: number }>({ start: 1, end: 50 });
  const [pdfTokenEstimate, setPdfTokenEstimate] = useState(0);

  const handleFile = useCallback(async (file: File, dataUrl: string) => {
    setInput({ file });
    setError(null);

    // Only set imageDataUrl for actual image files — prevents audio/PDF/text
    // data URLs from being sent as images to the model
    if (IMAGE_MIMES.has(file.type)) {
      setInput({ imageDataUrl: dataUrl });
    }

    // Extract audio from both audio files AND video files
    if (config.requiresAudio && (AUDIO_MIMES.has(file.type) || VIDEO_MIMES.has(file.type))) {
      try {
        setError('Extracting audio...');
        const pcm = await extractAudio(file);
        setInput({ audioData: pcm });
        setError(null);
      } catch {
        setError('Failed to extract audio from file. The file may not contain an audio track.');
      }
    }

    // Extract text from PDF files
    if (config.requiresPDF && file.type === 'application/pdf') {
      try {
        const result = await extractPDFText(file);
        setPdfPageCount(result.pageCount);
        const tokens = estimateTokens(result.text);
        setPdfTokenEstimate(tokens);
        if (result.pageCount <= 50) {
          setInput({ pdfText: result.text });
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to extract PDF text');
      }
    }

    // Extract content from text files for tasks that accept them
    if (TEXT_MIMES.has(file.type)) {
      try {
        const text = await file.text();
        if (config.requiresPDF) {
          // For PDF tasks that also accept text files, store as pdfText
          setInput({ pdfText: text });
        } else if (config.requiresText) {
          setInput({ text });
        }
      } catch {
        setError('Failed to read text file');
      }
    }
  }, [config.requiresPDF, config.requiresAudio, config.requiresText, setInput]);

  const handleAudio = useCallback((pcm: Float32Array) => {
    setInput({ audioData: pcm });
    setError(null);
  }, [setInput]);

  const handleFrame = useCallback((dataUrl: string) => {
    setInput({ imageDataUrl: dataUrl });
    setError(null);
  }, [setInput]);

  const handlePdfRange = useCallback((range: { start: number; end: number }) => {
    setPdfRange(range);
    if (taskInput.pdfText) {
      const tokens = estimateTokens(taskInput.pdfText);
      setPdfTokenEstimate(tokens);
    }
  }, [taskInput.pdfText]);

  const handleTextChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput({ text: e.target.value });
  }, [setInput]);

  const handleSubmit = useCallback(() => {
    if (config.requiresPDF && taskInput.file && pdfPageCount > 50) {
      extractPDFText(taskInput.file, pdfRange).then(result => {
        setInput({ pdfText: result.text });
        setTimeout(() => submitTask(), 100);
      }).catch(e => {
        setError(e instanceof Error ? e.message : 'Failed to extract PDF text');
      });
    } else {
      submitTask();
    }
  }, [config.requiresPDF, taskInput.file, pdfPageCount, pdfRange, setInput, submitTask]);

  const isDisabled = lifecycle === 'generating' || lifecycle === 'submitting';
  const settings = loadSettings();
  const isResearchOffline = settings.offlineMode && taskType === 'research';

  const isSubmitDisabled = isDisabled || isResearchOffline ||
    (config.requiresAudio && isRecording) ||
    (config.requiresAudio && !taskInput.audioData) ||
    // PDF+text tasks (pdf_qa, deep_doc_qa): need question input
    (config.requiresText && config.requiresPDF && !taskInput.question) ||
    // Text-only tasks: need text input
    (config.requiresText && !config.requiresPDF && !taskInput.text) ||
    // Mixed image+PDF tasks: need either image or PDF text
    (config.requiresImage && config.requiresPDF && !taskInput.imageDataUrl && !taskInput.pdfText) ||
    // Image-only tasks: need imageDataUrl
    (config.requiresImage && !config.requiresPDF && !taskInput.imageDataUrl) ||
    // PDF-only tasks: need pdfText or file
    (config.requiresPDF && !config.requiresImage && !taskInput.pdfText && !taskInput.file);

  const submitTitle = (config.requiresAudio && isRecording)
    ? 'Stop recording first'
    : isResearchOffline
      ? 'Web research requires Offline Mode to be disabled'
      : undefined;

  return (
    <div className="bg-[#0A2540]/50 rounded-xl p-4 md:p-6 space-y-3 md:space-y-4">
      <h3 className="text-xs md:text-sm font-medium text-gray-400">Input</h3>

      {error && (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg px-3 py-2 text-red-400 text-sm" role="alert">
          {error}
        </div>
      )}

      {config.requiresImage && (
        <FileUploadZone taskType={taskType} onFile={handleFile} onError={setError} preview={taskInput.imageDataUrl} />
      )}

      {config.requiresAudio && (
        <div className="space-y-3">
          <FileUploadZone taskType={taskType} onFile={handleFile} onError={setError} />
          <AudioRecorderWidget onAudio={handleAudio} onError={setError} onRecordingChange={setIsRecording} />
        </div>
      )}

      {config.requiresPDF && (
        <div className="space-y-3">
          <FileUploadZone taskType={taskType} onFile={handleFile} onError={setError} />
          {pdfPageCount > 50 && (
            <PDFPageRangeSelector pageCount={pdfPageCount} onChange={handlePdfRange} tokenEstimate={pdfTokenEstimate} />
          )}
          {pdfTokenEstimate > 0 && pdfPageCount <= 50 && (
            <TokenEstimateDisplay tokenCount={pdfTokenEstimate} />
          )}
          <ContextLimitWarning tokenCount={pdfTokenEstimate} pageCount={pdfPageCount} />
        </div>
      )}

      {config.requiresText && config.requiresPDF && (
        <input
          type="text"
          value={taskInput.question ?? ''}
          onChange={(e) => setInput({ question: e.target.value })}
          placeholder="Enter your question..."
          className="w-full bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:border-[#00D4FF] focus:outline-none"
          aria-label="Question"
        />
      )}

      {config.requiresText && !config.requiresPDF && (
        <textarea
          value={taskInput.text ?? ''}
          onChange={handleTextChange}
          placeholder="Enter your text here..."
          className="w-full min-h-[100px] md:min-h-[120px] bg-white/5 border border-white/20 rounded-xl p-3 md:p-4 text-sm text-white placeholder-gray-500 focus:border-[#00D4FF] focus:outline-none resize-y"
          aria-label="Task input"
        />
      )}

      {config.supportsWebcam && (
        <WebcamCaptureComponent onFrame={handleFrame} onError={setError} />
      )}

      {config.supportsThinkingMode && (
        <ThinkingModeToggle enabled={enableThinking} onChange={setEnableThinking} />
      )}

      {config.requiresPrivacyNotice && (
        <PrivacyNotice taskType={taskType} />
      )}

      <button
        onClick={handleSubmit}
        disabled={isSubmitDisabled}
        className={`w-full py-3 md:py-3.5 rounded-xl font-medium transition-colors min-h-[44px] flex items-center justify-center gap-2 ${
          isSubmitDisabled
            ? 'bg-white/5 text-gray-500 cursor-not-allowed'
            : 'bg-[#00D4FF] text-[#061220] hover:brightness-110'
        }`}
        aria-label="Run task"
        title={submitTitle}
      >
        {lifecycle === 'submitting' && (
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        )}
        {lifecycle === 'submitting' ? 'Processing...' : lifecycle === 'generating' ? 'Running...' : 'Run Task'}
      </button>
    </div>
  );
}
