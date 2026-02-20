/**
 * ProjectState — In-memory project state with JSON file persistence.
 * Ports music theory helpers (chord generation, key detection, mix analysis)
 * from electron/services/tool-executor.ts for use in the MCP server.
 */

import * as fs from 'fs';
import * as path from 'path';
import { createDefaultProject, type Project } from '../src/core/models/project';
import type { Track, TrackType, TrackColor } from '../src/core/models/track';
import type { Clip } from '../src/core/models/clip';
import type { MIDINote } from '../src/core/models/midi-event';
import type { EffectType, EffectInstance, EffectParameter } from '../src/core/models/effects';
import type { Section } from '../src/core/models/section';
import type { SynthType } from '../src/core/synths/synth-interface';

// ── Music Theory Helpers (ported from tool-executor.ts) ──────────────

const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

function noteNameToMidi(name: string, octave: number): number {
  const normalized = name
    .replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#')
    .replace('Ab', 'G#').replace('Bb', 'A#');
  const idx = NOTE_NAMES.indexOf(normalized);
  if (idx === -1) return 60;
  return idx + (octave + 1) * 12;
}

function midiToNoteName(midi: number): string {
  return `${NOTE_NAMES[midi % 12]}${Math.floor(midi / 12) - 1}`;
}

function correlate(a: number[], b: number[]): number {
  const n = a.length;
  const meanA = a.reduce((s, v) => s + v, 0) / n;
  const meanB = b.reduce((s, v) => s + v, 0) / n;
  let num = 0, denA = 0, denB = 0;
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

/** Detect key from MIDI notes using Krumhansl-Kessler pitch-class profiles. */
export function detectKeyFromNotes(
  notes: Array<{ pitch: number; durationBeats: number }>
): { key: string; scale: string; confidence: number } {
  if (notes.length === 0) return { key: 'C', scale: 'major', confidence: 0 };

  const pitchClasses = new Array(12).fill(0);
  for (const note of notes) {
    pitchClasses[note.pitch % 12] += note.durationBeats;
  }

  const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

  let bestKey = 'C', bestScale = 'major', bestCorr = -Infinity;

  for (let root = 0; root < 12; root++) {
    const rotated = pitchClasses.slice(root).concat(pitchClasses.slice(0, root));
    const majorCorr = correlate(rotated, majorProfile);
    if (majorCorr > bestCorr) { bestCorr = majorCorr; bestKey = NOTE_NAMES[root]; bestScale = 'major'; }
    const minorCorr = correlate(rotated, minorProfile);
    if (minorCorr > bestCorr) { bestCorr = minorCorr; bestKey = NOTE_NAMES[root]; bestScale = 'minor'; }
  }

  return { key: bestKey, scale: bestScale, confidence: Math.max(0, Math.min(1, (bestCorr + 1) / 2)) };
}

/** Generate a chord progression with MIDI pitches. */
export function generateChordProgression(
  key: string,
  numBars: number,
  style: string = 'pop'
): { summary: string; chords: Array<{ bar: number; name: string; midiNotes: string[]; midiPitches: number[] }> } {
  const parts = key.split(' ');
  const rootNote = parts[0] || 'C';
  const scaleType = (parts[1] || 'major').toLowerCase();

  const progressions: Record<string, number[][]> = {
    pop: [[0, 4, 5, 3], [0, 5, 3, 4], [5, 3, 0, 4]],
    jazz: [[1, 4, 0, 0], [1, 4, 2, 5], [0, 5, 1, 4]],
    classical: [[0, 3, 4, 0], [0, 4, 5, 4], [0, 1, 4, 0]],
    blues: [[0, 0, 0, 0], [3, 3, 0, 0], [4, 3, 0, 4]],
    rock: [[0, 3, 4, 3], [0, 4, 5, 4], [0, 5, 3, 4]],
  };

  const styleProgs = progressions[style] || progressions['pop'];
  const majorScale = [0, 2, 4, 5, 7, 9, 11];
  const minorScale = [0, 2, 3, 5, 7, 8, 10];
  const scale = scaleType === 'minor' ? minorScale : majorScale;
  const majorQualities = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim'];
  const minorQualities = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj'];
  const qualities = scaleType === 'minor' ? minorQualities : majorQualities;
  const rootMidi = noteNameToMidi(rootNote, 4);

  const chords: Array<{ bar: number; name: string; midiNotes: string[]; midiPitches: number[] }> = [];

  for (let bar = 0; bar < numBars; bar++) {
    const progIdx = bar % styleProgs.length;
    const barProg = styleProgs[progIdx];
    const degree = barProg[bar % barProg.length] % 7;
    const chordRoot = rootMidi + scale[degree] - 12;
    const quality = qualities[degree];
    const third = quality === 'min' || quality === 'dim' ? 3 : 4;
    const fifth = quality === 'dim' ? 6 : 7;
    const chordNotes = [chordRoot, chordRoot + third, chordRoot + fifth];

    if (style === 'jazz') {
      chordNotes.push(chordRoot + (quality === 'maj' ? 11 : 10));
    }

    const degreeNames = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii\u00B0'];
    const chordName = `${NOTE_NAMES[(rootMidi + scale[degree]) % 12]}${quality === 'min' ? 'm' : quality === 'dim' ? 'dim' : ''}`;

    chords.push({
      bar,
      name: `${degreeNames[degree]} (${chordName})`,
      midiNotes: chordNotes.map(n => midiToNoteName(n)),
      midiPitches: chordNotes,
    });
  }

  const summary = chords.map(c => `Bar ${c.bar + 1}: ${c.name}`).join('\n');
  return { summary, chords };
}

/** Analyze the project mix and return a text report. */
export function analyzeMix(project: Project, includeRecommendations: boolean = true): string {
  const tracks = project.tracks;
  if (tracks.length === 0) return 'No tracks in the project to analyze.';

  const lines: string[] = [`## Mix Analysis — ${project.metadata.title}\n`];
  lines.push(`Tempo: ${project.tempo} BPM | Time Signature: ${project.timeSignature.numerator}/${project.timeSignature.denominator}\n`);

  lines.push('### Level Balance');
  for (const t of tracks) {
    const muteStr = t.muted ? ' (MUTED)' : '';
    lines.push(`- ${t.name}: ${t.volume.toFixed(1)} dB${muteStr}`);
  }

  const hotTracks = tracks.filter(t => t.volume > 0 && !t.muted);
  if (hotTracks.length > 0) {
    lines.push(`\n> ${hotTracks.length} track(s) above 0 dB — risk of clipping: ${hotTracks.map(t => t.name).join(', ')}`);
  }

  lines.push('\n### Stereo Image');
  const active = tracks.filter(t => !t.muted);
  const left = active.filter(t => t.pan < -0.3).length;
  const center = active.filter(t => Math.abs(t.pan) <= 0.3).length;
  const right = active.filter(t => t.pan > 0.3).length;
  lines.push(`Left: ${left} | Center: ${center} | Right: ${right}`);
  for (const t of active) {
    const label = t.pan === 0 ? 'C' : t.pan < 0 ? `L${Math.abs(t.pan * 100).toFixed(0)}` : `R${(t.pan * 100).toFixed(0)}`;
    lines.push(`- ${t.name}: ${label}`);
  }

  lines.push('\n### Effects');
  for (const t of tracks) {
    if (t.effects.length > 0) {
      lines.push(`- ${t.name}: ${t.effects.map(e => e.name || e.type).join(', ')}`);
    } else {
      lines.push(`- ${t.name}: (no effects)`);
    }
  }

  if (includeRecommendations) {
    lines.push('\n### Recommendations');
    if (hotTracks.length > 0) {
      lines.push(`- Reduce levels on ${hotTracks.map(t => t.name).join(', ')} to avoid clipping`);
    }
    if (center > tracks.length * 0.7) {
      lines.push('- Consider panning some tracks wider for a better stereo image');
    }
    const dry = tracks.filter(t => t.effects.length === 0 && !t.muted);
    if (dry.length > 0 && tracks.length > 2) {
      lines.push(`- Consider adding EQ to ${dry.map(t => t.name).join(', ')} for frequency carving`);
    }
  }

  return lines.join('\n');
}

// ── ProjectState class ───────────────────────────────────────────────

export class ProjectState {
  private project: Project;
  private projectDir: string;

  constructor(projectDir: string) {
    this.projectDir = projectDir;
    this.project = createDefaultProject();
    fs.mkdirSync(projectDir, { recursive: true });
  }

  getProject(): Project { return this.project; }

  save(): string {
    const filePath = path.join(this.projectDir, 'active.json');
    fs.writeFileSync(filePath, JSON.stringify(this.project, null, 2));
    return filePath;
  }

  load(projectId: string): boolean {
    const filePath = path.join(this.projectDir, `${projectId}.json`);
    if (!fs.existsSync(filePath)) return false;
    this.project = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return true;
  }

  loadActive(): boolean {
    const filePath = path.join(this.projectDir, 'active.json');
    if (!fs.existsSync(filePath)) return false;
    this.project = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    return true;
  }

  setProject(project: Project): void {
    this.project = project;
    this.touch();
  }

  setTempo(tempo: number): void {
    this.project.tempo = tempo;
    this.touch();
  }

  setTimeSignature(numerator: number, denominator: number): void {
    this.project.timeSignature = { numerator, denominator };
    this.touch();
  }

  addTrack(opts: { name: string; type: TrackType; instrumentType?: SynthType; color?: TrackColor }): Track {
    const track: Track = {
      id: crypto.randomUUID(),
      name: opts.name,
      type: opts.type,
      color: opts.color || 'blue',
      volume: 0,
      pan: 0,
      muted: false,
      soloed: false,
      armed: false,
      height: 80,
      clips: [],
      effects: [],
      automationLanes: [],
      input: { type: opts.type === 'midi' || opts.type === 'instrument' ? 'midi' : 'line' },
      output: { type: 'master' },
      instrumentType: opts.instrumentType,
    };
    this.project.tracks.push(track);
    this.touch();
    return track;
  }

  createClip(trackId: string, name: string, startBeat: number, durationBeats: number): Clip | null {
    const track = this.findTrack(trackId);
    if (!track) return null;
    const clip: Clip = {
      id: crypto.randomUUID(),
      name,
      type: 'midi',
      trackId: track.id,
      startBeat,
      durationBeats,
      loopEnabled: false,
      loopLengthBeats: durationBeats,
      fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
      color: '#3b82f6',
      midiData: { notes: [] },
    };
    track.clips.push(clip);
    this.updateDuration();
    this.touch();
    return clip;
  }

  addMidiNotes(
    trackId: string,
    notes: Array<{ pitch: number; velocity: number; startBeat: number; durationBeats: number }>,
    clipName?: string,
    startBeat?: number,
  ): { clipId: string; noteCount: number } | null {
    const track = this.findTrack(trackId);
    if (!track) return null;

    let clip = track.clips.find(c => c.type === 'midi');
    if (!clip) {
      const maxBeat = Math.max(...notes.map(n => n.startBeat + n.durationBeats), 4);
      clip = this.createClip(track.id, clipName || 'MIDI Clip', startBeat ?? 0, maxBeat)!;
    }

    if (!clip.midiData) clip.midiData = { notes: [] };

    const midiNotes: MIDINote[] = notes.map(n => ({
      id: crypto.randomUUID(),
      pitch: n.pitch,
      velocity: n.velocity,
      startBeat: n.startBeat,
      durationBeats: n.durationBeats,
    }));

    clip.midiData.notes.push(...midiNotes);

    const maxBeat = Math.max(...midiNotes.map(n => n.startBeat + n.durationBeats));
    if (maxBeat > clip.durationBeats) clip.durationBeats = maxBeat;

    this.updateDuration();
    this.touch();
    return { clipId: clip.id, noteCount: midiNotes.length };
  }

  setTrackVolume(trackId: string, volume: number): boolean {
    const track = this.findTrack(trackId);
    if (!track) return false;
    track.volume = Math.max(-60, Math.min(6, volume));
    this.touch();
    return true;
  }

  setTrackPan(trackId: string, pan: number): boolean {
    const track = this.findTrack(trackId);
    if (!track) return false;
    track.pan = Math.max(-1, Math.min(1, pan));
    this.touch();
    return true;
  }

  addEffect(trackId: string, effectType: EffectType, params?: Record<string, number>): EffectInstance | null {
    const track = this.findTrack(trackId);
    if (!track) return null;

    const parameters: EffectParameter[] = Object.entries(params || {}).map(([name, value]) => ({
      id: crypto.randomUUID(),
      name,
      value,
      min: 0,
      max: 1,
      step: 0.01,
      unit: '',
    }));

    const effect: EffectInstance = {
      id: crypto.randomUUID(),
      type: effectType,
      name: effectType,
      enabled: true,
      parameters,
      presets: [],
    };
    track.effects.push(effect);
    this.touch();
    return effect;
  }

  addSection(name: string, startBeat: number, durationBeats: number, color?: string): Section {
    const section: Section = {
      id: crypto.randomUUID(),
      name,
      startBeat,
      durationBeats,
      color: color || '#3b82f6',
    };
    this.project.sections.push(section);
    this.updateDuration();
    this.touch();
    return section;
  }

  findTrack(trackId: string): Track | undefined {
    let track = this.project.tracks.find(t => t.id === trackId);
    if (track) return track;
    track = this.project.tracks.find(t => t.name.toLowerCase() === trackId.toLowerCase());
    if (track) return track;
    const idx = parseInt(trackId, 10);
    if (!isNaN(idx) && idx >= 1 && idx <= this.project.tracks.length) {
      return this.project.tracks[idx - 1];
    }
    return undefined;
  }

  private touch(): void {
    this.project.metadata.modifiedAt = new Date().toISOString();
  }

  private updateDuration(): void {
    let maxBeat = 0;
    for (const track of this.project.tracks) {
      for (const clip of track.clips) {
        maxBeat = Math.max(maxBeat, clip.startBeat + clip.durationBeats);
      }
    }
    for (const section of this.project.sections) {
      maxBeat = Math.max(maxBeat, section.startBeat + section.durationBeats);
    }
    this.project.durationBeats = maxBeat;
  }
}
