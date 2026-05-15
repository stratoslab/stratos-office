export class WebcamCapture {
  private stream: MediaStream | null = null;

  async start(): Promise<MediaStream> {
    this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
    return this.stream;
  }

  async captureFrame(videoElement: HTMLVideoElement): Promise<string> {
    const canvas = new OffscreenCanvas(videoElement.videoWidth, videoElement.videoHeight);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Could not get canvas context');
    ctx.drawImage(videoElement, 0, 0);
    const blob = await canvas.convertToBlob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.readAsDataURL(blob);
    });
  }

  stop(stream: MediaStream): void {
    stream.getTracks().forEach(track => track.stop());
    this.stream = null;
  }
}
