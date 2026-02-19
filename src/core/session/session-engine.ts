import type { SessionClipSlot, LaunchQuantize } from '../models/session';
import type { ScheduleCallback } from '../transport/transport-engine';

type OnClipStateChange = (slotId: string, state: SessionClipSlot['launchState']) => void;

/**
 * SessionEngine — manages clip launch timing via TransportEngine schedule callbacks.
 * Handles quantized triggering: clips wait until next bar/beat to start.
 */
export class SessionEngine {
  private playingSlots = new Map<string, { trackId: string; clipStartBeat: number }>();
  private queuedLaunches: { slotId: string; targetBeat: number; trackId: string }[] = [];
  private queuedStops: { slotId: string; targetBeat: number; trackId: string }[] = [];
  private onStateChange: OnClipStateChange | null = null;
  private beatsPerBar = 4;

  setOnStateChange(cb: OnClipStateChange): void {
    this.onStateChange = cb;
  }

  setBeatsPerBar(bpb: number): void {
    this.beatsPerBar = bpb;
  }

  /** Launch a clip with quantization. */
  launchClip(
    slotId: string,
    trackId: string,
    quantize: LaunchQuantize,
    currentBeat: number
  ): void {
    // Stop any currently playing clip on this track
    this.stopClipsOnTrack(trackId, quantize, currentBeat);

    const targetBeat = this.getNextQuantizeBeat(quantize, currentBeat);

    if (targetBeat <= currentBeat) {
      // Launch immediately
      this.playingSlots.set(slotId, { trackId, clipStartBeat: currentBeat });
      this.onStateChange?.(slotId, 'playing');
    } else {
      // Queue for later
      this.queuedLaunches.push({ slotId, targetBeat, trackId });
      this.onStateChange?.(slotId, 'queued');
    }
  }

  /** Stop a clip with quantization. */
  stopClip(slotId: string, quantize: LaunchQuantize, currentBeat: number): void {
    const targetBeat = this.getNextQuantizeBeat(quantize, currentBeat);

    if (targetBeat <= currentBeat) {
      this.playingSlots.delete(slotId);
      this.onStateChange?.(slotId, 'stopped');
    } else {
      this.queuedStops.push({ slotId, targetBeat, trackId: '' });
      this.onStateChange?.(slotId, 'stopping');
    }
  }

  /** Stop all clips on a given track. */
  private stopClipsOnTrack(trackId: string, quantize: LaunchQuantize, currentBeat: number): void {
    const targetBeat = this.getNextQuantizeBeat(quantize, currentBeat);

    this.playingSlots.forEach((info, slotId) => {
      if (info.trackId === trackId) {
        if (targetBeat <= currentBeat) {
          this.playingSlots.delete(slotId);
          this.onStateChange?.(slotId, 'stopped');
        } else {
          this.queuedStops.push({ slotId, targetBeat, trackId });
        }
      }
    });
  }

  /** Launch all clips in a scene row. */
  launchScene(
    slots: SessionClipSlot[],
    quantize: LaunchQuantize,
    currentBeat: number
  ): void {
    for (const slot of slots) {
      if (slot.clip) {
        this.launchClip(slot.id, slot.trackId, quantize, currentBeat);
      }
    }
  }

  /** Stop all playing clips. */
  stopAll(): void {
    this.playingSlots.forEach((_, slotId) => {
      this.onStateChange?.(slotId, 'stopped');
    });
    this.playingSlots.clear();
    this.queuedLaunches = [];
    this.queuedStops = [];
  }

  /** ScheduleCallback — process queued launches/stops. */
  scheduleRange: ScheduleCallback = (fromBeat, toBeat): void => {

    // Process queued launches
    this.queuedLaunches = this.queuedLaunches.filter((q) => {
      if (q.targetBeat >= fromBeat && q.targetBeat < toBeat) {
        // Stop any existing clip on this track
        this.playingSlots.forEach((info, existingId) => {
          if (info.trackId === q.trackId) {
            this.playingSlots.delete(existingId);
            this.onStateChange?.(existingId, 'stopped');
          }
        });

        this.playingSlots.set(q.slotId, { trackId: q.trackId, clipStartBeat: q.targetBeat });
        this.onStateChange?.(q.slotId, 'playing');
        return false; // Remove from queue
      }
      return true; // Keep in queue
    });

    // Process queued stops
    this.queuedStops = this.queuedStops.filter((q) => {
      if (q.targetBeat >= fromBeat && q.targetBeat < toBeat) {
        this.playingSlots.delete(q.slotId);
        this.onStateChange?.(q.slotId, 'stopped');
        return false;
      }
      return true;
    });
  };

  /** Get the set of currently playing slot IDs. */
  getPlayingSlots(): Map<string, { trackId: string; clipStartBeat: number }> {
    return new Map(this.playingSlots);
  }

  isSlotPlaying(slotId: string): boolean {
    return this.playingSlots.has(slotId);
  }

  private getNextQuantizeBeat(quantize: LaunchQuantize, currentBeat: number): number {
    switch (quantize) {
      case 'none':
        return currentBeat;
      case 'beat':
        return Math.ceil(currentBeat);
      case 'half':
        return Math.ceil(currentBeat / (this.beatsPerBar / 2)) * (this.beatsPerBar / 2);
      case 'bar':
        return Math.ceil(currentBeat / this.beatsPerBar) * this.beatsPerBar;
    }
  }
}
