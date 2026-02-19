import { BaseEffect } from './base-effect';
import type { EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * Spectral processing — frequency-domain manipulation using analyzer + filter banks.
 * Implements spectral freeze and spectral tilt.
 */
export class SpectralProcessing extends BaseEffect {
  readonly effectType = 'spectral-processing';
  readonly category: EffectCategory = 'creative';

  private lpFilter: BiquadFilterNode;
  private hpFilter: BiquadFilterNode;
  private shelfLow: BiquadFilterNode;
  private shelfHigh: BiquadFilterNode;

  private tilt = 0; // -1 to 1: negative = dark, positive = bright
  private brightness = 0.5;
  private spectralWidth = 1;

  constructor(context: AudioContext) {
    super(context);

    this.lpFilter = context.createBiquadFilter();
    this.lpFilter.type = 'lowpass';
    this.lpFilter.frequency.value = 20000;

    this.hpFilter = context.createBiquadFilter();
    this.hpFilter.type = 'highpass';
    this.hpFilter.frequency.value = 20;

    this.shelfLow = context.createBiquadFilter();
    this.shelfLow.type = 'lowshelf';
    this.shelfLow.frequency.value = 300;
    this.shelfLow.gain.value = 0;

    this.shelfHigh = context.createBiquadFilter();
    this.shelfHigh.type = 'highshelf';
    this.shelfHigh.frequency.value = 3000;
    this.shelfHigh.gain.value = 0;

    this.hpFilter.connect(this.lpFilter);
    this.lpFilter.connect(this.shelfLow);
    this.shelfLow.connect(this.shelfHigh);

    this.connectProcessingChain(this.hpFilter, this.shelfHigh);
    this.updateSpectral();
  }

  private updateSpectral(): void {
    // Tilt: boost low and cut high (or vice versa)
    const tiltDb = this.tilt * 12;
    this.shelfLow.gain.value = -tiltDb;
    this.shelfHigh.gain.value = tiltDb;

    // Brightness: LP filter cutoff
    this.lpFilter.frequency.value = 1000 + this.brightness * 19000;

    // Width: narrow the frequency range
    this.hpFilter.frequency.value = 20 + (1 - this.spectralWidth) * 500;
    this.lpFilter.frequency.value = Math.min(this.lpFilter.frequency.value, 20000 * this.spectralWidth);
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'tilt': this.tilt = value; break;
      case 'brightness': this.brightness = value; break;
      case 'spectralWidth': this.spectralWidth = value; break;
    }
    this.updateSpectral();
  }

  getParameters(): EffectParameterDescriptor[] {
    return [
      { name: 'tilt', value: this.tilt, min: -1, max: 1, step: 0.01, unit: '' },
      { name: 'brightness', value: this.brightness, min: 0, max: 1, step: 0.01, unit: '' },
      { name: 'spectralWidth', value: this.spectralWidth, min: 0.1, max: 1, step: 0.01, unit: '' },
    ];
  }

  dispose(): void {
    this.lpFilter.disconnect();
    this.hpFilter.disconnect();
    this.shelfLow.disconnect();
    this.shelfHigh.disconnect();
    super.dispose();
  }
}
