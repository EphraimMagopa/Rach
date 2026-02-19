import type { Track } from '@/core/models'
import { TRACK_COLOR_MAP } from '@/core/models'
import { useProjectStore } from '@/stores/project-store'

interface MixerStripProps {
  track: Track
}

export function MixerStrip({ track }: MixerStripProps): React.JSX.Element {
  const { selectedTrackId, selectTrack, updateTrack } = useProjectStore()
  const isSelected = selectedTrackId === track.id
  const color = TRACK_COLOR_MAP[track.color]

  const volumePercent = Math.max(0, Math.min(100, ((track.volume + 60) / 66) * 100))

  return (
    <div
      className={`w-20 shrink-0 flex flex-col items-center py-2 px-1 border-r border-rach-border cursor-pointer transition-colors ${
        isSelected ? 'bg-rach-surface-light' : 'bg-rach-surface'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Track name */}
      <div className="text-[10px] text-rach-text truncate w-full text-center mb-2">
        {track.name}
      </div>

      {/* Volume fader */}
      <div className="flex-1 flex flex-col items-center justify-end w-full mb-2">
        <div className="relative w-4 h-28 bg-rach-bg rounded">
          <div
            className="absolute bottom-0 w-full rounded-b transition-all"
            style={{
              height: `${volumePercent}%`,
              backgroundColor: color,
              opacity: track.muted ? 0.3 : 0.7,
            }}
          />
        </div>
        <input
          type="range"
          min={-60}
          max={6}
          step={0.1}
          value={track.volume}
          onChange={(e) => {
            e.stopPropagation()
            updateTrack(track.id, { volume: Number(e.target.value) })
          }}
          onClick={(e) => e.stopPropagation()}
          className="w-28 -rotate-90 absolute opacity-0 cursor-pointer"
          style={{ marginTop: '3.5rem' }}
        />
      </div>

      {/* Volume readout */}
      <div className="text-[10px] text-rach-text-muted tabular-nums mb-1">
        {track.volume === -60 ? '-∞' : `${track.volume.toFixed(1)}`} dB
      </div>

      {/* Pan knob (simplified) */}
      <div className="text-[10px] text-rach-text-muted mb-2">
        {track.pan === 0 ? 'C' : track.pan < 0 ? `L${Math.abs(Math.round(track.pan * 100))}` : `R${Math.round(track.pan * 100)}`}
      </div>

      {/* Mute / Solo / Arm */}
      <div className="flex gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            updateTrack(track.id, { muted: !track.muted })
          }}
          className={`w-5 h-4 rounded text-[9px] font-bold transition-colors ${
            track.muted ? 'bg-yellow-500/20 text-yellow-500' : 'text-rach-text-muted'
          }`}
        >
          M
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            updateTrack(track.id, { soloed: !track.soloed })
          }}
          className={`w-5 h-4 rounded text-[9px] font-bold transition-colors ${
            track.soloed ? 'bg-rach-accent/20 text-rach-accent' : 'text-rach-text-muted'
          }`}
        >
          S
        </button>
      </div>

      {/* Color indicator */}
      <div className="w-full h-1 mt-2 rounded" style={{ backgroundColor: color }} />
    </div>
  )
}
