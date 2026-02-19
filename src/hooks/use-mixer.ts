import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/project-store';
import { AudioEngine } from '../core/audio/audio-engine';
import { RoutingEngine } from '../core/audio/routing-engine';

let sharedRoutingEngine: RoutingEngine | null = null;

export function getRoutingEngine(): RoutingEngine | null {
  return sharedRoutingEngine;
}

/**
 * Bridge hook: pushes track volume/pan/mute/solo changes to AudioEngine nodes.
 * Also manages send/return routing via RoutingEngine.
 */
export function useMixer(audioEngine: AudioEngine): void {
  const routingRef = useRef<RoutingEngine | null>(null);

  if (!routingRef.current) {
    routingRef.current = new RoutingEngine(audioEngine);
    sharedRoutingEngine = routingRef.current;
  }

  const routing = routingRef.current;

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

        // Handle sends changes
        const sends = track.sends ?? [];
        const prevSends = prevTrack?.sends ?? [];
        if (sends !== prevSends) {
          // Find removed sends
          for (const prevSend of prevSends) {
            if (!sends.find((s) => s.id === prevSend.id)) {
              routing.removeSend(prevSend.id);
            }
          }
          // Update/add sends
          for (const send of sends) {
            const prevSend = prevSends.find((s) => s.id === send.id);
            if (!prevSend || send !== prevSend) {
              routing.updateSend(send, track.id);
            }
          }
        }

        // Handle output routing changes
        if (!prevTrack || track.output !== prevTrack.output) {
          if (track.output.type === 'bus' && track.output.targetId) {
            routing.routeTrackOutput(track.id, track.output.targetId);
          } else {
            routing.routeTrackOutput(track.id, null);
          }
        }
      }

      // Handle removed tracks — clean up sends
      for (const prevTrack of prevTracks) {
        if (!tracks.find((t) => t.id === prevTrack.id)) {
          const prevSends = prevTrack.sends ?? [];
          for (const send of prevSends) {
            routing.removeSend(send.id);
          }
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
  }, [audioEngine, routing]);
}
