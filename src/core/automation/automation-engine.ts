import type { AutomationLane } from '../models/automation';
import type { AudioEngine } from '../audio/audio-engine';
import { getAutomationValueAtBeat } from './interpolation';
import { getEffectManager } from '../../hooks/use-effects';

type ParameterSetter = (value: number, time: number) => void;

/**
 * AutomationEngine — registered as a ScheduleCallback on TransportEngine.
 * During lookahead: scans automation lanes, schedules Web Audio parameter changes.
 */
export class AutomationEngine {
  private audioEngine: AudioEngine;
  private getProjectState: () => { tracks: { id: string; automationLanes: AutomationLane[] }[] };

  constructor(
    audioEngine: AudioEngine,
    getProjectState: () => { tracks: { id: string; automationLanes: AutomationLane[] }[] }
  ) {
    this.audioEngine = audioEngine;
    this.getProjectState = getProjectState;
  }

  /**
   * ScheduleCallback signature — called by TransportEngine during lookahead.
   * Scans all automation lanes and schedules parameter changes.
   */
  scheduleRange = (
    fromBeat: number,
    toBeat: number,
    beatToTime: (beat: number) => number
  ): void => {
    const state = this.getProjectState();

    for (const track of state.tracks) {
      for (const lane of track.automationLanes) {
        if (!lane.enabled || lane.points.length === 0) continue;

        this.scheduleAutomationLane(
          lane,
          track.id,
          fromBeat,
          toBeat,
          beatToTime
        );
      }
    }
  };

  private scheduleAutomationLane(
    lane: AutomationLane,
    trackId: string,
    fromBeat: number,
    toBeat: number,
    beatToTime: (beat: number) => number
  ): void {
    const setter = this.resolveTarget(trackId, lane.targetId, lane.parameter);
    if (!setter) return;

    // Sample the automation at regular intervals within the lookahead window
    const stepsPerBeat = 8; // 8 samples per beat for smooth automation
    const beatStep = 1 / stepsPerBeat;
    let beat = Math.ceil(fromBeat * stepsPerBeat) / stepsPerBeat;

    while (beat < toBeat) {
      const value = getAutomationValueAtBeat(lane.points, beat);
      if (value !== null) {
        const time = beatToTime(beat);
        setter(value, time);
      }
      beat += beatStep;
    }
  }

  /**
   * Resolve a (targetId, parameter) pair to a setter function.
   * Supports: track volume, track pan, effect parameters.
   */
  private resolveTarget(
    trackId: string,
    targetId: string,
    parameter: string
  ): ParameterSetter | null {
    const trackNode = this.audioEngine.getTrackNode(trackId);
    if (!trackNode) return null;

    // Track-level parameters
    if (targetId === trackId) {
      switch (parameter) {
        case 'volume':
          return (value: number, time: number) => {
            const linear = value === -60 ? 0 : Math.pow(10, value / 20);
            trackNode.gainNode.gain.setValueAtTime(linear, time);
          };
        case 'pan':
          return (value: number, time: number) => {
            trackNode.panNode.pan.setValueAtTime(
              Math.max(-1, Math.min(1, value)),
              time
            );
          };
      }
    }

    // Effect parameter: targetId is the effect instance id
    const effectManager = getEffectManager();
    if (effectManager) {
      const effects = effectManager.getEffects(trackId);
      const effectIndex = effects.findIndex(
        (_, i) => targetId === `effect-${i}` || targetId === targetId
      );
      if (effectIndex >= 0) {
        return (value: number, _time: number) => {
          effectManager.setEffectParameter(trackId, effectIndex, parameter, value);
        };
      }
    }

    return null;
  }
}
