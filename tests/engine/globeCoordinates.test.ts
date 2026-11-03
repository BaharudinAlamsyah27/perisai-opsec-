import { describe, expect, it } from 'vitest';
import { nearestEquivalentAngle, toGlobeRotation } from '../../src/utils/globeCoordinates';

describe('globe coordinate conversion', () => {
  it('converts latitude and longitude degrees to radians for Cobe', () => {
    const rotation = toGlobeRotation(-7.25, 112.75);

    expect(rotation.phi).toBeCloseTo((-112.75 * Math.PI) / 180 - Math.PI / 2);
    expect(rotation.theta).toBeCloseTo((-7.25 * Math.PI) / 180);
  });

  it('chooses the nearest equivalent longitude angle across the wrap boundary', () => {
    const angle = nearestEquivalentAngle(3.1, -3.1);

    expect(Math.abs(angle - 3.1)).toBeLessThan(Math.PI);
    expect(Math.cos(angle)).toBeCloseTo(Math.cos(-3.1));
    expect(Math.sin(angle)).toBeCloseTo(Math.sin(-3.1));
  });
});
