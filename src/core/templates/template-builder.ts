import type { Track, TrackColor } from '../models/track';
import type { Clip } from '../models/clip';
import type { MIDINote } from '../models/midi-event';
import type { Section } from '../models/section';
import type { EffectInstance, EffectType } from '../models/effects';
import type { Project } from '../models/project';
import type { SynthType } from '../synths/synth-interface';
import type { TemplateMetadata, ProjectTemplate, TemplateCategory, TemplateDifficulty } from './template-types';
import { EFFECT_LABELS } from '../effects/effect-factory';
import { getPresetsForEffect } from '../effects/effect-presets';

/** Shorthand: create a MIDI note */
export function n(
  pitch: number,
  startBeat: number,
  durationBeats: number,
  velocity = 100,
): MIDINote {
  return {
    id: crypto.randomUUID(),
    pitch,
    velocity,
    startBeat,
    durationBeats,
  };
}

/** Shorthand: create a MIDI clip with notes */
export function midiClip(
  trackId: string,
  name: string,
  startBeat: number,
  durationBeats: number,
  notes: MIDINote[],
  color = '#3b82f6',
): Clip {
  return {
    id: crypto.randomUUID(),
    name,
    type: 'midi',
    trackId,
    startBeat,
    durationBeats,
    loopEnabled: false,
    loopLengthBeats: durationBeats,
    fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
    color,
    midiData: { notes },
  };
}

/** Shorthand: create a Track with sensible defaults */
export function t(
  name: string,
  color: TrackColor,
  opts: {
    type?: Track['type'];
    instrumentType?: SynthType;
    volume?: number;
    pan?: number;
    clips?: Clip[];
    effects?: EffectInstance[];
  } = {},
): Track {
  const type = opts.type ?? 'midi';
  return {
    id: crypto.randomUUID(),
    name,
    type,
    color,
    volume: opts.volume ?? 0,
    pan: opts.pan ?? 0,
    muted: false,
    soloed: false,
    armed: false,
    height: 64,
    clips: opts.clips ?? [],
    effects: opts.effects ?? [],
    automationLanes: [],
    input: { type: type === 'midi' ? 'midi' : 'mic' },
    output: { type: 'master' },
    instrumentType: opts.instrumentType,
  };
}

/** Shorthand: create a Section */
export function section(
  name: string,
  startBeat: number,
  durationBeats: number,
  color = '#3b82f6',
): Section {
  return {
    id: crypto.randomUUID(),
    name,
    startBeat,
    durationBeats,
    color,
  };
}

/** Shorthand: create an EffectInstance with default parameters and built-in presets */
export function fx(type: EffectType): EffectInstance {
  return {
    id: crypto.randomUUID(),
    type,
    name: EFFECT_LABELS[type] ?? type,
    enabled: true,
    parameters: [],
    presets: getPresetsForEffect(type),
  };
}

/** Assemble a full Project from parts */
export function buildTemplateProject(opts: {
  title: string;
  genre: string;
  tempo: number;
  timeSignature?: [number, number];
  tracks: Track[];
  sections?: Section[];
  durationBeats?: number;
}): Project {
  // Fix up clip trackIds after tracks are created
  const tracks = opts.tracks.map((track) => ({
    ...track,
    clips: track.clips.map((clip) => ({ ...clip, trackId: track.id })),
  }));

  const maxBeat = Math.max(
    opts.durationBeats ?? 0,
    ...tracks.flatMap((tr) =>
      tr.clips.map((c) => c.startBeat + c.durationBeats)
    ),
    ...(opts.sections ?? []).map((s) => s.startBeat + s.durationBeats),
  );

  return {
    id: crypto.randomUUID(),
    metadata: {
      title: opts.title,
      artist: '',
      genre: opts.genre,
      description: '',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
    },
    tempo: opts.tempo,
    timeSignature: {
      numerator: opts.timeSignature?.[0] ?? 4,
      denominator: opts.timeSignature?.[1] ?? 4,
    },
    sampleRate: 44100,
    tracks,
    masterBus: { volume: 0, pan: 0, effects: [] },
    durationBeats: maxBeat,
    sections: opts.sections ?? [],
  };
}

/** Create template metadata */
export function meta(
  name: string,
  category: TemplateCategory,
  difficulty: TemplateDifficulty,
  description: string,
  bars: number,
  tags: string[],
): TemplateMetadata {
  return {
    id: `template-${category}-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    description,
    category,
    difficulty,
    tags,
    bars,
  };
}

/** Wrap metadata + project into a ProjectTemplate */
export function template(metadata: TemplateMetadata, project: Project): ProjectTemplate {
  return { metadata, project };
}
