import { describe, it, expect } from 'vitest';
import { calculateScore, getRiskLevel } from '../../src/engine/scoring';
import { Finding } from '../../src/types';

describe('Scoring Engine (Deterministic Noisy-OR)', () => {
  it('returns score 0 and Aman level when there are no findings', () => {
    const result = calculateScore([]);
    expect(result.value).toBe(0);
    expect(result.level).toBe('Aman');
    expect(result.findings).toEqual([]);
  });

  it('correctly maps risk levels by score range', () => {
    expect(getRiskLevel(0)).toBe('Aman');
    expect(getRiskLevel(24)).toBe('Aman');
    expect(getRiskLevel(25)).toBe('Waspada');
    expect(getRiskLevel(49)).toBe('Waspada');
    expect(getRiskLevel(50)).toBe('Tinggi');
    expect(getRiskLevel(74)).toBe('Tinggi');
    expect(getRiskLevel(75)).toBe('Kritis');
    expect(getRiskLevel(100)).toBe('Kritis');
  });

  it('calculates single critical finding correctly (base p=0.60, score 60)', () => {
    const findings: Finding[] = [
      {
        id: '1',
        ruleId: 'meta-gps',
        category: 'lokasi',
        severity: 'critical',
        source: 'metadata',
        evidence: 'GPS Coords',
        reason: 'GPS found',
        recommendation: 'Remove GPS',
      },
    ];

    // For prajurit profile, lokasi multiplier = 1.0
    // score = 100 * (1 - (1 - 0.60 * 1.0)) = 60
    const result = calculateScore(findings, 'prajurit');
    expect(result.value).toBe(60);
    expect(result.level).toBe('Tinggi');
  });

  it('calculates multiple findings with Noisy-OR formula matching QA plan specs', () => {
    // QA Plan §3: critical (0.6) + high (0.4) on multiplier 1.0
    // score = 100 * (1 - (1 - 0.6) * (1 - 0.4)) = 100 * (1 - 0.4 * 0.6) = 100 * (1 - 0.24) = 76
    const findings: Finding[] = [
      {
        id: '1',
        ruleId: 'meta-gps',
        category: 'lokasi',
        severity: 'critical',
        source: 'metadata',
        evidence: 'GPS',
        reason: 'GPS pos',
        recommendation: 'Remove',
      },
      {
        id: '2',
        ruleId: 'meta-device-serial',
        category: 'teknis',
        severity: 'high',
        source: 'metadata',
        evidence: 'Serial',
        reason: 'Device serial',
        recommendation: 'Remove',
      },
    ];

    const result = calculateScore(findings, 'prajurit');
    expect(result.value).toBe(76);
    expect(result.level).toBe('Kritis');
  });

  it('applies profile multipliers correctly', () => {
    // Single high finding (base p=0.40) in category 'operasional':
    // Prajurit (operasional mult 1.2): p = 0.40 * 1.2 = 0.48 -> score = 48
    // Keluarga (operasional mult 1.3): p = 0.40 * 1.3 = 0.52 -> score = 52
    const findings: Finding[] = [
      {
        id: '1',
        ruleId: 'opr-jadwal',
        category: 'operasional',
        severity: 'high',
        source: 'caption',
        evidence: 'Besok berangkat jam 05.00',
        reason: 'Jadwal operasional',
        recommendation: 'Ganti waktu',
      },
    ];

    const prajuritResult = calculateScore(findings, 'prajurit');
    expect(prajuritResult.value).toBe(48);
    expect(prajuritResult.level).toBe('Waspada');

    const keluargaResult = calculateScore(findings, 'keluarga');
    expect(keluargaResult.value).toBe(52);
    expect(keluargaResult.level).toBe('Tinggi');
  });

  it('clamps output score between 0 and 100 even with many critical findings', () => {
    const findings: Finding[] = Array.from({ length: 10 }, (_, i) => ({
      id: `crit-${i}`,
      ruleId: 'meta-gps',
      category: 'lokasi',
      severity: 'critical',
      source: 'metadata',
      evidence: `GPS-${i}`,
      reason: 'test',
      recommendation: 'test',
    }));

    const result = calculateScore(findings, 'satuan');
    expect(result.value).toBe(100);
    expect(result.level).toBe('Kritis');
  });
});

