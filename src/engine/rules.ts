import type { Finding, Source, Severity, Category } from '../types';
import kamusSatuan from '../data/kamus-satuan.json';
import kamusLokasi from '../data/kamus-lokasi.json';
import kamusPergerakan from '../data/kamus-pergerakan.json';
import kamusJadwal from '../data/kamus-jadwal.json';
import aturanIdentitas from '../data/aturan-identitas.json';
import klasifikasiDokumen from '../data/klasifikasi-dokumen.json';
import type { OcrWord } from '../types';

export const MIN_OCR_WORD_CONFIDENCE = 70;

export interface OcrTextToken {
  text: string;
  confidence: number;
  start: number;
  end: number;
}

export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/[-_]+/g, ' ') // treat hyphens/underscores as space for matching
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Pure function: takes text (from caption or OCR), runs opsec detection rules,
 * and returns deterministic Finding[] array.
 */
export function analyzeText(text: string, source: Source, ocrTokens?: OcrTextToken[]): Finding[] {
  if (!text || text.trim().length === 0) {
    return [];
  }

  const findings: Finding[] = [];

  let findingCounter = 0;
  const nextId = (rule: string) => `${source}-${rule}-${findingCounter++}`;
  const validOcrTokens = source === 'ocr' ? ocrTokens ?? tokenizePlainOcrText(text) : [];
  const confidenceForRange = (start: number, end: number): number | undefined => {
    if (source !== 'ocr') return undefined;
    const overlapping = validOcrTokens.filter((token) => token.start < end && token.end > start);
    if (overlapping.length === 0 || overlapping.some((token) => token.confidence < MIN_OCR_WORD_CONFIDENCE)) return Number.NaN;
    return Math.round(overlapping.reduce((sum, token) => sum + token.confidence, 0) / overlapping.length);
  };

  const shouldAcceptOcrRange = (confidence: number | undefined) =>
    source !== 'ocr' || (confidence !== undefined && Number.isFinite(confidence));

  // 1. Dokumen Klasifikasi (Critical/High)
  for (const doc of klasifikasiDokumen) {
    const term = doc.term.toLowerCase();
    // Word boundary match
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-dokumen'),
        ruleId: 'opr-dokumen',
        category: 'operasional',
        severity: doc.severity as Severity,
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: doc.reason,
        recommendation: 'Dilarang keras menyebarkan atau menampilkan dokumen berklasifikasi ke ranah publik.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // 2. Satuan / Kesatuan (High)
  // Bisa berupa nama satuan langsung atau pola seperti "yonif 999", "kodim 0501"
  for (const satuan of kamusSatuan) {
    const term = satuan.toLowerCase();
    // Match either standalone word or followed by optional space/numbers
    const regex = new RegExp(`\\b${term}(?:\\s*\\d{1,4}[a-z]*)?\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-satuan'),
        ruleId: 'opr-satuan',
        category: 'operasional',
        severity: 'high',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: `Nama satuan militer '${match[0]}' terdeteksi. Menyebut satuan dapat mengungkap formasi atau identitas unit dinas.`,
        recommendation: 'Hapus atau samarkan penyebutan nama satuan spesifik dalam unggahan.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // 3. Istilah Fasilitas / Lokasi (High)
  for (const loc of kamusLokasi) {
    const term = loc.toLowerCase();
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-fasilitas'),
        ruleId: 'opr-fasilitas',
        category: 'lokasi',
        severity: 'high',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: `Istilah fasilitas atau instalasi pertahanan '${match[0]}' teridentifikasi.`,
        recommendation: 'Jangan mencantumkan nama atau jenis instalasi dinas dan pos pertahanan.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // 4. Pergerakan Pasukan / Operasional (Medium)
  for (const mov of kamusPergerakan) {
    const term = mov.toLowerCase();
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-pergerakan'),
        ruleId: 'opr-pergerakan',
        category: 'operasional',
        severity: 'medium',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: `Kata kunci pergerakan militer '${match[0]}' terdeteksi. Berpotensi membuka dinamika kegiatan personel.`,
        recommendation: 'Hindari membagikan status keberangkatan, rute, atau pola pergerakan pasukan.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // 5. Waktu & Jadwal Rencana (Medium)
  for (const timeWord of kamusJadwal) {
    const term = timeWord.toLowerCase();
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-jadwal'),
        ruleId: 'opr-jadwal',
        category: 'operasional',
        severity: 'medium',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: `Kata penunjuk waktu operasional '${match[0]}' terdeteksi.`,
        recommendation: 'Jangan umumkan jadwal atau waktu rencana kegiatan militer sebelum pelaksanaan tuntas.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // Pola jam realistis seperti "05.00" atau "05:00" atau "jam 5 pagi"
  const timePattern = /\b(?:jam|pukul)?\s*(?:[01]?[0-9]|2[0-3])[:.][0-5][0-9]\b/gi;
  let timeMatch;
  while ((timeMatch = timePattern.exec(text)) !== null) {
    // Hindari duplikasi jika sudah terdeteksi di atas
    const matchedStr = timeMatch[0];
    const exists = findings.some(
      (f) => f.ruleId === 'opr-jadwal' && f.range?.start === timeMatch!.index
    );
    if (!exists) {
      const confidence = confidenceForRange(timeMatch.index, timeMatch.index + matchedStr.length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId('opr-jadwal'),
        ruleId: 'opr-jadwal',
        category: 'operasional',
        severity: 'medium',
        source,
        evidence: source !== 'ocr' ? matchedStr : `${matchedStr} (keyakinan ${confidence}%)`,
        reason: `Spesifikasi waktu / jam '${matchedStr}' terdeteksi di dalam pesan.`,
        recommendation: 'Hapus detail jam atau waktu rencana pergerakan dari teks publik.',
        range: { start: timeMatch.index, end: timeMatch.index + matchedStr.length },
      });
    }
  }

  // 6. Aturan Identitas (NIK, NRP, Telepon, Plat Nomor, Alamat)
  for (const rule of aturanIdentitas) {
    const regex = new RegExp(rule.pattern, rule.id === 'id-plate' ? 'g' : 'gi');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      // Validasi konteks tambahan jika diperlukan
      if (rule.id === 'id-plate') {
        // Kapital wajib dan pola dibatasi pada satu/dua huruf, angka, lalu kode huruf.
        if (!/^[A-Z]{1,2}\s*\d{1,4}\s*[A-Z]{1,3}$/.test(match[0])) continue;
      }

      findings.push({
        id: nextId(rule.id),
        ruleId: rule.id,
        category: rule.category as Category,
        severity: rule.severity as Severity,
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: rule.reason,
        recommendation: rule.recommendation,
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  return findings;
}

function tokenizePlainOcrText(text: string): OcrTextToken[] {
  const tokens: OcrTextToken[] = [];
  const regex = /\S+/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    tokens.push({ text: match[0], confidence: 100, start: match.index, end: match.index + match[0].length });
  }
  return tokens;
}

export function buildOcrTextTokens(words: OcrWord[]): { text: string; tokens: OcrTextToken[] } {
  let text = '';
  const tokens = words.map((word) => {
    const start = text.length;
    text += `${text ? ' ' : ''}${word.text}`;
    const actualStart = start + (start > 0 ? 1 : 0);
    return { text: word.text, confidence: word.conf, start: actualStart, end: actualStart + word.text.length };
  });
  return { text, tokens };
}
