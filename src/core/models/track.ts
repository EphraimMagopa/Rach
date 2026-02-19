import type { Clip } from './clip';
import type { EffectInstance } from './effects';
import type { AutomationLane } from './automation';
import type { Send } from './send';

export type TrackType = 'audio' | 'midi' | 'instrument' | 'bus';

export type TrackColor =
  | 'red' | 'orange' | 'yellow' | 'green'
  | 'cyan' | 'blue' | 'purple' | 'pink';

export const TRACK_COLOR_MAP: Record<TrackColor, string> = {
  red: '#ef4444',
  orange: '#f97316',
  yellow: '#eab308',
  green: '#22c55e',
  cyan: '#06b6d4',
  blue: '#3b82f6',
  purple: '#a855f7',
  pink: '#ec4899',
};

export interface TrackInput {
  type: 'mic' | 'line' | 'midi' | 'virtual';
  deviceId?: string;
  channel?: number;
}

export interface TrackOutput {
  type: 'master' | 'bus';
  targetId?: string;
}

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  color: TrackColor;
  volume: number;       // dB (-Infinity to +6)
  pan: number;           // -1 to 1
  muted: boolean;
  soloed: boolean;
  armed: boolean;
  height: number;        // pixels for UI
  clips: Clip[];
  effects: EffectInstance[];
  automationLanes: AutomationLane[];
  input: TrackInput;
  output: TrackOutput;
  /** Aux sends to bus tracks (Phase 2) */
  sends?: Send[];
  /** Synth type for MIDI/instrument tracks */
  instrumentType?: import('../synths/synth-interface').SynthType;
}
