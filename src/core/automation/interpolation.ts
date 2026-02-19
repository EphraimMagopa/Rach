import type { AutomationPoint } from '../models/automation';

/**
 * Pure interpolation functions for automation curves.
 * Used by both the automation engine (audio scheduling) and UI (curve drawing).
 */

/** Interpolate between two automation points at a given beat position. */
export function interpolateValue(
  fromPoint: AutomationPoint,
  toPoint: AutomationPoint,
  beat: number
): number {
  if (beat <= fromPoint.beat) return fromPoint.value;
  if (beat >= toPoint.beat) return toPoint.value;

  const t = (beat - fromPoint.beat) / (toPoint.beat - fromPoint.beat);

  switch (fromPoint.interpolation) {
    case 'linear':
      return fromPoint.value + (toPoint.value - fromPoint.value) * t;

    case 'exponential': {
      // Avoid log(0) — use minimum value
      const minVal = 0.0001;
      const from = Math.max(Math.abs(fromPoint.value), minVal);
      const to = Math.max(Math.abs(toPoint.value), minVal);
      const sign = toPoint.value >= 0 ? 1 : -1;
      return sign * from * Math.pow(to / from, t);
    }

    case 'step':
      return fromPoint.value; // Hold until next point

    default:
      return fromPoint.value + (toPoint.value - fromPoint.value) * t;
  }
}

/** Get the value of an automation lane at a specific beat. */
export function getAutomationValueAtBeat(
  points: AutomationPoint[],
  beat: number
): number | null {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0].value;

  // Before first point
  if (beat <= points[0].beat) return points[0].value;

  // After last point
  if (beat >= points[points.length - 1].beat) return points[points.length - 1].value;

  // Find surrounding points
  for (let i = 0; i < points.length - 1; i++) {
    if (beat >= points[i].beat && beat < points[i + 1].beat) {
      return interpolateValue(points[i], points[i + 1], beat);
    }
  }

  return points[points.length - 1].value;
}

/** Generate a series of interpolated values for drawing curves (UI). */
export function sampleAutomationCurve(
  points: AutomationPoint[],
  fromBeat: number,
  toBeat: number,
  sampleCount: number
): { beat: number; value: number }[] {
  if (points.length === 0 || sampleCount < 2) return [];

  const samples: { beat: number; value: number }[] = [];
  const step = (toBeat - fromBeat) / (sampleCount - 1);

  for (let i = 0; i < sampleCount; i++) {
    const beat = fromBeat + step * i;
    const value = getAutomationValueAtBeat(points, beat);
    if (value !== null) {
      samples.push({ beat, value });
    }
  }

  return samples;
}
