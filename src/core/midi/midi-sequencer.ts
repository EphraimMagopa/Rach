import type { MIDINote } from '../models/midi-event';
import type { Clip } from '../models/clip';
import type { TrackInstrumentManager } from '../audio/track-instrument-manager';

export interface ScheduledNote {
  note: MIDINote;
  trackId: string;
  /** Absolute beat position (clip startBeat + note startBeat) */
  absoluteStart: number;
  /** Absolute beat position of note end */
  absoluteEnd: number;
}

/**
 * Schedules MIDI notes from clips during the transport lookahead window.
 * Called by TransportEngine on each schedule tick.
 */
export class MIDISequencer {
  private instrumentManager: TrackInstrumentManager | null = null;

  /** Track which notes are currently sounding so we can send noteOff */
  private activeNotes = new Map<string, { trackId: string; pitch: number }>();

  setInstrumentManager(manager: TrackInstrumentManager): void {
    this.instrumentManager = manager;
  }

  /**
   * Called by the transport lookahead scheduler.
   * Finds all MIDI notes in [fromBeat, toBeat) across all clips,
   * and schedules noteOn/noteOff on the correct synth.
   */
  scheduleRange(
    clips: Clip[],
    fromBeat: number,
    toBeat: number,
    beatToTime: (beat: number) => number
  ): void {
    if (!this.instrumentManager) return;

    for (const clip of clips) {
      if (clip.type !== 'midi' || !clip.midiData) continue;

      for (const note of clip.midiData.notes) {
        const noteStart = clip.startBeat + note.startBeat;
        const noteEnd = noteStart + note.durationBeats;

        // Schedule noteOn if the note starts in this window
        if (noteStart >= fromBeat && noteStart < toBeat) {
          const synth = this.instrumentManager.getSynth(clip.trackId);
          if (synth) {
            const time = beatToTime(noteStart);
            synth.noteOn(note.pitch, note.velocity, time);
            this.activeNotes.set(note.id, {
              trackId: clip.trackId,
              pitch: note.pitch,
            });
          }
        }

        // Schedule noteOff if the note ends in this window
        if (noteEnd >= fromBeat && noteEnd < toBeat) {
          const synth = this.instrumentManager.getSynth(clip.trackId);
          if (synth) {
            const time = beatToTime(noteEnd);
            synth.noteOff(note.pitch, time);
            this.activeNotes.delete(note.id);
          }
        }
      }
    }
  }

  /** Kill all sounding notes immediately. Called on stop. */
  allNotesOff(): void {
    if (!this.instrumentManager) return;
    this.instrumentManager.allNotesOff();
    this.activeNotes.clear();
  }
}
