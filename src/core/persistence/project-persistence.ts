import type { Project } from '../models/project';
import { backendClient } from '../../services/backend-client';

// Electron IPC bridge type (exposed via preload)
declare global {
  interface Window {
    electron?: {
      ipcRenderer: {
        invoke(channel: string, ...args: unknown[]): Promise<unknown>;
        on(channel: string, listener: (...args: unknown[]) => void): void;
        send(channel: string, ...args: unknown[]): void;
        removeListener(channel: string, listener: (...args: unknown[]) => void): void;
      };
    };
  }
}

export class ProjectPersistence {
  async save(project: Project, filePath: string): Promise<void> {
    await backendClient.saveProject(project, filePath);
  }

  async open(): Promise<{ project: Project; path: string } | null> {
    return backendClient.openProject();
  }

  async saveAs(project: Project): Promise<string | null> {
    return backendClient.saveProjectAs(project);
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
