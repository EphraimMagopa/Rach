import { create } from 'zustand';

interface TransportState {
  isPlaying: boolean;
  isRecording: boolean;
  playheadBeats: number;
  tempo: number;
  timeSignature: [number, number];
  loopEnabled: boolean;
  loopStart: number;
  loopEnd: number;
  metronomeEnabled: boolean;

  play: () => void;
  pause: () => void;
  stop: () => void;
  toggleRecord: () => void;
  setPlayhead: (beats: number) => void;
  setTempo: (bpm: number) => void;
  setTimeSignature: (ts: [number, number]) => void;
  toggleLoop: () => void;
  setLoopRange: (start: number, end: number) => void;
  toggleMetronome: () => void;
}

export const useTransportStore = create<TransportState>((set) => ({
  isPlaying: false,
  isRecording: false,
  playheadBeats: 0,
  tempo: 120,
  timeSignature: [4, 4],
  loopEnabled: false,
  loopStart: 0,
  loopEnd: 16,
  metronomeEnabled: false,

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  stop: () => set({ isPlaying: false, isRecording: false, playheadBeats: 0 }),
  toggleRecord: () =>
    set((state) => ({
      isRecording: !state.isRecording,
      isPlaying: !state.isRecording ? true : state.isPlaying,
    })),
  setPlayhead: (beats) => set({ playheadBeats: beats }),
  setTempo: (tempo) => set({ tempo }),
  setTimeSignature: (timeSignature) => set({ timeSignature }),
  toggleLoop: () => set((state) => ({ loopEnabled: !state.loopEnabled })),
  setLoopRange: (start, end) => set({ loopStart: start, loopEnd: end }),
  toggleMetronome: () =>
    set((state) => ({ metronomeEnabled: !state.metronomeEnabled })),
}));
