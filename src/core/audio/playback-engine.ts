import { AudioEngine } from './audio-engine';

export class PlaybackEngine {
  private engine: AudioEngine;
  private scheduledSources = new Map<string, AudioBufferSourceNode>();

  constructor(engine: AudioEngine) {
    this.engine = engine;
  }

  scheduleClip(
    clipId: string,
    trackId: string,
    buffer: AudioBuffer,
    startTime: number,
    offset: number = 0,
    duration?: number
  ): void {
    const context = this.engine.audioContext;
    const trackNode = this.engine.getTrackNode(trackId);
    if (!context || !trackNode) return;

    const source = context.createBufferSource();
    source.buffer = buffer;
    source.connect(trackNode.inputNode);
    source.start(startTime, offset, duration);
    source.onended = () => this.scheduledSources.delete(clipId);
    this.scheduledSources.set(clipId, source);
  }

  stopClip(clipId: string): void {
    const source = this.scheduledSources.get(clipId);
    if (source) {
      source.stop();
      source.disconnect();
      this.scheduledSources.delete(clipId);
    }
  }

  stopAll(): void {
    this.scheduledSources.forEach((source) => {
      source.stop();
      source.disconnect();
    });
    this.scheduledSources.clear();
  }
}
