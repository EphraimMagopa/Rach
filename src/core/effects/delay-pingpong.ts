import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Stereo ping-pong delay with feedback and filtering. */
export class PingPongDelay extends BaseEffect {
  readonly effectType = 'delay-pingpong';
  readonly category: EffectCategory = 'time-based';

  private delayLeft: DelayNode;
  private delayRight: DelayNode;
  private feedbackLeft: GainNode;
  private feedbackRight: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;
  private lpFilter: BiquadFilterNode;

  private delayTime = 0.375;
  private feedback = 0.4;
  private dampening = 8000;
  private mix = 0.3;

  constructor(context: AudioContext) {
    super(context);

    this.delayLeft = context.createDelay(5);
    this.delayLeft.delayTime.value = this.delayTime;
    this.delayRight = context.createDelay(5);
    this.delayRight.delayTime.value = this.delayTime;

    this.feedbackLeft = context.createGain();
    this.feedbackLeft.gain.value = this.feedback;
    this.feedbackRight = context.createGain();
    this.feedbackRight.gain.value = this.feedback;

    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = this.dampening;

    // Ping-pong: left → right → left with feedback
    this.delayLeft.connect(this.feedbackLeft);
    this.feedbackLeft.connect(this.delayRight);
    this.delayRight.connect(this.feedbackRight);
    this.feedbackRight.connect(this.lpFilter);
    this.lpFilter.connect(this.delayLeft);

    this.dryMix = context.createGain();
    this.dryMix.gain.value = 1 - this.mix;
    this.wetMix = context.createGain();
    this.wetMix.gain.value = this.mix;
    this.outputMixer = context.createGain();

    const entryNode = context.createGain();

    // Dry path
    entryNode.connect(this.dryMix);
    this.dryMix.connect(this.outputMixer);

    // Wet path
    entryNode.connect(this.delayLeft);
    this.delayLeft.connect(this.wetMix);
    this.delayRight.connect(this.wetMix);
    this.wetMix.connect(this.outputMixer);

    this.connectProcessingChain(entryNode, this.outputMixer);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'time':
        this.delayTime = value;
        this.delayLeft.delayTime.value = value;
        this.delayRight.delayTime.value = value;
        break;
      case 'feedback':
        this.feedback = value;
        this.feedbackLeft.gain.value = value;
        this.feedbackRight.gain.value = value;
        break;
      case 'dampening':
        this.dampening = value;
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
      { name: 'dampening', value: this.dampening, min: 500, max: 20000, step: 100, unit: 'Hz' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.delayLeft.disconnect();
    this.delayRight.disconnect();
    this.feedbackLeft.disconnect();
    this.feedbackRight.disconnect();
    this.lpFilter.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
