/**
 * applyMutations — maps ProjectMutation[] to project-store actions.
 * Called in the renderer after receiving an agent response.
 */

import type { ProjectMutation } from '../core/models/mutations'
import type { Clip, MIDINote, Track } from '../core/models'
import type { EffectInstance, EffectParameter } from '../core/models/effects'
import type { Section } from '../core/models/section'

// Effect parameter defaults per effect type
const EFFECT_PARAM_DEFS: Record<string, EffectParameter[]> = {
  'parametric-eq': Array.from({ length: 8 }, (_, i) => [
    { id: `band${i}Freq`, name: `band${i}Freq`, value: [60, 170, 350, 700, 1400, 3000, 6000, 12000][i] ?? 1000, min: 20, max: 20000, step: 1, unit: 'Hz' },
    { id: `band${i}Gain`, name: `band${i}Gain`, value: 0, min: -12, max: 12, step: 0.5, unit: 'dB' },
    { id: `band${i}Q`, name: `band${i}Q`, value: 1, min: 0.1, max: 10, step: 0.1, unit: '' },
  ]).flat(),
  'compressor-vca': [
    { id: 'threshold', name: 'threshold', value: -24, min: -60, max: 0, step: 0.5, unit: 'dB' },
    { id: 'ratio', name: 'ratio', value: 4, min: 1, max: 20, step: 0.5, unit: ':1' },
    { id: 'attack', name: 'attack', value: 0.003, min: 0, max: 1, step: 0.001, unit: 's' },
    { id: 'release', name: 'release', value: 0.25, min: 0.01, max: 2, step: 0.01, unit: 's' },
    { id: 'knee', name: 'knee', value: 30, min: 0, max: 40, step: 1, unit: 'dB' },
    { id: 'makeup', name: 'makeup', value: 0, min: -12, max: 24, step: 0.5, unit: 'dB' },
  ],
}

function makeEffectInstance(
  effectType: string,
  params: Record<string, number>
): EffectInstance {
  // Start with defaults, then override
  const defaults = EFFECT_PARAM_DEFS[effectType] || []
  const parameters = defaults.map((p) => ({
    ...p,
    value: params[p.name] !== undefined ? params[p.name] : p.value,
  }))

  // Add any params not in defaults
  for (const [name, value] of Object.entries(params)) {
    if (!parameters.find((p) => p.name === name)) {
      parameters.push({
        id: name,
        name,
        value,
        min: -100,
        max: 100,
        step: 0.01,
        unit: '',
      })
    }
  }

  const labels: Record<string, string> = {
    'parametric-eq': 'Parametric EQ',
    'compressor-vca': 'VCA Compressor',
    'compressor-fet': 'FET Compressor',
    'compressor-optical': 'Optical Compressor',
    'reverb-algorithmic': 'Algorithmic Reverb',
    'delay-pingpong': 'Ping-Pong Delay',
  }

  return {
    id: crypto.randomUUID(),
    type: effectType as EffectInstance['type'],
    name: labels[effectType] || effectType,
    enabled: true,
    parameters,
    presets: [],
  }
}

function makeClip(trackId: string, clipData: ProjectMutation & { type: 'createClip' }): Clip {
  return {
    id: clipData.clip.id,
    name: clipData.clip.name,
    type: clipData.clip.type,
    trackId,
    startBeat: clipData.clip.startBeat,
    durationBeats: clipData.clip.durationBeats,
    loopEnabled: false,
    loopLengthBeats: clipData.clip.durationBeats,
    fade: { inDuration: 0, outDuration: 0, inCurve: 0, outCurve: 0 },
    color: '#3b82f6',
    midiData: clipData.clip.type === 'midi' ? { notes: [] } : undefined,
  }
}

interface ProjectStore {
  updateTrack: (trackId: string, updates: Partial<Track>) => void
  addClip: (trackId: string, clip: Clip) => void
  addEffect: (trackId: string, effect: EffectInstance) => void
  addMidiNote: (trackId: string, clipId: string, note: MIDINote) => void
  addSection: (section: Section) => void
  project: { tracks: Array<{ id: string; clips: Clip[] }> }
}

export function applyMutations(
  store: ProjectStore,
  mutations: ProjectMutation[]
): void {
  for (const mutation of mutations) {
    switch (mutation.type) {
      case 'setTrackVolume':
        store.updateTrack(mutation.trackId, { volume: mutation.volume })
        break

      case 'setTrackPan':
        store.updateTrack(mutation.trackId, { pan: mutation.pan })
        break

      case 'addEffect': {
        const effect = makeEffectInstance(mutation.effectType, mutation.params)
        store.addEffect(mutation.trackId, effect)
        break
      }

      case 'createClip': {
        const clip = makeClip(mutation.trackId, mutation as ProjectMutation & { type: 'createClip' })
        store.addClip(mutation.trackId, clip)
        break
      }

      case 'addMidiNotes': {
        for (const note of mutation.notes) {
          store.addMidiNote(mutation.trackId, mutation.clipId, note)
        }
        break
      }

      case 'updateTrack':
        store.updateTrack(mutation.trackId, mutation.updates)
        break

      case 'createSection':
        store.addSection({
          id: crypto.randomUUID(),
          name: mutation.name,
          startBeat: mutation.startBeat,
          durationBeats: mutation.durationBeats,
          color: mutation.color || '#3b82f6',
        })
        break
    }
  }
}
