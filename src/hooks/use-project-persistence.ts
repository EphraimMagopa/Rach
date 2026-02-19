import { useEffect, useRef, useCallback } from 'react';
import { useProjectStore } from '@/stores/project-store';
import { getProjectPersistence } from '@/core/persistence/project-persistence';
import { UndoManager } from '@/core/undo/undo-manager';
import { createDefaultProject } from '@/core/models';

let sharedUndoManager: UndoManager | null = null;

export function getUndoManager(): UndoManager {
  if (!sharedUndoManager) {
    sharedUndoManager = new UndoManager();
  }
  return sharedUndoManager;
}

/**
 * Manages project save/load, dirty state, undo/redo, and window title.
 */
export function useProjectPersistence(): void {
  const currentPathRef = useRef<string | null>(null);
  const lastSavedProjectRef = useRef<string>('');
  const undoManager = getUndoManager();

  const persistence = getProjectPersistence();

  const updateTitle = useCallback((projectTitle: string, dirty: boolean) => {
    document.title = `${dirty ? '● ' : ''}${projectTitle} — Rach`;
  }, []);

  // Track dirty state
  useEffect(() => {
    const unsub = useProjectStore.subscribe((state) => {
      const currentJson = JSON.stringify(state.project);
      const isDirty = currentJson !== lastSavedProjectRef.current;
      updateTitle(state.project.metadata.title, isDirty);
    });
    return unsub;
  }, [updateTitle]);

  // Snapshot for undo: record project state before each change
  useEffect(() => {
    let prevSnapshot = JSON.stringify(useProjectStore.getState().project);

    const unsub = useProjectStore.subscribe((state) => {
      const currentSnapshot = JSON.stringify(state.project);
      if (currentSnapshot !== prevSnapshot) {
        const before = prevSnapshot;
        const after = currentSnapshot;
        prevSnapshot = currentSnapshot;

        undoManager.execute({
          id: crypto.randomUUID(),
          label: 'Edit',
          execute: () => {
            useProjectStore.getState().setProject(JSON.parse(after));
          },
          undo: () => {
            useProjectStore.getState().setProject(JSON.parse(before));
          },
        });
      }
    });
    return unsub;
  }, [undoManager]);

  // Listen for menu events
  useEffect(() => {
    const ipc = window.electron?.ipcRenderer;
    if (!ipc) return;

    const handlers: Record<string, () => void> = {
      'menu:new-project': () => {
        useProjectStore.getState().setProject(createDefaultProject());
        currentPathRef.current = null;
        lastSavedProjectRef.current = JSON.stringify(useProjectStore.getState().project);
        undoManager.clear();
        updateTitle('Untitled Project', false);
      },

      'menu:open': async () => {
        const result = await persistence.open();
        if (result) {
          useProjectStore.getState().setProject(result.project);
          currentPathRef.current = result.path;
          lastSavedProjectRef.current = JSON.stringify(result.project);
          undoManager.clear();
          updateTitle(result.project.metadata.title, false);
        }
      },

      'menu:save': async () => {
        const project = useProjectStore.getState().project;
        if (currentPathRef.current) {
          await persistence.save(project, currentPathRef.current);
          lastSavedProjectRef.current = JSON.stringify(project);
          updateTitle(project.metadata.title, false);
        } else {
          // No path yet, do Save As
          const path = await persistence.saveAs(project);
          if (path) {
            currentPathRef.current = path;
            lastSavedProjectRef.current = JSON.stringify(project);
            updateTitle(project.metadata.title, false);
          }
        }
      },

      'menu:save-as': async () => {
        const project = useProjectStore.getState().project;
        const path = await persistence.saveAs(project);
        if (path) {
          currentPathRef.current = path;
          lastSavedProjectRef.current = JSON.stringify(project);
          updateTitle(project.metadata.title, false);
        }
      },

      'menu:undo': () => {
        undoManager.undo();
      },

      'menu:redo': () => {
        undoManager.redo();
      },
    };

    for (const [ch, handler] of Object.entries(handlers)) {
      ipc.on(ch, handler);
    }

    // Set initial title
    const project = useProjectStore.getState().project;
    lastSavedProjectRef.current = JSON.stringify(project);
    updateTitle(project.metadata.title, false);

    return () => {
      for (const [ch, handler] of Object.entries(handlers)) {
        ipc.removeListener(ch, handler);
      }
    };
  }, [persistence, undoManager, updateTitle]);

  // Keyboard shortcuts for undo/redo (fallback for non-Electron)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undoManager.undo();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        undoManager.redo();
      }
      // Ctrl+S save shortcut
      if ((e.metaKey || e.ctrlKey) && e.key === 's' && !e.shiftKey) {
        e.preventDefault();
        const project = useProjectStore.getState().project;
        if (currentPathRef.current) {
          persistence.save(project, currentPathRef.current).then(() => {
            lastSavedProjectRef.current = JSON.stringify(project);
            updateTitle(project.metadata.title, false);
          });
        } else {
          persistence.saveAs(project).then((path) => {
            if (path) {
              currentPathRef.current = path;
              lastSavedProjectRef.current = JSON.stringify(project);
              updateTitle(project.metadata.title, false);
            }
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [persistence, undoManager, updateTitle]);
}
