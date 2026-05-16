import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { TaskType, PipelineTemplate, PipelineRun, PipelineStepRun, PipelineLifecycle, StepStatus } from '../types';
import { useModel } from './ModelContext';
import { getTaskConfig, buildTaskMessages, getTokenBudget } from '../taskRouter';
import { parseJSON, extractText } from '../outputParser';
import { validate, readAsDataURL, extractPDFText } from '../fileHandler';
import { search, fetchMultiple, McpAuthError, McpNetworkError } from '../mcpClient';
import { addEntry } from '../historyStore';

export interface PipelineInput {
  files: File[];
  text?: string;
  imageDataUrl?: string;
  audioData?: Float32Array;
  pdfText?: string;
  pdfPageCount?: number;
}

interface PipelineContextValue {
  activeTemplate: PipelineTemplate | null;
  run: PipelineRun | null;
  streamingOutput: string;
  tps: number | null;
  loadTemplate: (template: PipelineTemplate) => void;
  setPipelineInput: (input: Partial<PipelineInput>) => void;
  runPipeline: () => Promise<void>;
  cancelPipeline: () => void;
  retryStep: (stepIndex: number) => Promise<void>;
  skipStep: (stepIndex: number) => void;
  resetPipeline: () => void;
}

const PipelineContext = createContext<PipelineContextValue | null>(null);

export function usePipeline(): PipelineContextValue {
  const ctx = useContext(PipelineContext);
  if (!ctx) throw new Error('usePipeline must be used within PipelineProvider');
  return ctx;
}

export function PipelineProvider({ children }: { children: React.ReactNode }) {
  const { workerRef, state } = useModel();
  const [activeTemplate, setActiveTemplate] = useState<PipelineTemplate | null>(null);
  const [pipelineInput, setPipelineInputState] = useState<PipelineInput>({ files: [] });
  const [run, setRun] = useState<PipelineRun | null>(null);
  const [streamingOutput, setStreamingOutput] = useState('');
  const [tps, setTps] = useState<number | null>(null);
  const cancelledRef = useRef(false);
  const stepOutputsRef = useRef<Array<{ text: string; parsed?: unknown }>>([]);

  const loadTemplate = useCallback((template: PipelineTemplate) => {
    setActiveTemplate(template);
    setPipelineInputState({ files: [] });
    setRun(null);
    setStreamingOutput('');
    setTps(null);
    cancelledRef.current = false;
    stepOutputsRef.current = [];
  }, []);

  const setPipelineInput = useCallback((partial: Partial<PipelineInput>) => {
    setPipelineInputState(prev => ({ ...prev, ...partial }));
  }, []);

  const resetPipeline = useCallback(() => {
    setActiveTemplate(null);
    setPipelineInputState({ files: [] });
    setRun(null);
    setStreamingOutput('');
    setTps(null);
    cancelledRef.current = false;
    stepOutputsRef.current = [];
  }, []);

  const cancelPipeline = useCallback(() => {
    cancelledRef.current = true;
    if (workerRef.current) {
      workerRef.current.postMessage({ type: 'cancel_task' });
    }
  }, [workerRef]);

  const buildStepInput = useCallback(
    (stepIndex: number): Parameters<typeof buildTaskMessages>[1] => {
      if (!activeTemplate) return {};

      const step = activeTemplate.steps[stepIndex];
      const prevOutput = stepOutputsRef.current[stepIndex - 1] ?? null;

      if (!prevOutput || stepIndex === 0) {
        return {
          text: pipelineInput.text,
          imageDataUrl: pipelineInput.imageDataUrl,
          audioData: pipelineInput.audioData,
          pdfText: pipelineInput.pdfText,
        };
      }

      const baseInput: Parameters<typeof buildTaskMessages>[1] = {};

      switch (step.inputMapping.type) {
        case 'text': {
          const field = step.inputMapping.field ?? 'text';
          (baseInput as Record<string, unknown>)[field] = prevOutput.text;
          break;
        }
        case 'parsed_json':
          baseInput.text = prevOutput.parsed ? JSON.stringify(prevOutput.parsed, null, 2) : prevOutput.text;
          break;
        case 'raw_output':
          baseInput.text = prevOutput.text;
          break;
        case 'file':
          baseInput.imageDataUrl = pipelineInput.imageDataUrl;
          break;
        case 'combined': {
          const fields = step.inputMapping.fields ?? ['text'];
          for (const field of fields) {
            if (field === 'text') baseInput.text = prevOutput.text;
            else if (field === 'pdfText') baseInput.pdfText = prevOutput.text;
            else if (field === 'imageDataUrl') baseInput.imageDataUrl = pipelineInput.imageDataUrl;
          }
          break;
        }
      }

      if (pipelineInput.imageDataUrl && !baseInput.imageDataUrl) {
        baseInput.imageDataUrl = pipelineInput.imageDataUrl;
      }
      if (pipelineInput.audioData) {
        baseInput.audioData = pipelineInput.audioData;
      }
      if (pipelineInput.pdfText) {
        baseInput.pdfText = pipelineInput.pdfText;
      }

      return baseInput;
    },
    [activeTemplate, pipelineInput]
  );

  const executeStep = useCallback(
    async (
      stepIndex: number,
      taskId: string
    ): Promise<{ output: string; parsed?: unknown; tokenCount: number; tps: number }> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current || !activeTemplate) {
          reject(new Error('Worker or template not available'));
          return;
        }

        const step = activeTemplate.steps[stepIndex];
        const config = getTaskConfig(step.taskType);
        const stepInput = buildStepInput(stepIndex);

        const messages = buildTaskMessages(step.taskType, stepInput, {
          pipelineContext: {
            previousOutputs: stepOutputsRef.current.slice(0, stepIndex),
            currentStepIndex: stepIndex,
          },
        });

        const onMessage = (event: MessageEvent) => {
          const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;
          if (msgTaskId !== taskId) return;

          if (status === 'task_update') {
            setStreamingOutput(prev => prev + (output ?? ''));
          }

          if (status === 'task_complete') {
            workerRef.current?.removeEventListener('message', onMessage);
            const rawOutput = output ?? '';
            let parsed: unknown = undefined;
            let finalOutput = rawOutput;

            if (config.outputFormat === 'json') {
              const result = parseJSON(rawOutput);
              if (!('error' in result)) {
                parsed = result;
              }
            } else {
              finalOutput = extractText(rawOutput);
            }

            resolve({ output: finalOutput, parsed, tokenCount: numTokens ?? 0, tps: newTps ?? 0 });
          }

          if (status === 'task_error') {
            workerRef.current?.removeEventListener('message', onMessage);
            reject(new Error(event.data.data ?? 'Task failed'));
          }
        };

        workerRef.current.addEventListener('message', onMessage);

        workerRef.current.postMessage({
          type: 'task',
          data: {
            taskId,
            taskType: step.taskType,
            messages,
            enableThinking: config.enableThinkingByDefault,
            maxNewTokens: getTokenBudget(step.taskType),
            pass: 1,
          },
        });
      });
    },
    [workerRef, activeTemplate, buildStepInput]
  );

  const finalizeStepOutput = useCallback(
    (stepIndex: number, output: string, parsed?: unknown, tokenCount?: number, taskTps?: number) => {
      if (!activeTemplate) return;
      const step = activeTemplate.steps[stepIndex];
      stepOutputsRef.current[stepIndex] = { text: output, parsed };

      setRun(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          status: 'complete',
          output,
          parsedOutput: parsed,
          tokenCount,
          tps: taskTps,
          durationMs: Date.now() - (updatedSteps[stepIndex].durationMs ? 0 : Date.now()),
        };
        return {
          ...prev,
          steps: updatedSteps,
          totalTokens: prev.totalTokens + (tokenCount ?? 0),
        };
      });
    },
    [activeTemplate]
  );

  const runPipeline = useCallback(async () => {
    if (!activeTemplate || !workerRef.current || state.stage !== 'ready') return;

    cancelledRef.current = false;
    stepOutputsRef.current = [];
    setStreamingOutput('');
    setTps(null);

    const steps: PipelineStepRun[] = activeTemplate.steps.map((step, i) => ({
      stepIndex: i,
      taskType: step.taskType,
      label: step.label ?? getTaskConfig(step.taskType).label,
      status: 'pending' as StepStatus,
      input: {},
    }));

    const pipelineRun: PipelineRun = {
      id: crypto.randomUUID(),
      templateId: activeTemplate.id,
      templateName: activeTemplate.name,
      steps,
      status: 'running',
      currentStepIndex: 0,
      startedAt: new Date().toISOString(),
      totalTokens: 0,
      totalDurationMs: 0,
    };

    setRun(pipelineRun);

    const startedAt = Date.now();

    for (let i = 0; i < activeTemplate.steps.length; i++) {
      if (cancelledRef.current) {
        setRun(prev => prev ? { ...prev, status: 'cancelled', completedAt: new Date().toISOString(), totalDurationMs: Date.now() - startedAt } : null);
        return;
      }

      const step = activeTemplate.steps[i];
      const config = getTaskConfig(step.taskType);

      setRun(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[i] = { ...updatedSteps[i], status: 'running' };
        return { ...prev, currentStepIndex: i, steps: updatedSteps };
      });

      setStreamingOutput('');

      try {
        let imageDataUrl = pipelineInput.imageDataUrl;
        if (pipelineInput.files.length > 0 && config.requiresImage && !imageDataUrl) {
          const imageFile = pipelineInput.files.find(f => f.type.startsWith('image/'));
          if (imageFile) {
            imageDataUrl = await readAsDataURL(imageFile);
          }
        }

        let audioData = pipelineInput.audioData;
        let pdfText = pipelineInput.pdfText;

        if (pipelineInput.files.length > 0 && config.requiresPDF && !pdfText) {
          const pdfFile = pipelineInput.files.find(f => f.type === 'application/pdf');
          if (pdfFile) {
            const result = await extractPDFText(pdfFile);
            pdfText = result.text;
          }
        }

        if (pipelineInput.files.length > 0 && config.requiresAudio && !audioData) {
          const { extractAudio } = await import('../fileHandler');
          const audioFile = pipelineInput.files.find(f => f.type.startsWith('audio/') || f.type.startsWith('video/'));
          if (audioFile) {
            audioData = await extractAudio(audioFile);
          }
        }

        if (step.taskType === 'research') {
          try {
            const results = await search(pipelineInput.text ?? '');
            const searchResults = results.map((r, idx) => `[${idx + 1}] ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`).join('\n\n');
            const urls = results.slice(0, 3).map(r => r.url);
            let pageContent = '';
            if (urls.length > 0) {
              const contents = await fetchMultiple(urls);
              pageContent = contents.filter(c => c).join('\n\n---\n\n');
            }
            const messages = buildTaskMessages(step.taskType, {
              text: pipelineInput.text,
              imageDataUrl,
              audioData,
              pdfText,
              searchResults,
              pageContent,
            }, {
              pipelineContext: {
                previousOutputs: stepOutputsRef.current.slice(0, i),
                currentStepIndex: i,
              },
            });

            const taskId = crypto.randomUUID();
            const result = await executeStepDirect(taskId, messages, config, step.taskType);
            finalizeStepOutput(i, result.output, result.parsed, result.tokenCount, result.tps);
            setTps(result.tps);
          } catch (err) {
            if (err instanceof McpAuthError) {
              setRun(prev => {
                if (!prev) return null;
                const updatedSteps = [...prev.steps];
                updatedSteps[i] = { ...updatedSteps[i], status: 'error', error: 'Web search API key invalid' };
                return { ...prev, steps: updatedSteps, status: 'error', completedAt: new Date().toISOString(), totalDurationMs: Date.now() - startedAt };
              });
              return;
            }
            const messages = buildTaskMessages(step.taskType, {
              text: pipelineInput.text,
              imageDataUrl,
              audioData,
              pdfText,
              searchResults: '(Search unavailable — using model knowledge)',
              pageContent: '',
            }, {
              pipelineContext: {
                previousOutputs: stepOutputsRef.current.slice(0, i),
                currentStepIndex: i,
              },
            });
            const taskId = crypto.randomUUID();
            const result = await executeStepDirect(taskId, messages, config, step.taskType);
            finalizeStepOutput(i, result.output, result.parsed, result.tokenCount, result.tps);
            setTps(result.tps);
          }
        } else {
          const stepInput = buildStepInputForPipeline(i, { imageDataUrl, audioData, pdfText });
          const messages = buildTaskMessages(step.taskType, stepInput, {
            pipelineContext: {
              previousOutputs: stepOutputsRef.current.slice(0, i),
              currentStepIndex: i,
            },
          });

          const taskId = crypto.randomUUID();
          const result = await executeStepDirect(taskId, messages, config, step.taskType);
          finalizeStepOutput(i, result.output, result.parsed, result.tokenCount, result.tps);
          setTps(result.tps);
        }
      } catch (err) {
        if (cancelledRef.current) {
          setRun(prev => prev ? { ...prev, status: 'cancelled', completedAt: new Date().toISOString(), totalDurationMs: Date.now() - startedAt } : null);
          return;
        }

        setRun(prev => {
          if (!prev) return null;
          const updatedSteps = [...prev.steps];
          updatedSteps[i] = {
            ...updatedSteps[i],
            status: 'error',
            error: err instanceof Error ? err.message : String(err),
          };
          return { ...prev, steps: updatedSteps, status: 'error', completedAt: new Date().toISOString(), totalDurationMs: Date.now() - startedAt };
        });
        return;
      }
    }

    if (!cancelledRef.current) {
      setRun(prev => {
        if (!prev) return null;
        const entry = {
          id: crypto.randomUUID(),
          type: prev.steps[prev.steps.length - 1]?.taskType ?? 'general_text',
          category: activeTemplate.category === 'pipeline' ? 'documents' : activeTemplate.category,
          inputSummary: pipelineInput.text?.slice(0, 200) ?? pipelineInput.files.map(f => f.name).join(', '),
          output: stepOutputsRef.current[stepOutputsRef.current.length - 1]?.text ?? '',
          parsedOutput: stepOutputsRef.current[stepOutputsRef.current.length - 1]?.parsed,
          status: 'complete' as const,
          timestamp: new Date().toISOString(),
          durationMs: Date.now() - startedAt,
          tokenCount: prev.totalTokens,
          tps: tps,
        };
        addEntry(entry).catch(() => {});

        return {
          ...prev,
          status: 'complete',
          completedAt: new Date().toISOString(),
          totalDurationMs: Date.now() - startedAt,
        };
      });
    }
  }, [activeTemplate, workerRef, state.stage, pipelineInput, buildStepInput, finalizeStepOutput, tps]);

  const executeStepDirect = useCallback(
    (
      taskId: string,
      messages: Array<{ role: string; content: unknown }>,
      config: { outputFormat: string },
      taskType: TaskType
    ): Promise<{ output: string; parsed?: unknown; tokenCount: number; tps: number }> => {
      return new Promise((resolve, reject) => {
        if (!workerRef.current) {
          reject(new Error('Worker not available'));
          return;
        }

        const onMessage = (event: MessageEvent) => {
          const { status, output, numTokens, tps: newTps, taskId: msgTaskId } = event.data;
          if (msgTaskId !== taskId) return;

          if (status === 'task_update') {
            setStreamingOutput(prev => prev + (output ?? ''));
          }

          if (status === 'task_complete') {
            workerRef.current?.removeEventListener('message', onMessage);
            const rawOutput = output ?? '';
            let parsed: unknown = undefined;
            let finalOutput = rawOutput;

            if (config.outputFormat === 'json') {
              const result = parseJSON(rawOutput);
              if (!('error' in result)) {
                parsed = result;
              }
            } else {
              finalOutput = extractText(rawOutput);
            }

            resolve({ output: finalOutput, parsed, tokenCount: numTokens ?? 0, tps: newTps ?? 0 });
          }

          if (status === 'task_error') {
            workerRef.current?.removeEventListener('message', onMessage);
            reject(new Error(event.data.data ?? 'Task failed'));
          }
        };

        workerRef.current!.addEventListener('message', onMessage);

        workerRef.current!.postMessage({
          type: 'task',
          data: {
            taskId,
            taskType,
            messages,
            enableThinking: config.outputFormat === 'json',
            maxNewTokens: getTokenBudget(taskType),
            pass: 1,
          },
        });
      });
    },
    [workerRef]
  );

  const buildStepInputForPipeline = useCallback(
    (stepIndex: number, overrides: { imageDataUrl?: string; audioData?: Float32Array; pdfText?: string }): Parameters<typeof buildTaskMessages>[1] => {
      if (!activeTemplate) return {};

      const step = activeTemplate.steps[stepIndex];
      const prevOutput = stepOutputsRef.current[stepIndex - 1] ?? null;

      if (!prevOutput || stepIndex === 0) {
        return {
          text: pipelineInput.text,
          imageDataUrl: overrides.imageDataUrl ?? pipelineInput.imageDataUrl,
          audioData: overrides.audioData ?? pipelineInput.audioData,
          pdfText: overrides.pdfText ?? pipelineInput.pdfText,
        };
      }

      const baseInput: Parameters<typeof buildTaskMessages>[1] = {};

      switch (step.inputMapping.type) {
        case 'text': {
          const field = step.inputMapping.field ?? 'text';
          (baseInput as Record<string, unknown>)[field] = prevOutput.text;
          break;
        }
        case 'parsed_json':
          baseInput.text = prevOutput.parsed ? JSON.stringify(prevOutput.parsed, null, 2) : prevOutput.text;
          break;
        case 'raw_output':
          baseInput.text = prevOutput.text;
          break;
        case 'file':
          baseInput.imageDataUrl = overrides.imageDataUrl ?? pipelineInput.imageDataUrl;
          break;
        case 'combined': {
          const fields = step.inputMapping.fields ?? ['text'];
          for (const field of fields) {
            if (field === 'text') baseInput.text = prevOutput.text;
            else if (field === 'pdfText') baseInput.pdfText = prevOutput.text;
            else if (field === 'imageDataUrl') baseInput.imageDataUrl = overrides.imageDataUrl ?? pipelineInput.imageDataUrl;
          }
          break;
        }
      }

      if (overrides.imageDataUrl && !baseInput.imageDataUrl) baseInput.imageDataUrl = overrides.imageDataUrl;
      if (overrides.audioData) baseInput.audioData = overrides.audioData;
      if (overrides.pdfText) baseInput.pdfText = overrides.pdfText;

      return baseInput;
    },
    [activeTemplate, pipelineInput]
  );

  const retryStep = useCallback(async (stepIndex: number) => {
    if (!run || !activeTemplate || stepIndex >= activeTemplate.steps.length) return;

    cancelledRef.current = false;
    setStreamingOutput('');

    setRun(prev => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'running', error: undefined };
      for (let i = stepIndex + 1; i < updatedSteps.length; i++) {
        updatedSteps[i] = { ...updatedSteps[i], status: 'pending' };
      }
      return { ...prev, status: 'running', currentStepIndex: stepIndex, steps: updatedSteps };
    });

    const step = activeTemplate.steps[stepIndex];
    const config = getTaskConfig(step.taskType);
    const stepInput = buildStepInputForPipeline(stepIndex, {});
    const messages = buildTaskMessages(step.taskType, stepInput, {
      pipelineContext: {
        previousOutputs: stepOutputsRef.current.slice(0, stepIndex),
        currentStepIndex: stepIndex,
      },
    });

    try {
      const taskId = crypto.randomUUID();
      const result = await executeStepDirect(taskId, messages, config, step.taskType);
      finalizeStepOutput(stepIndex, result.output, result.parsed, result.tokenCount, result.tps);
      setTps(result.tps);

      setRun(prev => {
        if (!prev) return null;
        const allComplete = prev.steps.every((s, i) => i <= stepIndex || s.status === 'complete' || s.status === 'pending');
        return {
          ...prev,
          status: allComplete ? 'complete' : 'running',
          completedAt: allComplete ? new Date().toISOString() : undefined,
        };
      });
    } catch (err) {
      setRun(prev => {
        if (!prev) return null;
        const updatedSteps = [...prev.steps];
        updatedSteps[stepIndex] = {
          ...updatedSteps[stepIndex],
          status: 'error',
          error: err instanceof Error ? err.message : String(err),
        };
        return { ...prev, steps: updatedSteps, status: 'error' };
      });
    }
  }, [run, activeTemplate, buildStepInputForPipeline, executeStepDirect, finalizeStepOutput]);

  const skipStep = useCallback((stepIndex: number) => {
    if (!run) return;

    const prevOutput = stepOutputsRef.current[stepIndex - 1];
    if (prevOutput) {
      stepOutputsRef.current[stepIndex] = prevOutput;
    }

    setRun(prev => {
      if (!prev) return null;
      const updatedSteps = [...prev.steps];
      updatedSteps[stepIndex] = { ...updatedSteps[stepIndex], status: 'skipped' };

      const allDone = updatedSteps.every(s => s.status === 'complete' || s.status === 'skipped');
      return {
        ...prev,
        steps: updatedSteps,
        status: allDone ? 'complete' : 'running',
        currentStepIndex: stepIndex + 1 < updatedSteps.length ? stepIndex + 1 : prev.currentStepIndex,
        completedAt: allDone ? new Date().toISOString() : undefined,
      };
    });
  }, [run]);

  return (
    <PipelineContext.Provider value={{
      activeTemplate,
      run,
      streamingOutput,
      tps,
      loadTemplate,
      setPipelineInput,
      runPipeline,
      cancelPipeline,
      retryStep,
      skipStep,
      resetPipeline,
    }}>
      {children}
    </PipelineContext.Provider>
  );
}
