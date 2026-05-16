import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { TaskType, TaskLifecycle, TaskEntry, TaskConfig } from '../types';
import { useModel } from './ModelContext';
import { getTaskConfig, buildTaskMessages, getTokenBudget } from '../taskRouter';
import { parseJSON, extractText } from '../outputParser';
import { addEntry } from '../historyStore';
import { validate, readAsDataURL, extractPDFText } from '../fileHandler';
import { loadSettings } from '../settingsStore';
import { search, fetchMultiple, McpAuthError, McpNetworkError } from '../mcpClient';
import { chunkDocument, needsChunking, estimateTokens } from '../documentChunker';

export interface TaskInput {
  text?: string;
  file?: File;
  imageDataUrl?: string;
  audioData?: Float32Array;
  pdfText?: string;
  pdfPageCount?: number;
  secondFile?: File;
  question?: string;
  tone?: string;
  language?: string;
}

interface TaskContextValue {
  activeTask: TaskType | null;
  taskInput: TaskInput;
  lifecycle: TaskLifecycle;
  streamingOutput: string;
  finalOutput: string;
  parsedOutput: unknown;
  enableThinking: boolean;
  error: string | null;
  tokenCount: number | null;
  tps: number | null;
  chunkProgress: { current: number; total: number } | null;
  selectTask: (taskType: TaskType | null) => void;
  setInput: (partial: Partial<TaskInput>) => void;
  submitTask: () => Promise<void>;
  cancelTask: () => void;
  clearOutput: () => void;
  setEnableThinking: (v: boolean) => void;
}

const TaskContext = createContext<TaskContextValue | null>(null);

export function useTask(): TaskContextValue {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('useTask must be used within TaskProvider');
  return ctx;
}

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { workerRef, state } = useModel();
  const [activeTask, setActiveTask] = useState<TaskType | null>(null);
  const [taskInput, setTaskInput] = useState<TaskInput>({});
  const [lifecycle, setLifecycle] = useState<TaskLifecycle>('idle');
  const [streamingOutput, setStreamingOutput] = useState('');
  const [finalOutput, setFinalOutput] = useState('');
  const [parsedOutput, setParsedOutput] = useState<unknown>(undefined);
  const [enableThinking, setEnableThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState<number | null>(null);
  const [tps, setTps] = useState<number | null>(null);
  const passOneOutput = useRef<string | null>(null);
  
  // Chunk processing state for large documents
  const [chunkProgress, setChunkProgress] = useState<{ current: number; total: number } | null>(null);
  const chunkResultsRef = useRef<string[]>([]);
  const totalChunksRef = useRef<number>(0);

  const selectTask = useCallback((taskType: TaskType | null) => {
    setActiveTask(taskType);
    setTaskInput({});
    setLifecycle('idle');
    setStreamingOutput('');
    setFinalOutput('');
    setParsedOutput(undefined);
    setError(null);
    setTokenCount(null);
    setTps(null);
    passOneOutput.current = null;
    if (taskType) {
      const config = getTaskConfig(taskType);
      setEnableThinking(config.enableThinkingByDefault);
    }
  }, []);

  const setInput = useCallback((partial: Partial<TaskInput>) => {
    setTaskInput(prev => ({ ...prev, ...partial }));
  }, []);

  const cancelTask = useCallback(() => {
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'cancel_task' });
    }
    setLifecycle('complete');
  }, [workerRef]);

  const clearOutput = useCallback(() => {
    setStreamingOutput('');
    setFinalOutput('');
    setParsedOutput(undefined);
    setError(null);
    setTokenCount(null);
    setTps(null);
    passOneOutput.current = null;
    chunkResultsRef.current = [];
    totalChunksRef.current = 0;
    setChunkProgress(null);
  }, []);

  // Process document in chunks for large files
  const processChunks = useCallback(async (
    chunks: Array<{ index: number; total: number; text: string; tokenEstimate: number }>,
    config: TaskConfig,
    settings: { offlineMode: boolean; thinkingModeDefault: boolean; theme: string },
    imageDataUrl: string | undefined,
    audioData: Float32Array | undefined,
    searchResults: string,
    pageContent: string
  ) => {
    const allResults: string[] = [];
    let totalTokens = 0;
    let totalTps = 0;

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      console.log('[TaskContext] Processing chunk', i + 1, 'of', chunks.length);
      setChunkProgress({ current: i + 1, total: chunks.length });
      setStreamingOutput('');

      // Build prompt for this chunk
      const chunkPrompt = `Analyze the following section of the document (part ${i + 1} of ${chunks.length}):\n\n${chunk.text}\n\nProvide your analysis for this section only.`;

      const messages = buildTaskMessages(activeTask!, {
        text: chunkPrompt,
        imageDataUrl,
        audioData,
        searchResults,
        pageContent,
      }, {
        enableThinking: enableThinking || settings.thinkingModeDefault,
      });

      const taskId = crypto.randomUUID();
      const timeoutId = setTimeout(() => {
        setError('Model timeout on chunk ' + (i + 1) + '. Try reloading.');
        setLifecycle('error');
      }, 60000); // Longer timeout for chunks

      const chunkResult = await new Promise<string>((resolve, reject) => {
        const onChunkMessage = (event: MessageEvent) => {
          const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;
          if (msgTaskId !== taskId) return;

          if (status === 'task_update') {
            setStreamingOutput(prev => prev + (output ?? ''));
          }

          if (status === 'task_complete') {
            clearTimeout(timeoutId);
            workerRef.current?.removeEventListener('message', onChunkMessage);
            totalTokens += numTokens ?? 0;
            totalTps += newTps ?? 0;
            resolve(output ?? '');
          }

          if (status === 'task_error') {
            clearTimeout(timeoutId);
            workerRef.current?.removeEventListener('message', onChunkMessage);
            reject(new Error(event.data.data ?? 'Chunk failed'));
          }
        };

        workerRef.current?.addEventListener('message', onChunkMessage);
        workerRef.current?.postMessage({
          type: 'task',
          data: {
            taskId,
            taskType: activeTask!,
            messages,
            enableThinking: enableThinking || settings.thinkingModeDefault,
            maxNewTokens: getTokenBudget(activeTask!),
            pass: 1,
          },
        });
      });

      allResults.push(chunkResult);
    }

    // Final synthesis pass: combine all chunk analyses
    console.log('[TaskContext] All chunks processed, synthesizing final result');
    setChunkProgress(null);
    setStreamingOutput('');

    const combinedText = allResults.map((r, i) => `=== Section ${i + 1} Analysis ===\n${r}`).join('\n\n');
    const synthesisPrompt = `Based on the following section-by-section analyses of the document, provide a comprehensive final analysis that combines all findings:\n\n${combinedText}\n\nProvide the final unified analysis.`;

    const synthesisMessages = buildTaskMessages(activeTask!, {
      text: synthesisPrompt,
    }, {
      enableThinking: enableThinking || settings.thinkingModeDefault,
    });

    const synthesisTaskId = crypto.randomUUID();
    const synthesisTimeoutId = setTimeout(() => {
      setError('Model timeout during synthesis. Try reloading.');
      setLifecycle('error');
    }, 60000);

    const onSynthesisMessage = (event: MessageEvent) => {
      const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;
      if (msgTaskId !== synthesisTaskId) return;

      if (status === 'task_update') {
        setStreamingOutput(prev => prev + (output ?? ''));
      }

      if (status === 'task_complete') {
        clearTimeout(synthesisTimeoutId);
        workerRef.current?.removeEventListener('message', onSynthesisMessage);
        
        // Inline finalization logic
        let finalOutput = output ?? '';
        let parsed: unknown = undefined;
        if (config.outputFormat === 'json') {
          const result = parseJSON(finalOutput);
          if (!('error' in result)) {
            parsed = result;
          }
        } else {
          finalOutput = extractText(finalOutput);
        }
        setFinalOutput(finalOutput);
        setParsedOutput(parsed);
        setTokenCount(totalTokens + (numTokens ?? 0));
        setTps(totalTps > 0 ? totalTps / allResults.length : (newTps ?? 0));
        setLifecycle('complete');
      }

      if (status === 'task_error') {
        clearTimeout(synthesisTimeoutId);
        workerRef.current?.removeEventListener('message', onSynthesisMessage);
        setError(event.data.data ?? 'Synthesis failed');
        setLifecycle('error');
      }
    };

    workerRef.current?.addEventListener('message', onSynthesisMessage);
    workerRef.current?.postMessage({
      type: 'task',
      data: {
        taskId: synthesisTaskId,
        taskType: activeTask!,
        messages: synthesisMessages,
        enableThinking: enableThinking || settings.thinkingModeDefault,
        maxNewTokens: getTokenBudget(activeTask!),
        pass: 1,
      },
    });
  }, [activeTask, enableThinking, workerRef]);

  const submitTask = useCallback(async () => {
    console.log('[TaskContext] submitTask called', { activeTask, lifecycle, stage: state.stage });
    if (!activeTask || !workerRef.current || state.stage !== 'ready') {
      console.warn('[TaskContext] submitTask blocked:', { activeTask, hasWorker: !!workerRef.current, stage: state.stage });
      return;
    }

    const config = getTaskConfig(activeTask);
    const settings = loadSettings();

    if (taskInput.file) {
      const validation = validate(taskInput.file, activeTask);
      if (!validation.accepted) {
        console.error('[TaskContext] File validation failed:', validation.error);
        setError(validation.error ?? 'File validation failed');
        return;
      }
    }

    console.log('[TaskContext] Setting lifecycle to submitting');
    setLifecycle('submitting');
    setStreamingOutput('');
    setFinalOutput('');
    setParsedOutput(undefined);
    setError(null);
    setTokenCount(null);
    setTps(null);

    let pdfText = taskInput.pdfText;
    let pdfPageCount = taskInput.pdfPageCount;

    if (taskInput.file && config.requiresPDF && !pdfText) {
      console.log('[TaskContext] Extracting PDF text from:', taskInput.file.name);
      try {
        const result = await extractPDFText(taskInput.file);
        console.log('[TaskContext] PDF extraction complete:', { pageCount: result.pageCount, textLength: result.text.length });
        pdfText = result.text;
        pdfPageCount = result.pageCount;
      } catch (e) {
        console.error('[TaskContext] PDF extraction failed:', e);
        setError(e instanceof Error ? e.message : 'Failed to extract PDF text');
        setLifecycle('error');
        return;
      }
    }

    // Smart chunking for large documents instead of truncation
    const MAX_CHUNK_TOKENS = 2500;
    const chunks = pdfText && needsChunking(pdfText, MAX_CHUNK_TOKENS)
      ? chunkDocument(pdfText, MAX_CHUNK_TOKENS)
      : null;

    if (chunks && chunks.length > 1) {
      console.log('[TaskContext] Document chunked into', chunks.length, 'parts');
      totalChunksRef.current = chunks.length;
      chunkResultsRef.current = [];
    }

    let imageDataUrl = taskInput.imageDataUrl;
    // Only convert file to data URL for actual image files, not PDFs
    if (taskInput.file && config.requiresImage && !imageDataUrl && taskInput.file.type.startsWith('image/')) {
      try {
        imageDataUrl = await readAsDataURL(taskInput.file);
      } catch {
        setError('Failed to read image file');
        setLifecycle('error');
        return;
      }
    }

    let audioData = taskInput.audioData;

    // Research task: fetch live web results before building messages
    let searchResults = '';
    let pageContent = '';
    if (activeTask === 'research') {
      try {
        const results = await search(taskInput.text ?? '');
        searchResults = results.map((r, i) => `[${i + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n\n');
        const urls = results.slice(0, 3).map(r => r.url);
        if (urls.length > 0) {
          const contents = await fetchMultiple(urls);
          pageContent = contents.filter(c => c).join('\n\n---\n\n');
        }
      } catch (err) {
        if (err instanceof McpAuthError) {
          setError('Web search API key is invalid. Please reconnect in Settings.');
          setLifecycle('error');
          return;
        }
        // Network error — continue with empty search results (model knowledge fallback)
        searchResults = '(Search unavailable — using model knowledge)';
        pageContent = '';
      }
    }

    console.log('[TaskContext] Building messages and sending to worker');

    // Handle chunked document processing
    if (chunks && chunks.length > 1) {
      console.log('[TaskContext] Starting chunked processing:', chunks.length, 'chunks');
      setChunkProgress({ current: 1, total: chunks.length });
      await processChunks(chunks, config, settings, imageDataUrl, audioData, searchResults, pageContent);
      return;
    }

    // Standard single-pass processing
    const messages = buildTaskMessages(activeTask, {
      text: taskInput.text,
      imageDataUrl,
      audioData,
      pdfText,
      question: taskInput.question,
      tone: taskInput.tone,
      language: taskInput.language,
      searchResults,
      pageContent,
    }, {
      enableThinking: enableThinking || settings.thinkingModeDefault,
      passOneOutput: passOneOutput.current ?? undefined,
    });

    console.log('[TaskContext] Messages built:', messages.length, 'parts');

    const taskId = crypto.randomUUID();
    const isPass2 = passOneOutput.current !== null;

    // Timeout: if worker doesn't respond within 30s, show error
    const timeoutId = setTimeout(() => {
      console.error('[TaskContext] Task timeout after 30s');
      setError('Model is not responding. Try reloading the page.');
      setLifecycle('error');
      workerRef.current?.removeEventListener('message', onMessage);
    }, 30000);

    console.log('[TaskContext] Posting task to worker:', { taskId, taskType: activeTask, pass: isPass2 ? 2 : 1 });
    workerRef.current.postMessage({
      type: 'task',
      data: {
        taskId,
        taskType: activeTask,
        messages,
        enableThinking: enableThinking || settings.thinkingModeDefault,
        maxNewTokens: getTokenBudget(activeTask),
        pass: isPass2 ? 2 : 1,
        passOneOutput: passOneOutput.current ?? undefined,
      },
    });

    console.log('[TaskContext] Setting lifecycle to generating');
    setLifecycle('generating');

    const onMessage = (event: MessageEvent) => {
      const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;
      console.log('[TaskContext] Worker message:', { status, taskId: msgTaskId, expectedTaskId: taskId });

      if (msgTaskId !== taskId) return;

      clearTimeout(timeoutId);

      if (status === 'task_update') {
        console.log('[TaskContext] task_update, output length:', output?.length ?? 0);
        setStreamingOutput(prev => prev + (output ?? ''));
      }

      if (status === 'task_pass1_complete') {
        console.log('[TaskContext] task_pass1_complete');
        passOneOutput.current = output ?? '';
        workerRef.current?.removeEventListener('message', onMessage);
        clearTimeout(timeoutId);

        const pass2Messages = buildTaskMessages(activeTask, {
          text: taskInput.text,
          imageDataUrl,
          audioData,
          pdfText,
        }, {
          enableThinking: enableThinking || settings.thinkingModeDefault,
          passOneOutput: passOneOutput.current,
        });

        const pass2TaskId = crypto.randomUUID();

        // New timeout for pass2
        const pass2TimeoutId = setTimeout(() => {
          setError('Model is not responding during pass 2. Try reloading the page.');
          setLifecycle('error');
          workerRef.current?.removeEventListener('message', onPass2Message);
        }, 30000);

        workerRef.current?.postMessage({
          type: 'task',
          data: {
            taskId: pass2TaskId,
            taskType: activeTask,
            messages: pass2Messages,
            enableThinking: enableThinking || settings.thinkingModeDefault,
            maxNewTokens: getTokenBudget(activeTask),
            pass: 2,
          },
        });

        const onPass2Message = (e: MessageEvent) => {
          const { status: s2, output: o2, numTokens: n2, tps: t2, taskId: t2id } = e.data;
          if (t2id !== pass2TaskId) return;

          if (s2 === 'task_update') {
            setStreamingOutput(prev => prev + (o2 ?? ''));
          }

          if (s2 === 'task_complete') {
            clearTimeout(pass2TimeoutId);
            workerRef.current?.removeEventListener('message', onPass2Message);
            finalizeOutput(o2 ?? streamingOutput, activeTask, config, n2 ?? 0, t2 ?? 0);
          }

          if (s2 === 'task_error') {
            clearTimeout(pass2TimeoutId);
            workerRef.current?.removeEventListener('message', onPass2Message);
            setError(e.data.data ?? 'Task failed');
            setLifecycle('error');
          }
        };

        workerRef.current?.addEventListener('message', onPass2Message);
        return;
      }

      if (status === 'task_complete') {
        console.log('[TaskContext] task_complete', { numTokens, tps: newTps });
        clearTimeout(timeoutId);
        workerRef.current?.removeEventListener('message', onMessage);
        finalizeOutput(output ?? streamingOutput, activeTask, config, numTokens ?? 0, newTps ?? 0);
      }

      if (status === 'task_error') {
        console.error('[TaskContext] task_error:', event.data.data);
        clearTimeout(timeoutId);
        workerRef.current?.removeEventListener('message', onMessage);
        setError(event.data.data ?? 'Task failed');
        setLifecycle('error');
      }
    };

    console.log('[TaskContext] Adding message listener');
    workerRef.current.addEventListener('message', onMessage);
  }, [activeTask, taskInput, enableThinking, workerRef, state.stage, streamingOutput]);

  const finalizeOutput = useCallback((rawOutput: string, taskType: TaskType, config: TaskConfig, numTokens: number, taskTps: number) => {
    let output = rawOutput;
    let parsed: unknown = undefined;

    if (config.outputFormat === 'json') {
      const result = parseJSON(rawOutput);
      if ('error' in result) {
        output = rawOutput;
      } else {
        parsed = result;
      }
    } else {
      output = extractText(rawOutput);
    }

    setFinalOutput(output);
    setParsedOutput(parsed);
    setTokenCount(numTokens);
    setTps(taskTps);
    setLifecycle('complete');

    const entry: TaskEntry = {
      id: crypto.randomUUID(),
      type: taskType,
      category: config.category,
      inputSummary: taskInput.text?.slice(0, 200) ?? taskInput.file?.name ?? '',
      output,
      parsedOutput: parsed,
      status: 'complete',
      timestamp: new Date().toISOString(),
      durationMs: 0,
      tokenCount: numTokens,
      tps: taskTps,
    };

    addEntry(entry).catch(() => {});
  }, [taskInput]);

  return (
    <TaskContext.Provider value={{
      activeTask,
      taskInput,
      lifecycle,
      streamingOutput,
      finalOutput,
      parsedOutput,
      enableThinking,
      error,
      tokenCount,
      tps,
      chunkProgress,
      selectTask,
      setInput,
      submitTask,
      cancelTask,
      clearOutput,
      setEnableThinking,
    }}>
      {children}
    </TaskContext.Provider>
  );
}
