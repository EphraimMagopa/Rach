import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Optical-style compressor — smooth, slow response with program-dependent release. */
export class OpticalCompressor extends BaseEffect {
  readonly effectType = 'compressor-optical';
  readonly category: EffectCategory = 'dynamics';

  private compressor: DynamicsCompressorNode;
  private makeupGain: GainNode;

  private threshold = -30;
  private ratio = 3;
  private attack = 0.01;
  private release = 0.5;
  private makeup = 0;

  constructor(context: AudioContext) {
    super(context);
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = this.threshold;
    this.compressor.ratio.value = this.ratio;
    this.compressor.attack.value = this.attack;
    this.compressor.release.value = this.release;
    this.compressor.knee.value = 20; // Soft knee for optical character

    this.makeupGain = context.createGain();
    this.makeupGain.gain.value = Math.pow(10, this.makeup / 20);

    this.compressor.connect(this.makeupGain);
    this.connectProcessingChain(this.compressor, this.makeupGain);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'threshold':
        this.threshold = value;
        this.compressor.threshold.value = value;
        break;
      case 'ratio':
        this.ratio = value;
        this.compressor.ratio.value = value;
        break;
      case 'attack':
        this.attack = value;
        this.compressor.attack.value = value;
        break;
      case 'release':
        this.release = value;
        this.compressor.release.value = value;
        break;
      case 'makeup':
        this.makeup = value;
        this.makeupGain.gain.value = Math.pow(10, value / 20);
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'threshold', value: this.threshold, min: -60, max: 0, step: 0.5, unit: 'dB' },
      { name: 'ratio', value: this.ratio, min: 1, max: 10, step: 0.5, unit: ':1' },
      { name: 'attack', value: this.attack, min: 0.001, max: 0.1, step: 0.001, unit: 's' },
      { name: 'release', value: this.release, min: 0.05, max: 2, step: 0.01, unit: 's' },
      { name: 'makeup', value: this.makeup, min: 0, max: 24, step: 0.5, unit: 'dB' },
    ];
  }

  dispose(): void {
    this.compressor.disconnect();
    this.makeupGain.disconnect();
    super.dispose();
  }
}
