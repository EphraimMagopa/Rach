import { Plus } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { TimelineRuler } from './TimelineRuler'
import { TrackHeader } from './TrackHeader'
import type { Track, TrackColor } from '@/core/models'

const TRACK_COLORS: TrackColor[] = ['blue', 'green', 'orange', 'purple', 'cyan', 'red', 'yellow', 'pink']

function createTrack(type: 'audio' | 'midi', index: number): Track {
  return {
    id: crypto.randomUUID(),
    name: `${type === 'audio' ? 'Audio' : 'MIDI'} ${index + 1}`,
    type,
    color: TRACK_COLORS[index % TRACK_COLORS.length],
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    armed: false,
    height: 64,
    clips: [],
    effects: [],
    automationLanes: [],
    input: { type: type === 'midi' ? 'midi' : 'mic' },
    output: { type: 'master' },
  }
}

export function Timeline(): React.JSX.Element {
  const { project, addTrack } = useProjectStore()
  const { zoomX } = useUIStore()
  const tracks = project.tracks

  const barWidth = 120 * zoomX
  const totalBars = 64
  const gridWidth = barWidth * totalBars
  const trackHeaderWidth = 180

  const handleAddTrack = (type: 'audio' | 'midi'): void => {
    addTrack(createTrack(type, tracks.length))
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Ruler row */}
      <div className="flex shrink-0">
        <div className="shrink-0 bg-rach-surface border-b border-r border-rach-border" style={{ width: trackHeaderWidth }} />
        <div className="flex-1 overflow-hidden">
          <TimelineRuler />
        </div>
      </div>

      {/* Tracks area */}
      <div className="flex-1 overflow-auto">
        <div className="flex flex-col">
          {tracks.map((track) => (
            <div key={track.id} className="flex">
              {/* Header */}
              <div className="shrink-0 border-r border-rach-border" style={{ width: trackHeaderWidth }}>
                <TrackHeader track={track} />
              </div>
              {/* Track lane */}
              <div
                className="h-16 border-b border-rach-border relative"
                style={{ width: gridWidth }}
              >
                {/* Grid lines */}
                {Array.from({ length: totalBars }, (_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 h-full border-r border-rach-border/30"
                    style={{ left: i * barWidth }}
                  />
                ))}
              </div>
            </div>
          ))}

          {/* Add track buttons */}
          <div className="flex items-center gap-2 p-3" style={{ marginLeft: 0 }}>
            <button
              onClick={() => handleAddTrack('audio')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <Plus size={14} />
              Audio Track
            </button>
            <button
              onClick={() => handleAddTrack('midi')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <Plus size={14} />
              MIDI Track
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
