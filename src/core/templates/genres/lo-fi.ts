import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ---------------------------------------------------------------------------
// 1. Lo-Fi Chill — warm, relaxed F major 7th chords
// ---------------------------------------------------------------------------

const loFiChillMeta = meta(
  'Lo-Fi Chill',
  'lo-fi',
  'beginner',
  'Warm, relaxed chords in F major with lush 7ths. A filtered, dreamy starting point for laid-back beats.',
  16,
  ['lo-fi', 'chill', 'relaxed', 'piano', 'bass', '7ths'],
);

const loFiChillPianoClip = midiClip('', 'Chill Chords', 0, 64, [
  // Bar 1-2: Fmaj7 (F3-A3-C4-E4)
  n(53, 0, 7, 78),   // F3
  n(57, 0, 7, 72),   // A3
  n(60, 0, 7, 75),   // C4
  n(64, 0, 7, 70),   // E4

  // Bar 3-4: Dm7 (D3-F3-A3-C4)
  n(50, 8, 7, 76),   // D3
  n(53, 8, 7, 70),   // F3
  n(57, 8, 7, 73),   // A3
  n(60, 8, 7, 68),   // C4

  // Bar 5-6: Bbmaj7 (Bb2-D3-F3-A3)
  n(46, 16, 7, 75),  // Bb2
  n(50, 16, 7, 70),  // D3
  n(53, 16, 7, 72),  // F3
  n(57, 16, 7, 68),  // A3

  // Bar 7-8: C7 (C3-E3-G3-Bb3)
  n(48, 24, 7, 77),  // C3
  n(52, 24, 7, 71),  // E3
  n(55, 24, 7, 74),  // G3
  n(58, 24, 7, 69),  // Bb3

  // Bar 9-10: Fmaj7 (repeat with slight velocity variation)
  n(53, 32, 7, 74),  // F3
  n(57, 32, 7, 70),  // A3
  n(60, 32, 7, 72),  // C4
  n(64, 32, 7, 68),  // E4

  // Bar 11-12: Am7 (A2-C3-E3-G3)
  n(45, 40, 7, 73),  // A2
  n(48, 40, 7, 68),  // C3
  n(52, 40, 7, 71),  // E3
  n(55, 40, 7, 67),  // G3

  // Bar 13-14: Bbmaj7
  n(46, 48, 7, 76),  // Bb2
  n(50, 48, 7, 71),  // D3
  n(53, 48, 7, 73),  // F3
  n(57, 48, 7, 69),  // A3

  // Bar 15-16: C7 → resolve
  n(48, 56, 7, 75),  // C3
  n(52, 56, 7, 70),  // E3
  n(55, 56, 7, 72),  // G3
  n(58, 56, 7, 68),  // Bb3
]);

const loFiChillBassClip = midiClip('', 'Chill Bass', 0, 64, [
  // Root notes following the chord progression, half-note feel
  n(41, 0, 4, 82),   // F2
  n(41, 4, 4, 78),   // F2
  n(38, 8, 4, 80),   // D2
  n(38, 12, 4, 76),  // D2
  n(34, 16, 4, 79),  // Bb1
  n(34, 20, 4, 75),  // Bb1
  n(36, 24, 4, 81),  // C2
  n(36, 28, 4, 77),  // C2
  n(41, 32, 4, 80),  // F2
  n(41, 36, 4, 76),  // F2
  n(33, 40, 4, 78),  // A1
  n(33, 44, 4, 74),  // A1
  n(34, 48, 4, 79),  // Bb1
  n(34, 52, 4, 75),  // Bb1
  n(36, 56, 4, 81),  // C2
  n(36, 60, 4, 77),  // C2
]);

const loFiChillProject = buildTemplateProject({
  title: 'Lo-Fi Chill',
  genre: 'Lo-Fi',
  tempo: 75,
  tracks: [
    t('Piano', 'blue', {
      instrumentType: 'rach-pad',
      volume: -3,
      clips: [loFiChillPianoClip],
      effects: [fx('reverb-algorithmic'), fx('delay-tape'), fx('highlow-pass')],
    }),
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: -5,
      clips: [loFiChillBassClip],
      effects: [fx('highlow-pass')],
    }),
  ],
  sections: [
    section('Intro', 0, 16, '#6366f1'),
    section('Verse', 16, 32, '#8b5cf6'),
    section('Outro', 48, 16, '#6366f1'),
  ],
});

// ---------------------------------------------------------------------------
// 2. Lo-Fi Study — gentle, repetitive A minor melodies
// ---------------------------------------------------------------------------

const loFiStudyMeta = meta(
  'Lo-Fi Study',
  'lo-fi',
  'beginner',
  'Gentle, repetitive melodies in A minor perfect for focus and concentration. Soft FM keys over a warm pad.',
  16,
  ['lo-fi', 'study', 'focus', 'keys', 'pad', 'mellow'],
);

const loFiStudyKeysClip = midiClip('', 'Study Keys', 0, 64, [
  // A repeating, gentle melodic motif in A minor

  // Bar 1-2: descending motif A4-G4-E4-C4
  n(69, 0, 2, 78),   // A4
  n(67, 2, 2, 74),   // G4
  n(64, 4, 2, 72),   // E4
  n(60, 6, 2, 70),   // C4

  // Bar 3-4: ascending response E4-G4-A4-C5
  n(64, 8, 2, 76),   // E4
  n(67, 10, 2, 73),  // G4
  n(69, 12, 2, 77),  // A4
  n(72, 14, 2, 71),  // C5

  // Bar 5-6: variation with F4 and D4
  n(69, 16, 2, 75),  // A4
  n(65, 18, 2, 72),  // F4
  n(64, 20, 2, 74),  // E4
  n(62, 22, 2, 70),  // D4

  // Bar 7-8: resolve to Am
  n(64, 24, 2, 76),  // E4
  n(60, 26, 2, 73),  // C4
  n(57, 28, 4, 78),  // A3 (held longer)

  // Bar 9-12: repeat first motif with softer dynamics
  n(69, 32, 2, 74),  // A4
  n(67, 34, 2, 71),  // G4
  n(64, 36, 2, 70),  // E4
  n(60, 38, 2, 68),  // C4
  n(64, 40, 2, 73),  // E4
  n(67, 42, 2, 70),  // G4
  n(69, 44, 2, 75),  // A4
  n(72, 46, 2, 70),  // C5

  // Bar 13-16: gentle ending
  n(69, 48, 2, 72),  // A4
  n(65, 50, 2, 70),  // F4
  n(64, 52, 3, 74),  // E4 (slightly held)
  n(60, 56, 4, 71),  // C4 (held)
  n(57, 60, 4, 85),  // A3 (final, a touch louder)
]);

const loFiStudyPadClip = midiClip('', 'Study Pad', 0, 64, [
  // Sustained Am and related chords underneath the melody

  // Bar 1-4: Am (A2-C3-E3)
  n(45, 0, 15, 72),  // A2
  n(48, 0, 15, 68),  // C3
  n(52, 0, 15, 70),  // E3

  // Bar 5-8: Fmaj7 (F2-A2-C3-E3)
  n(41, 16, 15, 70), // F2
  n(45, 16, 15, 67), // A2
  n(48, 16, 15, 69), // C3
  n(52, 16, 15, 66), // E3

  // Bar 9-12: Am again
  n(45, 32, 15, 71), // A2
  n(48, 32, 15, 67), // C3
  n(52, 32, 15, 69), // E3

  // Bar 13-16: Em7 (E2-G2-B2-D3)
  n(40, 48, 15, 70), // E2
  n(43, 48, 15, 67), // G2
  n(47, 48, 15, 69), // B2
  n(50, 48, 15, 66), // D3
]);

const loFiStudyProject = buildTemplateProject({
  title: 'Lo-Fi Study',
  genre: 'Lo-Fi',
  tempo: 80,
  tracks: [
    t('Keys', 'cyan', {
      instrumentType: 'fm',
      volume: -4,
      clips: [loFiStudyKeysClip],
      effects: [fx('chorus'), fx('delay-analog')],
    }),
    t('Pad', 'blue', {
      instrumentType: 'rach-pad',
      volume: -8,
      clips: [loFiStudyPadClip],
      effects: [fx('chorus'), fx('reverb-algorithmic')],
    }),
  ],
  sections: [
    section('Loop A', 0, 32, '#06b6d4'),
    section('Loop B', 32, 32, '#0891b2'),
  ],
});

// ---------------------------------------------------------------------------
// 3. Lo-Fi Jazz — jazz-influenced chords (Dm9, G13, Cmaj9)
// ---------------------------------------------------------------------------

const loFiJazzMeta = meta(
  'Lo-Fi Jazz',
  'lo-fi',
  'intermediate',
  'Jazz-influenced lo-fi with rich extended chords — Dm9, G13, Cmaj9. Dusty piano, deep bass, and granular texture.',
  16,
  ['lo-fi', 'jazz', 'extended-chords', 'piano', 'bass', 'texture', 'granular'],
);

const loFiJazzPianoClip = midiClip('', 'Jazz Chords', 0, 64, [
  // Bar 1-4: Dm9 (D3-F3-A3-C4-E4)
  n(50, 0, 7, 80),   // D3
  n(53, 0, 7, 74),   // F3
  n(57, 0.5, 6.5, 76), // A3 (slight strum offset)
  n(60, 0.5, 6.5, 72), // C4
  n(64, 1, 6, 70),   // E4 (9th, staggered)

  // Bar 5-8: G13 (G2-B3-D4-F4-E4) — voiced as G-B-D-F with the 13th (E)
  n(43, 16, 7, 78),  // G2 (root in bass register)
  n(59, 16, 7, 74),  // B3
  n(62, 16.5, 6.5, 73), // D4
  n(65, 16.5, 6.5, 70), // F4 (7th)
  n(64, 17, 6, 72),  // E4 (13th)

  // Bar 9-12: Cmaj9 (C3-E3-G3-B3-D4)
  n(48, 32, 7, 79),  // C3
  n(52, 32, 7, 73),  // E3
  n(55, 32.5, 6.5, 75), // G3
  n(59, 32.5, 6.5, 71), // B3
  n(62, 33, 6, 70),  // D4 (9th)

  // Bar 13-16: Dm9 → G13 turnaround (2 bars each)
  n(50, 48, 3.5, 77),  // D3
  n(53, 48, 3.5, 72),  // F3
  n(57, 48.5, 3, 74),  // A3
  n(60, 48.5, 3, 70),  // C4
  n(64, 49, 2.5, 68),  // E4

  n(43, 56, 7, 76),  // G2
  n(59, 56, 7, 72),  // B3
  n(62, 56.5, 6.5, 71), // D4
  n(65, 56.5, 6.5, 69), // F4
  n(64, 57, 6, 70),  // E4
]);

const loFiJazzBassClip = midiClip('', 'Jazz Bass', 0, 64, [
  // Walking-style bass with chromatic approaches

  // Dm9 section (bar 1-4)
  n(38, 0, 3, 85),   // D2
  n(41, 4, 3, 80),   // F2 (to the 3rd)
  n(33, 8, 3, 82),   // A1
  n(36, 12, 3, 78),  // C2 (chromatic approach to D)

  // G13 section (bar 5-8)
  n(31, 16, 3, 84),  // G1
  n(35, 20, 3, 79),  // B1
  n(38, 24, 3, 81),  // D2
  n(42, 28, 3, 77),  // F#2 (chromatic approach to G)

  // Cmaj9 section (bar 9-12)
  n(36, 32, 3, 83),  // C2
  n(40, 36, 3, 78),  // E2
  n(43, 40, 3, 80),  // G2
  n(35, 44, 3, 76),  // B1

  // Turnaround (bar 13-16)
  n(38, 48, 3, 82),  // D2
  n(36, 52, 3, 78),  // C2
  n(31, 56, 3, 84),  // G1
  n(30, 60, 3, 79),  // F#1 (leading tone back to G)
]);

const loFiJazzTextureClip = midiClip('', 'Vinyl Texture', 0, 64, [
  // Sparse, high-register granular texture — imitating vinyl crackle and warmth
  n(84, 0, 16, 40),  // C6 (very soft, sustained grain)
  n(79, 8, 12, 35),  // G5
  n(86, 20, 14, 38), // D6
  n(81, 32, 16, 42), // A5
  n(88, 40, 10, 36), // E6
  n(76, 50, 14, 40), // E5
]);

const loFiJazzProject = buildTemplateProject({
  title: 'Lo-Fi Jazz',
  genre: 'Lo-Fi',
  tempo: 82,
  tracks: [
    t('Piano', 'orange', {
      instrumentType: 'rach-pad',
      volume: -3,
      clips: [loFiJazzPianoClip],
      effects: [fx('reverb-algorithmic'), fx('compressor-vca'), fx('delay-tape')],
    }),
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -5,
      clips: [loFiJazzBassClip],
      effects: [fx('compressor-vca'), fx('parametric-eq')],
    }),
    t('Texture', 'purple', {
      instrumentType: 'granular',
      volume: -12,
      clips: [loFiJazzTextureClip],
      effects: [fx('reverb-algorithmic'), fx('highlow-pass')],
    }),
  ],
  sections: [
    section('Dm9', 0, 16, '#f97316'),
    section('G13', 16, 16, '#fb923c'),
    section('Cmaj9', 32, 16, '#fdba74'),
    section('Turnaround', 48, 16, '#f97316'),
  ],
});

// ---------------------------------------------------------------------------
// 4. Lo-Fi Bedroom — dreamy, nostalgic, tape-saturated
// ---------------------------------------------------------------------------

const loFiBedroomMeta = meta(
  'Lo-Fi Bedroom',
  'lo-fi',
  'beginner',
  'Dreamy, nostalgic bedroom pop vibes in Db major with gentle arpeggios, warm sub bass, and cassette-style saturation. Perfect for late-night production sessions.',
  16,
  ['lo-fi', 'bedroom', 'dreamy', 'nostalgic', 'tape', 'arpeggio'],
);

const loFiBedroomPianoClip = midiClip('', 'Dreamy Arp', 0, 64, [
  // Dbmaj7 arpeggio: Db4-F4-Ab4-C5
  n(61, 0, 1.5, 72), n(65, 1.5, 1.5, 68), n(68, 3, 1.5, 70), n(72, 4.5, 1.5, 66),
  // Bbm7: Bb3-Db4-F4-Ab4
  n(58, 8, 1.5, 70), n(61, 9.5, 1.5, 66), n(65, 11, 1.5, 68), n(68, 12.5, 1.5, 64),
  // Gbmaj7: Gb3-Bb3-Db4-F4
  n(54, 16, 1.5, 72), n(58, 17.5, 1.5, 68), n(61, 19, 1.5, 70), n(65, 20.5, 1.5, 66),
  // Ab7: Ab3-C4-Eb4-Gb4
  n(56, 24, 1.5, 71), n(60, 25.5, 1.5, 67), n(63, 27, 1.5, 69), n(66, 28.5, 1.5, 65),
  // Repeat with softer dynamics
  n(61, 32, 1.5, 68), n(65, 33.5, 1.5, 64), n(68, 35, 1.5, 66), n(72, 36.5, 1.5, 62),
  n(58, 40, 1.5, 66), n(61, 41.5, 1.5, 62), n(65, 43, 1.5, 64), n(68, 44.5, 1.5, 60),
  n(54, 48, 1.5, 68), n(58, 49.5, 1.5, 64), n(61, 51, 1.5, 66), n(65, 52.5, 1.5, 62),
  n(56, 56, 1.5, 67), n(60, 57.5, 1.5, 63), n(63, 59, 1.5, 65), n(66, 60.5, 1.5, 61),
]);

const loFiBedroomBassClip = midiClip('', 'Sub Bass', 0, 64, [
  n(37, 0, 4, 80), n(37, 4, 4, 76),
  n(34, 8, 4, 78), n(34, 12, 4, 74),
  n(30, 16, 4, 80), n(30, 20, 4, 76),
  n(32, 24, 4, 79), n(32, 28, 4, 75),
  n(37, 32, 4, 78), n(37, 36, 4, 74),
  n(34, 40, 4, 76), n(34, 44, 4, 72),
  n(30, 48, 4, 78), n(30, 52, 4, 74),
  n(32, 56, 4, 77), n(32, 60, 4, 73),
]);

const loFiBedroomProject = buildTemplateProject({
  title: 'Lo-Fi Bedroom',
  genre: 'Lo-Fi',
  tempo: 78,
  tracks: [
    t('Keys', 'purple', {
      instrumentType: 'rach-pad',
      volume: -4,
      clips: [loFiBedroomPianoClip],
      effects: [fx('delay-tape'), fx('reverb-algorithmic'), fx('chorus')],
    }),
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -5,
      clips: [loFiBedroomBassClip],
      effects: [fx('highlow-pass'), fx('compressor-vca')],
    }),
  ],
  sections: [
    section('Dream A', 0, 32, '#9333ea'),
    section('Dream B', 32, 32, '#7c3aed'),
  ],
});

// ---------------------------------------------------------------------------
// 5. Lo-Fi Rain — melancholic Eb minor with granular rain textures
// ---------------------------------------------------------------------------

const loFiRainMeta = meta(
  'Lo-Fi Rain',
  'lo-fi',
  'intermediate',
  'Melancholic lo-fi in Eb minor with soft piano chords, granular rain-like textures, and atmospheric reverb washes. Evokes rainy evenings and quiet contemplation.',
  16,
  ['lo-fi', 'rain', 'melancholic', 'atmospheric', 'piano', 'granular'],
);

const loFiRainPianoClip = midiClip('', 'Rain Chords', 0, 64, [
  // Ebm7: Eb3-Gb3-Bb3-Db4
  n(51, 0, 7, 74), n(54, 0, 7, 70), n(58, 0, 7, 72), n(61, 0, 7, 68),
  // Cb maj7: Cb3-Eb3-Gb3-Bb3
  n(47, 8, 7, 72), n(51, 8, 7, 68), n(54, 8, 7, 70), n(58, 8, 7, 66),
  // Abm7: Ab2-Cb3-Eb3-Gb3
  n(44, 16, 7, 73), n(47, 16, 7, 69), n(51, 16, 7, 71), n(54, 16, 7, 67),
  // Bb7: Bb2-D3-F3-Ab3
  n(46, 24, 7, 75), n(50, 24, 7, 71), n(53, 24, 7, 73), n(56, 24, 7, 69),
  // Repeat softer
  n(51, 32, 7, 70), n(54, 32, 7, 66), n(58, 32, 7, 68), n(61, 32, 7, 64),
  n(47, 40, 7, 68), n(51, 40, 7, 64), n(54, 40, 7, 66), n(58, 40, 7, 62),
  n(44, 48, 7, 70), n(47, 48, 7, 66), n(51, 48, 7, 68), n(54, 48, 7, 64),
  n(46, 56, 7, 72), n(50, 56, 7, 68), n(53, 56, 7, 70), n(56, 56, 7, 66),
]);

const loFiRainTextureClip = midiClip('', 'Rain Texture', 0, 64, [
  // Sparse, high-register granular — rain drops
  n(90, 2, 1, 30), n(86, 5, 1.5, 28), n(92, 9, 0.5, 25),
  n(88, 14, 2, 32), n(84, 18, 1, 27), n(91, 22, 0.5, 24),
  n(87, 26, 1.5, 30), n(93, 31, 0.5, 22),
  n(89, 34, 1, 28), n(85, 38, 2, 30), n(91, 42, 0.5, 25),
  n(88, 46, 1.5, 28), n(86, 50, 1, 26), n(92, 54, 0.5, 23),
  n(90, 58, 2, 30), n(84, 62, 1, 27),
]);

const loFiRainProject = buildTemplateProject({
  title: 'Lo-Fi Rain',
  genre: 'Lo-Fi',
  tempo: 70,
  tracks: [
    t('Piano', 'blue', {
      instrumentType: 'rach-pad',
      volume: -4,
      clips: [loFiRainPianoClip],
      effects: [fx('reverb-convolution'), fx('delay-tape'), fx('highlow-pass')],
    }),
    t('Rain', 'cyan', {
      instrumentType: 'granular',
      volume: -10,
      pan: 20,
      clips: [loFiRainTextureClip],
      effects: [fx('reverb-convolution'), fx('delay-pingpong'), fx('highlow-pass')],
    }),
  ],
  sections: [
    section('Drizzle', 0, 16, '#3b82f6'),
    section('Downpour', 16, 16, '#2563eb'),
    section('Clearing', 32, 16, '#60a5fa'),
    section('Mist', 48, 16, '#3b82f6'),
  ],
});

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------

export const loFiTemplates: ProjectTemplate[] = [
  template(loFiChillMeta, loFiChillProject),
  template(loFiStudyMeta, loFiStudyProject),
  template(loFiJazzMeta, loFiJazzProject),
  template(loFiBedroomMeta, loFiBedroomProject),
  template(loFiRainMeta, loFiRainProject),
];
