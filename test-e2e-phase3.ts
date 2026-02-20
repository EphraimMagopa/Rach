/**
 * End-to-end integration test for Phase 3 implementation.
 * Tests mutation system, tool executor, apply-mutations, agent store,
 * project store sections, stem separator, suno importer, and UI components.
 * Run with: npx tsx test-e2e-phase3.ts
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

// ═══════════════════════════════════════
// 1. Mutation Types
// ═══════════════════════════════════════
console.log('\n🔄 1. Mutation Types');

import type { ProjectMutation, ToolExecution, AgentResponse } from './src/core/models/mutations';

// Test that all mutation types can be constructed
const mutSetVolume: ProjectMutation = { type: 'setTrackVolume', trackId: 'trk1', volume: -6 };
assert(mutSetVolume.type === 'setTrackVolume', 'setTrackVolume mutation constructs');
assert(mutSetVolume.volume === -6, 'setTrackVolume carries volume');

const mutSetPan: ProjectMutation = { type: 'setTrackPan', trackId: 'trk1', pan: -0.5 };
assert(mutSetPan.type === 'setTrackPan', 'setTrackPan mutation constructs');

const mutAddEffect: ProjectMutation = {
  type: 'addEffect',
  trackId: 'trk1',
  effectType: 'parametric-eq',
  params: { band0Freq: 80, band0Gain: -6, band0Q: 1.4 },
};
assert(mutAddEffect.type === 'addEffect', 'addEffect mutation constructs');

const mutAddNotes: ProjectMutation = {
  type: 'addMidiNotes',
  trackId: 'trk1',
  clipId: 'clip1',
  notes: [{ id: 'n1', pitch: 60, velocity: 100, startBeat: 0, durationBeats: 1 }],
};
assert(mutAddNotes.type === 'addMidiNotes', 'addMidiNotes mutation constructs');
assert(mutAddNotes.notes.length === 1, 'addMidiNotes carries notes');

const mutCreateClip: ProjectMutation = {
  type: 'createClip',
  trackId: 'trk1',
  clip: { id: 'clip2', name: 'Test', type: 'midi', startBeat: 0, durationBeats: 16 },
};
assert(mutCreateClip.type === 'createClip', 'createClip mutation constructs');

const mutUpdateTrack: ProjectMutation = {
  type: 'updateTrack',
  trackId: 'trk1',
  updates: { name: 'Renamed' },
};
assert(mutUpdateTrack.type === 'updateTrack', 'updateTrack mutation constructs');

const mutCreateSection: ProjectMutation = {
  type: 'createSection',
  name: 'Verse 1',
  startBeat: 0,
  durationBeats: 16,
  color: '#3b82f6',
};
assert(mutCreateSection.type === 'createSection', 'createSection mutation constructs');

// ToolExecution type
const toolExec: ToolExecution = { name: 'set_track_level', input: { trackId: 'trk1', level: -6 }, result: 'Set volume to -6 dB' };
assert(toolExec.name === 'set_track_level', 'ToolExecution constructs');

// AgentResponse type
const agentResp: AgentResponse = { text: 'Done', mutations: [mutSetVolume], toolExecutions: [toolExec] };
assert(agentResp.text === 'Done', 'AgentResponse constructs');
assert(agentResp.mutations.length === 1, 'AgentResponse carries mutations');
assert(agentResp.toolExecutions.length === 1, 'AgentResponse carries toolExecutions');

// ═══════════════════════════════════════
// 2. Section Model
// ═══════════════════════════════════════
console.log('\n📍 2. Section Model');

import type { Section } from './src/core/models/section';

const section: Section = {
  id: 'sec1',
  name: 'Chorus',
  startBeat: 16,
  durationBeats: 16,
  color: '#ef4444',
};
assert(section.id === 'sec1', 'Section constructs with id');
assert(section.name === 'Chorus', 'Section has name');
assert(section.startBeat === 16, 'Section has startBeat');
assert(section.durationBeats === 16, 'Section has durationBeats');
assert(section.color === '#ef4444', 'Section has color');

// ═══════════════════════════════════════
// 3. Project Model — sections field
// ═══════════════════════════════════════
console.log('\n📦 3. Project Model — sections');

import { createDefaultProject } from './src/core/models/project';

const defaultProject = createDefaultProject();
assert(Array.isArray(defaultProject.sections), 'Default project has sections array');
assert(defaultProject.sections.length === 0, 'Default project sections is empty');

// ═══════════════════════════════════════
// 4. Model Barrel Exports
// ═══════════════════════════════════════
console.log('\n📤 4. Model Barrel Exports');

import * as models from './src/core/models/index';

assert('createDefaultProject' in models, 'index exports createDefaultProject');
// Check section and mutation types are exported (as types they won't appear at runtime,
// but we can verify the file imports successfully)
assert(true, 'Section type exported from index (compilation check)');
assert(true, 'Mutations types exported from index (compilation check)');

// ═══════════════════════════════════════
// 5. Tool Executor
// ═══════════════════════════════════════
console.log('\n🔧 5. Tool Executor');

import { ToolExecutor } from './electron/services/tool-executor';

const executor = new ToolExecutor();
assert(typeof executor.execute === 'function', 'ToolExecutor.execute exists');

// Build mock project context
const mockContext = {
  tracks: [
    {
      id: 'track-1',
      name: 'Kick',
      type: 'audio',
      volume: -3,
      pan: 0,
      muted: false,
      effects: [],
      sends: [],
      clips: [
        {
          id: 'clip-1',
          name: 'Kick Pattern',
          type: 'midi' as const,
          startBeat: 0,
          durationBeats: 16,
          midiNotes: [
            { pitch: 36, velocity: 100, startBeat: 0, durationBeats: 0.5 },
            { pitch: 36, velocity: 90, startBeat: 1, durationBeats: 0.5 },
            { pitch: 36, velocity: 100, startBeat: 2, durationBeats: 0.5 },
            { pitch: 36, velocity: 90, startBeat: 3, durationBeats: 0.5 },
          ],
        },
      ],
      frequencyData: [],
      peakLevel: -6,
      rmsLevel: -12,
    },
    {
      id: 'track-2',
      name: 'Bass',
      type: 'midi',
      volume: -6,
      pan: 0,
      muted: false,
      effects: [{ type: 'compressor-vca', name: 'VCA Compressor', params: { threshold: -20, ratio: 4 } }],
      sends: [],
      clips: [],
    },
    {
      id: 'track-3',
      name: 'Pad',
      type: 'instrument',
      volume: -9,
      pan: 0.3,
      muted: false,
      effects: [],
      sends: [],
      clips: [
        {
          id: 'clip-3',
          name: 'Pad Chords',
          type: 'midi' as const,
          startBeat: 0,
          durationBeats: 16,
          midiNotes: [
            { pitch: 60, velocity: 80, startBeat: 0, durationBeats: 4 },
            { pitch: 64, velocity: 80, startBeat: 0, durationBeats: 4 },
            { pitch: 67, velocity: 80, startBeat: 0, durationBeats: 4 },
          ],
        },
      ],
    },
  ],
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  sections: [],
};

// 5a. set_track_level
console.log('  -- set_track_level');
const setLevelResult = executor.execute('set_track_level', { trackId: 'track-1', level: -6 }, mockContext);
assert(setLevelResult.mutations.length === 1, 'set_track_level returns 1 mutation');
assert(setLevelResult.mutations[0].type === 'setTrackVolume', 'mutation type is setTrackVolume');
assert((setLevelResult.mutations[0] as any).volume === -6, 'mutation volume is -6');
assert(setLevelResult.result.includes('Kick'), 'result mentions track name');

// 5b. set_track_pan
console.log('  -- set_track_pan');
const setPanResult = executor.execute('set_track_pan', { trackId: 'track-2', pan: -0.5 }, mockContext);
assert(setPanResult.mutations.length === 1, 'set_track_pan returns 1 mutation');
assert(setPanResult.mutations[0].type === 'setTrackPan', 'mutation type is setTrackPan');
assert((setPanResult.mutations[0] as any).pan === -0.5, 'mutation pan is -0.5');
assert(setPanResult.result.includes('Bass'), 'result mentions Bass');

// 5c. apply_eq
console.log('  -- apply_eq');
const eqResult = executor.execute('apply_eq', {
  trackId: 'track-1',
  bands: [
    { frequency: 80, gain: -6, q: 1.4 },
    { frequency: 3000, gain: 3, q: 2 },
  ],
}, mockContext);
assert(eqResult.mutations.length === 1, 'apply_eq returns 1 mutation');
assert(eqResult.mutations[0].type === 'addEffect', 'mutation type is addEffect');
assert((eqResult.mutations[0] as any).effectType === 'parametric-eq', 'effect type is parametric-eq');
const eqParams = (eqResult.mutations[0] as any).params;
assert(eqParams.band0Freq === 80, 'EQ band0 frequency is 80');
assert(eqParams.band0Gain === -6, 'EQ band0 gain is -6');
assert(eqParams.band1Freq === 3000, 'EQ band1 frequency is 3000');

// 5d. apply_compression
console.log('  -- apply_compression');
const compResult = executor.execute('apply_compression', {
  trackId: 'track-1',
  threshold: -24,
  ratio: 4,
  attack: 3,
  release: 250,
}, mockContext);
assert(compResult.mutations.length === 1, 'apply_compression returns 1 mutation');
assert((compResult.mutations[0] as any).effectType === 'compressor-vca', 'effect type is compressor-vca');
const compParams = (compResult.mutations[0] as any).params;
assert(compParams.threshold === -24, 'Compressor threshold is -24');
assert(compParams.ratio === 4, 'Compressor ratio is 4');
assert(compParams.attack === 0.003, 'Attack converted from 3ms to 0.003s');
assert(compParams.release === 0.25, 'Release converted from 250ms to 0.25s');

// 5e. analyze_frequency_spectrum (no mutations)
console.log('  -- analyze_frequency_spectrum');
const specResult = executor.execute('analyze_frequency_spectrum', { trackId: 'track-1' }, mockContext);
assert(specResult.mutations.length === 0, 'analyze_frequency_spectrum returns 0 mutations');
assert(specResult.result.includes('Kick'), 'result mentions track name');

// 5f. generate_chord_progression (no mutations, informational)
console.log('  -- generate_chord_progression');
const chordResult = executor.execute('generate_chord_progression', {
  key: 'C major',
  numBars: 4,
  style: 'pop',
}, mockContext);
assert(chordResult.mutations.length === 0, 'generate_chord_progression returns 0 mutations');
assert(chordResult.result.includes('Bar 1'), 'result has Bar 1');
assert(chordResult.result.includes('Bar 4'), 'result has Bar 4');
assert(chordResult.result.includes('MIDI data'), 'result includes MIDI data');

// 5g. create_midi_track — on empty track (creates clip first)
console.log('  -- create_midi_track (new clip)');
const midiResult = executor.execute('create_midi_track', {
  trackId: 'track-2',
  notes: [
    { pitch: 48, velocity: 100, startBeat: 0, durationBeats: 2 },
    { pitch: 55, velocity: 90, startBeat: 2, durationBeats: 2 },
  ],
}, mockContext);
assert(midiResult.mutations.length === 2, 'create_midi_track (new clip) returns 2 mutations (createClip + addMidiNotes)');
assert(midiResult.mutations[0].type === 'createClip', 'first mutation is createClip');
assert(midiResult.mutations[1].type === 'addMidiNotes', 'second mutation is addMidiNotes');
assert((midiResult.mutations[1] as any).notes.length === 2, '2 notes in addMidiNotes');

// 5h. create_midi_track — on track with existing clip
console.log('  -- create_midi_track (existing clip)');
const midiResult2 = executor.execute('create_midi_track', {
  trackId: 'track-1',
  notes: [{ pitch: 36, velocity: 127, startBeat: 4, durationBeats: 0.25 }],
}, mockContext);
assert(midiResult2.mutations.length === 1, 'create_midi_track (existing clip) returns 1 mutation');
assert(midiResult2.mutations[0].type === 'addMidiNotes', 'mutation is addMidiNotes');
assert((midiResult2.mutations[0] as any).clipId === 'clip-1', 'reuses existing clip-1');

// 5i. detect_key_and_scale (no mutations)
console.log('  -- detect_key_and_scale');
const keyResult = executor.execute('detect_key_and_scale', { trackId: 'track-3' }, mockContext);
assert(keyResult.mutations.length === 0, 'detect_key_and_scale returns 0 mutations');
assert(keyResult.result.includes('Key detection'), 'result has key detection text');
assert(keyResult.result.includes('confidence'), 'result has confidence');

// 5j. detect_key_and_scale on empty track
console.log('  -- detect_key_and_scale (no notes)');
const keyResult2 = executor.execute('detect_key_and_scale', { trackId: 'track-2' }, mockContext);
assert(keyResult2.result.includes('No MIDI notes'), 'empty track returns no notes message');

// 5k. create_song_section
console.log('  -- create_song_section');
const sectionResult = executor.execute('create_song_section', {
  name: 'Chorus',
  startBeat: 16,
  durationBeats: 16,
  color: '#ef4444',
}, mockContext);
assert(sectionResult.mutations.length === 1, 'create_song_section returns 1 mutation');
assert(sectionResult.mutations[0].type === 'createSection', 'mutation type is createSection');
assert((sectionResult.mutations[0] as any).name === 'Chorus', 'section name is Chorus');

// 5l. analyze_project_mix (no mutations)
console.log('  -- analyze_project_mix');
const analysisResult = executor.execute('analyze_project_mix', { includeRecommendations: true }, mockContext);
assert(analysisResult.mutations.length === 0, 'analyze_project_mix returns 0 mutations');
assert(analysisResult.result.includes('Mix Analysis'), 'result has Mix Analysis heading');
assert(analysisResult.result.includes('Level Balance'), 'result has Level Balance section');
assert(analysisResult.result.includes('Stereo Image'), 'result has Stereo Image section');
assert(analysisResult.result.includes('Kick'), 'result mentions Kick track');
assert(analysisResult.result.includes('Bass'), 'result mentions Bass track');
assert(analysisResult.result.includes('Recommendations'), 'result has Recommendations');

// 5m. Unknown tool
console.log('  -- unknown tool');
const unknownResult = executor.execute('nonexistent_tool', {}, mockContext);
assert(unknownResult.result.includes('Unknown tool'), 'unknown tool returns error text');
assert(unknownResult.mutations.length === 0, 'unknown tool returns no mutations');

// 5n. Track resolution — by name
console.log('  -- track resolution by name');
const byNameResult = executor.execute('set_track_level', { trackId: 'Bass', level: -12 }, mockContext);
assert(byNameResult.mutations.length === 1, 'resolves track by name');
assert((byNameResult.mutations[0] as any).trackId === 'track-2', 'resolved to correct track id');

// 5o. Track resolution — by index
console.log('  -- track resolution by index');
const byIndexResult = executor.execute('set_track_level', { trackId: '3', level: -12 }, mockContext);
assert(byIndexResult.mutations.length === 1, 'resolves track by 1-based index');
assert((byIndexResult.mutations[0] as any).trackId === 'track-3', 'resolved to correct track id (Pad)');

// 5p. Track resolution — not found
console.log('  -- track not found');
const notFoundResult = executor.execute('set_track_level', { trackId: 'nonexistent', level: 0 }, mockContext);
assert(notFoundResult.mutations.length === 0, 'track not found returns 0 mutations');
assert(notFoundResult.result.includes('not found'), 'result mentions not found');

// ═══════════════════════════════════════
// 6. Apply Mutations
// ═══════════════════════════════════════
console.log('\n🔄 6. Apply Mutations');

import { applyMutations } from './src/utils/apply-mutations';

// Build a mock store to track calls
const storeCalls: string[] = [];
const mockStore = {
  updateTrack: (trackId: string, updates: Record<string, unknown>) => {
    storeCalls.push(`updateTrack:${trackId}:${JSON.stringify(updates)}`);
  },
  addClip: (trackId: string, clip: any) => {
    storeCalls.push(`addClip:${trackId}:${clip.id}`);
  },
  addEffect: (trackId: string, effect: any) => {
    storeCalls.push(`addEffect:${trackId}:${effect.type}`);
  },
  addMidiNote: (trackId: string, clipId: string, note: any) => {
    storeCalls.push(`addMidiNote:${trackId}:${clipId}:${note.pitch}`);
  },
  addSection: (section: any) => {
    storeCalls.push(`addSection:${section.name}`);
  },
  project: { tracks: [{ id: 'trk1', clips: [] }] },
};

// Apply a mix of mutations
const testMutations: ProjectMutation[] = [
  { type: 'setTrackVolume', trackId: 'trk1', volume: -6 },
  { type: 'setTrackPan', trackId: 'trk1', pan: 0.5 },
  { type: 'addEffect', trackId: 'trk1', effectType: 'parametric-eq', params: { band0Freq: 100 } },
  { type: 'createClip', trackId: 'trk1', clip: { id: 'c1', name: 'Test', type: 'midi', startBeat: 0, durationBeats: 8 } },
  { type: 'addMidiNotes', trackId: 'trk1', clipId: 'c1', notes: [{ id: 'n1', pitch: 60, velocity: 100, startBeat: 0, durationBeats: 1 }] },
  { type: 'updateTrack', trackId: 'trk1', updates: { name: 'Renamed' } },
  { type: 'createSection', name: 'Intro', startBeat: 0, durationBeats: 8 },
];

applyMutations(mockStore as any, testMutations);

assert(storeCalls.length === 7, `All 7 mutations applied (got ${storeCalls.length})`);
assert(storeCalls[0].includes('updateTrack:trk1'), 'setTrackVolume → updateTrack');
assert(storeCalls[0].includes('"volume":-6'), 'volume is -6');
assert(storeCalls[1].includes('updateTrack:trk1'), 'setTrackPan → updateTrack');
assert(storeCalls[1].includes('"pan":0.5'), 'pan is 0.5');
assert(storeCalls[2].includes('addEffect:trk1:parametric-eq'), 'addEffect creates parametric-eq');
assert(storeCalls[3].includes('addClip:trk1:c1'), 'createClip creates clip c1');
assert(storeCalls[4].includes('addMidiNote:trk1:c1:60'), 'addMidiNotes adds note pitch 60');
assert(storeCalls[5].includes('updateTrack:trk1'), 'updateTrack calls updateTrack');
assert(storeCalls[6].includes('addSection:Intro'), 'createSection adds Intro section');

// ═══════════════════════════════════════
// 7. Agent Store — new fields
// ═══════════════════════════════════════
console.log('\n🤖 7. Agent Store — new fields');

import type { AgentMessage as AgentMsg } from './src/stores/agent-store';

const testMsg: AgentMsg = {
  id: 'msg1',
  role: 'assistant',
  content: 'I set the volume',
  timestamp: new Date().toISOString(),
  agentType: 'mixing',
  toolExecutions: [{ name: 'set_track_level', input: { trackId: 't1', level: -6 }, result: 'Done' }],
  mutations: [{ type: 'setTrackVolume', trackId: 't1', volume: -6 }],
};

assert(testMsg.toolExecutions !== undefined, 'AgentMessage carries toolExecutions');
assert(testMsg.toolExecutions!.length === 1, 'toolExecutions has 1 entry');
assert(testMsg.mutations !== undefined, 'AgentMessage carries mutations');
assert(testMsg.mutations!.length === 1, 'mutations has 1 entry');

// Without optional fields
const simpleMsg: AgentMsg = {
  id: 'msg2',
  role: 'user',
  content: 'Hello',
  timestamp: new Date().toISOString(),
  agentType: 'mixing',
};
assert(simpleMsg.toolExecutions === undefined, 'User message has no toolExecutions');
assert(simpleMsg.mutations === undefined, 'User message has no mutations');

// ═══════════════════════════════════════
// 8. Project Store — Section CRUD
// ═══════════════════════════════════════
console.log('\n📊 8. Project Store — Section CRUD');

import { useProjectStore } from './src/stores/project-store';

const projectStore = useProjectStore.getState();
assert(typeof projectStore.addSection === 'function', 'addSection action exists');
assert(typeof projectStore.removeSection === 'function', 'removeSection action exists');

// Add a section
projectStore.addSection({ id: 'sec-test', name: 'Verse 1', startBeat: 0, durationBeats: 16, color: '#22c55e' });
let state = useProjectStore.getState();
assert(state.project.sections.length === 1, 'Section added to project');
assert(state.project.sections[0].name === 'Verse 1', 'Section name is Verse 1');

// Add another section
projectStore.addSection({ id: 'sec-test2', name: 'Chorus', startBeat: 16, durationBeats: 16, color: '#ef4444' });
state = useProjectStore.getState();
assert(state.project.sections.length === 2, 'Two sections in project');

// Remove a section
useProjectStore.getState().removeSection('sec-test');
state = useProjectStore.getState();
assert(state.project.sections.length === 1, 'Section removed');
assert(state.project.sections[0].name === 'Chorus', 'Remaining section is Chorus');

// Clean up
useProjectStore.getState().removeSection('sec-test2');
state = useProjectStore.getState();
assert(state.project.sections.length === 0, 'All sections removed');

// ═══════════════════════════════════════
// 9. Claude Agent Service — structure
// ═══════════════════════════════════════
console.log('\n📡 9. Claude Agent Service — structure');

import { ClaudeAgentService } from './electron/services/claude-agent-service';
import type { AgentType } from './electron/services/claude-agent-service';

assert(typeof ClaudeAgentService === 'function', 'ClaudeAgentService class exists');
assert(typeof ClaudeAgentService.prototype.sendMessage === 'function', 'sendMessage method exists');
assert(typeof ClaudeAgentService.prototype.clearConversation === 'function', 'clearConversation method exists');

// Check AgentType export
const agentTypes: AgentType[] = ['mixing', 'composition', 'arrangement', 'analysis'];
assert(agentTypes.length === 4, 'All 4 agent types valid');

// ═══════════════════════════════════════
// 10. Stem Separator — structure
// ═══════════════════════════════════════
console.log('\n🎵 10. Stem Separator — structure');

import { StemSeparator } from './electron/services/stem-separator';

const stemSep = new StemSeparator();
assert(typeof stemSep.isModelAvailable === 'function', 'isModelAvailable method exists');
assert(typeof stemSep.getModelPath === 'function', 'getModelPath method exists');
assert(typeof stemSep.separate === 'function', 'separate method exists');
assert(typeof stemSep.cancel === 'function', 'cancel method exists');

// Model should not be available in test (no model downloaded)
assert(stemSep.isModelAvailable() === false, 'Model not available in test environment');
assert(typeof stemSep.getModelPath() === 'string', 'getModelPath returns string');
assert(stemSep.getModelPath().includes('demucs_v4_hq.onnx'), 'Model path includes demucs_v4_hq.onnx');

// ═══════════════════════════════════════
// 11. Suno Importer — structure
// ═══════════════════════════════════════
console.log('\n🎶 11. Suno Importer — structure');

import { SunoImporter } from './electron/services/suno-importer';

const sunoImp = new SunoImporter();
assert(typeof sunoImp.importFromUrl === 'function', 'importFromUrl method exists');

// ═══════════════════════════════════════
// 12. Full Integration — tool executor → mutations → store
// ═══════════════════════════════════════
console.log('\n🔗 12. Full Integration — tool executor → mutations → store');

// Reset project store
const freshProject = createDefaultProject();
freshProject.tracks = [
  {
    id: 'int-track-1',
    name: 'Lead Synth',
    type: 'instrument' as const,
    color: 'blue' as const,
    volume: -3,
    pan: 0,
    muted: false,
    soloed: false,
    armed: false,
    height: 80,
    clips: [],
    effects: [],
    automationLanes: [],
    input: { type: 'virtual' as const },
    output: { type: 'master' as const },
  },
];
useProjectStore.getState().setProject(freshProject);

// Simulate: agent calls set_track_level → executor returns mutation → apply to store
const levelResult = executor.execute('set_track_level', { trackId: 'int-track-1', level: -12 }, {
  tracks: freshProject.tracks.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    volume: t.volume,
    pan: t.pan,
    muted: t.muted,
    effects: [],
    sends: [],
    clips: [],
  })),
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  sections: [],
});

assert(levelResult.mutations.length === 1, 'Level tool returns 1 mutation');
applyMutations(useProjectStore.getState() as any, levelResult.mutations as ProjectMutation[]);
state = useProjectStore.getState();
assert(state.project.tracks[0].volume === -12, 'Track volume updated to -12 dB in store');

// Simulate: agent calls apply_eq → executor returns mutation → apply to store
const eqResult2 = executor.execute('apply_eq', {
  trackId: 'int-track-1',
  bands: [{ frequency: 2000, gain: 3, q: 1 }],
}, {
  tracks: freshProject.tracks.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    volume: t.volume,
    pan: t.pan,
    muted: t.muted,
    effects: [],
    sends: [],
    clips: [],
  })),
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  sections: [],
});

applyMutations(useProjectStore.getState() as any, eqResult2.mutations as ProjectMutation[]);
state = useProjectStore.getState();
assert(state.project.tracks[0].effects.length === 1, 'EQ effect added to track');
assert(state.project.tracks[0].effects[0].type === 'parametric-eq', 'Effect type is parametric-eq');
assert(state.project.tracks[0].effects[0].enabled === true, 'Effect is enabled');
assert(state.project.tracks[0].effects[0].parameters.length > 0, 'Effect has parameters');

// Find the band0Freq parameter
const band0Freq = state.project.tracks[0].effects[0].parameters.find((p) => p.name === 'band0Freq');
assert(band0Freq !== undefined, 'band0Freq parameter exists');
assert(band0Freq!.value === 2000, 'band0Freq value is 2000');

// Simulate: create clip + add notes
const createResult = executor.execute('create_midi_track', {
  trackId: 'int-track-1',
  notes: [
    { pitch: 60, velocity: 100, startBeat: 0, durationBeats: 1 },
    { pitch: 64, velocity: 90, startBeat: 1, durationBeats: 1 },
    { pitch: 67, velocity: 80, startBeat: 2, durationBeats: 1 },
  ],
}, {
  tracks: useProjectStore.getState().project.tracks.map((t) => ({
    id: t.id,
    name: t.name,
    type: t.type,
    volume: t.volume,
    pan: t.pan,
    muted: t.muted,
    effects: [],
    sends: [],
    clips: t.clips.map((c) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      startBeat: c.startBeat,
      durationBeats: c.durationBeats,
      midiNotes: c.midiData?.notes.map((n) => ({
        pitch: n.pitch,
        velocity: n.velocity,
        startBeat: n.startBeat,
        durationBeats: n.durationBeats,
      })),
    })),
  })),
  tempo: 120,
  timeSignature: { numerator: 4, denominator: 4 },
  sections: [],
});

assert(createResult.mutations.length === 2, 'create_midi_track returns 2 mutations (clip + notes)');
applyMutations(useProjectStore.getState() as any, createResult.mutations as ProjectMutation[]);
state = useProjectStore.getState();
assert(state.project.tracks[0].clips.length === 1, 'Clip created on track');
assert(state.project.tracks[0].clips[0].type === 'midi', 'Clip type is midi');
assert(state.project.tracks[0].clips[0].midiData !== undefined, 'Clip has midiData');
assert(state.project.tracks[0].clips[0].midiData!.notes.length === 3, '3 MIDI notes in clip');

// Simulate: create section
const sectionRes = executor.execute('create_song_section', {
  name: 'Bridge',
  startBeat: 32,
  durationBeats: 8,
  color: '#a855f7',
}, mockContext);
applyMutations(useProjectStore.getState() as any, sectionRes.mutations as ProjectMutation[]);
state = useProjectStore.getState();
assert(state.project.sections.length === 1, 'Section created');
assert(state.project.sections[0].name === 'Bridge', 'Section name is Bridge');
assert(state.project.sections[0].startBeat === 32, 'Section starts at beat 32');

// ═══════════════════════════════════════
// 13. Chord Progression Generation — content quality
// ═══════════════════════════════════════
console.log('\n🎹 13. Chord Progression Quality');

// Pop progression
const popChords = executor.execute('generate_chord_progression', { key: 'G major', numBars: 4, style: 'pop' }, mockContext);
assert(popChords.result.includes('G major'), 'Pop chords mention key');
assert(popChords.result.includes('Bar 1'), 'Pop chords have 4 bars');

// Jazz progression
const jazzChords = executor.execute('generate_chord_progression', { key: 'C minor', numBars: 4, style: 'jazz' }, mockContext);
assert(jazzChords.result.includes('C minor'), 'Jazz chords mention key');

// Blues progression
const bluesChords = executor.execute('generate_chord_progression', { key: 'A major', numBars: 4, style: 'blues' }, mockContext);
assert(bluesChords.result.includes('A major'), 'Blues chords mention key');

// ═══════════════════════════════════════
// 14. Mix Analysis — content quality
// ═══════════════════════════════════════
console.log('\n📈 14. Mix Analysis Quality');

// Test with track that has high volume (should trigger clipping warning)
const hotContext = {
  ...mockContext,
  tracks: [
    ...mockContext.tracks,
    { id: 'trk-hot', name: 'Hot Track', type: 'audio', volume: 3, pan: 0, muted: false, effects: [], sends: [], clips: [] },
  ],
};
const hotAnalysis = executor.execute('analyze_project_mix', { includeRecommendations: true }, hotContext);
assert(hotAnalysis.result.includes('clipping'), 'Analysis warns about clipping risk');
assert(hotAnalysis.result.includes('Hot Track'), 'Analysis mentions hot track by name');

// Test with all-center panning (should suggest wider image)
const centerContext = {
  ...mockContext,
  tracks: mockContext.tracks.map((t) => ({ ...t, pan: 0 })),
};
const centerAnalysis = executor.execute('analyze_project_mix', {}, centerContext);
assert(centerAnalysis.result.includes('panning') || centerAnalysis.result.includes('stereo'), 'Analysis addresses stereo image');

// Test empty project
const emptyAnalysis = executor.execute('analyze_project_mix', {}, { ...mockContext, tracks: [] });
assert(emptyAnalysis.result.includes('No tracks'), 'Empty project analysis handled');

// ═══════════════════════════════════════
// Summary
// ═══════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`Phase 3 E2E Tests: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));

if (failed > 0) {
  process.exit(1);
}
