#!/usr/bin/env node
/**
 * Rach DAW MCP Server
 *
 * Exposes the Rach DAW as 15 MCP tools so Ravel's music agents can
 * compose, arrange, and mix directly inside the DAW.
 *
 * Usage: npx tsx mcp-server/index.ts [--project-dir <path>]
 */

import * as os from 'os';
import * as path from 'path';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

import { ProjectState, generateChordProgression, analyzeMix, detectKeyFromNotes } from './state';
import { listTemplates, loadTemplate } from './templates';

// ── CLI args ─────────────────────────────────────────────────────────

const args = process.argv.slice(2);
let projectDir = path.join(os.homedir(), '.rach', 'projects');
const dirIdx = args.indexOf('--project-dir');
if (dirIdx !== -1 && args[dirIdx + 1]) {
  projectDir = args[dirIdx + 1];
}

// ── State & Server ───────────────────────────────────────────────────

const state = new ProjectState(projectDir);
const server = new McpServer({
  name: 'rach-daw',
  version: '0.1.0',
  capabilities: { tools: {} },
});

// Helper: return text content
function text(msg: string) {
  return { content: [{ type: 'text' as const, text: msg }] };
}

// Helper: return JSON content
function json(data: unknown) {
  return { content: [{ type: 'text' as const, text: JSON.stringify(data, null, 2) }] };
}

// ── Tool Definitions (15 total) ──────────────────────────────────────

// 1. get_project
server.tool(
  'get_project',
  'Returns the full DAW project state as JSON (tracks, clips, MIDI notes, effects, sections, tempo, time signature)',
  {},
  async () => json(state.getProject()),
);

// 2. set_tempo
server.tool(
  'set_tempo',
  'Set the project tempo in BPM',
  { tempo: z.number().min(20).max(300).describe('Tempo in BPM (20-300)') },
  async ({ tempo }) => {
    state.setTempo(tempo);
    state.save();
    return text(`Tempo set to ${tempo} BPM`);
  },
);

// 3. set_time_signature
server.tool(
  'set_time_signature',
  'Set the project time signature',
  {
    numerator: z.number().int().min(1).max(16).describe('Beats per bar (1-16)'),
    denominator: z.number().int().refine(v => [2, 4, 8, 16].includes(v), 'Must be 2, 4, 8, or 16').describe('Beat unit'),
  },
  async ({ numerator, denominator }) => {
    state.setTimeSignature(numerator, denominator);
    state.save();
    return text(`Time signature set to ${numerator}/${denominator}`);
  },
);

// 4. list_templates
server.tool(
  'list_templates',
  'List available genre templates. Rach has 54+ templates across 14 genres (pop, rock, jazz, edm, hip-hop, classical, ambient, cinematic, lo-fi, r-and-b, soul, metal, reggae, other). Filter by category or search query.',
  {
    category: z.string().optional().describe('Filter by genre category (e.g. "jazz", "edm", "cinematic")'),
    query: z.string().optional().describe('Search by name, description, or tag'),
  },
  async ({ category, query }) => {
    const results = listTemplates(category, query);
    return json({ count: results.length, templates: results });
  },
);

// 5. load_template
server.tool(
  'load_template',
  'Load a genre template as the active project. Replaces the current project with the template (pre-configured tracks, instruments, effects, and MIDI patterns).',
  { templateId: z.string().describe('Template ID from list_templates') },
  async ({ templateId }) => {
    const template = loadTemplate(templateId);
    if (!template) return text(`Template not found: ${templateId}`);
    // Deep clone to avoid mutating the original template
    const project = JSON.parse(JSON.stringify(template.project));
    project.id = crypto.randomUUID();
    project.metadata.createdAt = new Date().toISOString();
    project.metadata.modifiedAt = new Date().toISOString();
    state.setProject(project);
    state.save();
    return text(`Loaded template "${template.metadata.name}" — ${project.tracks.length} tracks, ${project.tempo} BPM`);
  },
);

// 6. create_track
const synthTypes = ['rach-pad', 'subtractive', 'wavetable', 'fm', 'granular', 'pluck', 'organ'] as const;
const trackColors = ['red', 'orange', 'yellow', 'green', 'cyan', 'blue', 'purple', 'pink'] as const;

server.tool(
  'create_track',
  'Create a new track in the project. For MIDI composition, use type "instrument" with an instrumentType.',
  {
    name: z.string().describe('Track name (e.g. "Piano", "Bass", "Drums")'),
    type: z.enum(['audio', 'midi', 'instrument', 'bus']).describe('Track type'),
    instrumentType: z.enum(synthTypes).optional().describe('Built-in synth: rach-pad (warm pad), subtractive, wavetable, fm, granular, pluck, organ'),
    color: z.enum(trackColors).optional().describe('Track color'),
  },
  async ({ name, type, instrumentType, color }) => {
    const track = state.addTrack({ name, type, instrumentType, color });
    state.save();
    return json({ trackId: track.id, name: track.name, type: track.type, instrumentType: track.instrumentType });
  },
);

// 7. list_tracks
server.tool(
  'list_tracks',
  'List all tracks with their current state (volume, pan, effects, clip count)',
  {},
  async () => {
    const tracks = state.getProject().tracks.map((t, i) => ({
      index: i + 1,
      id: t.id,
      name: t.name,
      type: t.type,
      instrumentType: t.instrumentType,
      volume: t.volume,
      pan: t.pan,
      muted: t.muted,
      effectCount: t.effects.length,
      clipCount: t.clips.length,
      noteCount: t.clips.reduce((sum, c) => sum + (c.midiData?.notes.length || 0), 0),
    }));
    return json(tracks);
  },
);

// 8. add_midi_notes
server.tool(
  'add_midi_notes',
  'Add MIDI notes to a track. Auto-creates a clip if none exists. Pitches are MIDI numbers (60 = C4). Use generate_chord_progression to get chord pitches.',
  {
    trackId: z.string().describe('Track ID, name, or 1-based index'),
    notes: z.array(z.object({
      pitch: z.number().int().min(0).max(127).describe('MIDI pitch (60=C4, 64=E4, 67=G4)'),
      velocity: z.number().int().min(1).max(127).describe('Note velocity (1-127)'),
      startBeat: z.number().min(0).describe('Start position in beats'),
      durationBeats: z.number().min(0.0625).describe('Note length in beats (1=quarter, 0.5=eighth)'),
    })).describe('Array of MIDI notes'),
    clipName: z.string().optional().describe('Name for the auto-created clip'),
    startBeat: z.number().optional().describe('Clip start position (default: 0)'),
  },
  async ({ trackId, notes, clipName, startBeat }) => {
    const result = state.addMidiNotes(trackId, notes, clipName, startBeat);
    if (!result) return text(`Track not found: ${trackId}`);
    state.save();
    return text(`Added ${result.noteCount} notes to clip ${result.clipId}`);
  },
);

// 9. create_clip
server.tool(
  'create_clip',
  'Create an empty MIDI clip on a track',
  {
    trackId: z.string().describe('Track ID, name, or 1-based index'),
    name: z.string().describe('Clip name'),
    startBeat: z.number().min(0).describe('Start position in beats'),
    durationBeats: z.number().min(0.25).describe('Clip length in beats'),
  },
  async ({ trackId, name, startBeat, durationBeats }) => {
    const clip = state.createClip(trackId, name, startBeat, durationBeats);
    if (!clip) return text(`Track not found: ${trackId}`);
    state.save();
    return json({ clipId: clip.id, name: clip.name, startBeat: clip.startBeat, durationBeats: clip.durationBeats });
  },
);

// 10. set_track_volume
server.tool(
  'set_track_volume',
  'Set track volume in dB (-60 to +6). 0 dB = unity gain.',
  {
    trackId: z.string().describe('Track ID, name, or 1-based index'),
    volume: z.number().min(-60).max(6).describe('Volume in dB'),
  },
  async ({ trackId, volume }) => {
    if (!state.setTrackVolume(trackId, volume)) return text(`Track not found: ${trackId}`);
    state.save();
    return text(`Track volume set to ${volume} dB`);
  },
);

// 11. set_track_pan
server.tool(
  'set_track_pan',
  'Set track pan position (-1 = full left, 0 = center, +1 = full right)',
  {
    trackId: z.string().describe('Track ID, name, or 1-based index'),
    pan: z.number().min(-1).max(1).describe('Pan position'),
  },
  async ({ trackId, pan }) => {
    if (!state.setTrackPan(trackId, pan)) return text(`Track not found: ${trackId}`);
    state.save();
    const label = pan === 0 ? 'center' : pan < 0 ? `${Math.abs(pan * 100).toFixed(0)}% left` : `${(pan * 100).toFixed(0)}% right`;
    return text(`Track pan set to ${label}`);
  },
);

// 12. add_effect
const effectTypes = [
  'parametric-eq', 'graphic-eq', 'highlow-pass', 'formant-filter',
  'compressor-vca', 'compressor-fet', 'compressor-optical', 'gate-expander',
  'multiband-compressor', 'transient-shaper',
  'reverb-algorithmic', 'reverb-convolution',
  'delay-pingpong', 'delay-tape', 'delay-analog',
  'flanger', 'phaser', 'chorus', 'distortion',
  'vocoder', 'pitch-shifter', 'auto-pan', 'spectral-processing',
] as const;

server.tool(
  'add_effect',
  'Add an audio effect to a track\'s effect chain. Available: parametric-eq, compressor-vca, compressor-fet, compressor-optical, reverb-algorithmic, reverb-convolution, delay-pingpong, delay-tape, delay-analog, chorus, distortion, flanger, phaser, vocoder, pitch-shifter, auto-pan, and more.',
  {
    trackId: z.string().describe('Track ID, name, or 1-based index'),
    effectType: z.enum(effectTypes).describe('Effect type'),
    params: z.record(z.number()).optional().describe('Effect parameters as key-value pairs'),
  },
  async ({ trackId, effectType, params }) => {
    const effect = state.addEffect(trackId, effectType, params);
    if (!effect) return text(`Track not found: ${trackId}`);
    state.save();
    return json({ effectId: effect.id, type: effect.type, name: effect.name });
  },
);

// 13. create_section
server.tool(
  'create_section',
  'Create an arrangement section marker (e.g. Intro, Verse, Chorus, Bridge, Outro)',
  {
    name: z.string().describe('Section name (e.g. "Intro", "Verse 1", "Chorus")'),
    startBeat: z.number().min(0).describe('Start position in beats'),
    durationBeats: z.number().min(1).describe('Section length in beats'),
    color: z.string().optional().describe('Section color as hex (e.g. "#3b82f6")'),
  },
  async ({ name, startBeat, durationBeats, color }) => {
    const section = state.addSection(name, startBeat, durationBeats, color);
    state.save();
    return json({ sectionId: section.id, name: section.name, startBeat: section.startBeat, durationBeats: section.durationBeats });
  },
);

// 14. analyze_mix
server.tool(
  'analyze_mix',
  'Analyze the current project mix: level balance, stereo image, effects usage, and recommendations',
  {
    includeRecommendations: z.boolean().optional().describe('Include mixing recommendations (default: true)'),
  },
  async ({ includeRecommendations }) => {
    return text(analyzeMix(state.getProject(), includeRecommendations ?? true));
  },
);

// 15. generate_chord_progression
server.tool(
  'generate_chord_progression',
  'Generate a chord progression with MIDI pitches. Returns chord names and MIDI note numbers ready for add_midi_notes.',
  {
    key: z.string().describe('Key (e.g. "C major", "A minor", "F# minor")'),
    numBars: z.number().int().min(1).max(64).describe('Number of bars'),
    style: z.enum(['pop', 'jazz', 'classical', 'blues', 'rock']).optional().describe('Progression style (default: pop)'),
  },
  async ({ key, numBars, style }) => {
    const result = generateChordProgression(key, numBars, style);
    return json(result);
  },
);

// ── Start ────────────────────────────────────────────────────────────

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
