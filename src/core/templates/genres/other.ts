import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ── Blues Shuffle ──────────────────────────────────────────────────────────────
// 12-bar blues in E at 110 BPM. Shuffle feel with E7-A7-B7 changes.

const bluesShufflePiano = t('Piano', 'blue', {
  instrumentType: 'rach-pad',
  clips: [
    midiClip('', 'Blues Piano', 0, 64, [
      // E7 chord (bars 1-4)
      n(52, 0, 2),    // E3
      n(56, 0, 2),    // G#3
      n(59, 0, 2),    // B3
      n(63, 0, 2),    // D4
      n(52, 4, 2),
      n(56, 4, 2),
      n(59, 4, 2),
      n(63, 4, 2),
      n(52, 8, 2),
      n(56, 8, 2),
      n(52, 12, 2),
      n(56, 12, 2),
      // A7 chord (bars 5-6)
      n(57, 16, 2),   // A3
      n(61, 16, 2),   // C#4
      n(64, 16, 2),   // E4
      n(67, 16, 2),   // G4
      n(57, 20, 2),
      n(61, 20, 2),
      // E7 (bars 7-8)
      n(52, 24, 2),
      n(56, 24, 2),
      n(59, 24, 2),
      n(52, 28, 2),
      n(56, 28, 2),
      // B7 (bar 9)
      n(59, 32, 2),   // B3
      n(63, 32, 2),   // D#4
      n(66, 32, 2),   // F#4
      n(69, 32, 2),   // A4
      // A7 (bar 10)
      n(57, 36, 2),
      n(61, 36, 2),
      n(64, 36, 2),
      // E7 (bars 11-12)
      n(52, 40, 2),
      n(56, 40, 2),
      n(59, 40, 2),
      n(52, 44, 2),
      n(56, 44, 2),
    ]),
  ],
  effects: [fx('reverb-algorithmic')],
});

const bluesShuffleBass = t('Bass', 'green', {
  instrumentType: 'subtractive',
  clips: [
    midiClip('', 'Walking Bass', 0, 64, [
      // Shuffle walking bass on E
      n(40, 0, 1.5),   // E2
      n(42, 1.5, 1),   // F#2
      n(44, 3, 1),     // G#2
      n(40, 4, 1.5),
      n(45, 6, 1),     // A2
      n(47, 7, 1),     // B2
      // Move to A
      n(45, 16, 1.5),  // A2
      n(47, 17.5, 1),  // B2
      n(49, 19, 1),    // C#3
      n(45, 20, 2),
      // Back to E
      n(40, 24, 1.5),
      n(44, 26, 1),
      n(47, 27, 1),    // B2
      // B7 turnaround
      n(47, 32, 1.5),  // B2
      n(49, 34, 1),    // C#3
      n(45, 36, 1.5),  // A2
      n(40, 40, 2),    // E2
      n(47, 44, 2),    // B2
    ]),
  ],
  effects: [fx('compressor-vca')],
});

const bluesShuffle = template(
  meta('Blues Shuffle', 'blues', 'beginner',
    'Classic 12-bar blues shuffle in E with walking bass and piano comping',
    16, ['blues', 'shuffle', '12-bar', 'piano', 'beginner']),
  buildTemplateProject({
    title: 'Blues Shuffle',
    genre: 'blues',
    tempo: 110,
    tracks: [bluesShufflePiano, bluesShuffleBass],
    durationBeats: 64,
  }),
);

// ── Country Ballad ────────────────────────────────────────────────────────────
// G-C-D progression at 95 BPM. Gentle strumming and pad support.

const countryGuitar = t('Guitar', 'orange', {
  instrumentType: 'wavetable',
  clips: [
    midiClip('', 'Country Strum', 0, 64, [
      // G major arpeggio pattern (bars 1-4)
      n(55, 0, 1),    // G3
      n(59, 1, 1),    // B3
      n(62, 2, 1),    // D4
      n(67, 3, 1),    // G4
      n(55, 4, 1),
      n(59, 5, 1),
      n(62, 6, 1),
      n(67, 7, 1),
      // C major (bars 5-8)
      n(60, 16, 1),   // C4
      n(64, 17, 1),   // E4
      n(67, 18, 1),   // G4
      n(72, 19, 1),   // C5
      n(60, 20, 1),
      n(64, 21, 1),
      n(67, 22, 1),
      n(72, 23, 1),
      // D major (bars 9-12)
      n(62, 32, 1),   // D4
      n(66, 33, 1),   // F#4
      n(69, 34, 1),   // A4
      n(74, 35, 1),   // D5
      n(62, 36, 1),
      n(66, 37, 1),
      // G major resolve (bars 13-16)
      n(55, 48, 1),
      n(59, 49, 1),
      n(62, 50, 1),
      n(67, 51, 4),
    ]),
  ],
  effects: [fx('reverb-algorithmic')],
});

const countryPad = t('Pad', 'cyan', {
  instrumentType: 'rach-pad',
  clips: [
    midiClip('', 'Warm Pad', 0, 64, [
      // G sustained
      n(55, 0, 16, 60),   // G3
      n(59, 0, 16, 60),   // B3
      n(62, 0, 16, 60),   // D4
      // C sustained
      n(60, 16, 16, 60),  // C4
      n(64, 16, 16, 60),  // E4
      n(67, 16, 16, 60),  // G4
      // D sustained
      n(62, 32, 16, 60),  // D4
      n(66, 32, 16, 60),  // F#4
      n(69, 32, 16, 60),  // A4
      // G resolve
      n(55, 48, 16, 60),
      n(59, 48, 16, 60),
      n(62, 48, 16, 60),
    ]),
  ],
  effects: [fx('delay-tape')],
});

const countryBallad = template(
  meta('Country Ballad', 'country', 'beginner',
    'Gentle country ballad with acoustic guitar picking over a G-C-D progression',
    16, ['country', 'ballad', 'acoustic', 'guitar', 'beginner']),
  buildTemplateProject({
    title: 'Country Ballad',
    genre: 'country',
    tempo: 95,
    tracks: [countryGuitar, countryPad],
    durationBeats: 64,
  }),
);

// ── Latin Salsa ───────────────────────────────────────────────────────────────
// Clave-based salsa at 180 BPM in C major. Piano montuno, tumbao bass, brass.

const salsaPiano = t('Piano Montuno', 'red', {
  instrumentType: 'fm',
  clips: [
    midiClip('', 'Montuno', 0, 64, [
      // C major montuno pattern (syncopated)
      n(60, 0, 0.5),     // C4
      n(64, 0.5, 0.5),   // E4
      n(67, 1.5, 0.5),   // G4
      n(72, 2, 0.5),     // C5
      n(67, 3, 0.5),     // G4
      n(64, 3.5, 0.5),   // E4
      // F major
      n(65, 4, 0.5),     // F4
      n(69, 4.5, 0.5),   // A4
      n(72, 5.5, 0.5),   // C5
      n(69, 6, 0.5),     // A4
      n(65, 7, 0.5),     // F4
      // G7
      n(67, 8, 0.5),     // G4
      n(71, 8.5, 0.5),   // B4
      n(74, 9.5, 0.5),   // D5
      n(71, 10, 0.5),    // B4
      n(67, 11, 0.5),    // G4
      // C resolve
      n(60, 12, 0.5),
      n(64, 12.5, 0.5),
      n(67, 14, 1),
    ]),
  ],
  effects: [fx('reverb-algorithmic')],
});

const salsaBass = t('Bass Tumbao', 'green', {
  instrumentType: 'subtractive',
  clips: [
    midiClip('', 'Tumbao', 0, 64, [
      // Tumbao bass pattern (anticipation on beat 4-and)
      n(48, 0, 1),      // C3
      n(48, 2.5, 0.5),  // C3 anticipated
      n(55, 3, 1),      // G3
      n(53, 4, 1),      // F3
      n(53, 6.5, 0.5),  // F3 anticipated
      n(48, 7, 1),      // C3
      n(55, 8, 1),      // G3
      n(55, 10.5, 0.5), // G3 anticipated
      n(52, 11, 1),     // E3 (leading tone from below)
      n(48, 12, 2),     // C3 resolve
    ]),
  ],
});

const salsaBrass = t('Brass', 'yellow', {
  instrumentType: 'subtractive',
  clips: [
    midiClip('', 'Brass Hits', 0, 64, [
      // Punchy brass stabs on clave accents
      n(72, 0, 0.5, 110),    // C5
      n(76, 0, 0.5, 110),    // E5
      n(79, 0, 0.5, 110),    // G5
      n(72, 3, 0.5, 110),
      n(76, 3, 0.5, 110),
      n(77, 6, 0.5, 110),    // F5
      n(72, 6, 0.5, 110),    // C5
      n(74, 8, 0.5, 110),    // D5
      n(79, 8, 0.5, 110),    // G5
      n(72, 11, 0.5, 110),
      n(76, 11, 0.5, 110),
      n(79, 11, 0.5, 110),
    ]),
  ],
  effects: [fx('reverb-algorithmic')],
});

const latinSalsa = template(
  meta('Latin Salsa', 'latin', 'intermediate',
    'Energetic salsa arrangement with piano montuno, tumbao bass, and brass hits in C major',
    16, ['latin', 'salsa', 'clave', 'montuno', 'brass']),
  buildTemplateProject({
    title: 'Latin Salsa',
    genre: 'latin',
    tempo: 180,
    tracks: [salsaPiano, salsaBass, salsaBrass],
    durationBeats: 64,
  }),
);

// ── Funk Groove ───────────────────────────────────────────────────────────────
// Tight syncopated funk at 110 BPM. Clavinet, slap bass, brass stabs.

const funkClav = t('Clavinet', 'purple', {
  instrumentType: 'fm',
  clips: [
    midiClip('', 'Clav Riff', 0, 32, [
      // Syncopated 16th-note funk clav in E minor
      n(64, 0, 0.25),      // E4
      n(67, 0.5, 0.25),    // G4
      n(64, 1, 0.25),      // E4
      n(62, 1.75, 0.25),   // D4
      n(64, 2.5, 0.5),     // E4
      n(67, 3.25, 0.25),   // G4
      n(69, 3.75, 0.25),   // A4
      n(67, 4, 0.5),       // G4
      n(64, 5, 0.25),      // E4
      n(67, 5.5, 0.25),    // G4
      n(69, 6, 0.25),      // A4
      n(67, 6.75, 0.25),   // G4
      n(64, 7.5, 0.5),     // E4
    ]),
    midiClip('', 'Clav Break', 32, 32, [
      // Sparser pattern for break section
      n(64, 0, 0.5),      // E4
      n(67, 2, 0.5),      // G4
      n(69, 4, 1),         // A4
      n(67, 6, 0.5),      // G4
      n(64, 8, 1),         // E4
      n(62, 12, 1),        // D4
      n(64, 14, 2),        // E4
    ]),
  ],
  effects: [fx('compressor-vca'), fx('auto-pan')],
});

const funkBass = t('Slap Bass', 'green', {
  instrumentType: 'subtractive',
  clips: [
    midiClip('', 'Funk Bass', 0, 32, [
      // Syncopated slap bass in E minor
      n(40, 0, 0.5),       // E2
      n(40, 1, 0.25),      // E2 ghost
      n(43, 1.5, 0.5),     // G2
      n(40, 2.5, 0.25),    // E2
      n(45, 3, 0.5),       // A2
      n(43, 3.75, 0.25),   // G2
      n(40, 4, 0.75),      // E2
      n(43, 5.5, 0.5),     // G2
      n(45, 6, 0.25),      // A2
      n(47, 6.5, 0.5),     // B2
      n(40, 7.5, 0.5),     // E2
    ]),
    midiClip('', 'Bass Break', 32, 32, [
      n(40, 0, 2),        // E2
      n(43, 4, 2),        // G2
      n(45, 8, 2),        // A2
      n(40, 12, 4),       // E2 long
    ]),
  ],
  effects: [fx('compressor-vca')],
});

const funkBrass = t('Brass Stabs', 'yellow', {
  instrumentType: 'subtractive',
  clips: [
    midiClip('', 'Brass Stabs', 0, 32, [
      // Tight horn stabs on off-beats
      n(76, 1.5, 0.25, 115),   // E5
      n(79, 1.5, 0.25, 115),   // G5
      n(83, 1.5, 0.25, 115),   // B5
      n(76, 3.5, 0.25, 115),
      n(79, 3.5, 0.25, 115),
      n(76, 5.5, 0.25, 115),
      n(79, 5.5, 0.25, 115),
      n(83, 5.5, 0.25, 115),
      n(76, 7, 0.5, 115),
      n(79, 7, 0.5, 115),
    ]),
  ],
});

const funkGroove = template(
  meta('Funk Groove', 'funk', 'intermediate',
    'Tight syncopated funk with clavinet, slap bass, and punchy brass stabs in E minor',
    16, ['funk', 'groove', 'syncopation', 'clavinet', 'slap-bass']),
  buildTemplateProject({
    title: 'Funk Groove',
    genre: 'funk',
    tempo: 110,
    tracks: [funkClav, funkBass, funkBrass],
    sections: [
      section('Groove', 0, 32, '#9333ea'),
      section('Break', 32, 32, '#f97316'),
    ],
    durationBeats: 64,
  }),
);

// ── Folk Acoustic ─────────────────────────────────────────────────────────────
// Finger-picking in D major at 105 BPM. Guitar arpeggios with string pad.

const folkGuitar = t('Guitar', 'orange', {
  instrumentType: 'wavetable',
  clips: [
    midiClip('', 'Finger Picking', 0, 64, [
      // D major finger-picking pattern
      n(50, 0, 0.5),    // D3 (bass)
      n(62, 0.5, 0.5),  // D4
      n(66, 1, 0.5),    // F#4
      n(69, 1.5, 0.5),  // A4
      n(66, 2, 0.5),    // F#4
      n(62, 2.5, 0.5),  // D4
      n(50, 3, 0.5),    // D3
      n(69, 3.5, 0.5),  // A4
      // G major
      n(55, 4, 0.5),    // G3 (bass)
      n(59, 4.5, 0.5),  // B3
      n(62, 5, 0.5),    // D4
      n(67, 5.5, 0.5),  // G4
      n(62, 6, 0.5),    // D4
      n(59, 6.5, 0.5),  // B3
      // A major
      n(57, 8, 0.5),    // A3 (bass)
      n(61, 8.5, 0.5),  // C#4
      n(64, 9, 0.5),    // E4
      n(69, 9.5, 0.5),  // A4
      n(64, 10, 0.5),   // E4
      n(61, 10.5, 0.5), // C#4
      // D resolve
      n(50, 12, 0.5),   // D3
      n(62, 12.5, 0.5), // D4
      n(66, 13, 0.5),   // F#4
      n(69, 13.5, 0.5), // A4
      n(74, 14, 2),     // D5 (ring out)
    ]),
  ],
  effects: [fx('reverb-convolution')],
});

const folkStrings = t('Strings', 'cyan', {
  instrumentType: 'rach-pad',
  clips: [
    midiClip('', 'String Pad', 0, 64, [
      // Gentle sustained strings
      n(62, 0, 16, 50),   // D4
      n(66, 0, 16, 50),   // F#4
      n(69, 0, 16, 50),   // A4
      // G chord
      n(59, 16, 16, 50),  // B3
      n(62, 16, 16, 50),  // D4
      n(67, 16, 16, 50),  // G4
      // A chord
      n(61, 32, 16, 50),  // C#4
      n(64, 32, 16, 50),  // E4
      n(69, 32, 16, 50),  // A4
      // D resolve
      n(62, 48, 16, 50),  // D4
      n(66, 48, 16, 50),  // F#4
      n(69, 48, 16, 50),  // A4
    ]),
  ],
});

const folkAcoustic = template(
  meta('Folk Acoustic', 'folk', 'beginner',
    'Warm folk arrangement with finger-picked guitar and gentle strings in D major',
    16, ['folk', 'acoustic', 'finger-picking', 'guitar', 'strings']),
  buildTemplateProject({
    title: 'Folk Acoustic',
    genre: 'folk',
    tempo: 105,
    tracks: [folkGuitar, folkStrings],
    durationBeats: 64,
  }),
);

// ── World Music ───────────────────────────────────────────────────────────────
// Indian raga-inspired at 100 BPM. Sitar melody, tabla rhythm, tanpura drone.
// Based loosely on Raga Yaman (Kalyan) — C D E F# G A B

const worldSitar = t('Sitar', 'red', {
  instrumentType: 'wavetable',
  clips: [
    midiClip('', 'Raga Melody', 0, 64, [
      // Ascending phrase (aaroha-inspired)
      n(67, 0, 1),      // G4 (Sa, tonic)
      n(71, 1, 0.5),    // B4 (Ga)
      n(72, 2, 1),      // C5 (Ma tivra / F# equivalent mapped to C for the mode)
      n(74, 4, 1.5),    // D5 (Pa)
      n(76, 6, 0.5),    // E5 (Dha)
      n(79, 7, 1),      // G5 (upper Sa)
      // Descending phrase (avaroha-inspired)
      n(79, 8, 0.5),    // G5
      n(76, 9, 1),      // E5
      n(74, 10, 0.5),   // D5
      n(72, 11, 1.5),   // C5
      n(71, 13, 0.5),   // B4
      n(69, 14, 1),     // A4
      n(67, 15, 1),     // G4 (Sa)
      // Ornamental phrase with meend (slides approximated)
      n(67, 16, 0.25),  // G4
      n(69, 16.5, 0.25),// A4
      n(67, 17, 1.5),   // G4 (rest on tonic)
    ]),
  ],
  effects: [fx('reverb-convolution'), fx('delay-pingpong')],
});

const worldTabla = t('Tabla', 'yellow', {
  instrumentType: 'granular',
  clips: [
    midiClip('', 'Tabla Pattern', 0, 64, [
      // Tintal-inspired 16-beat cycle mapped to MIDI
      n(60, 0, 0.5, 110),    // Dha (sam - strong beat)
      n(62, 1, 0.5, 80),     // Dhin
      n(62, 2, 0.5, 80),     // Dhin
      n(60, 3, 0.5, 90),     // Dha
      n(60, 4, 0.5, 100),    // Dha
      n(62, 5, 0.5, 80),     // Dhin
      n(62, 6, 0.5, 80),     // Dhin
      n(60, 7, 0.5, 90),     // Dha
      // Khali section (open/resonant strokes)
      n(64, 8, 0.5, 85),     // Na
      n(65, 9, 0.5, 75),     // Tin
      n(65, 10, 0.5, 75),    // Tin
      n(64, 11, 0.5, 85),    // Na
      n(60, 12, 0.5, 100),   // Dha
      n(62, 13, 0.5, 80),    // Dhin
      n(62, 14, 0.5, 80),    // Dhin
      n(60, 15, 0.5, 110),   // Dha (approach to sam)
    ]),
  ],
});

const worldDrone = t('Tanpura Drone', 'purple', {
  instrumentType: 'rach-pad',
  clips: [
    midiClip('', 'Drone', 0, 64, [
      // Sustained Sa-Pa drone (G and D)
      n(55, 0, 32, 45),   // G3 (Sa, low)
      n(62, 0, 32, 40),   // D4 (Pa)
      n(67, 0, 32, 35),   // G4 (Sa, upper)
      n(55, 32, 32, 45),  // G3
      n(62, 32, 32, 40),  // D4
      n(67, 32, 32, 35),  // G4
    ]),
  ],
});

const worldMusic = template(
  meta('World Music', 'world', 'intermediate',
    'Indian raga-inspired template with sitar melody, tabla rhythms, and tanpura drone',
    16, ['world', 'indian', 'raga', 'sitar', 'tabla']),
  buildTemplateProject({
    title: 'World Music',
    genre: 'world',
    tempo: 100,
    tracks: [worldSitar, worldTabla, worldDrone],
    durationBeats: 64,
  }),
);

// ── Export ─────────────────────────────────────────────────────────────────────

export const otherTemplates: ProjectTemplate[] = [
  bluesShuffle,
  countryBallad,
  latinSalsa,
  funkGroove,
  folkAcoustic,
  worldMusic,
];
