import type { Track } from './track';

export interface TimeSignature {
  numerator: number;
  denominator: number;
}

export interface ProjectMetadata {
  title: string;
  artist: string;
  genre: string;
  description: string;
  createdAt: string;
  modifiedAt: string;
}

export interface MasterBus {
  volume: number;        // dB
  pan: number;
  effects: import('./effects').EffectInstance[];
}

export interface Project {
  id: string;
  metadata: ProjectMetadata;
  tempo: number;         // BPM
  timeSignature: TimeSignature;
  sampleRate: number;
  tracks: Track[];
  masterBus: MasterBus;
  durationBeats: number;
}

export function createDefaultProject(): Project {
  return {
    id: crypto.randomUUID(),
    metadata: {
      title: 'Untitled Project',
      artist: '',
      genre: '',
      description: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    tempo: 120,
    timeSignature: { numerator: 4, denominator: 4 },
    sampleRate: 44100,
    tracks: [],
    masterBus: { volume: 0, pan: 0, effects: [] },
    durationBeats: 0,
  };
}
