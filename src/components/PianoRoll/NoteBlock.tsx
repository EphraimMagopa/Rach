import React, { useCallback, useRef } from 'react';
import type { MIDINote } from '../../core/models';

interface NoteBlockProps {
  note: MIDINote;
  trackId: string;
  clipId: string;
  clipStartBeat: number;
  beatWidth: number;
  rowHeight: number;
  highestPitch: number;
  isSelected: boolean;
  toolMode: string;
  onSelect: (noteId: string) => void;
  onDelete: (noteId: string) => void;
  onMove: (noteId: string, deltaBeat: number, deltaPitch: number) => void;
  onResize: (noteId: string, newDuration: number) => void;
}

const NoteBlock = React.memo(function NoteBlock({
  note,
  beatWidth,
  rowHeight,
  highestPitch,
  isSelected,
  toolMode,
  onSelect,
  onDelete,
  onMove,
  onResize,
}: NoteBlockProps): React.JSX.Element {
  const dragStartRef = useRef<{ x: number; y: number; startBeat: number; pitch: number } | null>(null);
  const resizeRef = useRef<{ startX: number; startDuration: number } | null>(null);

  const left = note.startBeat * beatWidth;
  const width = note.durationBeats * beatWidth;
  const top = (highestPitch - note.pitch) * rowHeight;

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();

      if (toolMode === 'erase') {
        onDelete(note.id);
        return;
      }

      onSelect(note.id);

      // Check if near right edge for resize
      const rect = e.currentTarget.getBoundingClientRect();
      const isRightEdge = e.clientX > rect.right - 6;

      if (isRightEdge) {
        resizeRef.current = { startX: e.clientX, startDuration: note.durationBeats };

        const handleMouseMove = (me: MouseEvent) => {
          if (!resizeRef.current) return;
          const dx = me.clientX - resizeRef.current.startX;
          const deltaDuration = dx / beatWidth;
          const newDuration = Math.max(0.25, resizeRef.current.startDuration + deltaDuration);
          onResize(note.id, newDuration);
        };

        const handleMouseUp = () => {
          resizeRef.current = null;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      } else {
        dragStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          startBeat: note.startBeat,
          pitch: note.pitch,
        };

        const handleMouseMove = (me: MouseEvent) => {
          if (!dragStartRef.current) return;
          const dx = me.clientX - dragStartRef.current.x;
          const dy = me.clientY - dragStartRef.current.y;
          const deltaBeat = Math.round((dx / beatWidth) * 4) / 4; // Snap to 16th
          const deltaPitch = -Math.round(dy / rowHeight);
          onMove(note.id, deltaBeat, deltaPitch);
        };

        const handleMouseUp = () => {
          dragStartRef.current = null;
          window.removeEventListener('mousemove', handleMouseMove);
          window.removeEventListener('mouseup', handleMouseUp);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
      }
    },
    [note, beatWidth, rowHeight, toolMode, onSelect, onDelete, onMove, onResize]
  );

  // Velocity → color intensity
  const alpha = 0.4 + (note.velocity / 127) * 0.5;

  return (
    <div
      className={`absolute rounded-sm cursor-pointer ${
        isSelected ? 'ring-1 ring-white shadow-md' : ''
      }`}
      style={{
        left,
        top,
        width: Math.max(width, 2),
        height: rowHeight - 1,
        backgroundColor: `rgba(0, 168, 232, ${alpha})`,
        cursor: toolMode === 'erase' ? 'crosshair' : 'grab',
      }}
      onMouseDown={handleMouseDown}
    >
      {/* Resize handle */}
      {width > 8 && (
        <div
          className="absolute right-0 top-0 bottom-0 w-1.5 cursor-col-resize"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.35)' }}
        />
      )}
    </div>
  );
});

export { NoteBlock };
