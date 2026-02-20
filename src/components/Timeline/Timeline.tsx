import { useCallback, useRef, useEffect, useMemo, useState } from 'react';
import { Plus } from 'lucide-react';
import { useProjectStore } from '../../stores/project-store';
import { useUIStore } from '../../stores/ui-store';
import { useTransportStore } from '../../stores/transport-store';
import { TimelineRuler } from './TimelineRuler';
import { TrackHeader } from './TrackHeader';
import { ClipView } from './ClipView';
import { Playhead } from './Playhead';
import { AutomationLane as AutomationLaneView } from './AutomationLane';
import { AutomationLaneHeader } from './AutomationLaneHeader';
import type { Track, TrackColor, Clip } from '../../core/models';
import type { SynthType } from '../../core/synths/synth-interface';
import { TRACK_COLOR_MAP } from '../../core/models';
import { TimePosition } from '../../core/models/time-position';
import { getInstrumentManager } from '../../hooks/use-transport';
import { useAudioEngine } from '../../hooks/use-audio-engine';
import { getAudioFileManager } from '../../core/audio/audio-file-manager';

const TRACK_COLORS: TrackColor[] = ['blue', 'green', 'orange', 'purple', 'cyan', 'red', 'yellow', 'pink'];
const TRACK_HEADER_WIDTH = 180;

function createTrack(type: 'audio' | 'midi' | 'bus', index: number): Track {
  const defaultSynth: SynthType = 'rach-pad';
  const nameMap = { audio: 'Audio', midi: 'MIDI', bus: 'Bus' };
  return {
    id: crypto.randomUUID(),
    name: `${nameMap[type]} ${index + 1}`,
    type: type === 'bus' ? 'bus' : type,
    color: TRACK_COLORS[index % TRACK_COLORS.length],
    volume: 0,
    pan: 0,
    muted: false,
    soloed: false,
    armed: false,
    height: 64,
    clips: [],
    effects: [],
    automationLanes: [],
    input: { type: type === 'midi' ? 'midi' : 'mic' },
    output: { type: 'master' },
    instrumentType: type === 'midi' ? defaultSynth : undefined,
  };
}

function createEmptyClip(trackId: string, startBeat: number, color: string): Clip {
  return {
    id: crypto.randomUUID(),
    name: 'New Clip',
    type: 'midi',
    trackId,
    startBeat,
    durationBeats: 4,
    loopEnabled: false,
    loopLengthBeats: 4,
    fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
    color,
    midiData: { notes: [] },
  };
}

export function Timeline(): React.JSX.Element {
  const project = useProjectStore((s) => s.project);
  const addTrack = useProjectStore((s) => s.addTrack);
  const addClip = useProjectStore((s) => s.addClip);
  const selectClip = useProjectStore((s) => s.selectClip);
  const selectTrack = useProjectStore((s) => s.selectTrack);
  const zoomX = useUIStore((s) => s.zoomX);
  const setScroll = useUIStore((s) => s.setScroll);
  const toolMode = useUIStore((s) => s.toolMode);
  const automationVisibility = useUIStore((s) => s.automationVisibility);
  const timeSignature = useTransportStore((s) => s.timeSignature);
  const { engine: audioEngine } = useAudioEngine();
  const tracks = project.tracks;
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollTop, setScrollTop] = useState(0);

  const beatsPerBar = timeSignature[0];
  const barWidth = 120 * zoomX;
  const beatWidth = barWidth / beatsPerBar;
  const totalBars = 64;
  const gridWidth = barWidth * totalBars;
  const trackHeight = 64; // matches h-16

  // Memoize grid lines array
  const gridLines = useMemo(
    () => Array.from({ length: totalBars }, (_, i) => i),
    [totalBars],
  );

  // Sync scroll position to store + virtualization
  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const el = scrollContainerRef.current;
      setScroll(el.scrollLeft, el.scrollTop);
      setScrollTop(el.scrollTop);
    }
  }, [setScroll]);

  // When a new track is added, create audio node + assign synth
  const handleAddTrack = useCallback(
    (type: 'audio' | 'midi' | 'bus') => {
      const track = createTrack(type, tracks.length);
      addTrack(track);

      // Create audio routing node
      if (audioEngine.isInitialized) {
        audioEngine.createTrackNode(track.id);
      }

      // Assign default synth for MIDI tracks
      if (type === 'midi' && track.instrumentType) {
        const im = getInstrumentManager();
        if (im && audioEngine.isInitialized) {
          // Ensure track node exists before assigning synth
          if (!audioEngine.getTrackNode(track.id)) {
            audioEngine.createTrackNode(track.id);
          }
          im.assignSynth(track.id, track.instrumentType);
        }
      }
    },
    [tracks.length, addTrack, audioEngine]
  );

  const handleSynthChange = useCallback(
    (trackId: string, synthType: SynthType) => {
      const im = getInstrumentManager();
      if (im && audioEngine.isInitialized) {
        if (!audioEngine.getTrackNode(trackId)) {
          audioEngine.createTrackNode(trackId);
        }
        im.assignSynth(trackId, synthType);
      }
    },
    [audioEngine]
  );

  // Click on track lane to create clip (draw mode) or deselect
  const handleLaneClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>, track: Track) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const beat = Math.floor(x / beatWidth);
      const snappedBeat = Math.floor(beat / beatsPerBar) * beatsPerBar;

      selectTrack(track.id);

      if (toolMode === 'draw' && track.type === 'midi') {
        const color = TRACK_COLOR_MAP[track.color];
        const clip = createEmptyClip(track.id, snappedBeat, color);
        addClip(track.id, clip);
        selectClip(clip.id);
      }
    },
    [beatWidth, beatsPerBar, toolMode, selectTrack, addClip, selectClip]
  );

  // Handle drag-and-drop of audio files onto track lanes
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, track: Track) => {
      e.preventDefault();
      if (track.type !== 'audio') return;

      const files = Array.from(e.dataTransfer.files).filter((f) =>
        f.type.startsWith('audio/')
      );
      if (files.length === 0) return;

      const fileManager = getAudioFileManager();
      const ctx = audioEngine.audioContext;
      if (!ctx) return;

      if (!fileManager.getCachedBuffer('__initialized__')) {
        fileManager.initialize(ctx);
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const dropBeat = Math.max(0, Math.floor(x / beatWidth));
      const tempo = useTransportStore.getState().tempo;

      for (const file of files) {
        const { fileId, buffer } = await fileManager.decodeFile(file);
        const durationBeats = TimePosition.secondsToBeats(buffer.duration, tempo);

        const clip: Clip = {
          id: crypto.randomUUID(),
          name: file.name.replace(/\.[^.]+$/, ''),
          type: 'audio',
          trackId: track.id,
          startBeat: dropBeat,
          durationBeats,
          loopEnabled: false,
          loopLengthBeats: durationBeats,
          fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
          color: TRACK_COLOR_MAP[track.color],
          audioData: {
            fileId,
            sampleRate: buffer.sampleRate,
            channels: buffer.numberOfChannels,
            startOffset: 0,
            gain: 0,
            pitch: 0,
          },
        };

        addClip(track.id, clip);
        selectClip(clip.id);
      }
    },
    [audioEngine, beatWidth, addClip, selectClip]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  // Initialize audio file manager when audio context is ready
  useEffect(() => {
    if (!audioEngine.isInitialized || !audioEngine.audioContext) return;
    const fm = getAudioFileManager();
    fm.initialize(audioEngine.audioContext);
  }, [audioEngine, audioEngine.isInitialized]);

  // Ensure existing tracks have audio nodes
  useEffect(() => {
    if (!audioEngine.isInitialized) return;
    for (const track of tracks) {
      if (!audioEngine.getTrackNode(track.id)) {
        audioEngine.createTrackNode(track.id);
      }
      if ((track.type === 'midi' || track.type === 'instrument') && track.instrumentType) {
        const im = getInstrumentManager();
        if (im && !im.getSynth(track.id)) {
          im.assignSynth(track.id, track.instrumentType);
        }
      }
    }
  }, [audioEngine, tracks]);

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
      {/* Ruler row */}
      <div className="flex shrink-0">
        <div
          className="shrink-0 bg-rach-surface border-b border-r border-rach-border"
          style={{ width: TRACK_HEADER_WIDTH }}
        />
        <div className="flex-1 overflow-hidden">
          <TimelineRuler />
        </div>
      </div>

      {/* Tracks area */}
      <div
        className="flex-1 overflow-auto relative"
        ref={scrollContainerRef}
        onScroll={handleScroll}
      >
        <div className="flex flex-col">
          {(() => {
            // Track virtualization: only render visible tracks when > 12
            const useVirtualization = tracks.length > 12;
            const overscan = 3;
            const containerHeight = scrollContainerRef.current?.clientHeight ?? 600;

            let startIdx = 0;
            let endIdx = tracks.length;
            let topPadding = 0;
            let bottomPadding = 0;

            if (useVirtualization) {
              startIdx = Math.max(0, Math.floor(scrollTop / trackHeight) - overscan);
              endIdx = Math.min(tracks.length, Math.ceil((scrollTop + containerHeight) / trackHeight) + overscan);
              topPadding = startIdx * trackHeight;
              bottomPadding = Math.max(0, (tracks.length - endIdx) * trackHeight);
            }

            const visibleTracks = tracks.slice(startIdx, endIdx);

            return (
              <>
                {topPadding > 0 && <div style={{ height: topPadding }} />}
                {visibleTracks.map((track) => {
                  const showAutomation = automationVisibility[track.id] ?? false;
                  return (
                    <div key={track.id}>
                      <div className="flex">
                        {/* Header */}
                        <div
                          className="shrink-0 border-r border-rach-border sticky left-0 z-10"
                          style={{ width: TRACK_HEADER_WIDTH }}
                        >
                          <TrackHeader track={track} onSynthChange={handleSynthChange} />
                        </div>
                        {/* Track lane */}
                        <div
                          className="h-16 border-b border-rach-border relative"
                          style={{ width: gridWidth }}
                          onClick={(e) => handleLaneClick(e, track)}
                          onDrop={(e) => handleDrop(e, track)}
                          onDragOver={handleDragOver}
                        >
                          {/* Grid lines (memoized) */}
                          {gridLines.map((i) => (
                            <div
                              key={i}
                              className="absolute top-0 h-full border-r border-rach-border/30"
                              style={{ left: i * barWidth }}
                            />
                          ))}
                          {/* Clips */}
                          {track.clips.map((clip) => (
                            <ClipView key={clip.id} clip={clip} trackId={track.id} />
                          ))}
                        </div>
                      </div>
                      {/* Automation lanes */}
                      {showAutomation && track.automationLanes.map((lane) => (
                        <div key={lane.id} className="flex">
                          <div
                            className="shrink-0 border-r border-rach-border sticky left-0 z-10"
                            style={{ width: TRACK_HEADER_WIDTH }}
                          >
                            <AutomationLaneHeader lane={lane} trackId={track.id} />
                          </div>
                          <div
                            className="border-b border-rach-border/50 bg-rach-bg/30"
                            style={{ width: gridWidth }}
                          >
                            <AutomationLaneView
                              lane={lane}
                              trackId={track.id}
                              barWidth={barWidth}
                              totalBars={totalBars}
                              beatsPerBar={beatsPerBar}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}
                {bottomPadding > 0 && <div style={{ height: bottomPadding }} />}
              </>
            );
          })()}

          {/* Add track buttons */}
          <div className="flex items-center gap-2 p-3" style={{ marginLeft: 0 }}>
            <button
              onClick={() => handleAddTrack('audio')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <Plus size={14} />
              Audio Track
            </button>
            <button
              data-tutorial="add-midi-track"
              onClick={() => handleAddTrack('midi')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <Plus size={14} />
              MIDI Track
            </button>
            <button
              onClick={() => handleAddTrack('bus')}
              className="flex items-center gap-1 px-2 py-1 rounded text-xs text-rach-text-muted hover:text-rach-text hover:bg-rach-surface-light transition-colors"
            >
              <Plus size={14} />
              Bus Track
            </button>
          </div>
        </div>
      </div>

      {/* Playhead overlay */}
      <Playhead trackHeaderWidth={TRACK_HEADER_WIDTH} />

      {/* Tool mode indicator */}
      <div className="absolute top-8 right-2 z-20 flex gap-1">
        {(['select', 'draw', 'erase'] as const).map((mode) => (
          <button
            key={mode}
            data-tutorial={mode === 'draw' ? 'tool-draw' : undefined}
            onClick={() => useUIStore.getState().setToolMode(mode)}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
              toolMode === mode
                ? 'bg-rach-accent/20 text-rach-accent'
                : 'bg-rach-surface text-rach-text-muted hover:text-rach-text'
            }`}
          >
            {mode.charAt(0).toUpperCase() + mode.slice(1)}
          </button>
        ))}
      </div>
    </div>
  );
}
