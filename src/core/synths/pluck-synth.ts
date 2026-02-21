import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Karplus-Strong style plucked string synth via Tone.PluckSynth.
 * Clean, bright plucked tones — guitar, harp, koto, pizzicato.
 *
 * Tone.PluckSynth doesn't extend Monophonic, so PolySynth can't wrap it.
 * We manage polyphony manually with a voice pool.
 */
export class PluckSynth implements RachSynthInstance {
  readonly type = 'pluck' as const;
  private voices: Tone.PluckSynth[];
  private activeNotes = new Map<number, Tone.PluckSynth>();
  private output: Tone.Gain;
  private maxPolyphony = 8;

  private attackNoise = 1;
  private dampening = 4000;
  private resonance = 0.98;

  constructor() {
    this.output = new Tone.Gain(0.6);

    const options = {
      attackNoise: this.attackNoise,
      dampening: this.dampening,
      resonance: this.resonance,
      release: 1,
    };

    this.voices = [];
    for (let i = 0; i < this.maxPolyphony; i++) {
      const voice = new Tone.PluckSynth(options);
      voice.connect(this.output);
      this.voices.push(voice);
    }
  }

  private getAvailableVoice(): Tone.PluckSynth {
    // Find a voice not currently in use
    for (const voice of this.voices) {
      if (!this.activeNotes.has(this.getVoiceKey(voice))) {
        return voice;
      }
    }
    // Steal the oldest voice
    return this.voices[0];
  }

  private getVoiceKey(voice: Tone.PluckSynth): number {
    for (const [key, v] of this.activeNotes) {
      if (v === voice) return key;
    }
    return -1;
  }

  noteOn(pitch: number, _velocity: number, time?: number): void {
    const voice = this.getAvailableVoice();
    const freq = Tone.Frequency(pitch, 'midi').toFrequency();
    this.activeNotes.set(pitch, voice);
    // PluckSynth is a physical model — no velocity param in triggerAttack
    voice.triggerAttack(freq, time);
  }

  noteOff(pitch: number, time?: number): void {
    const voice = this.activeNotes.get(pitch);
    if (!voice) return;
    this.activeNotes.delete(pitch);
    if (time !== undefined) {
      voice.triggerRelease(time);
    } else {
      voice.triggerRelease();
    }
  }

  allNotesOff(): void {
    for (const voice of this.activeNotes.values()) {
      voice.triggerRelease();
    }
    this.activeNotes.clear();
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
        for (const voice of this.voices) voice.set({ attackNoise: value });
        break;
      case 'dampening':
        this.dampening = value;
        for (const voice of this.voices) voice.set({ dampening: value });
        break;
      case 'resonance':
        this.resonance = value;
        for (const voice of this.voices) voice.set({ resonance: value });
        break;
    }
  }

  dispose(): void {
    for (const voice of this.voices) voice.dispose();
    this.output.dispose();
  }
}
