import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ── House ────────────────────────────────────────────────────────────────────
// Classic four-on-the-floor house groove. Beginner-friendly with a steady kick,
// rolling bass, and warm pad chords in C minor.

const houseMeta = meta(
  'House',
  'edm',
  'beginner',
  'Classic four-on-the-floor house groove with warm pads and a driving bass line in C minor',
  16,
  ['house', 'four-on-the-floor', 'dance', '124bpm'],
);

const houseProject = buildTemplateProject({
  title: 'House',
  genre: 'EDM — House',
  tempo: 124,
  tracks: [
    // Synth — stabby chords on the off-beats (Cm, Fm, Ab, Gm)
    t('Synth', 'cyan', {
      instrumentType: 'subtractive',
      effects: [fx('compressor-vca'), fx('limiter')],
      clips: [
        midiClip('', 'House Chords', 0, 64, [
          // Cm chord — beats 2 & 4 of bar 1-4
          n(60, 1, 0.5, 90), n(63, 1, 0.5, 90), n(67, 1, 0.5, 90),
          n(60, 3, 0.5, 90), n(63, 3, 0.5, 90), n(67, 3, 0.5, 90),
          // Fm chord — bar 5-8
          n(65, 17, 0.5, 90), n(68, 17, 0.5, 90), n(72, 17, 0.5, 90),
          n(65, 19, 0.5, 90), n(68, 19, 0.5, 90), n(72, 19, 0.5, 90),
          // Ab chord — bar 9-12
          n(68, 33, 0.5, 85), n(72, 33, 0.5, 85), n(75, 33, 0.5, 85),
          n(68, 35, 0.5, 85), n(72, 35, 0.5, 85), n(75, 35, 0.5, 85),
        ]),
      ],
    }),

    // Bass — steady eighth-note bass line rooted on C2, F2, Ab2, G2
    t('Bass', 'blue', {
      instrumentType: 'subtractive',
      volume: -3,
      effects: [fx('compressor-vca')],
      clips: [
        midiClip('', 'House Bass', 0, 64, [
          // C2 octave pulse — bars 1-4
          n(36, 0, 0.5, 100), n(36, 1, 0.5, 80), n(36, 2, 0.5, 100), n(36, 3, 0.5, 80),
          // F2 — bars 5-8
          n(41, 16, 0.5, 100), n(41, 17, 0.5, 80), n(41, 18, 0.5, 100), n(41, 19, 0.5, 80),
          // Ab2 — bars 9-12
          n(44, 32, 0.5, 100), n(44, 33, 0.5, 80), n(44, 34, 0.5, 100), n(44, 35, 0.5, 80),
          // G2 — bars 13-16
          n(43, 48, 0.5, 100), n(43, 49, 0.5, 80), n(43, 50, 0.5, 100), n(43, 51, 0.5, 80),
        ]),
      ],
    }),

    // Pad — long sustained chords for warmth
    t('Pad', 'purple', {
      instrumentType: 'rach-pad',
      volume: -6,
      effects: [fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'House Pad', 0, 64, [
          // Cm — bars 1-4
          n(60, 0, 16, 70), n(63, 0, 16, 70), n(67, 0, 16, 70),
          // Fm — bars 5-8
          n(65, 16, 16, 70), n(68, 16, 16, 70), n(72, 16, 16, 70),
          // Ab — bars 9-12
          n(68, 32, 16, 65), n(72, 32, 16, 65), n(75, 32, 16, 65),
          // Gm — bars 13-16
          n(67, 48, 16, 65), n(70, 48, 16, 65), n(74, 48, 16, 65),
        ]),
      ],
    }),
  ],
});

// ── Techno ───────────────────────────────────────────────────────────────────
// Minimal, hypnotic techno loop in A minor. Repetitive patterns with a filtered
// FM lead, driving sub bass, and granular texture bed.

const technoMeta = meta(
  'Techno',
  'edm',
  'intermediate',
  'Minimal, hypnotic techno loop in A minor with filtered leads and driving repetition',
  16,
  ['techno', 'minimal', 'dark', '130bpm'],
);

const technoProject = buildTemplateProject({
  title: 'Techno',
  genre: 'EDM — Techno',
  tempo: 130,
  tracks: [
    // Lead — minimal repeating motif in Am
    t('Lead', 'red', {
      instrumentType: 'fm',
      effects: [fx('highlow-pass'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Techno Lead', 0, 64, [
          // Repetitive single-note motif — A3, C4, A3 pulsing
          n(57, 0, 0.5, 95), n(57, 2, 0.25, 80), n(60, 3, 0.5, 90),
          n(57, 4, 0.5, 95), n(57, 6, 0.25, 80), n(60, 7, 0.5, 90),
          // Second phrase — slight variation
          n(57, 8, 0.5, 95), n(64, 10, 0.25, 85), n(60, 11, 0.5, 90),
          n(57, 12, 0.5, 95), n(64, 14, 0.25, 85), n(60, 15, 0.5, 90),
        ]),
      ],
    }),

    // Bass — relentless eighth-note A1 pulse
    t('Bass', 'blue', {
      instrumentType: 'subtractive',
      volume: -2,
      effects: [fx('compressor-vca'), fx('highlow-pass')],
      clips: [
        midiClip('', 'Techno Bass', 0, 64, [
          n(33, 0, 0.5, 110), n(33, 1, 0.5, 90), n(33, 2, 0.5, 110), n(33, 3, 0.5, 90),
          n(33, 4, 0.5, 110), n(33, 5, 0.5, 90), n(33, 6, 0.5, 110), n(33, 7, 0.5, 90),
          n(33, 8, 0.5, 110), n(33, 9, 0.5, 90), n(33, 10, 0.5, 110), n(33, 11, 0.5, 90),
          n(33, 12, 0.5, 110), n(33, 13, 0.5, 90), n(33, 14, 0.5, 110), n(33, 15, 0.5, 90),
        ]),
      ],
    }),

    // Texture — atmospheric granular bed
    t('Texture', 'green', {
      instrumentType: 'granular',
      volume: -10,
      effects: [fx('reverb-algorithmic'), fx('delay-tape')],
      clips: [
        midiClip('', 'Techno Texture', 0, 64, [
          // Long evolving tones — Am drone
          n(57, 0, 16, 50), n(60, 0, 16, 40),
          n(57, 16, 16, 55), n(64, 16, 16, 35),
          n(57, 32, 16, 50), n(60, 32, 16, 40),
          n(57, 48, 16, 55), n(64, 48, 16, 35),
        ]),
      ],
    }),
  ],
});

// ── Trance ───────────────────────────────────────────────────────────────────
// Euphoric trance with a classic build-drop structure in A minor. Soaring
// wavetable lead, lush pad, driving bass, and a rapid arpeggio.

const tranceMeta = meta(
  'Trance',
  'edm',
  'intermediate',
  'Euphoric trance with build-up and drop structure in A minor featuring arpeggiated leads',
  32,
  ['trance', 'euphoric', 'build-drop', '138bpm', 'arpeggiated'],
);

const tranceProject = buildTemplateProject({
  title: 'Trance',
  genre: 'EDM — Trance',
  tempo: 138,
  tracks: [
    // Lead — soaring melody that enters at the drop
    t('Lead', 'cyan', {
      instrumentType: 'wavetable',
      effects: [fx('reverb-algorithmic'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Trance Lead', 32, 32, [
          // Drop melody — A4 E5 D5 C5 phrase
          n(69, 32, 1, 100), n(76, 34, 1, 95), n(74, 36, 2, 90),
          n(72, 40, 1, 100), n(69, 42, 1, 95), n(67, 44, 2, 90),
          n(69, 48, 1, 100), n(76, 50, 1, 95), n(74, 52, 2, 90),
          n(72, 56, 1, 100), n(69, 58, 2, 95),
        ]),
        midiClip('', 'Trance Lead Drop 2', 96, 32, [
          // Second drop — higher octave variation
          n(81, 96, 1, 105), n(88, 98, 1, 100), n(86, 100, 2, 95),
          n(84, 104, 1, 105), n(81, 106, 1, 100), n(79, 108, 2, 95),
          n(81, 112, 1, 105), n(88, 114, 1, 100), n(86, 116, 2, 95),
          n(84, 120, 1, 105), n(81, 122, 2, 100),
        ]),
      ],
    }),

    // Pad — sweeping chords throughout
    t('Pad', 'purple', {
      instrumentType: 'rach-pad',
      volume: -6,
      effects: [fx('reverb-algorithmic'), fx('chorus')],
      clips: [
        midiClip('', 'Trance Pad', 0, 128, [
          // Am — build
          n(57, 0, 32, 60), n(60, 0, 32, 55), n(64, 0, 32, 55),
          // F — drop
          n(53, 32, 32, 75), n(57, 32, 32, 70), n(60, 32, 32, 70),
          // Dm — breakdown
          n(50, 64, 32, 55), n(53, 64, 32, 50), n(57, 64, 32, 50),
          // Em — drop 2
          n(52, 96, 32, 75), n(55, 96, 32, 70), n(59, 96, 32, 70),
        ]),
      ],
    }),

    // Bass — pumping eighth-note bass
    t('Bass', 'blue', {
      instrumentType: 'subtractive',
      volume: -3,
      effects: [fx('compressor-vca'), fx('limiter')],
      clips: [
        midiClip('', 'Trance Bass', 0, 128, [
          // A1 pumping — build section
          n(33, 0, 0.5, 100), n(33, 1, 0.5, 80), n(33, 2, 0.5, 100), n(33, 3, 0.5, 80),
          // F1 — drop
          n(29, 32, 0.5, 110), n(29, 33, 0.5, 85), n(29, 34, 0.5, 110), n(29, 35, 0.5, 85),
          // D2 — breakdown (quieter)
          n(38, 64, 0.5, 70), n(38, 65, 0.5, 55), n(38, 66, 0.5, 70), n(38, 67, 0.5, 55),
          // E2 — drop 2
          n(40, 96, 0.5, 110), n(40, 97, 0.5, 85), n(40, 98, 0.5, 110), n(40, 99, 0.5, 85),
        ]),
      ],
    }),

    // Arp — rapid sixteenth-note arpeggiation
    t('Arp', 'yellow', {
      instrumentType: 'fm',
      volume: -8,
      effects: [fx('delay-pingpong'), fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'Trance Arp', 32, 32, [
          // Am arp — A C E A ascending sixteenths
          n(69, 32, 0.25, 85), n(72, 32.25, 0.25, 80), n(76, 32.5, 0.25, 85), n(81, 32.75, 0.25, 90),
          n(69, 33, 0.25, 85), n(72, 33.25, 0.25, 80), n(76, 33.5, 0.25, 85), n(81, 33.75, 0.25, 90),
          n(69, 34, 0.25, 85), n(72, 34.25, 0.25, 80), n(76, 34.5, 0.25, 85), n(81, 34.75, 0.25, 90),
          n(69, 35, 0.25, 85), n(72, 35.25, 0.25, 80), n(76, 35.5, 0.25, 85), n(81, 35.75, 0.25, 90),
        ]),
      ],
    }),
  ],
  sections: [
    section('Build', 0, 32, '#f59e0b'),
    section('Drop', 32, 32, '#ef4444'),
    section('Breakdown', 64, 32, '#8b5cf6'),
    section('Drop 2', 96, 32, '#ef4444'),
  ],
});

// ── Dubstep ──────────────────────────────────────────────────────────────────
// Heavy half-time dubstep in D minor. Wobble bass with distortion, deep sub,
// and an aggressive wavetable lead. Emphasis on beat 3 for half-time feel.

const dubstepMeta = meta(
  'Dubstep',
  'edm',
  'advanced',
  'Heavy half-time dubstep in D minor with wobble bass, deep sub, and aggressive modulation',
  16,
  ['dubstep', 'half-time', 'wobble', 'heavy', '140bpm'],
);

const dubstepProject = buildTemplateProject({
  title: 'Dubstep',
  genre: 'EDM — Dubstep',
  tempo: 140,
  tracks: [
    // Wobble Bass — rhythmic modulated pattern with distortion
    t('Wobble Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -2,
      effects: [fx('distortion'), fx('compressor-vca'), fx('limiter')],
      clips: [
        midiClip('', 'Wobble', 0, 64, [
          // Half-time feel — accents on beat 3 (the "snare" position)
          // D2 wobble pattern — rhythmic hits
          n(38, 2, 1, 120), n(38, 3.5, 0.5, 100),
          n(38, 6, 1, 120), n(41, 7, 0.5, 110), n(38, 7.5, 0.5, 100),
          // Second phrase
          n(38, 10, 1, 120), n(38, 11.5, 0.5, 100),
          n(38, 14, 1, 120), n(36, 15, 0.5, 110), n(38, 15.5, 0.5, 100),
          // Bars 5-8 — variation with chromatic movement
          n(38, 18, 1, 120), n(39, 19, 0.5, 105), n(38, 19.5, 0.5, 100),
          n(38, 22, 1, 120), n(41, 23, 0.5, 110), n(43, 23.5, 0.5, 115),
        ]),
      ],
    }),

    // Sub — deep sub bass reinforcement
    t('Sub', 'blue', {
      instrumentType: 'subtractive',
      volume: -4,
      effects: [fx('compressor-vca')],
      clips: [
        midiClip('', 'Dubstep Sub', 0, 64, [
          // D1 long sub notes — half-time feel, one per half bar
          n(26, 0, 4, 100), n(26, 4, 4, 90),
          n(26, 8, 4, 100), n(26, 12, 4, 90),
          // Dm — F1 variation
          n(29, 16, 4, 100), n(26, 20, 4, 95),
          n(29, 24, 4, 100), n(26, 28, 4, 95),
          // Return to root
          n(26, 32, 4, 100), n(26, 36, 4, 90),
          n(26, 40, 4, 100), n(26, 44, 4, 90),
          // C1, Bb0 movement
          n(24, 48, 4, 100), n(22, 52, 4, 95),
          n(26, 56, 8, 105),
        ]),
      ],
    }),

    // Lead — aggressive stabs
    t('Lead', 'orange', {
      instrumentType: 'wavetable',
      volume: -5,
      effects: [fx('distortion'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Dubstep Lead', 0, 64, [
          // D5 — F5 — A4 stab pattern, syncopated
          n(74, 2, 0.25, 110), n(77, 2.5, 0.25, 105), n(69, 3, 0.5, 100),
          n(74, 6, 0.25, 110), n(77, 6.5, 0.25, 105), n(72, 7, 0.5, 100),
          // Bars 3-4
          n(74, 10, 0.25, 110), n(77, 10.5, 0.25, 105), n(69, 11, 0.5, 100),
          n(74, 14, 0.25, 115), n(79, 14.5, 0.25, 110), n(77, 15, 0.5, 105),
        ]),
      ],
    }),
  ],
});

// ── Future Bass ──────────────────────────────────────────────────────────────
// Lush, emotional future bass in Eb major. Big wavetable chords with
// sidechain-style pumping, airy FM lead, and a warm sub layer.

const futureBassMeta = meta(
  'Future Bass',
  'edm',
  'intermediate',
  'Lush, emotional future bass in Eb major with big chords, sidechain pumping, and airy leads',
  16,
  ['future-bass', 'lush', 'chords', 'emotional', '150bpm'],
);

const futureBassProject = buildTemplateProject({
  title: 'Future Bass',
  genre: 'EDM — Future Bass',
  tempo: 150,
  tracks: [
    // Chords — big wavetable chord stabs with pumping rhythm
    t('Chords', 'pink', {
      instrumentType: 'wavetable',
      effects: [fx('chorus'), fx('reverb-algorithmic'), fx('compressor-vca')],
      clips: [
        midiClip('', 'Future Chords', 0, 64, [
          // Eb major chord — pumping rhythm (short notes for sidechain feel)
          n(63, 0.5, 0.75, 95), n(67, 0.5, 0.75, 90), n(70, 0.5, 0.75, 90),
          n(63, 2.5, 0.75, 95), n(67, 2.5, 0.75, 90), n(70, 2.5, 0.75, 90),
          // Ab major
          n(68, 4.5, 0.75, 95), n(72, 4.5, 0.75, 90), n(75, 4.5, 0.75, 90),
          n(68, 6.5, 0.75, 95), n(72, 6.5, 0.75, 90), n(75, 6.5, 0.75, 90),
          // Bb major
          n(70, 8.5, 0.75, 95), n(74, 8.5, 0.75, 90), n(77, 8.5, 0.75, 90),
          n(70, 10.5, 0.75, 95), n(74, 10.5, 0.75, 90), n(77, 10.5, 0.75, 90),
        ]),
      ],
    }),

    // Lead — floaty FM melody over the chords
    t('Lead', 'cyan', {
      instrumentType: 'fm',
      volume: -4,
      effects: [fx('reverb-algorithmic'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Future Lead', 0, 64, [
          // Eb5 — F5 — G5 — Bb5 — melodic line
          n(75, 0, 1.5, 85), n(77, 2, 1, 80), n(79, 4, 2, 90),
          n(82, 8, 1.5, 85), n(79, 10, 1, 80), n(77, 12, 2, 90),
          // Second phrase
          n(75, 16, 1.5, 85), n(79, 18, 1, 80), n(82, 20, 2, 90),
          n(79, 24, 1.5, 85), n(77, 26, 1, 80), n(75, 28, 2, 90),
        ]),
      ],
    }),

    // Sub — deep Eb sub bass
    t('Sub', 'blue', {
      instrumentType: 'subtractive',
      volume: -3,
      effects: [fx('compressor-vca')],
      clips: [
        midiClip('', 'Future Sub', 0, 64, [
          // Eb1 — Ab1 — Bb1 following chord roots
          n(27, 0, 4, 100),
          n(32, 4, 4, 100),
          n(34, 8, 4, 100),
          n(32, 12, 4, 95),
          // Repeat with variation
          n(27, 16, 4, 100),
          n(32, 20, 4, 100),
          n(34, 24, 4, 100),
          n(27, 28, 4, 95),
        ]),
      ],
    }),
  ],
});

// ── Drum & Bass ──────────────────────────────────────────────────────────────
// High-energy drum & bass in E minor. Fast breakbeat-style patterns, aggressive
// bass riffs, a cutting wavetable lead, and atmospheric pad washes.

const dnbMeta = meta(
  'Drum & Bass',
  'edm',
  'advanced',
  'High-energy drum & bass in E minor with fast breakbeat patterns and aggressive bass riffs',
  16,
  ['drum-and-bass', 'dnb', 'breakbeat', 'fast', '174bpm'],
);

const dnbProject = buildTemplateProject({
  title: 'Drum & Bass',
  genre: 'EDM — Drum & Bass',
  tempo: 174,
  tracks: [
    // Bass — fast staccato riff in E minor
    t('Bass', 'red', {
      instrumentType: 'subtractive',
      volume: -2,
      effects: [fx('compressor-vca'), fx('limiter'), fx('distortion')],
      clips: [
        midiClip('', 'DnB Bass', 0, 64, [
          // E1 syncopated pattern — breakbeat feel
          n(28, 0, 0.25, 115), n(28, 0.75, 0.25, 100),
          n(28, 1.5, 0.25, 110), n(31, 2, 0.5, 105),
          n(28, 3, 0.25, 115), n(28, 3.5, 0.25, 100),
          // Second bar — chromatic variation
          n(28, 4, 0.25, 115), n(28, 4.75, 0.25, 100),
          n(33, 5.5, 0.25, 110), n(31, 6, 0.5, 105),
          n(28, 7, 0.25, 115), n(26, 7.5, 0.25, 105),
          // Bars 3-4 — G1 to E1
          n(31, 8, 0.25, 115), n(31, 8.75, 0.25, 100),
          n(28, 9.5, 0.5, 110), n(28, 10.5, 0.25, 105),
          n(26, 11, 0.25, 100), n(28, 11.5, 0.5, 115),
        ]),
      ],
    }),

    // Lead — cutting melodic line
    t('Lead', 'yellow', {
      instrumentType: 'wavetable',
      volume: -5,
      effects: [fx('delay-pingpong'), fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'DnB Lead', 0, 64, [
          // E4 — G4 — B4 — D5 melodic phrase
          n(64, 0, 1, 90), n(67, 2, 0.5, 85), n(71, 3, 1, 95),
          n(74, 5, 0.5, 90), n(71, 6, 1, 85),
          // Second phrase — descending
          n(74, 8, 1, 95), n(72, 10, 0.5, 90), n(71, 11, 1, 85),
          n(67, 13, 0.5, 90), n(64, 14, 2, 95),
        ]),
      ],
    }),

    // Pad — atmospheric E minor wash
    t('Pad', 'green', {
      instrumentType: 'rach-pad',
      volume: -10,
      effects: [fx('reverb-algorithmic'), fx('chorus')],
      clips: [
        midiClip('', 'DnB Pad', 0, 64, [
          // Em — sustained atmosphere
          n(64, 0, 16, 55), n(67, 0, 16, 50), n(71, 0, 16, 50),
          // Am
          n(69, 16, 16, 55), n(72, 16, 16, 50), n(76, 16, 16, 50),
          // C
          n(72, 32, 16, 55), n(76, 32, 16, 50), n(79, 32, 16, 50),
          // Bm
          n(71, 48, 16, 55), n(74, 48, 16, 50), n(78, 48, 16, 50),
        ]),
      ],
    }),
  ],
});

// ── Export ────────────────────────────────────────────────────────────────────

export const edmTemplates: ProjectTemplate[] = [
  template(houseMeta, houseProject),
  template(technoMeta, technoProject),
  template(tranceMeta, tranceProject),
  template(dubstepMeta, dubstepProject),
  template(futureBassMeta, futureBassProject),
  template(dnbMeta, dnbProject),
];
