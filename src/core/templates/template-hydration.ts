import type { Project } from '../models/project';
import type { Track } from '../models/track';
import type { Clip } from '../models/clip';
import type { MIDINote } from '../models/midi-event';
import type { EffectInstance } from '../models/effects';
import type { AutomationLane, AutomationPoint } from '../models/automation';
import type { Send } from '../models/send';
import type { Section } from '../models/section';

/**
 * Deep-clone a template project and regenerate all UUIDs.
 * Maintains internal references (clip.trackId, send.targetBusId, etc.).
 */
export function hydrateTemplate(source: Project): Project {
  const idMap = new Map<string, string>();

  function newId(oldId: string): string {
    if (!idMap.has(oldId)) {
      idMap.set(oldId, crypto.randomUUID());
    }
    return idMap.get(oldId)!;
  }

  function hydrateNote(note: MIDINote): MIDINote {
    return { ...note, id: newId(note.id) };
  }

  function hydrateEffect(effect: EffectInstance): EffectInstance {
    return {
      ...effect,
      id: newId(effect.id),
      parameters: effect.parameters.map((p) => ({ ...p, id: newId(p.id) })),
      presets: effect.presets.map((pr) => ({ ...pr, id: newId(pr.id) })),
    };
  }

  function hydrateAutomationPoint(point: AutomationPoint): AutomationPoint {
    return { ...point, id: newId(point.id) };
  }

  function hydrateAutomationLane(lane: AutomationLane): AutomationLane {
    return {
      ...lane,
      id: newId(lane.id),
      targetId: idMap.get(lane.targetId) ?? lane.targetId,
      points: lane.points.map(hydrateAutomationPoint),
    };
  }

  function hydrateSend(send: Send): Send {
    return {
      ...send,
      id: newId(send.id),
      targetBusId: idMap.get(send.targetBusId) ?? send.targetBusId,
    };
  }

  function hydrateClip(clip: Clip, newTrackId: string): Clip {
    return {
      ...clip,
      id: newId(clip.id),
      trackId: newTrackId,
      midiData: clip.midiData
        ? { notes: clip.midiData.notes.map(hydrateNote) }
        : undefined,
      audioData: clip.audioData ? { ...clip.audioData } : undefined,
    };
  }

  function hydrateSection(sec: Section): Section {
    return { ...sec, id: newId(sec.id) };
  }

  // First pass: register all track IDs so sends/automation can resolve
  for (const track of source.tracks) {
    newId(track.id);
  }

  function hydrateTrack(track: Track): Track {
    const trackId = idMap.get(track.id)!;
    return {
      ...track,
      id: trackId,
      clips: track.clips.map((c) => hydrateClip(c, trackId)),
      effects: track.effects.map(hydrateEffect),
      automationLanes: track.automationLanes.map(hydrateAutomationLane),
      sends: track.sends?.map(hydrateSend),
      output: track.output.type === 'bus' && track.output.targetId
        ? { ...track.output, targetId: idMap.get(track.output.targetId) ?? track.output.targetId }
        : { ...track.output },
    };
  }

  const now = new Date().toISOString();

  return {
    ...source,
    id: crypto.randomUUID(),
    metadata: {
      ...source.metadata,
      createdAt: now,
      modifiedAt: now,
    },
    tracks: source.tracks.map(hydrateTrack),
    masterBus: {
      ...source.masterBus,
      effects: source.masterBus.effects.map(hydrateEffect),
    },
    sections: source.sections.map(hydrateSection),
  };
}
