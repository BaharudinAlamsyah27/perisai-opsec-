import { describe, expect, it } from 'vitest';
import { analyzePatterns, formatPatternTime, haversineDistanceMeters, renderPatternInsight, type PatternAnalysis } from '../../src/engine/pattern';

const fixtureLikeSeries: PatternAnalysis[] = [
  { id: '11', exif: { latitude: -6.1754, longitude: 106.8272, takenAt: '2026:11:02 05:50:00' } },
  { id: '12', exif: { latitude: -6.1900, longitude: 106.8300, takenAt: '2026:11:02 07:30:00' } },
  { id: '13', exif: { latitude: -6.1754, longitude: 106.8272, takenAt: '2026:11:03 05:55:00' } },
  { id: '14', exif: { latitude: -6.1900, longitude: 106.8300, takenAt: '2026:11:03 07:28:00' } },
  { id: '15', exif: { latitude: -6.1754, longitude: 106.8272, takenAt: '2026:11:04 05:48:00' } },
  { id: '16', exif: { latitude: -6.1900, longitude: 106.8300, takenAt: '2026:11:04 07:35:00' } },
  { id: '17', exif: { latitude: -6.2100, longitude: 106.8450, takenAt: '2026:11:04 19:10:00' } },
  { id: '18', exif: { latitude: -6.1754, longitude: 106.8272, takenAt: '2026:11:05 05:52:00' } },
];

describe('deterministic pattern of life engine', () => {
  it('finds three synthetic locations, two routines, and the recurring A-to-B transition', () => {
    const result = analyzePatterns(fixtureLikeSeries);
    expect(result.clusters).toHaveLength(3);
    expect(result.clusters.map(({ photoCount, dayCount }) => [photoCount, dayCount])).toEqual([[4, 4], [3, 3], [1, 1]]);
    expect(result.clusters.map(({ medianMinuteOfDay }) => formatPatternTime(medianMinuteOfDay))).toEqual(['05.51', '07.29', '19.10']);
    expect(result.routines).toHaveLength(2);
    expect(result.transitions).toEqual([
      expect.objectContaining({ fromClusterId: 'cluster-1', toClusterId: 'cluster-2', count: 3, dayCount: 3 }),
    ]);
    expect(result.readability).toBe('Tinggi');
    const recurringRoute = result.insights.find(({ kind }) => kind === 'transition');
    expect(recurringRoute?.confidence).toBe('Tinggi');
    expect(recurringRoute?.sourceClusterIds).toEqual(['cluster-1', 'cluster-2']);
    expect(renderPatternInsight(recurringRoute!, result.clusters, { 'cluster-1': 'A', 'cluster-2': 'B' })).toContain('A → B');
  });

  it('counts each photo without GPS or a valid EXIF time as unmappable', () => {
    const result = analyzePatterns([
      fixtureLikeSeries[0]!,
      { id: 'no-gps', exif: { takenAt: '2026:11:02 06:00:00' } },
      { id: 'no-time', exif: { latitude: -6.2, longitude: 106.8 } },
      { id: 'invalid-time', exif: { latitude: -6.2, longitude: 106.8, takenAt: 'not a date' } },
    ]);
    expect(result.unmappableCount).toBe(3);
    expect(result.observations.map(({ analysisId }) => analysisId)).toEqual(['11']);
  });

  it('keeps a single-location one-day sample low readability without inventing a routine', () => {
    const result = analyzePatterns([fixtureLikeSeries[0]!]);
    expect(result.clusters).toHaveLength(1);
    expect(result.clusters[0]?.label).toBe('Lokasi 1');
    expect(result.routines).toEqual([]);
    expect(result.transitions).toEqual([]);
    expect(result.insights).toEqual([]);
    expect(result.readability).toBe('Rendah');
  });

  it('uses haversine radius configuration and handles invalid options conservatively', () => {
    const nearby = { latitude: -6.1754, longitude: 106.8272 };
    const nextDoor = { latitude: -6.1755, longitude: 106.8272 };
    expect(haversineDistanceMeters(nearby, nextDoor)).toBeLessThan(100);
    const result = analyzePatterns([
      fixtureLikeSeries[0]!,
      { id: 'nearby', exif: { ...fixtureLikeSeries[0]!.exif, latitude: -6.1755 } },
    ], { radiusMeters: -5 });
    expect(result.radiusMeters).toBe(100);
    expect(result.clusters).toHaveLength(1);
  });
});
