import { useState, useRef, useCallback } from 'react';
import { WebcamCapture } from '../../webcamCapture';

interface WebcamCaptureProps {
  onFrame: (dataUrl: string) => void;
  onError: (msg: string) => void;
}

export default function WebcamCaptureComponent({ onFrame, onError }: WebcamCaptureProps) {
  const [isActive, setIsActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const captureRef = useRef<WebcamCapture>(new WebcamCapture());

  const openCamera = useCallback(async () => {
    try {
      const stream = await captureRef.current.start();
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsActive(true);
    } catch {
      onError('Failed to access camera');
    }
  }, [onError]);

  const captureFrame = useCallback(() => {
    if (videoRef.current) {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(videoRef.current, 0, 0);
          const dataUrl = canvas.toDataURL('image/png');
          onFrame(dataUrl);
        }
      } catch {
        onError('Failed to capture frame');
      }
    }
  }, [onFrame, onError]);

  const closeCamera = useCallback(() => {
    if (streamRef.current) {
      captureRef.current.stop(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  if (!isActive) {
    return (
      <button
        onClick={openCamera}
        className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        aria-label="Open camera"
      >
        <span className="material-symbols-outlined">photo_camera</span>
        Open Camera
      </button>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md rounded-lg bg-black" />
      <div className="flex gap-2">
        <button
          onClick={captureFrame}
          className="flex items-center gap-2 px-4 py-2 bg-[#00D4FF] text-[#061220] rounded-lg font-medium hover:brightness-110 transition-colors"
          aria-label="Capture frame"
        >
          <span className="material-symbols-outlined">camera</span>
          Capture
        </button>
        <button
          onClick={closeCamera}
          className="flex items-center gap-2 px-4 py-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
          aria-label="Close camera"
        >
          <span className="material-symbols-outlined">close</span>
          Close
        </button>
      </div>
    </div>
  );
}
