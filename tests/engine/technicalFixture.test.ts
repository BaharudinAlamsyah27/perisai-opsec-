// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { createWorker } from 'tesseract.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import captionData from '../fixtures/dataset-tambahan/caption-uji.json';
import { analyzeText, buildOcrTextTokens } from '../../src/engine/rules';
import { mapTesseractBlocksToWords } from '../../src/engine/ocrWords';

const expectedRuleByDescription: Record<string, string[]> = {
  'pin lokasi/check-in': ['location-hint'],
  'lokasi + waktu nyata (real-time)': ['location-realtime'],
  'tautan peta': ['location-map-link'],
  'koordinat desimal': ['location-coordinate-decimal'],
  'koordinat DMS': ['location-coordinate-dms'],
  'check-in': ['location-hint'],
  'fasilitas (asrama)': ['opr-fasilitas'],
  'real-time': ['location-realtime'],
  'pergerakan/kegiatan': ['opr-pergerakan'],
  'IP privat': ['technical-ipv4'],
  'email/akun': ['technical-ssh', 'technical-email'],
  'kata sandi berlabel': ['technical-password'],
  'alamat IP': ['technical-ipv4'],
};

describe('Checkpoint T additional synthetic dataset', () => {
  it.each(captionData.caption)('$id detects expected categories', ({ id, teks, harapan }) => {
    const findings = analyzeText(teks, 'caption');
    if (['c10', 'c11', 'c12'].includes(id)) {
      expect(findings).toHaveLength(0);
      return;
    }
    const detected = new Set(findings.map((finding) => finding.ruleId));
    for (const expected of harapan) {
      const matchingRules = expectedRuleByDescription[expected];
      expect(matchingRules, `${id}: expected description is mapped`).toBeDefined();
      expect(matchingRules?.some((ruleId) => detected.has(ruleId)), `${id}: ${expected}`).toBe(true);
    }
  });

  it('recognizes at least four sensitive categories in the dark terminal screenshot', async () => {
    const worker = await createWorker(['ind', 'eng'], 1, {
      corePath: resolve('public/tessdata'),
      langPath: resolve('public/tessdata'),
      gzip: false,
      logger: () => undefined,
    });
    try {
      const screenshot = await readFile(resolve('tests/fixtures/dataset-tambahan/19_screenshot_teknis.png'));
      const result = await worker.recognize(screenshot, {}, { text: true, blocks: true });
      const words = mapTesseractBlocksToWords(result.data.blocks);
      const recognized = buildOcrTextTokens(words);
      const findings = analyzeText(recognized.text, 'ocr', recognized.tokens);
      const ids = new Set(findings.map(({ ruleId }) => ruleId));
      const types = [
        ids.has('technical-ipv4'),
        ids.has('technical-email') || ids.has('technical-ssh'),
        ids.has('technical-password'),
        ids.has('technical-token'),
        ids.has('technical-internal-host'),
      ];
      expect(types.filter(Boolean).length).toBeGreaterThanOrEqual(4);
      const secretEvidence = findings.filter((finding) => finding.ruleId === 'technical-password' || finding.ruleId === 'technical-token');
      expect(secretEvidence.length).toBeGreaterThanOrEqual(1);
      expect(secretEvidence.every((finding) => finding.evidence.includes('••••'))).toBe(true);
    } finally {
      await worker.terminate();
    }
  }, 30_000);
});
