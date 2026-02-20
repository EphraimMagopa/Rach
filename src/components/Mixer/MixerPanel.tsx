import { ChevronDown, ChevronUp } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { useAudioEngine } from '../../hooks/use-audio-engine';
import { MixerStrip } from './MixerStrip';
import { VUMeter } from './VUMeter';

export function MixerPanel(): React.JSX.Element {
  const project = useProjectStore((s) => s.project);
  const panelVisibility = useUIStore((s) => s.panelVisibility);
  const togglePanel = useUIStore((s) => s.togglePanel);
  const { engine: audioEngine } = useAudioEngine();
  const isVisible = panelVisibility.mixer;

  return (
    <div className="border-t border-rach-border shrink-0">
      {/* Toggle bar */}
      <button
        data-tutorial="mixer-toggle"
        onClick={() => togglePanel('mixer')}
        className="w-full h-8 bg-rach-surface flex items-center justify-center hover:bg-rach-surface-light transition-colors"
      >
        {isVisible ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        <span className="text-xs text-rach-text-muted ml-1">MIXER</span>
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
              {/* Master strip */}
              <div className="w-24 shrink-0 flex flex-col items-center py-2 px-1 bg-rach-surface-light border-l-2 border-rach-primary">
                <div className="text-[10px] text-rach-primary font-bold mb-2">MASTER</div>
                <div className="flex-1 flex items-center justify-center gap-1">
                  <div className="relative w-4 h-28 bg-rach-bg rounded">
                    <div
                      className="w-full rounded-b bg-rach-primary/50 absolute bottom-0"
                      style={{ height: `${Math.max(0, Math.min(100, ((project.masterBus.volume + 60) / 66) * 100))}%` }}
                    />
                    <input
                      type="range"
                      min={-60}
                      max={6}
                      step={0.1}
                      value={project.masterBus.volume}
                      onChange={(e) => {
                        useProjectStore.setState((state) => ({
                          project: {
                            ...state.project,
                            masterBus: { ...state.project.masterBus, volume: Number(e.target.value) },
                          },
                        }));
                      }}
                      className="absolute inset-0 w-full h-full mixer-fader-vertical"
                      style={{ writingMode: 'vertical-lr', direction: 'rtl' }}
                    />
                  </div>
                  <VUMeter analyserNode={audioEngine.getMasterAnalyser()} />
                </div>
                <div className="text-[10px] text-rach-text-muted tabular-nums mt-1">
                  {project.masterBus.volume.toFixed(1)} dB
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
