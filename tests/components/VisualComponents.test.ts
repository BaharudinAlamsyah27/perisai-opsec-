import { describe, it, expect } from 'vitest';
import { getScoreTheme, calculateCategoryScores } from '../../src/utils/visualHelpers';
import type { Finding } from '../../src/types';

describe('Visual Upgrade Component Logic', () => {
  it('maps scores accurately to risk color themes', () => {
    const criticalTheme = getScoreTheme(80);
    expect(criticalTheme.strokeColor).toBe('#ef4444');
    expect(criticalTheme.textColor).toContain('rose');

    const highTheme = getScoreTheme(60);
    expect(highTheme.strokeColor).toBe('#f97316');
    expect(highTheme.textColor).toContain('orange');

    const warningTheme = getScoreTheme(35);
    expect(warningTheme.strokeColor).toBe('#eab308');
    expect(warningTheme.textColor).toContain('amber');

    const safeTheme = getScoreTheme(10);
    expect(safeTheme.strokeColor).toBe('#10b981');
    expect(safeTheme.textColor).toContain('emerald');
  });

  it('normalizes radar chart category weights properly', () => {
    const mockFindings: Finding[] = [
      {
        id: '1',
        ruleId: 'meta-gps',
        category: 'lokasi',
        severity: 'critical',
        source: 'metadata',
        evidence: 'GPS',
        reason: 'Lokasi bocor',
        recommendation: 'Hapus GPS',
      },
      {
        id: '2',
        ruleId: 'opr-satuan',
        category: 'operasional',
        severity: 'high',
        source: 'caption',
        evidence: 'Yonif',
        reason: 'Satuan',
        recommendation: 'Hapus',
      },
    ];

    const radar = calculateCategoryScores(mockFindings);
    expect(radar.lokasi).toBeGreaterThan(0);
    expect(radar.operasional).toBeGreaterThan(0);
    expect(radar.identitas).toBe(0);
    expect(radar.teknis).toBe(0);
    expect(radar.lokasi).toBeLessThanOrEqual(1);
  });
});
