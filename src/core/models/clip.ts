import type { MIDINote } from './midi-event';

export type ClipType = 'audio' | 'midi';

export interface FadeConfig {
  inDuration: number;   // beats
  outDuration: number;  // beats
  inCurve: number;      // 0-1 (linear to exponential)
  outCurve: number;
}

export interface AudioClipData {
  fileId: string;
  sampleRate: number;
  channels: number;
  startOffset: number;  // samples into the file
  gain: number;         // dB
  pitch: number;        // semitones shift
}

export interface MIDIClipData {
  notes: MIDINote[];
}

export interface Clip {
  id: string;
  name: string;
  type: ClipType;
  trackId: string;
  startBeat: number;
  durationBeats: number;
  loopEnabled: boolean;
  loopLengthBeats: number;
  fade: FadeConfig;
  color: string;
  audioData?: AudioClipData;
  midiData?: MIDIClipData;
}
