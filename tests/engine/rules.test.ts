import { describe, it, expect } from 'vitest';
import { analyzeText, buildOcrTextTokens, MIN_OCR_WORD_CONFIDENCE, normalizeText } from '../../src/engine/rules';
import { mapOcrWordsToFindings } from '../../src/engine/ocr-mapper';
import { applyComboBoost } from '../../src/engine/combos';
import { calculateScore } from '../../src/engine/scoring';

describe('Rules Engine (Pure Function)', () => {
  it('normalizes text properly (lowercasing, diacritics, extra spaces)', () => {
    const raw = '  YON-IF   999  Élite  ';
    expect(normalizeText(raw)).toBe('yon if 999 elite');
  });

  it('detects military unit (satuan) - positive test', () => {
    const text = 'Kami dari Yonif 999 sedang bertugas';
    const findings = analyzeText(text, 'caption');
    const satuan = findings.find((f) => f.ruleId === 'opr-satuan');
    expect(satuan).toBeDefined();
    expect(satuan?.evidence.toLowerCase()).toContain('yonif');
    expect(satuan?.severity).toBe('high');
  });

  it('ignores text without military unit - negative test', () => {
    const text = 'Hari ini cuaca cerah di taman kota.';
    const findings = analyzeText(text, 'caption');
    expect(findings.find((f) => f.ruleId === 'opr-satuan')).toBeUndefined();
  });

  it('detects classified document stamps (RAHASIA/TERBATAS)', () => {
    const text = 'Dokumen RAHASIA jangan disebar';
    const findings = analyzeText(text, 'ocr');
    const doc = findings.find((f) => f.ruleId === 'opr-dokumen');
    expect(doc).toBeDefined();
    expect(doc?.severity).toBe('critical');
  });

  it('detects movement and schedule in realistic caption test', () => {
    const caption = 'Besok jam 05.00 berangkat ke pos perbatasan bersama Yonif 999';
    const findings = analyzeText(caption, 'caption');

    const ruleIds = findings.map((f) => f.ruleId);
    expect(ruleIds).toContain('opr-jadwal');
    expect(ruleIds).toContain('opr-pergerakan');
    expect(ruleIds).toContain('opr-fasilitas');
    expect(ruleIds).toContain('opr-satuan');
    expect(applyComboBoost(findings).some((finding) => finding.ruleId === 'combo-pola-penugasan')).toBe(true);
  });

  it('produces 0 findings for safe text', () => {
    const safeCaption = 'Selamat pagi, semangat!';
    const findings = analyzeText(safeCaption, 'caption');
    expect(findings).toHaveLength(0);
  });

  it('detects military context terms conservatively and leaves safe text without findings', () => {
    const text = 'PEMBUKAAN OPERASI TERITORIAL TENTARA NASIONAL INDONESIA di wilayah perbatasan dan rawan konflik';
    const findings = analyzeText(text, 'caption');
    const ruleIds = findings.map((finding) => finding.ruleId);
    expect(ruleIds).toContain('opr-pergerakan');
    expect(ruleIds).toContain('mil-teritorial');
    expect(ruleIds).toContain('opr-fasilitas');
    expect(ruleIds).toContain('mil-rawan-konflik');
    expect(ruleIds).toContain('mil-tentara-nasional-indonesia');
    const tniMarker = analyzeText('TNI', 'caption').find((finding) => finding.ruleId === 'mil-tni');
    expect(tniMarker?.severity).toBe('info');
    expect(tniMarker?.reason).toContain('periksa apakah kegiatan ini sudah diumumkan resmi');
    expect(calculateScore(tniMarker ? [tniMarker] : []).value).toBe(0);
    expect(analyzeText('Selamat pagi, semangat!', 'caption')).toHaveLength(0);
  });

  it('scores public military context lightly and leaves ceremonial text risk-free', () => {
    const contextText = 'PEMBUKAAN OPERASI TERITORIAL TENTARA NASIONAL INDONESIA MELALUI OPERASI TERITORIAL KITA INGKATKAN SERBUAN TERITORIAL DI WILAYAH PERBATASAN & RAWAN KONFLIK UNTUK MENINGKATKAN KEAMANAN';
    const findings = analyzeText(contextText, 'caption');
    const scored = calculateScore(findings);
    expect(findings.length).toBeGreaterThanOrEqual(3);
    expect(findings.some((finding) => finding.severity === 'critical')).toBe(false);
    expect(findings.filter((finding) => finding.severity !== 'info').every((finding) => finding.reason === 'Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.')).toBe(true);
    expect(scored.value).toBeGreaterThanOrEqual(20);
    expect(scored.value).toBeLessThanOrEqual(35);

    const ceremonial = analyzeText('Dirgahayu TNI 5 Oktober 2021', 'caption');
    expect(calculateScore(ceremonial).value).toBe(0);
    expect(ceremonial.filter((finding) => finding.severity !== 'info')).toHaveLength(0);
  });

  it('assigns the requested light weights and publication-review reason to public activity terms', () => {
    for (const term of ['operasi', 'teritorial', 'rawan konflik', 'satgas', 'penugasan', 'patroli', 'pengamanan']) {
      const finding = analyzeText(term, 'caption').find((item) => item.reason === 'Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.');
      expect(finding, term).toBeDefined();
      expect(finding?.severity, term).toBe('low');
    }
    const border = analyzeText('perbatasan', 'caption').find((item) => item.ruleId === 'opr-fasilitas');
    expect(border?.severity).toBe('medium');
    for (const marker of ['TNI', 'Tentara Nasional Indonesia', 'Dirgahayu']) {
      const markerFindings = analyzeText(marker, 'caption');
      expect(markerFindings.every((finding) => finding.severity === 'info'), marker).toBe(true);
      expect(calculateScore(markerFindings).value, marker).toBe(0);
    }
  });

  it('detects 16 digit NIK - positive test', () => {
    const text = 'NIK saya adalah 3201234567890123 untuk pendaftaran';
    const findings = analyzeText(text, 'caption');
    const nikFinding = findings.find((f) => f.ruleId === 'id-nik');
    expect(nikFinding).toBeDefined();
    expect(nikFinding?.evidence).toBe('3201234567890123');
  });

  it('ignores numbers that are not 16 digits - negative test for NIK', () => {
    const text = 'Nomor urut peserta 12345 dan tiket 987654321';
    const findings = analyzeText(text, 'caption');
    expect(findings.find((f) => f.ruleId === 'id-nik')).toBeUndefined();
  });

  it('detects labeled NRP - positive test', () => {
    const text = 'Identitas: NRP 1122334455 tertera di seragam';
    const findings = analyzeText(text, 'ocr');
    const nrpFinding = findings.find((f) => f.ruleId === 'id-nrp');
    expect(nrpFinding).toBeDefined();
    expect(nrpFinding?.evidence.toLowerCase()).toContain('nrp');
  });

  it('detects Indonesian cellphone numbers (+62 or 08)', () => {
    const text = 'Hubungi 081234567890 untuk info';
    const findings = analyzeText(text, 'caption');
    const phoneFinding = findings.find((f) => f.ruleId === 'id-phone');
    expect(phoneFinding).toBeDefined();
    expect(phoneFinding?.evidence).toBe('081234567890');
  });

  it('rejects a blurred OCR plate false positive and accepts valid uppercase plate formats', () => {
    const rejected = analyzeText('SG 3 ow', 'ocr');
    expect(rejected.find((finding) => finding.ruleId === 'id-plate')).toBeUndefined();

    for (const plate of ['AD 1234 XY', 'B 123 ABC']) {
      const findings = analyzeText(plate, 'ocr');
      const finding = findings.find((item) => item.ruleId === 'id-plate');
      expect(finding).toBeDefined();
      expect(finding?.evidence).toContain('keyakinan 100%');
    }
  });

  it('requires every OCR token to meet the configurable confidence threshold for high severity rules', () => {
    expect(MIN_OCR_WORD_CONFIDENCE).toBe(70);
    const source = 'POS JAGA YONIF 999';
    const tokens = buildOcrTextTokens([
      { text: 'POS', conf: 48, bbox: { x0: 1, y0: 1, x1: 20, y1: 20 } },
      { text: 'JAGA', conf: 48, bbox: { x0: 22, y0: 1, x1: 60, y1: 20 } },
      { text: 'YONIF', conf: 48, bbox: { x0: 62, y0: 1, x1: 110, y1: 20 } },
      { text: '999', conf: 90, bbox: { x0: 112, y0: 1, x1: 140, y1: 20 } },
    ]);
    expect(tokens.text).toBe(source);
    const findings = analyzeText(tokens.text, 'ocr', tokens.tokens);
    expect(findings.find((finding) => finding.ruleId === 'opr-satuan')).toBeUndefined();
    expect(findings.find((finding) => finding.ruleId === 'opr-fasilitas')).toBeUndefined();
  });

  it('adds average OCR confidence to evidence and maps bounding boxes only from confident words', () => {
    const words = [
      { text: 'AD', conf: 80, bbox: { x0: 0, y0: 0, x1: 20, y1: 10 } },
      { text: '1234', conf: 90, bbox: { x0: 21, y0: 0, x1: 45, y1: 10 } },
      { text: 'XY', conf: 88, bbox: { x0: 46, y0: 0, x1: 65, y1: 10 } },
    ];
    const ocrText = buildOcrTextTokens(words);
    const finding = analyzeText(ocrText.text, 'ocr', ocrText.tokens).find((item) => item.ruleId === 'id-plate');
    expect(finding?.evidence).toContain('keyakinan 86%');

    const mapped = mapOcrWordsToFindings(words, finding ? [finding] : []);
    expect(mapped[0]?.bbox).toEqual({ x0: 0, y0: 0, x1: 65, y1: 10 });
    expect(mapOcrWordsToFindings([{ ...words[0], conf: 20 }], finding ? [finding] : [])[0]?.bbox).toBeUndefined();
  });

  it('matches DIK terms case-insensitively with spacing and hyphen normalization and maps kinds to categories', () => {
    const entries = [
      { id: 'u-1', term: 'OPERASI CAKRAWALA', kind: 'kegiatan' as const, severity: 'critical' as const, catatan: 'Contoh.' },
      { id: 'u-2', term: 'Pos-Anggrek', kind: 'lokasi' as const, severity: 'high' as const, catatan: '' },
      { id: 'u-3', term: 'Sersan Fiktif', kind: 'personel' as const, severity: 'high' as const, catatan: '' },
      { id: 'u-4', term: 'KODE-73', kind: 'kode' as const, severity: 'high' as const, catatan: '' },
      { id: 'u-5', term: 'Kompi Contoh', kind: 'satuan' as const, severity: 'high' as const, catatan: '' },
    ];
    const findings = analyzeText('operasi-cakrawala POS anggrek SERSAN   FIKTIF kode 73 Kompi-Contohx', 'caption', undefined, entries);
    expect(findings.filter(({ ruleId }) => ruleId.startsWith('dik-')).map(({ ruleId, category }) => [ruleId.split('-')[1], category])).toEqual([
      ['kegiatan', 'operasional'], ['lokasi', 'lokasi'], ['personel', 'identitas'], ['kode', 'identitas'],
    ]);
    expect(findings.some(({ evidence }) => evidence.toLowerCase().includes('kompi'))).toBe(false);
  });

  it('lets a matching DIK term affect deterministic score and operational combo groups', () => {
    const entry = { id: 'latihan', term: 'Operasi Fiktif', kind: 'kegiatan' as const, severity: 'high' as const, catatan: '' };
    const dikFindings = analyzeText('Operasi-Fiktif', 'caption', undefined, [entry]);
    expect(dikFindings.some(({ ruleId }) => ruleId === 'dik-kegiatan-1')).toBe(true);
    expect(calculateScore(dikFindings, 'prajurit').value).toBeGreaterThan(0);
    const combined = applyComboBoost([
      ...dikFindings,
      { id: 'unit', ruleId: 'opr-satuan', category: 'operasional', severity: 'high', source: 'caption', evidence: 'Yonif', reason: 'r', recommendation: 'r' },
      { id: 'loc', ruleId: 'opr-fasilitas', category: 'lokasi', severity: 'high', source: 'caption', evidence: 'pos', reason: 'r', recommendation: 'r' },
    ]);
    expect(combined[0]?.ruleId).toBe('combo-pola-penugasan');
  });

  it('validates imported DIK JSON and returns friendly errors', async () => {
    const { validateDikEntries } = await import('../../src/engine/dik');
    expect(validateDikEntries([{ id: 'x', term: 'Istilah', kind: 'kode' }])).toEqual([
      { id: 'x', term: 'Istilah', kind: 'kode', severity: 'high', catatan: '' },
    ]);
    expect(() => validateDikEntries({ invalid: true })).toThrow('Format JSON harus berupa daftar entri DIK.');
    expect(() => validateDikEntries([{ id: 'x', term: '', kind: 'kode' }])).toThrow('istilah wajib diisi');
  });
});
