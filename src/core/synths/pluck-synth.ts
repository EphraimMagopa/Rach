import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Karplus-Strong style plucked string synth via Tone.PluckSynth.
 * Clean, bright plucked tones — guitar, harp, koto, pizzicato.
 */
export class PluckSynth implements RachSynthInstance {
  readonly type = 'pluck' as const;
  private synth: Tone.PolySynth<Tone.PluckSynth>;
  private output: Tone.Gain;

  private attackNoise = 1;
  private dampening = 4000;
  private resonance = 0.98;

  constructor() {
    this.output = new Tone.Gain(0.6);

    this.synth = new Tone.PolySynth(Tone.PluckSynth, {
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
        this.synth.set({ attackNoise: value });
        break;
      case 'dampening':
        this.dampening = value;
        this.synth.set({ dampening: value });
        break;
      case 'resonance':
        this.resonance = value;
        this.synth.set({ resonance: value });
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.output.dispose();
  }
}
