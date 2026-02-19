import { create } from 'zustand';

export type ToolMode = 'select' | 'draw' | 'slice' | 'erase' | 'mute';
export type PanelId = 'mixer' | 'pianoRoll' | 'ai';

interface UIState {
  zoomX: number;
  zoomY: number;
  scrollX: number;
  scrollY: number;
  toolMode: ToolMode;
  panelVisibility: Record<PanelId, boolean>;
  snapEnabled: boolean;
  snapGridSize: number;

  setZoomX: (zoom: number) => void;
  setZoomY: (zoom: number) => void;
  setScroll: (x: number, y: number) => void;
  setToolMode: (mode: ToolMode) => void;
  togglePanel: (panel: PanelId) => void;
  setPanelVisibility: (panel: PanelId, visible: boolean) => void;
  toggleSnap: () => void;
  setSnapGridSize: (size: number) => void;
}

export const useUIStore = create<UIState>((set) => ({
  zoomX: 1,
  zoomY: 1,
  scrollX: 0,
  scrollY: 0,
  toolMode: 'select',
  panelVisibility: {
    mixer: true,
    pianoRoll: false,
    ai: false,
  },
  snapEnabled: true,
  snapGridSize: 0.25,

  setZoomX: (zoomX) => set({ zoomX }),
  setZoomY: (zoomY) => set({ zoomY }),
  setScroll: (scrollX, scrollY) => set({ scrollX, scrollY }),
  setToolMode: (toolMode) => set({ toolMode }),
  togglePanel: (panel) =>
    set((state) => ({
      panelVisibility: {
        ...state.panelVisibility,
        [panel]: !state.panelVisibility[panel],
      },
    })),
  setPanelVisibility: (panel, visible) =>
    set((state) => ({
      panelVisibility: {
        ...state.panelVisibility,
        [panel]: visible,
      },
    })),
  toggleSnap: () => set((state) => ({ snapEnabled: !state.snapEnabled })),
  setSnapGridSize: (snapGridSize) => set({ snapGridSize }),
}));
