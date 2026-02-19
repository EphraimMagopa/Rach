import { useCallback } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { sampleAutomationCurve } from '../../core/automation/interpolation';
import type { AutomationLane as AutomationLaneType } from '../../core/models/automation';

interface AutomationLaneProps {
  lane: AutomationLaneType;
  trackId: string;
  barWidth: number;
  totalBars: number;
  beatsPerBar: number;
}

const LANE_HEIGHT = 48;

export function AutomationLane({
  lane,
  trackId,
  barWidth,
  totalBars,
  beatsPerBar,
}: AutomationLaneProps): React.JSX.Element {
  const { addAutomationPoint, removeAutomationPoint } = useProjectStore();
  const { toolMode } = useUIStore();
  const gridWidth = barWidth * totalBars;
  const beatWidth = barWidth / beatsPerBar;

  // Calculate min/max for normalization
  // Default to volume range (-60 to 6 dB) if no points
  const minVal = lane.parameter === 'pan' ? -1 : -60;
  const maxVal = lane.parameter === 'pan' ? 1 : 6;
  const range = maxVal - minVal;

  const valueToY = (value: number): number => {
    const normalized = (value - minVal) / range;
    return LANE_HEIGHT * (1 - normalized);
  };

  const yToValue = (y: number): number => {
    const normalized = 1 - y / LANE_HEIGHT;
    return minVal + normalized * range;
  };

  // Generate SVG path from automation curve
  const samples = sampleAutomationCurve(
    lane.points,
    0,
    totalBars * beatsPerBar,
    Math.max(totalBars * beatsPerBar * 4, 100)
  );

  const pathD = samples.length > 0
    ? samples
        .map((s, i) => {
          const x = s.beat * beatWidth;
          const y = valueToY(s.value);
          return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        })
        .join(' ')
    : '';

  const handleLaneClick = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (toolMode !== 'draw') return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const beat = x / beatWidth;
      const value = yToValue(y);

      const point = {
        id: crypto.randomUUID(),
        beat: Math.round(beat * 4) / 4, // Snap to 16th notes
        value: Math.max(minVal, Math.min(maxVal, value)),
        interpolation: 'linear' as const,
      };

      addAutomationPoint(trackId, lane.id, point);
    },
    [toolMode, beatWidth, trackId, lane.id, addAutomationPoint, minVal, maxVal]
  );

  const handlePointClick = useCallback(
    (e: React.MouseEvent, pointId: string) => {
      e.stopPropagation();
      if (toolMode === 'erase') {
        removeAutomationPoint(trackId, lane.id, pointId);
      }
    },
    [toolMode, trackId, lane.id, removeAutomationPoint]
  );

  return (
    <div className="relative" style={{ height: LANE_HEIGHT }}>
      <svg
        width={gridWidth}
        height={LANE_HEIGHT}
        className="absolute inset-0 cursor-crosshair"
        onClick={handleLaneClick}
      >
        {/* Background */}
        <rect width={gridWidth} height={LANE_HEIGHT} fill="transparent" />

        {/* Center line (zero/default) */}
        <line
          x1={0}
          y1={valueToY(0)}
          x2={gridWidth}
          y2={valueToY(0)}
          stroke="rgba(255,255,255,0.1)"
          strokeDasharray="4 4"
        />

        {/* Automation curve */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#00A8E8"
            strokeWidth={1.5}
            opacity={lane.enabled ? 1 : 0.3}
          />
        )}

        {/* Automation points */}
        {lane.points.map((point) => (
          <circle
            key={point.id}
            cx={point.beat * beatWidth}
            cy={valueToY(point.value)}
            r={4}
            fill="#00A8E8"
            stroke="white"
            strokeWidth={1}
            className="cursor-pointer hover:r-6"
            onClick={(e) => handlePointClick(e, point.id)}
          />
        ))}
      </svg>
    </div>
  );
}
