export class TimePosition {
  static beatsToSamples(beats: number, tempo: number, sampleRate: number): number {
    return (beats / tempo) * 60 * sampleRate;
  }

  static samplesToBeats(samples: number, tempo: number, sampleRate: number): number {
    return (samples / sampleRate) * (tempo / 60);
  }

  static beatsToSeconds(beats: number, tempo: number): number {
    return (beats / tempo) * 60;
  }

  static secondsToBeats(seconds: number, tempo: number): number {
    return (seconds / 60) * tempo;
  }

  static quantize(beats: number, gridSize: number): number {
    return Math.round(beats / gridSize) * gridSize;
  }
}
