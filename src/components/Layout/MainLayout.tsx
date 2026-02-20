import React, { Suspense } from 'react';
import { TransportBar } from '../Transport/TransportBar';
import { Timeline } from '../Timeline/Timeline';
import { MixerPanel } from '../Mixer/MixerPanel';
import { AIPanel } from '../AI/AIPanel';
import { TemplateBrowser } from '../Templates/TemplateBrowser';
import { TutorialOverlay } from '../Tutorial/TutorialOverlay';
import { useUIStore } from '../../stores/ui-store';
import { useProjectStore } from '../../stores/project-store';
import { useTutorialStore } from '../../stores/tutorial-store';

// Lazy-loaded heavy components
const PianoRoll = React.lazy(() =>
  import('../PianoRoll/PianoRoll').then((m) => ({ default: m.PianoRoll }))
);
const SessionView = React.lazy(() =>
  import('../SessionView/SessionView').then((m) => ({ default: m.SessionView }))
);

function LazyFallback(): React.JSX.Element {
  return (
    <div className="flex-1 flex items-center justify-center text-sm text-rach-text-muted">
      Loading...
    </div>
  );
}

export function MainLayout(): React.JSX.Element {
  const { panelVisibility, activeView, setActiveView, togglePanel, setTemplateBrowserOpen, templateBrowserOpen } = useUIStore();
  const selectedClipId = useProjectStore((s) => s.selectedClipId);

  // Show piano roll if a clip is selected and pianoRoll panel is visible
  const showPianoRoll = panelVisibility.pianoRoll || selectedClipId !== null;

  return (
    <div className="h-screen w-full max-w-[1920px] mx-auto flex flex-col bg-rach-bg overflow-hidden">
      {/* Transport bar */}
      <TransportBar />

      {/* View toggle bar */}
      <div className="flex items-center gap-1 px-2 py-0.5 bg-rach-surface border-b border-rach-border shrink-0">
        <button
          onClick={() => setActiveView('timeline')}
          className={`px-3 py-0.5 rounded text-xs font-medium transition-colors ${
            activeView === 'timeline'
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
        >
          Timeline
        </button>
        <button
          onClick={() => setActiveView('session')}
          className={`px-3 py-0.5 rounded text-xs font-medium transition-colors ${
            activeView === 'session'
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
        >
          Session
        </button>

        <div className="flex-1" />

        <button
          onClick={() => togglePanel('ai')}
          className={`px-3 py-0.5 rounded text-xs font-medium transition-colors ${
            panelVisibility.ai
              ? 'bg-rach-accent/20 text-rach-accent'
              : 'text-rach-text-muted hover:text-rach-text'
          }`}
        >
          AI
        </button>
        <button
          onClick={() => setTemplateBrowserOpen(true)}
          className="px-3 py-0.5 rounded text-xs font-medium transition-colors text-rach-text-muted hover:text-rach-text"
        >
          Templates
        </button>
        <button
          onClick={() => useTutorialStore.getState().startTutorial()}
          className="px-3 py-0.5 rounded text-xs font-medium transition-colors text-rach-text-muted hover:text-rach-text"
        >
          Help
        </button>
      </div>

      {/* Main content area */}
      <div className="flex-1 flex overflow-hidden">
        <Suspense fallback={<LazyFallback />}>
          {activeView === 'timeline' ? <Timeline /> : <SessionView />}
        </Suspense>

        {/* AI panel (right side, toggleable) */}
        {panelVisibility.ai && <AIPanel />}
      </div>

      {/* Piano Roll (bottom, shown when clip selected in timeline view) */}
      {activeView === 'timeline' && showPianoRoll && (
        <div className="h-52 border-t border-rach-border shrink-0">
          <Suspense fallback={<LazyFallback />}>
            <PianoRoll />
          </Suspense>
        </div>
      )}

      {/* Mixer panel (bottom, toggleable) */}
      <MixerPanel />

      {/* Template browser modal */}
      {templateBrowserOpen && <TemplateBrowser />}

      {/* Tutorial overlay */}
      <TutorialOverlay />
    </div>
  );
}
