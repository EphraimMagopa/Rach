import type { Project } from '../models/project';

// Electron IPC bridge type (exposed via preload)
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
        on(channel: string, listener: (...args: unknown[]) => void): void;
        removeListener(channel: string, listener: (...args: unknown[]) => void): void;
      };
    };
  }
}

export class ProjectPersistence {
  async save(project: Project, filePath: string): Promise<void> {
    const json = JSON.stringify(project, null, 2);
    if (window.electron?.ipcRenderer) {
      await window.electron.ipcRenderer.invoke('file:save', filePath, json);
    }
  }

  async open(): Promise<{ project: Project; path: string } | null> {
    if (!window.electron?.ipcRenderer) return null;

    const result = await window.electron.ipcRenderer.invoke('file:open') as {
      path: string;
      content: string;
    } | null;

    if (!result) return null;
    return { project: JSON.parse(result.content) as Project, path: result.path };
  }

  async saveAs(project: Project): Promise<string | null> {
    if (!window.electron?.ipcRenderer) return null;

    const filePath = await window.electron.ipcRenderer.invoke('file:saveAs') as string | null;
    if (filePath) {
      await this.save(project, filePath);
      return filePath;
    }
    return null;
  }
}

// Singleton
let sharedPersistence: ProjectPersistence | null = null;
export function getProjectPersistence(): ProjectPersistence {
  if (!sharedPersistence) {
    sharedPersistence = new ProjectPersistence();
  }
  return sharedPersistence;
}
