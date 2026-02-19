import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Analog-style delay with dark feedback character (BBD emulation). */
export class AnalogDelay extends BaseEffect {
  readonly effectType = 'delay-analog';
  readonly category: EffectCategory = 'time-based';

  private delay: DelayNode;
  private feedbackGain: GainNode;
  private lpFilter: BiquadFilterNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private delayTime = 0.3;
  private feedback = 0.5;
  private tone = 3000;
  private mix = 0.3;

  constructor(context: AudioContext) {
    super(context);

    this.delay = context.createDelay(5);
    this.delay.delayTime.value = this.delayTime;

    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = this.tone;

    this.feedbackGain = context.createGain();
    this.feedbackGain.gain.value = this.feedback;

    // Feedback loop with darkening filter
    this.delay.connect(this.lpFilter);
    this.lpFilter.connect(this.feedbackGain);
    this.feedbackGain.connect(this.delay);

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
      case 'time':
        this.delayTime = value;
        this.delay.delayTime.value = value;
        break;
      case 'feedback':
        this.feedback = value;
        this.feedbackGain.gain.value = value;
        break;
      case 'tone':
        this.tone = value;
        this.lpFilter.frequency.value = value;
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
      { name: 'time', value: this.delayTime, min: 0.01, max: 2, step: 0.001, unit: 's' },
      { name: 'feedback', value: this.feedback, min: 0, max: 0.95, step: 0.01, unit: '' },
      { name: 'tone', value: this.tone, min: 500, max: 10000, step: 100, unit: 'Hz' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.delay.disconnect();
    this.feedbackGain.disconnect();
    this.lpFilter.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
