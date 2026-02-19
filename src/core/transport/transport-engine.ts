import { AudioEngine } from '../audio/audio-engine';
import { PlaybackEngine } from '../audio/playback-engine';
import { Metronome } from '../audio/metronome';

export class TransportEngine {
  readonly audioEngine: AudioEngine;
  private playbackEngine: PlaybackEngine;
  readonly metronome: Metronome;

  private isPlaying = false;
  private startTime = 0;
  private startBeat = 0;
  private tempo = 120;
  private rafId: number | null = null;
  private onTick: ((beat: number) => void) | null = null;

  constructor(
    audioEngine: AudioEngine,
    playbackEngine: PlaybackEngine,
    metronome: Metronome
  ) {
    this.audioEngine = audioEngine;
    this.playbackEngine = playbackEngine;
    this.metronome = metronome;
  }

  setOnTick(callback: (beat: number) => void): void {
    this.onTick = callback;
  }

  setTempo(bpm: number): void {
    if (this.isPlaying) {
      const currentBeat = this.getCurrentBeat();
      this.startBeat = currentBeat;
      this.startTime = performance.now();
    }
    this.tempo = bpm;
  }

  play(fromBeat: number = 0): void {
    if (this.isPlaying) return;

    this.isPlaying = true;
    this.startBeat = fromBeat;
    this.startTime = performance.now();
    this.tick();
  }

  stop(): void {
    this.isPlaying = false;
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.playbackEngine.stopAll();
  }

  getCurrentBeat(): number {
    if (!this.isPlaying) return this.startBeat;
    const elapsed = (performance.now() - this.startTime) / 1000;
    return this.startBeat + (elapsed * this.tempo) / 60;
  }

  private tick = (): void => {
    if (!this.isPlaying) return;

    const beat = this.getCurrentBeat();
    this.onTick?.(beat);

    this.rafId = requestAnimationFrame(this.tick);
  };

  dispose(): void {
    this.stop();
    this.onTick = null;
  }
}
