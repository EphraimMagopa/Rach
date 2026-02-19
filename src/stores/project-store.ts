import { create } from 'zustand';
import type { Project, Track, TimeSignature } from '@/core/models';
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
        modifiedAt: new Date().toISOString(),
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
}));
