export type InterpolationMode = 'linear' | 'exponential' | 'step';

export interface AutomationPoint {
  id: string;
  beat: number;
  value: number;
  interpolation: InterpolationMode;
}

export interface AutomationLane {
  id: string;
  parameter: string;
  targetId: string;
  points: AutomationPoint[];
  enabled: boolean;
}
