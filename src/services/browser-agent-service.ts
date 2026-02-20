/**
 * Browser-side agent service — ports the Electron claude-agent-service + tool-executor
 * to run directly in the browser using the Anthropic SDK with OAuth tokens.
 */
import Anthropic from '@anthropic-ai/sdk';

// ── Types ──────────────────────────────────────────

export type AgentType = 'mixing' | 'composition' | 'arrangement' | 'analysis';

interface AgentConfig {
  model: string;
  systemPrompt: string;
  tools: Anthropic.Tool[];
}

interface ProjectContext {
  tracks: Array<{
    id: string;
    name: string;
    type: string;
    volume: number;
    pan: number;
    muted: boolean;
    effects: Array<{ type: string; name: string; params: Record<string, number> }>;
    sends: Array<{ targetBusId: string; gain: number }>;
    clips: Array<{
      id: string;
      name: string;
      type: string;
      startBeat: number;
      durationBeats: number;
      midiNotes?: Array<{
        pitch: number;
        velocity: number;
        startBeat: number;
        durationBeats: number;
      }>;
    }>;
    frequencyData?: number[];
    peakLevel?: number;
    rmsLevel?: number;
  }>;
  tempo: number;
  timeSignature: { numerator: number; denominator: number };
  sections: Array<{ name: string; startBeat: number; durationBeats: number; color: string }>;
}

interface Mutation {
  type: string;
  [key: string]: unknown;
}

interface ToolResult {
  result: string;
  mutations: Mutation[];
}

interface ToolExecution {
  name: string;
  input: unknown;
  result: string;
}

export interface AgentResponse {
  success: boolean;
  text?: string;
  mutations?: Mutation[];
  toolExecutions?: ToolExecution[];
  error?: string;
}

// ── Agent Configs ──────────────────────────────────

const MAX_LOOP_ITERATIONS = 10;

const AGENT_CONFIGS: Record<AgentType, AgentConfig> = {
  mixing: {
    model: 'claude-opus-4-6',
    systemPrompt: `You are the Rach DAW Mixing Agent. You help users mix their audio projects.
You can adjust EQ, compression, track levels, panning, and analyze frequency spectrums.
Be concise and technical. When the user asks you to make changes, use the available tools.
When referring to tracks, use their exact track ID from the project context.`,
    tools: [
      {
        name: 'apply_eq',
        description: 'Apply EQ to a track with specified frequency bands',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            bands: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  frequency: { type: 'number', description: 'Center frequency in Hz' },
                  gain: { type: 'number', description: 'Gain in dB (-12 to +12)' },
                  q: { type: 'number', description: 'Q factor (0.1 to 10)' },
                },
                required: ['frequency', 'gain', 'q'],
              },
            },
          },
          required: ['trackId', 'bands'],
        },
      },
      {
        name: 'apply_compression',
        description: 'Apply compression to a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            threshold: { type: 'number', description: 'Threshold in dB' },
            ratio: { type: 'number', description: 'Compression ratio' },
            attack: { type: 'number', description: 'Attack time in ms' },
            release: { type: 'number', description: 'Release time in ms' },
          },
          required: ['trackId', 'threshold', 'ratio'],
        },
      },
      {
        name: 'set_track_level',
        description: 'Set the volume level of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            level: { type: 'number', description: 'Volume level in dB (-60 to +6)' },
          },
          required: ['trackId', 'level'],
        },
      },
      {
        name: 'set_track_pan',
        description: 'Set the pan position of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            pan: { type: 'number', description: 'Pan position (-1 left to +1 right)' },
          },
          required: ['trackId', 'pan'],
        },
      },
      {
        name: 'analyze_frequency_spectrum',
        description: 'Analyze the frequency spectrum of a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
          },
          required: ['trackId'],
        },
      },
    ],
  },
  composition: {
    model: 'claude-opus-4-6',
    systemPrompt: `You are the Rach DAW Composition Agent. You help users compose music.
You can generate chord progressions, create MIDI tracks, and detect musical keys/scales.
Be creative yet technically grounded. Output MIDI note data when creating musical content.
When referring to tracks, use their exact track ID from the project context.`,
    tools: [
      {
        name: 'generate_chord_progression',
        description:
          'Generate a chord progression in a given key. Returns chord analysis — use create_midi_track to write the notes to a track.',
        input_schema: {
          type: 'object' as const,
          properties: {
            key: { type: 'string', description: 'Musical key (e.g., "C major", "A minor")' },
            numBars: { type: 'number', description: 'Number of bars' },
            style: {
              type: 'string',
              description: 'Style (e.g., "pop", "jazz", "classical", "blues", "rock")',
            },
          },
          required: ['key', 'numBars'],
        },
      },
      {
        name: 'create_midi_track',
        description: 'Create MIDI notes on a track. Creates a clip if none exists at beat 0.',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Target track ID' },
            notes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  pitch: { type: 'number', description: 'MIDI pitch (0-127)' },
                  velocity: { type: 'number', description: 'Velocity (0-127)' },
                  startBeat: { type: 'number', description: 'Start position in beats' },
                  durationBeats: { type: 'number', description: 'Duration in beats' },
                },
                required: ['pitch', 'velocity', 'startBeat', 'durationBeats'],
              },
            },
          },
          required: ['trackId', 'notes'],
        },
      },
      {
        name: 'detect_key_and_scale',
        description: 'Detect the key and scale of existing MIDI content on a track',
        input_schema: {
          type: 'object' as const,
          properties: {
            trackId: { type: 'string', description: 'Track ID to analyze' },
          },
          required: ['trackId'],
        },
      },
    ],
  },
  arrangement: {
    model: 'claude-sonnet-4-6',
    systemPrompt: `You are the Rach DAW Arrangement Agent. You help users arrange songs.
You can create song sections (intro, verse, chorus, bridge, outro) and suggest arrangements.
Be practical and focused on song structure.`,
    tools: [
      {
        name: 'create_song_section',
        description: 'Create a song section marker with name, position, and duration',
        input_schema: {
          type: 'object' as const,
          properties: {
            name: { type: 'string', description: 'Section name (e.g., "Verse 1", "Chorus")' },
            startBeat: { type: 'number', description: 'Start position in beats' },
            durationBeats: { type: 'number', description: 'Duration in beats' },
            color: { type: 'string', description: 'Section color hex code' },
          },
          required: ['name', 'startBeat', 'durationBeats'],
        },
      },
    ],
  },
  analysis: {
    model: 'claude-sonnet-4-6',
    systemPrompt: `You are the Rach DAW Analysis Agent. You analyze mixes and projects.
You provide detailed feedback on levels, frequency balance, dynamics, stereo image, and effects.
Be analytical and provide actionable suggestions. Structure your response with clear sections.`,
    tools: [
      {
        name: 'analyze_project_mix',
        description:
          'Analyze the overall mix of the project including levels, panning, effects, and frequency balance',
        input_schema: {
          type: 'object' as const,
          properties: {
            includeRecommendations: {
              type: 'boolean',
              description: 'Whether to include mixing recommendations',
            },
          },
          required: [],
        },
      },
    ],
  },
};

// ── Tool Executor ──────────────────────────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteNameToMidi(name: string, octave: number): number {
  const normalized = name
    .replace('Db', 'C#')
    .replace('Eb', 'D#')
    .replace('Gb', 'F#')
    .replace('Ab', 'G#')
    .replace('Bb', 'A#');
  const idx = NOTE_NAMES.indexOf(normalized);
  if (idx === -1) return 60;
  return idx + (octave + 1) * 12;
}

function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;
  return `${note}${octave}`;
}

function eqBandParams(
  bands: Array<{ frequency: number; gain: number; q: number }>
): Record<string, number> {
  const params: Record<string, number> = {};
  bands.forEach((band, i) => {
    if (i > 7) return;
    params[`band${i}Freq`] = band.frequency;
    params[`band${i}Gain`] = band.gain;
    params[`band${i}Q`] = band.q;
  });
  return params;
}

function correlate(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0;
  let denA = 0;
  let denB = 0;
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA;
    const db = b[i] - meanB;
    num += da * db;
    denA += da * da;
    denB += db * db;
  }
  const den = Math.sqrt(denA * denB);
  return den === 0 ? 0 : num / den;
}

function detectKeyFromNotes(
  notes: Array<{ pitch: number; durationBeats: number }>
): { key: string; scale: string; confidence: number } {
  if (notes.length === 0) return { key: 'C', scale: 'major', confidence: 0 };

  const pitchClasses = new Array(12).fill(0);
  for (const note of notes) {
    pitchClasses[note.pitch % 12] += note.durationBeats;
  }

  const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.6, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

  let bestKey = 'C';
  let bestScale = 'major';
  let bestCorr = -Infinity;

  for (let root = 0; root < 12; root++) {
    const rotated = pitchClasses.slice(root).concat(pitchClasses.slice(0, root));

    const majorCorr = correlate(rotated, majorProfile);
    if (majorCorr > bestCorr) {
      bestCorr = majorCorr;
      bestKey = NOTE_NAMES[root];
      bestScale = 'major';
    }

    const minorCorr = correlate(rotated, minorProfile);
    if (minorCorr > bestCorr) {
      bestCorr = minorCorr;
      bestKey = NOTE_NAMES[root];
      bestScale = 'minor';
    }
  }

  const confidence = Math.max(0, Math.min(1, (bestCorr + 1) / 2));
  return { key: bestKey, scale: bestScale, confidence };
}

class ToolExecutor {
  execute(toolName: string, input: Record<string, unknown>, context: ProjectContext): ToolResult {
    switch (toolName) {
      case 'set_track_level':
        return this.setTrackLevel(input, context);
      case 'set_track_pan':
        return this.setTrackPan(input, context);
      case 'apply_eq':
        return this.applyEq(input, context);
      case 'apply_compression':
        return this.applyCompression(input, context);
      case 'analyze_frequency_spectrum':
        return this.analyzeFrequencySpectrum(input, context);
      case 'generate_chord_progression':
        return this.generateChordProgression(input);
      case 'create_midi_track':
        return this.createMidiTrack(input, context);
      case 'detect_key_and_scale':
        return this.detectKeyAndScale(input, context);
      case 'create_song_section':
        return this.createSongSection(input);
      case 'analyze_project_mix':
        return this.analyzeProjectMix(input, context);
      default:
        return { result: `Unknown tool: ${toolName}`, mutations: [] };
    }
  }

  private findTrack(trackId: string, context: ProjectContext) {
    const track = context.tracks.find((t) => t.id === trackId);
    if (track) return track;
    const byName = context.tracks.find((t) => t.name.toLowerCase() === trackId.toLowerCase());
    if (byName) return byName;
    const idx = parseInt(trackId, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= context.tracks.length) {
      return context.tracks[idx - 1];
    }
    return null;
  }

  private resolveTrackId(trackId: string, context: ProjectContext): string | null {
    const track = this.findTrack(trackId, context);
    return track?.id ?? null;
  }

  // ── Mixing Tools ──────────────────────────────

  private setTrackLevel(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const level = Number(input.level);
    const track = this.findTrack(input.trackId as string, context)!;
    return {
      result: `Set ${track.name} volume to ${level} dB`,
      mutations: [{ type: 'setTrackVolume', trackId, volume: level }],
    };
  }

  private setTrackPan(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const pan = Number(input.pan);
    const track = this.findTrack(input.trackId as string, context)!;
    const panLabel =
      pan === 0
        ? 'center'
        : pan < 0
          ? `${Math.abs(pan * 100).toFixed(0)}% left`
          : `${(pan * 100).toFixed(0)}% right`;
    return {
      result: `Set ${track.name} pan to ${panLabel}`,
      mutations: [{ type: 'setTrackPan', trackId, pan }],
    };
  }

  private applyEq(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const bands = input.bands as Array<{ frequency: number; gain: number; q: number }>;
    const track = this.findTrack(input.trackId as string, context)!;
    const params = eqBandParams(bands);
    const desc = bands
      .map((b) => `${b.frequency}Hz ${b.gain > 0 ? '+' : ''}${b.gain}dB Q=${b.q}`)
      .join(', ');
    return {
      result: `Applied parametric EQ to ${track.name}: ${desc}`,
      mutations: [{ type: 'addEffect', trackId, effectType: 'parametric-eq', params }],
    };
  }

  private applyCompression(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const track = this.findTrack(input.trackId as string, context)!;
    const params: Record<string, number> = {
      threshold: Number(input.threshold),
      ratio: Number(input.ratio),
    };
    if (input.attack !== undefined) params.attack = Number(input.attack) / 1000;
    if (input.release !== undefined) params.release = Number(input.release) / 1000;
    return {
      result: `Applied VCA compressor to ${track.name}: threshold ${params.threshold}dB, ratio ${params.ratio}:1`,
      mutations: [{ type: 'addEffect', trackId, effectType: 'compressor-vca', params }],
    };
  }

  private analyzeFrequencySpectrum(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const track = this.findTrack(input.trackId as string, context)!;

    if (track.frequencyData && track.frequencyData.length > 0) {
      const data = track.frequencyData;
      const bands = [
        { name: 'Sub Bass (20-60Hz)', range: [0, 3] },
        { name: 'Bass (60-250Hz)', range: [3, 12] },
        { name: 'Low Mids (250-500Hz)', range: [12, 24] },
        { name: 'Mids (500-2kHz)', range: [24, 48] },
        { name: 'Upper Mids (2-4kHz)', range: [48, 64] },
        { name: 'Presence (4-8kHz)', range: [64, 80] },
        { name: 'Brilliance (8-20kHz)', range: [80, 100] },
      ];
      const analysis = bands.map((b) => {
        const slice = data.slice(
          Math.min(b.range[0], data.length - 1),
          Math.min(b.range[1], data.length)
        );
        const avg =
          slice.length > 0 ? slice.reduce((s, v) => s + v, 0) / slice.length : -100;
        return `${b.name}: ${avg.toFixed(1)} dB`;
      });

      return {
        result: `Frequency analysis for ${track.name}:\nPeak: ${track.peakLevel?.toFixed(1) ?? 'N/A'} dB\nRMS: ${track.rmsLevel?.toFixed(1) ?? 'N/A'} dB\n\n${analysis.join('\n')}`,
        mutations: [],
      };
    }

    return {
      result: `Frequency analysis for ${track.name}: No audio data available. The track may be empty or not playing.`,
      mutations: [],
    };
  }

  // ── Composition Tools ─────────────────────────

  private generateChordProgression(input: Record<string, unknown>): ToolResult {
    const key = input.key as string;
    const numBars = Number(input.numBars);
    const style = (input.style as string) || 'pop';

    const parts = key.split(' ');
    const rootNote = parts[0] || 'C';
    const scaleType = (parts[1] || 'major').toLowerCase();

    const progressions: Record<string, number[][]> = {
      pop: [
        [0, 4, 5, 3],
        [0, 5, 3, 4],
        [5, 3, 0, 4],
      ],
      jazz: [
        [1, 4, 0, 0],
        [1, 4, 2, 5],
        [0, 5, 1, 4],
      ],
      classical: [
        [0, 3, 4, 0],
        [0, 4, 5, 4],
        [0, 1, 4, 0],
      ],
      blues: [
        [0, 0, 0, 0],
        [3, 3, 0, 0],
        [4, 3, 0, 4],
      ],
      rock: [
        [0, 3, 4, 3],
        [0, 4, 5, 4],
        [0, 5, 3, 4],
      ],
    };

    const styleProgs = progressions[style] || progressions['pop'];

    const majorScale = [0, 2, 4, 5, 7, 9, 11];
    const minorScale = [0, 2, 3, 5, 7, 8, 10];
    const scale = scaleType === 'minor' ? minorScale : majorScale;

    const majorQualities = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
    const minorQualities = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
    const qualities = scaleType === 'minor' ? minorQualities : majorQualities;

    const rootMidi = noteNameToMidi(rootNote, 4);

    const chords: Array<{ name: string; degree: number; notes: number[]; bar: number }> = [];
    for (let bar = 0; bar < numBars; bar++) {
      const progIdx = bar % styleProgs.length;
      const barProg = styleProgs[progIdx];
      const degreeIdx = barProg[bar % barProg.length] % 7;

      const chordRoot = rootMidi + scale[degreeIdx] - 12;
      const quality = qualities[degreeIdx];
      const third = quality === 'min' || quality === 'dim' ? 3 : 4;
      const fifth = quality === 'dim' ? 6 : 7;

      const chordNotes = [chordRoot, chordRoot + third, chordRoot + fifth];

      if (style === 'jazz') {
        const seventh = quality === 'maj' ? 11 : 10;
        chordNotes.push(chordRoot + seventh);
      }

      const degreeName = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0'][degreeIdx];
      const chordName = `${NOTE_NAMES[(rootMidi + scale[degreeIdx]) % 12]}${quality === 'min' ? 'm' : quality === 'dim' ? 'dim' : ''}`;

      chords.push({ name: `${degreeName} (${chordName})`, degree: degreeIdx, notes: chordNotes, bar });
    }

    const summary = chords.map((c) => `Bar ${c.bar + 1}: ${c.name}`).join('\n');
    const noteData = chords.map((c) => ({
      bar: c.bar,
      name: c.name,
      midiNotes: c.notes.map((n) => midiToNoteName(n)),
      midiPitches: c.notes,
    }));

    return {
      result: `Generated ${numBars}-bar ${style} chord progression in ${key}:\n\n${summary}\n\nMIDI data: ${JSON.stringify(noteData)}`,
      mutations: [],
    };
  }

  private createMidiTrack(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const track = this.findTrack(input.trackId as string, context)!;
    const rawNotes = input.notes as Array<{
      pitch: number;
      velocity: number;
      startBeat: number;
      durationBeats: number;
    }>;

    const notes = rawNotes.map((n) => ({
      id: crypto.randomUUID(),
      pitch: n.pitch,
      velocity: n.velocity,
      startBeat: n.startBeat,
      durationBeats: n.durationBeats,
    }));

    const existingClip = track.clips.find((c) => c.type === 'midi' && c.startBeat === 0);
    const maxBeat = Math.max(...notes.map((n) => n.startBeat + n.durationBeats), 4);

    const mutations: Mutation[] = [];

    if (existingClip) {
      mutations.push({
        type: 'addMidiNotes',
        trackId,
        clipId: existingClip.id,
        notes,
      });
    } else {
      const clipId = crypto.randomUUID();
      mutations.push({
        type: 'createClip',
        trackId,
        clip: {
          id: clipId,
          name: 'MIDI Clip',
          type: 'midi' as const,
          startBeat: 0,
          durationBeats: maxBeat,
        },
      });
      mutations.push({
        type: 'addMidiNotes',
        trackId,
        clipId,
        notes,
      });
    }

    return {
      result: `Created ${notes.length} MIDI notes on ${track.name}`,
      mutations,
    };
  }

  private detectKeyAndScale(input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context);
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] };
    const track = this.findTrack(input.trackId as string, context)!;

    const allNotes: Array<{ pitch: number; durationBeats: number }> = [];
    for (const clip of track.clips) {
      if (clip.midiNotes) {
        allNotes.push(...clip.midiNotes);
      }
    }

    if (allNotes.length === 0) {
      return {
        result: `No MIDI notes found on ${track.name}. Cannot detect key.`,
        mutations: [],
      };
    }

    const { key, scale, confidence } = detectKeyFromNotes(allNotes);
    return {
      result: `Key detection for ${track.name}: ${key} ${scale} (confidence: ${(confidence * 100).toFixed(0)}%)\nAnalyzed ${allNotes.length} notes.`,
      mutations: [],
    };
  }

  // ── Arrangement Tools ─────────────────────────

  private createSongSection(input: Record<string, unknown>): ToolResult {
    const name = input.name as string;
    const startBeat = Number(input.startBeat);
    const durationBeats = Number(input.durationBeats);
    const color = (input.color as string) || '#3b82f6';

    return {
      result: `Created section "${name}" from beat ${startBeat} to ${startBeat + durationBeats} (${durationBeats} beats)`,
      mutations: [{ type: 'createSection', name, startBeat, durationBeats, color }],
    };
  }

  // ── Analysis Tools ────────────────────────────

  private analyzeProjectMix(_input: Record<string, unknown>, context: ProjectContext): ToolResult {
    const tracks = context.tracks;
    if (tracks.length === 0) {
      return { result: 'No tracks in the project to analyze.', mutations: [] };
    }

    const lines: string[] = ['## Mix Analysis\n'];

    lines.push('### Level Balance');
    for (const track of tracks) {
      const muteStr = track.muted ? ' (MUTED)' : '';
      lines.push(`- ${track.name}: ${track.volume.toFixed(1)} dB${muteStr}`);
    }

    const hotTracks = tracks.filter((t) => t.volume > 0 && !t.muted);
    if (hotTracks.length > 0) {
      lines.push(
        `\n Warning: ${hotTracks.length} track(s) above 0 dB — risk of clipping: ${hotTracks.map((t) => t.name).join(', ')}`
      );
    }

    lines.push('\n### Stereo Image');
    const panPositions = tracks.filter((t) => !t.muted).map((t) => ({ name: t.name, pan: t.pan }));
    const leftCount = panPositions.filter((p) => p.pan < -0.3).length;
    const centerCount = panPositions.filter((p) => Math.abs(p.pan) <= 0.3).length;
    const rightCount = panPositions.filter((p) => p.pan > 0.3).length;
    lines.push(
      `Left: ${leftCount} tracks | Center: ${centerCount} tracks | Right: ${rightCount} tracks`
    );
    for (const p of panPositions) {
      const panLabel =
        p.pan === 0
          ? 'C'
          : p.pan < 0
            ? `L${Math.abs(p.pan * 100).toFixed(0)}`
            : `R${(p.pan * 100).toFixed(0)}`;
      lines.push(`- ${p.name}: ${panLabel}`);
    }

    lines.push('\n### Effects');
    for (const track of tracks) {
      if (track.effects.length > 0) {
        lines.push(
          `- ${track.name}: ${track.effects.map((e) => e.name || e.type).join(', ')}`
        );
      } else {
        lines.push(`- ${track.name}: (no effects)`);
      }
    }

    const tracksWithFreq = tracks.filter(
      (t) => t.frequencyData && t.frequencyData.length > 0
    );
    if (tracksWithFreq.length > 0) {
      lines.push('\n### Frequency Distribution');
      for (const track of tracksWithFreq) {
        lines.push(
          `- ${track.name}: Peak ${track.peakLevel?.toFixed(1) ?? '?'} dB, RMS ${track.rmsLevel?.toFixed(1) ?? '?'} dB`
        );
      }
    }

    lines.push('\n### Recommendations');
    if (hotTracks.length > 0) {
      lines.push(
        `- Reduce levels on ${hotTracks.map((t) => t.name).join(', ')} to avoid clipping`
      );
    }
    if (centerCount > tracks.length * 0.7) {
      lines.push('- Consider panning some tracks wider for a better stereo image');
    }
    const noEffectTracks = tracks.filter((t) => t.effects.length === 0 && !t.muted);
    if (noEffectTracks.length > 0 && tracks.length > 2) {
      lines.push(
        `- Consider adding EQ to ${noEffectTracks.map((t) => t.name).join(', ')} for frequency carving`
      );
    }

    return { result: lines.join('\n'), mutations: [] };
  }
}

// ── Browser Agent Service ──────────────────────────

export class BrowserAgentService {
  private conversationHistories = new Map<string, Anthropic.MessageParam[]>();
  private toolExecutor = new ToolExecutor();

  async sendMessage(
    authToken: string,
    agentType: AgentType,
    conversationId: string,
    userMessage: string,
    projectContext?: string
  ): Promise<AgentResponse> {
    try {
      const config = AGENT_CONFIGS[agentType];
      const client = new Anthropic({
        authToken,
        dangerouslyAllowBrowser: true,
      });

      let parsedContext: ProjectContext = {
        tracks: [],
        tempo: 120,
        timeSignature: { numerator: 4, denominator: 4 },
        sections: [],
      };
      if (projectContext) {
        try {
          parsedContext = JSON.parse(projectContext) as ProjectContext;
        } catch {
          // Use defaults
        }
      }

      const history = this.conversationHistories.get(conversationId) || [];
      history.push({ role: 'user', content: userMessage });

      const systemPrompt = projectContext
        ? `${config.systemPrompt}\n\nCurrent project context:\n${projectContext}`
        : config.systemPrompt;

      let accumulatedText = '';
      const allMutations: Mutation[] = [];
      const allToolExecutions: ToolExecution[] = [];

      for (let iteration = 0; iteration < MAX_LOOP_ITERATIONS; iteration++) {
        const response = await client.messages.create({
          model: config.model,
          max_tokens: 4096,
          system: systemPrompt,
          tools: config.tools,
          messages: history,
        });

        const toolUseBlocks: Anthropic.ToolUseBlock[] = [];
        for (const block of response.content) {
          if (block.type === 'text') {
            accumulatedText += block.text;
          } else if (block.type === 'tool_use') {
            toolUseBlocks.push(block);
          }
        }

        history.push({ role: 'assistant', content: response.content });

        if (response.stop_reason !== 'tool_use' || toolUseBlocks.length === 0) {
          break;
        }

        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolBlock of toolUseBlocks) {
          const toolResult = this.toolExecutor.execute(
            toolBlock.name,
            toolBlock.input as Record<string, unknown>,
            parsedContext
          );

          allMutations.push(...toolResult.mutations);
          allToolExecutions.push({
            name: toolBlock.name,
            input: toolBlock.input,
            result: toolResult.result,
          });

          toolResults.push({
            type: 'tool_result',
            tool_use_id: toolBlock.id,
            content: toolResult.result,
          });
        }

        history.push({ role: 'user', content: toolResults });
      }

      this.conversationHistories.set(conversationId, history);

      return {
        success: true,
        text: accumulatedText,
        mutations: allMutations,
        toolExecutions: allToolExecutions,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  clearConversation(conversationId: string): void {
    this.conversationHistories.delete(conversationId);
  }
}
