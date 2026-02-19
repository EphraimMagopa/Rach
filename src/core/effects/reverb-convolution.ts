import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Convolution reverb using ConvolverNode.
 * Generates synthetic impulse responses of varying lengths.
 */
export class ConvolutionReverb extends BaseEffect {
  readonly effectType = 'reverb-convolution';
  readonly category: EffectCategory = 'time-based';

  private convolver: ConvolverNode;
  private dryMix: GainNode;
  private wetMix: GainNode;
  private outputMixer: GainNode;

  private decayTime = 2.0;
  private mix = 0.3;

  constructor(context: AudioContext) {
    super(context);
    this.convolver = context.createConvolver();
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
    entryNode.connect(this.convolver);
    this.convolver.connect(this.wetMix);
    this.wetMix.connect(this.outputMixer);

    this.connectProcessingChain(entryNode, this.outputMixer);
    this.generateIR();
  }

  private generateIR(): void {
    const sampleRate = this.context.sampleRate;
    const length = Math.floor(sampleRate * this.decayTime);
    const buffer = this.context.createBuffer(2, length, sampleRate);

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        // Exponential decay noise
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, 2);
      }
    }

    this.convolver.buffer = buffer;
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'decay':
        this.decayTime = value;
        this.generateIR();
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
      { name: 'decay', value: this.decayTime, min: 0.1, max: 10, step: 0.1, unit: 's' },
      { name: 'mix', value: this.mix, min: 0, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.convolver.disconnect();
    this.dryMix.disconnect();
    this.wetMix.disconnect();
    this.outputMixer.disconnect();
    super.dispose();
  }
}
