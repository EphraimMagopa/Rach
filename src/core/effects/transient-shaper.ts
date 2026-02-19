import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Transient shaper — enhances or softens attack and sustain.
 * Uses envelope follower (analyser) to detect transients and apply gain shaping.
 */
export class TransientShaper extends BaseEffect {
  readonly effectType = 'transient-shaper';
  readonly category: EffectCategory = 'dynamics';

  private analyser: AnalyserNode;
  private shapeGain: GainNode;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private dataBuffer: Float32Array<ArrayBuffer>;
  private prevRms = 0;

  private attackGain = 0;   // dB boost/cut on transients
  private sustainGain = 0;  // dB boost/cut on sustain

  constructor(context: AudioContext) {
    super(context);
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataBuffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;

    this.shapeGain = context.createGain();

    this.analyser.connect(this.shapeGain);
    this.connectProcessingChain(this.analyser, this.shapeGain);

    this.timerId = setInterval(() => this.processTransients(), 5);
  }

  private processTransients(): void {
    this.analyser.getFloatTimeDomainData(this.dataBuffer);

    let sum = 0;
    for (let i = 0; i < this.dataBuffer.length; i++) {
      sum += this.dataBuffer[i] * this.dataBuffer[i];
    }
    const rms = Math.sqrt(sum / this.dataBuffer.length);

    // Detect transient: rapid increase in RMS
    const delta = rms - this.prevRms;
    const isTransient = delta > 0.01;

    const now = this.context.currentTime;
    const targetDb = isTransient ? this.attackGain : this.sustainGain;
    const targetLinear = Math.pow(10, targetDb / 20);

    this.shapeGain.gain.cancelScheduledValues(now);
    this.shapeGain.gain.setTargetAtTime(targetLinear, now, isTransient ? 0.001 : 0.02);

    this.prevRms = rms;
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'attack': this.attackGain = value; break;
      case 'sustain': this.sustainGain = value; break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'attack', value: this.attackGain, min: -12, max: 12, step: 0.5, unit: 'dB' },
      { name: 'sustain', value: this.sustainGain, min: -12, max: 12, step: 0.5, unit: 'dB' },
    ];
  }

  dispose(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.analyser.disconnect();
    this.shapeGain.disconnect();
    super.dispose();
  }
}
