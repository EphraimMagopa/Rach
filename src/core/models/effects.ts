export type EffectType =
  | 'eq'
  | 'compressor'
  | 'reverb'
  | 'delay'
  | 'chorus'
  | 'distortion'
  | 'limiter'
  | 'gate';

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
}
