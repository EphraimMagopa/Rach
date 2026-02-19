import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Noise gate / expander.
 * Uses a ScriptProcessorNode-free approach: analyser + gain scheduling.
 * Polls RMS level and ramps gain to 0 when below threshold.
 */
export class GateExpander extends BaseEffect {
  readonly effectType = 'gate-expander';
  readonly category: EffectCategory = 'dynamics';

  private analyser: AnalyserNode;
  private gateGain: GainNode;
  private timerId: ReturnType<typeof setInterval> | null = null;
  private dataBuffer: Float32Array<ArrayBuffer>;

  private threshold = -40;
  private attackTime = 0.001;
  private releaseTime = 0.1;
  private range = -80; // dB attenuation when closed
  private isOpen = true;

  constructor(context: AudioContext) {
    super(context);
    this.analyser = context.createAnalyser();
    this.analyser.fftSize = 256;
    this.dataBuffer = new Float32Array(this.analyser.fftSize) as Float32Array<ArrayBuffer>;

    this.gateGain = context.createGain();

    this.analyser.connect(this.gateGain);
    this.connectProcessingChain(this.analyser, this.gateGain);

    // Poll level every 10ms
    this.timerId = setInterval(() => this.processGate(), 10);
  }

  private processGate(): void {
    this.analyser.getFloatTimeDomainData(this.dataBuffer);

    // Calculate RMS
    let sum = 0;
    for (let i = 0; i < this.dataBuffer.length; i++) {
      sum += this.dataBuffer[i] * this.dataBuffer[i];
    }
    const rms = Math.sqrt(sum / this.dataBuffer.length);
    const db = rms > 0 ? 20 * Math.log10(rms) : -100;

    const now = this.context.currentTime;
    if (db >= this.threshold) {
      if (!this.isOpen) {
        this.isOpen = true;
        this.gateGain.gain.cancelScheduledValues(now);
        this.gateGain.gain.setTargetAtTime(1, now, this.attackTime / 3);
      }
    } else {
      if (this.isOpen) {
        this.isOpen = false;
        const closedGain = Math.pow(10, this.range / 20);
        this.gateGain.gain.cancelScheduledValues(now);
        this.gateGain.gain.setTargetAtTime(closedGain, now, this.releaseTime / 3);
      }
    }
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'threshold': this.threshold = value; break;
      case 'attack': this.attackTime = value; break;
      case 'release': this.releaseTime = value; break;
      case 'range': this.range = value; break;
    }
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'threshold', value: this.threshold, min: -80, max: 0, step: 0.5, unit: 'dB' },
      { name: 'attack', value: this.attackTime, min: 0.001, max: 0.1, step: 0.001, unit: 's' },
      { name: 'release', value: this.releaseTime, min: 0.01, max: 1, step: 0.01, unit: 's' },
      { name: 'range', value: this.range, min: -80, max: 0, step: 1, unit: 'dB' },
    ];
  }

  dispose(): void {
    if (this.timerId !== null) clearInterval(this.timerId);
    this.analyser.disconnect();
    this.gateGain.disconnect();
    super.dispose();
  }
}
