import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** 3-band multiband compressor using crossover filters + per-band DynamicsCompressor. */
export class MultibandCompressor extends BaseEffect {
  readonly effectType = 'multiband-compressor';
  readonly category: EffectCategory = 'dynamics';

  private lowFilter: BiquadFilterNode;
  private midFilterLow: BiquadFilterNode;
  private midFilterHigh: BiquadFilterNode;
  private highFilter: BiquadFilterNode;
  private lowComp: DynamicsCompressorNode;
  private midComp: DynamicsCompressorNode;
  private highComp: DynamicsCompressorNode;
  private merger: GainNode;

  private lowCrossover = 200;
  private highCrossover = 4000;
  private lowThreshold = -24;
  private midThreshold = -24;
  private highThreshold = -24;
  private lowRatio = 4;
  private midRatio = 3;
  private highRatio = 3;

  constructor(context: AudioContext) {
    super(context);

    // Crossover filters
    this.lowFilter = context.createBiquadFilter();
    this.lowFilter.type = 'lowpass';
    this.lowFilter.frequency.value = this.lowCrossover;

    this.midFilterLow = context.createBiquadFilter();
    this.midFilterLow.type = 'highpass';
    this.midFilterLow.frequency.value = this.lowCrossover;

    this.midFilterHigh = context.createBiquadFilter();
    this.midFilterHigh.type = 'lowpass';
    this.midFilterHigh.frequency.value = this.highCrossover;

    this.highFilter = context.createBiquadFilter();
    this.highFilter.type = 'highpass';
    this.highFilter.frequency.value = this.highCrossover;

    // Per-band compressors
    this.lowComp = context.createDynamicsCompressor();
    this.lowComp.threshold.value = this.lowThreshold;
    this.lowComp.ratio.value = this.lowRatio;

    this.midComp = context.createDynamicsCompressor();
    this.midComp.threshold.value = this.midThreshold;
    this.midComp.ratio.value = this.midRatio;

    this.highComp = context.createDynamicsCompressor();
    this.highComp.threshold.value = this.highThreshold;
    this.highComp.ratio.value = this.highRatio;

    this.merger = context.createGain();

    // Wire: input → crossover → compressors → merger
    // We use a split node to avoid double-connecting inputNode
    const splitter = context.createGain();

    splitter.connect(this.lowFilter);
    splitter.connect(this.midFilterLow);
    splitter.connect(this.highFilter);

    this.lowFilter.connect(this.lowComp);
    this.midFilterLow.connect(this.midFilterHigh);
    this.midFilterHigh.connect(this.midComp);
    this.highFilter.connect(this.highComp);

    this.lowComp.connect(this.merger);
    this.midComp.connect(this.merger);
    this.highComp.connect(this.merger);

    this.connectProcessingChain(splitter, this.merger);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'lowCrossover':
        this.lowCrossover = value;
        this.lowFilter.frequency.value = value;
        this.midFilterLow.frequency.value = value;
        break;
      case 'highCrossover':
        this.highCrossover = value;
        this.midFilterHigh.frequency.value = value;
        this.highFilter.frequency.value = value;
        break;
      case 'lowThreshold':
        this.lowThreshold = value;
        this.lowComp.threshold.value = value;
        break;
      case 'midThreshold':
        this.midThreshold = value;
        this.midComp.threshold.value = value;
        break;
      case 'highThreshold':
        this.highThreshold = value;
        this.highComp.threshold.value = value;
        break;
      case 'lowRatio':
        this.lowRatio = value;
        this.lowComp.ratio.value = value;
        break;
      case 'midRatio':
        this.midRatio = value;
        this.midComp.ratio.value = value;
        break;
      case 'highRatio':
        this.highRatio = value;
        this.highComp.ratio.value = value;
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'lowCrossover', value: this.lowCrossover, min: 50, max: 1000, step: 10, unit: 'Hz' },
      { name: 'highCrossover', value: this.highCrossover, min: 1000, max: 12000, step: 100, unit: 'Hz' },
      { name: 'lowThreshold', value: this.lowThreshold, min: -60, max: 0, step: 0.5, unit: 'dB' },
      { name: 'midThreshold', value: this.midThreshold, min: -60, max: 0, step: 0.5, unit: 'dB' },
      { name: 'highThreshold', value: this.highThreshold, min: -60, max: 0, step: 0.5, unit: 'dB' },
      { name: 'lowRatio', value: this.lowRatio, min: 1, max: 20, step: 0.5, unit: ':1' },
      { name: 'midRatio', value: this.midRatio, min: 1, max: 20, step: 0.5, unit: ':1' },
      { name: 'highRatio', value: this.highRatio, min: 1, max: 20, step: 0.5, unit: ':1' },
    ];
  }

  dispose(): void {
    this.lowFilter.disconnect();
    this.midFilterLow.disconnect();
    this.midFilterHigh.disconnect();
    this.highFilter.disconnect();
    this.lowComp.disconnect();
    this.midComp.disconnect();
    this.highComp.disconnect();
    this.merger.disconnect();
    super.dispose();
  }
}
