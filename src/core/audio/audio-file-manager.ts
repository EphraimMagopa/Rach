export class AudioFileManager {
  private context: AudioContext | null = null;
  private bufferCache = new Map<string, AudioBuffer>();

  initialize(context: AudioContext): void {
    this.context = context;
  }

  async decodeFile(file: File): Promise<{ fileId: string; buffer: AudioBuffer }> {
    if (!this.context) throw new Error('AudioFileManager not initialized');

    const fileId = crypto.randomUUID();
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    this.bufferCache.set(fileId, audioBuffer);
    return { fileId, buffer: audioBuffer };
  }

  async decodeArrayBuffer(
    arrayBuffer: ArrayBuffer,
    cacheKey?: string
  ): Promise<AudioBuffer> {
    if (!this.context) throw new Error('AudioFileManager not initialized');

    const audioBuffer = await this.context.decodeAudioData(arrayBuffer);
    if (cacheKey) {
      this.bufferCache.set(cacheKey, audioBuffer);
    }
    return audioBuffer;
  }

  getBuffer(fileId: string): AudioBuffer | undefined {
    return this.bufferCache.get(fileId);
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

// Singleton
let sharedFileManager: AudioFileManager | null = null;
export function getAudioFileManager(): AudioFileManager {
  if (!sharedFileManager) {
    sharedFileManager = new AudioFileManager();
  }
  return sharedFileManager;
}
