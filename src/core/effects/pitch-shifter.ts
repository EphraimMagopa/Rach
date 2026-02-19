import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Pitch shifter using dual delay line crossfade technique.
 * Two delay lines with sawtooth LFOs create pitch-shifted output.
 */
export class PitchShifter extends BaseEffect {
  readonly effectType = 'pitch-shifter';
  readonly category: EffectCategory = 'creative';

  private delay1: DelayNode;
  private delay2: DelayNode;
  private gain1: GainNode;
  private gain2: GainNode;
  private lfo1: OscillatorNode;
  private lfo1Gain: GainNode;
  private lfo2: OscillatorNode;
  private lfo2Gain: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private semitones = 0;
  private mix = 0.5;

  constructor(context: AudioContext) {
    super(context);

    this.delay1 = context.createDelay(1);
    this.delay2 = context.createDelay(1);
    this.gain1 = context.createGain();
    this.gain2 = context.createGain();

    // Two sawtooth LFOs 180 degrees apart for crossfade
    const pitchRate = this.calculateRate();

    this.lfo1 = context.createOscillator();
    this.lfo1.type = 'sawtooth';
    this.lfo1.frequency.value = pitchRate;
    this.lfo1Gain = context.createGain();
    this.lfo1Gain.gain.value = 0.05;

    this.lfo2 = context.createOscillator();
    this.lfo2.type = 'sawtooth';
    this.lfo2.frequency.value = pitchRate;
    this.lfo2Gain = context.createGain();
    this.lfo2Gain.gain.value = 0.05;

    this.lfo1.connect(this.lfo1Gain);
    this.lfo1Gain.connect(this.delay1.delayTime);
    this.lfo2.connect(this.lfo2Gain);
    this.lfo2Gain.connect(this.delay2.delayTime);

    this.delay1.delayTime.value = 0.1;
    this.delay2.delayTime.value = 0.1;

    this.lfo1.start();
    this.lfo2.start(context.currentTime + 1 / (pitchRate || 1) / 2);

    this.delay1.connect(this.gain1);
    this.delay2.connect(this.gain2);
    this.gain1.gain.value = 0.5;
    this.gain2.gain.value = 0.5;

    this.dryMix = context.createGain();
    this.dryMix.gain.value = 1 - this.mix;
    this.wetMix = context.createGain();
    this.wetMix.gain.value = this.mix;
    this.outputMixer = context.createGain();

    const entryNode = context.createGain();

    entryNode.connect(this.dryMix);
    this.dryMix.connect(this.outputMixer);

    entryNode.connect(this.delay1);
    entryNode.connect(this.delay2);
    this.gain1.connect(this.wetMix);
    this.gain2.connect(this.wetMix);
    this.wetMix.connect(this.outputMixer);

    this.connectProcessingChain(entryNode, this.outputMixer);
  }

  private calculateRate(): number {
    // Rate proportional to pitch shift amount
    return Math.abs(this.semitones) * 0.5 + 0.1;
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'semitones':
        this.semitones = value;
        const rate = this.calculateRate();
        this.lfo1.frequency.value = rate;
        this.lfo2.frequency.value = rate;
        const depth = Math.abs(value) * 0.005;
        this.lfo1Gain.gain.value = depth;
        this.lfo2Gain.gain.value = depth;
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
      { name: 'semitones', value: this.semitones, min: -24, max: 24, step: 1, unit: 'st' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo1.stop();
    this.lfo2.stop();
    this.lfo1.disconnect();
    this.lfo2.disconnect();
    this.lfo1Gain.disconnect();
    this.lfo2Gain.disconnect();
    this.delay1.disconnect();
    this.delay2.disconnect();
    this.gain1.disconnect();
    this.gain2.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
