import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** FET-style compressor with aggressive character via WaveShaperNode saturation. */
export class FETCompressor extends BaseEffect {
  readonly effectType = 'compressor-fet';
  readonly category: EffectCategory = 'dynamics';

  private compressor: DynamicsCompressorNode;
  private saturator: WaveShaperNode;
  private makeupGain: GainNode;

  private threshold = -20;
  private ratio = 8;
  private attack = 0.001;
  private release = 0.1;
  private saturation = 0.3;
  private makeup = 0;

  constructor(context: AudioContext) {
    super(context);
    this.compressor = context.createDynamicsCompressor();
    this.compressor.threshold.value = this.threshold;
    this.compressor.ratio.value = this.ratio;
    this.compressor.attack.value = this.attack;
    this.compressor.release.value = this.release;
    this.compressor.knee.value = 5; // Hard knee for FET character

    this.saturator = context.createWaveShaper();
    this.updateSaturationCurve();

    this.makeupGain = context.createGain();
    this.makeupGain.gain.value = Math.pow(10, this.makeup / 20);

    this.compressor.connect(this.saturator);
    this.saturator.connect(this.makeupGain);
    this.connectProcessingChain(this.compressor, this.makeupGain);
  }

  private updateSaturationCurve(): void {
    const samples = 256;
    const curve = new Float32Array(samples);
    const amount = this.saturation * 50;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
    }
    this.saturator.curve = curve;
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
      case 'saturation':
        this.saturation = value;
        this.updateSaturationCurve();
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
      { name: 'attack', value: this.attack, min: 0, max: 0.1, step: 0.001, unit: 's' },
      { name: 'release', value: this.release, min: 0.01, max: 1, step: 0.01, unit: 's' },
      { name: 'saturation', value: this.saturation, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'makeup', value: this.makeup, min: 0, max: 24, step: 0.5, unit: 'dB' },
    ];
  }

  dispose(): void {
    this.compressor.disconnect();
    this.saturator.disconnect();
    this.makeupGain.disconnect();
    super.dispose();
  }
}
