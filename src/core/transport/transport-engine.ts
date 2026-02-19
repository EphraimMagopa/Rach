import { AudioEngine } from '../audio/audio-engine';
import { PlaybackEngine } from '../audio/playback-engine';
import { Metronome } from '../audio/metronome';

export type ScheduleCallback = (
  fromBeat: number,
  toBeat: number,
  beatToTime: (beat: number) => number
) => void;

export class TransportEngine {
  readonly audioEngine: AudioEngine;
  readonly playbackEngine: PlaybackEngine;
  readonly metronome: Metronome;

  private isPlaying = false;
  private tempo = 120;
  private timeSignature: [number, number] = [4, 4];
  private startBeat = 0;

  // Web Audio lookahead scheduling
  private scheduleTimerId: ReturnType<typeof setInterval> | null = null;
  private contextTimeAtStart = 0;
  private lastScheduledBeat = 0;
  private readonly scheduleIntervalMs = 25;
  private readonly lookaheadSeconds = 0.1;

  // RAF for UI updates only
  private rafId: number | null = null;
  private onTick: ((beat: number) => void) | null = null;

  // External schedule callbacks (MIDI sequencer, audio clips, etc.)
  private scheduleCallbacks: ScheduleCallback[] = [];

  // Loop
  private loopEnabled = false;
  private loopStart = 0;
  private loopEnd = 16;

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

  addScheduleCallback(cb: ScheduleCallback): void {
    this.scheduleCallbacks.push(cb);
  }

  removeScheduleCallback(cb: ScheduleCallback): void {
    this.scheduleCallbacks = this.scheduleCallbacks.filter((c) => c !== cb);
  }

  setTempo(bpm: number): void {
    if (this.isPlaying) {
      // Recalculate start reference so beat position stays continuous
      const currentBeat = this.getCurrentBeat();
      const ctx = this.audioEngine.audioContext;
      if (ctx) {
        this.contextTimeAtStart = ctx.currentTime;
        this.startBeat = currentBeat;
      }
    }
    this.tempo = bpm;
  }

  setTimeSignature(ts: [number, number]): void {
    this.timeSignature = ts;
  }

  setLoop(enabled: boolean, start?: number, end?: number): void {
    this.loopEnabled = enabled;
    if (start !== undefined) this.loopStart = start;
    if (end !== undefined) this.loopEnd = end;
  }

  getTempo(): number {
    return this.tempo;
  }

  getIsPlaying(): boolean {
    return this.isPlaying;
  }

  async play(fromBeat: number = 0): Promise<void> {
    if (this.isPlaying) return;

    await this.audioEngine.resumeContext();
    const ctx = this.audioEngine.audioContext;
    if (!ctx) return;

    this.isPlaying = true;
    this.startBeat = fromBeat;
    this.contextTimeAtStart = ctx.currentTime;
    this.lastScheduledBeat = fromBeat;

    // Start lookahead scheduler
    this.scheduleTimerId = setInterval(
      () => this.scheduleLookahead(),
      this.scheduleIntervalMs
    );
    // Kick off first schedule immediately
    this.scheduleLookahead();

    // Start RAF for UI
    this.uiTick();
  }

  stop(): void {
    if (!this.isPlaying) return;

    this.isPlaying = false;

    if (this.scheduleTimerId !== null) {
      clearInterval(this.scheduleTimerId);
      this.scheduleTimerId = null;
    }
    if (this.rafId !== null) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }

    this.playbackEngine.stopAll();
  }

  seekTo(beat: number): void {
    if (this.isPlaying) {
      const ctx = this.audioEngine.audioContext;
      if (ctx) {
        this.contextTimeAtStart = ctx.currentTime;
        this.startBeat = beat;
        this.lastScheduledBeat = beat;
      }
    } else {
      this.startBeat = beat;
      this.lastScheduledBeat = beat;
      this.onTick?.(beat);
    }
  }

  getCurrentBeat(): number {
    if (!this.isPlaying) return this.startBeat;
    const ctx = this.audioEngine.audioContext;
    if (!ctx) return this.startBeat;

    const elapsed = ctx.currentTime - this.contextTimeAtStart;
    let beat = this.startBeat + (elapsed * this.tempo) / 60;

    if (this.loopEnabled && beat >= this.loopEnd) {
      const loopLen = this.loopEnd - this.loopStart;
      if (loopLen > 0) {
        beat = this.loopStart + ((beat - this.loopStart) % loopLen);
      }
    }

    return beat;
  }

  /** Convert a beat number to an AudioContext time value */
  beatToTime(beat: number): number {
    const beatsFromStart = beat - this.startBeat;
    return this.contextTimeAtStart + (beatsFromStart * 60) / this.tempo;
  }

  private scheduleLookahead(): void {
    const ctx = this.audioEngine.audioContext;
    if (!ctx || !this.isPlaying) return;

    const now = ctx.currentTime;
    const lookEnd = now + this.lookaheadSeconds;
    const lookEndBeat =
      this.startBeat +
      ((lookEnd - this.contextTimeAtStart) * this.tempo) / 60;

    const fromBeat = this.lastScheduledBeat;
    const toBeat = lookEndBeat;

    if (toBeat <= fromBeat) return;

    const beatToTime = (beat: number): number => this.beatToTime(beat);

    // Schedule metronome clicks
    this.scheduleMetronomeInRange(fromBeat, toBeat, beatToTime);

    // Call external schedule callbacks (MIDI, audio clips, etc.)
    for (const cb of this.scheduleCallbacks) {
      cb(fromBeat, toBeat, beatToTime);
    }

    this.lastScheduledBeat = toBeat;
  }

  private scheduleMetronomeInRange(
    fromBeat: number,
    toBeat: number,
    beatToTime: (beat: number) => number
  ): void {
    const beatsPerBar = this.timeSignature[0];

    // Find the first integer beat >= fromBeat
    let beat = Math.ceil(fromBeat);
    // If fromBeat is exactly an integer, include it
    if (fromBeat === Math.floor(fromBeat)) beat = fromBeat;

    while (beat < toBeat) {
      const isDownbeat = beat % beatsPerBar === 0;
      const time = beatToTime(beat);

      // Only schedule if the time is in the future (or very near now)
      if (time >= this.audioEngine.audioContext!.currentTime - 0.001) {
        this.metronome.scheduleClick(time, isDownbeat);
      }
      beat += 1;
    }
  }

  private uiTick = (): void => {
    if (!this.isPlaying) return;
    const beat = this.getCurrentBeat();
    this.onTick?.(beat);
    this.rafId = requestAnimationFrame(this.uiTick);
  };

  dispose(): void {
    this.stop();
    this.onTick = null;
    this.scheduleCallbacks = [];
  }
}
