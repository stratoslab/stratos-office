import { createContext, useContext, useRef, useState, useCallback, useEffect, type ReactNode } from "react";
import type { ModelState, ModelStage, WorkerResponse } from "../types";

const initialState: ModelState = {
  stage: "checking",
  progress: 0,
  currentFile: "",
  totalFiles: 0,
  completedFiles: 0,
  estimatedTimeRemaining: "",
  error: null,
  tps: null,
  numTokens: null,
  isGenerating: false,
  gpuAdapter: null,
  gpuBackend: null,
  shaderF16: null,
  downloadRetry: null,
  downloadError: null,
};

interface ModelContextValue {
  state: ModelState;
  workerRef: React.MutableRefObject<Worker | null>;
  loadModel: () => void;
  resumeDownload: () => void;
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
    console.log('[ModelContext] Creating worker...');
    const worker = new Worker(new URL("../worker.js", import.meta.url), {
      type: "module",
    });
    workerRef.current = worker;
    console.log('[ModelContext] Worker created');

    worker.addEventListener("message", (event: MessageEvent<WorkerResponse>) => {
      const { status, data, progress, output, numTokens, tps } = event.data;
      console.log('[ModelContext] Worker message:', status);

      switch (status) {
        case "check": {
          const msg = event.data;
          const supported = Boolean(msg.supported);
          const reason = typeof msg.reason === "string" ? msg.reason : null;
          if (!supported) {
            setState((prev) => ({
              ...prev,
              stage: "unsupported",
              error: reason || "WebGPU is not supported in this browser",
            }));
            break;
          }
          const shaderF16 = Boolean(msg.shaderF16);
          if (!shaderF16) {
            setState((prev) => ({
              ...prev,
              stage: "unsupported",
              error: "GPU does not support shader-f16 (required for Gemma 4 fp16 inference). Try Chrome on a discrete GPU.",
              gpuAdapter: typeof msg.adapter === "string" ? msg.adapter : null,
              gpuBackend: typeof msg.backend === "string" ? msg.backend : null,
              shaderF16: false,
            }));
            break;
          }
          setState((prev) => ({
            ...prev,
            stage: "idle",
            gpuAdapter: typeof msg.adapter === "string" ? msg.adapter : null,
            gpuBackend: typeof msg.backend === "string" ? msg.backend : null,
            shaderF16: true,
          }));
          break;
        }

        case "init":
          setState((prev) => ({
            ...prev,
            stage: "loading",
            currentFile: typeof data === "string" ? data : prev.currentFile,
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

        case "download_retry":
          setState((prev) => ({
            ...prev,
            downloadRetry: {
              active: true,
              attempt: typeof event.data.attempt === "number" ? event.data.attempt : 0,
              maxRetries: typeof event.data.maxRetries === "number" ? event.data.maxRetries : 5,
              delay: typeof event.data.delay === "number" ? event.data.delay : 2,
              url: typeof event.data.url === "string" ? event.data.url : "",
            },
            downloadError: null,
          }));
          break;

        case "download_error":
          setState((prev) => ({
            ...prev,
            stage: "error",
            error: typeof data === "string" ? data : "Download failed after all retries",
            downloadRetry: null,
            downloadError: {
              message: typeof data === "string" ? data : "Download failed",
              cachedPercent: typeof event.data.cachedPercent === "number" ? event.data.cachedPercent : 0,
            },
          }));
          break;
      }
    });

    worker.postMessage({ type: "check" });

    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, []);

  const loadModel = useCallback(() => {
    startTimeRef.current = performance.now();
    setState((prev) => ({ ...prev, stage: "downloading", progress: 0, error: null, downloadRetry: null, downloadError: null }));
    workerRef.current?.postMessage({ type: "load" });
  }, []);

  const resumeDownload = useCallback(() => {
    // Transformers.js caches partial downloads, so re-calling load resumes
    setState((prev) => ({
      ...prev,
      stage: "downloading",
      error: null,
      downloadRetry: null,
      downloadError: null,
      progress: prev.downloadError?.cachedPercent ?? 0,
      currentFile: `Resuming from ${prev.downloadError?.cachedPercent ?? 0}%...`,
    }));
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
        loadModel,
        resumeDownload,
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
