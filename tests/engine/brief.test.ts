import { describe, expect, it } from 'vitest';
import { createIntelBrief } from '../../src/engine/brief';
import { analyzeText } from '../../src/engine/rules';
import { applyComboBoost } from '../../src/engine/combos';
import { calculateScore } from '../../src/engine/scoring';
import type { Finding, Score } from '../../src/types';

const finding = (partial: Partial<Finding> & Pick<Finding, 'id' | 'ruleId' | 'category' | 'severity' | 'source' | 'evidence'>): Finding => ({
  reason: 'Alasan uji sintetis.',
  recommendation: `Rekomendasi untuk ${partial.id}.`,
  ...partial,
});

const scoreFor = (findings: Finding[]): Score => calculateScore(findings);

function expectAllClaimsHaveFindingSources(brief: ReturnType<typeof createIntelBrief>, findings: Finding[]) {
  const statements = [
    ...(brief.summary ? [brief.summary] : []),
    ...brief.conclusions.flatMap(({ statements: items }) => items),
    ...brief.impacts,
    ...brief.mitigations,
  ];
  for (const item of statements) {
    expect(item.findingIds.length).toBeGreaterThan(0);
    expect(item.findingIds.every((id) => findings.some((source) => source.id === id))).toBe(true);
  }
}

describe('deterministic opponent intelligence brief', () => {
  it('summarizes a GPS-only photo with a linked location conclusion', () => {
    const findings = [finding({
      id: 'gps-source', ruleId: 'meta-gps', category: 'lokasi', severity: 'critical', source: 'metadata',
      evidence: 'Koordinat: -6.175400, 106.827200',
    })];
    const brief = createIntelBrief(scoreFor(findings));
    expect(brief.summary?.text).toContain('Tinggi');
    expect(brief.summary?.text).toContain('60/100');
    expect(brief.conclusions[0]?.group).toBe('DI MANA');
    expect(brief.conclusions[0]?.statements[0]).toMatchObject({
      findingIds: ['gps-source'], certainty: 'Tinggi',
    });
    expect(brief.decision).toBe('Jangan unggah');
    expectAllClaimsHaveFindingSources(brief, findings);
  });

  it('reports a unit and NRP on a synthetic sign with confidence levels and sources', () => {
    const findings = [
      finding({ id: 'unit-source', ruleId: 'opr-satuan', category: 'operasional', severity: 'high', source: 'ocr', evidence: 'YONIF 999 (keyakinan 93%)' }),
      finding({ id: 'nrp-source', ruleId: 'id-nrp', category: 'identitas', severity: 'high', source: 'ocr', evidence: 'NRP 12345678 (keyakinan 78%)' }),
    ];
    const brief = createIntelBrief(scoreFor(findings));
    expect(brief.conclusions.find(({ group }) => group === 'SIAPA')?.statements).toEqual(expect.arrayContaining([
      expect.objectContaining({ text: expect.stringContaining('YONIF 999'), certainty: 'Tinggi', findingIds: ['unit-source'] }),
      expect.objectContaining({ text: expect.stringContaining('12345678'), certainty: 'Sedang', findingIds: ['nrp-source'] }),
    ]));
    expectAllClaimsHaveFindingSources(brief, findings);
  });

  it('keeps classified-document findings and prioritized recommendations traceable', () => {
    const findings = [
      finding({ id: 'doc-source', ruleId: 'opr-dokumen', category: 'operasional', severity: 'critical', source: 'ocr', evidence: 'RAHASIA (keyakinan 97%)' }),
      finding({ id: 'schedule-source', ruleId: 'opr-jadwal', category: 'operasional', severity: 'medium', source: 'ocr', evidence: '05.00 (keyakinan 91%)' }),
    ];
    const brief = createIntelBrief(scoreFor(findings));
    expect(brief.conclusions.find(({ group }) => group === 'APA')?.statements[0]?.findingIds).toEqual(['doc-source']);
    expect(brief.conclusions.find(({ group }) => group === 'KAPAN')?.statements[0]?.findingIds).toEqual(['schedule-source']);
    expect(brief.mitigations.map(({ severity }) => severity)).toEqual(['critical', 'medium']);
    expectAllClaimsHaveFindingSources(brief, findings);
  });

  it('derives the device-local weekday from a timestamp finding and caps impacts at three', () => {
    const findings = [
      finding({ id: 'time-source', ruleId: 'meta-taken-at', category: 'operasional', severity: 'medium', source: 'metadata', evidence: 'Waktu pengambilan: 2026-11-03 05:12:00' }),
      finding({ id: 'gps-source-2', ruleId: 'meta-gps', category: 'lokasi', severity: 'critical', source: 'metadata', evidence: 'Koordinat: -6.2, 106.8' }),
      finding({ id: 'nik-source-2', ruleId: 'id-nik', category: 'identitas', severity: 'high', source: 'ocr', evidence: '3201234567890123 (keyakinan 91%)' }),
      finding({ id: 'device-source-2', ruleId: 'meta-device', category: 'teknis', severity: 'low', source: 'metadata', evidence: 'Perangkat: SyntheticCamera' }),
    ];
    const brief = createIntelBrief(scoreFor(findings));
    expect(brief.conclusions.find(({ group }) => group === 'KAPAN')?.statements[0]?.text).toContain('(Selasa)');
    expect(brief.impacts).toHaveLength(3);
    expectAllClaimsHaveFindingSources(brief, findings);
  });

  it('states a clean result without fabricating sourced conclusions', () => {
    const brief = createIntelBrief(scoreFor([]));
    expect(brief.emptyStatus).toMatch(/TIDAK ADA KEBOCORAN BERMAKNA/);
    expect(brief.level).toBe('Aman');
    expect(brief.decision).toBe('Aman diunggah');
    expect(brief.summary).toBeNull();
    expect(brief.conclusions).toEqual([]);
    expect(brief.impacts).toEqual([]);
    expect(brief.mitigations).toEqual([]);
  });

  it('builds a complete caption assignment pattern and links every statement to source findings', () => {
    const caption = 'Besok jam 05.00 berangkat ke pos perbatasan bersama Yonif 999';
    const textFindings = analyzeText(caption, 'caption');
    const findings = applyComboBoost(textFindings);
    const brief = createIntelBrief(scoreFor(findings));
    expect(brief.conclusions.map(({ group }) => group)).toEqual(['SIAPA', 'DI MANA', 'KAPAN', 'APA', 'POLA']);
    expect(brief.conclusions.find(({ group }) => group === 'POLA')?.statements[0]?.certainty).toBe('Rendah');
    expectAllClaimsHaveFindingSources(brief, findings);
  });
});
