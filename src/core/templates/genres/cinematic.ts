import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ---------- MIDI note constants ----------
// Octave 1
const C1 = 24;
const Cs1 = 25;
// Octave 2
const C2 = 36;
const D2 = 38;
const E2 = 40;
const F2 = 41;
const G2 = 43;
const A2 = 45;
const B2 = 47;
// Octave 3
const C3 = 48;
const D3 = 50;
const E3 = 52;
const F3 = 53;
const G3 = 55;
const A3 = 57;
const Bb3 = 58;
const B3 = 59;
// Octave 4
const C4 = 60;
const Cs4 = 61;
const D4 = 62;
const E4 = 64;
const F4 = 65;
const Fs4 = 66;
const G4 = 67;
const A4 = 69;
const B4 = 71;
// Octave 5
const C5 = 72;
const D5 = 74;
const E5 = 76;
const F5 = 77;
const Fs5 = 78;
const G5 = 79;
const A5 = 81;

// ============================================================
// 1. Epic Trailer — 100 BPM, 32 bars (128 beats), advanced
// ============================================================
const epicTrailerMeta = meta(
  'Epic Trailer',
  'cinematic',
  'advanced',
  'Massive orchestral trailer cue with building intensity. Brass stabs, sweeping strings, thunderous percussion, and a deep sub bass foundation.',
  32,
  ['trailer', 'epic', 'orchestral', 'brass', 'percussion', 'cinematic'],
);

const epicTrailerProject = buildTemplateProject({
  title: 'Epic Trailer',
  genre: 'cinematic',
  tempo: 100,
  tracks: [
    // --- Brass (subtractive) ---
    t('Brass', 'orange', {
      instrumentType: 'subtractive',
      volume: -3,
      effects: [fx('limiter'), fx('compressor-vca')],
      clips: [
        // Tension (bars 1-8): Low brass sustains, quiet and ominous
        midiClip('', 'Brass — Tension', 0, 32, [
          n(G3, 0, 8, 60),
          n(D3, 0, 8, 55),
          n(A3, 8, 8, 70),
          n(E3, 8, 8, 65),
          n(Bb3, 16, 8, 75),
          n(F3, 16, 8, 70),
          n(G3, 24, 8, 80),
          n(D3, 24, 8, 75),
        ], '#e67e22'),
        // Build (bars 9-16): Rising brass fanfare
        midiClip('', 'Brass — Build', 32, 32, [
          n(D4, 0, 4, 90),
          n(G3, 0, 4, 85),
          n(G4, 4, 4, 95),
          n(D4, 4, 4, 90),
          n(A4, 8, 4, 100),
          n(E4, 8, 4, 95),
          n(B4, 12, 4, 105),
          n(G4, 16, 8, 100),
          n(D4, 16, 8, 95),
          n(A4, 24, 8, 110),
          n(E4, 24, 8, 105),
        ], '#e67e22'),
        // Climax (bars 17-24): Full power brass chords
        midiClip('', 'Brass — Climax', 64, 32, [
          n(D5, 0, 8, 120),
          n(A4, 0, 8, 115),
          n(D4, 0, 8, 110),
          n(G4, 8, 8, 120),
          n(D4, 8, 8, 115),
          n(B3, 8, 8, 110),
          n(A4, 16, 8, 125),
          n(E4, 16, 8, 120),
          n(C4, 16, 8, 115),
          n(D5, 24, 8, 127),
          n(A4, 24, 8, 120),
          n(D4, 24, 8, 115),
        ], '#e67e22'),
        // Resolution (bars 25-32): Resolving brass
        midiClip('', 'Brass — Resolution', 96, 32, [
          n(G4, 0, 16, 100),
          n(D4, 0, 16, 95),
          n(B3, 0, 16, 90),
          n(G3, 16, 16, 80),
          n(D3, 16, 16, 75),
        ], '#e67e22'),
      ],
    }),

    // --- Strings (rach-pad) ---
    t('Strings', 'purple', {
      instrumentType: 'rach-pad',
      volume: -4,
      effects: [fx('limiter')],
      clips: [
        // Tension: Sustained low string pads
        midiClip('', 'Strings — Tension', 0, 32, [
          n(G3, 0, 16, 50),
          n(D3, 0, 16, 45),
          n(Bb3, 0, 16, 48),
          n(A3, 16, 16, 60),
          n(E3, 16, 16, 55),
          n(C4, 16, 16, 58),
        ], '#9b59b6'),
        // Build: Strings rise in register and intensity
        midiClip('', 'Strings — Build', 32, 32, [
          n(D4, 0, 8, 80),
          n(A3, 0, 8, 75),
          n(Fs4, 0, 8, 78),
          n(G4, 8, 8, 90),
          n(D4, 8, 8, 85),
          n(B3, 8, 8, 88),
          n(A4, 16, 16, 100),
          n(E4, 16, 16, 95),
          n(C4, 16, 16, 98),
        ], '#9b59b6'),
        // Climax: Soaring high strings
        midiClip('', 'Strings — Climax', 64, 32, [
          n(D5, 0, 8, 120),
          n(A4, 0, 8, 115),
          n(Fs4, 0, 8, 112),
          n(G5, 8, 8, 125),
          n(D5, 8, 8, 120),
          n(B4, 8, 8, 118),
          n(A5, 16, 16, 127),
          n(E5, 16, 16, 122),
          n(C5, 16, 16, 120),
        ], '#9b59b6'),
        // Resolution: Strings settle
        midiClip('', 'Strings — Resolution', 96, 32, [
          n(G4, 0, 16, 90),
          n(D4, 0, 16, 85),
          n(B3, 0, 16, 82),
          n(G3, 16, 16, 70),
          n(D3, 16, 16, 65),
          n(B2, 16, 16, 60),
        ], '#9b59b6'),
      ],
    }),

    // --- Percussion (granular) ---
    t('Percussion', 'red', {
      instrumentType: 'granular',
      volume: -2,
      effects: [fx('compressor-vca')],
      clips: [
        // Tension: Sparse, suspenseful hits
        midiClip('', 'Perc — Tension', 0, 32, [
          n(C2, 0, 1, 40),
          n(C2, 12, 1, 50),
          n(C2, 24, 1, 60),
          n(C2, 28, 1, 65),
        ], '#e74c3c'),
        // Build: Accelerating rhythmic pattern
        midiClip('', 'Perc — Build', 32, 32, [
          n(C2, 0, 1, 80),
          n(G2, 2, 1, 70),
          n(C2, 4, 1, 85),
          n(G2, 6, 1, 75),
          n(C2, 8, 1, 90),
          n(G2, 9, 1, 80),
          n(C2, 10, 1, 95),
          n(G2, 11, 1, 85),
          n(C2, 12, 0.5, 100),
          n(C2, 13, 0.5, 100),
          n(C2, 14, 0.5, 105),
          n(C2, 15, 0.5, 105),
          n(C2, 16, 1, 110),
          n(G2, 18, 1, 100),
          n(C2, 20, 1, 115),
          n(G2, 22, 1, 105),
          n(C2, 24, 1, 120),
          n(C2, 26, 1, 120),
          n(C2, 28, 1, 125),
          n(C2, 30, 1, 127),
        ], '#e74c3c'),
        // Climax: Full rhythmic bombardment
        midiClip('', 'Perc — Climax', 64, 32, [
          n(C2, 0, 1, 127),
          n(G2, 1, 1, 110),
          n(C2, 2, 1, 127),
          n(G2, 3, 1, 110),
          n(C2, 4, 1, 127),
          n(G2, 5, 1, 110),
          n(C2, 6, 1, 127),
          n(G2, 7, 1, 110),
          n(C2, 8, 1, 127),
          n(G2, 10, 1, 115),
          n(C2, 12, 1, 127),
          n(G2, 14, 1, 115),
          n(C2, 16, 2, 127),
          n(C2, 20, 2, 127),
          n(C2, 24, 2, 127),
          n(C2, 28, 4, 127),
        ], '#e74c3c'),
      ],
    }),

    // --- Sub Bass (subtractive) ---
    t('Sub Bass', 'blue', {
      instrumentType: 'subtractive',
      volume: -6,
      effects: [fx('limiter')],
      clips: [
        // Tension: Low rumble
        midiClip('', 'Sub — Tension', 0, 32, [
          n(G2, 0, 16, 50),
          n(A2, 16, 16, 55),
        ], '#3498db'),
        // Build: Rising sub
        midiClip('', 'Sub — Build', 32, 32, [
          n(D2, 0, 8, 70),
          n(E2, 8, 8, 80),
          n(G2, 16, 8, 90),
          n(A2, 24, 8, 100),
        ], '#3498db'),
        // Climax: Powerful sub foundation
        midiClip('', 'Sub — Climax', 64, 32, [
          n(D2, 0, 8, 110),
          n(G2, 8, 8, 115),
          n(A2, 16, 8, 120),
          n(D2, 24, 8, 127),
        ], '#3498db'),
        // Resolution: Fading sub
        midiClip('', 'Sub — Resolution', 96, 32, [
          n(G2, 0, 16, 90),
          n(G2, 16, 16, 60),
        ], '#3498db'),
      ],
    }),
  ],
  sections: [
    section('Tension', 0, 32, '#6c3483'),
    section('Build', 32, 32, '#e67e22'),
    section('Climax', 64, 32, '#e74c3c'),
    section('Resolution', 96, 32, '#2980b9'),
  ],
  durationBeats: 128,
});

// ============================================================
// 2. Film Score — 90 BPM, 24 bars (96 beats), intermediate
//    Key of F major: F G A Bb C D E
// ============================================================
const filmScoreMeta = meta(
  'Film Score',
  'cinematic',
  'intermediate',
  'Gentle orchestral arrangement in F major. Lush string pads, expressive woodwinds, and delicate harp arpeggios evoke a classic film soundtrack.',
  24,
  ['film', 'orchestra', 'strings', 'woodwinds', 'harp', 'score'],
);

const filmScoreProject = buildTemplateProject({
  title: 'Film Score',
  genre: 'cinematic',
  tempo: 90,
  tracks: [
    // --- Orchestra (rach-pad) ---
    t('Orchestra', 'purple', {
      instrumentType: 'rach-pad',
      volume: -4,
      effects: [fx('reverb-convolution')],
      clips: [
        // Opening (bars 1-8): F major warmth
        midiClip('', 'Orchestra — Opening', 0, 32, [
          n(F3, 0, 8, 65),   // F major chord
          n(A3, 0, 8, 60),
          n(C4, 0, 8, 62),
          n(Bb3, 8, 8, 70),  // Bb major chord (IV)
          n(D4, 8, 8, 65),
          n(F4, 8, 8, 67),
          n(C4, 16, 8, 68),  // C major chord (V)
          n(E4, 16, 8, 63),
          n(G4, 16, 8, 65),
          n(F3, 24, 8, 72),  // F major chord (I)
          n(A3, 24, 8, 67),
          n(C4, 24, 8, 70),
        ], '#9b59b6'),
        // Development (bars 9-16): Richer voicings with movement
        midiClip('', 'Orchestra — Development', 32, 32, [
          n(D3, 0, 8, 75),   // Dm chord (vi)
          n(F3, 0, 8, 70),
          n(A3, 0, 8, 72),
          n(D4, 0, 8, 74),
          n(Bb3, 8, 8, 80),  // Bb major (IV)
          n(D4, 8, 8, 75),
          n(F4, 8, 8, 78),
          n(C4, 16, 8, 82),  // C major (V)
          n(E4, 16, 8, 77),
          n(G4, 16, 8, 80),
          n(F3, 24, 4, 85),  // F major (I)
          n(A3, 24, 4, 80),
          n(C4, 24, 4, 82),
          n(F4, 28, 4, 88),  // F major octave higher
          n(A4, 28, 4, 83),
          n(C5, 28, 4, 85),
        ], '#9b59b6'),
        // Closing (bars 17-24): Gentle resolution
        midiClip('', 'Orchestra — Closing', 64, 32, [
          n(Bb3, 0, 8, 75),  // Bb major (IV)
          n(D4, 0, 8, 70),
          n(F4, 0, 8, 72),
          n(A3, 8, 8, 70),   // Am? -> actually F/A
          n(C4, 8, 8, 65),
          n(F4, 8, 8, 68),
          n(C4, 16, 8, 65),  // C major (V)
          n(E4, 16, 8, 60),
          n(G4, 16, 8, 62),
          n(F3, 24, 8, 60),  // F major (I) — final
          n(A3, 24, 8, 55),
          n(C4, 24, 8, 58),
          n(F4, 24, 8, 55),
        ], '#9b59b6'),
      ],
    }),

    // --- Woodwinds (fm) ---
    t('Woodwinds', 'green', {
      instrumentType: 'fm',
      volume: -6,
      effects: [fx('reverb-convolution')],
      clips: [
        // Opening: Lyrical melody in F major
        midiClip('', 'Woodwinds — Opening', 0, 32, [
          n(F5, 0, 4, 70),
          n(A5, 4, 4, 75),
          n(G5, 8, 2, 72),
          n(F5, 10, 2, 68),
          n(E5, 12, 4, 74),
          n(F5, 16, 8, 70),
          n(D5, 24, 4, 65),
          n(C5, 28, 4, 60),
        ], '#27ae60'),
        // Development: More ornamental
        midiClip('', 'Woodwinds — Development', 32, 32, [
          n(D5, 0, 2, 75),
          n(F5, 2, 2, 78),
          n(A5, 4, 4, 82),
          n(G5, 8, 2, 78),
          n(F5, 10, 2, 74),
          n(E5, 12, 2, 76),
          n(D5, 14, 2, 72),
          n(C5, 16, 4, 80),
          n(E5, 20, 4, 78),
          n(F5, 24, 4, 75),
          n(A5, 28, 4, 80),
        ], '#27ae60'),
        // Closing: Fading phrases
        midiClip('', 'Woodwinds — Closing', 64, 32, [
          n(F5, 0, 4, 65),
          n(E5, 4, 4, 60),
          n(D5, 8, 4, 55),
          n(C5, 12, 4, 50),
          n(F5, 24, 8, 45),
        ], '#27ae60'),
      ],
    }),

    // --- Harp (wavetable) ---
    t('Harp', 'cyan', {
      instrumentType: 'wavetable',
      volume: -8,
      effects: [fx('reverb-convolution')],
      clips: [
        // Opening: F major arpeggios
        midiClip('', 'Harp — Opening', 0, 32, [
          n(F3, 0, 1, 55),
          n(A3, 1, 1, 58),
          n(C4, 2, 1, 60),
          n(F4, 3, 1, 62),
          n(Bb3, 4, 1, 55),
          n(D4, 5, 1, 58),
          n(F4, 6, 1, 60),
          n(70, 7, 1, 62),
          n(C4, 8, 1, 55),
          n(E4, 9, 1, 58),
          n(G4, 10, 1, 60),
          n(C5, 11, 1, 62),
          n(F3, 12, 1, 55),
          n(A3, 13, 1, 58),
          n(C4, 14, 1, 60),
          n(F4, 15, 1, 62),
        ], '#1abc9c'),
        // Development: Wider arpeggios
        midiClip('', 'Harp — Development', 32, 32, [
          n(D3, 0, 1, 60),
          n(F3, 1, 1, 63),
          n(A3, 2, 1, 66),
          n(D4, 3, 1, 68),
          n(Bb3, 4, 1, 60),
          n(D4, 5, 1, 63),
          n(F4, 6, 1, 66),
          n(70, 7, 1, 68),
          n(C3, 8, 1, 62),
          n(E3, 9, 1, 65),
          n(G3, 10, 1, 67),
          n(C4, 11, 1, 70),
          n(F3, 12, 1, 60),
          n(A3, 13, 1, 63),
          n(C4, 14, 1, 66),
          n(F4, 15, 1, 68),
        ], '#1abc9c'),
        // Closing: Sparse, gentle
        midiClip('', 'Harp — Closing', 64, 32, [
          n(F3, 0, 2, 50),
          n(A3, 2, 2, 52),
          n(C4, 4, 2, 54),
          n(F4, 6, 2, 56),
          n(C4, 16, 2, 45),
          n(E4, 18, 2, 47),
          n(G4, 20, 2, 49),
          n(F3, 24, 4, 40),
          n(C4, 26, 4, 42),
          n(F4, 28, 4, 38),
        ], '#1abc9c'),
      ],
    }),
  ],
  sections: [
    section('Opening', 0, 32, '#9b59b6'),
    section('Development', 32, 32, '#27ae60'),
    section('Closing', 64, 32, '#1abc9c'),
  ],
  durationBeats: 96,
});

// ============================================================
// 3. Horror Score — 80 BPM, 16 bars (64 beats), advanced
//    Dissonant intervals: minor 2nds (C-C#), tritones (F-B, C-F#)
// ============================================================
const horrorScoreMeta = meta(
  'Horror Score',
  'cinematic',
  'advanced',
  'Unsettling horror atmosphere built on tritones and minor 2nd intervals. Dissonant string clusters, eerie granular textures, and a menacing low drone.',
  16,
  ['horror', 'dark', 'dissonant', 'tritone', 'texture', 'scary', 'cinematic'],
);

const horrorScoreProject = buildTemplateProject({
  title: 'Horror Score',
  genre: 'cinematic',
  tempo: 80,
  tracks: [
    // --- Dissonant Strings (wavetable) ---
    t('Dissonant Strings', 'red', {
      instrumentType: 'wavetable',
      volume: -5,
      effects: [fx('spectral-processing'), fx('delay-tape')],
      clips: [
        midiClip('', 'Strings — Dissonance', 0, 64, [
          // Minor 2nd cluster: C4 + C#4
          n(C4, 0, 8, 70),
          n(Cs4, 0, 8, 68),
          // Tritone: F4 + B4
          n(F4, 8, 8, 75),
          n(B4, 8, 8, 73),
          // Minor 2nd sliding up: E4 + F4
          n(E4, 16, 6, 65),
          n(F4, 16, 6, 63),
          // Tritone: C4 + F#4
          n(C4, 22, 10, 72),
          n(Fs4, 22, 10, 70),
          // Cluster: C4 + C#4 + F#4 (double dissonance)
          n(C4, 32, 8, 80),
          n(Cs4, 32, 8, 78),
          n(Fs4, 32, 8, 76),
          // Tritone resolving nowhere: F4 + B3
          n(B3, 40, 12, 70),
          n(F4, 40, 12, 68),
          // Final cluster: minor 2nd + tritone
          n(C4, 52, 12, 85),
          n(Cs4, 52, 12, 82),
          n(Fs4, 52, 12, 80),
          n(G4, 52, 12, 78),
        ], '#c0392b'),
      ],
    }),

    // --- Texture (granular) ---
    t('Texture', 'pink', {
      instrumentType: 'granular',
      volume: -8,
      effects: [fx('spectral-processing'), fx('delay-tape')],
      clips: [
        midiClip('', 'Texture — Eerie', 0, 64, [
          // Sparse, unsettling hits with dissonant intervals
          n(C5, 0, 2, 40),
          n(Cs4, 4, 3, 35),
          n(Fs5, 10, 2, 45),
          n(B4, 16, 4, 38),
          n(F5, 22, 1, 50),
          n(Cs4, 28, 3, 42),
          n(Fs5, 34, 2, 48),
          n(C5, 38, 1, 55),
          n(B4, 42, 4, 40),
          n(F5, 48, 2, 52),
          n(Cs4, 52, 3, 45),
          n(Fs5, 58, 6, 38),
        ], '#e91e8c'),
      ],
    }),

    // --- Low Drone (subtractive) ---
    t('Low Drone', 'blue', {
      instrumentType: 'subtractive',
      volume: -6,
      effects: [fx('spectral-processing')],
      clips: [
        midiClip('', 'Drone — Menace', 0, 64, [
          // C1 + C#1 minor 2nd drone — maximally dissonant in low register
          n(C1, 0, 32, 60),
          n(Cs1, 0, 32, 55),
          // Second half: tritone drone F2 + B2
          n(F2, 32, 32, 65),
          n(B2, 32, 32, 60),
          // Sub-layer: sustained pedal tone
          n(C2, 0, 64, 50),
        ], '#2c3e50'),
      ],
    }),
  ],
  durationBeats: 64,
});

// ============================================================
// 4. Fantasy Adventure — 110 BPM, 24 bars (96 beats), intermediate
//    Key of D major: D E F# G A B C#
// ============================================================
const fantasyAdventureMeta = meta(
  'Fantasy Adventure',
  'cinematic',
  'intermediate',
  'Bright, heroic theme in D major. Soaring string melodies, spirited flute lines, and shimmering harp arpeggios paint a picture of epic journeys and discovery.',
  24,
  ['fantasy', 'adventure', 'heroic', 'bright', 'strings', 'flute', 'harp'],
);

const fantasyAdventureProject = buildTemplateProject({
  title: 'Fantasy Adventure',
  genre: 'cinematic',
  tempo: 110,
  tracks: [
    // --- Strings (rach-pad) ---
    t('Strings', 'purple', {
      instrumentType: 'rach-pad',
      volume: -3,
      effects: [fx('reverb-algorithmic')],
      clips: [
        // Journey (bars 1-8): Heroic D major theme
        midiClip('', 'Strings — Journey', 0, 32, [
          n(D4, 0, 4, 85),
          n(Fs4, 2, 2, 80),
          n(A4, 4, 4, 90),
          n(D5, 8, 4, 95),
          n(A4, 12, 2, 88),
          n(Fs4, 14, 2, 85),
          n(G4, 16, 4, 90),
          n(A4, 20, 4, 88),
          n(D4, 24, 4, 82),
          n(Fs4, 24, 4, 80),
          n(A4, 24, 4, 85),
          n(D5, 28, 4, 92),
        ], '#8e44ad'),
        // Discovery (bars 9-16): Brighter, wider voicings
        midiClip('', 'Strings — Discovery', 32, 32, [
          n(G4, 0, 8, 90),
          n(B4, 0, 8, 88),
          n(D5, 0, 8, 92),
          n(A4, 8, 8, 95),
          n(D5, 8, 8, 93),
          n(Fs5, 8, 8, 97),
          n(D4, 16, 4, 88),
          n(Fs4, 16, 4, 86),
          n(A4, 16, 4, 90),
          n(E4, 20, 4, 85),
          n(G4, 20, 4, 83),
          n(B4, 20, 4, 87),
          n(D4, 24, 8, 92),
          n(Fs4, 24, 8, 90),
          n(A4, 24, 8, 94),
          n(D5, 24, 8, 97),
        ], '#8e44ad'),
        // Triumph (bars 17-24): Full, triumphant chords
        midiClip('', 'Strings — Triumph', 64, 32, [
          n(D4, 0, 8, 105),
          n(Fs4, 0, 8, 102),
          n(A4, 0, 8, 107),
          n(D5, 0, 8, 110),
          n(G4, 8, 8, 108),
          n(B4, 8, 8, 105),
          n(D5, 8, 8, 110),
          n(G5, 8, 8, 112),
          n(A4, 16, 8, 112),
          n(D5, 16, 8, 110),
          n(Fs5, 16, 8, 115),
          n(D4, 24, 8, 118),
          n(Fs4, 24, 8, 115),
          n(A4, 24, 8, 120),
          n(D5, 24, 8, 122),
        ], '#8e44ad'),
      ],
    }),

    // --- Flute (fm) ---
    t('Flute', 'green', {
      instrumentType: 'fm',
      volume: -6,
      effects: [fx('reverb-algorithmic')],
      clips: [
        // Journey: Lyrical melody
        midiClip('', 'Flute — Journey', 0, 32, [
          n(D5, 0, 2, 75),
          n(E5, 2, 2, 78),
          n(Fs5, 4, 4, 82),
          n(A5, 8, 2, 80),
          n(Fs5, 10, 2, 78),
          n(E5, 12, 4, 75),
          n(D5, 16, 4, 80),
          n(Fs5, 20, 2, 78),
          n(G5, 22, 2, 82),
          n(A5, 24, 4, 85),
          n(Fs5, 28, 4, 80),
        ], '#2ecc71'),
        // Discovery: Playful, exploring melody
        midiClip('', 'Flute — Discovery', 32, 32, [
          n(A5, 0, 2, 80),
          n(Fs5, 2, 1, 78),
          n(G5, 3, 1, 80),
          n(A5, 4, 2, 82),
          n(D5, 6, 2, 78),
          n(E5, 8, 2, 80),
          n(Fs5, 10, 2, 82),
          n(G5, 12, 4, 85),
          n(A5, 16, 2, 80),
          n(B4, 18, 2, 78),
          n(D5, 20, 2, 82),
          n(Fs5, 22, 2, 84),
          n(A5, 24, 4, 88),
          n(D5, 28, 4, 80),
        ], '#2ecc71'),
        // Triumph: Soaring high melody
        midiClip('', 'Flute — Triumph', 64, 32, [
          n(D5, 0, 4, 90),
          n(Fs5, 4, 4, 92),
          n(A5, 8, 4, 95),
          n(D5, 12, 2, 88),
          n(E5, 14, 2, 90),
          n(Fs5, 16, 4, 95),
          n(A5, 20, 4, 98),
          n(D5, 24, 8, 92),
        ], '#2ecc71'),
      ],
    }),

    // --- Harp Arpeggio (wavetable) ---
    t('Harp Arp', 'cyan', {
      instrumentType: 'wavetable',
      volume: -8,
      effects: [fx('reverb-algorithmic')],
      clips: [
        // Journey: D major arpeggios
        midiClip('', 'Harp — Journey', 0, 32, [
          n(D3, 0, 1, 60),
          n(54, 1, 1, 63),
          n(A3, 2, 1, 65),
          n(D4, 3, 1, 67),
          n(G3, 4, 1, 60),
          n(B3, 5, 1, 63),
          n(D4, 6, 1, 65),
          n(G4, 7, 1, 67),
          n(A3, 8, 1, 60),
          n(D4, 9, 1, 63),
          n(Fs4, 10, 1, 65),
          n(A4, 11, 1, 67),
          n(D3, 12, 1, 60),
          n(54, 13, 1, 63),
          n(A3, 14, 1, 65),
          n(D4, 15, 1, 67),
        ], '#1abc9c'),
        // Discovery: Wider arpeggios with color tones
        midiClip('', 'Harp — Discovery', 32, 32, [
          n(G3, 0, 1, 62),
          n(B3, 1, 1, 65),
          n(D4, 2, 1, 67),
          n(G4, 3, 1, 70),
          n(A3, 4, 1, 62),
          n(D4, 5, 1, 65),
          n(Fs4, 6, 1, 67),
          n(A4, 7, 1, 70),
          n(D3, 8, 1, 62),
          n(54, 9, 1, 65),
          n(A3, 10, 1, 67),
          n(D4, 11, 1, 70),
          n(E3, 12, 1, 62),
          n(G3, 13, 1, 65),
          n(B3, 14, 1, 67),
          n(E4, 15, 1, 70),
        ], '#1abc9c'),
        // Triumph: Triumphant cascading arpeggios
        midiClip('', 'Harp — Triumph', 64, 32, [
          n(D3, 0, 1, 68),
          n(54, 1, 1, 70),
          n(A3, 2, 1, 72),
          n(D4, 3, 1, 75),
          n(Fs4, 4, 1, 77),
          n(A4, 5, 1, 80),
          n(D5, 6, 2, 82),
          n(G3, 8, 1, 68),
          n(B3, 9, 1, 70),
          n(D4, 10, 1, 72),
          n(G4, 11, 1, 75),
          n(B4, 12, 1, 77),
          n(D5, 13, 1, 80),
          n(G5, 14, 2, 82),
          n(D4, 24, 4, 70),
          n(A4, 26, 4, 72),
        ], '#1abc9c'),
      ],
    }),
  ],
  sections: [
    section('Journey', 0, 32, '#8e44ad'),
    section('Discovery', 32, 32, '#2ecc71'),
    section('Triumph', 64, 32, '#f39c12'),
  ],
  durationBeats: 96,
});

// ============================================================
// Export all cinematic templates
// ============================================================
export const cinematicTemplates: ProjectTemplate[] = [
  template(epicTrailerMeta, epicTrailerProject),
  template(filmScoreMeta, filmScoreProject),
  template(horrorScoreMeta, horrorScoreProject),
  template(fantasyAdventureMeta, fantasyAdventureProject),
];
