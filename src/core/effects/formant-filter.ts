import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Formant filter — 5 parallel bandpass filters simulating vowel sounds. */
export class FormantFilter extends BaseEffect {
  readonly effectType = 'formant-filter';
  readonly category: EffectCategory = 'eq-filter';

  private filters: BiquadFilterNode[];
  private filterGains: GainNode[];
  private merger: GainNode;

  // Vowel formant frequencies [F1, F2, F3, F4, F5]
  private static readonly VOWELS: Record<string, number[]> = {
    a: [800, 1150, 2900, 3900, 4950],
    e: [350, 2000, 2800, 3600, 4950],
    i: [270, 2140, 2950, 3900, 4950],
    o: [450, 800, 2830, 3800, 4950],
    u: [325, 700, 2700, 3800, 4950],
  };

  private morph = 0; // 0-4 maps to a,e,i,o,u
  private resonance = 10;

  constructor(context: AudioContext) {
    super(context);
    this.merger = context.createGain();
    this.merger.gain.value = 0.2; // Normalize parallel sum

    const splitter = context.createGain();

    this.filters = [];
    this.filterGains = [];

    for (let i = 0; i < 5; i++) {
      const filter = context.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = FormantFilter.VOWELS.a[i];
      filter.Q.value = this.resonance;

      const gain = context.createGain();
      gain.gain.value = 1 / (i + 1); // Stronger lower formants

      splitter.connect(filter);
      filter.connect(gain);
      gain.connect(this.merger);

      this.filters.push(filter);
      this.filterGains.push(gain);
    }

    this.connectProcessingChain(splitter, this.merger);
    this.updateFormants();
  }

  private updateFormants(): void {
    const vowelKeys = ['a', 'e', 'i', 'o', 'u'];
    const idx = Math.floor(this.morph);
    const frac = this.morph - idx;
    const v1 = FormantFilter.VOWELS[vowelKeys[Math.min(idx, 4)]];
    const v2 = FormantFilter.VOWELS[vowelKeys[Math.min(idx + 1, 4)]];

    for (let i = 0; i < 5; i++) {
      const freq = v1[i] + (v2[i] - v1[i]) * frac;
      this.filters[i].frequency.value = freq;
      this.filters[i].Q.value = this.resonance;
    }
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'morph':
        this.morph = value;
        this.updateFormants();
        break;
      case 'resonance':
        this.resonance = value;
        this.updateFormants();
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'morph', value: this.morph, min: 0, max: 4, step: 0.01, unit: '' },
      { name: 'resonance', value: this.resonance, min: 1, max: 30, step: 0.5, unit: '' },
    ];
  }

  dispose(): void {
    this.filters.forEach((f) => f.disconnect());
    this.filterGains.forEach((g) => g.disconnect());
    this.merger.disconnect();
    super.dispose();
  }
}
