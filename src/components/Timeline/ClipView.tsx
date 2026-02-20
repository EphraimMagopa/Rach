import React, { useMemo } from 'react';
import type { Clip } from '../../core/models';
import { useUIStore } from '../../stores/ui-store';
import { useProjectStore } from '../../stores/project-store';
import { useTransportStore } from '../../stores/transport-store';
import { WaveformView } from './WaveformView';

interface ClipViewProps {
  clip: Clip;
  trackId: string;
}

const ClipView = React.memo(function ClipView({ clip }: ClipViewProps): React.JSX.Element {
  const zoomX = useUIStore((s) => s.zoomX);
  const timeSignature = useTransportStore((s) => s.timeSignature);
  const { selectedClipId, selectClip } = useProjectStore();

  const beatsPerBar = timeSignature[0];
  const barWidth = 120 * zoomX;
  const beatWidth = barWidth / beatsPerBar;

  const left = clip.startBeat * beatWidth;
  const width = clip.durationBeats * beatWidth;
  const isSelected = selectedClipId === clip.id;
  const color = clip.color || '#3b82f6';

  return (
    <div
      className={`absolute top-1 bottom-1 rounded-sm cursor-pointer transition-shadow ${
        isSelected ? 'ring-2 ring-rach-accent shadow-lg' : 'hover:brightness-110'
      }`}
      style={{
        left,
        width: Math.max(width, 4),
        backgroundColor: color,
        opacity: 0.85,
      }}
      onClick={(e) => {
        e.stopPropagation();
        selectClip(clip.id);
      }}
    >
      {/* Clip name */}
      <div className="px-1 text-[9px] text-white truncate font-medium leading-4">
        {clip.name}
      </div>

      {/* Waveform for audio clips */}
      {clip.type === 'audio' && clip.audioData && (
        <div className="absolute inset-x-0 top-3 bottom-0 overflow-hidden">
          <WaveformView
            fileId={clip.audioData.fileId}
            width={Math.max(Math.round(width), 4)}
            height={40}
            color="rgba(255,255,255,0.6)"
          />
        </div>
      )}

      {/* Mini note preview for MIDI clips (memoized) */}
      {clip.type === 'midi' && clip.midiData && clip.midiData.notes.length > 0 && (
        <MidiMiniPreview notes={clip.midiData.notes} durationBeats={clip.durationBeats} />
      )}
    </div>
  );
});

/** Memoized MIDI note mini-preview */
function MidiMiniPreview({ notes, durationBeats }: { notes: import('../../core/models').MIDINote[]; durationBeats: number }): React.JSX.Element {
  const noteElements = useMemo(() => {
    const pitchRange = 48;
    const minPitch = Math.max(0, Math.min(...notes.map((n) => n.pitch)) - 2);
    return notes.map((note) => {
      const noteLeft = (note.startBeat / durationBeats) * 100;
      const noteWidth = (note.durationBeats / durationBeats) * 100;
      const noteTop = (1 - (note.pitch - minPitch) / pitchRange) * 100;
      return (
        <div
          key={note.id}
          className="absolute bg-white/50 rounded-[1px]"
          style={{
            left: `${noteLeft}%`,
            width: `${Math.max(noteWidth, 1)}%`,
            top: `${Math.max(0, Math.min(95, noteTop))}%`,
            height: '3px',
          }}
        />
      );
    });
  }, [notes, durationBeats]);

  return (
    <div className="absolute inset-x-0 top-4 bottom-0 overflow-hidden">
      {noteElements}
    </div>
  );
}

export { ClipView };
