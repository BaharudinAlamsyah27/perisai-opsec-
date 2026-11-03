import { describe, it, expect } from 'vitest';
import { mapOcrWordsToFindings } from '../../src/engine/ocr-mapper';
import { applyComboBoost } from '../../src/engine/combos';
import type { Finding, OcrWord } from '../../src/types';

describe('OCR Mapper & Combos Engine', () => {
  it('maps sequential OCR words into a single merged bounding box', () => {
    const mockWords: OcrWord[] = [
      { text: 'Markas', conf: 90, bbox: { x0: 10, y0: 10, x1: 50, y1: 30 } },
      { text: 'Yonif', conf: 92, bbox: { x0: 55, y0: 10, x1: 90, y1: 30 } },
      { text: '999', conf: 95, bbox: { x0: 95, y0: 10, x1: 130, y1: 30 } },
    ];

    const findings: Finding[] = [
      {
        id: 'f1',
        ruleId: 'opr-satuan',
        category: 'operasional',
        severity: 'high',
        source: 'ocr',
        evidence: 'Yonif 999',
        reason: 'Nama satuan',
        recommendation: 'Sensor',
      },
    ];

    const mapped = mapOcrWordsToFindings(mockWords, findings);
    expect(mapped[0].bbox).toBeDefined();
    expect(mapped[0].bbox?.x0).toBe(55);
    expect(mapped[0].bbox?.x1).toBe(130);
    expect(mapped[0].bbox?.y0).toBe(10);
    expect(mapped[0].bbox?.y1).toBe(30);
  });

  it('triggers combo boost when >= 3 operational groups are present', () => {
    const findings: Finding[] = [
      {
        id: 'f1',
        ruleId: 'opr-satuan', // group: satuan
        category: 'operasional',
        severity: 'high',
        source: 'caption',
        evidence: 'Yonif 999',
        reason: 'Satuan',
        recommendation: 'Hapus',
      },
      {
        id: 'f2',
        ruleId: 'opr-fasilitas', // group: lokasi
        category: 'lokasi',
        severity: 'high',
        source: 'caption',
        evidence: 'pos perbatasan',
        reason: 'Lokasi fasilitas',
        recommendation: 'Hapus',
      },
      {
        id: 'f3',
        ruleId: 'opr-pergerakan', // group: pergerakan
        category: 'operasional',
        severity: 'medium',
        source: 'caption',
        evidence: 'berangkat',
        reason: 'Pergerakan',
        recommendation: 'Hapus',
      },
    ];

    const boosted = applyComboBoost(findings);
    expect(boosted).toHaveLength(4);
    const comboFinding = boosted.find((f) => f.ruleId === 'combo-pola-penugasan');
    expect(comboFinding).toBeDefined();
    expect(comboFinding?.severity).toBe('critical');
    expect(comboFinding?.reason).toContain('Pola Penugasan Terbaca');
  });

  it('does NOT trigger combo boost when < 3 operational groups are present', () => {
    const findings: Finding[] = [
      {
        id: 'f1',
        ruleId: 'opr-satuan', // group: satuan
        category: 'operasional',
        severity: 'high',
        source: 'caption',
        evidence: 'Yonif 999',
        reason: 'Satuan',
        recommendation: 'Hapus',
      },
      {
        id: 'f2',
        ruleId: 'opr-fasilitas', // group: lokasi
        category: 'lokasi',
        severity: 'high',
        source: 'caption',
        evidence: 'pos perbatasan',
        reason: 'Lokasi fasilitas',
        recommendation: 'Hapus',
      },
    ];

    const result = applyComboBoost(findings);
    expect(result).toHaveLength(2);
    expect(result.find((f) => f.ruleId === 'combo-pola-penugasan')).toBeUndefined();
  });
});
