import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Vocoder — analysis/synthesis using parallel bandpass filter banks.
 * Uses the input signal as both carrier and modulator (auto-vocoder).
 */
export class Vocoder extends BaseEffect {
  readonly effectType = 'vocoder';
  readonly category: EffectCategory = 'creative';

  private static readonly NUM_BANDS = 16;
  private analysisFilters: BiquadFilterNode[];
  private synthesisFilters: BiquadFilterNode[];
  private envelopeFollowers: { analyser: AnalyserNode; gain: GainNode }[];
  private merger: GainNode;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private dataBuffers: Float32Array<ArrayBuffer>[];

  private bandShift = 0;
  private resonance = 10;

  constructor(context: AudioContext) {
    super(context);
    this.merger = context.createGain();
    this.merger.gain.value = 1 / Vocoder.NUM_BANDS * 4;

    const splitter = context.createGain();

    this.analysisFilters = [];
    this.synthesisFilters = [];
    this.envelopeFollowers = [];
    this.dataBuffers = [];

    for (let i = 0; i < Vocoder.NUM_BANDS; i++) {
      const freq = 100 * Math.pow(2, i * 7 / Vocoder.NUM_BANDS);

      // Analysis: extract amplitude envelope
      const aFilter = context.createBiquadFilter();
      aFilter.type = 'bandpass';
      aFilter.frequency.value = freq;
      aFilter.Q.value = this.resonance;

      const analyser = context.createAnalyser();
      analyser.fftSize = 256;

      // Synthesis: apply envelope to carrier band
      const sFilter = context.createBiquadFilter();
      sFilter.type = 'bandpass';
      sFilter.frequency.value = freq;
      sFilter.Q.value = this.resonance;

      const envGain = context.createGain();
      envGain.gain.value = 0;

      splitter.connect(aFilter);
      aFilter.connect(analyser);

      splitter.connect(sFilter);
      sFilter.connect(envGain);
      envGain.connect(this.merger);

      this.analysisFilters.push(aFilter);
      this.synthesisFilters.push(sFilter);
      this.envelopeFollowers.push({ analyser, gain: envGain });
      this.dataBuffers.push(new Float32Array(256) as Float32Array<ArrayBuffer>);
    }

    this.connectProcessingChain(splitter, this.merger);

    // Poll envelopes
    this.timerId = setInterval(() => this.updateEnvelopes(), 10);
  }

  private updateEnvelopes(): void {
    for (let i = 0; i < Vocoder.NUM_BANDS; i++) {
      const { analyser, gain } = this.envelopeFollowers[i];
      analyser.getFloatTimeDomainData(this.dataBuffers[i]);

      let sum = 0;
      const data = this.dataBuffers[i];
      for (let j = 0; j < data.length; j++) {
        sum += data[j] * data[j];
      }
      const rms = Math.sqrt(sum / data.length);
      gain.gain.value = Math.min(rms * 4, 1);
    }
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'bandShift':
        this.bandShift = value;
        this.updateFrequencies();
        break;
      case 'resonance':
        this.resonance = value;
        this.updateFrequencies();
        break;
    }
  }

  private updateFrequencies(): void {
    for (let i = 0; i < Vocoder.NUM_BANDS; i++) {
      const baseFreq = 100 * Math.pow(2, i * 7 / Vocoder.NUM_BANDS);
      this.analysisFilters[i].frequency.value = baseFreq;
      this.analysisFilters[i].Q.value = this.resonance;

      const shiftedIdx = Math.max(0, Math.min(Vocoder.NUM_BANDS - 1, i + Math.round(this.bandShift)));
      const synthFreq = 100 * Math.pow(2, shiftedIdx * 7 / Vocoder.NUM_BANDS);
      this.synthesisFilters[i].frequency.value = synthFreq;
      this.synthesisFilters[i].Q.value = this.resonance;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'bandShift', value: this.bandShift, min: -8, max: 8, step: 1, unit: 'bands' },
      { name: 'resonance', value: this.resonance, min: 1, max: 30, step: 0.5, unit: '' },
    ];
  }

  dispose(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.analysisFilters.forEach((f) => f.disconnect());
    this.synthesisFilters.forEach((f) => f.disconnect());
    this.envelopeFollowers.forEach((e) => { e.analyser.disconnect(); e.gain.disconnect(); });
    this.merger.disconnect();
    super.dispose();
  }
}
