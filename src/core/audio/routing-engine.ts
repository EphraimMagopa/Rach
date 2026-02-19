import type { AudioEngine } from './audio-engine';
import type { Send } from '../models/send';

interface SendNode {
  gainNode: GainNode;
  trackId: string;
  busId: string;
}

/**
 * Manages aux send/return routing and track output routing.
 * Creates GainNodes for sends, taps from track audio chain, routes to bus tracks.
 */
export class RoutingEngine {
  private audioEngine: AudioEngine;
  private sendNodes = new Map<string, SendNode>(); // key = sendId
  private trackOutputOverrides = new Map<string, string>(); // trackId → targetBusId

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  /**
   * Create or update a send from a track to a bus.
   * Taps audio from after the track's gainNode (post-fader by default)
   * or from inputNode (pre-fader).
   */
  updateSend(send: Send, trackId: string): void {
    const ctx = this.audioEngine.audioContext;
    if (!ctx) return;

    const trackNode = this.audioEngine.getTrackNode(trackId);
    const busNode = this.audioEngine.getTrackNode(send.targetBusId);
    if (!trackNode || !busNode) return;

    // Remove existing send if present
    this.removeSend(send.id);

    if (!send.enabled) return;

    const gainNode = ctx.createGain();
    const linear = send.gain === -60 ? 0 : Math.pow(10, send.gain / 20);
    gainNode.gain.value = linear;

    // Tap point: pre-fader = inputNode, post-fader = gainNode
    const tapPoint = send.preFader ? trackNode.inputNode : trackNode.gainNode;
    tapPoint.connect(gainNode);
    gainNode.connect(busNode.inputNode);

    this.sendNodes.set(send.id, { gainNode, trackId, busId: send.targetBusId });
  }

  /** Remove a send and disconnect its nodes. */
  removeSend(sendId: string): void {
    const existing = this.sendNodes.get(sendId);
    if (existing) {
      existing.gainNode.disconnect();
      this.sendNodes.delete(sendId);
    }
  }

  /** Update send gain level. */
  updateSendGain(sendId: string, gainDb: number): void {
    const node = this.sendNodes.get(sendId);
    if (node) {
      const linear = gainDb === -60 ? 0 : Math.pow(10, gainDb / 20);
      node.gainNode.gain.value = linear;
    }
  }

  /**
   * Route a track's output to a specific bus instead of master.
   * Disconnects from master analyser, connects to bus inputNode.
   */
  routeTrackOutput(trackId: string, targetBusId: string | null): void {
    const trackNode = this.audioEngine.getTrackNode(trackId);
    if (!trackNode) return;

    // Disconnect analyser from its current destination
    trackNode.analyserNode.disconnect();

    if (targetBusId) {
      const busNode = this.audioEngine.getTrackNode(targetBusId);
      if (busNode) {
        trackNode.analyserNode.connect(busNode.inputNode);
        this.trackOutputOverrides.set(trackId, targetBusId);
      }
    } else {
      // Route back to master
      const masterGain = this.audioEngine.getMasterGain();
      if (masterGain) {
        trackNode.analyserNode.connect(masterGain);
      }
      this.trackOutputOverrides.delete(trackId);
    }
  }

  /** Get all send nodes for a track. */
  getSendsForTrack(trackId: string): SendNode[] {
    const sends: SendNode[] = [];
    this.sendNodes.forEach((node) => {
      if (node.trackId === trackId) sends.push(node);
    });
    return sends;
  }

  dispose(): void {
    this.sendNodes.forEach((node) => node.gainNode.disconnect());
    this.sendNodes.clear();
    this.trackOutputOverrides.clear();
  }
}
