import { useEffect } from 'react';
import { useTransportStore } from '../stores/transport-store';
import { useUIStore } from '../stores/ui-store';
import { useProjectStore } from '../stores/project-store';

/**
 * Global keyboard shortcuts for the DAW.
 * Also handles IPC messages from Electron menu items.
 */
export function useKeyboardShortcuts(): void {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return;
      }

      const transport = useTransportStore.getState();
      const ui = useUIStore.getState();

      switch (e.code) {
        case 'Space':
          e.preventDefault();
          if (transport.isPlaying) {
            transport.stop();
          } else {
            transport.play();
          }
          break;

        case 'Enter':
          e.preventDefault();
          transport.stop();
          break;

        case 'KeyR':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            transport.toggleRecord();
          }
          break;

        case 'KeyM':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            transport.toggleMetronome();
          }
          break;

        case 'KeyL':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            transport.toggleLoop();
          }
          break;

        // Tool modes
        case 'KeyV':
          if (!e.metaKey && !e.ctrlKey) {
            ui.setToolMode('select');
          }
          break;
        case 'KeyD':
          if (!e.metaKey && !e.ctrlKey) {
            ui.setToolMode('draw');
          }
          break;
        case 'KeyE':
          if (!e.metaKey && !e.ctrlKey) {
            ui.setToolMode('erase');
          }
          break;

        // Zoom
        case 'Equal':
        case 'NumpadAdd':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            ui.setZoomX(Math.min(ui.zoomX * 1.25, 8));
          }
          break;
        case 'Minus':
        case 'NumpadSubtract':
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            ui.setZoomX(Math.max(ui.zoomX / 1.25, 0.1));
          }
          break;

        // Toggle Timeline / Session view
        case 'Tab':
          if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            ui.setActiveView(ui.activeView === 'timeline' ? 'session' : 'timeline');
          }
          break;

        // Delete selected
        case 'Delete':
        case 'Backspace': {
          const project = useProjectStore.getState();
          if (project.selectedClipId) {
            const trackId = project.project.tracks.find((t) =>
              t.clips.some((c) => c.id === project.selectedClipId)
            )?.id;
            if (trackId) {
              project.removeClip(trackId, project.selectedClipId);
            }
          }
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Listen for Electron IPC menu events
    const ipc = (window as unknown as { electron?: { ipcRenderer?: { on: (ch: string, cb: (...args: unknown[]) => void) => void; removeListener: (ch: string, cb: (...args: unknown[]) => void) => void } } }).electron?.ipcRenderer;
    const menuHandlers: Record<string, () => void> = {
      'transport:play': () => useTransportStore.getState().play(),
      'transport:stop': () => useTransportStore.getState().stop(),
      'transport:record': () => useTransportStore.getState().toggleRecord(),
      'transport:metronome': () => useTransportStore.getState().toggleMetronome(),
      'transport:loop': () => useTransportStore.getState().toggleLoop(),
      'view:mixer': () => useUIStore.getState().togglePanel('mixer'),
      'view:pianoRoll': () => useUIStore.getState().togglePanel('pianoRoll'),
      'view:ai': () => useUIStore.getState().togglePanel('ai'),
    };

    if (ipc) {
      for (const [ch, handler] of Object.entries(menuHandlers)) {
        ipc.on(ch, handler);
      }
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (ipc) {
        for (const [ch, handler] of Object.entries(menuHandlers)) {
          ipc.removeListener(ch, handler);
        }
      }
    };
  }, []);
}
