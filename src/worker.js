const MODEL_ID = "onnx-community/gemma-4-E2B-it-ONNX";
const MAX_RETRIES = 5;
const BASE_RETRY_DELAY = 2000; // 2s, doubles each retry (2s, 4s, 8s, 16s, 32s)

let transformersLoaded = false;
let AutoProcessor, Gemma4ForConditionalGeneration, InterruptableStoppingCriteria, TextStreamer, load_image, read_audio, env;

async function loadTransformers() {
  if (transformersLoaded) return;
  const transformers = await import("https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.0.1/+esm");
  AutoProcessor = transformers.AutoProcessor;
  Gemma4ForConditionalGeneration = transformers.Gemma4ForConditionalGeneration;
  InterruptableStoppingCriteria = transformers.InterruptableStoppingCriteria;
  TextStreamer = transformers.TextStreamer;
  load_image = transformers.load_image;
  read_audio = transformers.read_audio;
  env = transformers.env;
  env.allowLocalModels = false;

  // Wrap fetch with retry logic for resilient downloads on bad connections
  const originalFetch = env.fetch ?? globalThis.fetch.bind(globalThis);
  env.fetch = async (url, options = {}) => {
    let lastError;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await originalFetch(url, options);
        if (!response.ok && response.status < 500) return response; // client error, don't retry
        if (response.ok) return response;
        lastError = new Error(`HTTP ${response.status} for ${url}`);
      } catch (err) {
        lastError = err;
      }
      if (attempt < MAX_RETRIES) {
        const delay = BASE_RETRY_DELAY * Math.pow(2, attempt);
        self.postMessage({
          status: "download_retry",
          url,
          attempt: attempt + 1,
          maxRetries: MAX_RETRIES,
          delay: Math.round(delay / 1000),
          reason: lastError.message,
        });
        await new Promise(r => setTimeout(r, delay));
      }
    }
    throw lastError;
  };

  transformersLoaded = true;
}

class ModelSession {
  processor = null;
  model = null;
  stoppingCriteria = null;
  loadingPromise = null;

  async load() {
    if (this.model && this.processor) {
      self.postMessage({ status: "ready" });
      return;
    }
    if (this.loadingPromise) {
      await this.loadingPromise;
      return;
    }

    self.postMessage({
      status: "loading",
      data: `Loading Gemma 4 model (${MODEL_ID})...`,
    });

    this.loadingPromise = this._load().finally(() => {
      this.loadingPromise = null;
    });

    await this.loadingPromise;
  }

  async _load() {
    await loadTransformers();

    if (!this.stoppingCriteria) {
      this.stoppingCriteria = new InterruptableStoppingCriteria();
    }

    const fileProgress = new Map(); // filename → { loaded, total }

    const progress_callback = (info) => {
      if (info.status === "progress") {
        const key = info.file ?? info.name ?? "unknown";
        fileProgress.set(key, {
          loaded: info.loaded ?? 0,
          total: info.total ?? 0,
        });
        const totalLoaded = [...fileProgress.values()].reduce((s, e) => s + e.loaded, 0);
        const totalBytes = [...fileProgress.values()].reduce((s, e) => s + e.total, 0);
        const overallPercent = totalBytes > 0
          ? Math.round((totalLoaded / totalBytes) * 100)
          : 0;
        self.postMessage({ status: "progress", progress: overallPercent });
        return;
      }
      if (info.status === "download") {
        self.postMessage({
          status: "loading",
          data: `Downloading ${info.name ?? "model shard"}...`,
        });
      }
      if (info.status === "init") {
        self.postMessage({
          status: "init",
          data: `Initializing ${info.file ?? info.name ?? "model file"}...`,
        });
      }
      if (info.status === "done") {
        self.postMessage({
          status: "loading",
          data: `Loaded ${info.file ?? info.name ?? "model file"}`,
        });
      }
    };

    try {
      const [processor, model] = await Promise.all([
        AutoProcessor.from_pretrained(MODEL_ID, { progress_callback }),
        Gemma4ForConditionalGeneration.from_pretrained(MODEL_ID, {
          dtype: "q4f16",
          device: "webgpu",
          progress_callback,
        }),
      ]);
      this.processor = processor;
      this.model = model;
      self.postMessage({ status: "ready" });
    } catch (err) {
      // Transformers.js caches partial downloads, so retrying will resume
      // Tell the main thread what happened and what percent was cached
      const cachedPercent = [...fileProgress.values()].reduce((s, e) => s + e.loaded, 0) /
        Math.max(1, [...fileProgress.values()].reduce((s, e) => s + e.total, 0));
      self.postMessage({
        status: "download_error",
        data: err.message ?? "Download failed",
        cachedPercent: Math.round(cachedPercent * 100),
      });
      throw err;
    }
  }

  interrupt() {
    this.stoppingCriteria?.interrupt();
  }

  reset() {
    this.stoppingCriteria?.reset();
  }
}

const session = new ModelSession();

async function handleTask(data) {
  const { taskId, taskType, messages, enableThinking, maxNewTokens, pass } = data;

  self.postMessage({ status: "task_start", taskId });

  session.reset();
  const inputs = await prepareInputs(messages, enableThinking);

  let outputText = "";

  const streamer = new TextStreamer(session.processor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      outputText += text;
      self.postMessage({
        status: "task_update",
        output: text,
        taskId,
      });
    },
  });

  const startedAt = performance.now();
  const outputs = await session.model.generate({
    ...inputs,
    max_new_tokens: maxNewTokens,
    do_sample: false,
    streamer,
    stopping_criteria: [session.stoppingCriteria],
  });

  const promptLength = inputs.input_ids.dims.at(-1) ?? 0;
  const generated = outputs.slice(null, [promptLength, null]);
  const outputTokens = generated.dims.at(-1) ?? 0;
  const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.001);

  if (!outputText) {
    const decoded = session.processor.batch_decode(generated, {
      skip_special_tokens: true,
    });
    outputText = decoded[0] ?? "";
    if (outputText) {
      self.postMessage({
        status: "task_update",
        output: outputText,
        taskId,
      });
    }
  }

  if (pass === 1 && (taskType === "meeting_minutes" || taskType === "voice_to_email")) {
    self.postMessage({
      status: "task_pass1_complete",
      taskId,
      output: outputText,
      numTokens: outputTokens,
      tps: outputTokens / elapsedSeconds,
    });
    return;
  }

  self.postMessage({
    status: "task_complete",
    taskId,
    numTokens: outputTokens,
    tps: outputTokens / elapsedSeconds,
  });
}

async function prepareInputs(messages, enableThinking) {
  const lastMessage = messages.at(-1);
  const prompt = session.processor.apply_chat_template([lastMessage], {
    add_generation_prompt: true,
    enable_thinking: enableThinking,
  });

  const contentParts = Array.isArray(lastMessage?.content) ? lastMessage.content : [];
  const imagePart = contentParts.find((part) => part.type === "image");
  const audioPart = contentParts.find((part) => part.type === "audio");

  const image = imagePart?.image ? await load_image(imagePart.image) : null;
  const audio =
    typeof audioPart?.audio === "string"
      ? await read_audio(audioPart.audio, 16000)
      : audioPart?.audio
        ? new Float32Array(audioPart.audio)
        : null;

  return session.processor(prompt, image, audio, {
    add_special_tokens: false,
  });
}

async function generate(messages, enableThinking, maxNewTokens) {
  await session.load();
  session.reset();

  const inputs = await prepareInputs(messages, enableThinking);

  self.postMessage({ status: "start" });

  let outputText = "";

  const streamer = new TextStreamer(session.processor.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text) => {
      outputText += text;
      self.postMessage({
        status: "update",
        output: text,
      });
    },
  });

  const startedAt = performance.now();
  const outputs = await session.model.generate({
    ...inputs,
    max_new_tokens: maxNewTokens,
    do_sample: false,
    streamer,
    stopping_criteria: [session.stoppingCriteria],
  });

  const promptLength = inputs.input_ids.dims.at(-1) ?? 0;
  const generated = outputs.slice(null, [promptLength, null]);
  const outputTokens = generated.dims.at(-1) ?? 0;
  const elapsedSeconds = Math.max((performance.now() - startedAt) / 1000, 0.001);

  if (!outputText) {
    const decoded = session.processor.batch_decode(generated, {
      skip_special_tokens: true,
    });
    outputText = decoded[0] ?? "";
    if (outputText) {
      self.postMessage({
        status: "update",
        output: outputText,
      });
    }
  }

  self.postMessage({
    status: "complete",
    numTokens: outputTokens,
    tps: outputTokens / elapsedSeconds,
  });
}

self.addEventListener("message", async (event) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case "check": {
        const hasGPU = Boolean(navigator.gpu);
        if (!hasGPU) {
          self.postMessage({ status: "check", supported: false, reason: "WebGPU not available" });
          break;
        }
        try {
          const adapter = await navigator.gpu.requestAdapter();
          if (!adapter) {
            self.postMessage({ status: "check", supported: false, reason: "No GPU adapter found" });
            break;
          }
          // Gemma 4 requires shader-f16 for fp16 inference (confirmed by Gemma Gem project)
          const hasShaderF16 = adapter.features.has("shader-f16");
          self.postMessage({
            status: "check",
            supported: true,
            shaderF16: hasShaderF16,
            adapter: adapter.info.device,
            backend: adapter.info.backend,
          });
        } catch (e) {
          self.postMessage({ status: "check", supported: false, reason: e.message });
        }
        break;
      }
      case "load":
        await session.load();
        break;
      case "generate":
        await generate(
          data.messages,
          Boolean(data.enableThinking),
          data.maxNewTokens ?? 1024,
        );
        break;
      case "task":
        await handleTask(data);
        break;
      case "cancel_task":
        session.interrupt();
        break;
      case "interrupt":
        session.interrupt();
        break;
      case "reset":
        session.reset();
        break;
      default:
        break;
    }
  } catch (error) {
    self.postMessage({
      status: "error",
      data: error instanceof Error ? error.message : String(error),
    });
    self.postMessage({ status: "complete", numTokens: 0, tps: 0 });
  }
});

self.addEventListener("error", (event) => {
  self.postMessage({
    status: "error",
    data: event.message || "Worker error",
  });
});

self.addEventListener("unhandledrejection", (event) => {
  const reason =
    event.reason instanceof Error ? event.reason.message : String(event.reason);
  self.postMessage({
    status: "error",
    data: reason,
  });
});
