import React, { useCallback } from 'react';
import { useTransportStore } from '../../stores/transport-store';
import { useUIStore } from '../../stores/ui-store';
import { getTransportEngine } from '../../hooks/use-transport';

const TimelineRuler = React.memo(function TimelineRuler(): React.JSX.Element {
  const { timeSignature } = useTransportStore();
  const { zoomX, scrollX } = useUIStore();

  const barWidth = 120 * zoomX;
  const totalBars = 64;
  const beatsPerBar = timeSignature[0];
  const beatWidth = barWidth / beatsPerBar;

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left + scrollX;
      const beat = x / beatWidth;
      const quantizedBeat = Math.max(0, Math.round(beat * 4) / 4); // Snap to 16th notes

      useTransportStore.getState().setPlayhead(quantizedBeat);
      const engine = getTransportEngine();
      if (engine) {
        engine.seekTo(quantizedBeat);
      }
    },
    [scrollX, beatWidth]
  );

  return (
    <div
      className="h-6 bg-rach-surface border-b border-rach-border relative overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div
        className="absolute top-0 h-full flex"
        style={{ transform: `translateX(${-scrollX}px)` }}
      >
        {Array.from({ length: totalBars }, (_, i) => (
          <div
            key={i}
            className="relative shrink-0 border-r border-rach-border"
            style={{ width: barWidth }}
          >
            <span className="absolute left-1 top-0.5 text-[10px] text-rach-text-muted">
              {i + 1}
            </span>
            {/* Beat subdivisions */}
            {Array.from({ length: beatsPerBar - 1 }, (_, j) => (
              <div
                key={j}
                className="absolute top-3 w-px h-3 bg-rach-border"
                style={{ left: ((j + 1) / beatsPerBar) * barWidth }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
});

export { TimelineRuler };
