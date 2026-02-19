import type { Track } from '../../core/models';
import { TRACK_COLOR_MAP } from '../../core/models';
import { useProjectStore } from '../../stores/project-store';
import { useAudioEngine } from '../../hooks/use-audio-engine';
import { VUMeter } from './VUMeter';
import { EffectRack } from './EffectRack';
import { SendPanel } from './SendPanel';

interface MixerStripProps {
  track: Track;
}

export function MixerStrip({ track }: MixerStripProps): React.JSX.Element {
  const { selectedTrackId, selectTrack, updateTrack } = useProjectStore();
  const { engine: audioEngine } = useAudioEngine();
  const isSelected = selectedTrackId === track.id;
  const color = TRACK_COLOR_MAP[track.color];

  const volumePercent = Math.max(0, Math.min(100, ((track.volume + 60) / 66) * 100));
  const trackNode = audioEngine.getTrackNode(track.id);

  return (
    <div
      className={`w-24 shrink-0 flex flex-col items-center py-2 px-1 border-r border-rach-border cursor-pointer transition-colors ${
        isSelected ? 'bg-rach-surface-light' : 'bg-rach-surface'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track name */}
      <div className="text-[10px] text-rach-text truncate w-full text-center mb-1">
        {track.name}
      </div>

      {/* Effect Rack */}
      <div className="w-full mb-1 max-h-20 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <EffectRack trackId={track.id} effects={track.effects} />
      </div>

      {/* Send Panel (only for non-bus tracks) */}
      {track.type !== 'bus' && (
        <div className="w-full mb-1" onClick={(e) => e.stopPropagation()}>
          <SendPanel track={track} />
        </div>
      )}

      {/* Volume fader + VU meter */}
      <div className="flex-1 flex items-center justify-center gap-1 w-full mb-1">
        <div className="relative w-4 h-20 bg-rach-bg rounded">
          <div
            className="absolute bottom-0 w-full rounded-b transition-all"
            style={{
              height: `${volumePercent}%`,
              backgroundColor: color,
              opacity: track.muted ? 0.3 : 0.7,
            }}
          />
          <input
            type="range"
            min={-60}
            max={6}
            step={0.1}
            value={track.volume}
            onChange={(e) => {
              e.stopPropagation();
              updateTrack(track.id, { volume: Number(e.target.value) });
            }}
            onClick={(e) => e.stopPropagation()}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
          />
        </div>
        <VUMeter analyserNode={trackNode?.analyserNode ?? null} />
      </div>

      {/* Volume readout */}
      <div className="text-[10px] text-rach-text-muted tabular-nums mb-1">
        {track.volume <= -60 ? '-∞' : `${track.volume.toFixed(1)}`} dB
      </div>

      {/* Pan control */}
      <div className="flex items-center gap-0.5 mb-1">
        <input
          type="range"
          min={-100}
          max={100}
          value={Math.round(track.pan * 100)}
          onChange={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { pan: Number(e.target.value) / 100 });
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-14 h-2 cursor-pointer"
        />
      </div>
      <div className="text-[10px] text-rach-text-muted mb-1">
        {track.pan === 0
          ? 'C'
          : track.pan < 0
          ? `L${Math.abs(Math.round(track.pan * 100))}`
          : `R${Math.round(track.pan * 100)}`}
      </div>

      {/* Mute / Solo */}
      <div className="flex gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { muted: !track.muted });
          }}
          className={`w-5 h-4 rounded text-[9px] font-bold transition-colors ${
            track.muted ? 'bg-yellow-500/20 text-yellow-500' : 'text-rach-text-muted'
          }`}
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            updateTrack(track.id, { soloed: !track.soloed });
          }}
          className={`w-5 h-4 rounded text-[9px] font-bold transition-colors ${
            track.soloed ? 'bg-rach-accent/20 text-rach-accent' : 'text-rach-text-muted'
          }`}
        >
          S
        </button>
      </div>

      {/* Color indicator */}
      <div className="w-full h-1 mt-1 rounded" style={{ backgroundColor: color }} />
    </div>
  );
}
