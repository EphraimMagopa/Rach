export interface Send {
  id: string;
  targetBusId: string;
  gain: number;      // dB (-60 to +6)
  preFader: boolean;
  enabled: boolean;
}
