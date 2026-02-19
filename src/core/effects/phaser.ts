import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Phaser — cascaded allpass filters with LFO modulation. */
export class Phaser extends BaseEffect {
  readonly effectType = 'phaser';
  readonly category: EffectCategory = 'time-based';

  private allPassFilters: BiquadFilterNode[];
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private feedbackGain: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private rate = 0.5;
  private depth = 0.7;
  private feedback = 0.3;
  private stages = 6;
  private mix = 0.5;

  constructor(context: AudioContext) {
    super(context);

    // Create allpass filter stages
    this.allPassFilters = [];
    for (let i = 0; i < this.stages; i++) {
      const filter = context.createBiquadFilter();
      filter.type = 'allpass';
      filter.frequency.value = 1000 + i * 500;
      filter.Q.value = 0.5;
      this.allPassFilters.push(filter);
    }

    // Chain allpass filters
    for (let i = 0; i < this.allPassFilters.length - 1; i++) {
      this.allPassFilters[i].connect(this.allPassFilters[i + 1]);
    }

    // LFO modulates allpass frequencies
    this.lfo = context.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = this.rate;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = this.depth * 2000;
    this.lfo.connect(this.lfoGain);

    for (const filter of this.allPassFilters) {
      this.lfoGain.connect(filter.frequency);
    }
    this.lfo.start();

    // Feedback from last stage back to first
    this.feedbackGain = context.createGain();
    this.feedbackGain.gain.value = this.feedback;
    this.allPassFilters[this.allPassFilters.length - 1].connect(this.feedbackGain);
    this.feedbackGain.connect(this.allPassFilters[0]);

    this.dryMix = context.createGain();
    this.dryMix.gain.value = 1 - this.mix;
    this.wetMix = context.createGain();
    this.wetMix.gain.value = this.mix;
    this.outputMixer = context.createGain();

    const entryNode = context.createGain();

    entryNode.connect(this.dryMix);
    this.dryMix.connect(this.outputMixer);
    entryNode.connect(this.allPassFilters[0]);
    this.allPassFilters[this.allPassFilters.length - 1].connect(this.wetMix);
    this.wetMix.connect(this.outputMixer);

    this.connectProcessingChain(entryNode, this.outputMixer);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'rate':
        this.rate = value;
        this.lfo.frequency.value = value;
        break;
      case 'depth':
        this.depth = value;
        this.lfoGain.gain.value = value * 2000;
        break;
      case 'feedback':
        this.feedback = value;
        this.feedbackGain.gain.value = value;
        break;
      case 'mix':
        this.mix = value;
        this.wetMix.gain.value = value;
        this.dryMix.gain.value = 1 - value;
        break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'rate', value: this.rate, min: 0.05, max: 5, step: 0.01, unit: 'Hz' },
      { name: 'depth', value: this.depth, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'feedback', value: this.feedback, min: 0, max: 0.9, step: 0.01, unit: '' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo.stop();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.allPassFilters.forEach((f) => f.disconnect());
    this.feedbackGain.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
