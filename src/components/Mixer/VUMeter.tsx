import { useEffect, useRef, useState } from 'react';

interface VUMeterProps {
  analyserNode: AnalyserNode | null;
  height?: number;
}

export function VUMeter({ analyserNode, height = 112 }: VUMeterProps): React.JSX.Element {
  const [level, setLevel] = useState(0);
  const rafRef = useRef<number | null>(null);
  const dataRef = useRef<Float32Array<ArrayBuffer> | null>(null);

  useEffect(() => {
    if (!analyserNode) return;

    if (!dataRef.current || dataRef.current.length !== analyserNode.fftSize) {
      dataRef.current = new Float32Array(analyserNode.fftSize);
    }

    const tick = () => {
      if (!analyserNode || !dataRef.current) return;

      analyserNode.getFloatTimeDomainData(dataRef.current);

      // Calculate RMS level
      let sum = 0;
      for (let i = 0; i < dataRef.current.length; i++) {
        sum += dataRef.current[i] * dataRef.current[i];
      }
      const rms = Math.sqrt(sum / dataRef.current.length);

      // Convert to dB, clamp to -60..0 range, normalize to 0..1
      const db = rms > 0 ? 20 * Math.log10(rms) : -60;
      const normalized = Math.max(0, Math.min(1, (db + 60) / 60));

      setLevel(normalized);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [analyserNode]);

  const fillHeight = level * height;

  // Color: green → yellow → red
  let color = '#22c55e'; // green
  if (level > 0.8) color = '#ef4444'; // red
  else if (level > 0.6) color = '#eab308'; // yellow

  return (
    <div className="relative rounded overflow-hidden bg-rach-bg" style={{ width: 6, height }}>
      <div
        className="absolute bottom-0 w-full transition-[height] duration-75"
        style={{ height: fillHeight, backgroundColor: color }}
      />
    </div>
  );
}
