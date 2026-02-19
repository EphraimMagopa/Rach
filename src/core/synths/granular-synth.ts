import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Granular-textural synth.
 * Uses Tone.GrainPlayer with a generated buffer for pad/texture sounds.
 * Falls back to a noise-based granular approach when no audio file is loaded.
 */
export class GranularSynth implements RachSynthInstance {
  readonly type = 'granular' as const;
  private player: Tone.GrainPlayer | null = null;
  private noiseSynth: Tone.NoiseSynth;
  private filter: Tone.Filter;
  private output: Tone.Gain;

  private grainSize = 0.1;
  private overlap = 0.05;
  private playbackRate = 1;

  constructor() {
    this.output = new Tone.Gain(0.5);
    this.filter = new Tone.Filter({
      frequency: 3000,
      type: 'bandpass',
      Q: 2,
    }).connect(this.output);

    // Fallback noise-based texture
    this.noiseSynth = new Tone.NoiseSynth({
      noise: { type: 'pink' },
      envelope: { attack: 0.5, decay: 0.3, sustain: 0.8, release: 1.5 },
    });
    this.noiseSynth.connect(this.filter);
  }

  noteOn(pitch: number, velocity: number, time?: number): void {
    const vel = velocity / 127;
    // Map pitch to filter frequency for tonal variation
    const freq = Tone.Frequency(pitch, 'midi').toFrequency();
    this.filter.frequency.value = freq;
    this.output.gain.value = vel * 0.5;

    if (this.player) {
      this.player.start(time);
    } else {
      if (time !== undefined) {
        this.noiseSynth.triggerAttack(time);
      } else {
        this.noiseSynth.triggerAttack();
      }
    }
  }

  noteOff(_pitch: number, time?: number): void {
    if (this.player) {
      this.player.stop(time ?? undefined);
    } else {
      if (time !== undefined) {
        this.noiseSynth.triggerRelease(time);
      } else {
        this.noiseSynth.triggerRelease();
      }
    }
  }

  allNotesOff(): void {
    if (this.player) {
      this.player.stop();
    } else {
      this.noiseSynth.triggerRelease();
    }
  }

  connect(destination: AudioNode): void {
    this.output.connect(destination as unknown as Tone.ToneAudioNode);
  }

  disconnect(): void {
    this.output.disconnect();
  }

  getParameters(): SynthParameter[] {
    return [
      { name: 'grainSize', value: this.grainSize, min: 0.01, max: 0.5, step: 0.01 },
      { name: 'overlap', value: this.overlap, min: 0.01, max: 0.3, step: 0.01 },
      { name: 'playbackRate', value: this.playbackRate, min: 0.25, max: 4, step: 0.05 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'grainSize':
        this.grainSize = value;
        if (this.player) this.player.grainSize = value;
        break;
      case 'overlap':
        this.overlap = value;
        if (this.player) this.player.overlap = value;
        break;
      case 'playbackRate':
        this.playbackRate = value;
        if (this.player) this.player.playbackRate = value;
        break;
    }
  }

  dispose(): void {
    this.player?.dispose();
    this.noiseSynth.dispose();
    this.filter.dispose();
    this.output.dispose();
  }
}
