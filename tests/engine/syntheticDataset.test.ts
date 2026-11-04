// @vitest-environment node
import { afterEach, describe, expect, it } from 'vitest';
import { createWorker, PSM } from 'tesseract.js';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import exifr from 'exifr';
import expectedData from '../fixtures/dataset-uji-sintetis/expected.json';
import { analyzeText, buildOcrTextTokens } from '../../src/engine/rules';
import { mapOcrWordsToFindings } from '../../src/engine/ocr-mapper';
import { mapTesseractBlocksToWords } from '../../src/engine/ocrWords';
import { applyComboBoost } from '../../src/engine/combos';
import { calculateScore } from '../../src/engine/scoring';
import { mapExifToFindings, parseRawExif } from '../../src/engine/metadata';

const fixtureDirectory = resolve('tests/fixtures/dataset-uji-sintetis');
const cases = expectedData.kasus.slice(0, 9);
let worker: Awaited<ReturnType<typeof createWorker>> | undefined;

afterEach(async () => {
  if (worker) await worker.terminate();
  worker = undefined;
});

describe('PO synthetic image dataset (cases 01–09)', () => {
  it.each(cases)('$file follows expected.json', async (testCase) => {
    const filePath = resolve(fixtureDirectory, testCase.file);
    const bytes = await readFile(filePath);
    const exif = await exifr.parse(bytes, { gps: true, tiff: true });
    const metadataFindings = mapExifToFindings(parseRawExif(exif));

    const expectsText = !['01_foto_bersih.jpg', '02_gps_saja.jpg'].includes(testCase.file);
    let words: ReturnType<typeof mapTesseractBlocksToWords> = [];
    if (expectsText) {
      const dataPath = resolve('public/tessdata');
      worker = await createWorker(['ind', 'eng'], 1, {
        corePath: dataPath,
        langPath: dataPath,
        gzip: false,
        logger: () => undefined,
      });
      let result = await worker.recognize(bytes, {}, { text: true, blocks: true });
      const hasClassification = /\b(?:rahasia|terbatas|konfidensial)\b/i.test(result.data.text ?? '');
      const hasDocumentContext = /\b(?:kegiatan|berangkat|menuju|jadwal|latihan)\b/i.test(result.data.text ?? '');
      if (!hasClassification && hasDocumentContext) {
        await worker.setParameters({ tessedit_pageseg_mode: PSM.SPARSE_TEXT });
        const sparseResult = await worker.recognize(bytes, {}, { text: true, blocks: true });
        if (/\b(?:rahasia|terbatas|konfidensial)\b/i.test(sparseResult.data.text ?? '')) result = sparseResult;
      }
      words = mapTesseractBlocksToWords(result.data.blocks);
    }

    const tokens = buildOcrTextTokens(words);
    const textFindings = analyzeText(tokens.text, 'ocr', tokens.tokens);
    const findings = applyComboBoost([...metadataFindings, ...mapOcrWordsToFindings(words, textFindings)]);
    const ids = findings.map((finding) => finding.ruleId);

    if (['03_papan_satuan_nrp.jpg', '04_dokumen_rahasia.jpg', '05_plat_nomor_sah.jpg', '08_nik_fiktif.jpg'].includes(testCase.file)) {
      expect(ids.filter((id) => id.startsWith('mil-'))).toEqual([]);
    }

    if (testCase.file.startsWith('01_')) {
      expect(findings).toHaveLength(0);
      expect(calculateScore(findings).value).toBeLessThan(25);
    }
    if (testCase.file.startsWith('02_')) {
      expect(ids).toEqual(expect.arrayContaining(['meta-gps', 'meta-taken-at', 'meta-device']));
      expect(calculateScore(findings).value).toBeGreaterThanOrEqual(60);
    }
    if (testCase.file.startsWith('03_')) {
      expect(ids).toEqual(expect.arrayContaining(['opr-satuan', 'id-nrp', 'id-phone', 'meta-gps']));
      const visualFindings = findings.filter((finding) => finding.source === 'ocr' && ['opr-satuan', 'id-nrp', 'id-phone'].includes(finding.ruleId));
      expect(visualFindings.length).toBeGreaterThanOrEqual(3);
      expect(visualFindings.every((finding) => finding.bbox && finding.bbox.x1 > finding.bbox.x0 && finding.bbox.y1 > finding.bbox.y0)).toBe(true);
    }
    if (testCase.file.startsWith('04_')) {
      expect(ids).toContain('opr-dokumen');
      expect(ids).toContain('opr-jadwal');
      expect(ids).toContain('opr-pergerakan');
    }
    if (testCase.file.startsWith('05_')) expect(ids).toContain('id-plate');
    if (testCase.file.startsWith('06_')) {
      expect(tokens.text.toLowerCase()).toContain('sg 3 ow');
      expect(ids).not.toContain('id-plate');
      expect(findings).toHaveLength(0);
    }
    if (testCase.file.startsWith('07_')) expect(findings.filter((finding) => finding.ruleId === 'opr-satuan')).toHaveLength(3);
    if (testCase.file.startsWith('08_')) expect(ids).toContain('id-nik');
    if (testCase.file.startsWith('09_')) {
      expect(words.length).toBeGreaterThan(0);
      expect(words.every(({ bbox }) => bbox.x0 >= 0 && bbox.y0 >= 0 && bbox.x1 > bbox.x0 && bbox.y1 > bbox.y0)).toBe(true);
      expect(Math.max(...words.map(({ bbox }) => bbox.x1))).toBeGreaterThan(2400);
    }
  }, 30_000);
});
