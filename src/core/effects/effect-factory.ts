import type { EffectType } from '../models/effects';
import type { EffectCategory, RachEffectInstance } from './effect-interface';

import { VCACompressor } from './compressor-vca';
import { FETCompressor } from './compressor-fet';
import { OpticalCompressor } from './compressor-optical';
import { Limiter } from './limiter';
import { GateExpander } from './gate-expander';
import { MultibandCompressor } from './multiband-compressor';
import { TransientShaper } from './transient-shaper';
import { ParametricEQ } from './parametric-eq';
import { GraphicEQ } from './graphic-eq';
import { HighLowPassFilter } from './highlow-pass';
import { FormantFilter } from './formant-filter';
import { AlgorithmicReverb } from './reverb-algorithmic';
import { ConvolutionReverb } from './reverb-convolution';
import { PingPongDelay } from './delay-pingpong';
import { TapeDelay } from './delay-tape';
import { AnalogDelay } from './delay-analog';
import { Chorus } from './chorus';
import { Flanger } from './flanger';
import { Phaser } from './phaser';
import { Vocoder } from './vocoder';
import { PitchShifter } from './pitch-shifter';
import { AutoPan } from './auto-pan';
import { SpectralProcessing } from './spectral-processing';
import { Distortion } from './distortion';

/** Resolve legacy Phase 1 type names to canonical Phase 2 types. */
function resolveEffectType(type: EffectType): EffectType {
  const legacyMap: Partial<Record<EffectType, EffectType>> = {
    eq: 'parametric-eq',
    compressor: 'compressor-vca',
    reverb: 'reverb-algorithmic',
    delay: 'delay-pingpong',
    gate: 'gate-expander',
  };
  return legacyMap[type] ?? type;
}

export function createEffect(type: EffectType, context: AudioContext): RachEffectInstance {
  const resolved = resolveEffectType(type);
  switch (resolved) {
    case 'compressor-vca': return new VCACompressor(context);
    case 'compressor-fet': return new FETCompressor(context);
    case 'compressor-optical': return new OpticalCompressor(context);
    case 'limiter': return new Limiter(context);
    case 'gate-expander': return new GateExpander(context);
    case 'multiband-compressor': return new MultibandCompressor(context);
    case 'transient-shaper': return new TransientShaper(context);
    case 'parametric-eq': return new ParametricEQ(context);
    case 'graphic-eq': return new GraphicEQ(context);
    case 'highlow-pass': return new HighLowPassFilter(context);
    case 'formant-filter': return new FormantFilter(context);
    case 'reverb-algorithmic': return new AlgorithmicReverb(context);
    case 'reverb-convolution': return new ConvolutionReverb(context);
    case 'delay-pingpong': return new PingPongDelay(context);
    case 'delay-tape': return new TapeDelay(context);
    case 'delay-analog': return new AnalogDelay(context);
    case 'chorus': return new Chorus(context);
    case 'flanger': return new Flanger(context);
    case 'phaser': return new Phaser(context);
    case 'vocoder': return new Vocoder(context);
    case 'pitch-shifter': return new PitchShifter(context);
    case 'auto-pan': return new AutoPan(context);
    case 'spectral-processing': return new SpectralProcessing(context);
    case 'distortion': return new Distortion(context);
    default:
      throw new Error(`Unknown effect type: ${type}`);
  }
}

/** All creatable effect types (excludes VST3 and legacy aliases). */
export const ALL_EFFECT_TYPES: EffectType[] = [
  'compressor-vca', 'compressor-fet', 'compressor-optical', 'limiter',
  'gate-expander', 'multiband-compressor', 'transient-shaper',
  'parametric-eq', 'graphic-eq', 'highlow-pass', 'formant-filter',
  'reverb-algorithmic', 'reverb-convolution',
  'delay-pingpong', 'delay-tape', 'delay-analog',
  'chorus', 'flanger', 'phaser',
  'vocoder', 'pitch-shifter', 'auto-pan', 'spectral-processing', 'distortion',
];

export const EFFECT_LABELS: Record<string, string> = {
  'compressor-vca': 'VCA Compressor',
  'compressor-fet': 'FET Compressor',
  'compressor-optical': 'Optical Compressor',
  'limiter': 'Limiter',
  'gate-expander': 'Gate / Expander',
  'multiband-compressor': 'Multiband Compressor',
  'transient-shaper': 'Transient Shaper',
  'parametric-eq': 'Parametric EQ',
  'graphic-eq': 'Graphic EQ (31-band)',
  'highlow-pass': 'High/Low Pass Filter',
  'formant-filter': 'Formant Filter',
  'reverb-algorithmic': 'Algorithmic Reverb',
  'reverb-convolution': 'Convolution Reverb',
  'delay-pingpong': 'Ping-Pong Delay',
  'delay-tape': 'Tape Delay',
  'delay-analog': 'Analog Delay',
  'chorus': 'Chorus',
  'flanger': 'Flanger',
  'phaser': 'Phaser',
  'vocoder': 'Vocoder',
  'pitch-shifter': 'Pitch Shifter',
  'auto-pan': 'Auto Pan',
  'spectral-processing': 'Spectral Processing',
  'distortion': 'Distortion',
};

export const EFFECT_CATEGORIES: Record<string, EffectCategory> = {
  'compressor-vca': 'dynamics',
  'compressor-fet': 'dynamics',
  'compressor-optical': 'dynamics',
  'limiter': 'dynamics',
  'gate-expander': 'dynamics',
  'multiband-compressor': 'dynamics',
  'transient-shaper': 'dynamics',
  'parametric-eq': 'eq-filter',
  'graphic-eq': 'eq-filter',
  'highlow-pass': 'eq-filter',
  'formant-filter': 'eq-filter',
  'reverb-algorithmic': 'time-based',
  'reverb-convolution': 'time-based',
  'delay-pingpong': 'time-based',
  'delay-tape': 'time-based',
  'delay-analog': 'time-based',
  'chorus': 'time-based',
  'flanger': 'time-based',
  'phaser': 'time-based',
  'vocoder': 'creative',
  'pitch-shifter': 'creative',
  'auto-pan': 'creative',
  'spectral-processing': 'creative',
  'distortion': 'creative',
};
