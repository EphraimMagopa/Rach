import { useEffect } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { useSessionStore } from '../../stores/session-store';
import { ClipSlot } from './ClipSlot';
import { SceneRow } from './SceneRow';
import type { TrackColor } from '../../core/models';

export function SessionView(): React.JSX.Element {
  const { project } = useProjectStore();
  const {
    scenes,
    clipSlots,
    setSlotState,
    ensureSlotsForTracks,
  } = useSessionStore();

  const tracks = project.tracks;

  // Ensure clip slots exist for all tracks
  useEffect(() => {
    ensureSlotsForTracks(tracks.map((t) => t.id));
  }, [tracks, ensureSlotsForTracks]);

  const handleLaunch = (slotId: string) => {
    setSlotState(slotId, 'playing');
  };

  const handleStop = (slotId: string) => {
    setSlotState(slotId, 'stopped');
  };

  const handleLaunchScene = (sceneIndex: number) => {
    // Launch all clips in this scene
    const sceneSlots = clipSlots.filter((s) => s.sceneIndex === sceneIndex && s.clip);
    for (const slot of sceneSlots) {
      setSlotState(slot.id, 'playing');
    }
    // Stop all other playing clips
    for (const slot of clipSlots) {
      if (slot.sceneIndex !== sceneIndex && slot.launchState === 'playing') {
        setSlotState(slot.id, 'stopped');
      }
    }
  };

  const getSlot = (trackId: string, sceneIndex: number) => {
    return clipSlots.find((s) => s.trackId === trackId && s.sceneIndex === sceneIndex);
  };

  if (tracks.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-sm text-rach-text-muted">
        No tracks — add tracks in Timeline view first
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto p-2">
      <div className="flex gap-0.5">
        {/* Scene launch buttons column */}
        <div className="shrink-0">
          <div className="h-8" /> {/* Header spacer */}
          {scenes.map((scene) => (
            <SceneRow key={scene.id} scene={scene} onLaunchScene={handleLaunchScene} />
          ))}
        </div>

        {/* Track columns */}
        {tracks.map((track) => (
          <div key={track.id} className="shrink-0">
            {/* Track header */}
            <div className="h-8 flex items-center justify-center">
              <span className="text-[9px] text-rach-text font-medium truncate w-24 text-center">
                {track.name}
              </span>
            </div>
            {/* Clip slots */}
            {scenes.map((scene) => {
              const slot = getSlot(track.id, scene.index);
              if (!slot) return <div key={scene.id} className="w-24 h-10" />;
              return (
                <ClipSlot
                  key={slot.id}
                  slot={slot}
                  trackColor={track.color as TrackColor}
                  onLaunch={handleLaunch}
                  onStop={handleStop}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
