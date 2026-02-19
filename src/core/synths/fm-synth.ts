import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * FM synthesis — 4-operator style via Tone.FMSynth.
 * Rich metallic / bell / electric piano tones.
 */
export class FMSynth implements RachSynthInstance {
  readonly type = 'fm' as const;
  private synth: Tone.PolySynth<Tone.FMSynth>;
  private output: Tone.Gain;

  private modulationIndex = 10;
  private harmonicity = 3;

  constructor() {
    this.output = new Tone.Gain(0.5);

    this.synth = new Tone.PolySynth(Tone.FMSynth, {
      modulationIndex: this.modulationIndex,
      harmonicity: this.harmonicity,
      oscillator: { type: 'sine' },
      modulation: { type: 'square' },
      envelope: { attack: 0.01, decay: 0.4, sustain: 0.3, release: 0.8 },
      modulationEnvelope: { attack: 0.01, decay: 0.3, sustain: 0.5, release: 0.5 },
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
      { name: 'modulationIndex', value: this.modulationIndex, min: 0, max: 50, step: 0.5 },
      { name: 'harmonicity', value: this.harmonicity, min: 0.5, max: 12, step: 0.1 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'modulationIndex':
        this.modulationIndex = value;
        this.synth.set({ modulationIndex: value });
        break;
      case 'harmonicity':
        this.harmonicity = value;
        this.synth.set({ harmonicity: value });
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.output.dispose();
  }
}
