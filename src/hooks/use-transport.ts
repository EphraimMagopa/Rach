import { useEffect, useRef } from 'react';
import { useTransportStore } from '@/stores/transport-store';
import { useProjectStore } from '@/stores/project-store';
import { TransportEngine } from '@/core/transport/transport-engine';
import { PlaybackEngine } from '@/core/audio/playback-engine';
import { Metronome } from '@/core/audio/metronome';
import { MIDISequencer } from '@/core/midi/midi-sequencer';
import { TrackInstrumentManager } from '@/core/audio/track-instrument-manager';
import { AudioEngine } from '@/core/audio/audio-engine';
import { getAudioFileManager } from '@/core/audio/audio-file-manager';
import { TimePosition } from '@/core/models/time-position';

let sharedTransportEngine: TransportEngine | null = null;
let sharedMidiSequencer: MIDISequencer | null = null;
let sharedInstrumentManager: TrackInstrumentManager | null = null;

export function getTransportEngine(): TransportEngine | null {
  return sharedTransportEngine;
}

export function getMidiSequencer(): MIDISequencer | null {
  return sharedMidiSequencer;
}

export function getInstrumentManager(): TrackInstrumentManager | null {
  return sharedInstrumentManager;
}

/**
 * Bridge hook: connects Zustand transport-store ↔ TransportEngine.
 * Also wires the MIDI sequencer to schedule notes during playback.
 * Must be called once from App.tsx after audio engine is initialized.
 */
export function useTransport(audioEngine: AudioEngine): TransportEngine {
  const engineRef = useRef<TransportEngine | null>(null);
  const sequencerRef = useRef<MIDISequencer | null>(null);
  const instrumentManagerRef = useRef<TrackInstrumentManager | null>(null);

  // Create engine + sequencer once
  if (!engineRef.current) {
    const playbackEngine = new PlaybackEngine(audioEngine);
    const metronome = new Metronome();
    const engine = new TransportEngine(audioEngine, playbackEngine, metronome);

    const instrumentManager = new TrackInstrumentManager(audioEngine);
    const sequencer = new MIDISequencer();
    sequencer.setInstrumentManager(instrumentManager);

    engineRef.current = engine;
    sequencerRef.current = sequencer;
    instrumentManagerRef.current = instrumentManager;

    sharedTransportEngine = engine;
    sharedMidiSequencer = sequencer;
    sharedInstrumentManager = instrumentManager;
  }

  const engine = engineRef.current;
  const sequencer = sequencerRef.current!;
  const instrumentManager = instrumentManagerRef.current!;

  useEffect(() => {
    // Initialize metronome when audio context is ready
    const ctx = audioEngine.audioContext;
    const masterGain = audioEngine.getMasterGain();
    if (ctx && masterGain) {
      engine.metronome.initialize(ctx, masterGain);
    }

    // Set up tick callback to push beat position into store
    engine.setOnTick((beat) => {
      useTransportStore.getState().setPlayhead(beat);
    });

    // Register MIDI schedule callback on the transport engine
    const midiScheduleCallback = (
      fromBeat: number,
      toBeat: number,
      beatToTime: (beat: number) => number
    ) => {
      // Gather all clips from all tracks
      const tracks = useProjectStore.getState().project.tracks;
      const allClips = tracks.flatMap((t) => t.clips);
      sequencer.scheduleRange(allClips, fromBeat, toBeat, beatToTime);
    };
    engine.addScheduleCallback(midiScheduleCallback);

    // Register audio clip schedule callback
    const scheduledAudioClips = new Set<string>();
    const audioScheduleCallback = (
      fromBeat: number,
      toBeat: number,
      beatToTime: (beat: number) => number
    ) => {
      const tracks = useProjectStore.getState().project.tracks;
      const tempo = useTransportStore.getState().tempo;
      const fileManager = getAudioFileManager();

      for (const track of tracks) {
        for (const clip of track.clips) {
          if (clip.type !== 'audio' || !clip.audioData) continue;
          const clipKey = `${clip.id}-${clip.startBeat}`;

          // Schedule if clip starts in this window and hasn't been scheduled yet
          if (
            clip.startBeat >= fromBeat &&
            clip.startBeat < toBeat &&
            !scheduledAudioClips.has(clipKey)
          ) {
            const buffer = fileManager.getBuffer(clip.audioData.fileId);
            if (!buffer) continue;

            const time = beatToTime(clip.startBeat);
            const offsetSec = TimePosition.beatsToSeconds(
              clip.audioData.startOffset || 0,
              tempo
            );
            const durationSec = TimePosition.beatsToSeconds(
              clip.durationBeats,
              tempo
            );

            engine.playbackEngine.scheduleClip(
              clip.id,
              track.id,
              buffer,
              time,
              offsetSec,
              durationSec
            );
            scheduledAudioClips.add(clipKey);
          }
        }
      }
    };
    engine.addScheduleCallback(audioScheduleCallback);

    // Subscribe to store changes → drive engine
    const unsub = useTransportStore.subscribe((state, prevState) => {
      // Play/Stop
      if (state.isPlaying && !prevState.isPlaying) {
        engine.play(state.playheadBeats);
      } else if (!state.isPlaying && prevState.isPlaying) {
        engine.stop();
        sequencer.allNotesOff();
        scheduledAudioClips.clear();
      }

      // Tempo
      if (state.tempo !== prevState.tempo) {
        engine.setTempo(state.tempo);
      }

      // Metronome
      if (state.metronomeEnabled !== prevState.metronomeEnabled) {
        engine.metronome.setEnabled(state.metronomeEnabled);
      }

      // Time signature
      if (
        state.timeSignature[0] !== prevState.timeSignature[0] ||
        state.timeSignature[1] !== prevState.timeSignature[1]
      ) {
        engine.setTimeSignature(state.timeSignature);
      }

      // Loop
      if (
        state.loopEnabled !== prevState.loopEnabled ||
        state.loopStart !== prevState.loopStart ||
        state.loopEnd !== prevState.loopEnd
      ) {
        engine.setLoop(state.loopEnabled, state.loopStart, state.loopEnd);
      }
    });

    // Sync initial state
    const initial = useTransportStore.getState();
    engine.setTempo(initial.tempo);
    engine.metronome.setEnabled(initial.metronomeEnabled);
    engine.setTimeSignature(initial.timeSignature);
    engine.setLoop(initial.loopEnabled, initial.loopStart, initial.loopEnd);

    return () => {
      unsub();
      engine.removeScheduleCallback(midiScheduleCallback);
      engine.removeScheduleCallback(audioScheduleCallback);
    };
  }, [audioEngine, engine, sequencer, instrumentManager]);

  return engine;
}
