import { Trash2 } from 'lucide-react';
import type { Track } from '@/core/models';
import { TRACK_COLOR_MAP } from '@/core/models';
import { useProjectStore } from '@/stores/project-store';
import { ALL_SYNTH_TYPES, SYNTH_LABELS } from '@/core/synths/synth-factory';
import type { SynthType } from '@/core/synths/synth-interface';

interface TrackHeaderProps {
  track: Track;
  onSynthChange?: (trackId: string, synthType: SynthType) => void;
}

export function TrackHeader({ track, onSynthChange }: TrackHeaderProps): React.JSX.Element {
  const { selectedTrackId, selectTrack, updateTrack, removeTrack } = useProjectStore();
  const isSelected = selectedTrackId === track.id;
  const color = TRACK_COLOR_MAP[track.color];
  const isMidiTrack = track.type === 'midi' || track.type === 'instrument';

  return (
    <div
      className={`h-16 border-b border-rach-border flex items-center px-2 gap-1.5 cursor-pointer transition-colors ${
        isSelected ? 'bg-rach-surface-light' : 'bg-rach-surface hover:bg-rach-surface-light/50'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Color indicator */}
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />

      {/* Track info */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-rach-text truncate">{track.name}</div>
        {isMidiTrack ? (
          <select
            value={track.instrumentType || 'rach-pad'}
            onChange={(e) => {
              e.stopPropagation();
              const synthType = e.target.value as SynthType;
              updateTrack(track.id, { instrumentType: synthType });
              onSynthChange?.(track.id, synthType);
            }}
            onClick={(e) => e.stopPropagation()}
            className="text-[10px] text-rach-text-muted bg-rach-bg border border-rach-border rounded px-0.5 mt-0.5 w-full max-w-[100px]"
          >
            {ALL_SYNTH_TYPES.map((st) => (
              <option key={st} value={st}>
                {SYNTH_LABELS[st]}
              </option>
            ))}
          </select>
        ) : (
          <div className="text-[10px] text-rach-text-muted uppercase">{track.type}</div>
        )}
      </div>

      {/* Track controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { muted: !track.muted });
          }}
          className={`w-6 h-5 rounded text-[10px] font-bold transition-colors ${
            track.muted
              ? 'bg-yellow-500/20 text-yellow-500'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
          title="Mute"
        >
          M
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { soloed: !track.soloed });
          }}
          className={`w-6 h-5 rounded text-[10px] font-bold transition-colors ${
            track.soloed
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
          title="Solo"
        >
          S
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { armed: !track.armed });
          }}
          className={`w-6 h-5 rounded text-[10px] font-bold transition-colors ${
            track.armed
              ? 'bg-red-500/20 text-red-500'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
          title="Record Arm"
        >
          R
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            removeTrack(track.id);
          }}
          className="w-6 h-5 rounded text-rach-text-muted hover:text-red-400 transition-colors flex items-center justify-center"
          title="Delete Track"
        >
          <Trash2 size={10} />
        </button>
      </div>
    </div>
  );
}
