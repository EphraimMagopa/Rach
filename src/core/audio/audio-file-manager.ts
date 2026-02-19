export class AudioFileManager {
  private context: AudioContext | null = null;
  private bufferCache = new Map<string, AudioBuffer>();

  initialize(context: AudioContext): void {
    this.context = context;
  }

  async decodeFile(file: File): Promise<AudioBuffer> {
    if (!this.context) throw new Error('AudioFileManager not initialized');

    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    return audioBuffer;
  }

  async decodeArrayBuffer(arrayBuffer: ArrayBuffer, cacheKey?: string): Promise<AudioBuffer> {
    if (!this.context) throw new Error('AudioFileManager not initialized');

    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    if (cacheKey) {
      this.bufferCache.set(cacheKey, audioBuffer);
    }
    return audioBuffer;
  }

  getCachedBuffer(key: string): AudioBuffer | undefined {
    return this.bufferCache.get(key);
  }

  clearCache(): void {
    this.bufferCache.clear();
  }

  dispose(): void {
    this.bufferCache.clear();
    this.context = null;
  }
}
