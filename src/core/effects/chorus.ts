import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Stereo chorus effect using LFO-modulated delay. */
export class Chorus extends BaseEffect {
  readonly effectType = 'chorus';
  readonly category: EffectCategory = 'time-based';

  private delay: DelayNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private rate = 1.5;
  private depth = 0.5;
  private mix = 0.5;

  constructor(context: AudioContext) {
    super(context);

    this.delay = context.createDelay(0.05);
    this.delay.delayTime.value = 0.007;

    this.lfo = context.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = this.rate;

    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = this.depth * 0.005;

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
        this.lfoGain.gain.value = value * 0.005;
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
      { name: 'rate', value: this.rate, min: 0.1, max: 10, step: 0.1, unit: 'Hz' },
      { name: 'depth', value: this.depth, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo.stop();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.delay.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
