import type { RachSynthInstance, SynthType } from '../synths/synth-interface';
import { createSynth } from '../synths/synth-factory';
import type { AudioEngine } from './audio-engine';

/**
 * Maps trackId → synth instance.
 * Connects synth output to the track's inputNode.
 */
export class TrackInstrumentManager {
  private audioEngine: AudioEngine;
  private instruments = new Map<string, RachSynthInstance>();

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  /** Assign a synth to a track. Disposes any existing synth on that track. */
  assignSynth(trackId: string, type: SynthType): RachSynthInstance {
    this.removeSynth(trackId);

    const synth = createSynth(type);
    const trackNode = this.audioEngine.getTrackNode(trackId);
    if (trackNode) {
      synth.connect(trackNode.inputNode);
    }
    this.instruments.set(trackId, synth);
    return synth;
  }

  /** Get the synth for a track. */
  getSynth(trackId: string): RachSynthInstance | undefined {
    return this.instruments.get(trackId);
  }

  /** Remove and dispose the synth for a track. */
  removeSynth(trackId: string): void {
    const existing = this.instruments.get(trackId);
    if (existing) {
      existing.allNotesOff();
      existing.disconnect();
      existing.dispose();
      this.instruments.delete(trackId);
    }
  }

  /** Reconnect a synth (e.g. after track node is recreated). */
  reconnect(trackId: string): void {
    const synth = this.instruments.get(trackId);
    const trackNode = this.audioEngine.getTrackNode(trackId);
    if (synth && trackNode) {
      synth.disconnect();
      synth.connect(trackNode.inputNode);
    }
  }

  /** All notes off on all synths. */
  allNotesOff(): void {
    this.instruments.forEach((synth) => synth.allNotesOff());
  }

  dispose(): void {
    this.instruments.forEach((synth) => {
      synth.allNotesOff();
      synth.disconnect();
      synth.dispose();
    });
    this.instruments.clear();
  }
}
