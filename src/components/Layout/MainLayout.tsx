import { TransportBar } from '../Transport/TransportBar';
import { Timeline } from '../Timeline/Timeline';
import { SessionView } from '../SessionView/SessionView';
import { MixerPanel } from '../Mixer/MixerPanel';
import { PianoRoll } from '../PianoRoll/PianoRoll';
import { AIPanel } from '../AI/AIPanel';
import { useUIStore } from '../../stores/ui-store';
import { useProjectStore } from '../../stores/project-store';

export function MainLayout(): React.JSX.Element {
  const { panelVisibility, activeView, setActiveView } = useUIStore();
  const selectedClipId = useProjectStore((s) => s.selectedClipId);

  // Show piano roll if a clip is selected and pianoRoll panel is visible
  const showPianoRoll = panelVisibility.pianoRoll || selectedClipId !== null;

  return (
    <div className="h-screen w-screen flex flex-col bg-rach-bg overflow-hidden">
      {/* Transport bar */}
      <TransportBar />

      {/* View toggle bar */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-rach-surface border-b border-rach-border shrink-0">
        <button
          onClick={() => setActiveView('timeline')}
          className={`px-3 py-0.5 rounded text-[10px] font-medium transition-colors ${
            activeView === 'timeline'
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveView('session')}
          className={`px-3 py-0.5 rounded text-[10px] font-medium transition-colors ${
            activeView === 'session'
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
        >
          Session
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {activeView === 'timeline' ? <Timeline /> : <SessionView />}

        {/* AI panel (right side, toggleable) */}
        {panelVisibility.ai && <AIPanel />}
      </div>

      {/* Piano Roll (bottom, shown when clip selected in timeline view) */}
      {activeView === 'timeline' && showPianoRoll && (
        <div className="h-52 border-t border-rach-border shrink-0">
          <PianoRoll />
        </div>
      )}

      {/* Mixer panel (bottom, toggleable) */}
      <MixerPanel />
    </div>
  );
}
