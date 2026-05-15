import { useEffect, useRef } from 'react';
import { ObjectDetectionResult } from '../../types';

interface BoundingBoxCanvasProps {
  imageDataUrl: string;
  detections: ObjectDetectionResult[];
}

const colors = ['#00D4FF', '#00E5CC', '#F59E0B', '#EF4444', '#3B82F6', '#10B981'];

export default function BoundingBoxCanvas({ imageDataUrl, detections }: BoundingBoxCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      detections.forEach((det, i) => {
        const { bbox, label, confidence } = det;
        const x = bbox.x_min * img.width;
        const y = bbox.y_min * img.height;
        const w = (bbox.x_max - bbox.x_min) * img.width;
        const h = (bbox.y_max - bbox.y_min) * img.height;
        const color = colors[i % colors.length];

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, w, h);

        ctx.fillStyle = color;
        const text = `${label} (${confidence})`;
        const textWidth = ctx.measureText(text).width;
        ctx.fillRect(x, y - 20, textWidth + 8, 20);
        ctx.fillStyle = '#061220';
        ctx.font = '12px sans-serif';
        ctx.fillText(text, x + 4, y - 6);
      });
    };
    img.src = imageDataUrl;
  }, [imageDataUrl, detections]);

  return <canvas ref={canvasRef} className="max-w-full rounded-lg" />;
}
