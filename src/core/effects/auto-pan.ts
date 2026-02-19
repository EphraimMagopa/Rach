import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/** Auto-panner — LFO-modulated stereo panning. */
export class AutoPan extends BaseEffect {
  readonly effectType = 'auto-pan';
  readonly category: EffectCategory = 'creative';

  private panner: StereoPannerNode;
  private lfo: OscillatorNode;
  private lfoGain: GainNode;

  private rate = 2;
  private depth = 0.8;
  private waveform: OscillatorType = 'sine';

  constructor(context: AudioContext) {
    super(context);

    this.panner = context.createStereoPanner();
    this.panner.pan.value = 0;

    this.lfo = context.createOscillator();
    this.lfo.type = this.waveform;
    this.lfo.frequency.value = this.rate;

    this.lfoGain = context.createGain();
    this.lfoGain.gain.value = this.depth;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.panner.pan);
    this.lfo.start();

    this.connectProcessingChain(this.panner, this.panner);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'rate':
        this.rate = value;
        this.lfo.frequency.value = value;
        break;
      case 'depth':
        this.depth = value;
        this.lfoGain.gain.value = value;
        break;
      case 'waveform': {
        // 0=sine, 1=triangle, 2=square, 3=sawtooth
        const types: OscillatorType[] = ['sine', 'triangle', 'square', 'sawtooth'];
        this.waveform = types[Math.floor(value)] || 'sine';
        this.lfo.type = this.waveform;
        break;
      }
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    const waveformIdx = ['sine', 'triangle', 'square', 'sawtooth'].indexOf(this.waveform);
    return [
      { name: 'rate', value: this.rate, min: 0.05, max: 20, step: 0.01, unit: 'Hz' },
      { name: 'depth', value: this.depth, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'waveform', value: waveformIdx, min: 0, max: 3, step: 1, unit: '' },
    ];
  }

  dispose(): void {
    this.lfo.stop();
    this.lfo.disconnect();
    this.lfoGain.disconnect();
    this.panner.disconnect();
    super.dispose();
  }
}
