import type { MIDINote } from '../../core/models';

interface VelocityLaneProps {
  notes: MIDINote[];
  clipDurationBeats: number;
  beatWidth: number;
  selectedNoteId: string | null;
  onVelocityChange: (noteId: string, velocity: number) => void;
}

export function VelocityLane({
  notes,
  clipDurationBeats,
  beatWidth,
  selectedNoteId,
  onVelocityChange,
}: VelocityLaneProps): React.JSX.Element {
  const laneHeight = 48;
  const totalWidth = clipDurationBeats * beatWidth;

  return (
    <div className="h-12 border-t border-rach-border bg-rach-bg relative" style={{ width: totalWidth }}>
      <div className="absolute left-0 top-0 text-[8px] text-rach-text-muted px-1">VEL</div>
      {notes.map((note) => {
        const left = note.startBeat * beatWidth;
        const height = (note.velocity / 127) * laneHeight;
        const isSelected = note.id === selectedNoteId;

        return (
          <div
            key={note.id}
            className="absolute bottom-0 w-2 cursor-ns-resize"
            style={{ left }}
            onMouseDown={(e) => {
              e.stopPropagation();
              const startY = e.clientY;
              const startVel = note.velocity;

              const handleMouseMove = (me: MouseEvent) => {
                const dy = startY - me.clientY;
                const newVel = Math.max(1, Math.min(127, startVel + Math.round(dy)));
                onVelocityChange(note.id, newVel);
              };

              const handleMouseUp = () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
              };

              window.addEventListener('mousemove', handleMouseMove);
              window.addEventListener('mouseup', handleMouseUp);
            }}
          >
            <div
              className={`w-full rounded-t-sm ${
                isSelected ? 'bg-rach-accent' : 'bg-rach-accent/60'
              }`}
              style={{ height }}
            />
          </div>
        );
      })}
    </div>
  );
}
