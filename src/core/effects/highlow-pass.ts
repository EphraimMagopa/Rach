import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Combined high-pass and low-pass filter with resonance. */
export class HighLowPassFilter extends BaseEffect {
  readonly effectType = 'highlow-pass';
  readonly category: EffectCategory = 'eq-filter';

  private hpFilter: BiquadFilterNode;
  private lpFilter: BiquadFilterNode;

  private hpFreq = 20;
  private lpFreq = 20000;
  private hpQ = 0.707;
  private lpQ = 0.707;

  constructor(context: AudioContext) {
    super(context);

    this.hpFilter = context.createBiquadFilter();
    this.hpFilter.type = 'highpass';
    this.hpFilter.frequency.value = this.hpFreq;
    this.hpFilter.Q.value = this.hpQ;

    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = this.lpFreq;
    this.lpFilter.Q.value = this.lpQ;

    this.hpFilter.connect(this.lpFilter);
    this.connectProcessingChain(this.hpFilter, this.lpFilter);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'hpFreq':
        this.hpFreq = value;
        this.hpFilter.frequency.value = value;
        break;
      case 'lpFreq':
        this.lpFreq = value;
        this.lpFilter.frequency.value = value;
        break;
      case 'hpQ':
        this.hpQ = value;
        this.hpFilter.Q.value = value;
        break;
      case 'lpQ':
        this.lpQ = value;
        this.lpFilter.Q.value = value;
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'hpFreq', value: this.hpFreq, min: 20, max: 20000, step: 1, unit: 'Hz' },
      { name: 'lpFreq', value: this.lpFreq, min: 20, max: 20000, step: 1, unit: 'Hz' },
      { name: 'hpQ', value: this.hpQ, min: 0.1, max: 18, step: 0.1, unit: '' },
      { name: 'lpQ', value: this.lpQ, min: 0.1, max: 18, step: 0.1, unit: '' },
    ];
  }

  dispose(): void {
    this.hpFilter.disconnect();
    this.lpFilter.disconnect();
    super.dispose();
  }
}
