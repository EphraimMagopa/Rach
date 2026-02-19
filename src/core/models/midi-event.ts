export type MIDIEventType = 'noteOn' | 'noteOff' | 'controlChange' | 'pitchBend' | 'programChange';

export interface MIDINote {
  id: string;
  pitch: number;        // 0-127
  velocity: number;     // 0-127
  startBeat: number;
  durationBeats: number;
}

export interface MIDIControlChange {
  id: string;
  controller: number;   // 0-127
  value: number;         // 0-127
  beat: number;
}

export interface MIDIPitchBend {
  id: string;
  value: number;         // -8192 to 8191
  beat: number;
}

export interface MIDIEvent {
  type: MIDIEventType;
  channel: number;       // 0-15
  beat: number;
  data: MIDINote | MIDIControlChange | MIDIPitchBend;
}
