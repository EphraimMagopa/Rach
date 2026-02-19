import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** 8-band parametric EQ using BiquadFilterNodes. */
export class ParametricEQ extends BaseEffect {
  readonly effectType = 'parametric-eq';
  readonly category: EffectCategory = 'eq-filter';

  private bands: BiquadFilterNode[];
  private bandFreqs = [60, 170, 350, 700, 1400, 3000, 6000, 12000];
  private bandGains = [0, 0, 0, 0, 0, 0, 0, 0];
  private bandQs = [1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4, 1.4];

  constructor(context: AudioContext) {
    super(context);

    this.bands = this.bandFreqs.map((freq, i) => {
      const filter = context.createBiquadFilter();
      filter.type = i === 0 ? 'lowshelf' : i === 7 ? 'highshelf' : 'peaking';
      filter.frequency.value = freq;
      filter.gain.value = this.bandGains[i];
      filter.Q.value = this.bandQs[i];
      return filter;
    });

    // Chain filters in series
    for (let i = 0; i < this.bands.length - 1; i++) {
      this.bands[i].connect(this.bands[i + 1]);
    }

    this.connectProcessingChain(this.bands[0], this.bands[this.bands.length - 1]);
  }

  setParameter(name: string, value: number): void {
    // Parameter names: band0Freq, band0Gain, band0Q, band1Freq, etc.
    const match = name.match(/^band(\d)(\w+)$/);
    if (!match) return;
    const idx = parseInt(match[1]);
    const prop = match[2].toLowerCase();
    if (idx < 0 || idx >= 8) return;

    switch (prop) {
      case 'freq':
        this.bandFreqs[idx] = value;
        this.bands[idx].frequency.value = value;
        break;
      case 'gain':
        this.bandGains[idx] = value;
        this.bands[idx].gain.value = value;
        break;
      case 'q':
        this.bandQs[idx] = value;
        this.bands[idx].Q.value = value;
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    const params: EffectParameterDescriptor[] = [];
    for (let i = 0; i < 8; i++) {
      params.push(
        { name: `band${i}Freq`, value: this.bandFreqs[i], min: 20, max: 20000, step: 1, unit: 'Hz' },
        { name: `band${i}Gain`, value: this.bandGains[i], min: -18, max: 18, step: 0.5, unit: 'dB' },
        { name: `band${i}Q`, value: this.bandQs[i], min: 0.1, max: 18, step: 0.1, unit: '' },
      );
    }
    return params;
  }

  dispose(): void {
    this.bands.forEach((b) => b.disconnect());
    super.dispose();
  }
}
