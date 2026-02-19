/**
 * End-to-end integration test for Phase 2 implementation.
 * Tests effects engine, automation, routing, session view, VST3, and store CRUD.
 * Run with: npx tsx test-e2e-phase2.ts
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
// 1. Effect Models & Factory
// ═══════════════════════════════════════
console.log('\n🎛️  1. Effect Models & Factory');

import type { EffectType, EffectInstance, EffectParameter } from './src/core/models/effects';
import { LEGACY_EFFECT_MAP } from './src/core/models/effects';
import { ALL_EFFECT_TYPES, EFFECT_LABELS, EFFECT_CATEGORIES } from './src/core/effects/effect-factory';
import type { EffectCategory } from './src/core/effects/effect-interface';

assert(ALL_EFFECT_TYPES.length === 24, '24 effect types defined');
assert(EFFECT_LABELS['compressor-vca'] === 'VCA Compressor', 'VCA Compressor label');
assert(EFFECT_LABELS['parametric-eq'] === 'Parametric EQ', 'Parametric EQ label');
assert(EFFECT_LABELS['reverb-algorithmic'] === 'Algorithmic Reverb', 'Algorithmic Reverb label');
assert(EFFECT_LABELS['delay-pingpong'] === 'Ping-Pong Delay', 'Ping-Pong Delay label');
assert(EFFECT_LABELS['chorus'] === 'Chorus', 'Chorus label');
assert(EFFECT_LABELS['distortion'] === 'Distortion', 'Distortion label');
assert(EFFECT_LABELS['vocoder'] === 'Vocoder', 'Vocoder label');
assert(EFFECT_LABELS['pitch-shifter'] === 'Pitch Shifter', 'Pitch Shifter label');

// Verify all types have labels and categories
for (const type of ALL_EFFECT_TYPES) {
  assert(typeof EFFECT_LABELS[type] === 'string', `Label exists for ${type}`);
  assert(typeof EFFECT_CATEGORIES[type] === 'string', `Category exists for ${type}`);
}

// Verify categories
const validCategories: EffectCategory[] = ['dynamics', 'eq-filter', 'time-based', 'creative'];
for (const type of ALL_EFFECT_TYPES) {
  assert(validCategories.includes(EFFECT_CATEGORIES[type]), `${type} has valid category`);
}

// Category counts
const dynamics = ALL_EFFECT_TYPES.filter((t) => EFFECT_CATEGORIES[t] === 'dynamics');
const eqFilter = ALL_EFFECT_TYPES.filter((t) => EFFECT_CATEGORIES[t] === 'eq-filter');
const timeBased = ALL_EFFECT_TYPES.filter((t) => EFFECT_CATEGORIES[t] === 'time-based');
const creative = ALL_EFFECT_TYPES.filter((t) => EFFECT_CATEGORIES[t] === 'creative');
assert(dynamics.length === 7, '7 dynamics effects');
assert(eqFilter.length === 4, '4 EQ/filter effects');
assert(timeBased.length === 8, '8 time-based effects');
assert(creative.length === 5, '5 creative effects');

// Legacy mapping
assert(LEGACY_EFFECT_MAP.eq === 'parametric-eq', 'Legacy eq → parametric-eq');
assert(LEGACY_EFFECT_MAP.compressor === 'compressor-vca', 'Legacy compressor → compressor-vca');
assert(LEGACY_EFFECT_MAP.reverb === 'reverb-algorithmic', 'Legacy reverb → reverb-algorithmic');
assert(LEGACY_EFFECT_MAP.delay === 'delay-pingpong', 'Legacy delay → delay-pingpong');
assert(LEGACY_EFFECT_MAP.gate === 'gate-expander', 'Legacy gate → gate-expander');

// ═══════════════════════════════════════
// 2. Effect Interface & BaseEffect
// ═══════════════════════════════════════
console.log('\n🔌 2. Effect Interface & BaseEffect');

import { BaseEffect } from './src/core/effects/base-effect';
import type { RachEffectInstance, EffectParameterDescriptor } from './src/core/effects/effect-interface';

// Verify BaseEffect has expected prototype methods
assert(typeof BaseEffect.prototype.getInput === 'function', 'BaseEffect.getInput exists');
assert(typeof BaseEffect.prototype.getOutput === 'function', 'BaseEffect.getOutput exists');
assert(typeof BaseEffect.prototype.connect === 'function', 'BaseEffect.connect exists');
assert(typeof BaseEffect.prototype.disconnect === 'function', 'BaseEffect.disconnect exists');
assert(typeof BaseEffect.prototype.setEnabled === 'function', 'BaseEffect.setEnabled exists');
assert(typeof BaseEffect.prototype.isEnabled === 'function', 'BaseEffect.isEnabled exists');
assert(typeof BaseEffect.prototype.dispose === 'function', 'BaseEffect.dispose exists');
// setParameter and getParameters are abstract — implemented by subclasses
assert('setParameter' in BaseEffect.prototype === false, 'setParameter is abstract (not on prototype)');
assert('getParameters' in BaseEffect.prototype === false, 'getParameters is abstract (not on prototype)');

// ═══════════════════════════════════════
// 3. TrackEffectManager
// ═══════════════════════════════════════
console.log('\n🔧 3. TrackEffectManager');

import { TrackEffectManager } from './src/core/effects/track-effect-manager';

assert(typeof TrackEffectManager.prototype.addEffect === 'function', 'addEffect exists');
assert(typeof TrackEffectManager.prototype.removeEffect === 'function', 'removeEffect exists');
assert(typeof TrackEffectManager.prototype.reorderEffects === 'function', 'reorderEffects exists');
assert(typeof TrackEffectManager.prototype.setEffectEnabled === 'function', 'setEffectEnabled exists');
assert(typeof TrackEffectManager.prototype.setEffectParameter === 'function', 'setEffectParameter exists');
assert(typeof TrackEffectManager.prototype.getEffects === 'function', 'getEffects exists');
assert(typeof TrackEffectManager.prototype.clearEffects === 'function', 'clearEffects exists');

// ═══════════════════════════════════════
// 4. Automation — Interpolation Functions
// ═══════════════════════════════════════
console.log('\n📈 4. Automation Interpolation');

import {
  interpolateValue,
  getAutomationValueAtBeat,
  sampleAutomationCurve,
} from './src/core/automation/interpolation';
import type { AutomationPoint, AutomationLane, InterpolationMode } from './src/core/models/automation';

// Linear interpolation
const p1: AutomationPoint = { id: '1', beat: 0, value: 0, interpolation: 'linear' };
const p2: AutomationPoint = { id: '2', beat: 4, value: 1, interpolation: 'linear' };
assert(interpolateValue(p1, p2, 0) === 0, 'Linear interp at start = 0');
assert(interpolateValue(p1, p2, 4) === 1, 'Linear interp at end = 1');
assert(interpolateValue(p1, p2, 2) === 0.5, 'Linear interp midpoint = 0.5');
assert(interpolateValue(p1, p2, 1) === 0.25, 'Linear interp quarter = 0.25');

// Step interpolation
const p3: AutomationPoint = { id: '3', beat: 0, value: 10, interpolation: 'step' };
const p4: AutomationPoint = { id: '4', beat: 4, value: 20, interpolation: 'linear' };
assert(interpolateValue(p3, p4, 0) === 10, 'Step holds at from value');
assert(interpolateValue(p3, p4, 2) === 10, 'Step holds at midpoint');
assert(interpolateValue(p3, p4, 3.99) === 10, 'Step holds just before end');

// Exponential interpolation
const p5: AutomationPoint = { id: '5', beat: 0, value: 1, interpolation: 'exponential' };
const p6: AutomationPoint = { id: '6', beat: 4, value: 4, interpolation: 'linear' };
const expMid = interpolateValue(p5, p6, 2);
assert(expMid > 1 && expMid < 4, `Exponential midpoint (${expMid.toFixed(3)}) between 1 and 4`);
assert(expMid !== 2.5, 'Exponential midpoint differs from linear');

// getAutomationValueAtBeat
assert(getAutomationValueAtBeat([], 5) === null, 'No points → null');
assert(getAutomationValueAtBeat([p1], 5) === 0, 'Single point → that value');
assert(getAutomationValueAtBeat([p1, p2], -1) === 0, 'Before first → first value');
assert(getAutomationValueAtBeat([p1, p2], 10) === 1, 'After last → last value');
assert(getAutomationValueAtBeat([p1, p2], 2) === 0.5, 'Between points → interpolated');

// sampleAutomationCurve
const samples = sampleAutomationCurve([p1, p2], 0, 4, 5);
assert(samples.length === 5, 'sampleAutomationCurve returns correct count');
assert(samples[0].beat === 0 && samples[0].value === 0, 'First sample at start');
assert(samples[4].beat === 4 && samples[4].value === 1, 'Last sample at end');
assert(Math.abs(samples[2].beat - 2) < 0.01 && Math.abs(samples[2].value - 0.5) < 0.01, 'Mid sample correct');

// Empty points
const emptySamples = sampleAutomationCurve([], 0, 4, 5);
assert(emptySamples.length === 0, 'Empty points → empty samples');

// ═══════════════════════════════════════
// 5. Automation Engine
// ═══════════════════════════════════════
console.log('\n🤖 5. Automation Engine');

import { AutomationEngine } from './src/core/automation/automation-engine';

assert(typeof AutomationEngine === 'function', 'AutomationEngine class exists');
// Can't instantiate without AudioEngine, but verify the API shape
assert(typeof AutomationEngine.prototype.scheduleRange === 'undefined',
  'scheduleRange is instance property (arrow function)');

// ═══════════════════════════════════════
// 6. Session Models
// ═══════════════════════════════════════
console.log('\n🎬 6. Session Models');

import { createDefaultSessionView } from './src/core/models/session';
import type { SessionClipSlot, Scene, SessionView, ClipLaunchState, LaunchQuantize } from './src/core/models/session';

const defaultSession = createDefaultSessionView();
assert(defaultSession.scenes.length === 8, 'Default session has 8 scenes');
assert(defaultSession.clipSlots.length === 0, 'Default session has no clip slots');
assert(defaultSession.numScenes === 8, 'numScenes = 8');
assert(defaultSession.scenes[0].name === 'Scene 1', 'First scene named Scene 1');
assert(defaultSession.scenes[7].name === 'Scene 8', 'Last scene named Scene 8');
assert(defaultSession.scenes[0].index === 0, 'First scene index = 0');
assert(defaultSession.scenes[7].index === 7, 'Last scene index = 7');

// Verify scene IDs are unique
const sceneIds = new Set(defaultSession.scenes.map((s) => s.id));
assert(sceneIds.size === 8, 'All scene IDs are unique');

// ═══════════════════════════════════════
// 7. Session Engine
// ═══════════════════════════════════════
console.log('\n🚀 7. Session Engine');

import { SessionEngine } from './src/core/session/session-engine';

const se = new SessionEngine();
assert(typeof se.launchClip === 'function', 'launchClip exists');
assert(typeof se.stopClip === 'function', 'stopClip exists');
assert(typeof se.launchScene === 'function', 'launchScene exists');
assert(typeof se.stopAll === 'function', 'stopAll exists');
assert(typeof se.scheduleRange === 'function', 'scheduleRange exists');
assert(typeof se.getPlayingSlots === 'function', 'getPlayingSlots exists');
assert(typeof se.isSlotPlaying === 'function', 'isSlotPlaying exists');
assert(typeof se.setOnStateChange === 'function', 'setOnStateChange exists');
assert(typeof se.setBeatsPerBar === 'function', 'setBeatsPerBar exists');

// Test clip launch/stop lifecycle
const stateChanges: { slotId: string; state: ClipLaunchState }[] = [];
se.setOnStateChange((slotId, state) => {
  stateChanges.push({ slotId, state });
});

// Immediate launch (quantize=none)
se.launchClip('slot-1', 'track-1', 'none', 0);
assert(se.isSlotPlaying('slot-1'), 'slot-1 is playing after launch');
assert(stateChanges.length === 1, 'One state change after launch');
assert(stateChanges[0].state === 'playing', 'State is playing');

// Queue another clip on same track (quantize=bar at beat 0 → ceil to 4)
se.launchClip('slot-2', 'track-1', 'bar', 0.5);
// slot-1 should be queued for stop, slot-2 queued for launch
assert(stateChanges.some((c) => c.slotId === 'slot-2' && c.state === 'queued'), 'slot-2 is queued');

// Process schedule range that includes the target beat (bar = beat 4)
se.scheduleRange(3, 5, () => 0);
assert(se.isSlotPlaying('slot-2'), 'slot-2 is now playing after schedule');
assert(!se.isSlotPlaying('slot-1'), 'slot-1 is stopped after schedule');

// Stop all
se.stopAll();
assert(se.getPlayingSlots().size === 0, 'No playing slots after stopAll');

// Test quantization: beat quantize
stateChanges.length = 0;
const se2 = new SessionEngine();
se2.setOnStateChange((slotId, state) => { stateChanges.push({ slotId, state }); });
se2.launchClip('slot-3', 'track-2', 'beat', 2.5);
assert(stateChanges.some((c) => c.slotId === 'slot-3' && c.state === 'queued'), 'beat quantize queues at 2.5');
se2.scheduleRange(2, 4, () => 0);
assert(se2.isSlotPlaying('slot-3'), 'slot-3 plays after beat quantize schedule');

// ═══════════════════════════════════════
// 8. Send Model
// ═══════════════════════════════════════
console.log('\n📤 8. Send Model');

import type { Send } from './src/core/models/send';

const testSend: Send = {
  id: 'send-1',
  targetBusId: 'bus-1',
  gain: -6,
  preFader: false,
  enabled: true,
};
assert(testSend.id === 'send-1', 'Send has id');
assert(testSend.targetBusId === 'bus-1', 'Send has targetBusId');
assert(testSend.gain === -6, 'Send has gain');
assert(testSend.preFader === false, 'Send is post-fader');
assert(testSend.enabled === true, 'Send is enabled');

// ═══════════════════════════════════════
// 9. Project Store — Effect CRUD
// ═══════════════════════════════════════
console.log('\n🏪 9. Project Store — Effect CRUD');

import { useProjectStore } from './src/stores/project-store';
import type { Track } from './src/core/models';

// Create a track with effects
const effectTrack: Track = {
  id: 'fx-track-1',
  name: 'FX Track',
  type: 'audio',
  color: 'red',
  volume: 0,
  pan: 0,
  muted: false,
  soloed: false,
  armed: false,
  height: 64,
  clips: [],
  effects: [],
  automationLanes: [],
  input: { type: 'audio' },
  output: { type: 'master' },
};

useProjectStore.getState().addTrack(effectTrack);
const getTrack = () => useProjectStore.getState().project.tracks.find((t) => t.id === 'fx-track-1')!;
assert(getTrack() !== undefined, 'FX track added');

// Add effect
const testEffect: EffectInstance = {
  id: 'effect-1',
  type: 'compressor-vca',
  name: 'VCA Compressor',
  enabled: true,
  parameters: [
    { id: 'threshold', name: 'threshold', value: -20, min: -60, max: 0, step: 0.1, unit: 'dB' },
    { id: 'ratio', name: 'ratio', value: 4, min: 1, max: 20, step: 0.1, unit: ':1' },
  ],
  presets: [],
};

useProjectStore.getState().addEffect('fx-track-1', testEffect);
assert(getTrack().effects.length === 1, 'addEffect adds one effect');
assert(getTrack().effects[0].type === 'compressor-vca', 'Effect type is compressor-vca');

// Add second effect
const testEffect2: EffectInstance = {
  id: 'effect-2',
  type: 'reverb-algorithmic',
  name: 'Algorithmic Reverb',
  enabled: true,
  parameters: [],
  presets: [],
};
useProjectStore.getState().addEffect('fx-track-1', testEffect2);
assert(getTrack().effects.length === 2, 'addEffect adds second effect');

// Update effect
useProjectStore.getState().updateEffect('fx-track-1', 'effect-1', { enabled: false });
assert(getTrack().effects[0].enabled === false, 'updateEffect disables effect');

// Update effect parameter
useProjectStore.getState().updateEffectParameter('fx-track-1', 'effect-1', 'threshold', -10);
assert(getTrack().effects[0].parameters[0].value === -10, 'updateEffectParameter changes threshold');

// Reorder effects
useProjectStore.getState().reorderEffects('fx-track-1', ['effect-2', 'effect-1']);
assert(getTrack().effects[0].id === 'effect-2', 'reorderEffects: reverb first');
assert(getTrack().effects[1].id === 'effect-1', 'reorderEffects: compressor second');

// Remove effect
useProjectStore.getState().removeEffect('fx-track-1', 'effect-2');
assert(getTrack().effects.length === 1, 'removeEffect removes one');
assert(getTrack().effects[0].id === 'effect-1', 'Remaining effect is compressor');

// ═══════════════════════════════════════
// 10. Project Store — Automation CRUD
// ═══════════════════════════════════════
console.log('\n🏪 10. Project Store — Automation CRUD');

// Add automation lane
const volLane: AutomationLane = {
  id: 'lane-vol',
  parameter: 'volume',
  targetId: 'fx-track-1',
  points: [],
  enabled: true,
};

useProjectStore.getState().addAutomationLane('fx-track-1', volLane);
assert(getTrack().automationLanes.length === 1, 'addAutomationLane adds lane');
assert(getTrack().automationLanes[0].parameter === 'volume', 'Lane parameter is volume');

// Add automation points
const autoPoint1: AutomationPoint = { id: 'ap-1', beat: 0, value: -6, interpolation: 'linear' };
const autoPoint2: AutomationPoint = { id: 'ap-2', beat: 4, value: 0, interpolation: 'linear' };
useProjectStore.getState().addAutomationPoint('fx-track-1', 'lane-vol', autoPoint1);
useProjectStore.getState().addAutomationPoint('fx-track-1', 'lane-vol', autoPoint2);

const getLane = () => getTrack().automationLanes[0];
assert(getLane().points.length === 2, 'Two automation points added');
assert(getLane().points[0].value === -6, 'First point value = -6');
assert(getLane().points[1].value === 0, 'Second point value = 0');

// Points are auto-sorted by beat
const autoPoint3: AutomationPoint = { id: 'ap-3', beat: 2, value: -3, interpolation: 'exponential' };
useProjectStore.getState().addAutomationPoint('fx-track-1', 'lane-vol', autoPoint3);
assert(getLane().points.length === 3, 'Three points after insert');
assert(getLane().points[1].id === 'ap-3', 'Middle point is the newly inserted one (sorted by beat)');

// Update automation point
useProjectStore.getState().updateAutomationPoint('fx-track-1', 'lane-vol', 'ap-3', { value: -2 });
assert(getLane().points.find((p) => p.id === 'ap-3')!.value === -2, 'updateAutomationPoint changes value');

// Remove automation point
useProjectStore.getState().removeAutomationPoint('fx-track-1', 'lane-vol', 'ap-3');
assert(getLane().points.length === 2, 'removeAutomationPoint removes one');

// Remove automation lane
useProjectStore.getState().removeAutomationLane('fx-track-1', 'lane-vol');
assert(getTrack().automationLanes.length === 0, 'removeAutomationLane removes lane');

// ═══════════════════════════════════════
// 11. Project Store — Send CRUD
// ═══════════════════════════════════════
console.log('\n🏪 11. Project Store — Send CRUD');

const busTrack: Track = {
  id: 'bus-1',
  name: 'Reverb Bus',
  type: 'bus',
  color: 'purple',
  volume: 0,
  pan: 0,
  muted: false,
  soloed: false,
  armed: false,
  height: 64,
  clips: [],
  effects: [],
  automationLanes: [],
  input: { type: 'audio' },
  output: { type: 'master' },
};
useProjectStore.getState().addTrack(busTrack);

// Add send
const send1: Send = { id: 'send-1', targetBusId: 'bus-1', gain: -6, preFader: false, enabled: true };
useProjectStore.getState().addSend('fx-track-1', send1);
assert((getTrack().sends ?? []).length === 1, 'addSend adds one send');
assert((getTrack().sends ?? [])[0].targetBusId === 'bus-1', 'Send targets bus-1');

// Update send
useProjectStore.getState().updateSend('fx-track-1', 'send-1', { gain: -3, preFader: true });
assert((getTrack().sends ?? [])[0].gain === -3, 'updateSend changes gain');
assert((getTrack().sends ?? [])[0].preFader === true, 'updateSend changes preFader');

// Set track output
useProjectStore.getState().setTrackOutput('fx-track-1', { type: 'bus', busId: 'bus-1' });
assert(getTrack().output.type === 'bus', 'setTrackOutput changes to bus');

// Remove send
useProjectStore.getState().removeSend('fx-track-1', 'send-1');
assert((getTrack().sends ?? []).length === 0, 'removeSend removes send');

// Clean up
useProjectStore.getState().removeTrack('fx-track-1');
useProjectStore.getState().removeTrack('bus-1');

// ═══════════════════════════════════════
// 12. Session Store
// ═══════════════════════════════════════
console.log('\n🎬 12. Session Store');

import { useSessionStore } from './src/stores/session-store';

const ss = useSessionStore.getState();
assert(ss.scenes.length === 8, 'Session store starts with 8 scenes');
assert(ss.clipSlots.length === 0, 'Session store starts with no slots');
assert(ss.globalQuantize === 'bar', 'Default quantize is bar');

// Add scene
ss.addScene();
assert(useSessionStore.getState().scenes.length === 9, 'addScene adds one');
assert(useSessionStore.getState().scenes[8].name === 'Scene 9', 'New scene named Scene 9');

// Ensure slots for tracks
useSessionStore.getState().ensureSlotsForTracks(['t1', 't2']);
const slots = useSessionStore.getState().clipSlots;
assert(slots.length > 0, 'ensureSlotsForTracks creates slots');
const t1Slots = slots.filter((s) => s.trackId === 't1');
const t2Slots = slots.filter((s) => s.trackId === 't2');
assert(t1Slots.length === 9, 'Track t1 has 9 slots (one per scene)');
assert(t2Slots.length === 9, 'Track t2 has 9 slots (one per scene)');

// All slots start stopped
assert(slots.every((s) => s.launchState === 'stopped'), 'All slots start stopped');
assert(slots.every((s) => s.clip === null), 'All slots start empty');

// Set slot state
const firstSlot = slots[0];
useSessionStore.getState().setSlotState(firstSlot.id, 'playing');
assert(useSessionStore.getState().clipSlots.find((s) => s.id === firstSlot.id)!.launchState === 'playing',
  'setSlotState changes state');

// Set global quantize
useSessionStore.getState().setGlobalQuantize('beat');
assert(useSessionStore.getState().globalQuantize === 'beat', 'setGlobalQuantize works');

// ═══════════════════════════════════════
// 13. UI Store — Phase 2 Additions
// ═══════════════════════════════════════
console.log('\n🖥️  13. UI Store — Phase 2');

import { useUIStore } from './src/stores/ui-store';

const uiState = useUIStore.getState();
assert(uiState.activeView === 'timeline', 'Default view is timeline');
assert(Object.keys(uiState.automationVisibility).length === 0, 'No automation lanes visible initially');

// Toggle view
uiState.setActiveView('session');
assert(useUIStore.getState().activeView === 'session', 'setActiveView to session');
useUIStore.getState().setActiveView('timeline');
assert(useUIStore.getState().activeView === 'timeline', 'setActiveView back to timeline');

// Toggle automation lane visibility
useUIStore.getState().toggleAutomationLane('track-1');
assert(useUIStore.getState().automationVisibility['track-1'] === true, 'toggleAutomationLane shows');
useUIStore.getState().toggleAutomationLane('track-1');
assert(useUIStore.getState().automationVisibility['track-1'] === false, 'toggleAutomationLane hides');

// ═══════════════════════════════════════
// 14. Routing Engine
// ═══════════════════════════════════════
console.log('\n🔀 14. Routing Engine');

import { RoutingEngine } from './src/core/audio/routing-engine';
assert(typeof RoutingEngine === 'function', 'RoutingEngine class exists');
assert(typeof RoutingEngine.prototype.updateSend === 'function', 'updateSend exists');
assert(typeof RoutingEngine.prototype.removeSend === 'function', 'removeSend exists');
assert(typeof RoutingEngine.prototype.routeTrackOutput === 'function', 'routeTrackOutput exists');

// ═══════════════════════════════════════
// 15. VST3 Models & Service
// ═══════════════════════════════════════
console.log('\n🔌 15. VST3 Models & Service');

import { VST3Effect } from './src/core/effects/vst3-effect';
assert(typeof VST3Effect === 'function', 'VST3Effect class exists');
assert(typeof VST3Effect.prototype.setPluginInstanceId === 'function', 'setPluginInstanceId exists');
assert(typeof VST3Effect.prototype.updateParametersFromHost === 'function', 'updateParametersFromHost exists');
assert(typeof VST3Effect.prototype.setParameter === 'function', 'setParameter exists');
assert(typeof VST3Effect.prototype.getParameters === 'function', 'getParameters exists');
assert(typeof VST3Effect.prototype.connect === 'function', 'connect exists');
assert(typeof VST3Effect.prototype.disconnect === 'function', 'disconnect exists');
assert(typeof VST3Effect.prototype.dispose === 'function', 'dispose exists');

import { PluginHostService } from './electron/services/plugin-host-service';
assert(typeof PluginHostService === 'function', 'PluginHostService class exists');
const phs = new PluginHostService();
assert(typeof phs.initialize === 'function', 'initialize exists');
assert(typeof phs.scanPlugins === 'function', 'scanPlugins exists');
assert(typeof phs.loadPlugin === 'function', 'loadPlugin exists');
assert(typeof phs.unloadPlugin === 'function', 'unloadPlugin exists');
assert(typeof phs.getParameters === 'function', 'getParameters exists');
assert(typeof phs.setParameter === 'function', 'setParameter exists');
assert(typeof phs.processAudio === 'function', 'processAudio exists');
assert(typeof phs.getState === 'function', 'getState exists');
assert(typeof phs.setState === 'function', 'setState exists');
assert(typeof phs.getScannedPlugins === 'function', 'getScannedPlugins exists');

// Without native module, services return gracefully
assert(phs.scanPlugins().length === 0, 'scanPlugins returns empty without native');
assert(phs.loadPlugin('/path') === null, 'loadPlugin returns null without native');
assert(phs.getParameters('x').length === 0, 'getParameters returns empty without native');
assert(phs.getState('x') === '', 'getState returns empty without native');
assert(phs.getScannedPlugins().length === 0, 'getScannedPlugins returns empty cache');

// ═══════════════════════════════════════
// 16. Module Barrel Exports
// ═══════════════════════════════════════
console.log('\n📦 16. Module Exports');

import * as EffectsExports from './src/core/effects/index';
assert('BaseEffect' in EffectsExports, 'BaseEffect exported from effects/index');
assert('createEffect' in EffectsExports, 'createEffect exported');
assert('ALL_EFFECT_TYPES' in EffectsExports, 'ALL_EFFECT_TYPES exported');
assert('EFFECT_LABELS' in EffectsExports, 'EFFECT_LABELS exported');
assert('EFFECT_CATEGORIES' in EffectsExports, 'EFFECT_CATEGORIES exported');
assert('TrackEffectManager' in EffectsExports, 'TrackEffectManager exported');

import * as AutomationExports from './src/core/automation/index';
assert('AutomationEngine' in AutomationExports, 'AutomationEngine exported from automation/index');
assert('interpolateValue' in AutomationExports, 'interpolateValue exported');
assert('getAutomationValueAtBeat' in AutomationExports, 'getAutomationValueAtBeat exported');
assert('sampleAutomationCurve' in AutomationExports, 'sampleAutomationCurve exported');

import * as AudioExports from './src/core/audio/index';
assert('RoutingEngine' in AudioExports, 'RoutingEngine exported from audio/index');

import * as ModelExports from './src/core/models/index';
assert('createDefaultSessionView' in ModelExports, 'createDefaultSessionView exported from models/index');

// ═══════════════════════════════════════
// 17. Project Persistence — Phase 2 Data
// ═══════════════════════════════════════
console.log('\n💾 17. Project Persistence — Phase 2 Data');

import { createDefaultProject } from './src/core/models/project';

const proj = createDefaultProject();
assert(proj.sessionView !== undefined, 'Default project has sessionView');
assert(proj.sessionView!.scenes.length === 8, 'Default project has 8 scenes');
assert(proj.sessionView!.clipSlots.length === 0, 'Default project has no clip slots');

// Simulate a full Phase 2 project and serialize/deserialize
const fullProject = createDefaultProject();
fullProject.tracks = [{
  id: 'p2-track',
  name: 'Phase 2 Track',
  type: 'audio',
  color: 'green',
  volume: 0,
  pan: 0,
  muted: false,
  soloed: false,
  armed: false,
  height: 64,
  clips: [],
  effects: [{
    id: 'fx-1',
    type: 'compressor-vca',
    name: 'VCA Compressor',
    enabled: true,
    parameters: [{ id: 'th', name: 'threshold', value: -20, min: -60, max: 0, step: 0.1, unit: 'dB' }],
    presets: [],
  }],
  automationLanes: [{
    id: 'al-1',
    parameter: 'volume',
    targetId: 'p2-track',
    points: [
      { id: 'p1', beat: 0, value: -6, interpolation: 'linear' as InterpolationMode },
      { id: 'p2', beat: 4, value: 0, interpolation: 'linear' as InterpolationMode },
    ],
    enabled: true,
  }],
  input: { type: 'audio' },
  output: { type: 'master' },
  sends: [{ id: 's1', targetBusId: 'bus-1', gain: -6, preFader: false, enabled: true }],
}];

const json = JSON.stringify(fullProject);
const restored = JSON.parse(json);
assert(restored.tracks[0].effects.length === 1, 'Effects survive serialization');
assert(restored.tracks[0].automationLanes.length === 1, 'Automation lanes survive serialization');
assert(restored.tracks[0].automationLanes[0].points.length === 2, 'Automation points survive serialization');
assert(restored.tracks[0].sends.length === 1, 'Sends survive serialization');
assert(restored.sessionView.scenes.length === 8, 'Session view survives serialization');

// ═══════════════════════════════════════
// Summary
// ═══════════════════════════════════════
console.log('\n' + '═'.repeat(50));
console.log(`  PHASE 2 RESULTS: ${passed} passed, ${failed} failed`);
console.log('═'.repeat(50));
process.exit(failed > 0 ? 1 : 0);
