import { useState, useCallback, useMemo } from 'react';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { useTransportStore } from '../../stores/transport-store';
import { PianoKeys, buildKeyList } from './PianoKeys';
import { NoteBlock } from './NoteBlock';
import { VelocityLane } from './VelocityLane';
import type { Clip, MIDINote } from '../../core/models';

const ROW_HEIGHT = 14;

export function PianoRoll(): React.JSX.Element {
  const { project, selectedClipId, addMidiNote, removeMidiNote, updateMidiNote } =
    useProjectStore();
  const { toolMode, snapEnabled, snapGridSize, zoomX } = useUIStore();
  const timeSignature = useTransportStore((s) => s.timeSignature);
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);

  const keys = useMemo(() => buildKeyList(), []);
  const highestPitch = keys[0].pitch; // 108

  // Find the selected clip
  const selectedClip = useMemo<Clip | null>(() => {
    if (!selectedClipId) return null;
    for (const track of project.tracks) {
      const clip = track.clips.find((c) => c.id === selectedClipId);
      if (clip && clip.type === 'midi') return clip;
    }
    return null;
  }, [selectedClipId, project.tracks]);

  const clipTrackId = useMemo(() => {
    if (!selectedClipId) return null;
    for (const track of project.tracks) {
      if (track.clips.some((c) => c.id === selectedClipId)) return track.id;
    }
    return null;
  }, [selectedClipId, project.tracks]);

  const beatsPerBar = timeSignature[0];
  const barWidth = 120 * zoomX;
  const beatWidth = barWidth / beatsPerBar;
  const clipDurationBeats = selectedClip?.durationBeats || 16;
  const gridWidth = clipDurationBeats * beatWidth;

  const snapBeat = useCallback(
    (beat: number) => {
      if (!snapEnabled) return beat;
      return Math.round(beat / snapGridSize) * snapGridSize;
    },
    [snapEnabled, snapGridSize]
  );

  // Draw mode: click on grid to create a note
  const handleGridClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (toolMode !== 'draw' || !selectedClip || !clipTrackId) return;

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const beatPos = snapBeat(x / beatWidth);
      const pitch = highestPitch - Math.floor(y / ROW_HEIGHT);

      if (pitch < 21 || pitch > 108) return;

      const note: MIDINote = {
        id: crypto.randomUUID(),
        pitch,
        velocity: 100,
        startBeat: beatPos,
        durationBeats: snapGridSize,
      };

      addMidiNote(clipTrackId, selectedClip.id, note);
      setSelectedNoteId(note.id);
    },
    [toolMode, selectedClip, clipTrackId, beatWidth, highestPitch, snapBeat, snapGridSize, addMidiNote]
  );

  const handleNoteSelect = useCallback((noteId: string) => {
    setSelectedNoteId(noteId);
  }, []);

  const handleNoteDelete = useCallback(
    (noteId: string) => {
      if (!selectedClip || !clipTrackId) return;
      removeMidiNote(clipTrackId, selectedClip.id, noteId);
      if (selectedNoteId === noteId) setSelectedNoteId(null);
    },
    [selectedClip, clipTrackId, removeMidiNote, selectedNoteId]
  );

  const handleNoteMove = useCallback(
    (noteId: string, deltaBeat: number, deltaPitch: number) => {
      if (!selectedClip || !clipTrackId) return;
      const note = selectedClip.midiData?.notes.find((n) => n.id === noteId);
      if (!note) return;

      const newStart = Math.max(0, note.startBeat + deltaBeat);
      const newPitch = Math.max(21, Math.min(108, note.pitch + deltaPitch));

      updateMidiNote(clipTrackId, selectedClip.id, noteId, {
        startBeat: snapBeat(newStart),
        pitch: newPitch,
      });
    },
    [selectedClip, clipTrackId, updateMidiNote, snapBeat]
  );

  const handleNoteResize = useCallback(
    (noteId: string, newDuration: number) => {
      if (!selectedClip || !clipTrackId) return;
      updateMidiNote(clipTrackId, selectedClip.id, noteId, {
        durationBeats: Math.max(snapGridSize, snapBeat(newDuration)),
      });
    },
    [selectedClip, clipTrackId, updateMidiNote, snapGridSize, snapBeat]
  );

  const handleVelocityChange = useCallback(
    (noteId: string, velocity: number) => {
      if (!selectedClip || !clipTrackId) return;
      updateMidiNote(clipTrackId, selectedClip.id, noteId, { velocity });
    },
    [selectedClip, clipTrackId, updateMidiNote]
  );

  if (!selectedClip) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-rach-bg">
        <div className="h-6 bg-rach-surface border-b border-rach-border flex items-center px-3">
          <span className="text-[10px] text-rach-text-muted uppercase tracking-wider">
            Piano Roll
          </span>
        </div>
        <div className="flex-1 flex items-center justify-center text-sm text-rach-text-muted">
          Select a MIDI clip to edit
        </div>
      </div>
    );
  }

  const notes = selectedClip.midiData?.notes || [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-rach-bg">
      {/* Header */}
      <div className="h-6 bg-rach-surface border-b border-rach-border flex items-center px-3 gap-3">
        <span className="text-[10px] text-rach-text-muted uppercase tracking-wider">
          Piano Roll
        </span>
        <span className="text-[10px] text-rach-text">{selectedClip.name}</span>
        <div className="flex-1" />
        <span className="text-[10px] text-rach-text-muted">
          {notes.length} note{notes.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Piano roll content */}
      <div className="flex-1 overflow-auto flex">
        {/* Piano keys */}
        <PianoKeys keys={keys} rowHeight={ROW_HEIGHT} />

        {/* Note grid */}
        <div className="flex-1 overflow-auto flex flex-col">
          <div
            className="relative"
            style={{ width: gridWidth, minWidth: '100%' }}
            onMouseDown={handleGridClick}
          >
            {/* Row backgrounds */}
            {keys.map((key) => (
              <div
                key={key.pitch}
                className={`border-b ${
                  key.isBlack
                    ? 'bg-rach-bg/50 border-rach-border/10'
                    : 'bg-rach-bg border-rach-border/5'
                } ${key.name === 'C' ? 'border-b-rach-border/30' : ''}`}
                style={{ height: ROW_HEIGHT }}
              />
            ))}

            {/* Vertical grid lines (beats) */}
            {Array.from(
              { length: Math.ceil(clipDurationBeats) },
              (_, i) => (
                <div
                  key={i}
                  className={`absolute top-0 h-full ${
                    i % beatsPerBar === 0
                      ? 'border-r border-rach-border/40'
                      : 'border-r border-rach-border/15'
                  }`}
                  style={{ left: i * beatWidth }}
                />
              )
            )}

            {/* Notes */}
            {notes.map((note) => (
              <NoteBlock
                key={note.id}
                note={note}
                trackId={clipTrackId!}
                clipId={selectedClip.id}
                clipStartBeat={selectedClip.startBeat}
                beatWidth={beatWidth}
                rowHeight={ROW_HEIGHT}
                highestPitch={highestPitch}
                isSelected={note.id === selectedNoteId}
                toolMode={toolMode}
                onSelect={handleNoteSelect}
                onDelete={handleNoteDelete}
                onMove={handleNoteMove}
                onResize={handleNoteResize}
              />
            ))}
          </div>

          {/* Velocity lane */}
          <VelocityLane
            notes={notes}
            clipDurationBeats={clipDurationBeats}
            beatWidth={beatWidth}
            selectedNoteId={selectedNoteId}
            onVelocityChange={handleVelocityChange}
          />
        </div>
      </div>
    </div>
  );
}
