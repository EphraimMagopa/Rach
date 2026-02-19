import { useEffect, useRef } from 'react';
import { getAudioFileManager } from '../../core/audio/audio-file-manager';

interface WaveformViewProps {
  fileId: string;
  width: number;
  height: number;
  color?: string;
}

export function WaveformView({
  fileId,
  width,
  height,
  color = '#3b82f6',
}: WaveformViewProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const buffer = getAudioFileManager().getBuffer(fileId);
    if (!buffer) {
      ctx.clearRect(0, 0, width, height);
      return;
    }

    const data = buffer.getChannelData(0);
    const samplesPerPixel = Math.ceil(data.length / width);
    const mid = height / 2;

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.7;

    for (let x = 0; x < width; x++) {
      const start = x * samplesPerPixel;
      const end = Math.min(start + samplesPerPixel, data.length);
      let min = 0;
      let max = 0;
      for (let i = start; i < end; i++) {
        if (data[i] < min) min = data[i];
        if (data[i] > max) max = data[i];
      }
      const top = mid + min * mid;
      const bottom = mid + max * mid;
      ctx.fillRect(x, top, 1, bottom - top || 1);
    }
  }, [fileId, width, height, color]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="absolute inset-0"
      style={{ width, height }}
    />
  );
}
