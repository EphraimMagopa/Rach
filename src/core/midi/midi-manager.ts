export interface MIDIDeviceInfo {
  id: string;
  name: string;
  manufacturer: string;
  type: 'input' | 'output';
}

export type MIDIMessageCallback = (data: Uint8Array, timestamp: number) => void;

export class MIDIManager {
  private access: MIDIAccess | null = null;
  private listeners = new Map<string, MIDIMessageCallback>();

  async initialize(): Promise<boolean> {
    if (!navigator.requestMIDIAccess) return false;

    try {
      this.access = await navigator.requestMIDIAccess({ sysex: false });
      return true;
    } catch {
      return false;
    }
  }

  getInputs(): MIDIDeviceInfo[] {
    if (!this.access) return [];
    const devices: MIDIDeviceInfo[] = [];
    this.access.inputs.forEach((input) => {
      devices.push({
        id: input.id,
        name: input.name ?? 'Unknown',
        manufacturer: input.manufacturer ?? 'Unknown',
        type: 'input',
      });
    });
    return devices;
  }

  getOutputs(): MIDIDeviceInfo[] {
    if (!this.access) return [];
    const devices: MIDIDeviceInfo[] = [];
    this.access.outputs.forEach((output) => {
      devices.push({
        id: output.id,
        name: output.name ?? 'Unknown',
        manufacturer: output.manufacturer ?? 'Unknown',
        type: 'output',
      });
    });
    return devices;
  }

  listenToInput(deviceId: string, callback: MIDIMessageCallback): void {
    if (!this.access) return;
    const input = this.access.inputs.get(deviceId);
    if (input) {
      const handler = (e: MIDIMessageEvent): void => {
        callback(new Uint8Array(e.data!.buffer), e.timeStamp);
      };
      input.onmidimessage = handler;
      this.listeners.set(deviceId, callback);
    }
  }

  stopListening(deviceId: string): void {
    if (!this.access) return;
    const input = this.access.inputs.get(deviceId);
    if (input) {
      input.onmidimessage = null;
      this.listeners.delete(deviceId);
    }
  }

  dispose(): void {
    this.listeners.forEach((_, id) => this.stopListening(id));
    this.access = null;
  }
}
