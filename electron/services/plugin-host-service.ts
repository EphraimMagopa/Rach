/**
 * Plugin Host Service — Main process service wrapping the native VST3 module.
 * Provides IPC handlers for the renderer process.
 */

interface PluginInfo {
  path: string;
  name: string;
  vendor: string;
  uid: string;
  isInstrument: boolean;
  isEffect: boolean;
}

interface NativeModule {
  scanPlugins(): PluginInfo[];
  loadPlugin(path: string): string;
  unloadPlugin(id: string): void;
  getParameters(id: string): Array<{ id: number; name: string; value: number; min: number; max: number }>;
  setParameter(id: string, paramId: number, value: number): void;
  processAudio(id: string, buffer: Float32Array): Float32Array;
  getState(id: string): string;
  setState(id: string, state: string): void;
}

export class PluginHostService {
  private native: NativeModule | null = null;
  private pluginCache: PluginInfo[] = [];

  async initialize(): Promise<boolean> {
    try {
      // Attempt to load the native module
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      this.native = require('../native/build/Release/vst3_host.node') as NativeModule;
      return true;
    } catch {
      console.warn('VST3 native module not available. Plugin hosting disabled.');
      return false;
    }
  }

  scanPlugins(): PluginInfo[] {
    if (!this.native) return [];
    try {
      this.pluginCache = this.native.scanPlugins();
      return this.pluginCache;
    } catch (err) {
      console.error('Plugin scan failed:', err);
      return [];
    }
  }

  loadPlugin(path: string): string | null {
    if (!this.native) return null;
    try {
      return this.native.loadPlugin(path);
    } catch (err) {
      console.error('Plugin load failed:', err);
      return null;
    }
  }

  unloadPlugin(id: string): void {
    if (!this.native) return;
    try {
      this.native.unloadPlugin(id);
    } catch (err) {
      console.error('Plugin unload failed:', err);
    }
  }

  getParameters(id: string): Array<{ id: number; name: string; value: number; min: number; max: number }> {
    if (!this.native) return [];
    try {
      return this.native.getParameters(id);
    } catch {
      return [];
    }
  }

  setParameter(id: string, paramId: number, value: number): void {
    if (!this.native) return;
    try {
      this.native.setParameter(id, paramId, value);
    } catch (err) {
      console.error('setParameter failed:', err);
    }
  }

  processAudio(id: string, buffer: Float32Array): Float32Array {
    if (!this.native) return buffer;
    try {
      return this.native.processAudio(id, buffer);
    } catch {
      return buffer;
    }
  }

  getState(id: string): string {
    if (!this.native) return '';
    try {
      return this.native.getState(id);
    } catch {
      return '';
    }
  }

  setState(id: string, state: string): void {
    if (!this.native) return;
    try {
      this.native.setState(id, state);
    } catch (err) {
      console.error('setState failed:', err);
    }
  }

  getScannedPlugins(): PluginInfo[] {
    return this.pluginCache;
  }
}
