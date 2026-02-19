import { create } from 'zustand';
import type { SessionClipSlot, Scene, ClipLaunchState, LaunchQuantize } from '../core/models/session';
import type { Clip } from '../core/models/clip';

interface SessionState {
  scenes: Scene[];
  clipSlots: SessionClipSlot[];
  globalQuantize: LaunchQuantize;

  // Actions
  setScenes: (scenes: Scene[]) => void;
  addScene: () => void;
  removeScene: (sceneId: string) => void;

  setClipInSlot: (slotId: string, clip: Clip) => void;
  clearSlot: (slotId: string) => void;
  setSlotState: (slotId: string, state: ClipLaunchState) => void;
  setGlobalQuantize: (q: LaunchQuantize) => void;

  ensureSlotsForTracks: (trackIds: string[]) => void;
}

function createSlot(trackId: string, sceneIndex: number): SessionClipSlot {
  return {
    id: crypto.randomUUID(),
    trackId,
    sceneIndex,
    clip: null,
    launchState: 'stopped',
    launchQuantize: 'bar',
    loopEnabled: true,
  };
}

export const useSessionStore = create<SessionState>((set) => ({
  scenes: Array.from({ length: 8 }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Scene ${i + 1}`,
    index: i,
  })),
  clipSlots: [],
  globalQuantize: 'bar',

  setScenes: (scenes) => set({ scenes }),

  addScene: () =>
    set((state) => {
      const newScene: Scene = {
        id: crypto.randomUUID(),
        name: `Scene ${state.scenes.length + 1}`,
        index: state.scenes.length,
      };
      return { scenes: [...state.scenes, newScene] };
    }),

  removeScene: (sceneId) =>
    set((state) => ({
      scenes: state.scenes.filter((s) => s.id !== sceneId),
      clipSlots: state.clipSlots.filter(
        (slot) => !state.scenes.find((s) => s.id === sceneId && s.index === slot.sceneIndex)
      ),
    })),

  setClipInSlot: (slotId, clip) =>
    set((state) => ({
      clipSlots: state.clipSlots.map((s) =>
        s.id === slotId ? { ...s, clip } : s
      ),
    })),

  clearSlot: (slotId) =>
    set((state) => ({
      clipSlots: state.clipSlots.map((s) =>
        s.id === slotId ? { ...s, clip: null, launchState: 'stopped' } : s
      ),
    })),

  setSlotState: (slotId, launchState) =>
    set((state) => ({
      clipSlots: state.clipSlots.map((s) =>
        s.id === slotId ? { ...s, launchState } : s
      ),
    })),

  setGlobalQuantize: (globalQuantize) => set({ globalQuantize }),

  ensureSlotsForTracks: (trackIds) =>
    set((state) => {
      const existingTrackIds = new Set(state.clipSlots.map((s) => s.trackId));
      const newSlots: SessionClipSlot[] = [];

      for (const trackId of trackIds) {
        if (!existingTrackIds.has(trackId)) {
          for (let i = 0; i < state.scenes.length; i++) {
            newSlots.push(createSlot(trackId, i));
          }
        }
      }

      // Also ensure all scene indices are covered for existing tracks
      for (const trackId of trackIds) {
        for (let i = 0; i < state.scenes.length; i++) {
          const exists = [...state.clipSlots, ...newSlots].some(
            (s) => s.trackId === trackId && s.sceneIndex === i
          );
          if (!exists) {
            newSlots.push(createSlot(trackId, i));
          }
        }
      }

      return {
        clipSlots: [...state.clipSlots, ...newSlots],
      };
    }),
}));
