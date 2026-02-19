import type { RachEffectInstance, EffectCategory, EffectParameterDescriptor } from './effect-interface';

/**
 * VST3 Effect — RachEffectInstance implementation for external VST3 plugins.
 * Communicates with the main process via IPC for parameter control.
 * Audio is processed via AudioWorklet + SharedArrayBuffer ring buffer.
 */
export class VST3Effect implements RachEffectInstance {
  readonly effectType = 'vst3';
  readonly category: EffectCategory = 'creative';

  private inputGain: GainNode;
  private outputGain: GainNode;
  private enabled = true;
  private pluginInstanceId: string | null = null;
  private cachedParams: EffectParameterDescriptor[] = [];

  constructor(context: AudioContext) {
    this.inputGain = context.createGain();
    this.outputGain = context.createGain();

    // Direct passthrough until plugin is loaded via IPC
    this.inputGain.connect(this.outputGain);
  }

  /** Set the plugin instance ID (returned from main process loadPlugin). */
  setPluginInstanceId(id: string): void {
    this.pluginInstanceId = id;
  }

  getInput(): AudioNode {
    return this.inputGain;
  }

  getOutput(): AudioNode {
    return this.outputGain;
  }

  connect(destination: AudioNode): void {
    this.outputGain.connect(destination);
  }

  disconnect(): void {
    this.outputGain.disconnect();
  }

  setParameter(name: string, value: number): void {
    if (!this.pluginInstanceId) return;

    // Send to main process via IPC
    const ipc = (window as unknown as {
      electron?: { ipcRenderer?: { send: (ch: string, ...args: unknown[]) => void } }
    }).electron?.ipcRenderer;

    if (ipc) {
      const paramId = parseInt(name.replace('param', ''), 10);
      if (!isNaN(paramId)) {
        ipc.send('plugin:setParam', this.pluginInstanceId, paramId, value);
      }
    }

    // Update cached value
    const param = this.cachedParams.find((p) => p.name === name);
    if (param) param.value = value;
  }

  getParameters(): EffectParameterDescriptor[] {
    return this.cachedParams;
  }

  /** Update cached parameters from main process response. */
  updateParametersFromHost(params: Array<{ id: number; name: string; value: number; min: number; max: number }>): void {
    this.cachedParams = params.map((p) => ({
      name: `param${p.id}`,
      value: p.value,
      min: p.min,
      max: p.max,
      step: 0.01,
      unit: '',
    }));
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) {
      // Bypass: direct passthrough
      this.inputGain.gain.value = 1;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  dispose(): void {
    // Tell main process to unload
    if (this.pluginInstanceId) {
      const ipc = (window as unknown as {
        electron?: { ipcRenderer?: { send: (ch: string, ...args: unknown[]) => void } }
      }).electron?.ipcRenderer;

      if (ipc) {
        ipc.send('plugin:unload', this.pluginInstanceId);
      }
    }

    this.inputGain.disconnect();
    this.outputGain.disconnect();
  }
}
