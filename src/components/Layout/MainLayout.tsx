import { TransportBar } from '@/components/Transport/TransportBar';
import { Timeline } from '@/components/Timeline/Timeline';
import { MixerPanel } from '@/components/Mixer/MixerPanel';
import { PianoRoll } from '@/components/PianoRoll/PianoRoll';
import { AIPanel } from '@/components/AI/AIPanel';
import { useUIStore } from '@/stores/ui-store';
import { useProjectStore } from '@/stores/project-store';

export function MainLayout(): React.JSX.Element {
  const { panelVisibility } = useUIStore();
  const selectedClipId = useProjectStore((s) => s.selectedClipId);

  // Show piano roll if a clip is selected and pianoRoll panel is visible
  const showPianoRoll = panelVisibility.pianoRoll || selectedClipId !== null;

  return (
    <div className="h-screen w-screen flex flex-col bg-rach-bg overflow-hidden">
      {/* Transport bar */}
      <TransportBar />

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Timeline (takes remaining space) */}
        <Timeline />

        {/* AI panel (right side, toggleable) */}
        {panelVisibility.ai && <AIPanel />}
      </div>

      {/* Piano Roll (bottom, shown when clip selected) */}
      {showPianoRoll && (
        <div className="h-52 border-t border-rach-border shrink-0">
          <PianoRoll />
        </div>
      )}

      {/* Mixer panel (bottom, toggleable) */}
      <MixerPanel />
    </div>
  );
}
