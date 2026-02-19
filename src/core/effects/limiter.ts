import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Brick-wall limiter using DynamicsCompressorNode at extreme ratio. */
export class Limiter extends BaseEffect {
  readonly effectType = 'limiter';
  readonly category: EffectCategory = 'dynamics';

  private compressor: DynamicsCompressorNode;
  private makeupGain: GainNode;

  private ceiling = -0.3;
  private release = 0.05;
  private makeup = 0;

  constructor(context: AudioContext) {
    super(context);
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = this.ceiling;
    this.compressor.ratio.value = 20;
    this.compressor.attack.value = 0.001;
    this.compressor.release.value = this.release;
    this.compressor.knee.value = 0;

    this.makeupGain = context.createGain();
    this.makeupGain.gain.value = Math.pow(10, this.makeup / 20);

    this.compressor.connect(this.makeupGain);
    this.connectProcessingChain(this.compressor, this.makeupGain);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'ceiling':
        this.ceiling = value;
        this.compressor.threshold.value = value;
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
      { name: 'ceiling', value: this.ceiling, min: -12, max: 0, step: 0.1, unit: 'dB' },
      { name: 'release', value: this.release, min: 0.01, max: 0.5, step: 0.01, unit: 's' },
      { name: 'makeup', value: this.makeup, min: 0, max: 24, step: 0.5, unit: 'dB' },
    ];
  }

  dispose(): void {
    this.compressor.disconnect();
    this.makeupGain.disconnect();
    super.dispose();
  }
}
