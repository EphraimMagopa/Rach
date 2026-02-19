import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Flanger — short delay with feedback and LFO modulation. */
export class Flanger extends BaseEffect {
  readonly effectType = 'flanger';
  readonly category: EffectCategory = 'time-based';

  private delay: DelayNode;
  private feedbackGain: GainNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private rate = 0.5;
  private depth = 0.7;
  private feedback = 0.5;
  private mix = 0.5;

  constructor(context: AudioContext) {
    super(context);

    this.delay = context.createDelay(0.02);
    this.delay.delayTime.value = 0.003;

    this.feedbackGain = context.createGain();
    this.feedbackGain.gain.value = this.feedback;

    this.delay.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);

    this.lfo = context.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = this.rate;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = this.depth * 0.002;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delay.delayTime);
    this.lfo.start();

    this.dryMix = context.createGain();
    this.dryMix.gain.value = 1 - this.mix;
    this.wetMix = context.createGain();
    this.wetMix.gain.value = this.mix;
    this.outputMixer = context.createGain();

    const entryNode = context.createGain();

    entryNode.connect(this.dryMix);
    this.dryMix.connect(this.outputMixer);
    entryNode.connect(this.delay);
    this.delay.connect(this.wetMix);
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
        this.lfoGain.gain.value = value * 0.002;
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
      { name: 'feedback', value: this.feedback, min: 0, max: 0.95, step: 0.01, unit: '' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo.stop();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.delay.disconnect();
    this.feedbackGain.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
