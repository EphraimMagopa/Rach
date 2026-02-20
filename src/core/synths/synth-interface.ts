export type SynthType =
  | 'rach-pad'
  | 'subtractive'
  | 'wavetable'
  | 'fm'
  | 'granular'
  | 'pluck'
  | 'organ';

export interface SynthParameter {
  name: string;
  value: number;
  min: number;
  max: number;
  step?: number;
}

export interface RachSynthInstance {
  readonly type: SynthType;

  noteOn(pitch: number, velocity: number, time?: number): void;
  noteOff(pitch: number, time?: number): void;
  allNotesOff(): void;

  connect(destination: AudioNode): void;
  disconnect(): void;

  getParameters(): SynthParameter[];
  setParameter(name: string, value: number): void;

  dispose(): void;
}
