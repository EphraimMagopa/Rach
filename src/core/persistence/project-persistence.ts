import type { Project } from '../models/project';

// Electron IPC bridge type (exposed via preload)
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
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

  async load(filePath: string): Promise<Project> {
    if (window.electron?.ipcRenderer) {
      const json = await window.electron.ipcRenderer.invoke('file:load', filePath);
      return JSON.parse(json as string) as Project;
    }
    throw new Error('Electron IPC not available');
  }

  async saveAs(project: Project): Promise<string | null> {
    if (window.electron?.ipcRenderer) {
      const filePath = await window.electron.ipcRenderer.invoke('file:saveAs');
      if (filePath) {
        await this.save(project, filePath as string);
        return filePath as string;
      }
    }
    return null;
  }
}
