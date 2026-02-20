import React, { useCallback } from 'react';
import { getInstrumentManager } from '../../hooks/use-transport';
import { useProjectStore } from '../../stores/project-store';

interface KeyInfo {
  pitch: number;
  name: string;
  octave: number;
  isBlack: boolean;
  label: string;
}

interface PianoKeysProps {
  keys: KeyInfo[];
  rowHeight: number;
}

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export function buildKeyList(): KeyInfo[] {
  return Array.from({ length: 88 }, (_, i) => {
    const pitch = i + 21; // A0 = MIDI 21
    const name = NOTE_NAMES[pitch % 12];
    const octave = Math.floor(pitch / 12) - 1;
    const isBlack = name.includes('#');
    return { pitch, name, octave, isBlack, label: `${name}${octave}` };
  }).reverse();
}

const PianoKeys = React.memo(function PianoKeys({ keys, rowHeight }: PianoKeysProps): React.JSX.Element {
  const previewNote = useCallback((pitch: number) => {
    const selectedClipId = useProjectStore.getState().selectedClipId;
    if (!selectedClipId) return;

    // Find the track that owns this clip
    const tracks = useProjectStore.getState().project.tracks;
    const track = tracks.find((t) => t.clips.some((c) => c.id === selectedClipId));
    if (!track) return;

    const im = getInstrumentManager();
    const synth = im?.getSynth(track.id);
    if (synth) {
      synth.noteOn(pitch, 100);
      setTimeout(() => synth.noteOff(pitch), 200);
    }
  }, []);

  return (
    <div className="w-14 shrink-0 border-r border-rach-border select-none">
      {keys.map((key) => (
        <div
          key={key.pitch}
          className={`border-b flex items-center justify-end pr-1 text-[8px] cursor-pointer transition-colors ${
            key.isBlack
              ? 'bg-rach-bg text-rach-text-muted border-rach-border/30 hover:bg-rach-surface-light'
              : 'bg-rach-surface text-rach-text-muted border-rach-border/20 hover:bg-rach-surface-light'
          }`}
          style={{ height: rowHeight }}
          onMouseDown={() => previewNote(key.pitch)}
        >
          {key.name === 'C' && key.label}
        </div>
      ))}
    </div>
  );
});

export { PianoKeys };
