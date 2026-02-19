export type EffectCategory =
  | 'dynamics'
  | 'eq-filter'
  | 'time-based'
  | 'creative';

export interface EffectParameterDescriptor {
  name: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
}

/**
 * Runtime effect instance — mirrors RachSynthInstance pattern.
 * Each effect has an input and output AudioNode for chain wiring.
 */
export interface RachEffectInstance {
  readonly effectType: string;
  readonly category: EffectCategory;

  /** Connect an audio source to this effect's input. */
  getInput(): AudioNode;
  /** Get this effect's output node (for chaining to next effect or track gain). */
  getOutput(): AudioNode;

  /** Wire this effect's output to a destination node. */
  connect(destination: AudioNode): void;
  /** Disconnect output from everything. */
  disconnect(): void;

  /** Set a named parameter value. */
  setParameter(name: string, value: number): void;
  /** Get all parameter descriptors with current values. */
  getParameters(): EffectParameterDescriptor[];

  /** Enable or bypass this effect. When disabled, input passes through to output. */
  setEnabled(enabled: boolean): void;
  isEnabled(): boolean;

  /** Release all Web Audio resources. */
  dispose(): void;
}
