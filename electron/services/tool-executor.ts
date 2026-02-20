/**
 * ToolExecutor — executes agent tool calls and returns mutations + text results.
 * Runs in the Electron main process alongside the Claude API loop.
 */

interface ProjectContext {
  tracks: Array<{
    id: string
    name: string
    type: string
    volume: number
    pan: number
    muted: boolean
    effects: Array<{ type: string; name: string; params: Record<string, number> }>
    sends: Array<{ targetBusId: string; gain: number }>
    clips: Array<{
      id: string
      name: string
      type: string
      startBeat: number
      durationBeats: number
      midiNotes?: Array<{
        pitch: number
        velocity: number
        startBeat: number
        durationBeats: number
      }>
    }>
    frequencyData?: number[]
    peakLevel?: number
    rmsLevel?: number
  }>
  tempo: number
  timeSignature: { numerator: number; denominator: number }
  sections: Array<{ name: string; startBeat: number; durationBeats: number; color: string }>
}

interface Mutation {
  type: string
  [key: string]: unknown
}

interface ToolResult {
  result: string
  mutations: Mutation[]
}

// Default EQ parameters per band for the parametric-eq effect
function eqBandParams(
  bands: Array<{ frequency: number; gain: number; q: number }>
): Record<string, number> {
  const params: Record<string, number> = {}
  bands.forEach((band, i) => {
    if (i > 7) return // 8 bands max
    params[`band${i}Freq`] = band.frequency
    params[`band${i}Gain`] = band.gain
    params[`band${i}Q`] = band.q
  })
  return params
}

// Note name helpers for composition tools
const NOTE_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']

function noteNameToMidi(name: string, octave: number): number {
  const idx = NOTE_NAMES.indexOf(name.replace('b', '#').replace('Db', 'C#').replace('Eb', 'D#').replace('Gb', 'F#').replace('Ab', 'G#').replace('Bb', 'A#'))
  if (idx === -1) return 60
  return idx + (octave + 1) * 12
}

function midiToNoteName(midi: number): string {
  const note = NOTE_NAMES[midi % 12]
  const octave = Math.floor(midi / 12) - 1
  return `${note}${octave}`
}

// Key detection by analyzing pitch class distribution
function detectKeyFromNotes(
  notes: Array<{ pitch: number; durationBeats: number }>
): { key: string; scale: string; confidence: number } {
  if (notes.length === 0) return { key: 'C', scale: 'major', confidence: 0 }

  // Count weighted pitch classes (weighted by duration)
  const pitchClasses = new Array(12).fill(0)
  for (const note of notes) {
    pitchClasses[note.pitch % 12] += note.durationBeats
  }

  // Major and minor profiles (Krumhansl-Kessler)
  const majorProfile = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88]
  const minorProfile = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17]

  let bestKey = 'C'
  let bestScale = 'major'
  let bestCorr = -Infinity

  for (let root = 0; root < 12; root++) {
    // Rotate pitch classes to align with root
    const rotated = pitchClasses.slice(root).concat(pitchClasses.slice(0, root))

    // Correlate with major
    const majorCorr = correlate(rotated, majorProfile)
    if (majorCorr > bestCorr) {
      bestCorr = majorCorr
      bestKey = NOTE_NAMES[root]
      bestScale = 'major'
    }

    // Correlate with minor
    const minorCorr = correlate(rotated, minorProfile)
    if (minorCorr > bestCorr) {
      bestCorr = minorCorr
      bestKey = NOTE_NAMES[root]
      bestScale = 'minor'
    }
  }

  const confidence = Math.max(0, Math.min(1, (bestCorr + 1) / 2))
  return { key: bestKey, scale: bestScale, confidence }
}

function correlate(a: number[], b: number[]): number {
  const n = a.length
  const meanA = a.reduce((s, v) => s + v, 0) / n
  const meanB = b.reduce((s, v) => s + v, 0) / n
  let num = 0
  let denA = 0
  let denB = 0
  for (let i = 0; i < n; i++) {
    const da = a[i] - meanA
    const db = b[i] - meanB
    num += da * db
    denA += da * da
    denB += db * db
  }
  const den = Math.sqrt(denA * denB)
  return den === 0 ? 0 : num / den
}

export class ToolExecutor {
  execute(toolName: string, input: Record<string, unknown>, context: ProjectContext): ToolResult {
    switch (toolName) {
      case 'set_track_level':
        return this.setTrackLevel(input, context)
      case 'set_track_pan':
        return this.setTrackPan(input, context)
      case 'apply_eq':
        return this.applyEq(input, context)
      case 'apply_compression':
        return this.applyCompression(input, context)
      case 'analyze_frequency_spectrum':
        return this.analyzeFrequencySpectrum(input, context)
      case 'generate_chord_progression':
        return this.generateChordProgression(input)
      case 'create_midi_track':
        return this.createMidiTrack(input, context)
      case 'detect_key_and_scale':
        return this.detectKeyAndScale(input, context)
      case 'create_song_section':
        return this.createSongSection(input)
      case 'analyze_project_mix':
        return this.analyzeProjectMix(input, context)
      default:
        return { result: `Unknown tool: ${toolName}`, mutations: [] }
    }
  }

  private findTrack(trackId: string, context: ProjectContext) {
    // Support "track 1", "Track 1", index-based references
    const track = context.tracks.find((t) => t.id === trackId)
    if (track) return track
    // Try by name (case-insensitive)
    const byName = context.tracks.find(
      (t) => t.name.toLowerCase() === trackId.toLowerCase()
    )
    if (byName) return byName
    // Try numeric index (1-based)
    const idx = parseInt(trackId, 10)
    if (!isNaN(idx) && idx >= 1 && idx <= context.tracks.length) {
      return context.tracks[idx - 1]
    }
    return null
  }

  private resolveTrackId(trackId: string, context: ProjectContext): string | null {
    const track = this.findTrack(trackId, context)
    return track?.id ?? null
  }

  // ── Mixing Tools ──────────────────────────────

  private setTrackLevel(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const level = Number(input.level)
    const track = this.findTrack(input.trackId as string, context)!
    return {
      result: `Set ${track.name} volume to ${level} dB`,
      mutations: [{ type: 'setTrackVolume', trackId, volume: level }],
    }
  }

  private setTrackPan(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const pan = Number(input.pan)
    const track = this.findTrack(input.trackId as string, context)!
    const panLabel = pan === 0 ? 'center' : pan < 0 ? `${Math.abs(pan * 100).toFixed(0)}% left` : `${(pan * 100).toFixed(0)}% right`
    return {
      result: `Set ${track.name} pan to ${panLabel}`,
      mutations: [{ type: 'setTrackPan', trackId, pan }],
    }
  }

  private applyEq(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const bands = input.bands as Array<{ frequency: number; gain: number; q: number }>
    const track = this.findTrack(input.trackId as string, context)!
    const params = eqBandParams(bands)
    const desc = bands
      .map((b) => `${b.frequency}Hz ${b.gain > 0 ? '+' : ''}${b.gain}dB Q=${b.q}`)
      .join(', ')
    return {
      result: `Applied parametric EQ to ${track.name}: ${desc}`,
      mutations: [
        { type: 'addEffect', trackId, effectType: 'parametric-eq', params },
      ],
    }
  }

  private applyCompression(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const track = this.findTrack(input.trackId as string, context)!
    const params: Record<string, number> = {
      threshold: Number(input.threshold),
      ratio: Number(input.ratio),
    }
    if (input.attack !== undefined) params.attack = Number(input.attack) / 1000 // ms to s
    if (input.release !== undefined) params.release = Number(input.release) / 1000
    return {
      result: `Applied VCA compressor to ${track.name}: threshold ${params.threshold}dB, ratio ${params.ratio}:1`,
      mutations: [
        { type: 'addEffect', trackId, effectType: 'compressor-vca', params },
      ],
    }
  }

  private analyzeFrequencySpectrum(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const track = this.findTrack(input.trackId as string, context)!

    if (track.frequencyData && track.frequencyData.length > 0) {
      const data = track.frequencyData
      const bands = [
        { name: 'Sub Bass (20-60Hz)', range: [0, 3] },
        { name: 'Bass (60-250Hz)', range: [3, 12] },
        { name: 'Low Mids (250-500Hz)', range: [12, 24] },
        { name: 'Mids (500-2kHz)', range: [24, 48] },
        { name: 'Upper Mids (2-4kHz)', range: [48, 64] },
        { name: 'Presence (4-8kHz)', range: [64, 80] },
        { name: 'Brilliance (8-20kHz)', range: [80, 100] },
      ]
      const analysis = bands.map((b) => {
        const slice = data.slice(
          Math.min(b.range[0], data.length - 1),
          Math.min(b.range[1], data.length)
        )
        const avg = slice.length > 0 ? slice.reduce((s, v) => s + v, 0) / slice.length : -100
        return `${b.name}: ${avg.toFixed(1)} dB`
      })

      return {
        result: `Frequency analysis for ${track.name}:\nPeak: ${track.peakLevel?.toFixed(1) ?? 'N/A'} dB\nRMS: ${track.rmsLevel?.toFixed(1) ?? 'N/A'} dB\n\n${analysis.join('\n')}`,
        mutations: [],
      }
    }

    return {
      result: `Frequency analysis for ${track.name}: No audio data available. The track may be empty or not playing.`,
      mutations: [],
    }
  }

  // ── Composition Tools ─────────────────────────

  private generateChordProgression(input: Record<string, unknown>): ToolResult {
    const key = input.key as string
    const numBars = Number(input.numBars)
    const style = (input.style as string) || 'pop'

    // Parse key
    const parts = key.split(' ')
    const rootNote = parts[0] || 'C'
    const scaleType = (parts[1] || 'major').toLowerCase()

    // Common chord progressions by style
    const progressions: Record<string, number[][]> = {
      pop: [[0, 4, 5, 3], [0, 5, 3, 4], [5, 3, 0, 4]],
      jazz: [[1, 4, 0, 0], [1, 4, 2, 5], [0, 5, 1, 4]],
      classical: [[0, 3, 4, 0], [0, 4, 5, 4], [0, 1, 4, 0]],
      blues: [[0, 0, 0, 0], [3, 3, 0, 0], [4, 3, 0, 4]],
      rock: [[0, 3, 4, 3], [0, 4, 5, 4], [0, 5, 3, 4]],
    }

    const styleProgs = progressions[style] || progressions['pop']

    // Scale degrees for major/minor
    const majorScale = [0, 2, 4, 5, 7, 9, 11]
    const minorScale = [0, 2, 3, 5, 7, 8, 10]
    const scale = scaleType === 'minor' ? minorScale : majorScale

    // Chord quality per scale degree
    const majorQualities = ['maj', 'min', 'min', 'maj', 'maj', 'min', 'dim']
    const minorQualities = ['min', 'dim', 'maj', 'min', 'min', 'maj', 'maj']
    const qualities = scaleType === 'minor' ? minorQualities : majorQualities

    const rootMidi = noteNameToMidi(rootNote, 4)

    // Build chord progression for numBars
    const chords: Array<{ name: string; degree: number; notes: number[]; bar: number }> = []
    for (let bar = 0; bar < numBars; bar++) {
      const progIdx = bar % styleProgs.length
      const barProg = styleProgs[progIdx]
      const degreeIdx = barProg[bar % barProg.length] % 7
      const degree = degreeIdx

      const chordRoot = rootMidi + scale[degree] - 12 // Lower octave for voicing
      const quality = qualities[degree]
      const third = quality === 'min' || quality === 'dim' ? 3 : 4
      const fifth = quality === 'dim' ? 6 : 7

      const chordNotes = [chordRoot, chordRoot + third, chordRoot + fifth]

      // Add 7th for jazz
      if (style === 'jazz') {
        const seventh = quality === 'maj' ? 11 : 10
        chordNotes.push(chordRoot + seventh)
      }

      const degreeName = ['I', 'ii', 'iii', 'IV', 'V', 'vi', 'vii°'][degree]
      const chordName = `${NOTE_NAMES[(rootMidi + scale[degree]) % 12]}${quality === 'min' ? 'm' : quality === 'dim' ? 'dim' : ''}`

      chords.push({ name: `${degreeName} (${chordName})`, degree, notes: chordNotes, bar })
    }

    const summary = chords.map((c) => `Bar ${c.bar + 1}: ${c.name}`).join('\n')
    const noteData = chords.map((c) => ({
      bar: c.bar,
      name: c.name,
      midiNotes: c.notes.map((n) => midiToNoteName(n)),
      midiPitches: c.notes,
    }))

    return {
      result: `Generated ${numBars}-bar ${style} chord progression in ${key}:\n\n${summary}\n\nMIDI data: ${JSON.stringify(noteData)}`,
      mutations: [],
    }
  }

  private createMidiTrack(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const track = this.findTrack(input.trackId as string, context)!
    const rawNotes = input.notes as Array<{
      pitch: number
      velocity: number
      startBeat: number
      durationBeats: number
    }>

    // Generate IDs for notes
    const notes = rawNotes.map((n) => ({
      id: crypto.randomUUID(),
      pitch: n.pitch,
      velocity: n.velocity,
      startBeat: n.startBeat,
      durationBeats: n.durationBeats,
    }))

    // Find or create a clip
    const existingClip = track.clips.find(
      (c) => c.type === 'midi' && c.startBeat === 0
    )
    const maxBeat = Math.max(...notes.map((n) => n.startBeat + n.durationBeats), 4)

    const mutations: Mutation[] = []

    if (existingClip) {
      mutations.push({
        type: 'addMidiNotes',
        trackId,
        clipId: existingClip.id,
        notes,
      })
    } else {
      const clipId = crypto.randomUUID()
      mutations.push({
        type: 'createClip',
        trackId,
        clip: {
          id: clipId,
          name: `MIDI Clip`,
          type: 'midi' as const,
          startBeat: 0,
          durationBeats: maxBeat,
        },
      })
      mutations.push({
        type: 'addMidiNotes',
        trackId,
        clipId,
        notes,
      })
    }

    return {
      result: `Created ${notes.length} MIDI notes on ${track.name}`,
      mutations,
    }
  }

  private detectKeyAndScale(
    input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const trackId = this.resolveTrackId(input.trackId as string, context)
    if (!trackId) return { result: `Track not found: ${input.trackId}`, mutations: [] }
    const track = this.findTrack(input.trackId as string, context)!

    // Gather all MIDI notes from all clips on the track
    const allNotes: Array<{ pitch: number; durationBeats: number }> = []
    for (const clip of track.clips) {
      if (clip.midiNotes) {
        allNotes.push(...clip.midiNotes)
      }
    }

    if (allNotes.length === 0) {
      return {
        result: `No MIDI notes found on ${track.name}. Cannot detect key.`,
        mutations: [],
      }
    }

    const { key, scale, confidence } = detectKeyFromNotes(allNotes)
    return {
      result: `Key detection for ${track.name}: ${key} ${scale} (confidence: ${(confidence * 100).toFixed(0)}%)\nAnalyzed ${allNotes.length} notes.`,
      mutations: [],
    }
  }

  // ── Arrangement Tools ─────────────────────────

  private createSongSection(input: Record<string, unknown>): ToolResult {
    const name = input.name as string
    const startBeat = Number(input.startBeat)
    const durationBeats = Number(input.durationBeats)
    const color = (input.color as string) || '#3b82f6'

    return {
      result: `Created section "${name}" from beat ${startBeat} to ${startBeat + durationBeats} (${durationBeats} beats)`,
      mutations: [
        { type: 'createSection', name, startBeat, durationBeats, color },
      ],
    }
  }

  // ── Analysis Tools ────────────────────────────

  private analyzeProjectMix(
    _input: Record<string, unknown>,
    context: ProjectContext
  ): ToolResult {
    const tracks = context.tracks
    if (tracks.length === 0) {
      return { result: 'No tracks in the project to analyze.', mutations: [] }
    }

    const lines: string[] = ['## Mix Analysis\n']

    // Level balance
    lines.push('### Level Balance')
    for (const track of tracks) {
      const level = track.volume
      const muteStr = track.muted ? ' (MUTED)' : ''
      lines.push(`- ${track.name}: ${level.toFixed(1)} dB${muteStr}`)
    }

    // Check for clipping risk
    const hotTracks = tracks.filter((t) => t.volume > 0 && !t.muted)
    if (hotTracks.length > 0) {
      lines.push(
        `\n⚠️ ${hotTracks.length} track(s) above 0 dB — risk of clipping: ${hotTracks.map((t) => t.name).join(', ')}`
      )
    }

    // Panning analysis
    lines.push('\n### Stereo Image')
    const panPositions = tracks.filter((t) => !t.muted).map((t) => ({ name: t.name, pan: t.pan }))
    const leftCount = panPositions.filter((p) => p.pan < -0.3).length
    const centerCount = panPositions.filter((p) => Math.abs(p.pan) <= 0.3).length
    const rightCount = panPositions.filter((p) => p.pan > 0.3).length
    lines.push(`Left: ${leftCount} tracks | Center: ${centerCount} tracks | Right: ${rightCount} tracks`)
    for (const p of panPositions) {
      const panLabel = p.pan === 0 ? 'C' : p.pan < 0 ? `L${Math.abs(p.pan * 100).toFixed(0)}` : `R${(p.pan * 100).toFixed(0)}`
      lines.push(`- ${p.name}: ${panLabel}`)
    }

    // Effects summary
    lines.push('\n### Effects')
    for (const track of tracks) {
      if (track.effects.length > 0) {
        lines.push(`- ${track.name}: ${track.effects.map((e) => e.name || e.type).join(', ')}`)
      } else {
        lines.push(`- ${track.name}: (no effects)`)
      }
    }

    // Frequency analysis if available
    const tracksWithFreq = tracks.filter((t) => t.frequencyData && t.frequencyData.length > 0)
    if (tracksWithFreq.length > 0) {
      lines.push('\n### Frequency Distribution')
      for (const track of tracksWithFreq) {
        lines.push(`- ${track.name}: Peak ${track.peakLevel?.toFixed(1) ?? '?'} dB, RMS ${track.rmsLevel?.toFixed(1) ?? '?'} dB`)
      }
    }

    // Recommendations
    lines.push('\n### Recommendations')
    if (hotTracks.length > 0) {
      lines.push(`- Reduce levels on ${hotTracks.map((t) => t.name).join(', ')} to avoid clipping`)
    }
    if (centerCount > tracks.length * 0.7) {
      lines.push('- Consider panning some tracks wider for a better stereo image')
    }
    const noEffectTracks = tracks.filter((t) => t.effects.length === 0 && !t.muted)
    if (noEffectTracks.length > 0 && tracks.length > 2) {
      lines.push(
        `- Consider adding EQ to ${noEffectTracks.map((t) => t.name).join(', ')} for frequency carving`
      )
    }

    return { result: lines.join('\n'), mutations: [] }
  }
}
