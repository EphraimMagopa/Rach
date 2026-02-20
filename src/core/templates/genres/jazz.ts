import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ── MIDI note constants ──────────────────────────────────────────────
// Octave 2
const D2 = 38, Eb2 = 39, E2 = 40, F2 = 41, Gb2 = 42, G2 = 43, Ab2 = 44, A2 = 45, Bb2 = 46, B2 = 47;
// Octave 3
const C3 = 48, D3 = 50, E3 = 52, F3 = 53, G3 = 55, A3 = 57, Bb3 = 58, B3 = 59;
// Octave 4
const C4 = 60, D4 = 62, E4 = 64, F4 = 65, G4 = 67, A4 = 69, Bb4 = 70, B4 = 71;
// Octave 5
const C5 = 72, D5 = 74, E5 = 76, F5 = 77, G5 = 79, A5 = 81, Bb5 = 82;
// Accidentals
const Eb3 = 51, Ab3 = 56, Eb4 = 63, Ab4 = 68, Gb4 = 66;
const Db4 = 61, Gb3 = 54, Db3 = 49;
const Eb5 = 75;

// ─────────────────────────────────────────────────────────────────────
// 1. Jazz Trio — ii-V-I in C, 140 BPM, 16 bars
// ─────────────────────────────────────────────────────────────────────
const jazzTrioMeta = meta(
  'Jazz Trio',
  'jazz',
  'intermediate',
  'Classic jazz trio with piano, upright bass, and ride cymbal. Features ii-V-I progressions in C major with rootless voicings.',
  16,
  ['trio', 'swing', 'ii-V-I', 'standards', 'piano'],
);

const jazzTrioPiano = t('Piano', 'blue', {
  instrumentType: 'rach-pad',
  volume: -3,
  effects: [fx('reverb-algorithmic')],
  clips: [
    // Dm7 voicing (F-A-C-E) | G7 voicing (F-A-B-D) | Cmaj7 voicing (E-G-B-D) | Cmaj7 hold
    midiClip('', 'ii-V-I Comp A', 0, 64, [
      // Bar 1-2: Dm7 — rootless voicing (3rd, 5th, 7th, 9th)
      n(F4, 0, 3.5, 85),
      n(A4, 0, 3.5, 80),
      n(C5, 0, 3.5, 80),
      n(E5, 0, 3.5, 75),
      // Anticipation hit
      n(F4, 7, 1, 90),
      n(A4, 7, 1, 85),
      n(C5, 7, 1, 85),
      n(E5, 7, 1, 80),
      // Bar 3-4: G7 — rootless voicing (7th, 9th, 3rd, 13th)
      n(F4, 8, 3.5, 88),
      n(A4, 8, 3.5, 83),
      n(B4, 8, 3.5, 83),
      n(D5, 8, 3.5, 78),
      // Bar 5-8: Cmaj7 — voiced (3rd, 5th, 7th, 9th)
      n(E4, 16, 7, 80),
      n(G4, 16, 7, 78),
      n(B4, 16, 7, 78),
      n(D5, 16, 7, 75),
    ]),
  ],
});

const jazzTrioBass = t('Upright Bass', 'green', {
  instrumentType: 'subtractive',
  volume: -2,
  clips: [
    // Walking bass through ii-V-I
    midiClip('', 'Walking Bass', 0, 64, [
      // Dm7: D walk
      n(D2, 0, 1, 95),
      n(A2, 1, 1, 90),
      n(F2, 2, 1, 88),
      n(E2, 3, 1, 85),
      n(D2, 4, 1, 95),
      n(C3, 5, 1, 88),
      n(B2, 6, 1, 85),
      n(A2, 7, 1, 90),
      // G7: G walk
      n(G2, 8, 1, 95),
      n(B2, 9, 1, 90),
      n(D3, 10, 1, 88),
      n(F3, 11, 1, 85),
      n(G2, 12, 1, 95),
      n(A2, 13, 1, 88),
      n(B2, 14, 1, 85),
      n(D3, 15, 1, 90),
      // Cmaj7: C walk
      n(C3, 16, 2, 95),
      n(E3, 18, 2, 88),
      n(G3, 20, 2, 85),
      n(B3, 22, 2, 90),
    ]),
  ],
});

const jazzTrioRide = t('Ride Cymbal', 'yellow', {
  instrumentType: 'granular',
  volume: -6,
  clips: [
    // Swing ride pattern: quarter notes with skip beat pattern
    midiClip('', 'Swing Ride', 0, 64, [
      // Standard ride pattern over 4 bars: ding-ding-da-ding
      n(C5, 0, 0.5, 80),
      n(C5, 1, 0.5, 65),
      n(C5, 1.67, 0.33, 75),
      n(C5, 2, 0.5, 80),
      n(C5, 3, 0.5, 65),
      n(C5, 3.67, 0.33, 75),
      n(C5, 4, 0.5, 80),
      n(C5, 5, 0.5, 65),
      n(C5, 5.67, 0.33, 75),
      n(C5, 6, 0.5, 80),
      n(C5, 7, 0.5, 65),
      n(C5, 7.67, 0.33, 75),
    ]),
  ],
});

const jazzTrio = template(
  jazzTrioMeta,
  buildTemplateProject({
    title: 'Jazz Trio',
    genre: 'Jazz',
    tempo: 140,
    tracks: [jazzTrioPiano, jazzTrioBass, jazzTrioRide],
    sections: [
      section('Head', 0, 32, '#3b82f6'),
      section('Turnaround', 32, 32, '#8b5cf6'),
    ],
  }),
);

// ─────────────────────────────────────────────────────────────────────
// 2. Bossa Nova — A minor, 130 BPM, 16 bars
// ─────────────────────────────────────────────────────────────────────
const bossaNovaMeta = meta(
  'Bossa Nova',
  'jazz',
  'beginner',
  'Gentle bossa nova groove in A minor with nylon-guitar comping and syncopated bass. Perfect for learning Brazilian jazz rhythms.',
  16,
  ['bossa', 'brazilian', 'latin-jazz', 'guitar', 'relaxed'],
);

const bossaGuitar = t('Nylon Guitar', 'orange', {
  instrumentType: 'wavetable',
  volume: -4,
  effects: [fx('chorus'), fx('reverb-algorithmic')],
  clips: [
    // Am9 — Dm9 — E7b9 — Am9  (bossa rhythm: syncopated off-beats)
    midiClip('', 'Bossa Comp', 0, 64, [
      // Bar 1-4: Am9 (A-C-E-G-B) — bossa syncopation
      n(A3, 0, 1.5, 70),
      n(C4, 0, 1.5, 68),
      n(E4, 0, 1.5, 65),
      n(G4, 0, 1.5, 63),
      n(B4, 0, 1.5, 60),
      // Syncopated re-strum
      n(A3, 3, 1, 72),
      n(C4, 3, 1, 70),
      n(E4, 3, 1, 68),
      n(G4, 3, 1, 65),
      // Bar 5-8: Dm9 (D-F-A-C-E)
      n(D4, 16, 1.5, 70),
      n(F4, 16, 1.5, 68),
      n(A4, 16, 1.5, 65),
      n(C5, 16, 1.5, 63),
      n(E5, 16, 1.5, 60),
      n(D4, 19, 1, 72),
      n(F4, 19, 1, 70),
    ]),
  ],
});

const bossaBass = t('Bass', 'green', {
  instrumentType: 'subtractive',
  volume: -3,
  clips: [
    // Characteristic bossa bass: root on 1, fifth on the "and of 2"
    midiClip('', 'Bossa Bass', 0, 64, [
      // Am: root-fifth pattern
      n(A2, 0, 1.5, 90),
      n(E3, 2.5, 1, 80),
      n(A2, 4, 1.5, 88),
      n(E3, 6.5, 1, 78),
      n(A2, 8, 1.5, 90),
      n(E3, 10.5, 1, 80),
      n(A2, 12, 1.5, 88),
      n(E3, 14.5, 1, 78),
      // Dm: root-fifth pattern
      n(D3, 16, 1.5, 90),
      n(A3, 18.5, 1, 80),
      n(D3, 20, 1.5, 88),
      n(A3, 22.5, 1, 78),
    ]),
  ],
});

const bossaNova = template(
  bossaNovaMeta,
  buildTemplateProject({
    title: 'Bossa Nova',
    genre: 'Jazz',
    tempo: 130,
    tracks: [bossaGuitar, bossaBass],
    sections: [
      section('A Section', 0, 32, '#f97316'),
      section('B Section', 32, 32, '#22c55e'),
    ],
  }),
);

// ─────────────────────────────────────────────────────────────────────
// 3. Smooth Jazz — Bb major, 100 BPM, 16 bars
// ─────────────────────────────────────────────────────────────────────
const smoothJazzMeta = meta(
  'Smooth Jazz',
  'jazz',
  'beginner',
  'Laid-back smooth jazz in Bb major with sax-like lead, warm keys, and a relaxed groove. Great starting point for R&B-influenced jazz.',
  16,
  ['smooth', 'sax', 'mellow', 'chill', 'r&b-jazz'],
);

const smoothSax = t('Soprano Sax', 'purple', {
  instrumentType: 'fm',
  volume: -2,
  effects: [fx('reverb-convolution'), fx('delay-analog')],
  clips: [
    // Smooth melodic line in Bb major
    midiClip('', 'Sax Melody', 0, 64, [
      // Lyrical phrase 1: Bbmaj7 arpeggio
      n(Bb4, 0, 2, 85),
      n(D5, 2, 1, 80),
      n(F5, 3, 2, 88),
      n(A5, 5, 1.5, 82),
      n(Bb5, 6.5, 1.5, 78),
      // Phrase 2: descending over Eb maj7
      n(G5, 8, 1.5, 83),
      n(Eb5, 9.5, 1, 80),
      n(D5, 10.5, 2, 85),
      n(Bb4, 12.5, 1.5, 78),
      // Phrase 3: resolution
      n(C5, 14, 1, 80),
      n(D5, 15, 1, 82),
      n(F5, 16, 3, 88),
      n(D5, 19, 1, 75),
    ]),
  ],
});

const smoothKeys = t('Rhodes Keys', 'cyan', {
  instrumentType: 'rach-pad',
  volume: -5,
  effects: [fx('chorus')],
  clips: [
    // Bbmaj9 — Ebmaj7 — Cm9 — F13 pad voicings
    midiClip('', 'Keys Pad', 0, 64, [
      // Bbmaj9 (D-F-A-C) — rootless
      n(D4, 0, 7.5, 65),
      n(F4, 0, 7.5, 63),
      n(A4, 0, 7.5, 60),
      n(C5, 0, 7.5, 58),
      // Ebmaj7 (G-Bb-D-Eb) — open voicing
      n(G3, 8, 7.5, 65),
      n(Bb3, 8, 7.5, 63),
      n(D4, 8, 7.5, 60),
      n(G4, 8, 7.5, 58),
      // Cm9 (Eb-G-Bb-D)
      n(Eb4, 16, 7.5, 65),
      n(G4, 16, 7.5, 63),
      n(Bb4, 16, 7.5, 60),
      n(D5, 16, 7.5, 58),
      // F13 (Eb-A-C-D) — altered voicing
      n(Eb4, 24, 7.5, 65),
      n(A4, 24, 7.5, 63),
      n(C5, 24, 7.5, 60),
      n(D5, 24, 7.5, 58),
    ]),
  ],
});

const smoothBass = t('Fretless Bass', 'green', {
  instrumentType: 'subtractive',
  volume: -2,
  clips: [
    // Smooth bass groove with chromatic approach notes
    midiClip('', 'Smooth Bass', 0, 64, [
      n(Bb2, 0, 2, 90),
      n(D3, 2, 1, 82),
      n(F3, 3, 1.5, 85),
      n(Bb2, 4.5, 1.5, 88),
      n(A2, 6, 1, 80),
      n(Bb2, 7, 1, 85),
      // Ebmaj7 bar
      n(Eb3, 8, 2, 90),
      n(G3, 10, 1, 82),
      n(Bb3, 11, 1, 85),
      n(Eb3, 12, 2, 88),
      n(D3, 14, 1, 80),
      n(C3, 15, 1, 82),
    ]),
  ],
});

const smoothJazz = template(
  smoothJazzMeta,
  buildTemplateProject({
    title: 'Smooth Jazz',
    genre: 'Jazz',
    tempo: 100,
    tracks: [smoothSax, smoothKeys, smoothBass],
  }),
);

// ─────────────────────────────────────────────────────────────────────
// 4. Bebop — C major, 180 BPM, 16 bars
// ─────────────────────────────────────────────────────────────────────
const bebopMeta = meta(
  'Bebop',
  'jazz',
  'advanced',
  'Fast-tempo bebop with virtuosic lead lines, piano comping, and a driving walking bass. Head and solo sections for classic bebop form.',
  16,
  ['bebop', 'fast', 'virtuosic', 'improvisation', 'hard-bop'],
);

const bebopLead = t('Bebop Lead', 'red', {
  instrumentType: 'fm',
  volume: -1,
  effects: [fx('reverb-algorithmic')],
  clips: [
    // Fast bebop head: 8th-note lines with chromatic enclosures
    midiClip('', 'Bebop Head', 0, 32, [
      // Phrase 1: ascending line over Dm7
      n(D5, 0, 0.5, 95),
      n(E5, 0.5, 0.5, 90),
      n(F5, 1, 0.5, 92),
      n(G5, 1.5, 0.5, 88),
      n(A5, 2, 0.5, 94),
      n(Bb5, 2.5, 0.5, 86),
      n(A5, 3, 0.5, 90),
      n(G5, 3.5, 0.5, 85),
      // Phrase 2: enclosure into G7 target
      n(F5, 4, 0.5, 92),
      n(E5, 4.5, 0.5, 88),
      n(Eb5, 5, 0.5, 85),
      n(D5, 5.5, 0.5, 90),
      n(C5, 6, 0.5, 88),
      n(B4, 6.5, 0.5, 92),
      n(D5, 7, 1, 95),
      // Phrase 3: resolution to Cmaj7
      n(E5, 8, 0.5, 90),
      n(D5, 8.5, 0.5, 85),
    ]),
    // Solo section — skeletal guide for improvisation
    midiClip('', 'Solo Changes', 32, 32, [
      // Guide tones over ii-V-I
      n(F5, 0, 2, 80),
      n(E5, 2, 2, 78),
      n(B4, 4, 2, 82),
      n(A4, 6, 2, 75),
      n(G4, 8, 4, 80),
    ]),
  ],
});

const bebopPiano = t('Piano Comp', 'blue', {
  instrumentType: 'rach-pad',
  volume: -5,
  effects: [fx('reverb-algorithmic')],
  clips: [
    // Sparse comping: shell voicings on off-beats
    midiClip('', 'Bebop Comp', 0, 32, [
      // Dm7 shells (C-F or F-C)
      n(C4, 1.5, 0.5, 75),
      n(F4, 1.5, 0.5, 72),
      n(A4, 1.5, 0.5, 70),
      // G7 shell
      n(F4, 5, 0.5, 78),
      n(B4, 5, 0.5, 75),
      n(D5, 5, 0.5, 72),
      // Anticipation into Cmaj7
      n(E4, 7.5, 0.5, 76),
      n(G4, 7.5, 0.5, 74),
      n(B4, 7.5, 0.5, 72),
      // Cmaj7 stab
      n(E4, 8, 1, 74),
      n(G4, 8, 1, 72),
      n(B4, 8, 1, 70),
      n(D5, 8, 1, 68),
    ]),
  ],
});

const bebopBass = t('Walking Bass', 'green', {
  instrumentType: 'subtractive',
  volume: -1,
  effects: [],
  clips: [
    // Driving walking bass at 180 BPM — quarter note pulse
    midiClip('', 'Walking Bass', 0, 32, [
      // Dm7
      n(D2, 0, 1, 100),
      n(F2, 1, 1, 95),
      n(A2, 2, 1, 92),
      n(C3, 3, 1, 95),
      // G7
      n(G2, 4, 1, 100),
      n(A2, 5, 1, 92),
      n(B2, 6, 1, 95),
      n(D3, 7, 1, 90),
      // Cmaj7
      n(C3, 8, 1, 100),
      n(E3, 9, 1, 92),
      n(G3, 10, 1, 95),
      n(B3, 11, 1, 90),
      // Turnaround: C — A7 — Dm — G7
      n(C3, 12, 1, 98),
      n(A2, 13, 1, 92),
      n(D3, 14, 1, 95),
      n(G2, 15, 1, 90),
    ]),
  ],
});

const bebop = template(
  bebopMeta,
  buildTemplateProject({
    title: 'Bebop',
    genre: 'Jazz',
    tempo: 180,
    tracks: [bebopLead, bebopPiano, bebopBass],
    sections: [
      section('Head', 0, 32, '#ef4444'),
      section('Solo', 32, 32, '#f59e0b'),
    ],
  }),
);

// ─────────────────────────────────────────────────────────────────────
// 5. Jazz Fusion — Eb minor / Bb major, 120 BPM, 16 bars
// ─────────────────────────────────────────────────────────────────────
const jazzFusionMeta = meta(
  'Jazz Fusion',
  'jazz',
  'advanced',
  'Complex jazz fusion with layered synth textures, odd rhythmic groupings, and extended harmonies. Inspired by Weather Report and Herbie Hancock.',
  16,
  ['fusion', 'synth', 'complex', 'odd-meter', 'progressive'],
);

const fusionLead = t('Fusion Lead', 'cyan', {
  instrumentType: 'wavetable',
  volume: -2,
  effects: [fx('chorus'), fx('delay-analog')],
  clips: [
    // Angular fusion melody with wide intervals and chromaticism
    midiClip('', 'Fusion Theme', 0, 64, [
      // Phrase 1: wide interval leaps
      n(Eb5, 0, 1, 92),
      n(Bb4, 1, 0.5, 85),
      n(Gb4, 1.5, 0.5, 88),
      n(Ab4, 2, 1.5, 90),
      n(Bb4, 3.5, 0.5, 82),
      // Phrase 2: syncopated grouping (3+3+2)
      n(Eb5, 4, 0.75, 90),
      n(Db4, 4.75, 0.75, 85),
      n(C4, 5.5, 0.75, 88),
      n(Bb4, 6.25, 0.5, 92),
      n(Ab4, 6.75, 1.25, 85),
      // Phrase 3: chromatic resolution
      n(G4, 8, 1.5, 88),
      n(Ab4, 9.5, 0.5, 85),
      n(A4, 10, 0.5, 82),
      n(Bb4, 10.5, 2.5, 90),
    ]),
  ],
});

const fusionKeys = t('Synth Keys', 'purple', {
  instrumentType: 'fm',
  volume: -4,
  effects: [fx('phaser'), fx('reverb-algorithmic')],
  clips: [
    // Rich extended chords — quartal and cluster voicings
    midiClip('', 'Fusion Chords', 0, 64, [
      // Ebm11 — quartal voicing (Eb-Ab-Db-Gb-Bb)
      n(Eb4, 0, 3.5, 70),
      n(Ab4, 0, 3.5, 68),
      n(Db4, 0, 3.5, 65),
      n(Gb4, 0, 3.5, 63),
      // Bbm7#11 — (Bb-Db-F-A-E)
      n(Bb3, 4, 3.5, 70),
      n(Db4, 4, 3.5, 68),
      n(F4, 4, 3.5, 65),
      n(A4, 4, 3.5, 63),
      // Abmaj7#11 — (Ab-C-Eb-G-D)
      n(Ab3, 8, 3.5, 70),
      n(C4, 8, 3.5, 68),
      n(Eb4, 8, 3.5, 65),
      n(G4, 8, 3.5, 63),
      n(D5, 8, 3.5, 60),
      // Gb13 — (Gb-Bb-E-Ab)
      n(Gb3, 12, 3.5, 70),
      n(Bb3, 12, 3.5, 68),
      n(E4, 12, 3.5, 65),
      n(Ab4, 12, 3.5, 63),
    ]),
  ],
});

const fusionBass = t('Fusion Bass', 'green', {
  instrumentType: 'subtractive',
  volume: -1,
  effects: [fx('compressor-vca')],
  clips: [
    // Syncopated fusion bass with ghost notes and odd groupings
    midiClip('', 'Fusion Bass', 0, 64, [
      // Bars 1-2: driving pattern in Eb minor
      n(Eb2, 0, 1, 95),
      n(Eb2, 1.5, 0.5, 60),  // ghost note
      n(Gb2, 2, 0.75, 90),
      n(Ab2, 2.75, 0.75, 88),
      n(Bb2, 3.5, 0.5, 85),
      // Bars 3-4: odd grouping (3+3+2)
      n(Eb2, 4, 0.75, 95),
      n(Gb2, 4.75, 0.75, 88),
      n(Ab2, 5.5, 0.75, 90),
      n(Bb2, 6.25, 0.5, 92),
      n(Db3, 6.75, 1.25, 85),
      // Bars 5-6: chromatic walk-up
      n(Ab2, 8, 1, 95),
      n(A2, 9, 1, 88),
      n(Bb2, 10, 1, 90),
      n(B2, 11, 1, 85),
      n(C3, 12, 2, 92),
      n(Bb2, 14, 2, 88),
    ]),
  ],
});

const fusionPad = t('Atmosphere Pad', 'pink', {
  instrumentType: 'rach-pad',
  volume: -8,
  effects: [fx('reverb-convolution'), fx('chorus')],
  clips: [
    // Slow-moving harmonic bed
    midiClip('', 'Fusion Pad', 0, 64, [
      // Sustained cluster: Eb-Ab-Db
      n(Eb4, 0, 16, 50),
      n(Ab4, 0, 16, 48),
      n(Db4, 0, 16, 45),
      // Shift to: Bb-Eb-Ab
      n(Bb3, 16, 16, 50),
      n(Eb4, 16, 16, 48),
      n(Ab4, 16, 16, 45),
      // Final: Ab-C-Gb
      n(Ab3, 32, 16, 50),
      n(C4, 32, 16, 48),
      n(Gb4, 32, 16, 45),
    ]),
  ],
});

const jazzFusion = template(
  jazzFusionMeta,
  buildTemplateProject({
    title: 'Jazz Fusion',
    genre: 'Jazz',
    tempo: 120,
    tracks: [fusionLead, fusionKeys, fusionBass, fusionPad],
    sections: [
      section('Theme', 0, 32, '#06b6d4'),
      section('Development', 32, 32, '#a855f7'),
    ],
  }),
);

// ─────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────
export const jazzTemplates: ProjectTemplate[] = [
  jazzTrio,
  bossaNova,
  smoothJazz,
  bebop,
  jazzFusion,
];
