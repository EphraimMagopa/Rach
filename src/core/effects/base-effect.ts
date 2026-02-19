import type { EffectCategory, EffectParameterDescriptor, RachEffectInstance } from './effect-interface';

/**
 * Base class for all built-in effects.
 * Handles bypass wiring: input → [processing] → output
 * When disabled, input connects directly to output (bypass).
 */
export abstract class BaseEffect implements RachEffectInstance {
  abstract readonly effectType: string;
  abstract readonly category: EffectCategory;

  protected context: AudioContext;
  protected inputNode: GainNode;
  protected outputNode: GainNode;
  protected wetNode: GainNode;
  protected dryNode: GainNode;
  private enabled = true;

  constructor(context: AudioContext) {
    this.context = context;
    this.inputNode = context.createGain();
    this.outputNode = context.createGain();
    this.wetNode = context.createGain();
    this.dryNode = context.createGain();

    // Dry path (bypass): input → dryNode → output
    this.inputNode.connect(this.dryNode);
    this.dryNode.connect(this.outputNode);
    this.dryNode.gain.value = 0; // Start fully wet

    // Wet path is connected by subclass via connectProcessingChain()
    this.wetNode.connect(this.outputNode);
    this.wetNode.gain.value = 1;
  }

  /**
   * Subclasses call this to wire: inputNode → [their processing nodes] → wetNode
   * The first node should be connected FROM inputNode, the last TO wetNode.
   */
  protected connectProcessingChain(firstNode: AudioNode, lastNode: AudioNode): void {
    this.inputNode.connect(firstNode);
    lastNode.connect(this.wetNode);
  }

  getInput(): AudioNode {
    return this.inputNode;
  }

  getOutput(): AudioNode {
    return this.outputNode;
  }

  connect(destination: AudioNode): void {
    this.outputNode.connect(destination);
  }

  disconnect(): void {
    this.outputNode.disconnect();
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (enabled) {
      this.wetNode.gain.value = 1;
      this.dryNode.gain.value = 0;
    } else {
      this.wetNode.gain.value = 0;
      this.dryNode.gain.value = 1;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  abstract setParameter(name: string, value: number): void;
  abstract getParameters(): EffectParameterDescriptor[];

  dispose(): void {
    this.inputNode.disconnect();
    this.outputNode.disconnect();
    this.wetNode.disconnect();
    this.dryNode.disconnect();
  }
}
