import React from 'react';
import { Play, Square, Clock } from 'lucide-react';
import type { SessionClipSlot } from '../../core/models/session';
import { TRACK_COLOR_MAP } from '../../core/models';
import type { TrackColor } from '../../core/models';

interface ClipSlotProps {
  slot: SessionClipSlot;
  trackColor: TrackColor;
  onLaunch: (slotId: string) => void;
  onStop: (slotId: string) => void;
}

const ClipSlot = React.memo(function ClipSlot({ slot, trackColor, onLaunch, onStop }: ClipSlotProps): React.JSX.Element {
  const color = TRACK_COLOR_MAP[trackColor];
  const hasClip = slot.clip !== null;
  const isPlaying = slot.launchState === 'playing';
  const isQueued = slot.launchState === 'queued';
  const isStopping = slot.launchState === 'stopping';

  const handleClick = () => {
    if (isPlaying || isStopping) {
      onStop(slot.id);
    } else if (hasClip) {
      onLaunch(slot.id);
    }
  };

  return (
    <div
      className={`w-24 h-10 border border-rach-border/50 rounded-sm flex items-center justify-center cursor-pointer transition-colors ${
        isPlaying
          ? 'bg-green-500/20 border-green-500/50'
          : isQueued
          ? 'bg-yellow-500/10 border-yellow-500/30'
          : hasClip
          ? 'bg-rach-surface-light hover:bg-rach-surface-light/80'
          : 'bg-rach-bg/50 hover:bg-rach-surface/50'
      }`}
      onClick={handleClick}
    >
      {hasClip ? (
        <div className="flex items-center gap-1 px-1 w-full">
          {isPlaying ? (
            <Square size={8} className="text-green-400 shrink-0" />
          ) : isQueued ? (
            <Clock size={8} className="text-yellow-400 shrink-0 animate-pulse" />
          ) : (
            <Play size={8} className="text-rach-text-muted shrink-0" />
          )}
          <div className="flex-1 min-w-0">
            <div className="text-[8px] text-rach-text truncate">{slot.clip!.name}</div>
            <div
              className="h-0.5 rounded-full mt-0.5"
              style={{ backgroundColor: color, opacity: 0.7 }}
            />
          </div>
        </div>
      ) : (
        <div className="text-[8px] text-rach-text-muted/30">—</div>
      )}
    </div>
  );
});

export { ClipSlot };
