import type { EffectPreset, EffectType } from '../models/effects';

/**
 * Built-in effect presets organized by effect type.
 * Each preset is a named collection of parameter values that can be loaded
 * onto an EffectInstance to quickly configure a specific sound.
 */

// ─── Helpers ────────────────────────────────────────────────────────────────

let presetCounter = 0;
function preset(name: string, parameters: Record<string, number>): EffectPreset {
  return { id: `preset-${++presetCounter}`, name, parameters };
}

// ─── Compressor Presets ─────────────────────────────────────────────────────

const compressorVcaPresets: EffectPreset[] = [
  preset('Vocal Glue', { threshold: -18, ratio: 3, attack: 0.01, release: 0.15, knee: 10, makeup: 3 }),
  preset('Drum Bus', { threshold: -20, ratio: 4, attack: 0.001, release: 0.1, knee: 6, makeup: 4 }),
  preset('Gentle Squeeze', { threshold: -12, ratio: 2, attack: 0.02, release: 0.3, knee: 20, makeup: 1 }),
  preset('Hard Limiter', { threshold: -6, ratio: 20, attack: 0.001, release: 0.05, knee: 0, makeup: 5 }),
  preset('Bass Tamer', { threshold: -16, ratio: 5, attack: 0.005, release: 0.2, knee: 8, makeup: 3 }),
];

const compressorFetPresets: EffectPreset[] = [
  preset('Punchy Drums', { threshold: -22, ratio: 8, attack: 0.0005, release: 0.08, mix: 1 }),
  preset('Vocal Presence', { threshold: -15, ratio: 4, attack: 0.002, release: 0.15, mix: 0.7 }),
  preset('Guitar Sustain', { threshold: -20, ratio: 6, attack: 0.001, release: 0.2, mix: 0.8 }),
];

const compressorOpticalPresets: EffectPreset[] = [
  preset('Smooth Vocal', { threshold: -18, ratio: 3, attack: 0.01, release: 0.4, mix: 0.8 }),
  preset('Warm Bass', { threshold: -14, ratio: 4, attack: 0.015, release: 0.5, mix: 0.7 }),
  preset('Acoustic Guitar', { threshold: -16, ratio: 2.5, attack: 0.02, release: 0.35, mix: 0.6 }),
];

// ─── EQ Presets ─────────────────────────────────────────────────────────────

const parametricEqPresets: EffectPreset[] = [
  preset('Vocal Clarity', {
    band0Gain: -2, band1Gain: -3, band2Gain: 0, band3Gain: 2,
    band4Gain: 3, band5Gain: 4, band6Gain: 2, band7Gain: 1,
  }),
  preset('Bass Boost', {
    band0Gain: 6, band1Gain: 4, band2Gain: 1, band3Gain: 0,
    band4Gain: 0, band5Gain: -1, band6Gain: -2, band7Gain: -1,
  }),
  preset('Presence & Air', {
    band0Gain: 0, band1Gain: 0, band2Gain: -1, band3Gain: 0,
    band4Gain: 2, band5Gain: 3, band6Gain: 4, band7Gain: 5,
  }),
  preset('Mid Scoop', {
    band0Gain: 2, band1Gain: 1, band2Gain: -3, band3Gain: -4,
    band4Gain: -3, band5Gain: 0, band6Gain: 2, band7Gain: 3,
  }),
  preset('Lo-Fi Telephone', {
    band0Gain: -12, band1Gain: -6, band2Gain: 3, band3Gain: 5,
    band4Gain: 3, band5Gain: -2, band6Gain: -10, band7Gain: -12,
  }),
];

// ─── Reverb Presets ─────────────────────────────────────────────────────────

const reverbAlgorithmicPresets: EffectPreset[] = [
  preset('Small Room', { decayTime: 0.8, preDelayTime: 0.005, dampening: 6000, roomSize: 0.3, mix: 0.2 }),
  preset('Medium Hall', { decayTime: 2.0, preDelayTime: 0.02, dampening: 7000, roomSize: 0.6, mix: 0.3 }),
  preset('Large Cathedral', { decayTime: 5.0, preDelayTime: 0.04, dampening: 4000, roomSize: 0.9, mix: 0.35 }),
  preset('Plate', { decayTime: 1.5, preDelayTime: 0.001, dampening: 10000, roomSize: 0.5, mix: 0.25 }),
  preset('Ambient Wash', { decayTime: 8.0, preDelayTime: 0.06, dampening: 3000, roomSize: 0.95, mix: 0.5 }),
  preset('Tight Snare', { decayTime: 0.4, preDelayTime: 0.0, dampening: 8000, roomSize: 0.2, mix: 0.15 }),
];

const reverbConvolutionPresets: EffectPreset[] = [
  preset('Studio A', { mix: 0.2, preDelay: 0.01 }),
  preset('Concert Hall', { mix: 0.35, preDelay: 0.03 }),
  preset('Warehouse', { mix: 0.4, preDelay: 0.05 }),
];

// ─── Delay Presets ──────────────────────────────────────────────────────────

const delayTapePresets: EffectPreset[] = [
  preset('Slapback', { delayTime: 0.12, feedback: 0.1, flutter: 0.2, saturation: 0.3, mix: 0.25 }),
  preset('Vintage Echo', { delayTime: 0.35, feedback: 0.45, flutter: 0.5, saturation: 0.5, mix: 0.3 }),
  preset('Space Echo', { delayTime: 0.5, feedback: 0.65, flutter: 0.4, saturation: 0.4, mix: 0.35 }),
  preset('Dub Delay', { delayTime: 0.6, feedback: 0.7, flutter: 0.3, saturation: 0.6, mix: 0.4 }),
  preset('Lo-Fi Tape', { delayTime: 0.3, feedback: 0.35, flutter: 0.8, saturation: 0.7, mix: 0.25 }),
];

const delayPingpongPresets: EffectPreset[] = [
  preset('Stereo Spread', { delayTime: 0.25, feedback: 0.3, mix: 0.2 }),
  preset('Wide Ambience', { delayTime: 0.4, feedback: 0.45, mix: 0.3 }),
  preset('Rhythmic Bounce', { delayTime: 0.15, feedback: 0.5, mix: 0.25 }),
];

const delayAnalogPresets: EffectPreset[] = [
  preset('Warm Echo', { delayTime: 0.3, feedback: 0.4, mix: 0.25 }),
  preset('Subtle Thickener', { delayTime: 0.04, feedback: 0.2, mix: 0.15 }),
  preset('Ambient Trail', { delayTime: 0.5, feedback: 0.6, mix: 0.35 }),
];

// ─── Modulation Presets ─────────────────────────────────────────────────────

const chorusPresets: EffectPreset[] = [
  preset('Subtle Width', { rate: 0.5, depth: 0.3, mix: 0.2 }),
  preset('Classic Chorus', { rate: 1.5, depth: 0.5, mix: 0.4 }),
  preset('Deep Ensemble', { rate: 0.8, depth: 0.8, mix: 0.5 }),
  preset('Shimmer', { rate: 3.0, depth: 0.4, mix: 0.3 }),
];

const flangerPresets: EffectPreset[] = [
  preset('Jet Flange', { rate: 0.2, depth: 0.8, feedback: 0.7, mix: 0.5 }),
  preset('Subtle Motion', { rate: 0.5, depth: 0.3, feedback: 0.3, mix: 0.25 }),
  preset('Metallic', { rate: 0.1, depth: 0.9, feedback: 0.85, mix: 0.6 }),
];

const phaserPresets: EffectPreset[] = [
  preset('Classic Phaser', { rate: 0.5, depth: 0.6, feedback: 0.4, mix: 0.5 }),
  preset('Slow Sweep', { rate: 0.1, depth: 0.8, feedback: 0.5, mix: 0.4 }),
  preset('Funk Guitar', { rate: 1.0, depth: 0.5, feedback: 0.6, mix: 0.45 }),
];

// ─── Creative Presets ───────────────────────────────────────────────────────

const distortionPresets: EffectPreset[] = [
  preset('Warm Overdrive', { drive: 0.3, tone: 0.5, mix: 0.6 }),
  preset('Crunch', { drive: 0.5, tone: 0.6, mix: 0.8 }),
  preset('Heavy Distortion', { drive: 0.8, tone: 0.4, mix: 1.0 }),
  preset('Fuzz', { drive: 0.95, tone: 0.3, mix: 0.9 }),
  preset('Lo-Fi Saturation', { drive: 0.2, tone: 0.3, mix: 0.4 }),
];

const autoPanPresets: EffectPreset[] = [
  preset('Gentle Sway', { rate: 0.3, depth: 0.4 }),
  preset('Fast Tremolo', { rate: 6, depth: 0.8 }),
  preset('Medium Pan', { rate: 1, depth: 0.6 }),
];

// ─── Filter Presets ─────────────────────────────────────────────────────────

const highlowPassPresets: EffectPreset[] = [
  preset('Lo-Fi Filter', { highPassFreq: 300, lowPassFreq: 4000 }),
  preset('Sub Rumble Cut', { highPassFreq: 80, lowPassFreq: 20000 }),
  preset('Radio Filter', { highPassFreq: 400, lowPassFreq: 3000 }),
  preset('Warm Low-Pass', { highPassFreq: 20, lowPassFreq: 2000 }),
  preset('Bright High-Pass', { highPassFreq: 1000, lowPassFreq: 20000 }),
];

// ─── Registry ───────────────────────────────────────────────────────────────

/** All built-in presets, indexed by EffectType. */
export const EFFECT_PRESETS: Partial<Record<EffectType, EffectPreset[]>> = {
  'compressor-vca': compressorVcaPresets,
  'compressor-fet': compressorFetPresets,
  'compressor-optical': compressorOpticalPresets,
  'parametric-eq': parametricEqPresets,
  'reverb-algorithmic': reverbAlgorithmicPresets,
  'reverb-convolution': reverbConvolutionPresets,
  'delay-tape': delayTapePresets,
  'delay-pingpong': delayPingpongPresets,
  'delay-analog': delayAnalogPresets,
  'chorus': chorusPresets,
  'flanger': flangerPresets,
  'phaser': phaserPresets,
  'distortion': distortionPresets,
  'auto-pan': autoPanPresets,
  'highlow-pass': highlowPassPresets,
};

/** Get presets for a specific effect type. Returns empty array if none exist. */
export function getPresetsForEffect(type: EffectType): EffectPreset[] {
  return EFFECT_PRESETS[type] ?? [];
}
