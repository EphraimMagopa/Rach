import { useEffect, useRef } from 'react';
import { useProjectStore } from '../stores/project-store';
import { TrackEffectManager } from '../core/effects/track-effect-manager';
import type { AudioEngine } from '../core/audio/audio-engine';
import type { EffectType } from '../core/models/effects';

let sharedEffectManager: TrackEffectManager | null = null;

export function getEffectManager(): TrackEffectManager | null {
  return sharedEffectManager;
}

/**
 * Bridge hook: syncs project store effect state → TrackEffectManager audio graph.
 * Watches track.effects[] changes and pushes them to the audio engine.
 */
export function useEffects(audioEngine: AudioEngine): void {
  const managerRef = useRef<TrackEffectManager | null>(null);

  if (!managerRef.current) {
    managerRef.current = new TrackEffectManager(audioEngine);
    sharedEffectManager = managerRef.current;
  }

  const manager = managerRef.current;

  useEffect(() => {
    // Track which effects we've already instantiated (by effect instance id)
    const instantiatedEffects = new Map<string, { trackId: string; index: number }>();

    const unsub = useProjectStore.subscribe((state, prevState) => {
      if (!audioEngine.isInitialized) return;

      const tracks = state.project.tracks;
      const prevTracks = prevState.project.tracks;

      for (const track of tracks) {
        const prevTrack = prevTracks.find((t) => t.id === track.id);

        // Track effects changed — full resync
        if (!prevTrack || track.effects !== prevTrack.effects) {
          const currentEffects = manager.getEffects(track.id);
          const desiredEffects = track.effects;

          // If count or types differ, rebuild the chain
          const needsRebuild =
            currentEffects.length !== desiredEffects.length ||
            desiredEffects.some((e, i) => {
              const current = currentEffects[i];
              return !current || current.effectType !== e.type;
            });

          if (needsRebuild) {
            manager.clearEffects(track.id);
            instantiatedEffects.forEach((v, k) => {
              if (v.trackId === track.id) instantiatedEffects.delete(k);
            });

            for (let i = 0; i < desiredEffects.length; i++) {
              const effectDef = desiredEffects[i];
              const instance = manager.addEffect(track.id, effectDef.type as EffectType);
              instance.setEnabled(effectDef.enabled);

              // Apply stored parameters
              for (const param of effectDef.parameters) {
                instance.setParameter(param.name, param.value);
              }

              instantiatedEffects.set(effectDef.id, { trackId: track.id, index: i });
            }
          } else {
            // Same structure — check for parameter/enabled changes
            for (let i = 0; i < desiredEffects.length; i++) {
              const effectDef = desiredEffects[i];
              const prevEffectDef = prevTrack?.effects[i];

              if (effectDef.enabled !== prevEffectDef?.enabled) {
                manager.setEffectEnabled(track.id, i, effectDef.enabled);
              }

              // Check individual parameter changes
              for (const param of effectDef.parameters) {
                const prevParam = prevEffectDef?.parameters.find((p) => p.name === param.name);
                if (!prevParam || param.value !== prevParam.value) {
                  manager.setEffectParameter(track.id, i, param.name, param.value);
                }
              }
            }
          }
        }
      }

      // Handle removed tracks
      for (const prevTrack of prevTracks) {
        if (!tracks.find((t) => t.id === prevTrack.id)) {
          manager.clearEffects(prevTrack.id);
        }
      }
    });

    return () => {
      unsub();
    };
  }, [audioEngine, manager]);
}
