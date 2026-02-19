export type EffectType =
  // Legacy Phase 1 types (kept for backward compat)
  | 'eq'
  | 'compressor'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion'
  | 'limiter'
  | 'gate'
  // Phase 2: Dynamics
  | 'compressor-vca'
  | 'compressor-fet'
  | 'compressor-optical'
  | 'gate-expander'
  | 'multiband-compressor'
  | 'transient-shaper'
  // Phase 2: EQ & Filters
  | 'parametric-eq'
  | 'graphic-eq'
  | 'highlow-pass'
  | 'formant-filter'
  // Phase 2: Time-Based
  | 'reverb-algorithmic'
  | 'reverb-convolution'
  | 'delay-pingpong'
  | 'delay-tape'
  | 'delay-analog'
  | 'flanger'
  | 'phaser'
  // Phase 2: Creative
  | 'vocoder'
  | 'pitch-shifter'
  | 'auto-pan'
  | 'spectral-processing'
  // VST3 external plugin
  | 'vst3';

/** Maps old Phase 1 names to their Phase 2 equivalents. */
export const LEGACY_EFFECT_MAP: Partial<Record<EffectType, EffectType>> = {
  eq: 'parametric-eq',
  compressor: 'compressor-vca',
  reverb: 'reverb-algorithmic',
  delay: 'delay-pingpong',
  limiter: 'limiter',
  gate: 'gate-expander',
  chorus: 'chorus',
  distortion: 'distortion',
};

export interface EffectParameter {
  id: string;
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

export interface EffectPreset {
  id: string;
  name: string;
  parameters: Record<string, number>;
}

export interface EffectInstance {
  id: string;
  type: EffectType;
  name: string;
  enabled: boolean;
  parameters: EffectParameter[];
  presets: EffectPreset[];
  /** VST3 plugin path (only for type 'vst3') */
  pluginPath?: string;
  /** VST3 plugin unique ID (only for type 'vst3') */
  pluginId?: string;
  /** VST3 plugin state blob (only for type 'vst3') */
  pluginState?: string;
}
