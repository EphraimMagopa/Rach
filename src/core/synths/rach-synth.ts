import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Lush pad synth — detuned oscillators + chorus + reverb.
 * Uses Tone.PolySynth for polyphony.
 */
export class RachPadSynth implements RachSynthInstance {
  readonly type = 'rach-pad' as const;
  private synth: Tone.PolySynth;
  private chorus: Tone.Chorus;
  private reverb: Tone.Reverb;
  private output: Tone.Gain;

  private attack = 0.3;
  private release = 1.5;
  private chorusDepth = 0.7;
  private reverbMix = 0.4;

  constructor() {
    this.output = new Tone.Gain(0.6);
    this.chorus = new Tone.Chorus(1.5, 3.5, this.chorusDepth).connect(this.output);
    this.reverb = new Tone.Reverb({ decay: 3, wet: this.reverbMix }).connect(this.output);

    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: { type: 'fatsawtooth', count: 3, spread: 20 },
      envelope: { attack: this.attack, decay: 0.5, sustain: 0.7, release: this.release },
    });
    this.synth.maxPolyphony = 8;
    this.synth.connect(this.chorus);
    this.synth.connect(this.reverb);
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
      { name: 'attack', value: this.attack, min: 0.01, max: 2, step: 0.01 },
      { name: 'release', value: this.release, min: 0.1, max: 5, step: 0.1 },
      { name: 'chorusDepth', value: this.chorusDepth, min: 0, max: 1, step: 0.01 },
      { name: 'reverbMix', value: this.reverbMix, min: 0, max: 1, step: 0.01 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'attack':
        this.attack = value;
        this.synth.set({ envelope: { attack: value } });
        break;
      case 'release':
        this.release = value;
        this.synth.set({ envelope: { release: value } });
        break;
      case 'chorusDepth':
        this.chorusDepth = value;
        this.chorus.depth = value;
        break;
      case 'reverbMix':
        this.reverbMix = value;
        this.reverb.wet.value = value;
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.chorus.dispose();
    this.reverb.dispose();
    this.output.dispose();
  }
}
