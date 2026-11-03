import { describe, it, expect } from 'vitest';
import { generateSafeRewrites } from '../../src/engine/captionRewriter';
import { analyzeText } from '../../src/engine/rules';

describe('Caption Rewriter Engine (F-07 / T-015)', () => {
  it('returns safe status for text without findings', () => {
    const safeText = 'Selamat pagi semuanya, salam hangat!';
    const findings = analyzeText(safeText, 'caption');
    const rewrites = generateSafeRewrites(safeText, findings);

    expect(rewrites).toHaveLength(1);
    expect(rewrites[0].templateName).toBe('Status Aman');
    expect(rewrites[0].text).toBe(safeText);
  });

  it('generates military opsec safe templates for risky text', () => {
    const riskyCaption = 'Besok jam 05.00 berangkat ke pos perbatasan bersama Yonif 999';
    const findings = analyzeText(riskyCaption, 'caption');
    expect(findings.length).toBeGreaterThan(0);

    const rewrites = generateSafeRewrites(riskyCaption, findings);
    expect(rewrites.length).toBeGreaterThan(1);

    // Verify template existence
    const templateNames = rewrites.map((r) => r.templateName);
    expect(templateNames).toContain('Dukungan Moral & Semangat (Umum)');
    expect(templateNames).toContain('Dokumentasi Pasca-Kegiatan');
    expect(templateNames).toContain('Sensor Otomatis (Redacted)');

    // Verify that the redacted template removed or masked unit name
    const redactedTemplate = rewrites.find((r) => r.templateName === 'Sensor Otomatis (Redacted)');
    expect(redactedTemplate?.text).toContain('[DISENSOR]');
  });
});

