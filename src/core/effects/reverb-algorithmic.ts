import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Algorithmic reverb using a network of feedback delay lines and allpass filters.
 * Schroeder-style reverb topology.
 */
export class AlgorithmicReverb extends BaseEffect {
  readonly effectType = 'reverb-algorithmic';
  readonly category: EffectCategory = 'time-based';

  private preDelay: DelayNode;
  private hpFilter: BiquadFilterNode;
  private lpFilter: BiquadFilterNode;
  private combFilters: DelayNode[];
  private combGains: GainNode[];
  private allPassFilters: { delay: DelayNode; gain: GainNode }[];
  private combMerger: GainNode;
  private mixGain: GainNode;
  private dryMix: GainNode;

  private decayTime = 2.5;
  private preDelayTime = 0.01;
  private dampening = 8000;
  private roomSize = 0.7;
  private mix = 0.3;

  constructor(context: AudioContext) {
    super(context);

    this.preDelay = context.createDelay(0.1);
    this.preDelay.delayTime.value = this.preDelayTime;

    this.hpFilter = context.createBiquadFilter();
    this.hpFilter.type = 'highpass';
    this.hpFilter.frequency.value = 100;

    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = this.dampening;

    // 4 parallel comb filters with different delay times
    const combDelays = [0.0297, 0.0371, 0.0411, 0.0437];
    this.combFilters = [];
    this.combGains = [];
    this.combMerger = context.createGain();
    this.combMerger.gain.value = 0.25;

    for (const delayTime of combDelays) {
      const delay = context.createDelay(0.1);
      delay.delayTime.value = delayTime * this.roomSize;
      const gain = context.createGain();
      gain.gain.value = Math.pow(0.001, delayTime / this.decayTime);

      // Feedback loop: delay → gain → delay
      delay.connect(gain);
      gain.connect(delay);

      this.combFilters.push(delay);
      this.combGains.push(gain);

      // Feed into merger
      delay.connect(this.combMerger);
    }

    // 2 allpass filters in series
    const allPassDelays = [0.005, 0.0017];
    this.allPassFilters = [];
    let prevNode: AudioNode = this.combMerger;

    for (const delayTime of allPassDelays) {
      const delay = context.createDelay(0.1);
      delay.delayTime.value = delayTime;
      const gain = context.createGain();
      gain.gain.value = 0.7;

      // Allpass: input → delay → output, with feedback path
      prevNode.connect(delay);
      delay.connect(gain);
      gain.connect(delay); // Feedback

      this.allPassFilters.push({ delay, gain });
      prevNode = delay;
    }

    this.mixGain = context.createGain();
    this.mixGain.gain.value = this.mix;

    this.dryMix = context.createGain();
    this.dryMix.gain.value = 1 - this.mix;

    // Wire: input → preDelay → hpFilter → lpFilter → comb parallel → allpass series → mixGain → output
    const entryNode = context.createGain();

    entryNode.connect(this.preDelay);
    this.preDelay.connect(this.hpFilter);
    this.hpFilter.connect(this.lpFilter);

    // Feed all combs from lpFilter
    for (const comb of this.combFilters) {
      this.lpFilter.connect(comb);
    }

    // Last allpass → mixGain
    const lastAllPass = this.allPassFilters[this.allPassFilters.length - 1];
    lastAllPass.delay.connect(this.mixGain);

    // Dry signal path
    const outputMixer = context.createGain();
    entryNode.connect(this.dryMix);
    this.dryMix.connect(outputMixer);
    this.mixGain.connect(outputMixer);

    this.connectProcessingChain(entryNode, outputMixer);
  }

  private updateDecay(): void {
    const combDelays = [0.0297, 0.0371, 0.0411, 0.0437];
    for (let i = 0; i < this.combGains.length; i++) {
      const delayTime = combDelays[i] * this.roomSize;
      this.combFilters[i].delayTime.value = delayTime;
      this.combGains[i].gain.value = Math.pow(0.001, combDelays[i] / this.decayTime);
    }
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'decay':
        this.decayTime = value;
        this.updateDecay();
        break;
      case 'preDelay':
        this.preDelayTime = value;
        this.preDelay.delayTime.value = value;
        break;
      case 'dampening':
        this.dampening = value;
        this.lpFilter.frequency.value = value;
        break;
      case 'roomSize':
        this.roomSize = value;
        this.updateDecay();
        break;
      case 'mix':
        this.mix = value;
        this.mixGain.gain.value = value;
        this.dryMix.gain.value = 1 - value;
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'decay', value: this.decayTime, min: 0.1, max: 10, step: 0.1, unit: 's' },
      { name: 'preDelay', value: this.preDelayTime, min: 0, max: 0.1, step: 0.001, unit: 's' },
      { name: 'dampening', value: this.dampening, min: 500, max: 20000, step: 100, unit: 'Hz' },
      { name: 'roomSize', value: this.roomSize, min: 0.1, max: 2, step: 0.01, unit: '' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.preDelay.disconnect();
    this.hpFilter.disconnect();
    this.lpFilter.disconnect();
    this.combFilters.forEach((c) => c.disconnect());
    this.combGains.forEach((g) => g.disconnect());
    this.allPassFilters.forEach((a) => { a.delay.disconnect(); a.gain.disconnect(); });
    this.combMerger.disconnect();
    this.mixGain.disconnect();
    this.dryMix.disconnect();
    super.dispose();
  }
}
