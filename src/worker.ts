import {
  AutoProcessor,
  Gemma4ForConditionalGeneration,
  InterruptableStoppingCriteria,
  TextStreamer,
  load_image,
  read_audio,
  env,
} from "@huggingface/transformers";

const MODEL_ID = "onnx-community/gemma-4-E2B-it-ONNX";

env.allowLocalModels = false;

const originalFetch = globalThis.fetch.bind(globalThis);

function postDebug(message: string, extra: Record<string, unknown> = {}) {
  self.postMessage({
    status: "debug",
    data: {
      message,
      timestamp: new Date().toISOString(),
      ...extra,
    },
  });
}

globalThis.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === "string" ? input : input instanceof Request ? input.url : String(input);
  const method = init?.method ?? "GET";

  if (url.includes("huggingface.co") || url.includes("hf.co")) {
    postDebug(`Fetch start ${method} ${url}`);
    try {
      const response = await originalFetch(input, init);
      return response;
    } catch (error) {
      self.postMessage({
        status: "error",
        data: `Fetch error for ${url}: ${error instanceof Error ? error.message : String(error)}`,
      });
      throw error;
    }
  }

  return originalFetch(input, init);
};

class ModelSession {
  processor: Awaited<ReturnType<typeof AutoProcessor.from_pretrained>> | null = null;
  model: Awaited<ReturnType<typeof Gemma4ForConditionalGeneration.from_pretrained>> | null = null;
  stoppingCriteria = new InterruptableStoppingCriteria();
  loadingPromise: Promise<void> | null = null;

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

    const progress_callback = (info: Record<string, unknown>) => {
      if (info.status === "progress_total") {
        self.postMessage({
          status: "progress",
          progress: Math.round(Number(info.progress ?? 0)),
        });
        return;
      }
      if (info.status === "download") {
        self.postMessage({
          status: "loading",
          data: `Downloading ${String(info.name ?? "model shard")}...`,
        });
      }
      if (info.status === "init") {
        self.postMessage({
          status: "loading",
          data: `Initializing ${String(info.file ?? info.name ?? "model file")}...`,
        });
      }
      if (info.status === "done") {
        self.postMessage({
          status: "loading",
          data: `Loaded ${String(info.file ?? info.name ?? "model file")}`,
        });
      }
    };

    this.loadingPromise = Promise.all([
      AutoProcessor.from_pretrained(MODEL_ID, { progress_callback }),
      Gemma4ForConditionalGeneration.from_pretrained(MODEL_ID, {
        dtype: "q4f16",
        device: "webgpu",
        progress_callback,
      }),
    ])
      .then(([processor, model]) => {
        this.processor = processor;
        this.model = model;
        self.postMessage({ status: "ready" });
      })
      .catch((error) => {
        self.postMessage({
          status: "error",
          data: error instanceof Error ? error.message : String(error),
        });
        throw error;
      })
      .finally(() => {
        this.loadingPromise = null;
      });

    await this.loadingPromise;
  }

  interrupt() {
    this.stoppingCriteria.interrupt();
  }

  reset() {
    this.stoppingCriteria.reset();
  }
}

const session = new ModelSession();

async function prepareInputs(
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>,
  enableThinking: boolean,
) {
  const lastMessage = messages.at(-1);
  const prompt = session.processor!.apply_chat_template([lastMessage], {
    add_generation_prompt: true,
    enable_thinking: enableThinking,
  });

  const contentParts = Array.isArray(lastMessage?.content) ? lastMessage.content : [];
  const imagePart = contentParts.find((part) => part.type === "image");
  const audioPart = contentParts.find((part) => part.type === "audio");

  const image = imagePart?.image ? await load_image(imagePart.image as string) : null;
  const audio =
    typeof audioPart?.audio === "string"
      ? await read_audio(audioPart.audio, 16000)
      : audioPart?.audio
        ? new Float32Array(audioPart.audio as number[])
        : null;

  return session.processor!(prompt, image, audio, {
    add_special_tokens: false,
  });
}

async function generate(
  messages: Array<{ role: string; content: string | Array<{ type: string; [key: string]: unknown }> }>,
  enableThinking: boolean,
  maxNewTokens: number,
) {
  await session.load();
  session.reset();

  const inputs = await prepareInputs(messages, enableThinking);

  self.postMessage({ status: "start" });

  let outputText = "";

  const streamer = new TextStreamer(session.processor!.tokenizer, {
    skip_prompt: true,
    skip_special_tokens: true,
    callback_function: (text: string) => {
      outputText += text;
      self.postMessage({
        status: "update",
        output: text,
      });
    },
  });

  const startedAt = performance.now();
  const outputs = await session.model!.generate({
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
    const decoded = session.processor!.batch_decode(generated, {
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

self.addEventListener("message", async (event: MessageEvent) => {
  const { type, data } = event.data;

  try {
    switch (type) {
      case "check":
        self.postMessage({
          status: "check",
          supported: Boolean(navigator.gpu),
        });
        break;
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

self.addEventListener("error", (event: ErrorEvent) => {
  self.postMessage({
    status: "error",
    data: event.message || "Worker error",
  });
});

self.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
  const reason =
    event.reason instanceof Error ? event.reason.message : String(event.reason);
  self.postMessage({
    status: "error",
    data: reason,
  });
});
