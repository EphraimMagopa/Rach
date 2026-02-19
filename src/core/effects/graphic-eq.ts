import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** 31-band ISO graphic EQ using peaking BiquadFilterNodes. */
export class GraphicEQ extends BaseEffect {
  readonly effectType = 'graphic-eq';
  readonly category: EffectCategory = 'eq-filter';

  private bands: BiquadFilterNode[];
  // ISO 31 center frequencies
  private static readonly FREQS = [
    20, 25, 31.5, 40, 50, 63, 80, 100, 125, 160,
    200, 250, 315, 400, 500, 630, 800, 1000, 1250, 1600,
    2000, 2500, 3150, 4000, 5000, 6300, 8000, 10000, 12500, 16000,
    20000,
  ];
  private gains: number[];

  constructor(context: AudioContext) {
    super(context);
    this.gains = new Array(31).fill(0);

    this.bands = GraphicEQ.FREQS.map((freq) => {
      const filter = context.createBiquadFilter();
      filter.type = 'peaking';
      filter.frequency.value = freq;
      filter.gain.value = 0;
      filter.Q.value = 4.3; // ~1/3 octave bandwidth
      return filter;
    });

    for (let i = 0; i < this.bands.length - 1; i++) {
      this.bands[i].connect(this.bands[i + 1]);
    }

    this.connectProcessingChain(this.bands[0], this.bands[this.bands.length - 1]);
  }

  setParameter(name: string, value: number): void {
    // bandN where N is 0-30
    const match = name.match(/^band(\d+)$/);
    if (!match) return;
    const idx = parseInt(match[1]);
    if (idx < 0 || idx >= 31) return;
    this.gains[idx] = value;
    this.bands[idx].gain.value = value;
  }

  getParameters(): EffectParameterDescriptor[] {
    return GraphicEQ.FREQS.map((freq, i) => ({
      name: `band${i}`,
      value: this.gains[i],
      min: -12,
      max: 12,
      step: 0.5,
      unit: `dB@${freq >= 1000 ? `${freq / 1000}k` : freq}Hz`,
    }));
  }

  dispose(): void {
    this.bands.forEach((b) => b.disconnect());
    super.dispose();
  }
}
