import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Wavetable-style morphing synth.
 * Morphs between sine, triangle, sawtooth, and square via oscillator type mixing.
 */
export class WavetableSynth implements RachSynthInstance {
  readonly type = 'wavetable' as const;
  private synth: Tone.PolySynth;
  private filter: Tone.Filter;
  private output: Tone.Gain;

  private morph = 0; // 0=sine, 0.33=triangle, 0.66=sawtooth, 1=square
  private brightness = 5000;

  private static readonly WAVE_TYPES: OscillatorType[] = ['sine', 'triangle', 'sawtooth', 'square'];

  constructor() {
    this.output = new Tone.Gain(0.6);
    this.filter = new Tone.Filter({ frequency: this.brightness, type: 'lowpass' }).connect(this.output);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'sine' },
      envelope: { attack: 0.05, decay: 0.3, sustain: 0.7, release: 0.8 },
    });
    this.synth.maxPolyphony = 8;
    this.synth.connect(this.filter);
  }

  noteOn(pitch: number, velocity: number, time?: number): void {
    const freq = Tone.Frequency(pitch, 'midi').toFrequency();
    const vel = velocity / 127;
    if (time !== undefined) {
      this.synth.triggerAttack(freq, time, vel);
    } else {
      this.synth.triggerAttack(freq, undefined, vel);
    }
  }

  noteOff(pitch: number, time?: number): void {
    const freq = Tone.Frequency(pitch, 'midi').toFrequency();
    if (time !== undefined) {
      this.synth.triggerRelease(freq, time);
    } else {
      this.synth.triggerRelease(freq);
    }
  }

  allNotesOff(): void {
    this.synth.releaseAll();
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination as unknown as Tone.ToneAudioNode);
  }

  disconnect(): void {
    this.output.disconnect();
  }

  getParameters(): SynthParameter[] {
    return [
      { name: 'morph', value: this.morph, min: 0, max: 1, step: 0.01 },
      { name: 'brightness', value: this.brightness, min: 200, max: 15000, step: 50 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'morph': {
        this.morph = value;
        const idx = Math.min(
          Math.floor(value * WavetableSynth.WAVE_TYPES.length),
          WavetableSynth.WAVE_TYPES.length - 1
        );
        this.synth.set({ oscillator: { type: WavetableSynth.WAVE_TYPES[idx] } });
        break;
      }
      case 'brightness':
        this.brightness = value;
        this.filter.frequency.value = value;
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.filter.dispose();
    this.output.dispose();
  }
}
