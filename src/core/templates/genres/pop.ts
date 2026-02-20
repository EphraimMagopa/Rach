import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ── MIDI note constants ──────────────────────────────────────────────
// Octave 2
const C2 = 36, E2 = 40, F2 = 41, G2 = 43, A2 = 45;
// Octave 3
const C3 = 48, D3 = 50, E3 = 52, F3 = 53, G3 = 55, A3 = 57, B3 = 59;
// Octave 4
const C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, B4 = 71;
// Octave 5
const C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79;

// =====================================================================
// 1. Pop Hit — beginner, 120 BPM, 16 bars
//    C-G-Am-F progression | Verse + Chorus
// =====================================================================
const popHit = template(
  meta('Pop Hit', 'pop', 'beginner',
    'Classic pop chord progression with synth, bass, and drums. A great starting point for writing pop songs.',
    16, ['pop', 'beginner', 'chords', '4-chord']),
  buildTemplateProject({
    title: 'Pop Hit',
    genre: 'Pop',
    tempo: 120,
    tracks: [
      // Synth — C-G-Am-F block chords (subtractive)
      t('Synth', 'cyan', {
        instrumentType: 'subtractive',
        clips: [
          // Verse chords (bars 1–8): C | G | Am | F, repeated
          midiClip('', 'Verse Chords', 0, 32, [
            // C major (bar 1–2)
            n(C4, 0, 4, 90), n(E4, 0, 4, 85), n(G4, 0, 4, 85),
            n(C4, 4, 4, 90), n(E4, 4, 4, 85), n(G4, 4, 4, 85),
            // G major (bar 3–4)
            n(G4, 8, 4, 90), n(B4, 8, 4, 85), n(D5, 8, 4, 85),
            n(G4, 12, 4, 90), n(B4, 12, 4, 85), n(D5, 12, 4, 85),
            // A minor (bar 5–6)
            n(A4, 16, 4, 90), n(C5, 16, 4, 85), n(E5, 16, 4, 85),
            n(A4, 20, 4, 90), n(C5, 20, 4, 85), n(E5, 20, 4, 85),
            // F major (bar 7–8)
            n(F4, 24, 4, 90), n(A4, 24, 4, 85), n(C5, 24, 4, 85),
            n(F4, 28, 4, 90), n(A4, 28, 4, 85), n(C5, 28, 4, 85),
          ]),
          // Chorus chords (bars 9–16): same progression, louder
          midiClip('', 'Chorus Chords', 32, 32, [
            n(C4, 0, 4, 110), n(E4, 0, 4, 105), n(G4, 0, 4, 105),
            n(C4, 4, 4, 110), n(E4, 4, 4, 105), n(G4, 4, 4, 105),
            n(G4, 8, 4, 110), n(B4, 8, 4, 105), n(D5, 8, 4, 105),
            n(G4, 12, 4, 110), n(B4, 12, 4, 105), n(D5, 12, 4, 105),
            n(A4, 16, 4, 110), n(C5, 16, 4, 105), n(E5, 16, 4, 105),
            n(A4, 20, 4, 110), n(C5, 20, 4, 105), n(E5, 20, 4, 105),
            n(F4, 24, 4, 110), n(A4, 24, 4, 105), n(C5, 24, 4, 105),
            n(F4, 28, 4, 110), n(A4, 28, 4, 105), n(C5, 28, 4, 105),
          ]),
        ],
      }),
      // Bass — root notes following the progression (subtractive)
      t('Bass', 'blue', {
        instrumentType: 'subtractive',
        volume: -3,
        clips: [
          midiClip('', 'Verse Bass', 0, 32, [
            n(C2, 0, 4, 100), n(C2, 4, 4, 95),
            n(G2, 8, 4, 100), n(G2, 12, 4, 95),
            n(A2, 16, 4, 100), n(A2, 20, 4, 95),
            n(F2, 24, 4, 100), n(F2, 28, 4, 95),
          ]),
          midiClip('', 'Chorus Bass', 32, 32, [
            n(C2, 0, 2, 110), n(C2, 2, 2, 100), n(C2, 4, 2, 110), n(C2, 6, 2, 100),
            n(G2, 8, 2, 110), n(G2, 10, 2, 100), n(G2, 12, 2, 110), n(G2, 14, 2, 100),
            n(A2, 16, 2, 110), n(A2, 18, 2, 100), n(A2, 20, 2, 110), n(A2, 22, 2, 100),
            n(F2, 24, 2, 110), n(F2, 26, 2, 100), n(F2, 28, 2, 110), n(F2, 30, 2, 100),
          ]),
        ],
      }),
      // Drums pad — kick/snare pattern via granular
      t('Drums', 'red', {
        instrumentType: 'granular',
        clips: [
          midiClip('', 'Verse Beat', 0, 32, [
            // Kick on 1 & 3, snare on 2 & 4 (C3=kick, D3=snare, F3=hi-hat)
            n(C3, 0, 1, 110), n(F3, 0, 0.5, 70), n(F3, 1, 0.5, 70),
            n(D3, 2, 1, 100), n(F3, 2, 0.5, 70), n(F3, 3, 0.5, 70),
            n(C3, 4, 1, 110), n(F3, 4, 0.5, 70), n(F3, 5, 0.5, 70),
            n(D3, 6, 1, 100), n(F3, 6, 0.5, 70), n(F3, 7, 0.5, 70),
          ]),
          midiClip('', 'Chorus Beat', 32, 32, [
            n(C3, 0, 1, 120), n(F3, 0, 0.5, 80), n(F3, 1, 0.5, 80),
            n(D3, 2, 1, 110), n(F3, 2, 0.5, 80), n(F3, 3, 0.5, 80),
            n(C3, 4, 1, 120), n(F3, 4, 0.5, 80), n(F3, 5, 0.5, 80),
            n(D3, 6, 1, 110), n(F3, 6, 0.5, 80), n(F3, 7, 0.5, 80),
          ]),
        ],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#3b82f6'),
      section('Chorus', 32, 32, '#f59e0b'),
    ],
  }),
);

// =====================================================================
// 2. Synth Pop — intermediate, 128 BPM, 16 bars
//    Lead (wavetable) + Pad (rach-pad) + Bass (subtractive)
//    Chorus + delay on lead | Intro, Verse, Chorus
// =====================================================================
const synthPop = template(
  meta('Synth Pop', 'pop', 'intermediate',
    'Retro-inspired synth pop with shimmering lead, warm pad, and punchy bass. Chorus and delay on the lead.',
    16, ['synth-pop', 'retro', '80s', 'electronic']),
  buildTemplateProject({
    title: 'Synth Pop',
    genre: 'Pop',
    tempo: 128,
    tracks: [
      // Lead — melodic line (wavetable) with chorus + delay
      t('Lead Synth', 'purple', {
        instrumentType: 'wavetable',
        effects: [fx('chorus'), fx('delay-pingpong')],
        clips: [
          // Intro melody (bars 1–4)
          midiClip('', 'Intro Melody', 0, 16, [
            n(E5, 0, 1, 95), n(D5, 1, 1, 90), n(C5, 2, 2, 100),
            n(E5, 4, 1, 95), n(D5, 5, 1, 90), n(G5, 6, 2, 105),
            n(C5, 8, 1, 90), n(D5, 9, 1, 85), n(E5, 10, 2, 95),
            n(G4, 12, 2, 90), n(A4, 14, 2, 95),
          ]),
          // Verse melody (bars 5–8)
          midiClip('', 'Verse Melody', 16, 16, [
            n(C5, 0, 1.5, 90), n(D5, 2, 1, 85), n(E5, 3, 1, 95),
            n(G5, 4, 2, 100), n(E5, 6, 1, 90), n(D5, 7, 1, 85),
            n(C5, 8, 2, 95), n(B4, 10, 1, 85), n(A4, 11, 1, 80),
            n(G4, 12, 2, 90), n(C5, 14, 2, 100),
          ]),
          // Chorus melody (bars 9–16)
          midiClip('', 'Chorus Melody', 32, 32, [
            n(E5, 0, 2, 110), n(G5, 2, 2, 110), n(C5, 4, 2, 105),
            n(D5, 6, 2, 105), n(E5, 8, 1, 110), n(F5, 9, 1, 105),
            n(G5, 10, 2, 115), n(E5, 12, 2, 105), n(C5, 14, 2, 100),
            n(E5, 16, 2, 110), n(G5, 18, 2, 110), n(C5, 20, 2, 105),
            n(D5, 22, 2, 105), n(G5, 24, 4, 115), n(E5, 28, 4, 110),
          ]),
        ],
      }),
      // Pad — sustained chords (rach-pad)
      t('Pad', 'pink', {
        instrumentType: 'rach-pad',
        volume: -6,
        clips: [
          midiClip('', 'Intro Pad', 0, 16, [
            n(C4, 0, 8, 65), n(E4, 0, 8, 60), n(G4, 0, 8, 60),
            n(A3, 8, 8, 65), n(C4, 8, 8, 60), n(E4, 8, 8, 60),
          ]),
          midiClip('', 'Verse Pad', 16, 16, [
            n(F3, 0, 8, 70), n(A3, 0, 8, 65), n(C4, 0, 8, 65),
            n(G3, 8, 8, 70), n(B3, 8, 8, 65), n(D4, 8, 8, 65),
          ]),
          midiClip('', 'Chorus Pad', 32, 32, [
            n(C4, 0, 8, 80), n(E4, 0, 8, 75), n(G4, 0, 8, 75),
            n(F3, 8, 8, 80), n(A3, 8, 8, 75), n(C4, 8, 8, 75),
            n(G3, 16, 8, 80), n(B3, 16, 8, 75), n(D4, 16, 8, 75),
            n(A3, 24, 8, 80), n(C4, 24, 8, 75), n(E4, 24, 8, 75),
          ]),
        ],
      }),
      // Bass (subtractive)
      t('Bass', 'blue', {
        instrumentType: 'subtractive',
        volume: -2,
        clips: [
          midiClip('', 'Intro Bass', 0, 16, [
            n(C2, 0, 2, 100), n(C2, 4, 2, 95),
            n(A2, 8, 2, 100), n(A2, 12, 2, 95),
          ]),
          midiClip('', 'Verse Bass', 16, 16, [
            n(F2, 0, 1, 100), n(F2, 2, 1, 90), n(F2, 4, 2, 100),
            n(G2, 8, 1, 100), n(G2, 10, 1, 90), n(G2, 12, 2, 100),
          ]),
          midiClip('', 'Chorus Bass', 32, 32, [
            n(C2, 0, 1, 110), n(C2, 2, 1, 100), n(C2, 4, 2, 110),
            n(F2, 8, 1, 110), n(F2, 10, 1, 100), n(F2, 12, 2, 110),
            n(G2, 16, 1, 110), n(G2, 18, 1, 100), n(G2, 20, 2, 110),
            n(A2, 24, 1, 110), n(A2, 26, 1, 100), n(A2, 28, 2, 110),
          ]),
        ],
      }),
    ],
    sections: [
      section('Intro', 0, 16, '#8b5cf6'),
      section('Verse', 16, 16, '#3b82f6'),
      section('Chorus', 32, 32, '#f59e0b'),
    ],
  }),
);

// =====================================================================
// 3. Indie Pop — intermediate, 110 BPM, 16 bars
//    Guitar-like (wavetable) + Keys (fm) + Bass (subtractive)
//    Reverb-algorithmic | Arpeggiated patterns
// =====================================================================
const indiePop = template(
  meta('Indie Pop', 'pop', 'intermediate',
    'Bright indie pop with arpeggiated guitar patterns, dreamy FM keys, and a steady bass. Lush reverb throughout.',
    16, ['indie', 'arpeggiated', 'dreamy', 'guitar']),
  buildTemplateProject({
    title: 'Indie Pop',
    genre: 'Pop',
    tempo: 110,
    tracks: [
      // Guitar-like arpeggios (wavetable) with reverb
      t('Guitar', 'orange', {
        instrumentType: 'wavetable',
        effects: [fx('reverb-algorithmic')],
        clips: [
          // C major arpeggio patterns across 16 bars
          midiClip('', 'Verse Arp', 0, 32, [
            // C arp (bars 1–2)
            n(C4, 0, 0.5, 85), n(E4, 0.5, 0.5, 80), n(G4, 1, 0.5, 80), n(C5, 1.5, 0.5, 85),
            n(G4, 2, 0.5, 80), n(E4, 2.5, 0.5, 75), n(C4, 3, 0.5, 80), n(E4, 3.5, 0.5, 75),
            // Am arp (bars 3–4)
            n(A3, 8, 0.5, 85), n(C4, 8.5, 0.5, 80), n(E4, 9, 0.5, 80), n(A4, 9.5, 0.5, 85),
            n(E4, 10, 0.5, 80), n(C4, 10.5, 0.5, 75), n(A3, 11, 0.5, 80), n(C4, 11.5, 0.5, 75),
            // F arp (bars 5–6)
            n(F3, 16, 0.5, 85), n(A3, 16.5, 0.5, 80), n(C4, 17, 0.5, 80), n(F4, 17.5, 0.5, 85),
            n(C4, 18, 0.5, 80), n(A3, 18.5, 0.5, 75), n(F3, 19, 0.5, 80), n(A3, 19.5, 0.5, 75),
            // G arp (bars 7–8)
            n(G3, 24, 0.5, 85), n(B3, 24.5, 0.5, 80), n(D4, 25, 0.5, 80), n(G4, 25.5, 0.5, 85),
            n(D4, 26, 0.5, 80), n(B3, 26.5, 0.5, 75), n(G3, 27, 0.5, 80), n(B3, 27.5, 0.5, 75),
          ]),
          midiClip('', 'Chorus Arp', 32, 32, [
            // C arp louder
            n(C4, 0, 0.5, 100), n(E4, 0.5, 0.5, 95), n(G4, 1, 0.5, 95), n(C5, 1.5, 0.5, 100),
            n(G4, 2, 0.5, 95), n(E4, 2.5, 0.5, 90), n(G4, 3, 0.5, 95), n(C5, 3.5, 0.5, 100),
            // Em arp
            n(E4, 8, 0.5, 100), n(G4, 8.5, 0.5, 95), n(B4, 9, 0.5, 95), n(E5, 9.5, 0.5, 100),
            n(B4, 10, 0.5, 95), n(G4, 10.5, 0.5, 90), n(B4, 11, 0.5, 95), n(E5, 11.5, 0.5, 100),
            // F arp
            n(F4, 16, 0.5, 100), n(A4, 16.5, 0.5, 95), n(C5, 17, 0.5, 95), n(F5, 17.5, 0.5, 100),
            n(C5, 18, 0.5, 95), n(A4, 18.5, 0.5, 90), n(C5, 19, 0.5, 95), n(F5, 19.5, 0.5, 100),
            // G arp
            n(G4, 24, 0.5, 100), n(B4, 24.5, 0.5, 95), n(D5, 25, 0.5, 95), n(G5, 25.5, 0.5, 100),
            n(D5, 26, 0.5, 95), n(B4, 26.5, 0.5, 90), n(D5, 27, 0.5, 95), n(G5, 27.5, 0.5, 100),
          ]),
        ],
      }),
      // Keys — sustained FM chords
      t('Keys', 'green', {
        instrumentType: 'fm',
        volume: -4,
        effects: [fx('reverb-algorithmic')],
        clips: [
          midiClip('', 'Verse Keys', 0, 32, [
            n(C4, 0, 8, 70), n(E4, 0, 8, 65), n(G4, 0, 8, 65),
            n(A3, 8, 8, 70), n(C4, 8, 8, 65), n(E4, 8, 8, 65),
            n(F3, 16, 8, 70), n(A3, 16, 8, 65), n(C4, 16, 8, 65),
            n(G3, 24, 8, 70), n(B3, 24, 8, 65), n(D4, 24, 8, 65),
          ]),
          midiClip('', 'Chorus Keys', 32, 32, [
            n(C4, 0, 8, 80), n(E4, 0, 8, 75), n(G4, 0, 8, 75),
            n(E3, 8, 8, 80), n(G3, 8, 8, 75), n(B3, 8, 8, 75),
            n(F3, 16, 8, 80), n(A3, 16, 8, 75), n(C4, 16, 8, 75),
            n(G3, 24, 8, 80), n(B3, 24, 8, 75), n(D4, 24, 8, 75),
          ]),
        ],
      }),
      // Bass (subtractive)
      t('Bass', 'blue', {
        instrumentType: 'subtractive',
        volume: -2,
        clips: [
          midiClip('', 'Verse Bass', 0, 32, [
            n(C2, 0, 4, 95), n(C2, 4, 4, 90),
            n(A2, 8, 4, 95), n(A2, 12, 4, 90),
            n(F2, 16, 4, 95), n(F2, 20, 4, 90),
            n(G2, 24, 4, 95), n(G2, 28, 4, 90),
          ]),
          midiClip('', 'Chorus Bass', 32, 32, [
            n(C2, 0, 2, 105), n(C3, 2, 1, 90), n(C2, 4, 2, 105), n(C3, 6, 1, 90),
            n(E2, 8, 2, 105), n(E3, 10, 1, 90), n(E2, 12, 2, 105), n(E3, 14, 1, 90),
            n(F2, 16, 2, 105), n(F3, 18, 1, 90), n(F2, 20, 2, 105), n(F3, 22, 1, 90),
            n(G2, 24, 2, 105), n(G3, 26, 1, 90), n(G2, 28, 2, 105), n(G3, 30, 1, 90),
          ]),
        ],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#3b82f6'),
      section('Chorus', 32, 32, '#f59e0b'),
    ],
  }),
);

// =====================================================================
// 4. K-Pop — advanced, 125 BPM, 32 bars
//    Lead (wavetable) + Synth (fm) + Bass (subtractive) + Pad (rach-pad)
//    Energetic | Intro, Verse, Pre-Chorus, Chorus
// =====================================================================
const kPop = template(
  meta('K-Pop', 'pop', 'advanced',
    'High-energy K-Pop with dynamic synth lead, FM textures, driving bass, and lush pad. Full arrangement with pre-chorus build.',
    32, ['k-pop', 'energetic', 'dance', 'advanced']),
  buildTemplateProject({
    title: 'K-Pop',
    genre: 'Pop',
    tempo: 125,
    tracks: [
      // Lead (wavetable) — catchy melodic hooks
      t('Lead', 'pink', {
        instrumentType: 'wavetable',
        effects: [fx('delay-pingpong'), fx('reverb-algorithmic')],
        clips: [
          // Intro hook (bars 1–4)
          midiClip('', 'Intro Hook', 0, 16, [
            n(E5, 0, 0.5, 100), n(G5, 0.5, 0.5, 95), n(A4, 1, 1, 100),
            n(G4, 2, 0.5, 90), n(A4, 2.5, 0.5, 95), n(C5, 3, 1, 100),
            n(E5, 4, 1, 105), n(D5, 5, 1, 100), n(C5, 6, 2, 95),
            n(E5, 8, 0.5, 100), n(G5, 8.5, 0.5, 95), n(A4, 9, 1, 100),
            n(C5, 10, 1, 95), n(D5, 11, 1, 100), n(E5, 12, 4, 110),
          ]),
          // Verse melody (bars 5–12)
          midiClip('', 'Verse Melody', 16, 32, [
            n(C5, 0, 1, 90), n(D5, 1, 0.5, 85), n(E5, 1.5, 0.5, 90),
            n(G4, 2, 1, 85), n(A4, 3, 1, 90),
            n(C5, 4, 1.5, 95), n(B4, 5.5, 0.5, 85), n(A4, 6, 1, 90), n(G4, 7, 1, 85),
            n(E4, 8, 1, 90), n(G4, 9, 0.5, 85), n(A4, 9.5, 0.5, 90),
            n(C5, 10, 2, 95), n(B4, 12, 1, 85), n(A4, 13, 1, 85),
            n(G4, 14, 2, 90),
          ]),
          // Pre-Chorus build (bars 13–16)
          midiClip('', 'Pre-Chorus', 48, 16, [
            n(A4, 0, 1, 100), n(B4, 1, 1, 105), n(C5, 2, 1, 110),
            n(D5, 3, 1, 110), n(E5, 4, 1, 115), n(E5, 5, 0.5, 110),
            n(F5, 5.5, 0.5, 115), n(G5, 6, 2, 120),
            n(A4, 8, 1, 105), n(C5, 9, 1, 110), n(D5, 10, 1, 115),
            n(E5, 11, 1, 115), n(G5, 12, 4, 125),
          ]),
          // Chorus (bars 17–32)
          midiClip('', 'Chorus Melody', 64, 64, [
            n(E5, 0, 1, 120), n(G5, 1, 1, 120), n(A4, 2, 1, 115),
            n(C5, 3, 1, 120), n(E5, 4, 2, 125), n(D5, 6, 2, 120),
            n(C5, 8, 1, 115), n(D5, 9, 1, 120), n(E5, 10, 2, 125),
            n(G5, 12, 2, 120), n(E5, 14, 2, 115),
            n(E5, 16, 1, 120), n(G5, 17, 1, 120), n(A4, 18, 1, 115),
            n(C5, 19, 1, 120), n(E5, 20, 2, 125), n(D5, 22, 2, 120),
            n(G5, 24, 4, 127), n(E5, 28, 4, 120),
          ]),
        ],
      }),
      // Synth — FM textures and stabs
      t('Synth FX', 'cyan', {
        instrumentType: 'fm',
        volume: -4,
        effects: [fx('chorus')],
        clips: [
          midiClip('', 'Verse Stabs', 16, 32, [
            n(C5, 0, 0.25, 100), n(E5, 0, 0.25, 95), n(G5, 0, 0.25, 95),
            n(C5, 4, 0.25, 100), n(E5, 4, 0.25, 95), n(G5, 4, 0.25, 95),
            n(A4, 8, 0.25, 100), n(C5, 8, 0.25, 95), n(E5, 8, 0.25, 95),
            n(A4, 12, 0.25, 100), n(C5, 12, 0.25, 95), n(E5, 12, 0.25, 95),
          ]),
          midiClip('', 'Chorus Stabs', 64, 64, [
            n(C5, 0, 0.25, 115), n(E5, 0, 0.25, 110), n(G5, 0, 0.25, 110),
            n(C5, 2, 0.25, 110), n(E5, 2, 0.25, 105),
            n(F4, 4, 0.25, 115), n(A4, 4, 0.25, 110), n(C5, 4, 0.25, 110),
            n(F4, 6, 0.25, 110), n(A4, 6, 0.25, 105),
            n(G4, 8, 0.25, 115), n(B4, 8, 0.25, 110), n(D5, 8, 0.25, 110),
            n(G4, 10, 0.25, 110), n(B4, 10, 0.25, 105),
            n(A4, 12, 0.25, 115), n(C5, 12, 0.25, 110), n(E5, 12, 0.25, 110),
          ]),
        ],
      }),
      // Bass (subtractive) — driving eighth-note patterns
      t('Bass', 'blue', {
        instrumentType: 'subtractive',
        volume: -1,
        effects: [fx('compressor-vca')],
        clips: [
          midiClip('', 'Verse Bass', 16, 32, [
            n(C2, 0, 1, 105), n(C2, 2, 1, 100), n(C2, 4, 1, 105), n(C2, 6, 1, 100),
            n(A2, 8, 1, 105), n(A2, 10, 1, 100), n(A2, 12, 1, 105), n(A2, 14, 1, 100),
            n(F2, 16, 1, 105), n(F2, 18, 1, 100), n(F2, 20, 1, 105), n(F2, 22, 1, 100),
            n(G2, 24, 1, 105), n(G2, 26, 1, 100), n(G2, 28, 1, 105), n(G2, 30, 1, 100),
          ]),
          midiClip('', 'Chorus Bass', 64, 64, [
            n(C2, 0, 0.5, 115), n(C2, 1, 0.5, 110), n(C2, 2, 0.5, 115), n(C2, 3, 0.5, 110),
            n(C2, 4, 0.5, 115), n(C2, 5, 0.5, 110), n(C2, 6, 0.5, 115), n(C2, 7, 0.5, 110),
            n(F2, 8, 0.5, 115), n(F2, 9, 0.5, 110), n(F2, 10, 0.5, 115), n(F2, 11, 0.5, 110),
            n(F2, 12, 0.5, 115), n(F2, 13, 0.5, 110), n(F2, 14, 0.5, 115), n(F2, 15, 0.5, 110),
          ]),
        ],
      }),
      // Pad (rach-pad) — warm sustained layers
      t('Pad', 'yellow', {
        instrumentType: 'rach-pad',
        volume: -8,
        clips: [
          midiClip('', 'Pre-Chorus Pad', 48, 16, [
            n(A3, 0, 8, 70), n(C4, 0, 8, 65), n(E4, 0, 8, 65),
            n(G3, 8, 8, 75), n(B3, 8, 8, 70), n(D4, 8, 8, 70),
          ]),
          midiClip('', 'Chorus Pad', 64, 64, [
            n(C4, 0, 16, 75), n(E4, 0, 16, 70), n(G4, 0, 16, 70),
            n(F3, 16, 16, 75), n(A3, 16, 16, 70), n(C4, 16, 16, 70),
            n(G3, 32, 16, 75), n(B3, 32, 16, 70), n(D4, 32, 16, 70),
            n(A3, 48, 16, 75), n(C4, 48, 16, 70), n(E4, 48, 16, 70),
          ]),
        ],
      }),
    ],
    sections: [
      section('Intro', 0, 16, '#8b5cf6'),
      section('Verse', 16, 32, '#3b82f6'),
      section('Pre-Chorus', 48, 16, '#f97316'),
      section('Chorus', 64, 64, '#ef4444'),
    ],
  }),
);

// =====================================================================
// 5. Dance Pop — beginner, 124 BPM, 16 bars
//    Synth stabs (wavetable) + Bass (subtractive)
//    Compressor-vca + limiter | Driving rhythm
// =====================================================================
const dancePop = template(
  meta('Dance Pop', 'pop', 'beginner',
    'Upbeat dance pop with punchy synth stabs and a driving bass. Compressed and limited for maximum energy.',
    16, ['dance-pop', 'upbeat', 'club', 'driving']),
  buildTemplateProject({
    title: 'Dance Pop',
    genre: 'Pop',
    tempo: 124,
    tracks: [
      // Synth stabs (wavetable) — rhythmic chord hits
      t('Synth Stabs', 'orange', {
        instrumentType: 'wavetable',
        effects: [fx('compressor-vca'), fx('limiter')],
        clips: [
          midiClip('', 'Verse Stabs', 0, 32, [
            // C major stabs — off-beat pattern
            n(C4, 0.5, 0.25, 110), n(E4, 0.5, 0.25, 105), n(G4, 0.5, 0.25, 105),
            n(C4, 2.5, 0.25, 105), n(E4, 2.5, 0.25, 100), n(G4, 2.5, 0.25, 100),
            n(C4, 4.5, 0.25, 110), n(E4, 4.5, 0.25, 105), n(G4, 4.5, 0.25, 105),
            n(C4, 6.5, 0.25, 105), n(E4, 6.5, 0.25, 100), n(G4, 6.5, 0.25, 100),
            // F major stabs
            n(F4, 8.5, 0.25, 110), n(A4, 8.5, 0.25, 105), n(C5, 8.5, 0.25, 105),
            n(F4, 10.5, 0.25, 105), n(A4, 10.5, 0.25, 100), n(C5, 10.5, 0.25, 100),
            n(F4, 12.5, 0.25, 110), n(A4, 12.5, 0.25, 105), n(C5, 12.5, 0.25, 105),
            n(F4, 14.5, 0.25, 105), n(A4, 14.5, 0.25, 100), n(C5, 14.5, 0.25, 100),
          ]),
          midiClip('', 'Chorus Stabs', 32, 32, [
            // G major stabs — every beat
            n(G4, 0, 0.25, 120), n(B4, 0, 0.25, 115), n(D5, 0, 0.25, 115),
            n(G4, 1, 0.25, 115), n(B4, 1, 0.25, 110), n(D5, 1, 0.25, 110),
            n(G4, 2, 0.25, 120), n(B4, 2, 0.25, 115), n(D5, 2, 0.25, 115),
            n(G4, 3, 0.25, 115), n(B4, 3, 0.25, 110), n(D5, 3, 0.25, 110),
            // Am stabs
            n(A4, 8, 0.25, 120), n(C5, 8, 0.25, 115), n(E5, 8, 0.25, 115),
            n(A4, 9, 0.25, 115), n(C5, 9, 0.25, 110), n(E5, 9, 0.25, 110),
            n(A4, 10, 0.25, 120), n(C5, 10, 0.25, 115), n(E5, 10, 0.25, 115),
            n(A4, 11, 0.25, 115), n(C5, 11, 0.25, 110), n(E5, 11, 0.25, 110),
          ]),
        ],
      }),
      // Bass (subtractive) — four-on-the-floor driving pattern
      t('Bass', 'red', {
        instrumentType: 'subtractive',
        volume: -1,
        effects: [fx('compressor-vca')],
        clips: [
          midiClip('', 'Verse Bass', 0, 32, [
            // C bass — steady quarter notes
            n(C2, 0, 1, 110), n(C2, 1, 1, 100), n(C2, 2, 1, 110), n(C2, 3, 1, 100),
            n(C2, 4, 1, 110), n(C2, 5, 1, 100), n(C2, 6, 1, 110), n(C2, 7, 1, 100),
            // F bass
            n(F2, 8, 1, 110), n(F2, 9, 1, 100), n(F2, 10, 1, 110), n(F2, 11, 1, 100),
            n(F2, 12, 1, 110), n(F2, 13, 1, 100), n(F2, 14, 1, 110), n(F2, 15, 1, 100),
          ]),
          midiClip('', 'Chorus Bass', 32, 32, [
            // G bass — eighth notes for energy
            n(G2, 0, 0.5, 115), n(G2, 0.5, 0.5, 105), n(G2, 1, 0.5, 115), n(G2, 1.5, 0.5, 105),
            n(G2, 2, 0.5, 115), n(G2, 2.5, 0.5, 105), n(G2, 3, 0.5, 115), n(G2, 3.5, 0.5, 105),
            n(G2, 4, 0.5, 115), n(G2, 4.5, 0.5, 105), n(G2, 5, 0.5, 115), n(G2, 5.5, 0.5, 105),
            n(G2, 6, 0.5, 115), n(G2, 6.5, 0.5, 105), n(G2, 7, 0.5, 115), n(G2, 7.5, 0.5, 105),
            // Am bass — eighth notes
            n(A2, 8, 0.5, 115), n(A2, 8.5, 0.5, 105), n(A2, 9, 0.5, 115), n(A2, 9.5, 0.5, 105),
            n(A2, 10, 0.5, 115), n(A2, 10.5, 0.5, 105), n(A2, 11, 0.5, 115), n(A2, 11.5, 0.5, 105),
            n(A2, 12, 0.5, 115), n(A2, 12.5, 0.5, 105), n(A2, 13, 0.5, 115), n(A2, 13.5, 0.5, 105),
            n(A2, 14, 0.5, 115), n(A2, 14.5, 0.5, 105), n(A2, 15, 0.5, 115), n(A2, 15.5, 0.5, 105),
          ]),
        ],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#3b82f6'),
      section('Chorus', 32, 32, '#ef4444'),
    ],
  }),
);

// =====================================================================
// 6. Pop Ballad — beginner, 72 BPM, 16 bars
//    Piano (rach-pad) + Strings (wavetable)
//    Gentle ballad in G major | Reverb-convolution
// =====================================================================
const popBallad = template(
  meta('Pop Ballad', 'pop', 'beginner',
    'Gentle pop ballad in G major with expressive piano and lush string accompaniment. Convolution reverb for warmth.',
    16, ['ballad', 'piano', 'strings', 'gentle', 'emotional']),
  buildTemplateProject({
    title: 'Pop Ballad',
    genre: 'Pop',
    tempo: 72,
    tracks: [
      // Piano (rach-pad) — gentle arpeggiated chords in G major
      t('Piano', 'green', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-convolution')],
        clips: [
          // Verse: G - Em - C - D (bars 1–8)
          midiClip('', 'Verse Piano', 0, 32, [
            // G major — gentle broken chord
            n(G3, 0, 1, 70), n(B3, 0.5, 1, 65), n(D4, 1, 1, 65), n(G4, 1.5, 1.5, 70),
            n(G3, 4, 1, 68), n(D4, 4.5, 1, 63), n(B3, 5, 1, 63), n(G4, 5.5, 1.5, 68),
            // Em — gentle broken chord
            n(E3, 8, 1, 70), n(G3, 8.5, 1, 65), n(B3, 9, 1, 65), n(E4, 9.5, 1.5, 70),
            n(E3, 12, 1, 68), n(B3, 12.5, 1, 63), n(G3, 13, 1, 63), n(E4, 13.5, 1.5, 68),
            // C major
            n(C3, 16, 1, 72), n(E3, 16.5, 1, 67), n(G3, 17, 1, 67), n(C4, 17.5, 1.5, 72),
            n(C3, 20, 1, 70), n(G3, 20.5, 1, 65), n(E3, 21, 1, 65), n(C4, 21.5, 1.5, 70),
            // D major
            n(D3, 24, 1, 72), n(F3 + 1, 24.5, 1, 67), n(A3, 25, 1, 67), n(D4, 25.5, 1.5, 72),
            n(D3, 28, 1, 70), n(A3, 28.5, 1, 65), n(F3 + 1, 29, 1, 65), n(D4, 29.5, 1.5, 70),
          ]),
          // Chorus: G - D/F# - Em - C (bars 9–16) — fuller, more open
          midiClip('', 'Chorus Piano', 32, 32, [
            // G major — full chord
            n(G3, 0, 2, 80), n(B3, 0, 2, 75), n(D4, 0, 2, 75), n(G4, 0, 2, 80),
            n(G3, 4, 2, 78), n(B3, 4, 2, 73), n(D4, 4, 2, 73),
            // D/F# (F#3 = 54)
            n(54, 8, 2, 80), n(A3, 8, 2, 75), n(D4, 8, 2, 75),
            n(54, 12, 2, 78), n(A3, 12, 2, 73), n(D4, 12, 2, 73),
            // Em
            n(E3, 16, 2, 82), n(G3, 16, 2, 77), n(B3, 16, 2, 77), n(E4, 16, 2, 82),
            n(E3, 20, 2, 80), n(G3, 20, 2, 75), n(B3, 20, 2, 75),
            // C major
            n(C3, 24, 2, 82), n(E3, 24, 2, 77), n(G3, 24, 2, 77), n(C4, 24, 2, 82),
            n(C3, 28, 2, 80), n(E3, 28, 2, 75), n(G3, 28, 2, 75), n(C4, 28, 2, 80),
          ]),
        ],
      }),
      // Strings (wavetable) — sustained pads following the harmony
      t('Strings', 'purple', {
        instrumentType: 'wavetable',
        volume: -6,
        effects: [fx('reverb-convolution')],
        clips: [
          midiClip('', 'Verse Strings', 0, 32, [
            // G major sustained
            n(G4, 0, 8, 55), n(B4, 0, 8, 50), n(D5, 0, 8, 50),
            // Em sustained
            n(E4, 8, 8, 55), n(G4, 8, 8, 50), n(B4, 8, 8, 50),
            // C major sustained
            n(C4, 16, 8, 57), n(E4, 16, 8, 52), n(G4, 16, 8, 52),
            // D major sustained
            n(D4, 24, 8, 57), n(54 + 12, 24, 8, 52), n(A4, 24, 8, 52),
          ]),
          midiClip('', 'Chorus Strings', 32, 32, [
            // G — swelling
            n(G4, 0, 8, 70), n(B4, 0, 8, 65), n(D5, 0, 8, 65),
            // D/F#
            n(D4, 8, 8, 72), n(66, 8, 8, 67), n(A4, 8, 8, 67),
            // Em
            n(E4, 16, 8, 75), n(G4, 16, 8, 70), n(B4, 16, 8, 70),
            // C — resolving
            n(C4, 24, 8, 75), n(E4, 24, 8, 70), n(G4, 24, 8, 70),
          ]),
        ],
      }),
    ],
    sections: [
      section('Verse', 0, 32, '#3b82f6'),
      section('Chorus', 32, 32, '#a855f7'),
    ],
  }),
);

// ── Export ────────────────────────────────────────────────────────────
export const popTemplates: ProjectTemplate[] = [
  popHit,
  synthPop,
  indiePop,
  kPop,
  dancePop,
  popBallad,
];
