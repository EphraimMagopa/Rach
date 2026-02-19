import { useEffect } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { AudioEngine } from '@/core/audio/audio-engine';

/**
 * Bridge hook: pushes track volume/pan/mute/solo changes to AudioEngine nodes.
 * Handles solo logic: when any track is soloed, mute all non-soloed tracks.
 */
export function useMixer(audioEngine: AudioEngine): void {
  useEffect(() => {
    const unsub = useProjectStore.subscribe((state, prevState) => {
      if (!audioEngine.isInitialized) return;

      const tracks = state.project.tracks;
      const prevTracks = prevState.project.tracks;

      // Check if any track is soloed
      const anySoloed = tracks.some((t) => t.soloed);

      for (const track of tracks) {
        const prevTrack = prevTracks.find((t) => t.id === track.id);
        const node = audioEngine.getTrackNode(track.id);
        if (!node) continue;

        // Calculate effective mute state
        const effectivelyMuted = track.muted || (anySoloed && !track.soloed);

        if (!prevTrack || track.volume !== prevTrack.volume || track.muted !== prevTrack.muted) {
          if (effectivelyMuted) {
            node.gainNode.gain.value = 0;
          } else {
            const linear = track.volume === -60 ? 0 : Math.pow(10, track.volume / 20);
            node.gainNode.gain.value = linear;
          }
        }

        // Solo changed — re-evaluate mute for all tracks
        if (!prevTrack || track.soloed !== prevTrack.soloed) {
          for (const t of tracks) {
            const n = audioEngine.getTrackNode(t.id);
            if (!n) continue;
            const muted = t.muted || (anySoloed && !t.soloed);
            if (muted) {
              n.gainNode.gain.value = 0;
            } else {
              n.gainNode.gain.value = t.volume === -60 ? 0 : Math.pow(10, t.volume / 20);
            }
          }
        }

        if (!prevTrack || track.pan !== prevTrack.pan) {
          audioEngine.setTrackPan(track.id, track.pan);
        }
      }

      // Master bus volume
      if (state.project.masterBus.volume !== prevState.project.masterBus.volume) {
        audioEngine.setMasterVolume(state.project.masterBus.volume);
      }
    });

    return () => {
      unsub();
    };
  }, [audioEngine]);
}
