import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── 1. Classic Soul ────────────────────────────────────────────────────────
// Key: Ab major, 108 BPM, warm Motown-inspired gospel chords with horn stabs

const classicSoulMeta = meta(
  'Classic Soul',
  'soul',
  'beginner',
  'Warm, Motown-inspired soul in Ab major with gospel chord voicings, '
  + 'walking bass, and uplifting horn-like stabs. Perfect starting point for soulful productions.',
  16,
  ['soul', 'motown', 'gospel', 'horns', 'classic', 'warm'],
);

const classicSoulProject = buildTemplateProject({
  title: 'Classic Soul',
  genre: 'Soul',
  tempo: 108,
  tracks: [
    // Keys — Ab - Db - Eb - Cm progression, gospel voicings
    t('Keys', 'yellow', {
      instrumentType: 'rach-pad',
      volume: -3,
      clips: [
        midiClip('', 'Keys — Verse', 0, 32, [
          // Ab major: Ab3-C4-Eb4
          n(56, 0, 1.5, 85), n(60, 0, 1.5, 80), n(63, 0, 1.5, 82),
          n(56, 2, 1.5, 78), n(60, 2, 1.5, 74), n(63, 2, 1.5, 76),
          // Db major: Db4-F4-Ab4
          n(61, 4, 1.5, 85), n(65, 4, 1.5, 80), n(68, 4, 1.5, 82),
          n(61, 6, 1.5, 78), n(65, 6, 1.5, 74), n(68, 6, 1.5, 76),
          // Eb major: Eb4-G4-Bb4
          n(63, 8, 1.5, 85), n(67, 8, 1.5, 80), n(70, 8, 1.5, 82),
          n(63, 10, 1.5, 78), n(67, 10, 1.5, 74), n(70, 10, 1.5, 76),
          // Cm: C4-Eb4-G4
          n(60, 12, 1.5, 83), n(63, 12, 1.5, 78), n(67, 12, 1.5, 80),
          n(60, 14, 1.5, 76), n(63, 14, 1.5, 72), n(67, 14, 1.5, 74),
        ], '#eab308'),
        midiClip('', 'Keys — Chorus', 32, 32, [
          // Db major: sustained, bigger
          n(61, 0, 3.5, 90), n(65, 0, 3.5, 85), n(68, 0, 3.5, 87),
          // Eb major
          n(63, 4, 3.5, 90), n(67, 4, 3.5, 85), n(70, 4, 3.5, 87),
          // Cm7: C4-Eb4-G4-Bb4
          n(60, 8, 3.5, 88), n(63, 8, 3.5, 83), n(67, 8, 3.5, 85), n(70, 8, 3.5, 80),
          // Ab major: resolve
          n(56, 12, 3.5, 90), n(60, 12, 3.5, 85), n(63, 12, 3.5, 87),
        ], '#eab308'),
      ],
      effects: [fx('reverb-algorithmic'), fx('compressor-vca')],
    }),

    // Horns — staccato stabs on the & beats
    t('Horns', 'orange', {
      instrumentType: 'fm',
      volume: -6,
      pan: 20,
      clips: [
        midiClip('', 'Horn Stabs', 0, 32, [
          // Stab on & of 2: Ab4-C5-Eb5
          n(68, 1.5, 0.5, 95), n(72, 1.5, 0.5, 90), n(75, 1.5, 0.5, 92),
          // Stab on & of 4
          n(73, 5.5, 0.5, 93), n(77, 5.5, 0.5, 88), n(80, 5.5, 0.5, 90),
          // Stab on & of 2 (bar 3)
          n(75, 9.5, 0.5, 95), n(79, 9.5, 0.5, 90), n(82, 9.5, 0.5, 92),
          // Stab on & of 4 (bar 4)
          n(72, 13.5, 0.5, 93), n(75, 13.5, 0.5, 88), n(79, 13.5, 0.5, 90),
        ], '#f97316'),
      ],
      effects: [fx('compressor-vca'), fx('reverb-algorithmic')],
    }),

    // Bass — walking bass
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Bass — Verse', 0, 32, [
          // Ab walk: Ab2-C3-Eb3-C3
          n(44, 0, 1, 92), n(48, 1, 1, 85), n(51, 2, 1, 88), n(48, 3, 1, 82),
          // Db walk: Db3-F3-Ab3-F3
          n(49, 4, 1, 92), n(53, 5, 1, 85), n(56, 6, 1, 88), n(53, 7, 1, 82),
          // Eb walk: Eb3-G3-Bb3-G3
          n(51, 8, 1, 92), n(55, 9, 1, 85), n(58, 10, 1, 88), n(55, 11, 1, 82),
          // Cm walk: C3-Eb3-G3-Eb3
          n(48, 12, 1, 90), n(51, 13, 1, 83), n(55, 14, 1, 86), n(51, 15, 1, 80),
        ], '#ef4444'),
        midiClip('', 'Bass — Chorus', 32, 32, [
          n(49, 0, 1, 95), n(37, 1, 0.5, 80), n(49, 2, 1, 90), n(49, 3.5, 0.5, 78),
          n(51, 4, 1, 95), n(39, 5, 0.5, 80), n(51, 6, 1, 90), n(51, 7.5, 0.5, 78),
          n(48, 8, 1, 93), n(60, 9, 0.5, 80), n(48, 10, 1, 88), n(55, 11, 1, 82),
          n(44, 12, 1, 95), n(56, 13, 0.5, 80), n(44, 14, 1.5, 90),
        ], '#ef4444'),
      ],
      effects: [fx('compressor-vca')],
    }),
  ],
  sections: [
    section('Verse', 0, 32, '#eab308'),
    section('Chorus', 32, 32, '#f97316'),
  ],
});

// ─── 2. Neo-Soul Groove ─────────────────────────────────────────────────────
// Key: Eb minor, 92 BPM, D'Angelo/Erykah-inspired groove with 9th chords

const neoSoulGrooveMeta = meta(
  'Neo-Soul Groove',
  'soul',
  'intermediate',
  'Deep pocket groove in Eb minor with rich 9th and 11th chord voicings. '
  + 'Rhodes-style FM keys, warm sub bass, and lush pads inspired by D\'Angelo and Erykah Badu.',
  16,
  ['neo-soul', 'groove', 'rhodes', '9th chords', 'deep pocket'],
);

const neoSoulGrooveProject = buildTemplateProject({
  title: 'Neo-Soul Groove',
  genre: 'Soul',
  tempo: 92,
  tracks: [
    // Rhodes — Ebm9 - Abm9 - Bbm7 - Cb maj7 progression
    t('Rhodes', 'purple', {
      instrumentType: 'fm',
      volume: -4,
      clips: [
        midiClip('', 'Rhodes — A', 0, 32, [
          // Ebm9: Eb3-Gb3-Bb3-Db4-F4
          n(51, 0, 2, 72), n(54, 0, 2, 68), n(58, 0, 2, 70), n(61, 0, 2, 66), n(65, 0, 2, 62),
          n(51, 2.5, 1, 55), n(58, 2.5, 1, 50),
          // Abm9: Ab3-Cb4-Eb4-Gb4-Bb4
          n(56, 4, 2, 72), n(59, 4, 2, 68), n(63, 4, 2, 70), n(66, 4, 2, 66), n(70, 4, 2, 62),
          // Bbm7: Bb3-Db4-F4-Ab4
          n(58, 8, 3.5, 74), n(61, 8, 3.5, 70), n(65, 8, 3.5, 72), n(68, 8, 3.5, 68),
          // Cbmaj7: Cb4-Eb4-Gb4-Bb4
          n(59, 12, 3.5, 72), n(63, 12, 3.5, 68), n(66, 12, 3.5, 70), n(70, 12, 3.5, 66),
        ], '#9333ea'),
        midiClip('', 'Rhodes — B', 32, 32, [
          // Bbm7 — higher register
          n(58, 0, 3, 76), n(61, 0, 3, 72), n(65, 0, 3, 74), n(68, 0, 3, 70),
          // Ebm9 — open voicing
          n(51, 4, 3, 74), n(58, 4, 3, 70), n(61, 4, 3, 72), n(65, 4, 3, 68), n(66, 4, 3, 60),
          // Abm9
          n(56, 8, 3.5, 70), n(59, 8, 3.5, 66), n(63, 8, 3.5, 68), n(70, 8, 3.5, 64),
          // Cbmaj7 resolving
          n(47, 12, 3.5, 72), n(54, 12, 3.5, 68), n(58, 12, 3.5, 70), n(63, 12, 3.5, 66),
        ], '#9333ea'),
      ],
      effects: [fx('chorus'), fx('delay-analog')],
    }),

    // Bass — deep sub with syncopated pocket
    t('Bass', 'green', {
      instrumentType: 'subtractive',
      volume: -2,
      clips: [
        midiClip('', 'Bass — A', 0, 32, [
          n(39, 0, 1.5, 90), n(39, 2, 0.5, 70), n(39, 3, 0.75, 78),
          n(44, 4, 1.5, 90), n(44, 6, 0.5, 70), n(44, 7, 0.75, 78),
          n(46, 8, 1.5, 88), n(46, 10, 0.5, 68), n(46, 11.5, 0.5, 76),
          n(47, 12, 1.5, 90), n(47, 14, 0.5, 70), n(47, 15, 0.75, 78),
        ], '#22c55e'),
        midiClip('', 'Bass — B', 32, 32, [
          n(46, 0, 2, 88), n(46, 3, 0.75, 72),
          n(39, 4, 2, 90), n(39, 7, 0.75, 74),
          n(44, 8, 2, 88), n(44, 11, 0.75, 72),
          n(47, 12, 2, 90), n(46, 14, 1, 78), n(44, 15, 0.75, 72),
        ], '#22c55e'),
      ],
      effects: [fx('compressor-vca')],
    }),

    // Pad — lush atmosphere
    t('Pad', 'blue', {
      instrumentType: 'rach-pad',
      volume: -10,
      pan: -20,
      clips: [
        midiClip('', 'Pad — A', 0, 32, [
          // Ebm9 shell: Bb4-Db5-F5
          n(70, 0, 7.5, 45), n(73, 0, 7.5, 42), n(77, 0, 7.5, 40),
          // Abm: Cb5-Eb5-Gb5
          n(71, 8, 7.5, 45), n(75, 8, 7.5, 42), n(78, 8, 7.5, 40),
        ], '#3b82f6'),
        midiClip('', 'Pad — B', 32, 32, [
          // Bbm7 shell: Db5-F5-Ab5
          n(73, 0, 7.5, 48), n(77, 0, 7.5, 44), n(80, 0, 7.5, 42),
          // Ebm: Bb4-Eb5-Gb5
          n(70, 8, 7.5, 48), n(75, 8, 7.5, 44), n(78, 8, 7.5, 42),
        ], '#3b82f6'),
      ],
      effects: [fx('reverb-algorithmic')],
    }),
  ],
  sections: [
    section('A Section', 0, 32, '#9333ea'),
    section('B Section', 32, 32, '#3b82f6'),
  ],
});

// ─── 3. Gospel Soul ─────────────────────────────────────────────────────────
// Key: C major, 116 BPM, uplifting gospel-influenced soul with choir pads

const gospelSoulMeta = meta(
  'Gospel Soul',
  'soul',
  'advanced',
  'Uplifting gospel-influenced soul in C major with rich 7th and sus4 voicings, '
  + 'call-and-response piano figures, and an anthemic choir-like pad. Inspired by Kirk Franklin and Aretha.',
  16,
  ['gospel', 'soul', 'uplifting', 'choir', 'piano', 'call-response'],
);

const gospelSoulProject = buildTemplateProject({
  title: 'Gospel Soul',
  genre: 'Soul',
  tempo: 116,
  tracks: [
    // Piano — gospel comping with 7th and sus voicings
    t('Piano', 'yellow', {
      instrumentType: 'rach-pad',
      volume: -2,
      clips: [
        midiClip('', 'Piano — Call', 0, 32, [
          // Cmaj7: C3-E3-G3-B3 with rhythmic comping
          n(48, 0, 0.75, 92), n(52, 0, 0.75, 88), n(55, 0, 0.75, 90), n(59, 0, 0.75, 85),
          n(48, 1.5, 0.5, 78), n(52, 1.5, 0.5, 74), n(55, 1.5, 0.5, 76),
          n(48, 2.5, 1, 85), n(52, 2.5, 1, 80), n(55, 2.5, 1, 82), n(59, 2.5, 1, 78),
          // Dm7: D3-F3-A3-C4
          n(50, 4, 0.75, 90), n(53, 4, 0.75, 86), n(57, 4, 0.75, 88), n(60, 4, 0.75, 84),
          n(50, 5.5, 0.5, 76), n(57, 5.5, 0.5, 72),
          n(50, 6.5, 1, 83), n(53, 6.5, 1, 79), n(57, 6.5, 1, 81), n(60, 6.5, 1, 77),
          // Em7: E3-G3-B3-D4
          n(52, 8, 0.75, 92), n(55, 8, 0.75, 88), n(59, 8, 0.75, 90), n(62, 8, 0.75, 85),
          n(52, 9.5, 0.5, 78), n(59, 9.5, 0.5, 74),
          // F maj7: F3-A3-C4-E4
          n(53, 10.5, 1, 88), n(57, 10.5, 1, 84), n(60, 10.5, 1, 86), n(64, 10.5, 1, 82),
          // Gsus4 → G: G3-C4-D4 → G3-B3-D4
          n(55, 12, 1.5, 92), n(60, 12, 1.5, 88), n(62, 12, 1.5, 90),
          n(55, 14, 1.5, 90), n(59, 14, 1.5, 86), n(62, 14, 1.5, 88),
        ], '#eab308'),
        midiClip('', 'Piano — Response', 32, 32, [
          // Am7: A3-C4-E4-G4
          n(57, 0, 0.75, 95), n(60, 0, 0.75, 90), n(64, 0, 0.75, 92), n(67, 0, 0.75, 88),
          n(57, 1.5, 0.5, 80), n(64, 1.5, 0.5, 76),
          n(57, 2.5, 1, 88), n(60, 2.5, 1, 84), n(64, 2.5, 1, 86), n(67, 2.5, 1, 82),
          // Fmaj7: F3-A3-C4-E4
          n(53, 4, 3.5, 93), n(57, 4, 3.5, 88), n(60, 4, 3.5, 90), n(64, 4, 3.5, 86),
          // Gsus4 → G → C: building resolution
          n(55, 8, 1.5, 95), n(60, 8, 1.5, 90), n(62, 8, 1.5, 92),
          n(55, 10, 1.5, 92), n(59, 10, 1.5, 88), n(62, 10, 1.5, 90),
          // Cmaj7: big resolution
          n(48, 12, 3.5, 97), n(52, 12, 3.5, 92), n(55, 12, 3.5, 94), n(59, 12, 3.5, 90), n(60, 12, 3.5, 88),
        ], '#eab308'),
      ],
      effects: [fx('reverb-algorithmic'), fx('compressor-vca')],
    }),

    // Choir Pad — sustained, warm, wide
    t('Choir', 'cyan', {
      instrumentType: 'wavetable',
      volume: -8,
      pan: 0,
      clips: [
        midiClip('', 'Choir — Verse', 0, 32, [
          // Cmaj7: E4-G4-B4
          n(64, 0, 15.5, 55), n(67, 0, 15.5, 52), n(71, 0, 15.5, 50),
        ], '#06b6d4'),
        midiClip('', 'Choir — Chorus', 32, 32, [
          // Am-F: C5-E5-G5 → A4-C5-E5
          n(72, 0, 7.5, 60), n(76, 0, 7.5, 56), n(79, 0, 7.5, 54),
          n(69, 8, 7.5, 62), n(72, 8, 7.5, 58), n(76, 8, 7.5, 56),
        ], '#06b6d4'),
      ],
      effects: [fx('reverb-convolution'), fx('chorus')],
    }),

    // Bass — gospel bass with runs
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Bass — Verse', 0, 32, [
          n(48, 0, 1, 92), n(48, 1.5, 0.5, 78), n(50, 2, 0.5, 80), n(52, 2.5, 0.5, 82),
          n(50, 4, 1, 90), n(50, 5.5, 0.5, 76), n(53, 6, 0.5, 78), n(55, 6.5, 0.5, 80),
          n(52, 8, 1, 92), n(53, 9, 0.5, 78), n(55, 9.5, 0.5, 80),
          n(55, 12, 1, 94), n(55, 14, 0.5, 80), n(53, 14.5, 0.5, 78), n(52, 15, 0.5, 76), n(50, 15.5, 0.5, 74),
        ], '#ef4444'),
        midiClip('', 'Bass — Chorus', 32, 32, [
          n(45, 0, 1, 93), n(45, 1.5, 0.5, 78), n(48, 2, 0.5, 80),
          n(53, 4, 1, 92), n(53, 5.5, 0.5, 76), n(55, 6, 1, 80),
          n(55, 8, 1, 94), n(55, 10, 0.5, 80), n(53, 10.5, 0.5, 78),
          n(48, 12, 2, 96), n(48, 14.5, 1, 82),
        ], '#ef4444'),
      ],
      effects: [fx('compressor-vca')],
    }),
  ],
  sections: [
    section('Call', 0, 32, '#eab308'),
    section('Response', 32, 32, '#06b6d4'),
  ],
});

// ─── Export ──────────────────────────────────────────────────────────────────

export const soulTemplates: ProjectTemplate[] = [
  template(classicSoulMeta, classicSoulProject),
  template(neoSoulGrooveMeta, neoSoulGrooveProject),
  template(gospelSoulMeta, gospelSoulProject),
];
