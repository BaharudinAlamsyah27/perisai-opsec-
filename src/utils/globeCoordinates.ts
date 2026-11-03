const DEGREES_TO_RADIANS = Math.PI / 180;

export interface GlobeRotation {
  phi: number;
  theta: number;
}

/** Converts geographic degrees to Cobe's longitude/latitude rotation angles. */
export function toGlobeRotation(latitude: number, longitude: number): GlobeRotation {
  return {
    // Cobe's center ray aligns with its marker vector when theta tracks latitude
    // and phi tracks the inverse longitude offset by a quarter turn.
    phi: -longitude * DEGREES_TO_RADIANS - Math.PI / 2,
    theta: latitude * DEGREES_TO_RADIANS,
  };
}

/** Returns an equivalent target angle no more than π away from the current angle. */
export function nearestEquivalentAngle(current: number, target: number): number {
  const delta = Math.atan2(Math.sin(target - current), Math.cos(target - current));
  return current + delta;
}
