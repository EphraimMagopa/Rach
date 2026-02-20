import type { ProjectTemplate } from '../template-types';
import { n, midiClip, t, section, fx, buildTemplateProject, meta, template } from '../template-builder';

// ─── Pitch Constants ───────────────────────────────────────────────────────────
// Octave 2
const F2 = 41, G2 = 43, A2 = 45;
// Octave 3
const C3 = 48, D3 = 50, E3 = 52, F3 = 53, G3 = 55, A3 = 57, Bb3 = 58, B3 = 59;
// Octave 4
const C4 = 60, D4 = 62, Eb4 = 63, E4 = 64, F4 = 65, G4 = 67, Ab4 = 68, A4 = 69, Bb4 = 70, B4 = 71;
// Octave 5
const C5 = 72, D5 = 74, Eb5 = 75, E5 = 76, F5 = 77, G5 = 79, Ab5 = 80, A5 = 81, Bb5 = 82, B5 = 83;
// Octave 6
const C6 = 84;

// ─── 1. Romantic Piano Ballad ──────────────────────────────────────────────────
// Beginner · 120 BPM · 16 bars · C major / Am
// Gentle arpeggiated chords in the right hand over whole-note bass in the left

const romanticPianoBallad = template(
  meta(
    'Romantic Piano Ballad',
    'classical',
    'beginner',
    'A gentle piano piece with arpeggiated C major and A minor chords — perfect for learning classical phrasing.',
    16,
    ['piano', 'romantic', 'ballad', 'beginner', 'c-major'],
  ),
  buildTemplateProject({
    title: 'Romantic Piano Ballad',
    genre: 'Classical',
    tempo: 120,
    tracks: [
      t('Piano', 'blue', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-algorithmic'), fx('parametric-eq')],
        clips: [
          // Bars 1-4: C major arpeggio pattern (right hand) + bass
          midiClip('', 'C Major Arpeggio', 0, 16, [
            // Left hand — bass notes (whole notes)
            n(C3, 0, 4, 70),   // Bar 1: C
            n(A2, 4, 4, 70),   // Bar 2: A
            n(F3, 8, 4, 70),   // Bar 3: F
            n(G3, 12, 4, 70),  // Bar 4: G
            // Right hand — arpeggiated figures
            n(E4, 0, 1, 85), n(G4, 1, 1, 80), n(C5, 2, 1, 90), n(G4, 3, 1, 75),
            n(C4, 4, 1, 85), n(E4, 5, 1, 80), n(A4, 6, 1, 90), n(E4, 7, 1, 75),
            n(F4, 8, 1, 85), n(A4, 9, 1, 80), n(C5, 10, 1, 90), n(A4, 11, 1, 75),
            n(G4, 12, 1, 85), n(B4, 13, 1, 80), n(D5, 14, 1, 90), n(B4, 15, 1, 75),
          ]),
          // Bars 5-8: Am → F → C → G with melody
          midiClip('', 'Gentle Melody A', 16, 16, [
            n(A2, 0, 4, 70), n(F3, 4, 4, 70), n(C3, 8, 4, 70), n(G2, 12, 4, 70),
            n(C5, 0, 2, 90), n(B4, 2, 1, 80), n(A4, 3, 1, 85),
            n(A4, 4, 2, 88), n(G4, 6, 1, 80), n(F4, 7, 1, 82),
            n(E4, 8, 2, 90), n(D4, 10, 1, 78), n(E4, 11, 1, 82),
            n(G4, 12, 2, 88), n(F4, 14, 1, 80), n(E4, 15, 1, 75),
          ]),
          // Bars 9-12: Development with wider intervals
          midiClip('', 'Development', 32, 16, [
            n(C3, 0, 4, 72), n(G2, 4, 4, 72), n(A2, 8, 4, 72), n(F2, 12, 4, 72),
            n(E5, 0, 1.5, 92), n(D5, 1.5, 1, 82), n(C5, 2.5, 1.5, 88),
            n(D5, 4, 1.5, 90), n(C5, 5.5, 1, 80), n(B4, 6.5, 1.5, 85),
            n(C5, 8, 2, 92), n(E5, 10, 1, 85), n(D5, 11, 1, 80),
            n(C5, 12, 2, 88), n(A4, 14, 1, 82), n(G4, 15, 1, 78),
          ]),
          // Bars 13-16: Resolution back to C major
          midiClip('', 'Resolution', 48, 16, [
            n(F3, 0, 4, 70), n(G3, 4, 4, 72), n(C3, 8, 8, 68),
            n(A4, 0, 2, 85), n(G4, 2, 2, 80),
            n(G4, 4, 1, 82), n(A4, 5, 1, 80), n(B4, 6, 1, 85), n(D5, 7, 1, 88),
            n(C5, 8, 4, 95), n(E4, 8, 4, 75), n(G4, 8, 4, 80), // Final C major chord
            n(C5, 12, 4, 60), n(E4, 12, 4, 50), n(G4, 12, 4, 55), // Sustained fade
          ]),
        ],
      }),
    ],
  }),
);

// ─── 2. Orchestral Suite ───────────────────────────────────────────────────────
// Advanced · 100 BPM · 32 bars · 4 tracks
// Overture (8 bars) → Allegro (8) → Adagio (8) → Finale (8)

const orchestralSuite = template(
  meta(
    'Orchestral Suite',
    'classical',
    'advanced',
    'A four-movement orchestral suite with strings, woodwinds, brass, and timpani — full symphonic texture.',
    32,
    ['orchestral', 'symphony', 'advanced', 'multi-track', 'suite'],
  ),
  buildTemplateProject({
    title: 'Orchestral Suite',
    genre: 'Classical',
    tempo: 100,
    tracks: [
      // Strings
      t('Strings', 'purple', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-convolution')],
        clips: [
          // Overture: Sustained C major chords, stately
          midiClip('', 'Overture Strings', 0, 32, [
            n(C4, 0, 4, 85), n(E4, 0, 4, 80), n(G4, 0, 4, 80),
            n(F4, 4, 4, 82), n(A4, 4, 4, 78), n(C5, 4, 4, 78),
            n(G4, 8, 4, 85), n(B4, 8, 4, 80), n(D5, 8, 4, 80),
            n(C4, 12, 4, 88), n(E4, 12, 4, 82), n(G4, 12, 4, 82),
            // Allegro: Moving eighth-note lines
            n(C5, 16, 1, 90), n(D5, 17, 1, 85), n(E5, 18, 1, 90), n(D5, 19, 1, 85),
            n(C5, 20, 1, 88), n(B4, 21, 1, 82), n(A4, 22, 1, 85), n(G4, 23, 1, 80),
          ]),
          // Adagio: Lyrical melody
          midiClip('', 'Adagio Strings', 64, 32, [
            n(E5, 0, 3, 75), n(D5, 3, 1, 70), n(C5, 4, 4, 78),
            n(D5, 8, 2, 72), n(E5, 10, 2, 76), n(F5, 12, 2, 80), n(E5, 14, 2, 75),
            n(C5, 16, 4, 82), n(G4, 20, 4, 70),
          ]),
          // Finale: Triumphant theme
          midiClip('', 'Finale Strings', 96, 32, [
            n(C5, 0, 2, 95), n(E5, 2, 2, 92), n(G5, 4, 4, 98),
            n(F5, 8, 2, 90), n(E5, 10, 2, 88), n(D5, 12, 2, 92), n(C5, 14, 2, 88),
            n(C5, 16, 2, 95), n(D5, 18, 2, 90), n(E5, 20, 4, 98),
            n(C5, 24, 8, 100), n(E5, 24, 8, 95), n(G5, 24, 8, 95),
          ]),
        ],
      }),
      // Woodwinds
      t('Woodwinds', 'green', {
        instrumentType: 'fm',
        effects: [fx('reverb-algorithmic')],
        clips: [
          // Overture: Countermelody
          midiClip('', 'Overture Woodwinds', 0, 32, [
            n(G5, 2, 2, 75), n(A5, 4, 2, 78), n(G5, 6, 2, 72),
            n(F5, 8, 2, 76), n(E5, 10, 2, 74), n(D5, 12, 4, 78),
          ]),
          // Allegro: Quick ornamental runs
          midiClip('', 'Allegro Woodwinds', 32, 32, [
            n(G5, 0, 0.5, 82), n(A5, 0.5, 0.5, 80), n(B5, 1, 0.5, 85),
            n(C6, 1.5, 0.5, 88), n(B5, 2, 1, 82), n(A5, 3, 1, 78),
            n(G5, 4, 2, 80), n(E5, 6, 2, 75),
            n(F5, 8, 1, 82), n(G5, 9, 1, 80), n(A5, 10, 1, 84), n(G5, 11, 1, 78),
            n(F5, 12, 2, 80), n(E5, 14, 2, 76),
          ]),
          // Finale: Doubling strings up an octave
          midiClip('', 'Finale Woodwinds', 96, 32, [
            n(C6, 0, 2, 88), n(G5, 4, 4, 90),
            n(F5, 8, 2, 85), n(E5, 10, 2, 82),
            n(E5, 16, 2, 85), n(F5, 18, 2, 82), n(G5, 20, 4, 90),
            n(C6, 24, 8, 92),
          ]),
        ],
      }),
      // Brass
      t('Brass', 'orange', {
        instrumentType: 'subtractive',
        effects: [fx('reverb-algorithmic')],
        clips: [
          // Overture: Fanfare
          midiClip('', 'Overture Fanfare', 0, 32, [
            n(C4, 0, 1, 95), n(C4, 1, 1, 92), n(G4, 2, 2, 98),
            n(E4, 4, 2, 90), n(C4, 6, 2, 85),
            n(G4, 8, 4, 95), n(C5, 12, 4, 100),
          ]),
          // Finale: Powerful brass chords
          midiClip('', 'Finale Brass', 96, 32, [
            n(C4, 0, 4, 100), n(E4, 0, 4, 95), n(G4, 0, 4, 95),
            n(F4, 4, 4, 95), n(A4, 4, 4, 90), n(C5, 4, 4, 90),
            n(G4, 8, 4, 98), n(B4, 8, 4, 92), n(D5, 8, 4, 92),
            n(C4, 12, 4, 100), n(E4, 12, 4, 95), n(G4, 12, 4, 95),
            n(C4, 16, 4, 100), n(E4, 16, 4, 95), n(G4, 16, 4, 95), n(C5, 16, 4, 98),
            n(C4, 24, 8, 100), n(E4, 24, 8, 95), n(G4, 24, 8, 95), n(C5, 24, 8, 98),
          ]),
        ],
      }),
      // Timpani
      t('Timpani', 'red', {
        instrumentType: 'granular',
        volume: -3,
        clips: [
          // Overture: Dramatic rolls
          midiClip('', 'Overture Timpani', 0, 32, [
            n(C3, 0, 0.5, 100), n(C3, 0.5, 0.5, 95), n(C3, 1, 0.5, 90),
            n(C3, 1.5, 0.5, 85), n(C3, 2, 2, 100),
            n(G2, 8, 1, 95), n(G2, 10, 1, 90), n(C3, 12, 4, 100),
          ]),
          // Finale: Punctuating hits
          midiClip('', 'Finale Timpani', 96, 32, [
            n(C3, 0, 1, 100), n(G2, 2, 1, 95), n(C3, 4, 2, 100),
            n(G2, 8, 1, 95), n(C3, 12, 2, 100),
            n(C3, 16, 1, 100), n(G2, 18, 1, 95), n(C3, 20, 1, 100), n(G2, 22, 1, 95),
            n(C3, 24, 4, 100), n(C3, 28, 4, 100),
          ]),
        ],
      }),
    ],
    sections: [
      section('Overture', 0, 32, '#8B5CF6'),
      section('Allegro', 32, 32, '#EF4444'),
      section('Adagio', 64, 32, '#3B82F6'),
      section('Finale', 96, 32, '#F59E0B'),
    ],
    durationBeats: 128,
  }),
);

// ─── 3. String Quartet ─────────────────────────────────────────────────────────
// Intermediate · 108 BPM · 24 bars · Bach-inspired counterpoint in C major

const stringQuartet = template(
  meta(
    'String Quartet',
    'classical',
    'intermediate',
    'A Bach-inspired string quartet with four-part counterpoint in C major — Violin I, Violin II, Viola, and Cello.',
    24,
    ['string-quartet', 'counterpoint', 'bach', 'chamber', 'c-major'],
  ),
  buildTemplateProject({
    title: 'String Quartet',
    genre: 'Classical',
    tempo: 108,
    tracks: [
      // Violin I — subject (soprano)
      t('Violin I', 'red', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-algorithmic')],
        clips: [
          midiClip('', 'Subject', 0, 32, [
            // Fugue subject: C-D-E-F-E-D-C pattern with rhythmic variety
            n(C5, 0, 1, 90), n(D5, 1, 1, 85), n(E5, 2, 2, 92),
            n(F5, 4, 1, 88), n(E5, 5, 1, 85), n(D5, 6, 1, 82), n(C5, 7, 1, 80),
            n(G5, 8, 2, 92), n(F5, 10, 1, 85), n(E5, 11, 1, 82),
            n(D5, 12, 2, 88), n(C5, 14, 2, 90),
          ]),
          midiClip('', 'Countersubject', 32, 32, [
            n(E5, 0, 1, 88), n(F5, 1, 1, 85), n(G5, 2, 1, 90), n(A5, 3, 1, 88),
            n(G5, 4, 2, 92), n(F5, 6, 1, 82), n(E5, 7, 1, 80),
            n(D5, 8, 2, 85), n(E5, 10, 1, 82), n(F5, 11, 1, 85),
            n(G5, 12, 2, 90), n(C5, 14, 2, 88),
          ]),
          midiClip('', 'Recapitulation', 64, 32, [
            n(C5, 0, 1, 92), n(D5, 1, 1, 88), n(E5, 2, 2, 95),
            n(F5, 4, 1, 90), n(E5, 5, 1, 88), n(D5, 6, 1, 85), n(C5, 7, 1, 82),
            n(G5, 8, 4, 95), n(E5, 12, 2, 90), n(C5, 14, 2, 92),
          ]),
        ],
      }),
      // Violin II — answer (alto), enters 2 bars later in the dominant
      t('Violin II', 'orange', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-algorithmic')],
        clips: [
          midiClip('', 'Answer', 8, 32, [
            // Answer at the dominant (G)
            n(G4, 0, 1, 88), n(A4, 1, 1, 82), n(B4, 2, 2, 90),
            n(C5, 4, 1, 85), n(B4, 5, 1, 82), n(A4, 6, 1, 80), n(G4, 7, 1, 78),
            n(D5, 8, 2, 88), n(C5, 10, 1, 82), n(B4, 11, 1, 80),
            n(A4, 12, 2, 85), n(G4, 14, 2, 88),
          ]),
          midiClip('', 'Violin II Development', 40, 24, [
            n(A4, 0, 1, 82), n(B4, 1, 1, 80), n(C5, 2, 2, 85),
            n(B4, 4, 1, 80), n(A4, 5, 1, 78), n(G4, 6, 2, 82),
            n(A4, 8, 2, 85), n(B4, 10, 1, 80), n(C5, 11, 1, 82),
            n(D5, 12, 2, 85), n(G4, 14, 2, 82),
          ]),
          midiClip('', 'Violin II Recap', 64, 32, [
            n(E4, 0, 2, 85), n(G4, 2, 2, 82),
            n(A4, 4, 1, 80), n(G4, 5, 1, 78), n(F4, 6, 1, 76), n(E4, 7, 1, 78),
            n(D4, 8, 2, 82), n(E4, 10, 2, 85),
            n(E4, 12, 2, 88), n(G4, 14, 2, 85),
          ]),
        ],
      }),
      // Viola — tenor voice
      t('Viola', 'yellow', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-algorithmic')],
        clips: [
          midiClip('', 'Viola Entry', 16, 32, [
            // Subject at tonic, lower register
            n(C4, 0, 1, 82), n(D4, 1, 1, 78), n(E4, 2, 2, 85),
            n(F4, 4, 1, 80), n(E4, 5, 1, 78), n(D4, 6, 1, 76), n(C4, 7, 1, 75),
            n(G4, 8, 2, 85), n(F4, 10, 1, 78), n(E4, 11, 1, 76),
            n(D4, 12, 2, 80), n(C4, 14, 2, 82),
          ]),
          midiClip('', 'Viola Sustain', 48, 48, [
            n(E4, 0, 4, 75), n(F4, 4, 4, 72), n(D4, 8, 4, 75),
            n(E4, 12, 4, 78), n(C4, 16, 4, 72),
            n(D4, 20, 2, 75), n(E4, 22, 2, 78),
            n(F4, 24, 2, 75), n(E4, 26, 2, 78), n(C4, 28, 4, 80),
          ]),
        ],
      }),
      // Cello — bass voice
      t('Cello', 'blue', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-algorithmic')],
        clips: [
          midiClip('', 'Cello Bassline', 0, 64, [
            // Foundational bass, slower movement
            n(C3, 0, 4, 80), n(G3, 4, 4, 78),
            n(A3, 8, 4, 80), n(F3, 12, 4, 78),
            n(C3, 16, 4, 82), n(G2, 20, 4, 78),
            n(F3, 24, 4, 80), n(G3, 28, 4, 82),
            n(C3, 32, 4, 80), n(D3, 36, 4, 78),
            n(E3, 40, 4, 80), n(G3, 44, 4, 78),
            n(A3, 48, 4, 80), n(F3, 52, 4, 78),
            n(G3, 56, 4, 82), n(C3, 60, 4, 85),
          ]),
          midiClip('', 'Cello Recap', 64, 32, [
            n(C3, 0, 4, 82), n(G2, 4, 4, 78),
            n(F3, 8, 4, 80), n(G3, 12, 2, 82), n(G2, 14, 2, 80),
            n(C3, 16, 8, 85), n(E3, 16, 8, 78), n(G3, 16, 8, 78),
          ]),
        ],
      }),
    ],
    durationBeats: 96,
  }),
);

// ─── 4. Solo Cello ─────────────────────────────────────────────────────────────
// Beginner · 72 BPM · 16 bars · Expressive melody in A minor

const soloCello = template(
  meta(
    'Solo Cello',
    'classical',
    'beginner',
    'An expressive solo cello melody in A minor with sweeping phrases and rich reverb — inspired by the Romantic era.',
    16,
    ['cello', 'solo', 'romantic', 'a-minor', 'expressive'],
  ),
  buildTemplateProject({
    title: 'Solo Cello',
    genre: 'Classical',
    tempo: 72,
    tracks: [
      t('Cello Solo', 'purple', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-convolution'), fx('parametric-eq')],
        clips: [
          // Bars 1-4: Opening statement in A minor
          midiClip('', 'Opening Theme', 0, 16, [
            n(A3, 0, 2, 75),  // A — open, expressive
            n(B3, 2, 1, 80),
            n(C4, 3, 3, 88),  // Leap to C, sustained
            n(D4, 6, 1, 82),
            n(E4, 7, 1, 85),
            n(F4, 8, 2, 90),  // Climax of phrase
            n(E4, 10, 1.5, 82),
            n(D4, 11.5, 1.5, 78),
            n(C4, 13, 1, 80),
            n(B3, 14, 1, 75),
            n(A3, 15, 1, 72),  // Return to tonic
          ]),
          // Bars 5-8: Ascending emotional line
          midiClip('', 'Ascending Phrase', 16, 16, [
            n(A3, 0, 1, 78),
            n(C4, 1, 1, 82),
            n(E4, 2, 2, 90),  // Am arpeggio ascending
            n(G4, 4, 2, 92),
            n(A4, 6, 3, 95),  // High A, emotional peak
            n(G4, 9, 1, 85),
            n(F4, 10, 1, 80),
            n(E4, 11, 1, 78),
            n(D4, 12, 2, 82),
            n(C4, 14, 1, 75),
            n(B3, 15, 1, 72),
          ]),
          // Bars 9-12: Lower register, darker color
          midiClip('', 'Dark Passage', 32, 16, [
            n(E3, 0, 3, 72),
            n(F3, 3, 1, 68),
            n(G3, 4, 2, 75),
            n(A3, 6, 1, 70),
            n(G3, 7, 1, 68),
            n(F3, 8, 3, 78),
            n(E3, 11, 1, 72),
            n(D3, 12, 2, 70),
            n(C3, 14, 2, 65),  // Low C, pianissimo
          ]),
          // Bars 13-16: Return to theme and resolution
          midiClip('', 'Resolution', 48, 16, [
            n(A3, 0, 2, 78),
            n(B3, 2, 1, 80),
            n(C4, 3, 2, 85),
            n(E4, 5, 1, 82),
            n(D4, 6, 2, 80),
            n(C4, 8, 2, 78),
            n(B3, 10, 1, 72),
            n(A3, 11, 5, 70),  // Final A, long sustain to fade
          ]),
        ],
      }),
    ],
  }),
);

// ─── 5. Baroque Harpsichord ────────────────────────────────────────────────────
// Intermediate · 96 BPM · 16 bars · Ornamental melody in D minor

const baroqueHarpsichord = template(
  meta(
    'Baroque Harpsichord',
    'classical',
    'intermediate',
    'A lively baroque harpsichord piece in D minor with trills, mordents, and ornamental passagework.',
    16,
    ['baroque', 'harpsichord', 'ornamental', 'd-minor', 'bach'],
  ),
  buildTemplateProject({
    title: 'Baroque Harpsichord',
    genre: 'Classical',
    tempo: 96,
    tracks: [
      t('Harpsichord', 'yellow', {
        instrumentType: 'fm',
        effects: [fx('delay-tape')],
        clips: [
          // Bars 1-4: Opening subject in D minor
          midiClip('', 'Subject', 0, 16, [
            // Right hand: ornamental D minor melody
            n(D5, 0, 0.5, 90), n(E5, 0.5, 0.25, 75), n(D5, 0.75, 0.25, 75), // Trill on D
            n(C5, 1, 0.5, 85), n(Bb4, 1.5, 0.5, 82),
            n(A4, 2, 1, 88), n(G4, 3, 0.5, 80), n(A4, 3.5, 0.5, 82),
            n(Bb4, 4, 0.5, 85), n(A4, 4.5, 0.5, 80), n(G4, 5, 0.5, 78), n(F4, 5.5, 0.5, 82),
            n(E4, 6, 1, 85), n(D4, 7, 0.5, 80), n(E4, 7.5, 0.5, 78),
            n(F4, 8, 0.5, 85), n(G4, 8.5, 0.5, 82), n(A4, 9, 0.5, 88), n(Bb4, 9.5, 0.5, 85),
            n(A4, 10, 1, 90), n(G4, 11, 0.5, 80), n(F4, 11.5, 0.5, 78),
            n(E4, 12, 1, 85), n(D4, 13, 1, 82),
            n(D4, 14, 0.5, 88), n(E4, 14.5, 0.25, 75), n(D4, 14.75, 0.25, 75), n(D4, 15, 1, 90),
            // Left hand: steady bass
            n(D3, 0, 2, 70), n(G3, 2, 2, 68),
            n(D3, 4, 2, 70), n(A2, 6, 2, 68),
            n(46, 8, 2, 70), n(F3, 10, 2, 68),
            n(A2, 12, 2, 70), n(D3, 14, 2, 72),
          ]),
          // Bars 5-8: Sequence and development
          midiClip('', 'Sequence', 16, 16, [
            n(A4, 0, 0.5, 88), n(Bb4, 0.5, 0.5, 85), n(C5, 1, 0.5, 88), n(D5, 1.5, 0.5, 90),
            n(E5, 2, 1, 92), n(D5, 3, 0.5, 85), n(C5, 3.5, 0.5, 82),
            n(Bb4, 4, 0.5, 85), n(A4, 4.5, 0.5, 82), n(G4, 5, 0.5, 80), n(F4, 5.5, 0.5, 78),
            n(E4, 6, 1, 82), n(F4, 7, 0.5, 80), n(G4, 7.5, 0.5, 82),
            n(A4, 8, 1, 88), n(Bb4, 9, 0.5, 82), n(C5, 9.5, 0.5, 85),
            n(D5, 10, 1.5, 92), n(C5, 11.5, 0.5, 85),
            n(Bb4, 12, 1, 85), n(A4, 13, 1, 82), n(G4, 14, 1, 80), n(A4, 15, 1, 85),
            // Left hand
            n(F3, 0, 2, 68), n(C3, 2, 2, 70),
            n(D3, 4, 2, 68), n(A2, 6, 2, 70),
            n(F3, 8, 2, 68), n(46, 10, 2, 70),
            n(G3, 12, 2, 68), n(A3, 14, 2, 70),
          ]),
          // Bars 9-12: Episode with running sixteenths
          midiClip('', 'Episode', 32, 16, [
            n(D5, 0, 0.25, 85), n(C5, 0.25, 0.25, 82), n(Bb4, 0.5, 0.25, 80), n(A4, 0.75, 0.25, 78),
            n(G4, 1, 0.25, 82), n(A4, 1.25, 0.25, 80), n(Bb4, 1.5, 0.25, 82), n(C5, 1.75, 0.25, 85),
            n(D5, 2, 1, 90), n(A4, 3, 1, 85),
            n(Bb4, 4, 0.5, 82), n(C5, 4.5, 0.5, 85), n(D5, 5, 0.5, 88), n(Eb5, 5.5, 0.5, 90),
            n(D5, 6, 1, 88), n(C5, 7, 1, 85),
            n(Bb4, 8, 2, 85), n(A4, 10, 2, 82),
            n(G4, 12, 2, 80), n(A4, 14, 2, 85),
            // Left hand
            n(D3, 0, 4, 70), n(G3, 4, 4, 68),
            n(D3, 8, 4, 70), n(A2, 12, 4, 68),
          ]),
          // Bars 13-16: Return and cadence
          midiClip('', 'Cadence', 48, 16, [
            n(D5, 0, 0.5, 90), n(E5, 0.5, 0.25, 78), n(D5, 0.75, 0.25, 78),
            n(C5, 1, 0.5, 85), n(Bb4, 1.5, 0.5, 82),
            n(A4, 2, 1, 88), n(G4, 3, 0.5, 80), n(A4, 3.5, 0.5, 82),
            n(Bb4, 4, 1, 85), n(A4, 5, 1, 82),
            n(G4, 6, 0.5, 80), n(F4, 6.5, 0.5, 78), n(E4, 7, 0.5, 80), n(D4, 7.5, 0.5, 78),
            // Perfect cadence: A → D
            n(E4, 8, 1, 82), n(F4, 9, 1, 80), n(G4, 10, 1, 85), n(A4, 11, 1, 88),
            n(D4, 12, 4, 92), n(F4, 12, 4, 85), n(A4, 12, 4, 88), // D minor chord
            // Left hand
            n(D3, 0, 4, 70), n(G3, 4, 4, 68),
            n(A3, 8, 4, 72), n(D3, 12, 4, 75),
          ]),
        ],
      }),
    ],
  }),
);

// ─── 6. Romantic Nocturne ──────────────────────────────────────────────────────
// Advanced · 66 BPM · 24 bars · Chopin-inspired in Eb major
// Theme (8 bars) → Development (8) → Recapitulation (8)

// Eb major scale: Eb F G Ab Bb C D
const romanticNocturne = template(
  meta(
    'Romantic Nocturne',
    'classical',
    'advanced',
    'A Chopin-inspired nocturne in Eb major with lyrical piano melody over lush string pads — three sections with rubato-like phrasing.',
    24,
    ['nocturne', 'chopin', 'romantic', 'piano', 'strings', 'eb-major'],
  ),
  buildTemplateProject({
    title: 'Romantic Nocturne',
    genre: 'Classical',
    tempo: 66,
    tracks: [
      // Piano — singing melody and arpeggiated accompaniment
      t('Piano', 'blue', {
        instrumentType: 'rach-pad',
        effects: [fx('reverb-convolution'), fx('parametric-eq')],
        clips: [
          // Theme (bars 1-8): Lyrical Eb major melody
          midiClip('', 'Nocturne Theme', 0, 32, [
            // Left hand: arpeggiated Eb major patterns (waltz-like)
            n(Eb4, 0, 0.5, 55), n(G4, 0.5, 0.5, 50), n(Bb4, 1, 0.5, 52),
            n(G4, 1.5, 0.5, 50), n(Eb4, 2, 0.5, 55), n(G4, 2.5, 0.5, 50),
            n(Bb4, 3, 0.5, 52), n(G4, 3.5, 0.5, 50),
            n(Ab4, 4, 0.5, 55), n(C5, 4.5, 0.5, 50), n(Eb5, 5, 0.5, 52),
            n(C5, 5.5, 0.5, 50), n(Ab4, 6, 0.5, 55), n(C5, 6.5, 0.5, 50),
            n(Eb5, 7, 0.5, 52), n(C5, 7.5, 0.5, 50),
            // Right hand: singing melody
            n(Bb5, 0, 2, 85), n(G5, 2, 1, 78), n(Ab5, 3, 1, 80),
            n(Bb5, 4, 1.5, 88), n(C6, 5.5, 1, 82), n(Bb5, 6.5, 1.5, 85),
            n(Ab5, 8, 2, 82), n(G5, 10, 1, 78), n(F5, 11, 1, 75),
            n(Eb5, 12, 3, 85), n(D5, 15, 1, 72),
            // Phrase 2
            n(Eb5, 16, 1.5, 82), n(F5, 17.5, 1, 78), n(G5, 18.5, 1.5, 85),
            n(Ab5, 20, 2, 88), n(G5, 22, 1, 80), n(F5, 23, 1, 78),
            n(Eb5, 24, 2, 85), n(Bb4, 26, 1, 75), n(C5, 27, 1, 78),
            n(Eb5, 28, 4, 82), // Long sustained Eb
          ]),
          // Development (bars 9-16): Modulation and increased tension
          midiClip('', 'Development', 32, 32, [
            // Melody ventures into C minor territory
            n(G5, 0, 1.5, 85), n(Ab5, 1.5, 1, 82), n(Bb5, 2.5, 1.5, 90),
            n(C6, 4, 2, 95),  // Emotional peak
            n(Bb5, 6, 1, 85), n(Ab5, 7, 1, 82),
            n(G5, 8, 1, 80), n(F5, 9, 1, 78), n(Eb5, 10, 2, 82),
            n(D5, 12, 1, 75), n(Eb5, 13, 1, 78), n(F5, 14, 2, 82),
            // Second development phrase
            n(Bb5, 16, 2, 92), n(Ab5, 18, 1, 85), n(G5, 19, 1, 82),
            n(F5, 20, 2, 88), n(Eb5, 22, 1, 80), n(D5, 23, 1, 78),
            n(C5, 24, 2, 75), n(D5, 26, 1, 72), n(Eb5, 27, 1, 75),
            n(F5, 28, 2, 80), n(G5, 30, 2, 82),
            // Left hand bass notes (whole notes)
            n(Eb4, 0, 4, 55), n(Ab4, 4, 4, 55),
            n(Eb4, 8, 4, 55), n(Bb3, 12, 4, 55),
            n(Eb4, 16, 4, 55), n(Ab4, 20, 4, 55),
            n(C4, 24, 4, 55), n(Bb3, 28, 4, 55),
          ]),
          // Recapitulation (bars 17-24): Return to Eb major, gentle close
          midiClip('', 'Recapitulation', 64, 32, [
            // Reprise of opening melody, slightly varied
            n(Bb5, 0, 2, 80), n(G5, 2, 1, 72), n(Ab5, 3, 1, 75),
            n(Bb5, 4, 1.5, 82), n(C6, 5.5, 1, 78), n(Bb5, 6.5, 1.5, 80),
            n(Ab5, 8, 2, 78), n(G5, 10, 2, 75),
            n(F5, 12, 1, 72), n(Eb5, 13, 3, 78),
            // Gentle descending close
            n(Eb5, 16, 1.5, 72), n(D5, 17.5, 1.5, 68), n(C5, 19, 1, 65),
            n(Bb4, 20, 2, 68), n(Ab4, 22, 2, 62),
            n(G4, 24, 2, 60), n(Bb4, 24, 2, 55), n(Eb5, 24, 2, 58), // Eb chord
            n(Eb4, 26, 6, 50), n(G4, 26, 6, 45), n(Bb4, 26, 6, 48), // Final chord, pppp
          ]),
        ],
      }),
      // Strings — sustained harmonic pads
      t('Strings', 'purple', {
        instrumentType: 'wavetable',
        volume: -4,
        effects: [fx('reverb-convolution'), fx('chorus')],
        clips: [
          // Theme: Warm Eb major pad
          midiClip('', 'Theme Strings', 0, 32, [
            n(Eb4, 0, 8, 55), n(G4, 0, 8, 50), n(Bb4, 0, 8, 50),   // Eb major
            n(Ab4, 8, 8, 55), n(C5, 8, 8, 50), n(Eb5, 8, 8, 50),   // Ab major
            n(Bb3, 16, 8, 55), n(D4, 16, 8, 50), n(F4, 16, 8, 50), // Bb major
            n(Eb4, 24, 8, 55), n(G4, 24, 8, 50), n(Bb4, 24, 8, 50), // Eb major
          ]),
          // Development: Darker harmonies, C minor coloring
          midiClip('', 'Development Strings', 32, 32, [
            n(C4, 0, 8, 58), n(Eb4, 0, 8, 52), n(G4, 0, 8, 52),   // Cm
            n(56, 8, 8, 55), n(C4, 8, 8, 50), n(Eb4, 8, 8, 50),  // Ab
            n(Bb3, 16, 8, 55), n(D4, 16, 8, 50), n(F4, 16, 8, 50), // Bb
            n(C4, 24, 4, 52), n(Eb4, 24, 4, 48), n(G4, 24, 4, 48), // Cm
            n(Bb3, 28, 4, 55), n(D4, 28, 4, 50), n(F4, 28, 4, 50), // Bb (V)
          ]),
          // Recapitulation: Warm return
          midiClip('', 'Recapitulation Strings', 64, 32, [
            n(Eb4, 0, 8, 52), n(G4, 0, 8, 48), n(Bb4, 0, 8, 48),   // Eb
            n(Ab4, 8, 8, 52), n(C5, 8, 8, 48), n(Eb5, 8, 8, 48),   // Ab
            n(Bb3, 16, 8, 50), n(D4, 16, 8, 45), n(F4, 16, 8, 45), // Bb
            n(Eb4, 24, 8, 45), n(G4, 24, 8, 40), n(Bb4, 24, 8, 42), // Eb — pppp fade
          ]),
        ],
      }),
    ],
    sections: [
      section('Theme', 0, 32, '#3B82F6'),
      section('Development', 32, 32, '#8B5CF6'),
      section('Recapitulation', 64, 32, '#6366F1'),
    ],
    durationBeats: 96,
  }),
);

// ─── Export ────────────────────────────────────────────────────────────────────

export const classicalTemplates: ProjectTemplate[] = [
  romanticPianoBallad,
  orchestralSuite,
  stringQuartet,
  soloCello,
  baroqueHarpsichord,
  romanticNocturne,
];
