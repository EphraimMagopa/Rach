import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── 1. Roots Reggae ────────────────────────────────────────────────────────
// Key: G major, 78 BPM, classic one-drop rhythm with organ bubble

const rootsReggaeMeta = meta(
  'Roots Reggae',
  'reggae',
  'beginner',
  'Classic roots reggae in G major at 78 BPM with one-drop rhythm, '
  + 'organ bubble, and deep bass. Inspired by Bob Marley and Peter Tosh.',
  16,
  ['reggae', 'roots', 'one-drop', 'organ', 'jamaica', 'classic'],
);

const rootsReggaeProject = buildTemplateProject({
  title: 'Roots Reggae',
  genre: 'Reggae',
  tempo: 78,
  tracks: [
    // Organ — classic reggae bubble (offbeat chords)
    t('Organ', 'green', {
      instrumentType: 'fm',
      volume: -5,
      clips: [
        midiClip('', 'Organ Bubble', 0, 64, [
          // G major: G3-B3-D4 — offbeat staccato chops
          // Bar 1-4
          n(55, 1, 0.5, 78), n(59, 1, 0.5, 74), n(62, 1, 0.5, 76),
          n(55, 3, 0.5, 78), n(59, 3, 0.5, 74), n(62, 3, 0.5, 76),
          // C major: C4-E4-G4
          n(60, 5, 0.5, 78), n(64, 5, 0.5, 74), n(67, 5, 0.5, 76),
          n(60, 7, 0.5, 78), n(64, 7, 0.5, 74), n(67, 7, 0.5, 76),
          // D major: D4-F#4-A4
          n(62, 9, 0.5, 78), n(66, 9, 0.5, 74), n(69, 9, 0.5, 76),
          n(62, 11, 0.5, 78), n(66, 11, 0.5, 74), n(69, 11, 0.5, 76),
          // Em: E3-G3-B3
          n(52, 13, 0.5, 76), n(55, 13, 0.5, 72), n(59, 13, 0.5, 74),
          n(52, 15, 0.5, 76), n(55, 15, 0.5, 72), n(59, 15, 0.5, 74),
          // Repeat pattern bars 5-8
          n(55, 17, 0.5, 78), n(59, 17, 0.5, 74), n(62, 17, 0.5, 76),
          n(55, 19, 0.5, 78), n(59, 19, 0.5, 74), n(62, 19, 0.5, 76),
          n(60, 21, 0.5, 78), n(64, 21, 0.5, 74), n(67, 21, 0.5, 76),
          n(60, 23, 0.5, 78), n(64, 23, 0.5, 74), n(67, 23, 0.5, 76),
          n(62, 25, 0.5, 78), n(66, 25, 0.5, 74), n(69, 25, 0.5, 76),
          n(62, 27, 0.5, 78), n(66, 27, 0.5, 74), n(69, 27, 0.5, 76),
          n(52, 29, 0.5, 76), n(55, 29, 0.5, 72), n(59, 29, 0.5, 74),
          n(52, 31, 0.5, 76), n(55, 31, 0.5, 72), n(59, 31, 0.5, 74),
          // Bars 9-16 (repeat first 8)
          n(55, 33, 0.5, 78), n(59, 33, 0.5, 74), n(62, 33, 0.5, 76),
          n(55, 35, 0.5, 78), n(59, 35, 0.5, 74), n(62, 35, 0.5, 76),
          n(60, 37, 0.5, 78), n(64, 37, 0.5, 74), n(67, 37, 0.5, 76),
          n(60, 39, 0.5, 78), n(64, 39, 0.5, 74), n(67, 39, 0.5, 76),
          n(62, 41, 0.5, 78), n(66, 41, 0.5, 74), n(69, 41, 0.5, 76),
          n(62, 43, 0.5, 78), n(66, 43, 0.5, 74), n(69, 43, 0.5, 76),
          n(52, 45, 0.5, 76), n(55, 45, 0.5, 72), n(59, 45, 0.5, 74),
          n(52, 47, 0.5, 76), n(55, 47, 0.5, 72), n(59, 47, 0.5, 74),
          n(55, 49, 0.5, 78), n(59, 49, 0.5, 74), n(62, 49, 0.5, 76),
          n(55, 51, 0.5, 78), n(59, 51, 0.5, 74), n(62, 51, 0.5, 76),
          n(60, 53, 0.5, 78), n(64, 53, 0.5, 74), n(67, 53, 0.5, 76),
          n(60, 55, 0.5, 78), n(64, 55, 0.5, 74), n(67, 55, 0.5, 76),
          n(62, 57, 0.5, 78), n(66, 57, 0.5, 74), n(69, 57, 0.5, 76),
          n(62, 59, 0.5, 78), n(66, 59, 0.5, 74), n(69, 59, 0.5, 76),
          n(52, 61, 0.5, 76), n(55, 61, 0.5, 72), n(59, 61, 0.5, 74),
          n(52, 63, 0.5, 76), n(55, 63, 0.5, 72), n(59, 63, 0.5, 74),
        ], '#22c55e'),
      ],
      effects: [fx('chorus'), fx('reverb-algorithmic')],
    }),

    // Bass — deep, melodic reggae bass
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Reggae Bass', 0, 64, [
          // G - syncopated one-drop bass
          n(43, 0, 1.5, 95), n(43, 2, 0.5, 78), n(47, 2.5, 1, 82),
          n(48, 4, 1.5, 93), n(48, 6, 0.5, 76), n(52, 6.5, 1, 80),
          n(50, 8, 1.5, 95), n(50, 10, 0.5, 78), n(47, 10.5, 1, 82),
          n(40, 12, 1.5, 90), n(40, 14, 0.5, 76), n(43, 14.5, 1, 80),
          // Repeat bars 5-8
          n(43, 16, 1.5, 95), n(43, 18, 0.5, 78), n(47, 18.5, 1, 82),
          n(48, 20, 1.5, 93), n(48, 22, 0.5, 76), n(52, 22.5, 1, 80),
          n(50, 24, 1.5, 95), n(50, 26, 0.5, 78), n(47, 26.5, 1, 82),
          n(40, 28, 1.5, 90), n(40, 30, 0.5, 76), n(43, 30.5, 1, 80),
          // Bars 9-16 repeat
          n(43, 32, 1.5, 95), n(43, 34, 0.5, 78), n(47, 34.5, 1, 82),
          n(48, 36, 1.5, 93), n(48, 38, 0.5, 76), n(52, 38.5, 1, 80),
          n(50, 40, 1.5, 95), n(50, 42, 0.5, 78), n(47, 42.5, 1, 82),
          n(40, 44, 1.5, 90), n(40, 46, 0.5, 76), n(43, 46.5, 1, 80),
          n(43, 48, 1.5, 95), n(43, 50, 0.5, 78), n(47, 50.5, 1, 82),
          n(48, 52, 1.5, 93), n(48, 54, 0.5, 76), n(52, 54.5, 1, 80),
          n(50, 56, 1.5, 95), n(50, 58, 0.5, 78), n(47, 58.5, 1, 82),
          n(40, 60, 1.5, 90), n(40, 62, 0.5, 76), n(43, 62.5, 1, 80),
        ], '#ef4444'),
      ],
      effects: [fx('compressor-vca'), fx('highlow-pass')],
    }),

    // Guitar — clean skank (offbeat strum)
    t('Guitar', 'yellow', {
      instrumentType: 'subtractive',
      volume: -8,
      pan: 30,
      clips: [
        midiClip('', 'Skank', 0, 64, [
          // G major offbeat skanks — muted, short
          n(67, 1, 0.3, 72), n(71, 1, 0.3, 68), n(74, 1, 0.3, 70),
          n(67, 3, 0.3, 72), n(71, 3, 0.3, 68), n(74, 3, 0.3, 70),
          n(72, 5, 0.3, 72), n(76, 5, 0.3, 68), n(79, 5, 0.3, 70),
          n(72, 7, 0.3, 72), n(76, 7, 0.3, 68), n(79, 7, 0.3, 70),
          n(74, 9, 0.3, 72), n(78, 9, 0.3, 68), n(81, 9, 0.3, 70),
          n(74, 11, 0.3, 72), n(78, 11, 0.3, 68), n(81, 11, 0.3, 70),
          n(64, 13, 0.3, 70), n(67, 13, 0.3, 66), n(71, 13, 0.3, 68),
          n(64, 15, 0.3, 70), n(67, 15, 0.3, 66), n(71, 15, 0.3, 68),
          // Bars 5-8 repeat
          n(67, 17, 0.3, 72), n(71, 17, 0.3, 68), n(74, 17, 0.3, 70),
          n(67, 19, 0.3, 72), n(71, 19, 0.3, 68), n(74, 19, 0.3, 70),
          n(72, 21, 0.3, 72), n(76, 21, 0.3, 68), n(79, 21, 0.3, 70),
          n(72, 23, 0.3, 72), n(76, 23, 0.3, 68), n(79, 23, 0.3, 70),
          n(74, 25, 0.3, 72), n(78, 25, 0.3, 68), n(81, 25, 0.3, 70),
          n(74, 27, 0.3, 72), n(78, 27, 0.3, 68), n(81, 27, 0.3, 70),
          n(64, 29, 0.3, 70), n(67, 29, 0.3, 66), n(71, 29, 0.3, 68),
          n(64, 31, 0.3, 70), n(67, 31, 0.3, 66), n(71, 31, 0.3, 68),
        ], '#eab308'),
      ],
      effects: [fx('highlow-pass'), fx('delay-analog')],
    }),
  ],
  sections: [
    section('Verse', 0, 32, '#22c55e'),
    section('Chorus', 32, 32, '#16a34a'),
  ],
});

// ─── 2. Dub ─────────────────────────────────────────────────────────────────
// Key: D minor, 72 BPM, heavy echo, spacey effects, bass-heavy

const dubMeta = meta(
  'Dub',
  'reggae',
  'intermediate',
  'Spacey dub production in D minor with heavy echo, reverb washes, '
  + 'and bass-heavy mix. Inspired by King Tubby and Lee "Scratch" Perry.',
  16,
  ['dub', 'reggae', 'echo', 'spacey', 'bass-heavy', 'effects'],
);

const dubProject = buildTemplateProject({
  title: 'Dub',
  genre: 'Reggae',
  tempo: 72,
  tracks: [
    // Bass — deep, dubby, slightly distorted
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: 0,
      clips: [
        midiClip('', 'Dub Bass', 0, 64, [
          // Dm — deep, slow, syncopated
          n(38, 0, 2, 100), n(38, 3, 1, 85), n(41, 3.5, 0.5, 78),
          n(36, 4, 2, 98), n(36, 7, 1, 82),
          n(38, 8, 2, 100), n(43, 10, 0.5, 80), n(41, 10.5, 0.5, 78),
          n(38, 12, 3, 96),
          // Repeat bars 5-8
          n(38, 16, 2, 100), n(38, 19, 1, 85), n(41, 19.5, 0.5, 78),
          n(36, 20, 2, 98), n(36, 23, 1, 82),
          n(38, 24, 2, 100), n(43, 26, 0.5, 80), n(41, 26.5, 0.5, 78),
          n(38, 28, 3, 96),
          // Bars 9-16
          n(38, 32, 2, 100), n(38, 35, 1, 85), n(41, 35.5, 0.5, 78),
          n(36, 36, 2, 98), n(36, 39, 1, 82),
          n(38, 40, 2, 100), n(43, 42, 0.5, 80), n(41, 42.5, 0.5, 78),
          n(38, 44, 3, 96),
          n(38, 48, 2, 100), n(38, 51, 1, 85), n(41, 51.5, 0.5, 78),
          n(36, 52, 2, 98), n(36, 55, 1, 82),
          n(38, 56, 2, 100), n(43, 58, 0.5, 80), n(41, 58.5, 0.5, 78),
          n(38, 60, 3, 96),
        ], '#ef4444'),
      ],
      effects: [fx('compressor-vca'), fx('highlow-pass')],
    }),

    // Organ — sparse stabs with heavy delay
    t('Organ', 'green', {
      instrumentType: 'fm',
      volume: -8,
      clips: [
        midiClip('', 'Dub Organ', 0, 64, [
          // Sparse, echoed organ stabs — Dm
          n(62, 1, 0.5, 72), n(65, 1, 0.5, 68), n(69, 1, 0.5, 70),
          // Space...
          n(60, 9, 0.5, 70), n(64, 9, 0.5, 66), n(67, 9, 0.5, 68),
          // More space...
          n(65, 17, 0.5, 68), n(69, 17, 0.5, 64), n(72, 17, 0.5, 66),
          // Sparse
          n(62, 29, 0.5, 72), n(65, 29, 0.5, 68), n(69, 29, 0.5, 70),
          n(60, 41, 0.5, 70), n(64, 41, 0.5, 66), n(67, 41, 0.5, 68),
          n(65, 53, 0.5, 68), n(69, 53, 0.5, 64), n(72, 53, 0.5, 66),
        ], '#22c55e'),
      ],
      effects: [fx('delay-tape'), fx('reverb-convolution'), fx('delay-pingpong')],
    }),

    // Texture — granular noise and effects
    t('Texture', 'cyan', {
      instrumentType: 'granular',
      volume: -14,
      pan: -25,
      clips: [
        midiClip('', 'Dub FX', 0, 64, [
          // Sparse granular textures — echoed percussive hits
          n(80, 4, 2, 45), n(72, 12, 3, 40),
          n(85, 20, 1, 42), n(68, 28, 4, 38),
          n(78, 36, 2, 44), n(90, 44, 1, 35),
          n(74, 52, 3, 40), n(82, 60, 2, 38),
        ], '#06b6d4'),
      ],
      effects: [fx('delay-pingpong'), fx('reverb-convolution'), fx('phaser')],
    }),
  ],
  sections: [
    section('Drop', 0, 16, '#ef4444'),
    section('Space', 16, 16, '#22c55e'),
    section('Echo', 32, 16, '#06b6d4'),
    section('Return', 48, 16, '#ef4444'),
  ],
});

// ─── 3. Dancehall ───────────────────────────────────────────────────────────
// Key: F minor, 95 BPM, modern dancehall riddim with synth bass

const dancehallMeta = meta(
  'Dancehall',
  'reggae',
  'intermediate',
  'Modern dancehall riddim in F minor at 95 BPM with heavy synth bass, '
  + 'bright synth stabs, and energetic production. Inspired by Vybz Kartel and Sean Paul.',
  16,
  ['dancehall', 'reggae', 'riddim', 'synth-bass', 'modern', 'caribbean'],
);

const dancehallProject = buildTemplateProject({
  title: 'Dancehall',
  genre: 'Reggae',
  tempo: 95,
  tracks: [
    // Synth Bass — heavy, modern dancehall bass
    t('Synth Bass', 'red', {
      instrumentType: 'subtractive',
      volume: 0,
      clips: [
        midiClip('', 'Riddim Bass', 0, 64, [
          // F minor — bouncy, rhythmic
          n(41, 0, 0.75, 100), n(41, 1.5, 0.5, 85),
          n(39, 2, 0.75, 98), n(39, 3, 0.5, 82),
          n(36, 4, 0.75, 100), n(36, 5.5, 0.5, 85),
          n(39, 6, 0.75, 96), n(41, 7, 0.5, 82),
          n(41, 8, 0.75, 100), n(41, 9.5, 0.5, 85),
          n(39, 10, 0.75, 98), n(39, 11, 0.5, 82),
          n(36, 12, 0.75, 100), n(36, 13.5, 0.5, 85),
          n(39, 14, 0.75, 96), n(41, 15, 0.5, 82),
          // Bars 5-8
          n(41, 16, 0.75, 100), n(41, 17.5, 0.5, 85),
          n(39, 18, 0.75, 98), n(39, 19, 0.5, 82),
          n(36, 20, 0.75, 100), n(36, 21.5, 0.5, 85),
          n(39, 22, 0.75, 96), n(41, 23, 0.5, 82),
          n(41, 24, 0.75, 100), n(41, 25.5, 0.5, 85),
          n(39, 26, 0.75, 98), n(39, 27, 0.5, 82),
          n(36, 28, 0.75, 100), n(36, 29.5, 0.5, 85),
          n(39, 30, 0.75, 96), n(41, 31, 0.5, 82),
        ], '#ef4444'),
      ],
      effects: [fx('compressor-vca'), fx('distortion')],
    }),

    // Synth stabs — bright, rhythmic
    t('Synth', 'cyan', {
      instrumentType: 'wavetable',
      volume: -6,
      pan: 15,
      clips: [
        midiClip('', 'Stabs', 0, 64, [
          // Fm: F4-Ab4-C5 — offbeat dancehall stabs
          n(65, 1, 0.3, 88), n(68, 1, 0.3, 84), n(72, 1, 0.3, 86),
          n(65, 3, 0.3, 85), n(68, 3, 0.3, 81), n(72, 3, 0.3, 83),
          // Db: Db4-F4-Ab4
          n(61, 5, 0.3, 88), n(65, 5, 0.3, 84), n(68, 5, 0.3, 86),
          n(61, 7, 0.3, 85), n(65, 7, 0.3, 81), n(68, 7, 0.3, 83),
          // Eb: Eb4-G4-Bb4
          n(63, 9, 0.3, 88), n(67, 9, 0.3, 84), n(70, 9, 0.3, 86),
          n(63, 11, 0.3, 85), n(67, 11, 0.3, 81), n(70, 11, 0.3, 83),
          // Cm: C4-Eb4-G4
          n(60, 13, 0.3, 86), n(63, 13, 0.3, 82), n(67, 13, 0.3, 84),
          n(60, 15, 0.3, 83), n(63, 15, 0.3, 79), n(67, 15, 0.3, 81),
          // Repeat bars 5-8
          n(65, 17, 0.3, 88), n(68, 17, 0.3, 84), n(72, 17, 0.3, 86),
          n(65, 19, 0.3, 85), n(68, 19, 0.3, 81), n(72, 19, 0.3, 83),
          n(61, 21, 0.3, 88), n(65, 21, 0.3, 84), n(68, 21, 0.3, 86),
          n(61, 23, 0.3, 85), n(65, 23, 0.3, 81), n(68, 23, 0.3, 83),
          n(63, 25, 0.3, 88), n(67, 25, 0.3, 84), n(70, 25, 0.3, 86),
          n(63, 27, 0.3, 85), n(67, 27, 0.3, 81), n(70, 27, 0.3, 83),
          n(60, 29, 0.3, 86), n(63, 29, 0.3, 82), n(67, 29, 0.3, 84),
          n(60, 31, 0.3, 83), n(63, 31, 0.3, 79), n(67, 31, 0.3, 81),
        ], '#06b6d4'),
      ],
      effects: [fx('delay-pingpong'), fx('highlow-pass')],
    }),

    // Pad — warm atmospheric layer
    t('Pad', 'purple', {
      instrumentType: 'rach-pad',
      volume: -12,
      clips: [
        midiClip('', 'Dancehall Pad', 0, 64, [
          // Fm: F4-Ab4-C5 — sustained
          n(65, 0, 16, 45), n(68, 0, 16, 42), n(72, 0, 16, 40),
          // Db: Db4-F4-Ab4
          n(61, 16, 16, 45), n(65, 16, 16, 42), n(68, 16, 16, 40),
          // Eb: Eb4-G4-Bb4
          n(63, 32, 16, 45), n(67, 32, 16, 42), n(70, 32, 16, 40),
          // Cm: C4-Eb4-G4
          n(60, 48, 16, 42), n(63, 48, 16, 40), n(67, 48, 16, 38),
        ], '#9333ea'),
      ],
      effects: [fx('reverb-algorithmic'), fx('chorus')],
    }),
  ],
  sections: [
    section('Intro', 0, 16, '#ef4444'),
    section('Drop', 16, 16, '#06b6d4'),
    section('Verse', 32, 16, '#9333ea'),
    section('Hook', 48, 16, '#ef4444'),
  ],
});

// ─── Export ──────────────────────────────────────────────────────────────────

export const reggaeTemplates: ProjectTemplate[] = [
  template(rootsReggaeMeta, rootsReggaeProject),
  template(dubMeta, dubProject),
  template(dancehallMeta, dancehallProject),
];
