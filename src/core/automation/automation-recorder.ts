import type { AutomationPoint, AutomationRecordMode } from '../models/automation';

/**
 * Captures UI parameter changes as automation points during playback.
 * Writes into the project store via a callback.
 */
export class AutomationRecorder {
  private mode: AutomationRecordMode = 'off';
  private isRecording = false;
  // Reserved for future use (tracking which lane we're recording to)
  private lastRecordBeat = -1;
  private minBeatInterval = 0.125; // Minimum spacing between recorded points (1/8 beat)

  private addPointCallback: ((
    trackId: string,
    laneId: string,
    point: AutomationPoint
  ) => void) | null = null;

  setMode(mode: AutomationRecordMode): void {
    this.mode = mode;
  }

  getMode(): AutomationRecordMode {
    return this.mode;
  }

  setAddPointCallback(
    cb: (trackId: string, laneId: string, point: AutomationPoint) => void
  ): void {
    this.addPointCallback = cb;
  }

  /**
   * Called when the user changes a parameter value during playback.
   * Records a point if mode allows it.
   */
  recordParameterChange(
    trackId: string,
    laneId: string,
    value: number,
    currentBeat: number
  ): void {
    if (this.mode === 'off' || !this.addPointCallback) return;

    // Debounce: skip if too close to last recorded point
    if (currentBeat - this.lastRecordBeat < this.minBeatInterval) return;

    // Touch mode: only record while user is actively touching
    if (this.mode === 'touch' && !this.isRecording) return;

    const point: AutomationPoint = {
      id: crypto.randomUUID(),
      beat: Math.round(currentBeat * 8) / 8, // Snap to 1/8 beat
      value,
      interpolation: 'linear',
    };

    this.addPointCallback(trackId, laneId, point);
    this.lastRecordBeat = currentBeat;
  }

  /** Called when user starts touching/moving a parameter. */
  startTouch(): void {
    this.isRecording = true;
  }

  /** Called when user stops touching a parameter. */
  endTouch(): void {
    this.isRecording = false;
  }
}
