import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ModelState, ModelStage, WorkerResponse } from "../types";

const initialState: ModelState = {
  stage: "idle",
  progress: 0,
  currentFile: "",
  totalFiles: 0,
  completedFiles: 0,
  estimatedTimeRemaining: "",
  error: null,
  tps: null,
  numTokens: null,
  isGenerating: false,
};

interface ModelContextValue {
  state: ModelState;
  workerRef: React.MutableRefObject<Worker | null>;
  checkWebGPU: () => void;
  loadModel: () => void;
  generate: (messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>, options?: { enableThinking?: boolean; maxNewTokens?: number }) => void;
  interrupt: () => void;
  reset: () => void;
  clearError: () => void;
}

const ModelContext = createContext<ModelContextValue | null>(null);

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error("useModel must be used within ModelProvider");
  }
  return context;
}

export function ModelProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ModelState>(initialState);
  const workerRef = useRef<Worker | null>(null);
  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    const worker = new Worker(new URL("../worker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const { status, data, progress, output, numTokens, tps } = event.data;

      switch (status) {
        case "check":
          setState((prev) => ({
            ...prev,
            stage: (event.data as { supported: boolean }).supported ? "idle" : "unsupported",
          }));
          break;

        case "loading":
          setState((prev) => ({
            ...prev,
            stage: "downloading",
            currentFile: typeof data === "string" ? data : prev.currentFile,
          }));
          break;

        case "progress":
          setState((prev) => ({
            ...prev,
            progress: typeof progress === "number" ? progress : prev.progress,
            estimatedTimeRemaining: calculateETA(progress as number, startTimeRef.current),
          }));
          break;

        case "ready":
          setState((prev) => ({
            ...prev,
            stage: "ready",
            progress: 100,
            currentFile: "Model ready",
            estimatedTimeRemaining: "",
          }));
          break;

        case "start":
          setState((prev) => ({
            ...prev,
            isGenerating: true,
            tps: null,
            numTokens: null,
          }));
          break;

        case "update":
          // Output streaming is handled by the caller via a separate callback
          break;

        case "complete":
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            tps: typeof tps === "number" ? tps : null,
            numTokens: typeof numTokens === "number" ? numTokens : null,
          }));
          break;

        case "error":
          setState((prev) => ({
            ...prev,
            stage: "error",
            error: typeof data === "string" ? data : "Unknown error",
            isGenerating: false,
          }));
          break;
      }
    });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const checkWebGPU = useCallback(() => {
    setState((prev) => ({ ...prev, stage: "checking" }));
    workerRef.current?.postMessage({ type: "check" });
  }, []);

  const loadModel = useCallback(() => {
    startTimeRef.current = performance.now();
    setState((prev) => ({ ...prev, stage: "downloading", progress: 0, error: null }));
    workerRef.current?.postMessage({ type: "load" });
  }, []);

  const generate = useCallback(
    (
      messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>,
      options?: { enableThinking?: boolean; maxNewTokens?: number },
    ) => {
      workerRef.current?.postMessage({
        type: "generate",
        data: {
          messages,
          enableThinking: options?.enableThinking ?? false,
          maxNewTokens: options?.maxNewTokens ?? 1024,
        },
      });
    },
    [],
  );

  const interrupt = useCallback(() => {
    workerRef.current?.postMessage({ type: "interrupt" });
  }, []);

  const reset = useCallback(() => {
    workerRef.current?.postMessage({ type: "reset" });
    setState(initialState);
  }, []);

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null, stage: prev.stage === "error" ? "idle" : prev.stage }));
  }, []);

  return (
    <ModelContext.Provider
      value={{
        state,
        workerRef,
        checkWebGPU,
        loadModel,
        generate,
        interrupt,
        reset,
        clearError,
      }}
    >
      {children}
    </ModelContext.Provider>
  );
}

function calculateETA(progress: number, startTime: number): string {
  if (progress <= 0 || startTime === 0) return "";
  const elapsed = performance.now() - startTime;
  const rate = progress / elapsed;
  const remaining = (100 - progress) / rate;
  const seconds = Math.round(remaining / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}m ${secs}s`;
}
