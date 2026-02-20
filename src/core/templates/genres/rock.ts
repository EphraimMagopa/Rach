import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── 1. Classic Rock ──────────────────────────────────────────────────────────
// 130 BPM, 16 bars (64 beats), E-A-B power chord progression
// Beginner-friendly with a straightforward verse-chorus structure

const classicRockMeta = meta(
  'Classic Rock',
  'rock',
  'beginner',
  'A driving rock template with power chords in E major. Features distorted guitar, punchy bass, and solid drums in a verse-chorus format.',
  16,
  ['power-chords', 'verse-chorus', 'guitar-driven', 'classic'],
);

const classicRockProject = buildTemplateProject({
  title: 'Classic Rock',
  genre: 'Rock',
  tempo: 130,
  tracks: [
    // Guitar — power chords: E5, A5, B5 over 16 bars
    t('Guitar', 'red', {
      instrumentType: 'subtractive',
      volume: -3,
      effects: [fx('distortion')],
      clips: [
        // Verse (bars 1-8): E5 - A5 - E5 - A5
        midiClip('', 'Verse Chords', 0, 32, [
          // E5 power chord (E3+B3)
          n(52, 0, 3.5),  n(59, 0, 3.5),
          n(52, 4, 3.5),  n(59, 4, 3.5),
          // A5 power chord (A3+E4)
          n(57, 8, 3.5),  n(64, 8, 3.5),
          n(57, 12, 3.5), n(64, 12, 3.5),
          // E5
          n(52, 16, 3.5), n(59, 16, 3.5),
          n(52, 20, 3.5), n(59, 20, 3.5),
          // A5
          n(57, 24, 3.5), n(64, 24, 3.5),
          n(57, 28, 3.5), n(64, 28, 3.5),
        ]),
        // Chorus (bars 9-16): E5 - A5 - B5 - A5
        midiClip('', 'Chorus Chords', 32, 32, [
          // E5
          n(52, 0, 3.5),  n(59, 0, 3.5),
          n(52, 4, 3.5),  n(59, 4, 3.5),
          // A5
          n(57, 8, 3.5),  n(64, 8, 3.5),
          n(57, 12, 3.5), n(64, 12, 3.5),
          // B5 power chord (B3+F#4)
          n(59, 16, 3.5), n(66, 16, 3.5),
          n(59, 20, 3.5), n(66, 20, 3.5),
          // A5
          n(57, 24, 3.5), n(64, 24, 3.5),
          n(57, 28, 3.5), n(64, 28, 3.5),
        ]),
      ],
    }),

    // Bass — root notes following the guitar
    t('Bass', 'orange', {
      instrumentType: 'subtractive',
      volume: -4,
      clips: [
        midiClip('', 'Verse Bass', 0, 32, [
          n(40, 0, 3.5),  // E2
          n(40, 4, 3.5),
          n(45, 8, 3.5),  // A2
          n(45, 12, 3.5),
          n(40, 16, 3.5),
          n(40, 20, 3.5),
          n(45, 24, 3.5),
          n(45, 28, 3.5),
        ]),
        midiClip('', 'Chorus Bass', 32, 32, [
          n(40, 0, 3.5),  // E2
          n(40, 4, 3.5),
          n(45, 8, 3.5),  // A2
          n(45, 12, 3.5),
          n(47, 16, 3.5), // B2
          n(47, 20, 3.5),
          n(45, 24, 3.5), // A2
          n(45, 28, 3.5),
        ]),
      ],
    }),

    // Drums — kick/snare pattern with hi-hats
    t('Drums', 'yellow', {
      instrumentType: 'granular',
      volume: -2,
      clips: [
        midiClip('', 'Rock Beat', 0, 32, [
          // Kick on 1 and 3, snare on 2 and 4 (per bar), hi-hat eighths
          // Bar pattern repeated across 8 bars — simplified to key hits
          n(36, 0, 0.5),  n(38, 4, 0.5),  n(36, 8, 0.5),  n(38, 12, 0.5),
          n(36, 16, 0.5), n(38, 20, 0.5), n(36, 24, 0.5), n(38, 28, 0.5),
          // Hi-hat on every beat
          n(42, 0, 0.25), n(42, 2, 0.25), n(42, 4, 0.25), n(42, 6, 0.25),
          n(42, 8, 0.25), n(42, 10, 0.25), n(42, 12, 0.25), n(42, 14, 0.25),
        ]),
        midiClip('', 'Chorus Beat', 32, 32, [
          // Heavier kick pattern with crash
          n(49, 0, 1),    // Crash on chorus entry
          n(36, 0, 0.5),  n(38, 4, 0.5),  n(36, 8, 0.5),  n(38, 12, 0.5),
          n(36, 16, 0.5), n(36, 18, 0.5), n(38, 20, 0.5),
          n(36, 24, 0.5), n(38, 28, 0.5),
          // Hi-hats
          n(42, 0, 0.25), n(42, 2, 0.25), n(42, 4, 0.25), n(42, 6, 0.25),
          n(42, 8, 0.25), n(42, 10, 0.25), n(42, 12, 0.25), n(42, 14, 0.25),
        ]),
      ],
    }),
  ],
  sections: [
    section('Verse', 0, 32, '#3b82f6'),
    section('Chorus', 32, 32, '#ef4444'),
  ],
});

const classicRock = template(classicRockMeta, classicRockProject);

// ─── 2. Indie Rock ────────────────────────────────────────────────────────────
// 118 BPM, 16 bars (64 beats), arpeggiated Am patterns
// Intermediate with chorus effect and reverb

const indieRockMeta = meta(
  'Indie Rock',
  'rock',
  'intermediate',
  'A shimmery indie rock template with arpeggiated guitar patterns in A minor. Layered with synth textures and lush reverb.',
  16,
  ['arpeggiated', 'indie', 'dreamy', 'chorus-effect', 'a-minor'],
);

const indieRockProject = buildTemplateProject({
  title: 'Indie Rock',
  genre: 'Rock',
  tempo: 118,
  tracks: [
    // Guitar — arpeggiated Am / F / C / G
    t('Guitar', 'cyan', {
      instrumentType: 'wavetable',
      volume: -5,
      effects: [fx('chorus'), fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'Arpeggio A', 0, 32, [
          // Am arpeggio: A3-C4-E4
          n(57, 0, 1), n(60, 1, 1), n(64, 2, 1), n(60, 3, 1),
          // F major arpeggio: F3-A3-C4
          n(53, 4, 1), n(57, 5, 1), n(60, 6, 1), n(57, 7, 1),
          // C major arpeggio: C4-E4-G4
          n(60, 8, 1), n(64, 9, 1), n(67, 10, 1), n(64, 11, 1),
          // G major arpeggio: G3-B3-D4
          n(55, 12, 1), n(59, 13, 1), n(62, 14, 1), n(59, 15, 1),
        ]),
        midiClip('', 'Arpeggio B', 32, 32, [
          // Am with higher voicing
          n(69, 0, 1), n(72, 1, 1), n(76, 2, 1), n(72, 3, 1),
          // F
          n(65, 4, 1), n(69, 5, 1), n(72, 6, 1), n(69, 7, 1),
          // C
          n(72, 8, 1), n(76, 9, 1), n(79, 10, 1), n(76, 11, 1),
          // G
          n(67, 12, 1), n(71, 13, 1), n(74, 14, 1), n(71, 15, 1),
        ]),
      ],
    }),

    // Bass — simple root movement
    t('Bass', 'blue', {
      instrumentType: 'subtractive',
      volume: -4,
      clips: [
        midiClip('', 'Bass Line', 0, 64, [
          n(45, 0, 3),   // A2
          n(41, 4, 3),   // F2
          n(48, 8, 3),   // C3
          n(43, 12, 3),  // G2
          n(45, 16, 3),  n(41, 20, 3),  n(48, 24, 3),  n(43, 28, 3),
          n(45, 32, 3),  n(41, 36, 3),  n(48, 40, 3),  n(43, 44, 3),
          n(45, 48, 3),  n(41, 52, 3),  n(48, 56, 3),  n(43, 60, 3),
        ]),
      ],
    }),

    // Synth — atmospheric pad
    t('Synth', 'purple', {
      instrumentType: 'fm',
      volume: -8,
      effects: [fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'Pad Texture', 0, 64, [
          // Sustained chords, Am - F - C - G (whole notes per 2 bars)
          n(57, 0, 8),  n(60, 0, 8),  n(64, 0, 8),   // Am
          n(53, 8, 8),  n(57, 8, 8),  n(60, 8, 8),   // F
          n(48, 16, 8), n(52, 16, 8), n(55, 16, 8),  // C (lower voicing)
          n(43, 24, 8), n(47, 24, 8), n(50, 24, 8),  // G (lower voicing)
          // Second half — same progression, higher register
          n(69, 32, 8), n(72, 32, 8), n(76, 32, 8),
          n(65, 40, 8), n(69, 40, 8), n(72, 40, 8),
        ]),
      ],
    }),
  ],
});

const indieRock = template(indieRockMeta, indieRockProject);

// ─── 3. Alternative ───────────────────────────────────────────────────────────
// 136 BPM, 16 bars (64 beats), dynamic contrast (quiet-loud)
// Intermediate with Pixies/Nirvana-style dynamics

const alternativeMeta = meta(
  'Alternative',
  'rock',
  'intermediate',
  'A dynamic alternative rock template built on quiet-loud contrast. Distorted lead over atmospheric pads with a punchy transition between sections.',
  16,
  ['dynamic', 'quiet-loud', 'alternative', 'contrast', 'grunge'],
);

const alternativeProject = buildTemplateProject({
  title: 'Alternative',
  genre: 'Rock',
  tempo: 136,
  tracks: [
    // Lead — quiet clean arpeggios then loud distorted power chords
    t('Lead', 'green', {
      instrumentType: 'subtractive',
      volume: -4,
      effects: [fx('distortion')],
      clips: [
        // Quiet section — sparse, clean-feeling (low velocity)
        midiClip('', 'Quiet Lead', 0, 32, [
          n(64, 0, 2, 60),   // E4
          n(67, 4, 2, 55),   // G4
          n(69, 8, 2, 60),   // A4
          n(67, 12, 2, 55),  // G4
          n(64, 16, 2, 60),
          n(62, 20, 2, 55),  // D4
          n(60, 24, 4, 50),  // C4 — held longer
          n(64, 28, 4, 50),  // E4
        ]),
        // Loud section — full power chords
        midiClip('', 'Loud Lead', 32, 32, [
          // Em power chord (E4+B4)
          n(64, 0, 3, 120), n(71, 0, 3, 120),
          n(64, 4, 3, 120), n(71, 4, 3, 120),
          // C5 power chord (C4+G4)
          n(60, 8, 3, 120), n(67, 8, 3, 120),
          n(60, 12, 3, 120), n(67, 12, 3, 120),
          // D5 power chord (D4+A4)
          n(62, 16, 3, 120), n(69, 16, 3, 120),
          n(62, 20, 3, 120), n(69, 20, 3, 120),
          // Em resolving
          n(64, 24, 7, 127), n(71, 24, 7, 127),
        ]),
      ],
    }),

    // Pad — sustained atmospheric bed
    t('Pad', 'blue', {
      instrumentType: 'rach-pad',
      volume: -10,
      effects: [fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'Atmosphere', 0, 32, [
          // Quiet section — ethereal Em chords
          n(52, 0, 16, 45),  // E3
          n(55, 0, 16, 40),  // G3
          n(59, 0, 16, 40),  // B3
          n(48, 16, 16, 45), // C3
          n(52, 16, 16, 40), // E3
          n(55, 16, 16, 40), // G3
        ]),
      ],
    }),

    // Bass — follows the dynamics
    t('Bass', 'orange', {
      instrumentType: 'subtractive',
      volume: -4,
      clips: [
        midiClip('', 'Quiet Bass', 0, 32, [
          n(40, 0, 7, 60),   // E2 — long, subdued
          n(40, 8, 7, 55),
          n(36, 16, 7, 60),  // C2
          n(36, 24, 7, 55),
        ]),
        midiClip('', 'Loud Bass', 32, 32, [
          n(40, 0, 1.5, 110),  // E2 — driving eighth pattern
          n(40, 2, 1.5, 100),
          n(40, 4, 1.5, 110),
          n(40, 6, 1.5, 100),
          n(36, 8, 1.5, 110),  // C2
          n(36, 10, 1.5, 100),
          n(36, 12, 1.5, 110),
          n(36, 14, 1.5, 100),
          n(38, 16, 1.5, 110), // D2
          n(38, 18, 1.5, 100),
          n(38, 20, 1.5, 110),
          n(38, 22, 1.5, 100),
          n(40, 24, 8, 120),   // E2 — big sustain to end
        ]),
      ],
    }),
  ],
  sections: [
    section('Quiet', 0, 32, '#6366f1'),
    section('Loud', 32, 32, '#dc2626'),
  ],
});

const alternative = template(alternativeMeta, alternativeProject);

// ─── 4. Hard Rock ─────────────────────────────────────────────────────────────
// 140 BPM, 16 bars (64 beats), heavy riffs in E minor
// Advanced with dual guitar arrangement

const hardRockMeta = meta(
  'Hard Rock',
  'rock',
  'advanced',
  'A hard-hitting rock template with dual guitar arrangement in E minor. Heavy rhythm riffs with a soaring lead line and aggressive bass.',
  16,
  ['heavy', 'dual-guitar', 'e-minor', 'riffs', 'hard-rock'],
);

const hardRockProject = buildTemplateProject({
  title: 'Hard Rock',
  genre: 'Rock',
  tempo: 140,
  tracks: [
    // Rhythm Guitar — heavy palm-muted riff in Em
    t('Rhythm Guitar', 'red', {
      instrumentType: 'subtractive',
      volume: -3,
      pan: -0.3,
      effects: [fx('distortion')],
      clips: [
        midiClip('', 'Main Riff', 0, 32, [
          // Classic Em riff: E2 staccato pattern with chromatic movement
          n(40, 0, 0.5, 120),   // E2
          n(40, 1, 0.5, 110),
          n(40, 2, 0.5, 120),
          n(43, 3, 0.5, 115),   // G2
          n(45, 4, 1, 120),     // A2
          n(43, 6, 1, 115),     // G2
          n(40, 8, 0.5, 120),   // E2
          n(40, 9, 0.5, 110),
          n(40, 10, 0.5, 120),
          n(41, 11, 0.5, 115),  // F2
          n(40, 12, 2, 120),    // E2 sustained
          n(43, 14, 2, 115),    // G2
        ]),
        midiClip('', 'Bridge Riff', 32, 32, [
          // Heavier pattern with power chords
          n(40, 0, 0.75, 127), n(47, 0, 0.75, 127),  // E2+B2
          n(40, 2, 0.75, 120), n(47, 2, 0.75, 120),
          n(43, 4, 0.75, 127), n(50, 4, 0.75, 127),  // G2+D3
          n(43, 6, 0.75, 120), n(50, 6, 0.75, 120),
          n(45, 8, 0.75, 127), n(52, 8, 0.75, 127),  // A2+E3
          n(43, 10, 0.75, 120), n(50, 10, 0.75, 120), // G2+D3
          n(40, 12, 4, 127),    n(47, 12, 4, 127),    // E2+B2 sustained
        ]),
      ],
    }),

    // Lead Guitar — melodic lines over the riff
    t('Lead Guitar', 'yellow', {
      instrumentType: 'wavetable',
      volume: -5,
      pan: 0.3,
      effects: [fx('delay-tape'), fx('distortion')],
      clips: [
        midiClip('', 'Lead Melody', 0, 32, [
          // E minor pentatonic melody (E4-G4-A4-B4-D5)
          n(76, 0, 2, 100),   // E5
          n(74, 2, 1, 95),    // D5
          n(71, 4, 2, 100),   // B4
          n(69, 6, 1, 90),    // A4
          n(67, 8, 4, 105),   // G4 — held
          n(64, 12, 1, 90),   // E4
          n(67, 14, 1, 95),   // G4
          n(69, 16, 4, 100),  // A4 — held
          n(71, 20, 2, 105),  // B4
          n(74, 22, 2, 100),  // D5
          n(76, 24, 8, 110),  // E5 — long sustain
        ]),
        midiClip('', 'Lead Fill', 32, 32, [
          // Fast pentatonic run
          n(64, 0, 0.5, 110),  // E4
          n(67, 0.5, 0.5, 105),
          n(69, 1, 0.5, 110),
          n(71, 1.5, 0.5, 105),
          n(74, 2, 0.5, 110),  // D5
          n(76, 2.5, 0.5, 115),
          n(79, 3, 2, 120),    // G5 — bend target
          n(76, 6, 2, 110),    // E5
          n(74, 8, 2, 105),    // D5
          n(71, 10, 2, 100),   // B4
          n(76, 12, 4, 120),   // E5 — big sustain
        ]),
      ],
    }),

    // Bass — locked in with the rhythm guitar
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: -3,
      clips: [
        midiClip('', 'Bass Riff', 0, 32, [
          n(28, 0, 0.5, 120),   // E1
          n(28, 1, 0.5, 110),
          n(28, 2, 0.5, 120),
          n(31, 3, 0.5, 115),   // G1
          n(33, 4, 1, 120),     // A1
          n(31, 6, 1, 115),     // G1
          n(28, 8, 0.5, 120),
          n(28, 9, 0.5, 110),
          n(28, 10, 0.5, 120),
          n(29, 11, 0.5, 115),  // F1
          n(28, 12, 2, 120),    // E1
          n(31, 14, 2, 115),    // G1
        ]),
        midiClip('', 'Bridge Bass', 32, 32, [
          n(28, 0, 1.5, 127),   // E1
          n(28, 2, 1.5, 120),
          n(31, 4, 1.5, 127),   // G1
          n(31, 6, 1.5, 120),
          n(33, 8, 1.5, 127),   // A1
          n(31, 10, 1.5, 120),  // G1
          n(28, 12, 4, 127),    // E1 sustained
        ]),
      ],
    }),
  ],
});

const hardRock = template(hardRockMeta, hardRockProject);

// ─── 5. Acoustic Rock ─────────────────────────────────────────────────────────
// 100 BPM, 16 bars (64 beats), gentle finger-picking in G major
// Beginner with warm convolution reverb

const acousticRockMeta = meta(
  'Acoustic Rock',
  'rock',
  'beginner',
  'A warm acoustic rock template with gentle finger-picking patterns in G major. Lush convolution reverb and soft pad accompaniment.',
  16,
  ['acoustic', 'finger-picking', 'g-major', 'gentle', 'warm'],
);

const acousticRockProject = buildTemplateProject({
  title: 'Acoustic Rock',
  genre: 'Rock',
  tempo: 100,
  tracks: [
    // Acoustic Guitar — finger-picking patterns: G - C - Em - D
    t('Acoustic Guitar', 'orange', {
      instrumentType: 'wavetable',
      volume: -4,
      effects: [fx('reverb-convolution')],
      clips: [
        midiClip('', 'Picking A', 0, 32, [
          // G major: G2-B3-D4-G4-B4-D4
          n(43, 0, 1),   // G2 (bass)
          n(59, 0.5, 0.75), // B3
          n(62, 1, 0.75),   // D4
          n(67, 1.5, 0.75), // G4
          n(71, 2, 0.75),   // B4
          n(62, 2.5, 0.75), // D4
          n(43, 3, 0.5),    // G2 (bass)
          n(59, 3.5, 0.5),  // B3
          // C major: C3-E3-G3-C4-E4-G3
          n(48, 4, 1),      // C3
          n(52, 4.5, 0.75), // E3
          n(55, 5, 0.75),   // G3
          n(60, 5.5, 0.75), // C4
          n(64, 6, 0.75),   // E4
          n(55, 6.5, 0.75), // G3
          n(48, 7, 0.5),    // C3
          n(52, 7.5, 0.5),  // E3
        ]),
        midiClip('', 'Picking B', 8, 32, [
          // Em: E2-B3-E4-G4-B4-E4
          n(40, 0, 1),      // E2
          n(59, 0.5, 0.75), // B3
          n(64, 1, 0.75),   // E4
          n(67, 1.5, 0.75), // G4
          n(71, 2, 0.75),   // B4
          n(64, 2.5, 0.75), // E4
          n(40, 3, 0.5),    // E2
          n(59, 3.5, 0.5),  // B3
          // D major: D3-F#3-A3-D4-F#4-A3
          n(50, 4, 1),      // D3
          n(54, 4.5, 0.75), // F#3
          n(57, 5, 0.75),   // A3
          n(62, 5.5, 0.75), // D4
          n(66, 6, 0.75),   // F#4
          n(57, 6.5, 0.75), // A3
          n(50, 7, 0.5),    // D3
          n(54, 7.5, 0.5),  // F#3
        ]),
      ],
    }),

    // Pad — warm sustained chords underneath
    t('Pad', 'green', {
      instrumentType: 'rach-pad',
      volume: -12,
      effects: [fx('reverb-convolution')],
      clips: [
        midiClip('', 'Warm Pad', 0, 64, [
          // G major chord (G3-B3-D4)
          n(55, 0, 16, 50), n(59, 0, 16, 45), n(62, 0, 16, 45),
          // C major chord (C4-E4-G4)
          n(60, 16, 16, 50), n(64, 16, 16, 45), n(67, 16, 16, 45),
          // Em chord (E3-G3-B3)
          n(52, 32, 16, 50), n(55, 32, 16, 45), n(59, 32, 16, 45),
          // D major chord (D4-F#4-A4)
          n(62, 48, 16, 50), n(66, 48, 16, 45), n(69, 48, 16, 45),
        ]),
      ],
    }),
  ],
});

const acousticRock = template(acousticRockMeta, acousticRockProject);

// ─── Export ───────────────────────────────────────────────────────────────────

export const rockTemplates: ProjectTemplate[] = [
  classicRock,
  indieRock,
  alternative,
  hardRock,
  acousticRock,
];
