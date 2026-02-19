import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Tape delay with wow/flutter modulation and saturation. */
export class TapeDelay extends BaseEffect {
  readonly effectType = 'delay-tape';
  readonly category: EffectCategory = 'time-based';

  private delay: DelayNode;
  private feedbackGain: GainNode;
  private saturator: WaveShaperNode;
  private lpFilter: BiquadFilterNode;
  private hpFilter: BiquadFilterNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private delayTime = 0.4;
  private feedback = 0.5;
  private flutter = 0.3;
  private saturation = 0.4;
  private mix = 0.3;

  constructor(context: AudioContext) {
    super(context);

    this.delay = context.createDelay(5);
    this.delay.delayTime.value = this.delayTime;

    // LFO for wow/flutter
    this.lfo = context.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 2;
    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = this.flutter * 0.003;
    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.delay.delayTime);
    this.lfo.start();

    // Tape character: LP + HP + saturation in feedback path
    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = 4000;

    this.hpFilter = context.createBiquadFilter();
    this.hpFilter.type = 'highpass';
    this.hpFilter.frequency.value = 150;

    this.saturator = context.createWaveShaper();
    this.updateSaturationCurve();

    this.feedbackGain = context.createGain();
    this.feedbackGain.gain.value = this.feedback;

    // Feedback loop: delay → LP → HP → saturator → feedbackGain → delay
    this.delay.connect(this.lpFilter);
    this.lpFilter.connect(this.hpFilter);
    this.hpFilter.connect(this.saturator);
    this.saturator.connect(this.feedbackGain);
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

  private updateSaturationCurve(): void {
    const samples = 256;
    const curve = new Float32Array(samples);
    const amount = this.saturation * 30;
    for (let i = 0; i < samples; i++) {
      const x = (i * 2) / samples - 1;
      curve[i] = ((1 + amount) * x) / (1 + amount * Math.abs(x));
    }
    this.saturator.curve = curve;
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
      case 'flutter':
        this.flutter = value;
        this.lfoGain.gain.value = value * 0.003;
        break;
      case 'saturation':
        this.saturation = value;
        this.updateSaturationCurve();
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
      { name: 'flutter', value: this.flutter, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'saturation', value: this.saturation, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo.stop();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.delay.disconnect();
    this.feedbackGain.disconnect();
    this.saturator.disconnect();
    this.lpFilter.disconnect();
    this.hpFilter.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
