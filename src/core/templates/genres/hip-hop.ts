import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ---------------------------------------------------------------------------
// 1. Boom Bap — Classic 90s hip-hop feel
// ---------------------------------------------------------------------------
const boomBap = template(
  meta(
    'Boom Bap',
    'hip-hop',
    'beginner',
    'Classic 90s boom-bap beat with jazzy keys, punchy bass, and hard-hitting drums.',
    16,
    ['boom-bap', '90s', 'hip-hop', 'classic', 'sampled'],
  ),
  buildTemplateProject({
    title: 'Boom Bap',
    genre: 'Hip-Hop',
    tempo: 90,
    tracks: [
      // Keys — jazzy Rhodes-style chords (Cm9 voicings)
      t('Keys', 'blue', {
        instrumentType: 'fm',
        volume: -6,
        clips: [
          midiClip('', 'Keys Loop', 0, 64, [
            // Bar 1-2: Cm9
            n(60, 0, 3.5),   // C4
            n(63, 0, 3.5),   // Eb4
            n(67, 0, 3.5),   // G4
            n(70, 0, 3.5),   // Bb4
            n(74, 0, 3.5),   // D5
            // Bar 3-4: Fm9
            n(65, 8, 3.5),   // F4
            n(68, 8, 3.5),   // Ab4
            n(72, 8, 3.5),   // C5
            n(75, 8, 3.5),   // Eb5
            // Bar 5-6: Gm7
            n(67, 16, 3.5),  // G4
            n(70, 16, 3.5),  // Bb4
            n(74, 16, 3.5),  // D5
            n(77, 16, 3.5),  // F5
            // Bar 7-8: Cm
            n(60, 24, 7),    // C4
            n(63, 24, 7),    // Eb4
            n(67, 24, 7),    // G4
          ]),
        ],
        effects: [fx('compressor-vca')],
      }),

      // Bass — deep boom-bap sub
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -3,
        clips: [
          midiClip('', 'Bass Loop', 0, 64, [
            n(36, 0, 1.5),   // C2
            n(36, 4, 1),      // C2
            n(41, 8, 1.5),   // F2
            n(41, 12, 1),    // F2
            n(43, 16, 1.5),  // G2
            n(43, 20, 1),    // G2
            n(36, 24, 2),    // C2
            n(36, 28, 1),    // C2
          ]),
        ],
        effects: [fx('compressor-vca')],
      }),

      // Drums — hard boom-bap pattern
      t('Drums', 'orange', {
        instrumentType: 'granular',
        volume: -2,
        clips: [
          midiClip('', 'Drum Loop', 0, 64, [
            // Kick (C1=36)
            n(36, 0, 0.5, 120),
            n(36, 5, 0.5, 110),
            n(36, 8, 0.5, 120),
            n(36, 14, 0.5, 100),
            // Snare (D1=38)
            n(38, 4, 0.5, 127),
            n(38, 12, 0.5, 127),
            // Closed hat (F#1=42)
            n(42, 0, 0.25, 80),
            n(42, 2, 0.25, 70),
            n(42, 4, 0.25, 80),
            n(42, 6, 0.25, 70),
            n(42, 8, 0.25, 80),
            n(42, 10, 0.25, 70),
            n(42, 12, 0.25, 80),
            n(42, 14, 0.25, 70),
            // Open hat (Bb1=46)
            n(46, 6.5, 0.5, 90),
            n(46, 14.5, 0.5, 90),
          ]),
        ],
        effects: [fx('compressor-vca')],
      }),
    ],
    sections: [
      section('Intro', 0, 32, '#6366f1'),
      section('Verse', 32, 32, '#22c55e'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 2. Trap — Modern trap with triplet hi-hats
// ---------------------------------------------------------------------------
const trap = template(
  meta(
    'Trap',
    'hip-hop',
    'intermediate',
    'Hard-hitting trap beat with 808 bass, wavetable lead, and signature triplet hi-hat rolls.',
    16,
    ['trap', 'modern', '808', 'triplet', 'hi-hats'],
  ),
  buildTemplateProject({
    title: 'Trap',
    genre: 'Hip-Hop',
    tempo: 140,
    tracks: [
      // 808 Bass — sliding sub bass
      t('808 Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -2,
        clips: [
          midiClip('', '808 Pattern', 0, 64, [
            n(36, 0, 3, 127),    // C2 — long sustained
            n(36, 4, 1, 100),    // C2 — short accent
            n(34, 8, 3, 127),    // Bb1 — drop
            n(31, 14, 2, 120),   // G1 — low hit
            n(36, 16, 4, 127),   // C2 — sustain through bar
            n(34, 22, 1, 110),   // Bb1 — pickup
            n(31, 24, 3, 127),   // G1 — deep
            n(33, 28, 2, 120),   // A1 — rise
          ]),
        ],
        effects: [fx('distortion')],
      }),

      // Lead — dark melodic lead
      t('Lead', 'purple', {
        instrumentType: 'wavetable',
        volume: -8,
        clips: [
          midiClip('', 'Lead Melody', 0, 64, [
            n(72, 0, 1, 90),    // C5
            n(70, 2, 0.5, 80),  // Bb4
            n(67, 3, 1, 90),    // G4
            n(65, 5, 0.5, 80),  // F4
            n(63, 6, 2, 100),   // Eb4
            n(67, 8, 1, 90),    // G4
            n(70, 10, 0.5, 80), // Bb4
            n(72, 11, 1, 95),   // C5
            n(75, 12, 2, 100),  // Eb5
            n(72, 14, 1, 85),   // C5
          ]),
        ],
      }),

      // Hi-hats — triplet rolls
      t('Hi-Hats', 'yellow', {
        instrumentType: 'fm',
        volume: -10,
        clips: [
          midiClip('', 'Hat Rolls', 0, 64, [
            // Straight 8ths
            n(42, 0, 0.25, 100),
            n(42, 1, 0.25, 70),
            n(42, 2, 0.25, 100),
            n(42, 3, 0.25, 70),
            // Triplet roll on beat 3
            n(42, 4, 0.17, 110),
            n(42, 4.33, 0.17, 80),
            n(42, 4.67, 0.17, 90),
            n(42, 5, 0.17, 110),
            n(42, 5.33, 0.17, 80),
            n(42, 5.67, 0.17, 90),
            // Back to straight
            n(42, 6, 0.25, 100),
            n(42, 7, 0.25, 70),
            // Fast triplet roll leading into next bar
            n(42, 7, 0.17, 110),
            n(42, 7.33, 0.17, 90),
            n(42, 7.67, 0.17, 100),
          ]),
        ],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#22c55e'),
      section('Hook', 32, 32, '#ef4444'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 3. Lo-Fi Hip-Hop — Warm, detuned chords in Cm
// ---------------------------------------------------------------------------
const loFi = template(
  meta(
    'Lo-Fi Hip-Hop',
    'hip-hop',
    'beginner',
    'Warm lo-fi hip-hop beat with detuned piano chords in C minor, mellow bass, and tape saturation.',
    16,
    ['lo-fi', 'chill', 'study', 'beats', 'piano', 'tape'],
  ),
  buildTemplateProject({
    title: 'Lo-Fi Hip-Hop',
    genre: 'Hip-Hop',
    tempo: 85,
    tracks: [
      // Piano — warm detuned chords in Cm
      t('Piano', 'cyan', {
        instrumentType: 'rach-pad',
        volume: -5,
        clips: [
          midiClip('', 'Lo-Fi Chords', 0, 64, [
            // Bar 1-2: Cm7 — lazy swing feel
            n(48, 0, 3),      // C3
            n(55, 0, 3),      // G3
            n(58, 0, 3),      // Bb3
            n(63, 0.25, 2.5), // Eb4 (slightly late for swing)
            // Bar 3-4: Ab maj7
            n(44, 8, 3),      // Ab2
            n(55, 8, 3),      // G3 (maj7)
            n(60, 8, 3),      // C4
            n(63, 8.25, 2.5), // Eb4
            // Bar 5-6: Fm7
            n(41, 16, 3),     // F2
            n(53, 16, 3),     // F3
            n(60, 16, 3),     // C4
            n(63, 16.25, 2.5),// Eb4
            // Bar 7-8: G7
            n(43, 24, 3),     // G2
            n(59, 24, 3),     // B3
            n(62, 24, 3),     // D4
            n(65, 24.25, 2.5),// F4
          ]),
        ],
        effects: [fx('reverb-algorithmic'), fx('delay-tape')],
      }),

      // Bass — mellow round bass
      t('Bass', 'green', {
        instrumentType: 'subtractive',
        volume: -4,
        clips: [
          midiClip('', 'Bass Line', 0, 64, [
            n(36, 0, 2),     // C2
            n(36, 3, 1),     // C2
            n(36, 6, 1.5),   // C2
            n(44, 8, 2),     // Ab2
            n(44, 11, 1),    // Ab2
            n(41, 16, 2),    // F2
            n(41, 19, 1),    // F2
            n(41, 22, 1.5),  // F2
            n(43, 24, 2),    // G2
            n(43, 27, 1),    // G2
            n(43, 30, 1.5),  // G2
          ]),
        ],
        effects: [fx('reverb-algorithmic')],
      }),
    ],
    sections: [
      section('Loop A', 0, 32, '#06b6d4'),
      section('Loop B', 32, 32, '#8b5cf6'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 4. Old School — Funky groove with scratches
// ---------------------------------------------------------------------------
const oldSchool = template(
  meta(
    'Old School',
    'hip-hop',
    'intermediate',
    'Funky old-school hip-hop groove with funk keys, deep bass, and turntable scratches.',
    16,
    ['old-school', 'funk', 'scratch', 'turntable', 'groove'],
  ),
  buildTemplateProject({
    title: 'Old School',
    genre: 'Hip-Hop',
    tempo: 95,
    tracks: [
      // Funk Keys — rhythmic stabs
      t('Funk Keys', 'yellow', {
        instrumentType: 'fm',
        volume: -6,
        clips: [
          midiClip('', 'Funk Stabs', 0, 64, [
            // Bar 1-2: F minor funk stab
            n(53, 0, 0.25, 110),   // F3
            n(56, 0, 0.25, 110),   // Ab3
            n(60, 0, 0.25, 110),   // C4
            // Off-beat hit
            n(53, 1.5, 0.25, 90),  // F3
            n(56, 1.5, 0.25, 90),  // Ab3
            n(60, 1.5, 0.25, 90),  // C4
            // Beat 3 stab
            n(53, 4, 0.25, 110),   // F3
            n(56, 4, 0.25, 110),   // Ab3
            n(60, 4, 0.25, 110),   // C4
            // Syncopated hit
            n(55, 5.5, 0.5, 100),  // G3
            n(58, 5.5, 0.5, 100),  // Bb3
            n(62, 5.5, 0.5, 100),  // D4
            // Bar 3-4: Eb stab
            n(51, 8, 0.25, 110),   // Eb3
            n(55, 8, 0.25, 110),   // G3
            n(58, 8, 0.25, 110),   // Bb3
            n(51, 9.5, 0.25, 90),  // Eb3 off-beat
          ]),
        ],
        effects: [fx('parametric-eq'), fx('compressor-vca')],
      }),

      // Bass — funky walking bass
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -3,
        clips: [
          midiClip('', 'Funk Bass', 0, 64, [
            n(41, 0, 1, 110),    // F2
            n(41, 2, 0.5, 90),   // F2
            n(43, 3, 0.5, 100),  // G2
            n(44, 4, 1, 110),    // Ab2
            n(43, 6, 0.5, 90),   // G2
            n(41, 7, 0.5, 100),  // F2
            n(39, 8, 1, 110),    // Eb2
            n(39, 10, 0.5, 90),  // Eb2
            n(41, 11, 0.5, 100), // F2
            n(43, 12, 1.5, 110), // G2
            n(41, 14, 1, 90),    // F2
          ]),
        ],
        effects: [fx('parametric-eq'), fx('compressor-vca')],
      }),

      // Scratch — turntable scratch hits
      t('Scratch', 'green', {
        instrumentType: 'granular',
        volume: -8,
        clips: [
          midiClip('', 'Scratch Hits', 0, 64, [
            // Quick chirp scratches on offbeats
            n(60, 3.5, 0.15, 110),  // forward scratch
            n(62, 3.65, 0.1, 90),   // back scratch
            n(60, 7.5, 0.15, 110),  // forward
            n(62, 7.65, 0.1, 90),   // back
            // Longer tear scratch
            n(60, 11, 0.25, 120),
            n(58, 11.25, 0.15, 100),
            n(60, 11.5, 0.2, 110),
            // Stab scratch before bar 4
            n(60, 15, 0.2, 127),
            n(64, 15.25, 0.15, 100),
            n(60, 15.5, 0.25, 110),
          ]),
        ],
      }),
    ],
    sections: [
      section('Intro', 0, 32, '#f59e0b'),
      section('Verse', 32, 32, '#22c55e'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// 5. Drill — Dark, aggressive UK/NY drill
// ---------------------------------------------------------------------------
const drill = template(
  meta(
    'Drill',
    'hip-hop',
    'advanced',
    'Dark aggressive drill beat in G minor with sliding 808 bass, eerie lead, and atmospheric pads.',
    16,
    ['drill', 'uk-drill', 'dark', '808', 'aggressive', 'slide'],
  ),
  buildTemplateProject({
    title: 'Drill',
    genre: 'Hip-Hop',
    tempo: 140,
    tracks: [
      // 808 Bass — sliding patterns in G minor
      t('808 Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -1,
        clips: [
          midiClip('', '808 Slides', 0, 64, [
            // G minor: G Bb C D Eb F
            n(31, 0, 3, 127),    // G1 — long sustain
            n(29, 4, 1.5, 110),  // F1 — slide down
            n(27, 6, 2, 120),    // Eb1 — low drop
            n(31, 8, 2, 127),    // G1 — back to root
            n(34, 10, 1, 100),   // Bb1 — slide up
            n(36, 12, 4, 127),   // C2 — sustained
            n(31, 16, 2, 120),   // G1
            n(29, 19, 1, 110),   // F1
            n(27, 20, 2, 127),   // Eb1 — low
            n(24, 22, 1, 120),   // C1 — sub drop
            n(31, 24, 4, 127),   // G1 — final sustain
          ]),
        ],
        effects: [fx('distortion'), fx('limiter')],
      }),

      // Lead — eerie drill melody
      t('Lead', 'purple', {
        instrumentType: 'wavetable',
        volume: -9,
        clips: [
          midiClip('', 'Drill Melody', 0, 64, [
            n(79, 0, 0.5, 90),   // G5
            n(77, 1, 0.5, 80),   // F5
            n(75, 2, 1, 95),     // Eb5
            n(72, 4, 0.5, 85),   // C5
            n(70, 5, 1.5, 100),  // Bb4
            n(67, 8, 0.5, 90),   // G4
            n(70, 9, 0.5, 80),   // Bb4
            n(72, 10, 1, 95),    // C5
            n(75, 12, 0.5, 85),  // Eb5
            n(79, 13, 1, 100),   // G5
            n(77, 14, 0.5, 80),  // F5
            n(75, 15, 1, 90),    // Eb5
          ]),
        ],
      }),

      // Pad — dark atmospheric texture
      t('Pad', 'blue', {
        instrumentType: 'rach-pad',
        volume: -12,
        clips: [
          midiClip('', 'Dark Pad', 0, 64, [
            // Gm chord — wide voicing
            n(43, 0, 16, 60),    // G2
            n(58, 0, 16, 50),    // Bb3
            n(62, 0, 16, 50),    // D4
            n(67, 0, 16, 45),    // G4
            // Eb major — key shift
            n(39, 16, 16, 60),   // Eb2
            n(55, 16, 16, 50),   // G3
            n(58, 16, 16, 50),   // Bb3
            n(63, 16, 16, 45),   // Eb4
            // Cm — tension
            n(36, 32, 16, 60),   // C2
            n(55, 32, 16, 50),   // G3
            n(60, 32, 16, 50),   // C4
            n(63, 32, 16, 45),   // Eb4
            // D dim — dark resolution
            n(38, 48, 16, 60),   // D2
            n(53, 48, 16, 50),   // F3
            n(57, 48, 16, 50),   // Ab3 (enharmonic)
            n(62, 48, 16, 45),   // D4
          ]),
        ],
        effects: [fx('limiter')],
      }),
    ],
    sections: [
      section('Build', 0, 32, '#7c3aed'),
      section('Drop', 32, 32, '#dc2626'),
    ],
  }),
);

// ---------------------------------------------------------------------------
// Export
// ---------------------------------------------------------------------------
export const hipHopTemplates: ProjectTemplate[] = [
  boomBap,
  trap,
  loFi,
  oldSchool,
  drill,
];
