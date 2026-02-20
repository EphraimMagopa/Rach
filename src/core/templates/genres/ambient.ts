import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ── 1. Ambient Pad ──────────────────────────────────────────────────────────
// Beginner · 70 BPM · 16 bars · D major sustained pads with granular texture

const ambientPadMeta = meta(
  'Ambient Pad',
  'ambient',
  'beginner',
  'Lush sustained pad chords in D major with evolving granular texture. A gentle, immersive soundscape perfect for relaxation or as a foundation for deeper ambient exploration.',
  16,
  ['pad', 'dreamy', 'sustained', 'reverb', 'd-major'],
);

const ambientPadProject = buildTemplateProject({
  title: 'Ambient Pad',
  genre: 'Ambient',
  tempo: 70,
  tracks: [
    // Pad — slow-moving D major chord voicings across 16 bars (64 beats)
    t('Pad', 'blue', {
      instrumentType: 'rach-pad',
      volume: -6,
      effects: [fx('reverb-convolution'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Pad A', 0, 32, [
          // Dmaj: D3-A3-D4-F#4 (bars 1-4)
          n(50, 0, 16, 70),   // D3
          n(57, 0, 16, 65),   // A3
          n(62, 0, 16, 75),   // D4
          n(66, 0, 16, 70),   // F#4
          // Gmaj/B: B2-D3-G3-B3 (bars 5-8)
          n(47, 16, 16, 65),  // B2
          n(50, 16, 16, 60),  // D3
          n(55, 16, 16, 70),  // G3
          n(59, 16, 16, 65),  // B3
        ]),
        midiClip('', 'Pad B', 32, 32, [
          // Asus4: A2-D3-E3-A3 (bars 9-12)
          n(45, 0, 16, 65),   // A2
          n(50, 0, 16, 60),   // D3
          n(52, 0, 16, 70),   // E3
          n(57, 0, 16, 65),   // A3
          // Dmaj: D3-F#3-A3-D4 (bars 13-16)
          n(50, 16, 16, 70),  // D3
          n(54, 16, 16, 65),  // F#3
          n(57, 16, 16, 75),  // A3
          n(62, 16, 16, 70),  // D4
        ]),
      ],
    }),
    // Texture — sparse granular notes adding shimmer
    t('Texture', 'cyan', {
      instrumentType: 'granular',
      volume: -12,
      pan: 0.2,
      effects: [fx('auto-pan'), fx('reverb-convolution')],
      clips: [
        midiClip('', 'Texture', 0, 64, [
          n(74, 0, 8, 40),    // D5 — high shimmer
          n(78, 10, 6, 35),   // F#5
          n(71, 20, 10, 38),  // B4
          n(69, 32, 8, 42),   // A4
          n(76, 42, 6, 35),   // E5
          n(74, 50, 14, 40),  // D5 — long fade
        ]),
      ],
    }),
  ],
  sections: [
    section('Intro', 0, 16, '#3b82f6'),
    section('Build', 16, 16, '#6366f1'),
    section('Sustain', 32, 16, '#8b5cf6'),
    section('Resolve', 48, 16, '#3b82f6'),
  ],
});

// ── 2. Drone ────────────────────────────────────────────────────────────────
// Intermediate · 60 BPM · 32 bars · Slowly evolving single-note drones

const droneMeta = meta(
  'Drone',
  'ambient',
  'intermediate',
  'Deep, slowly evolving drone textures built from sustained bass tones, subharmonics, and shimmering overtones. Explores subtle timbral shifts over an extended duration.',
  32,
  ['drone', 'meditative', 'deep', 'evolving', 'spectral'],
);

const droneProject = buildTemplateProject({
  title: 'Drone',
  genre: 'Ambient',
  tempo: 60,
  tracks: [
    // Drone — fundamental tone with slow pitch drift
    t('Drone', 'purple', {
      instrumentType: 'rach-pad',
      volume: -4,
      effects: [fx('spectral-processing'), fx('reverb-convolution')],
      clips: [
        midiClip('', 'Drone Low', 0, 64, [
          // A1 sustained across 16 bars
          n(33, 0, 64, 80),   // A1 — root drone, full duration
          n(45, 8, 48, 50),   // A2 — octave reinforcement, offset entry
        ]),
        midiClip('', 'Drone Shift', 64, 64, [
          // Drift to E2 then back to A1
          n(40, 0, 32, 75),   // E2 — fifth relationship
          n(33, 24, 40, 80),  // A1 — re-enters before E fades
          n(45, 32, 32, 50),  // A2 — octave return
        ]),
      ],
    }),
    // Sub — deep subharmonic support
    t('Sub', 'blue', {
      instrumentType: 'subtractive',
      volume: -8,
      pan: -0.1,
      effects: [fx('reverb-algorithmic')],
      clips: [
        midiClip('', 'Sub Tone', 0, 128, [
          n(21, 0, 48, 90),   // A0 — very low sub
          n(28, 48, 32, 85),  // E1
          n(21, 80, 48, 90),  // A0 — return
        ]),
      ],
    }),
    // Harmonics — upper partials and overtones
    t('Harmonics', 'cyan', {
      instrumentType: 'wavetable',
      volume: -18,
      pan: 0.3,
      effects: [fx('spectral-processing'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Overtones A', 0, 64, [
          n(69, 4, 16, 30),   // A4 — 2nd harmonic
          n(76, 16, 12, 25),  // E5 — 3rd harmonic
          n(81, 32, 16, 20),  // A5 — 4th harmonic
          n(73, 48, 16, 28),  // C#5 — 5th harmonic (approx)
        ]),
        midiClip('', 'Overtones B', 64, 64, [
          n(76, 0, 16, 25),   // E5
          n(69, 20, 16, 30),  // A4
          n(84, 40, 12, 18),  // C6 — high shimmer
          n(81, 52, 12, 22),  // A5
        ]),
      ],
    }),
  ],
  sections: [
    section('Foundation', 0, 32, '#7c3aed'),
    section('Drift', 32, 32, '#6d28d9'),
    section('Shift', 64, 32, '#5b21b6'),
    section('Return', 96, 32, '#7c3aed'),
  ],
});

// ── 3. New Age ──────────────────────────────────────────────────────────────
// Beginner · 80 BPM · 16 bars · C major pentatonic arpeggios with warm pad

const newAgeMeta = meta(
  'New Age',
  'ambient',
  'beginner',
  'Gentle arpeggiated piano patterns over a warm sustained pad, using the C major pentatonic scale. Serene and uplifting, inspired by new age and meditation music.',
  16,
  ['new-age', 'arpeggio', 'pentatonic', 'piano', 'calm', 'c-major'],
);

const newAgeProject = buildTemplateProject({
  title: 'New Age',
  genre: 'Ambient',
  tempo: 80,
  tracks: [
    // Piano — arpeggiated C major pentatonic (C D E G A)
    t('Piano', 'green', {
      instrumentType: 'rach-pad',
      volume: -6,
      effects: [fx('reverb-algorithmic'), fx('chorus')],
      clips: [
        midiClip('', 'Arp A', 0, 32, [
          // Bars 1-4: ascending C pentatonic arpeggio
          n(60, 0, 2, 70),    // C4
          n(64, 2, 2, 65),    // E4
          n(67, 4, 2, 72),    // G4
          n(72, 6, 2, 68),    // C5
          n(69, 8, 2, 65),    // A4
          n(67, 10, 2, 60),   // G4
          n(64, 12, 2, 70),   // E4
          n(60, 14, 4, 75),   // C4 — longer resolve
          // Bars 5-8: variant with higher reach
          n(64, 18, 2, 68),   // E4
          n(67, 20, 2, 72),   // G4
          n(69, 22, 2, 70),   // A4
          n(72, 24, 4, 75),   // C5 — sustain
          n(67, 28, 4, 65),   // G4 — sustain
        ]),
        midiClip('', 'Arp B', 32, 32, [
          // Bars 9-12: descending pattern
          n(72, 0, 2, 72),    // C5
          n(69, 2, 2, 68),    // A4
          n(67, 4, 2, 65),    // G4
          n(64, 6, 2, 70),    // E4
          n(62, 8, 4, 72),    // D4 — pause
          n(60, 12, 4, 75),   // C4 — sustain
          // Bars 13-16: final ascending resolve
          n(60, 16, 2, 65),   // C4
          n(62, 18, 2, 60),   // D4
          n(64, 20, 2, 68),   // E4
          n(67, 22, 2, 72),   // G4
          n(69, 24, 2, 70),   // A4
          n(72, 26, 6, 75),   // C5 — long final note
        ]),
      ],
    }),
    // Pad — sustained chords underneath
    t('Pad', 'cyan', {
      instrumentType: 'wavetable',
      volume: -10,
      effects: [fx('reverb-algorithmic'), fx('chorus')],
      clips: [
        midiClip('', 'Warm Pad', 0, 64, [
          // Cmaj: C3-E3-G3 (bars 1-8)
          n(48, 0, 32, 55),   // C3
          n(52, 0, 32, 50),   // E3
          n(55, 0, 32, 55),   // G3
          // Am: A2-C3-E3 (bars 9-16)
          n(45, 32, 32, 55),  // A2
          n(48, 32, 32, 50),  // C3
          n(52, 32, 32, 55),  // E3
        ]),
      ],
    }),
  ],
  sections: [
    section('Opening', 0, 16, '#22c55e'),
    section('Rising', 16, 16, '#10b981'),
    section('Descent', 32, 16, '#14b8a6'),
    section('Close', 48, 16, '#22c55e'),
  ],
});

// ── 4. Dark Ambient ─────────────────────────────────────────────────────────
// Advanced · 50 BPM · 32 bars · Dissonant drones, unsettling textures

const darkAmbientMeta = meta(
  'Dark Ambient',
  'ambient',
  'advanced',
  'An unsettling, dissonant soundscape built from gritty subtractive drones, chaotic granular textures, and harsh FM noise. Tritones, minor seconds, and spectral unease throughout.',
  32,
  ['dark', 'dissonant', 'horror', 'drone', 'noise', 'experimental'],
);

const darkAmbientProject = buildTemplateProject({
  title: 'Dark Ambient',
  genre: 'Ambient',
  tempo: 50,
  tracks: [
    // Drone — low dissonant foundation with tritones and minor seconds
    t('Drone', 'red', {
      instrumentType: 'subtractive',
      volume: -4,
      effects: [fx('reverb-convolution'), fx('delay-tape')],
      clips: [
        midiClip('', 'Drone I', 0, 64, [
          // Bb1 + E2 tritone cluster
          n(34, 0, 32, 85),   // Bb1
          n(40, 0, 32, 80),   // E2 — tritone against Bb
          // Shift to B1 + C2 minor second
          n(35, 32, 32, 85),  // B1
          n(36, 32, 32, 75),  // C2 — grinding minor 2nd
        ]),
        midiClip('', 'Drone II', 64, 64, [
          // Eb2 + A2 tritone
          n(39, 0, 32, 80),   // Eb2
          n(45, 0, 32, 78),   // A2 — tritone
          // Collapse to Bb1 unison with beating
          n(34, 32, 32, 85),  // Bb1
          n(35, 36, 28, 70),  // B1 — semitone rub, delayed entry
        ]),
      ],
    }),
    // Texture — erratic granular events
    t('Texture', 'purple', {
      instrumentType: 'granular',
      volume: -10,
      pan: -0.4,
      effects: [fx('reverb-convolution'), fx('phaser')],
      clips: [
        midiClip('', 'Texture Chaos A', 0, 64, [
          n(89, 3, 4, 45),    // F6 — piercing high
          n(41, 12, 8, 55),   // F2 — deep rumble
          n(78, 24, 3, 40),   // F#5 — dissonant stab
          n(53, 34, 6, 50),   // F3
          n(91, 46, 2, 35),   // G6 — glitch
          n(38, 56, 8, 60),   // D2 — low groan
        ]),
        midiClip('', 'Texture Chaos B', 64, 64, [
          n(85, 0, 5, 38),    // Db6
          n(43, 10, 10, 55),  // G2
          n(92, 22, 3, 32),   // Ab6 — screech
          n(37, 30, 12, 58),  // Db2 — rumble
          n(80, 48, 4, 40),   // Ab5
          n(44, 56, 8, 52),   // Ab2
        ]),
      ],
    }),
    // Noise — FM synthesis creating metallic, inharmonic tones
    t('Noise', 'orange', {
      instrumentType: 'fm',
      volume: -16,
      pan: 0.5,
      effects: [fx('delay-tape'), fx('phaser'), fx('reverb-convolution')],
      clips: [
        midiClip('', 'Metallic A', 0, 64, [
          n(30, 0, 16, 50),   // F#1 — deep metallic
          n(31, 16, 8, 45),   // G1 — semitone grind
          n(66, 28, 12, 35),  // F#4 — high inharmonic
          n(67, 44, 12, 38),  // G4 — beating against F#4
          n(29, 56, 8, 55),   // F1 — subsonic rumble
        ]),
        midiClip('', 'Metallic B', 64, 64, [
          n(42, 0, 16, 48),   // F#2
          n(43, 8, 16, 42),   // G2 — overlapping dissonance
          n(54, 28, 10, 38),  // F#3
          n(55, 32, 10, 40),  // G3 — minor 2nd
          n(30, 48, 16, 55),  // F#1 — closing rumble
        ]),
      ],
    }),
  ],
  sections: [
    section('Void', 0, 32, '#991b1b'),
    section('Descent', 32, 32, '#7f1d1d'),
    section('Abyss', 64, 32, '#450a0a'),
    section('Emergence', 96, 32, '#991b1b'),
  ],
});

// ── 5. Space Ambient ────────────────────────────────────────────────────────
// Intermediate · 55 BPM · 32 bars · Cosmic, floating, interstellar atmosphere

const spaceAmbientMeta = meta(
  'Space Ambient',
  'ambient',
  'intermediate',
  'Cosmic, interstellar soundscape with floating FM bell tones, deep sub drones, and shimmering wavetable textures. Evokes drifting through vast, empty space.',
  32,
  ['space', 'cosmic', 'floating', 'bells', 'interstellar', 'vast'],
);

const spaceAmbientProject = buildTemplateProject({
  title: 'Space Ambient',
  genre: 'Ambient',
  tempo: 55,
  tracks: [
    // Bells — sparse FM bell tones, widely spaced
    t('Bells', 'cyan', {
      instrumentType: 'fm',
      volume: -8,
      pan: 25,
      effects: [fx('reverb-convolution'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Cosmic Bells', 0, 128, [
          n(72, 0, 4, 50),    // C5
          n(79, 8, 4, 45),    // G5
          n(76, 20, 6, 48),   // E5
          n(84, 32, 4, 42),   // C6
          n(71, 44, 8, 50),   // B4
          n(79, 56, 4, 44),   // G5
          n(67, 68, 6, 48),   // G4
          n(76, 80, 4, 42),   // E5
          n(72, 92, 8, 50),   // C5
          n(84, 108, 4, 40),  // C6
          n(79, 120, 8, 46),  // G5
        ]),
      ],
    }),
    // Drone — deep sub foundation
    t('Drone', 'purple', {
      instrumentType: 'rach-pad',
      volume: -6,
      effects: [fx('reverb-convolution'), fx('spectral-processing')],
      clips: [
        midiClip('', 'Space Drone', 0, 128, [
          // C2-G2 fifth — vast, open
          n(36, 0, 64, 65), n(43, 0, 64, 55),
          // Shift to G2-D3
          n(43, 56, 40, 65), n(50, 56, 40, 55),
          // Return to C
          n(36, 88, 40, 65), n(43, 88, 40, 55),
        ]),
      ],
    }),
    // Shimmer — high wavetable texture
    t('Shimmer', 'blue', {
      instrumentType: 'wavetable',
      volume: -16,
      pan: -30,
      effects: [fx('reverb-convolution'), fx('auto-pan'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Star Dust', 0, 128, [
          n(96, 0, 16, 25),   // C7 — barely audible sparkle
          n(91, 16, 12, 22),  // G6
          n(88, 32, 16, 28),  // E6
          n(96, 52, 12, 22),  // C7
          n(93, 68, 16, 25),  // A6
          n(91, 88, 12, 22),  // G6
          n(96, 104, 24, 25), // C7 — long fade
        ]),
      ],
    }),
  ],
  sections: [
    section('Launch', 0, 32, '#06b6d4'),
    section('Drift', 32, 32, '#7c3aed'),
    section('Void', 64, 32, '#1e3a5f'),
    section('Return', 96, 32, '#06b6d4'),
  ],
});

// ── 6. Generative Ambient ──────────────────────────────────────────────────
// Advanced · 40 BPM · 32 bars · Algorithmic-feeling sparse minimalism

const generativeAmbientMeta = meta(
  'Generative Ambient',
  'ambient',
  'advanced',
  'Sparse, minimalist ambient inspired by generative music systems. Irregular note placements, wide dynamic range, and unpredictable timbral shifts. Inspired by Brian Eno\'s ambient works.',
  32,
  ['generative', 'minimal', 'eno', 'sparse', 'algorithmic', 'experimental'],
);

const generativeAmbientProject = buildTemplateProject({
  title: 'Generative Ambient',
  genre: 'Ambient',
  tempo: 40,
  tracks: [
    // Layer 1 — FM with irregular note placements
    t('Tone A', 'green', {
      instrumentType: 'fm',
      volume: -10,
      pan: -40,
      effects: [fx('reverb-convolution'), fx('delay-pingpong')],
      clips: [
        midiClip('', 'Gen A', 0, 128, [
          n(60, 0, 8, 55),     // C4
          n(67, 13, 10, 48),   // G4
          n(64, 28, 6, 52),    // E4
          n(72, 45, 12, 42),   // C5
          n(59, 62, 8, 50),    // B3
          n(65, 78, 10, 45),   // F4
          n(69, 95, 6, 52),    // A4
          n(60, 110, 18, 48),  // C4
        ]),
      ],
    }),
    // Layer 2 — wavetable with different timing
    t('Tone B', 'blue', {
      instrumentType: 'wavetable',
      volume: -12,
      pan: 35,
      effects: [fx('reverb-convolution'), fx('auto-pan')],
      clips: [
        midiClip('', 'Gen B', 0, 128, [
          n(76, 5, 12, 40),    // E5
          n(72, 22, 8, 45),    // C5
          n(79, 38, 14, 38),   // G5
          n(74, 58, 10, 42),   // D5
          n(71, 73, 12, 40),   // B4
          n(76, 92, 8, 44),    // E5
          n(84, 112, 16, 35),  // C6
        ]),
      ],
    }),
    // Layer 3 — deep pad, very slow
    t('Substrate', 'purple', {
      instrumentType: 'rach-pad',
      volume: -14,
      effects: [fx('reverb-convolution')],
      clips: [
        midiClip('', 'Gen Pad', 0, 128, [
          // C-G open fifth, evolving very slowly
          n(48, 0, 48, 45), n(55, 0, 48, 40),
          // Shift to D-A
          n(50, 40, 48, 45), n(57, 40, 48, 40),
          // Return to C-G
          n(48, 80, 48, 45), n(55, 80, 48, 40),
        ]),
      ],
    }),
  ],
  sections: [
    section('Emergence', 0, 32, '#22c55e'),
    section('Evolution', 32, 32, '#3b82f6'),
    section('Dissolution', 64, 32, '#7c3aed'),
    section('Rebirth', 96, 32, '#22c55e'),
  ],
});

// ── Export ───────────────────────────────────────────────────────────────────

export const ambientTemplates: ProjectTemplate[] = [
  template(ambientPadMeta, ambientPadProject),
  template(droneMeta, droneProject),
  template(newAgeMeta, newAgeProject),
  template(darkAmbientMeta, darkAmbientProject),
  template(spaceAmbientMeta, spaceAmbientProject),
  template(generativeAmbientMeta, generativeAmbientProject),
];
