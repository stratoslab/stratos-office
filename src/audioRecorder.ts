export class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private stream: MediaStream | null = null;
  private chunks: Blob[] = [];
  private startTime = 0;
  private pausedTime = 0;
  private isPaused = false;
  private maxDuration = 30 * 60 * 1000;
  private warningDuration = 25 * 60 * 1000;
  private warningEmitted = false;
  private timer: number | null = null;
  private onWarning: (() => void) | null = null;

  setOnWarning(callback: () => void) {
    this.onWarning = callback;
  }

  async start(): Promise<void> {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch {
      throw new Error('Microphone permission denied. Please grant microphone access in your browser settings.');
    }

    this.audioContext = new AudioContext({ sampleRate: 16000 });
    const source = this.audioContext.createMediaStreamSource(this.stream);
    this.analyser = this.audioContext.createAnalyser();
    this.analyser.fftSize = 256;
    source.connect(this.analyser);

    this.mediaRecorder = new MediaRecorder(this.stream);
    this.chunks = [];

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data.size > 0) this.chunks.push(e.data);
    };

    this.mediaRecorder.start(100);
    this.startTime = Date.now();
    this.isPaused = false;
    this.warningEmitted = false;

    this.timer = window.setInterval(() => {
      const elapsed = this.getElapsedMs();
      if (!this.warningEmitted && elapsed >= this.warningDuration && this.onWarning) {
        this.warningEmitted = true;
        this.onWarning();
      }
      if (elapsed >= this.maxDuration) {
        this.stop();
      }
    }, 1000);
  }

  pause(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      this.pausedTime = Date.now() - this.startTime;
      this.isPaused = true;
    }
  }

  resume(): void {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      this.startTime = Date.now() - this.pausedTime;
      this.isPaused = false;
    }
  }

  async stop(): Promise<Float32Array> {
    if (this.timer) clearInterval(this.timer);
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }

    return new Promise((resolve) => {
      const onStop = () => {
        if (this.mediaRecorder) this.mediaRecorder.removeEventListener('stop', onStop);
        const blob = new Blob(this.chunks, { type: 'audio/webm' });
        this.decodeToPCM(blob).then(resolve);
        this.cleanup();
      };

      if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
        onStop();
      } else if (this.mediaRecorder) {
        this.mediaRecorder.addEventListener('stop', onStop);
      } else {
        resolve(new Float32Array(0));
        this.cleanup();
      }
    });
  }

  private async decodeToPCM(blob: Blob): Promise<Float32Array> {
    const arrayBuffer = await blob.arrayBuffer();
    const ctx = new AudioContext({ sampleRate: 16000 });
    const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

    let channelData = audioBuffer.getChannelData(0);
    if (audioBuffer.numberOfChannels > 1) {
      const downmixed = new Float32Array(audioBuffer.length);
      for (let ch = 0; ch < audioBuffer.numberOfChannels; ch++) {
        const chData = audioBuffer.getChannelData(ch);
        for (let i = 0; i < audioBuffer.length; i++) {
          downmixed[i] += chData[i] / audioBuffer.numberOfChannels;
        }
      }
      channelData = downmixed;
    }

    const targetSampleRate = 16000;
    if (audioBuffer.sampleRate !== targetSampleRate) {
      const ratio = targetSampleRate / audioBuffer.sampleRate;
      const newLength = Math.floor(channelData.length * ratio);
      const resampled = new Float32Array(newLength);
      for (let i = 0; i < newLength; i++) {
        const srcIndex = Math.floor(i / ratio);
        resampled[i] = channelData[Math.min(srcIndex, channelData.length - 1)];
      }
      channelData = resampled;
    }

    await ctx.close();
    return channelData;
  }

  getElapsedSeconds(): number {
    if (this.isPaused) return this.pausedTime / 1000;
    if (this.startTime === 0) return 0;
    return (Date.now() - this.startTime) / 1000;
  }

  private getElapsedMs(): number {
    if (this.isPaused) return this.pausedTime;
    if (this.startTime === 0) return 0;
    return Date.now() - this.startTime;
  }

  getLevel(): number {
    if (!this.analyser) return 0;
    const data = new Uint8Array(this.analyser.frequencyBinCount);
    this.analyser.getByteFrequencyData(data);
    const sum = data.reduce((a, b) => a + b, 0);
    return sum / (data.length * 255);
  }

  private cleanup() {
    if (this.stream) {
      this.stream.getTracks().forEach(t => t.stop());
      this.stream = null;
    }
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    this.mediaRecorder = null;
    this.analyser = null;
    this.chunks = [];
    this.startTime = 0;
    this.isPaused = false;
  }
}
