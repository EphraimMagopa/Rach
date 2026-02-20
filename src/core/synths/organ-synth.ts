import * as Tone from 'tone';
import type { RachSynthInstance, SynthParameter } from './synth-interface';

/**
 * Hammond-style organ with additive drawbar emulation.
 * Uses multiple oscillators at harmonic intervals to simulate organ drawbars.
 * Warm, rich organ tones — perfect for gospel, soul, reggae, and rock.
 */
export class OrganSynth implements RachSynthInstance {
  readonly type = 'organ' as const;
  private synth: Tone.PolySynth<Tone.Synth>;
  private output: Tone.Gain;
  private vibrato: Tone.Vibrato;

  private drawbar16 = 0.6;   // Sub-octave (16')
  private drawbar8 = 1.0;    // Fundamental (8')
  private drawbar4 = 0.4;    // 2nd harmonic (4')
  private drawbar513 = 0.3;  // 3rd harmonic (5 1/3')
  private vibratoAmount = 0.15;

  constructor() {
    this.output = new Tone.Gain(0.5);
    this.vibrato = new Tone.Vibrato({
      frequency: 6.5,
      depth: this.vibratoAmount,
      type: 'sine',
    });

    // Build a composite waveform from drawbar levels
    this.synth = new Tone.PolySynth(Tone.Synth, {
      oscillator: {
        type: 'custom',
        partials: this.buildPartials(),
      },
      envelope: {
        attack: 0.005,
        decay: 0.01,
        sustain: 1.0,
        release: 0.1,
      },
    });
    this.synth.maxPolyphony = 8;
    this.synth.connect(this.vibrato);
    this.vibrato.connect(this.output);
  }

  private buildPartials(): number[] {
    // Partials: [fundamental, 2nd, 3rd, 4th, ...]
    // Drawbar 16' = sub-octave (we model as fundamental with 8' as 2nd partial)
    // For simplicity: partials[0] = 8' (fundamental), partials[1] = 4' (2nd),
    // partials[2] = 5 1/3' mapped to 3rd partial, partials[3] = 16' mapped to sub
    return [
      this.drawbar8,     // 1st partial (8' fundamental)
      this.drawbar4,     // 2nd partial (4')
      this.drawbar513,   // 3rd partial (5 1/3' approx)
      this.drawbar16 * 0.5, // 4th partial (16' contribution)
    ];
  }

  private updatePartials(): void {
    this.synth.set({
      oscillator: {
        partials: this.buildPartials(),
      },
    });
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
      { name: 'drawbar16', value: this.drawbar16, min: 0, max: 1, step: 0.01 },
      { name: 'drawbar8', value: this.drawbar8, min: 0, max: 1, step: 0.01 },
      { name: 'drawbar4', value: this.drawbar4, min: 0, max: 1, step: 0.01 },
      { name: 'drawbar513', value: this.drawbar513, min: 0, max: 1, step: 0.01 },
      { name: 'vibratoAmount', value: this.vibratoAmount, min: 0, max: 1, step: 0.01 },
    ];
  }

  setParameter(name: string, value: number): void {
    switch (name) {
      case 'drawbar16':
        this.drawbar16 = value;
        this.updatePartials();
        break;
      case 'drawbar8':
        this.drawbar8 = value;
        this.updatePartials();
        break;
      case 'drawbar4':
        this.drawbar4 = value;
        this.updatePartials();
        break;
      case 'drawbar513':
        this.drawbar513 = value;
        this.updatePartials();
        break;
      case 'vibratoAmount':
        this.vibratoAmount = value;
        this.vibrato.depth.value = value;
        break;
    }
  }

  dispose(): void {
    this.synth.dispose();
    this.vibrato.dispose();
    this.output.dispose();
  }
}
