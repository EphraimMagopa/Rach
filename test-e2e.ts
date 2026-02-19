/**
 * End-to-end integration test for Phase 1 implementation.
 * Tests all core modules can be imported and basic logic works.
 * Run with: npx tsx test-e2e.ts
 */

// ---- Test Helpers ----
let passed = 0;
let failed = 0;
function assert(condition: boolean, label: string) {
  if (condition) {
    console.log(`  ✅ ${label}`);
    passed++;
  } else {
    console.error(`  ❌ ${label}`);
    failed++;
  }
}

// ---- 1. Models ----
console.log('\n🔧 1. Models');
import { createDefaultProject } from './src/core/models/project';
import type { Track, Clip, MIDINote } from './src/core/models';
import { TimePosition } from './src/core/models/time-position';

const project = createDefaultProject();
assert(project.id.length > 0, 'Default project has ID');
assert(project.tempo === 120, 'Default tempo is 120 BPM');
assert(project.timeSignature.numerator === 4, 'Default time signature 4/4');
assert(project.tracks.length === 0, 'Default project has no tracks');

// TimePosition conversions
assert(TimePosition.beatsToSeconds(4, 120) === 2, 'beatsToSeconds: 4 beats at 120 BPM = 2s');
assert(TimePosition.secondsToBeats(2, 120) === 4, 'secondsToBeats: 2s at 120 BPM = 4 beats');
assert(TimePosition.quantize(3.7, 1) === 4, 'quantize: 3.7 → 4 at grid=1');
assert(TimePosition.quantize(3.3, 0.5) === 3.5, 'quantize: 3.3 → 3.5 at grid=0.5');

// ---- 2. Synth Interface & Factory ----
console.log('\n🎹 2. Synths');
import { createSynth, ALL_SYNTH_TYPES, SYNTH_LABELS } from './src/core/synths/synth-factory';
import type { RachSynthInstance, SynthType } from './src/core/synths/synth-interface';

assert(ALL_SYNTH_TYPES.length === 5, '5 synth types defined');
assert(SYNTH_LABELS['rach-pad'] === 'Rach Pad', 'Rach Pad label correct');
assert(SYNTH_LABELS['subtractive'] === 'Subtractive', 'Subtractive label correct');
assert(SYNTH_LABELS['fm'] === 'FM Synth', 'FM Synth label correct');
assert(SYNTH_LABELS['wavetable'] === 'Wavetable', 'Wavetable label correct');
assert(SYNTH_LABELS['granular'] === 'Granular', 'Granular label correct');

// Verify each synth type can be created (Tone.js needs AudioContext so we skip actual creation)
for (const type of ALL_SYNTH_TYPES) {
  assert(typeof SYNTH_LABELS[type] === 'string', `Synth label exists for ${type}`);
}

// ---- 3. Transport Engine ----
console.log('\n🚀 3. Transport Engine');
import { TransportEngine } from './src/core/transport/transport-engine';

// Verify the class has the expected methods
assert(typeof TransportEngine.prototype.play === 'function', 'TransportEngine.play exists');
assert(typeof TransportEngine.prototype.stop === 'function', 'TransportEngine.stop exists');
assert(typeof TransportEngine.prototype.seekTo === 'function', 'TransportEngine.seekTo exists');
assert(typeof TransportEngine.prototype.setTempo === 'function', 'TransportEngine.setTempo exists');
assert(typeof TransportEngine.prototype.setTimeSignature === 'function', 'TransportEngine.setTimeSignature exists');
assert(typeof TransportEngine.prototype.setLoop === 'function', 'TransportEngine.setLoop exists');
assert(typeof TransportEngine.prototype.addScheduleCallback === 'function', 'TransportEngine.addScheduleCallback exists');
assert(typeof TransportEngine.prototype.beatToTime === 'function', 'TransportEngine.beatToTime exists');
assert(typeof TransportEngine.prototype.dispose === 'function', 'TransportEngine.dispose exists');

// ---- 4. Audio Engine ----
console.log('\n🔊 4. Audio Engine');
import { AudioEngine } from './src/core/audio/audio-engine';

const ae = new AudioEngine();
assert(ae.isInitialized === false, 'AudioEngine starts uninitialized');
assert(ae.audioContext === null, 'No AudioContext before init');
assert(ae.getMasterGain() === null, 'No master gain before init');
assert(ae.getMasterAnalyser() === null, 'No master analyser before init');
assert(typeof ae.createTrackNode === 'function', 'createTrackNode method exists');
assert(typeof ae.removeTrackNode === 'function', 'removeTrackNode method exists');
assert(typeof ae.setTrackVolume === 'function', 'setTrackVolume method exists');
assert(typeof ae.setTrackPan === 'function', 'setTrackPan method exists');
assert(typeof ae.setMasterVolume === 'function', 'setMasterVolume method exists');
assert(typeof ae.setTrackMute === 'function', 'setTrackMute method exists');
assert(typeof ae.resumeContext === 'function', 'resumeContext method exists');

// ---- 5. Playback Engine ----
console.log('\n▶️  5. Playback Engine');
import { PlaybackEngine } from './src/core/audio/playback-engine';
assert(typeof PlaybackEngine.prototype.scheduleClip === 'function', 'PlaybackEngine.scheduleClip exists');
assert(typeof PlaybackEngine.prototype.stopClip === 'function', 'PlaybackEngine.stopClip exists');
assert(typeof PlaybackEngine.prototype.stopAll === 'function', 'PlaybackEngine.stopAll exists');

// ---- 6. MIDI Sequencer ----
console.log('\n🎵 6. MIDI Sequencer');
import { MIDISequencer } from './src/core/midi/midi-sequencer';

const seq = new MIDISequencer();
assert(typeof seq.scheduleRange === 'function', 'MIDISequencer.scheduleRange exists');
assert(typeof seq.allNotesOff === 'function', 'MIDISequencer.allNotesOff exists');
assert(typeof seq.setInstrumentManager === 'function', 'MIDISequencer.setInstrumentManager exists');

// ---- 7. Track Instrument Manager ----
console.log('\n🎛️  7. Track Instrument Manager');
import { TrackInstrumentManager } from './src/core/audio/track-instrument-manager';
assert(typeof TrackInstrumentManager.prototype.assignSynth === 'function', 'assignSynth exists');
assert(typeof TrackInstrumentManager.prototype.getSynth === 'function', 'getSynth exists');
assert(typeof TrackInstrumentManager.prototype.removeSynth === 'function', 'removeSynth exists');
assert(typeof TrackInstrumentManager.prototype.reconnect === 'function', 'reconnect exists');
assert(typeof TrackInstrumentManager.prototype.allNotesOff === 'function', 'allNotesOff exists');

// ---- 8. Metronome ----
console.log('\n🥁 8. Metronome');
import { Metronome } from './src/core/audio/metronome';
const met = new Metronome();
assert(typeof met.initialize === 'function', 'Metronome.initialize exists');
assert(typeof met.setEnabled === 'function', 'Metronome.setEnabled exists');
assert(typeof met.scheduleClick === 'function', 'Metronome.scheduleClick exists');

// ---- 9. Audio File Manager ----
console.log('\n📁 9. Audio File Manager');
import { AudioFileManager, getAudioFileManager } from './src/core/audio/audio-file-manager';
const afm = getAudioFileManager();
assert(afm instanceof AudioFileManager, 'getAudioFileManager returns AudioFileManager');
assert(typeof afm.decodeFile === 'function', 'decodeFile method exists');
assert(typeof afm.getBuffer === 'function', 'getBuffer method exists');
assert(typeof afm.getCachedBuffer === 'function', 'getCachedBuffer method exists');
assert(afm.getBuffer('nonexistent') === undefined, 'getBuffer returns undefined for unknown ID');

// ---- 10. Undo Manager ----
console.log('\n↩️  10. Undo Manager');
import { UndoManager } from './src/core/undo/undo-manager';
const undo = new UndoManager();
assert(undo.canUndo === false, 'No undo before any action');
assert(undo.canRedo === false, 'No redo before any action');

let counter = 0;
undo.execute({
  id: '1',
  label: 'Increment',
  execute: () => { counter = 1; },
  undo: () => { counter = 0; },
});
assert(counter === 1, 'Action executed');
assert(undo.canUndo === true, 'Can undo after action');

undo.undo();
assert(counter === 0, 'Undo works');
assert(undo.canRedo === true, 'Can redo after undo');

undo.redo();
assert(counter === 1, 'Redo works');

// ---- 11. Project Persistence ----
console.log('\n💾 11. Project Persistence');
import { ProjectPersistence, getProjectPersistence } from './src/core/persistence/project-persistence';
const pp = getProjectPersistence();
assert(pp instanceof ProjectPersistence, 'getProjectPersistence returns ProjectPersistence');
assert(typeof pp.save === 'function', 'save method exists');
assert(typeof pp.open === 'function', 'open method exists');
assert(typeof pp.saveAs === 'function', 'saveAs method exists');

// ---- 12. Stores ----
console.log('\n🏪 12. Zustand Stores');

// Transport store
import { useTransportStore } from './src/stores/transport-store';
const ts = useTransportStore.getState();
assert(ts.isPlaying === false, 'Transport starts stopped');
assert(ts.tempo === 120, 'Transport default tempo 120');
assert(ts.metronomeEnabled === false, 'Metronome starts disabled');
assert(typeof ts.play === 'function', 'play action exists');
assert(typeof ts.stop === 'function', 'stop action exists');
assert(typeof ts.setPlayhead === 'function', 'setPlayhead action exists');
assert(typeof ts.toggleMetronome === 'function', 'toggleMetronome action exists');

// Test transport state mutations
ts.play();
assert(useTransportStore.getState().isPlaying === true, 'play() sets isPlaying true');
ts.stop();
assert(useTransportStore.getState().isPlaying === false, 'stop() sets isPlaying false');
assert(useTransportStore.getState().playheadBeats === 0, 'stop() resets playhead');
ts.toggleMetronome();
assert(useTransportStore.getState().metronomeEnabled === true, 'toggleMetronome enables');
ts.toggleMetronome();
assert(useTransportStore.getState().metronomeEnabled === false, 'toggleMetronome disables');

// Project store
import { useProjectStore } from './src/stores/project-store';
const ps = useProjectStore.getState();
assert(ps.project.tracks.length === 0, 'Project starts with no tracks');
assert(ps.selectedTrackId === null, 'No track selected initially');
assert(ps.selectedClipId === null, 'No clip selected initially');
assert(typeof ps.addTrack === 'function', 'addTrack action exists');
assert(typeof ps.removeTrack === 'function', 'removeTrack action exists');
assert(typeof ps.addClip === 'function', 'addClip action exists');
assert(typeof ps.removeClip === 'function', 'removeClip action exists');
assert(typeof ps.addMidiNote === 'function', 'addMidiNote action exists');
assert(typeof ps.removeMidiNote === 'function', 'removeMidiNote action exists');
assert(typeof ps.updateMidiNote === 'function', 'updateMidiNote action exists');

// Test project store CRUD
const testTrack: Track = {
  id: 'test-track-1',
  name: 'Test MIDI',
  type: 'midi',
  color: 'blue',
  volume: 0,
  pan: 0,
  muted: false,
  soloed: false,
  armed: false,
  height: 64,
  clips: [],
  effects: [],
  automationLanes: [],
  input: { type: 'midi' },
  output: { type: 'master' },
  instrumentType: 'rach-pad',
};
ps.addTrack(testTrack);
assert(useProjectStore.getState().project.tracks.length === 1, 'addTrack adds a track');
assert(useProjectStore.getState().project.tracks[0].name === 'Test MIDI', 'Track name correct');

const testClip: Clip = {
  id: 'test-clip-1',
  name: 'Test Clip',
  type: 'midi',
  trackId: 'test-track-1',
  startBeat: 0,
  durationBeats: 4,
  loopEnabled: false,
  loopLengthBeats: 4,
  fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
  color: '#3b82f6',
  midiData: { notes: [] },
};
useProjectStore.getState().addClip('test-track-1', testClip);
assert(useProjectStore.getState().project.tracks[0].clips.length === 1, 'addClip adds a clip');

const testNote: MIDINote = {
  id: 'test-note-1',
  pitch: 60,
  velocity: 100,
  startBeat: 0,
  durationBeats: 1,
};
useProjectStore.getState().addMidiNote('test-track-1', 'test-clip-1', testNote);
const storedNotes = useProjectStore.getState().project.tracks[0].clips[0].midiData?.notes;
assert(storedNotes?.length === 1, 'addMidiNote adds a note');
assert(storedNotes?.[0].pitch === 60, 'Note pitch is 60 (C4)');

useProjectStore.getState().updateMidiNote('test-track-1', 'test-clip-1', 'test-note-1', { velocity: 80 });
const updatedNote = useProjectStore.getState().project.tracks[0].clips[0].midiData?.notes[0];
assert(updatedNote?.velocity === 80, 'updateMidiNote changes velocity');

useProjectStore.getState().removeMidiNote('test-track-1', 'test-clip-1', 'test-note-1');
assert(useProjectStore.getState().project.tracks[0].clips[0].midiData?.notes.length === 0, 'removeMidiNote removes note');

useProjectStore.getState().removeClip('test-track-1', 'test-clip-1');
assert(useProjectStore.getState().project.tracks[0].clips.length === 0, 'removeClip removes clip');

useProjectStore.getState().removeTrack('test-track-1');
assert(useProjectStore.getState().project.tracks.length === 0, 'removeTrack removes track');

// UI store
import { useUIStore } from './src/stores/ui-store';
const ui = useUIStore.getState();
assert(ui.toolMode === 'select', 'Default tool is select');
assert(ui.zoomX === 1, 'Default zoomX is 1');
assert(ui.snapEnabled === true, 'Snap enabled by default');
assert(ui.snapGridSize === 0.25, 'Default snap grid is 0.25 (16th notes)');
assert(typeof ui.setToolMode === 'function', 'setToolMode exists');
assert(typeof ui.togglePanel === 'function', 'togglePanel exists');

// Auth store
import { useAuthStore } from './src/stores/auth-store';
const auth = useAuthStore.getState();
assert(auth.status === 'idle', 'Auth starts idle');
assert(auth.accessToken === null, 'No token initially');
auth.setTokens('test-token', 'test-refresh', Date.now() + 3600000);
assert(useAuthStore.getState().status === 'authenticated', 'setTokens sets authenticated');
auth.clearTokens();
assert(useAuthStore.getState().status === 'idle', 'clearTokens resets to idle');

// Agent store
import { useAgentStore } from './src/stores/agent-store';
const agent = useAgentStore.getState();
assert(agent.activeAgent === 'mixing', 'Default agent is mixing');
assert(agent.conversations.length === 0, 'No conversations initially');
const convId = agent.createConversation('composition');
assert(useAgentStore.getState().conversations.length === 1, 'createConversation adds one');
assert(useAgentStore.getState().conversations[0].agentType === 'composition', 'Conversation type correct');

// ---- 13. Module Barrel Exports ----
console.log('\n📦 13. Module Exports');
import * as AudioExports from './src/core/audio/index';
assert('AudioEngine' in AudioExports, 'AudioEngine exported from audio/index');
assert('PlaybackEngine' in AudioExports, 'PlaybackEngine exported from audio/index');
assert('Metronome' in AudioExports, 'Metronome exported from audio/index');
assert('TrackInstrumentManager' in AudioExports, 'TrackInstrumentManager exported from audio/index');
assert('AudioFileManager' in AudioExports, 'AudioFileManager exported from audio/index');

import * as SynthExports from './src/core/synths/index';
assert('createSynth' in SynthExports, 'createSynth exported from synths/index');
assert('ALL_SYNTH_TYPES' in SynthExports, 'ALL_SYNTH_TYPES exported from synths/index');
assert('SYNTH_LABELS' in SynthExports, 'SYNTH_LABELS exported from synths/index');
assert('RachPadSynth' in SynthExports, 'RachPadSynth exported');
assert('SubtractiveSynth' in SynthExports, 'SubtractiveSynth exported');
assert('WavetableSynth' in SynthExports, 'WavetableSynth exported');
assert('FMSynth' in SynthExports, 'FMSynth exported');
assert('GranularSynth' in SynthExports, 'GranularSynth exported');

// ---- Summary ----
console.log('\n' + '═'.repeat(50));
console.log(`  RESULTS: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));
process.exit(failed > 0 ? 1 : 0);
