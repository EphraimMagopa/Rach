import type { MIDINote } from './midi-event'
import type { EffectType } from './effects'

export type ProjectMutation =
  | { type: 'setTrackVolume'; trackId: string; volume: number }
  | { type: 'setTrackPan'; trackId: string; pan: number }
  | {
      type: 'addEffect'
      trackId: string
      effectType: EffectType
      params: Record<string, number>
    }
  | {
      type: 'addMidiNotes'
      trackId: string
      clipId: string
      notes: MIDINote[]
    }
  | {
      type: 'createClip'
      trackId: string
      clip: {
        id: string
        name: string
        type: 'audio' | 'midi'
        startBeat: number
        durationBeats: number
      }
    }
  | {
      type: 'updateTrack'
      trackId: string
      updates: Record<string, unknown>
    }
  | {
      type: 'createSection'
      name: string
      startBeat: number
      durationBeats: number
      color?: string
    }

export interface ToolExecution {
  name: string
  input: unknown
  result: string
}

export interface AgentResponse {
  text: string
  mutations: ProjectMutation[]
  toolExecutions: ToolExecution[]
}
