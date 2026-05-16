import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { TaskType, TaskLifecycle, TaskEntry, TaskConfig } from '../types';
import { useModel } from './ModelContext';
import { getTaskConfig, buildTaskMessages, getTokenBudget } from '../taskRouter';
import { parseJSON, extractText } from '../outputParser';
import { addEntry } from '../historyStore';
import { validate, readAsDataURL, extractPDFText } from '../fileHandler';
import { loadSettings } from '../settingsStore';
import { search, fetchMultiple, McpAuthError, McpNetworkError } from '../mcpClient';

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
  }, []);

  const submitTask = useCallback(async () => {
    if (!activeTask || !workerRef.current || state.stage !== 'ready') return;

    const config = getTaskConfig(activeTask);
    const settings = loadSettings();

    if (taskInput.file) {
      const validation = validate(taskInput.file, activeTask);
      if (!validation.accepted) {
        setError(validation.error ?? 'File validation failed');
        return;
      }
    }

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
      try {
        const result = await extractPDFText(taskInput.file);
        pdfText = result.text;
        pdfPageCount = result.pageCount;
      } catch (e) {
        setError('Failed to extract PDF text');
        setLifecycle('error');
        return;
      }
    }

    let imageDataUrl = taskInput.imageDataUrl;
    if (taskInput.file && config.requiresImage && !imageDataUrl) {
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

    const taskId = crypto.randomUUID();
    const isPass2 = passOneOutput.current !== null;

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

    setLifecycle('generating');

    const onMessage = (event: MessageEvent) => {
      const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;

      if (msgTaskId !== taskId) return;

      if (status === 'task_update') {
        setStreamingOutput(prev => prev + (output ?? ''));
      }

      if (status === 'task_pass1_complete') {
        passOneOutput.current = output ?? '';
        workerRef.current?.removeEventListener('message', onMessage);

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
            workerRef.current?.removeEventListener('message', onPass2Message);
            finalizeOutput(o2 ?? streamingOutput, activeTask, config, n2 ?? 0, t2 ?? 0);
          }

          if (s2 === 'task_error') {
            workerRef.current?.removeEventListener('message', onPass2Message);
            setError(e.data.data ?? 'Task failed');
            setLifecycle('error');
          }
        };

        workerRef.current?.addEventListener('message', onPass2Message);
        return;
      }

      if (status === 'task_complete') {
        workerRef.current?.removeEventListener('message', onMessage);
        finalizeOutput(output ?? streamingOutput, activeTask, config, numTokens ?? 0, newTps ?? 0);
      }

      if (status === 'task_error') {
        workerRef.current?.removeEventListener('message', onMessage);
        setError(event.data.data ?? 'Task failed');
        setLifecycle('error');
      }
    };

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
