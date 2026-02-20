import type { SynthType, RachSynthInstance } from './synth-interface';
import { RachPadSynth } from './rach-synth';
import { SubtractiveSynth } from './subtractive-synth';
import { WavetableSynth } from './wavetable-synth';
import { FMSynth } from './fm-synth';
import { GranularSynth } from './granular-synth';
import { PluckSynth } from './pluck-synth';
import { OrganSynth } from './organ-synth';

export function createSynth(type: SynthType): RachSynthInstance {
  switch (type) {
    case 'rach-pad':
      return new RachPadSynth();
    case 'subtractive':
      return new SubtractiveSynth();
    case 'wavetable':
      return new WavetableSynth();
    case 'fm':
      return new FMSynth();
    case 'granular':
      return new GranularSynth();
    case 'pluck':
      return new PluckSynth();
    case 'organ':
      return new OrganSynth();
  }
}

export const SYNTH_LABELS: Record<SynthType, string> = {
  'rach-pad': 'Rach Pad',
  'subtractive': 'Subtractive',
  'wavetable': 'Wavetable',
  'fm': 'FM Synth',
  'granular': 'Granular',
  'pluck': 'Pluck',
  'organ': 'Organ',
};

export const ALL_SYNTH_TYPES: SynthType[] = [
  'rach-pad',
  'subtractive',
  'wavetable',
  'fm',
  'granular',
  'pluck',
  'organ',
];
