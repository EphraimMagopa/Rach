import { create } from 'zustand';
import type { Project, Track, TimeSignature, Clip, MIDINote } from '../core/models';
import type { EffectInstance } from '../core/models/effects';
import type { AutomationLane, AutomationPoint } from '../core/models/automation';
import type { Send } from '../core/models/send';
import { createDefaultProject } from '../core/models';

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

  // Effect CRUD (Phase 2)
  addEffect: (trackId: string, effect: EffectInstance) => void;
  removeEffect: (trackId: string, effectId: string) => void;
  updateEffect: (trackId: string, effectId: string, updates: Partial<EffectInstance>) => void;
  reorderEffects: (trackId: string, effectIds: string[]) => void;
  updateEffectParameter: (trackId: string, effectId: string, paramName: string, value: number) => void;

  // Automation CRUD (Phase 2)
  addAutomationLane: (trackId: string, lane: AutomationLane) => void;
  removeAutomationLane: (trackId: string, laneId: string) => void;
  addAutomationPoint: (trackId: string, laneId: string, point: AutomationPoint) => void;
  removeAutomationPoint: (trackId: string, laneId: string, pointId: string) => void;
  updateAutomationPoint: (trackId: string, laneId: string, pointId: string, updates: Partial<AutomationPoint>) => void;

  // Send CRUD (Phase 2)
  addSend: (trackId: string, send: Send) => void;
  removeSend: (trackId: string, sendId: string) => void;
  updateSend: (trackId: string, sendId: string, updates: Partial<Send>) => void;
  setTrackOutput: (trackId: string, output: Track['output']) => void;
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

function mapTrack(tracks: Track[], trackId: string, fn: (t: Track) => Track): Track[] {
  return tracks.map((t) => (t.id === trackId ? fn(t) : t));
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

  // ═══════════════════════════════════════
  // Effect CRUD (Phase 2)
  // ═══════════════════════════════════════
  addEffect: (trackId, effect) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          effects: [...t.effects, effect],
        })),
      },
    })),

  removeEffect: (trackId, effectId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          effects: t.effects.filter((e) => e.id !== effectId),
        })),
      },
    })),

  updateEffect: (trackId, effectId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          effects: t.effects.map((e) => (e.id === effectId ? { ...e, ...updates } : e)),
        })),
      },
    })),

  reorderEffects: (trackId, effectIds) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => {
          const ordered = effectIds
            .map((id) => t.effects.find((e) => e.id === id))
            .filter((e): e is EffectInstance => e !== undefined);
          return { ...t, effects: ordered };
        }),
      },
    })),

  updateEffectParameter: (trackId, effectId, paramName, value) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          effects: t.effects.map((e) => {
            if (e.id !== effectId) return e;
            return {
              ...e,
              parameters: e.parameters.map((p) =>
                p.name === paramName ? { ...p, value } : p
              ),
            };
          }),
        })),
      },
    })),

  // ═══════════════════════════════════════
  // Automation CRUD (Phase 2)
  // ═══════════════════════════════════════
  addAutomationLane: (trackId, lane) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          automationLanes: [...t.automationLanes, lane],
        })),
      },
    })),

  removeAutomationLane: (trackId, laneId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          automationLanes: t.automationLanes.filter((l) => l.id !== laneId),
        })),
      },
    })),

  addAutomationPoint: (trackId, laneId, point) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          automationLanes: t.automationLanes.map((l) =>
            l.id === laneId
              ? { ...l, points: [...l.points, point].sort((a, b) => a.beat - b.beat) }
              : l
          ),
        })),
      },
    })),

  removeAutomationPoint: (trackId, laneId, pointId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          automationLanes: t.automationLanes.map((l) =>
            l.id === laneId
              ? { ...l, points: l.points.filter((p) => p.id !== pointId) }
              : l
          ),
        })),
      },
    })),

  updateAutomationPoint: (trackId, laneId, pointId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          automationLanes: t.automationLanes.map((l) =>
            l.id === laneId
              ? {
                  ...l,
                  points: l.points
                    .map((p) => (p.id === pointId ? { ...p, ...updates } : p))
                    .sort((a, b) => a.beat - b.beat),
                }
              : l
          ),
        })),
      },
    })),

  // ═══════════════════════════════════════
  // Send CRUD (Phase 2)
  // ═══════════════════════════════════════
  addSend: (trackId, send) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          sends: [...(t.sends ?? []), send],
        })),
      },
    })),

  removeSend: (trackId, sendId) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          sends: (t.sends ?? []).filter((s) => s.id !== sendId),
        })),
      },
    })),

  updateSend: (trackId, sendId, updates) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          sends: (t.sends ?? []).map((s) => (s.id === sendId ? { ...s, ...updates } : s)),
        })),
      },
    })),

  setTrackOutput: (trackId, output) =>
    set((state) => ({
      project: {
        ...state.project,
        tracks: mapTrack(state.project.tracks, trackId, (t) => ({
          ...t,
          output,
        })),
      },
    })),
}));
