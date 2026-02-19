import { create } from 'zustand';
import type { Project, Track, TimeSignature, Clip, MIDINote } from '@/core/models';
import { createDefaultProject } from '@/core/models';

interface ProjectState {
  project: Project;
  selectedTrackId: string | null;
  selectedClipId: string | null;

  setProject: (project: Project) => void;
  addTrack: (track: Track) => void;
  removeTrack: (trackId: string) => void;
  updateTrack: (trackId: string, updates: Partial<Track>) => void;
  selectTrack: (trackId: string | null) => void;
  selectClip: (clipId: string | null) => void;
  setTempo: (tempo: number) => void;
  setTimeSignature: (ts: TimeSignature) => void;

  // Clip CRUD
  addClip: (trackId: string, clip: Clip) => void;
  removeClip: (trackId: string, clipId: string) => void;
  updateClip: (trackId: string, clipId: string, updates: Partial<Clip>) => void;

  // MIDI note CRUD
  addMidiNote: (trackId: string, clipId: string, note: MIDINote) => void;
  removeMidiNote: (trackId: string, clipId: string, noteId: string) => void;
  updateMidiNote: (trackId: string, clipId: string, noteId: string, updates: Partial<MIDINote>) => void;
}

function mapClipsInTrack(
  tracks: Track[],
  trackId: string,
  fn: (clips: Clip[]) => Clip[]
): Track[] {
  return tracks.map((t) =>
    t.id === trackId ? { ...t, clips: fn(t.clips) } : t
  );
}

function mapNotesInClip(
  clips: Clip[],
  clipId: string,
  fn: (notes: MIDINote[]) => MIDINote[]
): Clip[] {
  return clips.map((c) => {
    if (c.id !== clipId || c.type !== 'midi' || !c.midiData) return c;
    return { ...c, midiData: { ...c.midiData, notes: fn(c.midiData.notes) } };
  });
}

export const useProjectStore = create<ProjectState>((set) => ({
  project: createDefaultProject(),
  selectedTrackId: null,
  selectedClipId: null,

  setProject: (project) => set({ project }),

  addTrack: (track) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: [...state.project.tracks, track],
        metadata: { ...state.project.metadata, modifiedAt: new Date().toISOString() },
      },
    })),

  removeTrack: (trackId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.filter((t) => t.id !== trackId),
      },
      selectedTrackId:
        state.selectedTrackId === trackId ? null : state.selectedTrackId,
    })),

  updateTrack: (trackId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: state.project.tracks.map((t) =>
          t.id === trackId ? { ...t, ...updates } : t
        ),
      },
    })),

  selectTrack: (trackId) => set({ selectedTrackId: trackId }),
  selectClip: (clipId) => set({ selectedClipId: clipId }),

  setTempo: (tempo) =>
    set((state) => ({
      project: { ...state.project, tempo },
    })),

  setTimeSignature: (timeSignature) =>
    set((state) => ({
      project: { ...state.project, timeSignature },
    })),

  // Clip CRUD
  addClip: (trackId, clip) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) => [
          ...clips,
          clip,
        ]),
      },
    })),

  removeClip: (trackId, clipId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) =>
          clips.filter((c) => c.id !== clipId)
        ),
      },
      selectedClipId:
        state.selectedClipId === clipId ? null : state.selectedClipId,
    })),

  updateClip: (trackId, clipId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) =>
          clips.map((c) => (c.id === clipId ? { ...c, ...updates } : c))
        ),
      },
    })),

  // MIDI note CRUD
  addMidiNote: (trackId, clipId, note) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) =>
          mapNotesInClip(clips, clipId, (notes) => [...notes, note])
        ),
      },
    })),

  removeMidiNote: (trackId, clipId, noteId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) =>
          mapNotesInClip(clips, clipId, (notes) =>
            notes.filter((n) => n.id !== noteId)
          )
        ),
      },
    })),

  updateMidiNote: (trackId, clipId, noteId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapClipsInTrack(state.project.tracks, trackId, (clips) =>
          mapNotesInClip(clips, clipId, (notes) =>
            notes.map((n) => (n.id === noteId ? { ...n, ...updates } : n))
          )
        ),
      },
    })),
}));
