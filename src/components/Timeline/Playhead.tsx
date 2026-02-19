import { useTransportStore } from '../../stores/transport-store';
import { useUIStore } from '../../stores/ui-store';

interface PlayheadProps {
  trackHeaderWidth: number;
}

export function Playhead({ trackHeaderWidth }: PlayheadProps): React.JSX.Element | null {
  const playheadBeats = useTransportStore((s) => s.playheadBeats);
  const timeSignature = useTransportStore((s) => s.timeSignature);
  const zoomX = useUIStore((s) => s.zoomX);
  const scrollX = useUIStore((s) => s.scrollX);

  const beatsPerBar = timeSignature[0];
  const barWidth = 120 * zoomX;
  const beatWidth = barWidth / beatsPerBar;
  const x = trackHeaderWidth + playheadBeats * beatWidth - scrollX;

  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-rach-accent z-30 pointer-events-none"
      style={{ left: x }}
    >
      {/* Playhead triangle */}
      <div
        className="absolute -top-0 -translate-x-1/2 w-0 h-0"
        style={{
          borderLeft: '5px solid transparent',
          borderRight: '5px solid transparent',
          borderTop: '6px solid var(--color-rach-accent, #00A8E8)',
        }}
      />
    </div>
  );
}
