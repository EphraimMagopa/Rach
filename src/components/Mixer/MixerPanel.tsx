import { ChevronDown, ChevronUp } from 'lucide-react'
import { useProjectStore } from '@/stores/project-store'
import { useUIStore } from '@/stores/ui-store'
import { MixerStrip } from './MixerStrip'

export function MixerPanel(): React.JSX.Element {
  const { project } = useProjectStore()
  const { panelVisibility, togglePanel } = useUIStore()
  const isVisible = panelVisibility.mixer

  return (
    <div className="border-t border-rach-border shrink-0">
      {/* Toggle bar */}
      <button
        onClick={() => togglePanel('mixer')}
        className="w-full h-6 bg-rach-surface flex items-center justify-center hover:bg-rach-surface-light transition-colors"
      >
        {isVisible ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
        <span className="text-[10px] text-rach-text-muted ml-1">MIXER</span>
      </button>

      {isVisible && (
        <div className="h-52 bg-rach-surface flex overflow-x-auto">
          {project.tracks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-rach-text-muted">
              No tracks — add a track to see mixer strips
            </div>
          ) : (
            <>
              {project.tracks.map((track) => (
                <MixerStrip key={track.id} track={track} />
              ))}
              {/* Master strip placeholder */}
              <div className="w-20 shrink-0 flex flex-col items-center py-2 px-1 bg-rach-surface-light border-l-2 border-rach-primary">
                <div className="text-[10px] text-rach-primary font-bold mb-2">MASTER</div>
                <div className="flex-1 flex items-center justify-center">
                  <div className="w-4 h-28 bg-rach-bg rounded">
                    <div
                      className="w-full rounded-b bg-rach-primary/50"
                      style={{ height: '80%', marginTop: '20%' }}
                    />
                  </div>
                </div>
                <div className="text-[10px] text-rach-text-muted tabular-nums mt-1">
                  0.0 dB
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
