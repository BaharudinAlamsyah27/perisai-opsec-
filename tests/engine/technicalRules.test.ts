import { describe, expect, it } from 'vitest';
import { analyzeText, redactTechnicalSecrets } from '../../src/engine/rules';
import { applyComboBoost } from '../../src/engine/combos';
import { calculateScore } from '../../src/engine/scoring';
import { createIntelBrief } from '../../src/engine/brief';
import { buildOcrTextTokens } from '../../src/engine/rules';
import { mapOcrWordsToFindings } from '../../src/engine/ocr-mapper';

describe('technical and implicit location rules', () => {
  it('validates IPv4 and classifies the specified private ranges', () => {
    const findings = analyzeText('10.2.3.4 172.16.2.3 172.31.0.1 192.168.1.2 8.8.8.8 300.1.1.1 0.0.0.0 127.0.0.1', 'caption');
    expect(findings.filter((finding) => finding.ruleId === 'technical-ipv4').map((finding) => finding.severity)).toEqual(['high', 'high', 'high', 'high', 'medium']);
    expect(findings.some((finding) => finding.evidence === '300.1.1.1')).toBe(false);
    expect(findings.some((finding) => finding.evidence === '0.0.0.0' || finding.evidence === '127.0.0.1')).toBe(false);
  });

  it('detects emails, internal hosts, labelled secrets, and SSH without exposing secret values', () => {
    const input = 'Hubungi operator@unit.mil.id atau user@mail.test; localhost:8080 node.internal; password: AwanRahasia9 api_key=AbCdEfGhIj ssh petugas@server.test';
    const findings = analyzeText(input, 'caption');
    expect(findings.find((finding) => finding.ruleId === 'technical-email' && finding.evidence.includes('unit.mil.id'))?.severity).toBe('high');
    expect(findings.find((finding) => finding.ruleId === 'technical-email' && finding.evidence.includes('mail.test'))?.severity).toBe('medium');
    expect(findings.filter((finding) => finding.ruleId === 'technical-internal-host')).toHaveLength(2);
    expect(findings.find((finding) => finding.ruleId === 'technical-password')?.severity).toBe('critical');
    expect(findings.find((finding) => finding.ruleId === 'technical-token')?.severity).toBe('critical');
    expect(findings.find((finding) => finding.ruleId === 'technical-ssh')?.severity).toBe('medium');
    const renderedData = JSON.stringify({ findings, brief: createIntelBrief(calculateScore(findings)) });
    expect(renderedData).not.toContain('AwanRahasia9');
    expect(renderedData).not.toContain('AbCdEfGhIj');
    expect(redactTechnicalSecrets(input)).not.toContain('AwanRahasia9');
    expect(redactTechnicalSecrets(input)).not.toContain('AbCdEfGhIj');
  });

  it('detects implicit location clues and validates decimal and DMS coordinate bounds', () => {
    const valid = analyzeText('📍 lokasi: -6.2088, 106.8456 check-in 6°12\'31"S, 106°49\'44"E maps.app.goo.gl/abc', 'caption');
    expect(valid.some((finding) => finding.ruleId === 'location-hint')).toBe(true);
    expect(valid.some((finding) => finding.ruleId === 'location-coordinate-decimal')).toBe(true);
    expect(valid.some((finding) => finding.ruleId === 'location-coordinate-dms')).toBe(true);
    expect(valid.some((finding) => finding.ruleId === 'location-map-link')).toBe(true);
    expect(analyzeText('91.0000, 200.0000', 'caption').some((finding) => finding.ruleId === 'location-coordinate-decimal')).toBe(false);
    expect(analyzeText('lagi di pos jaga', 'caption').some((finding) => finding.ruleId === 'location-realtime')).toBe(true);
  });

  it('adds the infrastructure combo for two distinct technical leak kinds', () => {
    const findings = analyzeText('Alamat 10.2.3.4 dan localhost:3000', 'caption');
    const combined = applyComboBoost(findings);
    expect(combined.some((finding) => finding.ruleId === 'combo-infrastruktur' && finding.severity === 'critical' && finding.evidence === 'Gambaran Infrastruktur Terbaca')).toBe(true);
    expect(calculateScore(combined).value).toBeGreaterThan(calculateScore(findings).value);
  });

  it('does not include secret originals in generated brief-facing findings', () => {
    const finding = analyzeText('pwd: R3ntanFiktif77 token: NilaIContoh88', 'caption');
    const ids = finding.map((item) => item.id);
    expect(ids.length).toBeGreaterThanOrEqual(2);
    expect(finding.map(({ evidence }) => evidence).join(' ')).not.toContain('R3ntanFiktif77');
    expect(finding.map(({ evidence }) => evidence).join(' ')).not.toContain('NilaIContoh88');
  });

  it('maps a redacted OCR secret finding to its original word bbox for safe-version censoring', () => {
    const words = [
      { text: 'password:', conf: 96, bbox: { x0: 1, y0: 2, x1: 60, y1: 20 } },
      { text: 'BiruContoh71', conf: 91, bbox: { x0: 62, y0: 2, x1: 130, y1: 20 } },
    ];
    const tokens = buildOcrTextTokens(words);
    const finding = analyzeText(tokens.text, 'ocr', tokens.tokens).find((item) => item.ruleId === 'technical-password');
    expect(finding?.evidence).not.toContain('BiruContoh71');
    expect(mapOcrWordsToFindings(words, finding ? [finding] : [])[0]?.bbox).toEqual({ x0: 62, y0: 2, x1: 130, y1: 20 });
  });
});
