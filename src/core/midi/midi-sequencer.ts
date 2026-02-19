import type { MIDINote } from '../models/midi-event';

export interface ScheduledNote {
  note: MIDINote;
  trackId: string;
}

export class MIDISequencer {
  private scheduledNotes: ScheduledNote[] = [];
  private playingNotes = new Map<string, ScheduledNote>();

  scheduleNotes(notes: MIDINote[], trackId: string): void {
    const newNotes = notes.map((note) => ({ note, trackId }));
    this.scheduledNotes.push(...newNotes);
    this.scheduledNotes.sort((a, b) => a.note.startBeat - b.note.startBeat);
  }

  getNotesInRange(startBeat: number, endBeat: number): ScheduledNote[] {
    return this.scheduledNotes.filter(
      (sn) =>
        sn.note.startBeat >= startBeat &&
        sn.note.startBeat < endBeat
    );
  }

  noteOn(noteId: string, scheduled: ScheduledNote): void {
    this.playingNotes.set(noteId, scheduled);
  }

  noteOff(noteId: string): void {
    this.playingNotes.delete(noteId);
  }

  clear(): void {
    this.scheduledNotes = [];
    this.playingNotes.clear();
  }
}
