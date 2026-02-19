import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Multi-mode distortion — overdrive, fuzz, bitcrusher. */
export class Distortion extends BaseEffect {
  readonly effectType = 'distortion';
  readonly category: EffectCategory = 'creative';

  private preGain: GainNode;
  private waveshaper: WaveShaperNode;
  private postFilter: BiquadFilterNode;
  private postGain: GainNode;

  private drive = 0.5;
  private tone = 5000;
  private output = 0; // dB
  private mode = 0; // 0=overdrive, 1=fuzz, 2=bitcrush

  constructor(context: AudioContext) {
    super(context);

    this.preGain = context.createGain();
    this.preGain.gain.value = 1 + this.drive * 10;

    this.waveshaper = context.createWaveShaper();
    this.updateCurve();

    this.postFilter = context.createBiquadFilter();
    this.postFilter.type = 'lowpass';
    this.postFilter.frequency.value = this.tone;

    this.postGain = context.createGain();
    this.postGain.gain.value = Math.pow(10, this.output / 20);

    this.preGain.connect(this.waveshaper);
    this.waveshaper.connect(this.postFilter);
    this.postFilter.connect(this.postGain);

    this.connectProcessingChain(this.preGain, this.postGain);
  }

  private updateCurve(): void {
    const samples = 512;
    const curve = new Float32Array(samples);

    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;

      switch (this.mode) {
        case 0: // Overdrive (soft clip)
          curve[i] = Math.tanh(x * (1 + this.drive * 10));
          break;
        case 1: // Fuzz (hard clip)
          curve[i] = Math.max(-1, Math.min(1, x * (1 + this.drive * 20)));
          break;
        case 2: { // Bitcrush
          const bits = Math.max(1, Math.round(16 - this.drive * 14));
          const step = 2 / Math.pow(2, bits);
          curve[i] = Math.round(x / step) * step;
          break;
        }
      }
    }

    this.waveshaper.curve = curve;
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'drive':
        this.drive = value;
        this.preGain.gain.value = 1 + value * 10;
        this.updateCurve();
        break;
      case 'tone':
        this.tone = value;
        this.postFilter.frequency.value = value;
        break;
      case 'output':
        this.output = value;
        this.postGain.gain.value = Math.pow(10, value / 20);
        break;
      case 'mode':
        this.mode = Math.floor(value);
        this.updateCurve();
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'drive', value: this.drive, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'tone', value: this.tone, min: 500, max: 20000, step: 100, unit: 'Hz' },
      { name: 'output', value: this.output, min: -24, max: 6, step: 0.5, unit: 'dB' },
      { name: 'mode', value: this.mode, min: 0, max: 2, step: 1, unit: '' },
    ];
  }

  dispose(): void {
    this.preGain.disconnect();
    this.waveshaper.disconnect();
    this.postFilter.disconnect();
    this.postGain.disconnect();
    super.dispose();
  }
}
