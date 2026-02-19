export interface TrackAudioNode {
  gainNode: GainNode;
  panNode: StereoPannerNode;
  analyserNode: AnalyserNode;
  inputNode: GainNode;
}

export class AudioEngine {
  private context: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private masterAnalyser: AnalyserNode | null = null;
  private trackNodes = new Map<string, TrackAudioNode>();

  get audioContext(): AudioContext | null {
    return this.context;
  }

  get isInitialized(): boolean {
    return this.context !== null;
  }

  async initialize(): Promise<void> {
    this.context = new AudioContext({ sampleRate: 44100 });
    this.masterGain = this.context.createGain();
    this.masterAnalyser = this.context.createAnalyser();
    this.masterAnalyser.fftSize = 2048;
    this.masterGain.connect(this.masterAnalyser);
    this.masterAnalyser.connect(this.context.destination);
  }

  async resumeContext(): Promise<void> {
    if (this.context && this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  getMasterGain(): GainNode | null {
    return this.masterGain;
  }

  setMasterVolume(db: number): void {
    if (this.masterGain) {
      this.masterGain.gain.value = db === -Infinity ? 0 : Math.pow(10, db / 20);
    }
  }

  setTrackMute(trackId: string, muted: boolean): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.gainNode.gain.value = muted ? 0 : 1;
    }
  }

  createTrackNode(trackId: string): TrackAudioNode {
    if (!this.context || !this.masterGain) {
      throw new Error('AudioEngine not initialized');
    }

    const inputNode = this.context.createGain();
    const gainNode = this.context.createGain();
    const panNode = this.context.createStereoPanner();
    const analyserNode = this.context.createAnalyser();
    analyserNode.fftSize = 1024;

    inputNode.connect(gainNode);
    gainNode.connect(panNode);
    panNode.connect(analyserNode);
    analyserNode.connect(this.masterGain);

    const node: TrackAudioNode = { gainNode, panNode, analyserNode, inputNode };
    this.trackNodes.set(trackId, node);
    return node;
  }

  removeTrackNode(trackId: string): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.inputNode.disconnect();
      node.gainNode.disconnect();
      node.panNode.disconnect();
      node.analyserNode.disconnect();
      this.trackNodes.delete(trackId);
    }
  }

  setTrackVolume(trackId: string, db: number): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.gainNode.gain.value = db === -Infinity ? 0 : Math.pow(10, db / 20);
    }
  }

  setTrackPan(trackId: string, value: number): void {
    const node = this.trackNodes.get(trackId);
    if (node) {
      node.panNode.pan.value = Math.max(-1, Math.min(1, value));
    }
  }

  getMasterAnalyser(): AnalyserNode | null {
    return this.masterAnalyser;
  }

  getTrackNode(trackId: string): TrackAudioNode | undefined {
    return this.trackNodes.get(trackId);
  }

  /** Get the chain insertion points for effect insertion between inputNode and gainNode. */
  getTrackChainPoints(trackId: string): { inputNode: GainNode; gainNode: GainNode } | undefined {
    const node = this.trackNodes.get(trackId);
    if (!node) return undefined;
    return { inputNode: node.inputNode, gainNode: node.gainNode };
  }

  dispose(): void {
    this.trackNodes.forEach((node) => {
      node.inputNode.disconnect();
      node.gainNode.disconnect();
      node.panNode.disconnect();
      node.analyserNode.disconnect();
    });
    this.trackNodes.clear();
    this.context?.close();
    this.context = null;
    this.masterGain = null;
    this.masterAnalyser = null;
  }
}
