import type { EffectType } from '../models/effects';
import type { RachEffectInstance } from './effect-interface';
import { createEffect } from './effect-factory';
import type { AudioEngine } from '../audio/audio-engine';

interface TrackEffectChain {
  effects: RachEffectInstance[];
}

/**
 * Manages per-track effect chains.
 * Inserts effects between inputNode and gainNode in the track audio chain:
 *   inputNode → [effect1 → effect2 → ...] → gainNode
 *
 * When no effects are present, inputNode connects directly to gainNode (Phase 1 default).
 */
export class TrackEffectManager {
  private audioEngine: AudioEngine;
  private chains = new Map<string, TrackEffectChain>();

  constructor(audioEngine: AudioEngine) {
    this.audioEngine = audioEngine;
  }

  /** Get the current effect chain for a track. */
  getEffects(trackId: string): RachEffectInstance[] {
    return this.chains.get(trackId)?.effects ?? [];
  }

  /** Add an effect at the given index (or end). Reconnects the chain. */
  addEffect(trackId: string, type: EffectType, index?: number): RachEffectInstance {
    const ctx = this.audioEngine.audioContext;
    if (!ctx) throw new Error('AudioEngine not initialized');

    const effect = createEffect(type, ctx);
    const chain = this.ensureChain(trackId);

    if (index !== undefined && index >= 0 && index < chain.effects.length) {
      chain.effects.splice(index, 0, effect);
    } else {
      chain.effects.push(effect);
    }

    this.reconnectChain(trackId);
    return effect;
  }

  /** Remove effect at given index. Disposes it and reconnects. */
  removeEffect(trackId: string, index: number): void {
    const chain = this.chains.get(trackId);
    if (!chain || index < 0 || index >= chain.effects.length) return;

    const [removed] = chain.effects.splice(index, 1);
    removed.disconnect();
    removed.dispose();
    this.reconnectChain(trackId);
  }

  /** Reorder effects to a new order given by index array. */
  reorderEffects(trackId: string, newOrder: number[]): void {
    const chain = this.chains.get(trackId);
    if (!chain) return;

    const reordered = newOrder
      .filter((i) => i >= 0 && i < chain.effects.length)
      .map((i) => chain.effects[i]);

    chain.effects = reordered;
    this.reconnectChain(trackId);
  }

  /** Set enabled/bypass state for an effect. */
  setEffectEnabled(trackId: string, index: number, enabled: boolean): void {
    const chain = this.chains.get(trackId);
    if (!chain || index < 0 || index >= chain.effects.length) return;
    chain.effects[index].setEnabled(enabled);
  }

  /** Set a parameter on an effect in the chain. */
  setEffectParameter(trackId: string, effectIndex: number, paramName: string, value: number): void {
    const chain = this.chains.get(trackId);
    if (!chain || effectIndex < 0 || effectIndex >= chain.effects.length) return;
    chain.effects[effectIndex].setParameter(paramName, value);
  }

  /** Remove all effects from a track. */
  clearEffects(trackId: string): void {
    const chain = this.chains.get(trackId);
    if (!chain) return;

    for (const effect of chain.effects) {
      effect.disconnect();
      effect.dispose();
    }
    chain.effects = [];
    this.reconnectChain(trackId);
  }

  /** Clean up all chains. */
  dispose(): void {
    for (const [trackId] of this.chains) {
      this.clearEffects(trackId);
    }
    this.chains.clear();
  }

  /**
   * Reconnect the effect chain for a track.
   * Breaks inputNode → gainNode, inserts effects in series.
   */
  private reconnectChain(trackId: string): void {
    const trackNode = this.audioEngine.getTrackNode(trackId);
    if (!trackNode) return;

    const chain = this.chains.get(trackId);
    const effects = chain?.effects ?? [];

    // Disconnect inputNode from everything
    trackNode.inputNode.disconnect();

    // Disconnect all effects from everything
    for (const effect of effects) {
      effect.disconnect();
    }

    if (effects.length === 0) {
      // Direct: inputNode → gainNode
      trackNode.inputNode.connect(trackNode.gainNode);
    } else {
      // inputNode → first effect input
      trackNode.inputNode.connect(effects[0].getInput());

      // Chain effects: each output → next input
      for (let i = 0; i < effects.length - 1; i++) {
        effects[i].connect(effects[i + 1].getInput());
      }

      // Last effect → gainNode
      effects[effects.length - 1].connect(trackNode.gainNode);
    }
  }

  private ensureChain(trackId: string): TrackEffectChain {
    let chain = this.chains.get(trackId);
    if (!chain) {
      chain = { effects: [] };
      this.chains.set(trackId, chain);
    }
    return chain;
  }
}
