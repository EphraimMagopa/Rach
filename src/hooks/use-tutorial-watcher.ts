import { useEffect } from 'react';
import { useProjectStore } from '../stores/project-store';
import { useUIStore } from '../stores/ui-store';
import { useTutorialStore } from '../stores/tutorial-store';

/**
 * Watches project state changes and auto-advances tutorial steps
 * when the user completes the required action.
 */
export function useTutorialWatcher(): void {
  const isActive = useTutorialStore((s) => s.isActive);
  const currentStep = useTutorialStore((s) => s.currentStep);
  const nextStep = useTutorialStore((s) => s.nextStep);
  const tracks = useProjectStore((s) => s.project.tracks);
  const toolMode = useUIStore((s) => s.toolMode);
  const panelVisibility = useUIStore((s) => s.panelVisibility);

  useEffect(() => {
    if (!isActive) return;

    switch (currentStep) {
      case 'create-track':
        // Auto-advance when user adds a MIDI track
        if (tracks.some((t) => t.type === 'midi')) {
          nextStep();
        }
        break;

      case 'add-clip':
        // Auto-advance when user switches to draw mode
        if (toolMode === 'draw') {
          // Check if any MIDI track has a clip
          const hasMidiClip = tracks.some(
            (t) => t.type === 'midi' && t.clips.length > 0
          );
          if (hasMidiClip) {
            nextStep();
          }
        }
        break;

      case 'draw-notes':
        // Auto-advance when user draws at least one note
        {
          const hasNotes = tracks.some((t) =>
            t.clips.some(
              (c) => c.type === 'midi' && c.midiData && c.midiData.notes.length > 0
            )
          );
          if (hasNotes) {
            nextStep();
          }
        }
        break;

      case 'open-mixer':
        // Auto-advance when mixer is visible
        if (panelVisibility.mixer) {
          nextStep();
        }
        break;

      case 'add-effect':
        // Auto-advance when any track has an effect
        if (tracks.some((t) => t.effects.length > 0)) {
          nextStep();
        }
        break;

      case 'use-ai':
        // Auto-advance when AI panel is visible
        if (panelVisibility.ai) {
          nextStep();
        }
        break;
    }
  }, [isActive, currentStep, tracks, toolMode, panelVisibility, nextStep]);
}
