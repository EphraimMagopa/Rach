import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Classic analog-style subtractive synth.
 * Oscillator → LP filter (with envelope) → amp envelope.
 */
export class SubtractiveSynth implements RachSynthInstance {
  readonly type = 'subtractive' as const;
  private synth: Tone.PolySynth<Tone.MonoSynth>;
  private output: Tone.Gain;

  private cutoff = 2000;
  private resonance = 1;
  private filterEnvAmount = 3000;

  constructor() {
    this.output = new Tone.Gain(0.6);

    this.synth = new Tone.PolySynth(Tone.MonoSynth, {
      oscillator: { type: 'sawtooth' },
      filter: {
        Q: this.resonance,
        type: 'lowpass',
        rolloff: -24,
      },
      filterEnvelope: {
        attack: 0.05,
        decay: 0.3,
        sustain: 0.4,
        release: 0.8,
        baseFrequency: this.cutoff,
        octaves: Math.log2((this.cutoff + this.filterEnvAmount) / this.cutoff),
      },
      envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.6,
        release: 0.5,
      },
    });
    this.synth.maxPolyphony = 6;
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
      { name: 'cutoff', value: this.cutoff, min: 100, max: 10000, step: 10 },
      { name: 'resonance', value: this.resonance, min: 0, max: 20, step: 0.1 },
      { name: 'filterEnvAmount', value: this.filterEnvAmount, min: 0, max: 8000, step: 50 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'cutoff':
        this.cutoff = value;
        this.synth.set({
          filterEnvelope: {
            baseFrequency: value,
            octaves: Math.log2((value + this.filterEnvAmount) / value),
          },
        });
        break;
      case 'resonance':
        this.resonance = value;
        this.synth.set({ filter: { Q: value } });
        break;
      case 'filterEnvAmount':
        this.filterEnvAmount = value;
        this.synth.set({
          filterEnvelope: {
            octaves: Math.log2((this.cutoff + value) / this.cutoff),
          },
        });
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.output.dispose();
  }
}
