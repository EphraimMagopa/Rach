export class Metronome {
  private context: AudioContext | null = null;
  private destination: AudioNode | null = null;
  private enabled = false;

  initialize(context: AudioContext, destination: AudioNode): void {
    this.context = context;
    this.destination = destination;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  scheduleClick(time: number, isDownbeat: boolean): void {
    if (!this.enabled || !this.context || !this.destination) return;

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();

    osc.frequency.value = isDownbeat ? 1000 : 800;
    osc.type = 'sine';

    gain.gain.setValueAtTime(0.5, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.05);

    osc.connect(gain);
    gain.connect(this.destination);

    osc.start(time);
    osc.stop(time + 0.05);
  }

  dispose(): void {
    this.context = null;
    this.destination = null;
  }
}
