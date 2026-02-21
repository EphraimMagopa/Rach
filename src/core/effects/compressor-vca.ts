import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Clean VCA-style compressor using DynamicsCompressorNode. */
export class VCACompressor extends BaseEffect {
  readonly effectType = 'compressor-vca';
  readonly category: EffectCategory = 'dynamics';

  private compressor: DynamicsCompressorNode;
  private makeupGain: GainNode;

  private threshold = -24;
  private ratio = 4;
  private attack = 0.003;
  private release = 0.25;
  private knee = 30;
  private makeup = 0;

  constructor(context: AudioContext) {
    super(context);
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = this.threshold;
    this.compressor.ratio.value = this.ratio;
    this.compressor.attack.value = this.attack;
    this.compressor.release.value = this.release;
    this.compressor.knee.value = this.knee;

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
        // DynamicsCompressorNode.attack expects seconds in [0, 1]
        this.attack = value > 1 ? value / 1000 : value;
        this.compressor.attack.value = Math.max(0, Math.min(1, this.attack));
        break;
      case 'release':
        // DynamicsCompressorNode.release expects seconds in [0, 1]
        this.release = value > 1 ? value / 1000 : value;
        this.compressor.release.value = Math.max(0, Math.min(1, this.release));
        break;
      case 'knee':
        this.knee = value;
        this.compressor.knee.value = value;
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
      { name: 'ratio', value: this.ratio, min: 1, max: 20, step: 0.5, unit: ':1' },
      { name: 'attack', value: this.attack, min: 0, max: 1, step: 0.001, unit: 's' },
      { name: 'release', value: this.release, min: 0.01, max: 1, step: 0.01, unit: 's' },
      { name: 'knee', value: this.knee, min: 0, max: 40, step: 1, unit: 'dB' },
      { name: 'makeup', value: this.makeup, min: 0, max: 24, step: 0.5, unit: 'dB' },
    ];
  }

  dispose(): void {
    this.compressor.disconnect();
    this.makeupGain.disconnect();
    super.dispose();
  }
}
