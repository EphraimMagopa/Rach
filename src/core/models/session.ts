import type { Clip } from './clip';

export type ClipLaunchState = 'stopped' | 'playing' | 'queued' | 'stopping';
export type LaunchQuantize = 'none' | 'bar' | 'half' | 'beat';

export interface SessionClipSlot {
  id: string;
  trackId: string;
  sceneIndex: number;
  clip: Clip | null;
  launchState: ClipLaunchState;
  launchQuantize: LaunchQuantize;
  loopEnabled: boolean;
}

export interface Scene {
  id: string;
  name: string;
  index: number;
  tempo?: number; // Optional scene-specific tempo
}

export interface SessionView {
  scenes: Scene[];
  clipSlots: SessionClipSlot[];
  numScenes: number;
}

export function createDefaultSessionView(): SessionView {
  const scenes: Scene[] = Array.from({ length: 8 }, (_, i) => ({
    id: crypto.randomUUID(),
    name: `Scene ${i + 1}`,
    index: i,
  }));

  return {
    scenes,
    clipSlots: [],
    numScenes: 8,
  };
}
