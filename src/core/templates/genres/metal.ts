import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── 1. Thrash Metal ────────────────────────────────────────────────────────
// Key: E minor, 180 BPM, aggressive palm-muted riffs with galloping bass

const thrashMetalMeta = meta(
  'Thrash Metal',
  'metal',
  'advanced',
  'Aggressive thrash metal in E minor at 180 BPM with fast palm-muted riffs, '
  + 'galloping bass lines, and tight double-kick patterns. Inspired by Metallica and Megadeth.',
  16,
  ['thrash', 'metal', 'aggressive', 'fast', 'palm-mute', 'gallop'],
);

const thrashMetalProject = buildTemplateProject({
  title: 'Thrash Metal',
  genre: 'Metal',
  tempo: 180,
  tracks: [
    // Rhythm Guitar — palm-muted E5 power chord riffs
    t('Rhythm Guitar', 'red', {
      instrumentType: 'subtractive',
      volume: -2,
      pan: -25,
      clips: [
        midiClip('', 'Riff — Verse', 0, 32, [
          // E5 power chord: E2-B2 (palm muted, staccato)
          n(40, 0, 0.25, 100), n(47, 0, 0.25, 95),
          n(40, 0.5, 0.25, 98), n(47, 0.5, 0.25, 93),
          n(40, 1, 0.25, 100), n(47, 1, 0.25, 95),
          n(40, 1.5, 0.25, 96), n(47, 1.5, 0.25, 91),
          // F5 power chord: F2-C3 (chromatic shift)
          n(41, 2, 0.25, 100), n(48, 2, 0.25, 95),
          n(41, 2.5, 0.25, 96), n(48, 2.5, 0.25, 91),
          // Back to E5
          n(40, 3, 0.25, 100), n(47, 3, 0.25, 95),
          n(40, 3.5, 0.25, 98), n(47, 3.5, 0.25, 93),
          // G5: G2-D3
          n(43, 4, 0.5, 100), n(50, 4, 0.5, 95),
          n(40, 4.5, 0.25, 96), n(47, 4.5, 0.25, 91),
          // E5 gallop pattern
          n(40, 5, 0.25, 100), n(47, 5, 0.25, 95),
          n(40, 5.25, 0.25, 95), n(47, 5.25, 0.25, 90),
          n(40, 5.5, 0.5, 100), n(47, 5.5, 0.5, 95),
          n(40, 6, 0.25, 100), n(47, 6, 0.25, 95),
          n(40, 6.25, 0.25, 95), n(47, 6.25, 0.25, 90),
          n(40, 6.5, 0.5, 100), n(47, 6.5, 0.5, 95),
          // A5: A2-E3
          n(45, 7, 0.5, 100), n(52, 7, 0.5, 95),
          n(43, 7.5, 0.5, 98), n(50, 7.5, 0.5, 93),
        ], '#ef4444'),
        midiClip('', 'Riff — Breakdown', 32, 32, [
          // Open E5 power chord, half-time feel
          n(40, 0, 2, 100), n(47, 0, 2, 95), n(52, 0, 2, 90),
          n(43, 4, 2, 100), n(50, 4, 2, 95), n(55, 4, 2, 90),
          n(41, 8, 2, 100), n(48, 8, 2, 95), n(53, 8, 2, 90),
          n(40, 12, 2, 100), n(47, 12, 2, 95), n(52, 12, 2, 90),
        ], '#ef4444'),
      ],
      effects: [fx('distortion'), fx('parametric-eq'), fx('compressor-vca')],
    }),

    // Lead Guitar — melodic fragments
    t('Lead Guitar', 'orange', {
      instrumentType: 'subtractive',
      volume: -5,
      pan: 25,
      clips: [
        midiClip('', 'Lead — Fill', 32, 32, [
          // E minor pentatonic run
          n(64, 0, 0.5, 90), n(67, 0.5, 0.5, 88),
          n(69, 1, 0.5, 92), n(72, 1.5, 0.5, 90),
          n(76, 2, 1, 95), // held B5
          n(72, 4, 0.5, 88), n(69, 4.5, 0.5, 86),
          n(67, 5, 1.5, 92), // sustained G4
          n(64, 8, 2, 95), // resolve to E4
          n(67, 12, 3, 90),
        ], '#f97316'),
      ],
      effects: [fx('distortion'), fx('delay-tape'), fx('reverb-algorithmic')],
    }),

    // Bass — galloping pattern
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Bass — Verse', 0, 32, [
          // E1 gallop
          n(28, 0, 0.25, 100), n(28, 0.25, 0.25, 95), n(28, 0.5, 0.5, 100),
          n(28, 1, 0.25, 100), n(28, 1.25, 0.25, 95), n(28, 1.5, 0.5, 100),
          // F1
          n(29, 2, 0.25, 100), n(29, 2.5, 0.5, 98),
          // E1
          n(28, 3, 0.25, 100), n(28, 3.25, 0.25, 95), n(28, 3.5, 0.5, 100),
          // G1
          n(31, 4, 0.5, 100), n(28, 4.5, 0.25, 95),
          // E1 gallop
          n(28, 5, 0.25, 100), n(28, 5.25, 0.25, 95), n(28, 5.5, 0.5, 100),
          n(28, 6, 0.25, 100), n(28, 6.25, 0.25, 95), n(28, 6.5, 0.5, 100),
          // A1
          n(33, 7, 0.5, 100), n(31, 7.5, 0.5, 98),
        ], '#9333ea'),
        midiClip('', 'Bass — Breakdown', 32, 32, [
          n(28, 0, 2, 100),
          n(31, 4, 2, 100),
          n(29, 8, 2, 100),
          n(28, 12, 2, 100),
        ], '#9333ea'),
      ],
      effects: [fx('distortion'), fx('compressor-vca')],
    }),
  ],
  sections: [
    section('Verse', 0, 16, '#ef4444'),
    section('Pre-Chorus', 16, 16, '#f97316'),
    section('Breakdown', 32, 32, '#991b1b'),
  ],
});

// ─── 2. Heavy Metal ─────────────────────────────────────────────────────────
// Key: A minor, 150 BPM, classic Iron Maiden-style twin harmonies

const heavyMetalMeta = meta(
  'Heavy Metal',
  'metal',
  'intermediate',
  'Classic heavy metal in A minor at 150 BPM with twin guitar harmonies, '
  + 'galloping rhythm, and powerful chord progressions. Inspired by Iron Maiden and Judas Priest.',
  16,
  ['heavy-metal', 'classic', 'twin-harmony', 'gallop', 'power-chords'],
);

const heavyMetalProject = buildTemplateProject({
  title: 'Heavy Metal',
  genre: 'Metal',
  tempo: 150,
  tracks: [
    // Guitar 1 — harmony line (3rds above)
    t('Guitar 1', 'red', {
      instrumentType: 'subtractive',
      volume: -4,
      pan: -30,
      clips: [
        midiClip('', 'Harmony 1', 0, 32, [
          // A minor melody: A4-B4-C5-D5-E5
          n(69, 0, 1, 92), n(71, 1, 1, 88), n(72, 2, 1, 90),
          n(74, 3, 1, 88), n(76, 4, 2, 95),
          n(74, 6, 1, 88), n(72, 7, 1, 90),
          n(69, 8, 2, 92), n(72, 10, 1, 88),
          n(76, 11, 1, 90), n(74, 12, 2, 92),
          n(72, 14, 1, 88), n(69, 15, 1, 90),
        ], '#ef4444'),
        midiClip('', 'Power Chords 1', 32, 32, [
          // Am5: A2-E3
          n(45, 0, 2, 100), n(52, 0, 2, 95),
          // C5: C3-G3
          n(48, 4, 2, 100), n(55, 4, 2, 95),
          // G5: G2-D3
          n(43, 8, 2, 100), n(50, 8, 2, 95),
          // Em5: E2-B2
          n(40, 12, 2, 100), n(47, 12, 2, 95),
        ], '#ef4444'),
      ],
      effects: [fx('distortion'), fx('parametric-eq')],
    }),

    // Guitar 2 — harmony (3rds below / unison)
    t('Guitar 2', 'orange', {
      instrumentType: 'subtractive',
      volume: -4,
      pan: 30,
      clips: [
        midiClip('', 'Harmony 2', 0, 32, [
          // Harmonized a 3rd above in A natural minor
          n(72, 0, 1, 92), n(74, 1, 1, 88), n(76, 2, 1, 90),
          n(77, 3, 1, 88), n(79, 4, 2, 95),
          n(77, 6, 1, 88), n(76, 7, 1, 90),
          n(72, 8, 2, 92), n(76, 10, 1, 88),
          n(79, 11, 1, 90), n(77, 12, 2, 92),
          n(76, 14, 1, 88), n(72, 15, 1, 90),
        ], '#f97316'),
        midiClip('', 'Power Chords 2', 32, 32, [
          n(45, 0, 2, 100), n(52, 0, 2, 95),
          n(48, 4, 2, 100), n(55, 4, 2, 95),
          n(43, 8, 2, 100), n(50, 8, 2, 95),
          n(40, 12, 2, 100), n(47, 12, 2, 95),
        ], '#f97316'),
      ],
      effects: [fx('distortion'), fx('parametric-eq')],
    }),

    // Bass
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Bass', 0, 64, [
          // Following guitar harmony
          n(33, 0, 1, 95), n(33, 1, 1, 90), n(33, 2, 1, 92),
          n(33, 3, 1, 90), n(33, 4, 2, 95),
          n(33, 6, 1, 90), n(33, 7, 1, 92),
          n(33, 8, 2, 95), n(36, 10, 1, 90),
          n(33, 11, 1, 92), n(33, 12, 2, 95),
          n(36, 14, 1, 90), n(33, 15, 1, 92),
          // Power chord section
          n(33, 16, 2, 100),
          n(36, 20, 2, 100),
          n(31, 24, 2, 100),
          n(28, 28, 2, 100),
        ], '#9333ea'),
      ],
      effects: [fx('compressor-vca'), fx('distortion')],
    }),
  ],
  sections: [
    section('Harmony', 0, 32, '#ef4444'),
    section('Power', 32, 32, '#7c3aed'),
  ],
});

// ─── 3. Doom Metal ──────────────────────────────────────────────────────────
// Key: C# minor, 65 BPM, slow, crushing, and heavy with long sustained chords

const doomMetalMeta = meta(
  'Doom Metal',
  'metal',
  'intermediate',
  'Crushingly slow doom metal in C# minor at 65 BPM. Massive downtuned power chords, '
  + 'glacial tempo, and oppressive atmosphere. Inspired by Black Sabbath and Electric Wizard.',
  32,
  ['doom', 'metal', 'slow', 'heavy', 'crushing', 'sabbath'],
);

const doomMetalProject = buildTemplateProject({
  title: 'Doom Metal',
  genre: 'Metal',
  tempo: 65,
  tracks: [
    // Guitar — massive sustained power chords
    t('Guitar', 'red', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Doom Riff', 0, 64, [
          // C#5: C#2-G#2 — long, crushing sustain
          n(37, 0, 8, 100), n(44, 0, 8, 95),
          // E5: E2-B2
          n(40, 8, 8, 100), n(47, 8, 8, 95),
          // B4: B1-F#2
          n(35, 16, 8, 100), n(42, 16, 8, 95),
          // A4: A1-E2
          n(33, 24, 8, 100), n(40, 24, 8, 95),
          // Repeat with variation
          n(37, 32, 6, 100), n(44, 32, 6, 95),
          n(40, 38, 2, 98), n(47, 38, 2, 93),
          n(40, 40, 8, 100), n(47, 40, 8, 95),
          n(37, 48, 16, 100), n(44, 48, 16, 95),
        ], '#991b1b'),
        midiClip('', 'Doom Riff II', 64, 64, [
          // Tritone doom: C#2-G2 (diminished 5th)
          n(37, 0, 12, 100), n(43, 0, 12, 95),
          // Resolve to E5 power chord
          n(40, 12, 12, 100), n(47, 12, 12, 95),
          // Drop to A: A1-E2
          n(33, 24, 16, 100), n(40, 24, 16, 95),
          // Long C# fade
          n(37, 40, 24, 100), n(44, 40, 24, 95),
        ], '#991b1b'),
      ],
      effects: [fx('distortion'), fx('reverb-convolution'), fx('parametric-eq')],
    }),

    // Bass — octave-doubled root notes
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: 0,
      clips: [
        midiClip('', 'Doom Bass', 0, 64, [
          n(25, 0, 8, 100), // C#1
          n(28, 8, 8, 100),  // E1
          n(23, 16, 8, 100), // B0
          n(21, 24, 8, 100), // A0
          n(25, 32, 6, 100),
          n(28, 38, 2, 98),
          n(28, 40, 8, 100),
          n(25, 48, 16, 100),
        ], '#7c3aed'),
        midiClip('', 'Doom Bass II', 64, 64, [
          n(25, 0, 12, 100),
          n(28, 12, 12, 100),
          n(21, 24, 16, 100),
          n(25, 40, 24, 100),
        ], '#7c3aed'),
      ],
      effects: [fx('distortion'), fx('compressor-vca')],
    }),

    // Atmosphere — eerie pad
    t('Atmosphere', 'blue', {
      instrumentType: 'rach-pad',
      volume: -14,
      clips: [
        midiClip('', 'Eerie Pad', 0, 128, [
          // C#m: C#4-E4-G#4
          n(61, 0, 32, 45), n(64, 0, 32, 42), n(68, 0, 32, 40),
          // Em: E4-G4-B4
          n(64, 32, 32, 45), n(67, 32, 32, 42), n(71, 32, 32, 40),
          // Bm: B3-D4-F#4
          n(59, 64, 32, 42), n(62, 64, 32, 40), n(66, 64, 32, 38),
          // C#m: resolve
          n(61, 96, 32, 45), n(64, 96, 32, 42), n(68, 96, 32, 40),
        ], '#1e40af'),
      ],
      effects: [fx('reverb-convolution'), fx('delay-tape')],
    }),
  ],
  sections: [
    section('Descent', 0, 32, '#991b1b'),
    section('Crush', 32, 32, '#7f1d1d'),
    section('Abyss', 64, 32, '#450a0a'),
    section('Doom', 96, 32, '#991b1b'),
  ],
});

// ─── 4. Progressive Metal ───────────────────────────────────────────────────
// Key: B minor, 160 BPM, odd time signatures, technical riffs

const progMetalMeta = meta(
  'Progressive Metal',
  'metal',
  'advanced',
  'Technical progressive metal in B minor with shifting time feels, '
  + 'polyrhythmic riffs, and melodic interludes. Inspired by Dream Theater and Tool.',
  16,
  ['progressive', 'metal', 'technical', 'polyrhythm', 'odd-time'],
);

const progMetalProject = buildTemplateProject({
  title: 'Progressive Metal',
  genre: 'Metal',
  tempo: 160,
  timeSignature: [7, 8],
  tracks: [
    // Guitar — technical riff in 7/8
    t('Guitar', 'red', {
      instrumentType: 'subtractive',
      volume: -3,
      clips: [
        midiClip('', 'Tech Riff', 0, 56, [
          // 7/8 riff pattern (3.5 beats per bar, 16 bars = 56 beats)
          // Bar 1: B2-F#3 power chord in 7/8
          n(35, 0, 0.5, 100), n(42, 0, 0.5, 95),
          n(35, 0.5, 0.5, 95), n(42, 0.5, 0.5, 90),
          n(37, 1, 0.5, 98), n(44, 1, 0.5, 93),
          n(35, 1.5, 0.5, 100), n(42, 1.5, 0.5, 95),
          n(40, 2, 0.5, 96), n(47, 2, 0.5, 91),
          n(35, 2.5, 0.5, 98), n(42, 2.5, 0.5, 93),
          n(33, 3, 0.5, 100), n(40, 3, 0.5, 95),
          // Bar 2
          n(35, 3.5, 0.5, 100), n(42, 3.5, 0.5, 95),
          n(38, 4, 0.5, 96), n(45, 4, 0.5, 91),
          n(35, 4.5, 0.5, 98), n(42, 4.5, 0.5, 93),
          n(40, 5, 0.5, 100), n(47, 5, 0.5, 95),
          n(42, 5.5, 0.5, 96), n(49, 5.5, 0.5, 91),
          n(40, 6, 0.5, 98), n(47, 6, 0.5, 93),
          n(38, 6.5, 0.5, 100), n(45, 6.5, 0.5, 95),
        ], '#ef4444'),
        midiClip('', 'Melodic Section', 56, 56, [
          // Melodic interlude: B minor arpeggios
          n(71, 0, 2, 85), n(74, 2, 2, 82), n(78, 4, 3, 88),
          n(76, 7, 2, 82), n(74, 9, 2, 85), n(71, 11, 3, 88),
          n(66, 14, 3, 82), n(69, 17, 2, 85), n(71, 19, 2, 88),
          n(74, 21, 7, 90),
        ], '#ef4444'),
      ],
      effects: [fx('distortion'), fx('parametric-eq'), fx('compressor-vca')],
    }),

    // Bass — follows riff in unison
    t('Bass', 'purple', {
      instrumentType: 'subtractive',
      volume: -1,
      clips: [
        midiClip('', 'Bass Riff', 0, 56, [
          n(23, 0, 0.5, 100), n(23, 0.5, 0.5, 95),
          n(25, 1, 0.5, 98), n(23, 1.5, 0.5, 100),
          n(28, 2, 0.5, 96), n(23, 2.5, 0.5, 98),
          n(21, 3, 0.5, 100),
          n(23, 3.5, 0.5, 100), n(26, 4, 0.5, 96),
          n(23, 4.5, 0.5, 98), n(28, 5, 0.5, 100),
          n(30, 5.5, 0.5, 96), n(28, 6, 0.5, 98),
          n(26, 6.5, 0.5, 100),
        ], '#7c3aed'),
        midiClip('', 'Bass Melodic', 56, 56, [
          n(35, 0, 2, 85), n(38, 2, 2, 82), n(42, 4, 3, 88),
          n(40, 7, 2, 82), n(38, 9, 2, 85), n(35, 11, 3, 88),
          n(30, 14, 3, 82), n(33, 17, 2, 85), n(35, 19, 2, 88),
          n(38, 21, 7, 90),
        ], '#7c3aed'),
      ],
      effects: [fx('compressor-vca'), fx('distortion')],
    }),

    // Keys — atmospheric layer
    t('Keys', 'cyan', {
      instrumentType: 'fm',
      volume: -10,
      clips: [
        midiClip('', 'Atmos', 56, 56, [
          // B minor wash during melodic section
          n(59, 0, 14, 50), n(62, 0, 14, 47), n(66, 0, 14, 45),
          n(57, 14, 14, 50), n(61, 14, 14, 47), n(64, 14, 14, 45),
        ], '#06b6d4'),
      ],
      effects: [fx('reverb-convolution'), fx('delay-pingpong')],
    }),
  ],
  sections: [
    section('Tech Riff', 0, 28, '#ef4444'),
    section('Variation', 28, 28, '#dc2626'),
    section('Melodic', 56, 28, '#06b6d4'),
    section('Resolve', 84, 28, '#3b82f6'),
  ],
});

// ─── Export ──────────────────────────────────────────────────────────────────

export const metalTemplates: ProjectTemplate[] = [
  template(thrashMetalMeta, thrashMetalProject),
  template(heavyMetalMeta, heavyMetalProject),
  template(doomMetalMeta, doomMetalProject),
  template(progMetalMeta, progMetalProject),
];
