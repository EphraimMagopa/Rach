import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Karplus-Strong style plucked string synth via Tone.PluckSynth.
 * Clean, bright plucked tones — guitar, harp, koto, pizzicato.
 *
 * Note: PluckSynth doesn't extend Monophonic in Tone.js's type definitions,
 * so PolySynth<PluckSynth> doesn't typecheck. We use PolySynth (unparameterized)
 * and cast PluckSynth-specific options where needed. This works at runtime.
 */
export class PluckSynth implements RachSynthInstance {
  readonly type = 'pluck' as const;
  private synth: Tone.PolySynth;
  private output: Tone.Gain;

  private attackNoise = 1;
  private dampening = 4000;
  private resonance = 0.98;

  constructor() {
    this.output = new Tone.Gain(0.6);

    // PluckSynth works with PolySynth at runtime but the types don't align
    this.synth = new (Tone.PolySynth as any)(Tone.PluckSynth, {
      attackNoise: this.attackNoise,
      dampening: this.dampening,
      resonance: this.resonance,
      release: 1,
    });
    this.synth.maxPolyphony = 8;
    this.synth.connect(this.output);
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
      { name: 'attackNoise', value: this.attackNoise, min: 0.1, max: 5, step: 0.1 },
      { name: 'dampening', value: this.dampening, min: 200, max: 10000, step: 50 },
      { name: 'resonance', value: this.resonance, min: 0.5, max: 0.999, step: 0.001 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'attackNoise':
        this.attackNoise = value;
        (this.synth as any).set({ attackNoise: value });
        break;
      case 'dampening':
        this.dampening = value;
        (this.synth as any).set({ dampening: value });
        break;
      case 'resonance':
        this.resonance = value;
        (this.synth as any).set({ resonance: value });
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.output.dispose();
  }
}
