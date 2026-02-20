import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── 1. Modern R&B ─────────────────────────────────────────────────────────────
// Key: Bb minor, 95 BPM, smooth 7th-chord voicings with modern synth production.

const modernRnB = template(
  meta(
    'Modern R&B',
    'r-and-b',
    'intermediate',
    'Smooth, modern R&B production with lush 7th chords, wavetable synths, and a deep sub-bass groove. '
    + 'Features verse and chorus sections with a polished, radio-ready sound.',
    16,
    ['r&b', 'modern', 'smooth', '7th chords', 'wavetable'],
  ),
  buildTemplateProject({
    title: 'Modern R&B',
    genre: 'R&B',
    tempo: 95,
    tracks: [
      // Keys — Bbm7 - Ebm7 - Gb maj7 - Ab7 progression (rach-pad, warm Rhodes feel)
      t('Keys', 'purple', {
        instrumentType: 'rach-pad',
        volume: -4,
        clips: [
          midiClip('', 'Keys — Verse', 0, 32, [
            // Bbm7: Bb2-Db3-F3-Ab3
            n(46, 0, 3.5, 75), n(49, 0, 3.5, 70), n(53, 0, 3.5, 72), n(56, 0, 3.5, 68),
            // Ebm7: Eb3-Gb3-Bb3-Db4
            n(51, 4, 3.5, 75), n(54, 4, 3.5, 70), n(58, 4, 3.5, 72), n(61, 4, 3.5, 68),
            // Gbmaj7: Gb2-Bb2-Db3-F3
            n(42, 8, 3.5, 73), n(46, 8, 3.5, 70), n(49, 8, 3.5, 72), n(53, 8, 3.5, 68),
            // Ab7: Ab2-C3-Eb3-Gb3
            n(44, 12, 3.5, 75), n(48, 12, 3.5, 70), n(51, 12, 3.5, 72), n(54, 12, 3.5, 68),
          ], '#9333ea'),
          midiClip('', 'Keys — Chorus', 32, 32, [
            // Gbmaj7: Gb3-Bb3-Db4-F4
            n(54, 0, 3.5, 80), n(58, 0, 3.5, 76), n(61, 0, 3.5, 78), n(65, 0, 3.5, 74),
            // Ab7: Ab3-C4-Eb4-Gb4
            n(56, 4, 3.5, 80), n(60, 4, 3.5, 76), n(63, 4, 3.5, 78), n(66, 4, 3.5, 74),
            // Bbm7: Bb3-Db4-F4-Ab4
            n(58, 8, 3.5, 82), n(61, 8, 3.5, 78), n(65, 8, 3.5, 80), n(68, 8, 3.5, 76),
            // Ebm7: Eb3-Gb3-Bb3-Db4
            n(51, 12, 3.5, 78), n(54, 12, 3.5, 74), n(58, 12, 3.5, 76), n(61, 12, 3.5, 72),
          ], '#9333ea'),
        ],
        effects: [fx('compressor-vca'), fx('reverb-algorithmic')],
      }),

      // Synth — shimmering wavetable pad with sustained chords
      t('Synth', 'cyan', {
        instrumentType: 'wavetable',
        volume: -8,
        pan: 15,
        clips: [
          midiClip('', 'Synth Pad — Verse', 0, 32, [
            // Bbm9: high voicing — Ab4-Bb4-Db5-F5
            n(68, 0, 7.5, 55), n(70, 0, 7.5, 50), n(73, 0, 7.5, 52), n(77, 0, 7.5, 48),
            // Ebm9: Db5-Eb5-Gb5-Bb5
            n(73, 8, 7.5, 55), n(75, 8, 7.5, 50), n(78, 8, 7.5, 52), n(82, 8, 7.5, 48),
          ], '#06b6d4'),
          midiClip('', 'Synth Pad — Chorus', 32, 32, [
            // Gbmaj9: F5-Gb5-Ab5-Bb5
            n(77, 0, 7.5, 60), n(78, 0, 7.5, 55), n(80, 0, 7.5, 57), n(82, 0, 7.5, 53),
            // Bbm9: Ab4-Bb4-Db5-F5
            n(68, 8, 7.5, 60), n(70, 8, 7.5, 55), n(73, 8, 7.5, 57), n(77, 8, 7.5, 53),
          ], '#06b6d4'),
        ],
        effects: [fx('reverb-algorithmic')],
      }),

      // Bass — deep sub with rhythmic pulse
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -2,
        clips: [
          midiClip('', 'Bass — Verse', 0, 32, [
            // Follows root motion: Bb1, Eb2, Gb1, Ab1
            n(34, 0, 1, 95), n(34, 2, 0.5, 80), n(34, 3, 0.75, 85),
            n(39, 4, 1, 95), n(39, 6, 0.5, 80), n(39, 7, 0.75, 85),
            n(30, 8, 1, 93), n(30, 10, 0.5, 78), n(30, 11, 0.75, 83),
            n(32, 12, 1, 95), n(32, 14, 0.5, 80), n(32, 15, 0.75, 85),
          ], '#ef4444'),
          midiClip('', 'Bass — Chorus', 32, 32, [
            n(30, 0, 1, 97), n(30, 1.5, 0.5, 82), n(30, 3, 0.75, 88),
            n(32, 4, 1, 97), n(32, 5.5, 0.5, 82), n(32, 7, 0.75, 88),
            n(34, 8, 1.5, 97), n(34, 10, 0.5, 82), n(34, 11.5, 0.5, 88),
            n(39, 12, 1, 95), n(39, 14, 0.5, 80), n(39, 15, 0.75, 85),
          ], '#ef4444'),
        ],
        effects: [fx('compressor-vca')],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#9333ea'),
      section('Chorus', 32, 32, '#ec4899'),
    ],
  }),
);

// ─── 2. Neo-Soul ────────────────────────────────────────────────────────────────
// Key: D minor, 85 BPM, warm analog-feel with 9th chords and groove pocket.

const neoSoul = template(
  meta(
    'Neo-Soul',
    'r-and-b',
    'intermediate',
    'Warm, analog-feel neo-soul with Rhodes-style FM keys, rich Dm9 voicings, '
    + 'and a laid-back groove. Inspired by Erykah Badu, D\'Angelo, and Anderson .Paak.',
    16,
    ['neo-soul', 'r&b', 'rhodes', '9th chords', 'analog', 'warm'],
  ),
  buildTemplateProject({
    title: 'Neo-Soul',
    genre: 'R&B',
    tempo: 85,
    tracks: [
      // Rhodes — FM synth, Dm9 - Gm9 - Am7 - Bbmaj7 progression
      t('Rhodes', 'orange', {
        instrumentType: 'fm',
        volume: -3,
        clips: [
          midiClip('', 'Rhodes — Groove', 0, 32, [
            // Dm9: D3-F3-A3-C4-E4
            n(50, 0, 2, 72), n(53, 0, 2, 68), n(57, 0, 2, 70), n(60, 0, 2, 66), n(64, 0, 2, 62),
            // ghost re-attack
            n(50, 2.5, 1, 55), n(57, 2.5, 1, 50),
            // Gm9: G3-Bb3-D4-F4-A4
            n(55, 4, 2, 72), n(58, 4, 2, 68), n(62, 4, 2, 70), n(65, 4, 2, 66), n(69, 4, 2, 62),
            // Am7: A3-C4-E4-G4
            n(57, 8, 3.5, 74), n(60, 8, 3.5, 70), n(64, 8, 3.5, 72), n(67, 8, 3.5, 68),
            // Bbmaj7: Bb3-D4-F4-A4
            n(58, 12, 3.5, 72), n(62, 12, 3.5, 68), n(65, 12, 3.5, 70), n(69, 12, 3.5, 66),
          ], '#f97316'),
          midiClip('', 'Rhodes — Bridge', 32, 32, [
            // Am7: higher register, A3-C4-E4-G4
            n(57, 0, 3, 76), n(60, 0, 3, 72), n(64, 0, 3, 74), n(67, 0, 3, 70),
            // Dm9: open voicing, D3-A3-C4-E4-F4
            n(50, 4, 3, 74), n(57, 4, 3, 70), n(60, 4, 3, 72), n(64, 4, 3, 68), n(65, 4, 3, 60),
            // Gm9: G3-Bb3-D4-A4
            n(55, 8, 3.5, 70), n(58, 8, 3.5, 66), n(62, 8, 3.5, 68), n(69, 8, 3.5, 64),
            // Bbmaj7: resolving, Bb2-F3-A3-D4
            n(46, 12, 3.5, 72), n(53, 12, 3.5, 68), n(57, 12, 3.5, 70), n(62, 12, 3.5, 66),
          ], '#f97316'),
        ],
        effects: [fx('chorus'), fx('delay-analog')],
      }),

      // Bass — warm sub following root motion with neo-soul slides
      t('Bass', 'green', {
        instrumentType: 'subtractive',
        volume: -2,
        clips: [
          midiClip('', 'Bass — Groove', 0, 32, [
            // D2 groove
            n(38, 0, 1.5, 90), n(38, 2, 0.5, 70), n(38, 3, 0.75, 78),
            // G2
            n(43, 4, 1.5, 90), n(43, 6, 0.5, 70), n(43, 7, 0.75, 78),
            // A2
            n(45, 8, 1.5, 88), n(45, 10, 0.5, 68), n(45, 11.5, 0.5, 76),
            // Bb2
            n(46, 12, 1.5, 90), n(46, 14, 0.5, 70), n(46, 15, 0.75, 78),
          ], '#22c55e'),
          midiClip('', 'Bass — Bridge', 32, 32, [
            n(45, 0, 2, 88), n(45, 3, 0.75, 72),
            n(38, 4, 2, 90), n(38, 7, 0.75, 74),
            n(43, 8, 2, 88), n(43, 11, 0.75, 72),
            n(46, 12, 2, 90), n(45, 14, 1, 78), n(43, 15, 0.75, 72),
          ], '#22c55e'),
        ],
        effects: [fx('compressor-vca')],
      }),

      // Pad — lush rach-pad for warmth and width
      t('Pad', 'blue', {
        instrumentType: 'rach-pad',
        volume: -10,
        pan: -20,
        clips: [
          midiClip('', 'Pad — Groove', 0, 32, [
            // Dm9 shell: A4-C5-E5
            n(69, 0, 7.5, 45), n(72, 0, 7.5, 42), n(76, 0, 7.5, 40),
            // Gm: Bb4-D5-F5
            n(70, 8, 7.5, 45), n(74, 8, 7.5, 42), n(77, 8, 7.5, 40),
          ], '#3b82f6'),
          midiClip('', 'Pad — Bridge', 32, 32, [
            // Am7 shell: C5-E5-G5
            n(72, 0, 7.5, 48), n(76, 0, 7.5, 44), n(79, 0, 7.5, 42),
            // Dm: A4-D5-F5
            n(69, 8, 7.5, 48), n(74, 8, 7.5, 44), n(77, 8, 7.5, 42),
          ], '#3b82f6'),
        ],
        effects: [fx('reverb-algorithmic')],
      }),
    ],
    sections: [
      section('Groove', 0, 32, '#f97316'),
      section('Bridge', 32, 32, '#3b82f6'),
    ],
  }),
);

// ─── 3. Classic Soul ────────────────────────────────────────────────────────────
// Key: G major, 105 BPM, Motown-inspired with simple triads and walking bass.

const classicSoul = template(
  meta(
    'Classic Soul',
    'r-and-b',
    'beginner',
    'Motown-inspired classic soul in G major with warm piano chords and a walking bass line. '
    + 'Simple, feel-good structure perfect for beginners learning R&B fundamentals.',
    16,
    ['soul', 'motown', 'classic', 'beginner', 'piano', 'walking bass'],
  ),
  buildTemplateProject({
    title: 'Classic Soul',
    genre: 'R&B',
    tempo: 105,
    tracks: [
      // Piano — G - C - D - Em progression, Motown comping
      t('Piano', 'yellow', {
        instrumentType: 'rach-pad',
        volume: -3,
        clips: [
          midiClip('', 'Piano — Verse', 0, 32, [
            // G major: G3-B3-D4
            n(55, 0, 1.5, 85), n(59, 0, 1.5, 80), n(62, 0, 1.5, 82),
            n(55, 2, 1.5, 78), n(59, 2, 1.5, 74), n(62, 2, 1.5, 76),
            // C major: C4-E4-G4
            n(60, 4, 1.5, 85), n(64, 4, 1.5, 80), n(67, 4, 1.5, 82),
            n(60, 6, 1.5, 78), n(64, 6, 1.5, 74), n(67, 6, 1.5, 76),
            // D major: D4-F#4-A4
            n(62, 8, 1.5, 85), n(66, 8, 1.5, 80), n(69, 8, 1.5, 82),
            n(62, 10, 1.5, 78), n(66, 10, 1.5, 74), n(69, 10, 1.5, 76),
            // Em: E3-G3-B3
            n(52, 12, 1.5, 83), n(55, 12, 1.5, 78), n(59, 12, 1.5, 80),
            n(52, 14, 1.5, 76), n(55, 14, 1.5, 72), n(59, 14, 1.5, 74),
          ], '#eab308'),
          midiClip('', 'Piano — Chorus', 32, 32, [
            // C major: C4-E4-G4 (bigger, more sustained)
            n(60, 0, 3.5, 90), n(64, 0, 3.5, 85), n(67, 0, 3.5, 87),
            // D major: D4-F#4-A4
            n(62, 4, 3.5, 90), n(66, 4, 3.5, 85), n(69, 4, 3.5, 87),
            // Em: E3-G3-B3-D4
            n(52, 8, 3.5, 88), n(55, 8, 3.5, 83), n(59, 8, 3.5, 85), n(62, 8, 3.5, 80),
            // G major: G3-B3-D4
            n(55, 12, 3.5, 90), n(59, 12, 3.5, 85), n(62, 12, 3.5, 87),
          ], '#eab308'),
        ],
        effects: [fx('reverb-algorithmic'), fx('compressor-vca')],
      }),

      // Bass — Motown walking bass
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -1,
        clips: [
          midiClip('', 'Bass — Verse', 0, 32, [
            // G walk: G2-B2-D3-B2
            n(43, 0, 1, 92), n(47, 1, 1, 85), n(50, 2, 1, 88), n(47, 3, 1, 82),
            // C walk: C3-E3-G3-E3
            n(48, 4, 1, 92), n(52, 5, 1, 85), n(55, 6, 1, 88), n(52, 7, 1, 82),
            // D walk: D3-F#3-A3-F#3
            n(50, 8, 1, 92), n(54, 9, 1, 85), n(57, 10, 1, 88), n(54, 11, 1, 82),
            // Em walk: E2-G2-B2-D3
            n(40, 12, 1, 90), n(43, 13, 1, 83), n(47, 14, 1, 86), n(50, 15, 1, 80),
          ], '#ef4444'),
          midiClip('', 'Bass — Chorus', 32, 32, [
            // C root with octave bounce
            n(48, 0, 1, 95), n(36, 1, 0.5, 80), n(48, 2, 1, 90), n(48, 3.5, 0.5, 78),
            // D root
            n(50, 4, 1, 95), n(38, 5, 0.5, 80), n(50, 6, 1, 90), n(50, 7.5, 0.5, 78),
            // Em root
            n(40, 8, 1, 93), n(52, 9, 0.5, 80), n(40, 10, 1, 88), n(47, 11, 1, 82),
            // G root
            n(43, 12, 1, 95), n(55, 13, 0.5, 80), n(43, 14, 1.5, 90),
          ], '#ef4444'),
        ],
        effects: [fx('compressor-vca')],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#eab308'),
      section('Chorus', 32, 32, '#ef4444'),
    ],
  }),
);

// ─── 4. Contemporary R&B ────────────────────────────────────────────────────────
// Key: Eb major, 100 BPM, layered production with complex extended harmonies.

const contemporaryRnB = template(
  meta(
    'Contemporary R&B',
    'r-and-b',
    'advanced',
    'Layered contemporary R&B in Eb major with complex extended harmonies, '
    + 'wavetable leads, FM keys, sub-bass, and ambient pads. '
    + 'Inspired by SZA, Frank Ocean, and Daniel Caesar.',
    16,
    ['r&b', 'contemporary', 'complex harmonies', 'layered', 'advanced'],
  ),
  buildTemplateProject({
    title: 'Contemporary R&B',
    genre: 'R&B',
    tempo: 100,
    tracks: [
      // Synth Lead — wavetable, melodic upper-structure voicings
      t('Synth', 'cyan', {
        instrumentType: 'wavetable',
        volume: -5,
        pan: 25,
        clips: [
          midiClip('', 'Synth — Intro/Verse', 0, 32, [
            // Ebmaj9: Bb4-D5-F5-G5 (upper structure)
            n(70, 0, 3, 65), n(74, 0, 3, 60), n(77, 0, 3, 62), n(79, 0, 3, 58),
            // Ab13: G4-C5-Eb5-F5 (rich extension)
            n(67, 4, 3, 65), n(72, 4, 3, 60), n(75, 4, 3, 62), n(77, 4, 3, 58),
            // Fm9: Eb5-G5-Ab5-C6 (high shimmer)
            n(75, 8, 3, 63), n(79, 8, 3, 58), n(80, 8, 3, 60), n(84, 8, 3, 55),
            // Bb13sus: Ab4-C5-Eb5-F5 (suspended tension)
            n(68, 12, 3, 65), n(72, 12, 3, 60), n(75, 12, 3, 62), n(77, 12, 3, 58),
          ], '#06b6d4'),
          midiClip('', 'Synth — Build', 32, 32, [
            // Cm9: Bb4-D5-Eb5-G5
            n(70, 0, 3.5, 70), n(74, 0, 3.5, 65), n(75, 0, 3.5, 67), n(79, 0, 3.5, 62),
            // Abmaj9: G4-Bb4-C5-Eb5
            n(67, 4, 3.5, 70), n(70, 4, 3.5, 65), n(72, 4, 3.5, 67), n(75, 4, 3.5, 62),
            // Ebmaj7#11: D5-F5-G5-A5 (lydian color)
            n(74, 8, 3.5, 68), n(77, 8, 3.5, 63), n(79, 8, 3.5, 65), n(81, 8, 3.5, 60),
            // Bb9sus: Ab4-C5-Eb5-F5
            n(68, 12, 3.5, 70), n(72, 12, 3.5, 65), n(75, 12, 3.5, 67), n(77, 12, 3.5, 62),
          ], '#06b6d4'),
        ],
        effects: [fx('auto-pan'), fx('reverb-convolution')],
      }),

      // Keys — FM, mid-register harmonic bed
      t('Keys', 'orange', {
        instrumentType: 'fm',
        volume: -6,
        pan: -20,
        clips: [
          midiClip('', 'Keys — Verse', 0, 32, [
            // Ebmaj7: Eb3-G3-Bb3-D4
            n(51, 0, 3.5, 70), n(55, 0, 3.5, 66), n(58, 0, 3.5, 68), n(62, 0, 3.5, 64),
            // Abmaj7: Ab3-C4-Eb4-G4
            n(56, 4, 3.5, 70), n(60, 4, 3.5, 66), n(63, 4, 3.5, 68), n(67, 4, 3.5, 64),
            // Fm7: F3-Ab3-C4-Eb4
            n(53, 8, 3.5, 68), n(56, 8, 3.5, 64), n(60, 8, 3.5, 66), n(63, 8, 3.5, 62),
            // Bb7: Bb3-D4-F4-Ab4
            n(58, 12, 3.5, 70), n(62, 12, 3.5, 66), n(65, 12, 3.5, 68), n(68, 12, 3.5, 64),
          ], '#f97316'),
          midiClip('', 'Keys — Build', 32, 32, [
            // Cm7: C3-Eb3-G3-Bb3
            n(48, 0, 3.5, 72), n(51, 0, 3.5, 68), n(55, 0, 3.5, 70), n(58, 0, 3.5, 66),
            // Abmaj7: Ab2-C3-Eb3-G3
            n(44, 4, 3.5, 72), n(48, 4, 3.5, 68), n(51, 4, 3.5, 70), n(55, 4, 3.5, 66),
            // Ebmaj7: Eb3-G3-Bb3-D4
            n(51, 8, 3.5, 74), n(55, 8, 3.5, 70), n(58, 8, 3.5, 72), n(62, 8, 3.5, 68),
            // Bb9: Bb2-D3-F3-Ab3-C4
            n(46, 12, 2, 74), n(50, 12, 2, 70), n(53, 12, 2, 72), n(56, 12, 2, 68), n(60, 12, 2, 64),
            // re-attack with tension
            n(46, 14.5, 1.5, 68), n(53, 14.5, 1.5, 64), n(60, 14.5, 1.5, 66),
          ], '#f97316'),
        ],
        effects: [fx('chorus'), fx('reverb-convolution')],
      }),

      // Bass — deep sub with syncopated pocket
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -1,
        clips: [
          midiClip('', 'Bass — Verse', 0, 32, [
            // Eb2 pocket
            n(39, 0, 1, 95), n(39, 1.5, 0.5, 78), n(39, 3, 0.75, 85),
            // Ab1
            n(32, 4, 1, 95), n(32, 5.5, 0.5, 78), n(32, 7, 0.75, 85),
            // F2
            n(41, 8, 1, 93), n(41, 9.5, 0.5, 76), n(41, 11, 0.75, 83),
            // Bb1
            n(34, 12, 1, 95), n(34, 13.5, 0.5, 78), n(34, 15, 0.75, 85),
          ], '#ef4444'),
          midiClip('', 'Bass — Build', 32, 32, [
            // C2
            n(36, 0, 1.5, 97), n(36, 2.5, 0.5, 80), n(36, 3.5, 0.5, 85),
            // Ab1
            n(32, 4, 1.5, 97), n(32, 6.5, 0.5, 80), n(32, 7.5, 0.5, 85),
            // Eb2 with chromatic approach
            n(38, 8, 0.5, 75), n(39, 8.5, 1.5, 97), n(39, 11, 0.75, 82),
            // Bb1
            n(34, 12, 1.5, 97), n(34, 14, 0.5, 80), n(34, 15, 0.75, 85),
          ], '#ef4444'),
        ],
        effects: [fx('compressor-vca')],
      }),

      // Pad — ambient rach-pad for atmosphere
      t('Pad', 'purple', {
        instrumentType: 'rach-pad',
        volume: -12,
        pan: -30,
        clips: [
          midiClip('', 'Pad — Verse', 0, 32, [
            // Ebmaj9 cloud: Bb4-D5-G5
            n(70, 0, 15.5, 38), n(74, 0, 15.5, 35), n(79, 0, 15.5, 33),
          ], '#9333ea'),
          midiClip('', 'Pad — Build', 32, 32, [
            // Cm9 → Ebmaj7 wash: G4-Bb4-D5-Eb5
            n(67, 0, 7.5, 40), n(70, 0, 7.5, 37), n(74, 0, 7.5, 38), n(75, 0, 7.5, 35),
            // Ebmaj7#11: Bb4-D5-F5-A5
            n(70, 8, 7.5, 42), n(74, 8, 7.5, 38), n(77, 8, 7.5, 40), n(81, 8, 7.5, 36),
          ], '#9333ea'),
        ],
        effects: [fx('reverb-convolution'), fx('auto-pan')],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#06b6d4'),
      section('Build', 32, 32, '#9333ea'),
    ],
  }),
);

// ─── Export ─────────────────────────────────────────────────────────────────────

export const rAndBTemplates: ProjectTemplate[] = [
  modernRnB,
  neoSoul,
  classicSoul,
  contemporaryRnB,
];
