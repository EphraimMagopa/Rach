import type { Track } from '@/core/models'
import { TRACK_COLOR_MAP } from '@/core/models'
import { useProjectStore } from '@/stores/project-store'

interface TrackHeaderProps {
  track: Track
}

export function TrackHeader({ track }: TrackHeaderProps): React.JSX.Element {
  const { selectedTrackId, selectTrack, updateTrack } = useProjectStore()
  const isSelected = selectedTrackId === track.id
  const color = TRACK_COLOR_MAP[track.color]

  return (
    <div
      className={`h-16 border-b border-rach-border flex items-center px-2 gap-2 cursor-pointer transition-colors ${
        isSelected ? 'bg-rach-surface-light' : 'bg-rach-surface hover:bg-rach-surface-light/50'
      }`}
      onClick={() => selectTrack(track.id)}
    >
      {/* Color indicator */}
      <div className="w-1 h-10 rounded-full shrink-0" style={{ backgroundColor: color }} />

      {/* Track name */}
      <div className="flex-1 min-w-0">
        <div className="text-sm text-rach-text truncate">{track.name}</div>
        <div className="text-[10px] text-rach-text-muted uppercase">{track.type}</div>
      </div>

      {/* Track controls */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={(e) => {
            e.stopPropagation()
            updateTrack(track.id, { muted: !track.muted })
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
            e.stopPropagation()
            updateTrack(track.id, { soloed: !track.soloed })
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
            e.stopPropagation()
            updateTrack(track.id, { armed: !track.armed })
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
      </div>
    </div>
  )
}
