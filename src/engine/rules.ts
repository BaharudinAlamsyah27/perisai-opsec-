import type { Finding, Source, Severity, Category } from '../types';
import kamusSatuan from '../data/kamus-satuan.json';
import kamusLokasi from '../data/kamus-lokasi.json';
import kamusPergerakan from '../data/kamus-pergerakan.json';
import kamusJadwal from '../data/kamus-jadwal.json';
import aturanIdentitas from '../data/aturan-identitas.json';
import klasifikasiDokumen from '../data/klasifikasi-dokumen.json';
import kamusKonteksMiliter from '../data/kamus-konteks-militer.json';
import aturanTeknis from '../data/aturan-teknis.json';
import type { OcrWord } from '../types';
import type { DikEntry } from './dik';

export const MIN_OCR_WORD_CONFIDENCE = 70;
export const PUBLIC_CONTEXT_REASON = 'Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.';

export function isPublicContextFinding(finding: Finding): boolean {
  return finding.reason === PUBLIC_CONTEXT_REASON;
}

export function isContextOnlyFindings(findings: Finding[]): boolean {
  return findings.length > 0 && findings.every(isPublicContextFinding);
}

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

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const TECHNICAL_PATTERNS: Record<string, RegExp> = {
  ipv4: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  email: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi,
  'internal-host': /\b(?:[A-Z0-9-]+\.(?:local|internal)|intranet|localhost)(?::\d{1,5})?\b|\b(?:localhost|intranet)(?::\d{1,5})?\b|\b[a-z][a-z0-9.-]*:\d{1,5}\b/gi,
  password: /\b(?:password|passwd|pwd|pass|kata\s+sandi|sandi)\s*[:=]\s*([^\s,;]+)/gi,
  token: /\b(?:api[_ -]?key|token|secret|bearer)\s*[:=]\s*([A-Z0-9._~+/-]{8,})/gi,
  ssh: /\bssh\s+[a-z0-9._-]+@[a-z0-9.-]+\b/gi,
  'map-link': /\b(?:https?:\/\/)?(?:maps\.app\.goo\.gl|goo\.gl\/maps|google\.com\/maps|maps\.google(?:\.[a-z.]+)?|waze\.com\/ul|openstreetmap\.org|bing\.com\/maps)\S*/gi,
  'decimal-coordinate': /(?<![\d.])(-?\d{1,2}\.\d{4,})\s*[,;/ ]\s*(-?\d{1,3}\.\d{4,})(?![\d.])/g,
  'dms-coordinate': /\b(\d{1,2})\s*°\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]?\s*([NS])\s*[,;/ ]+\s*(\d{1,3})\s*°\s*(\d{1,2})\s*['′]\s*(\d{1,2}(?:\.\d+)?)\s*["″]?\s*([EW])\b/gi,
  'location-hint': /📍|\bcheck[ -]?in\b|\blokasi\s*:|\bposisi\b|\btitik\s+kumpul\b|\bshare\s+loc\b/gi,
};

function maskSecret(value: string): string {
  const firstTwo = value.slice(0, 2);
  return `${firstTwo}••••`;
}

export function redactTechnicalSecrets(text: string): string {
  let output = text;
  for (const type of ['password', 'token']) {
    output = output.replace(TECHNICAL_PATTERNS[type], (whole, value: string) => whole.replace(value, maskSecret(value)));
  }
  return output;
}

function validIpv4(value: string): boolean {
  const octets = value.split('.').map(Number);
  return octets.length === 4 && octets.every((octet) => Number.isInteger(octet) && octet >= 0 && octet <= 255);
}

function technicalSeverity(type: string, value: string): Severity | null {
  if (type === 'ipv4') {
    if (!validIpv4(value) || value === '0.0.0.0' || value.startsWith('127.')) return null;
    const [a, b] = value.split('.').map(Number);
    return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) ? 'high' : 'medium';
  }
  if (type === 'email') return /\.(?:mil|go)\.id$/i.test(value.split('@')[1] ?? '') ? 'high' : 'medium';
  return (aturanTeknis.find((rule) => rule.type === type) as { severity?: Severity } | undefined)?.severity ?? null;
}

/**
 * Pure function: takes text (from caption or OCR), runs opsec detection rules,
 * and returns deterministic Finding[] array.
 */
export function analyzeText(text: string, source: Source, ocrTokens?: OcrTextToken[], dikEntries: DikEntry[] = []): Finding[] {
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
    const termPattern = term.split('').map((char) => char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[-_]?');
    // Match either standalone word or followed by optional space/numbers
    const regex = new RegExp(`\\b${termPattern}(?:\\s*\\d{1,4}[a-z]*)?\\b`, 'gi');
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

  // 3. Istilah Fasilitas / Lokasi. Generic "perbatasan" is medium; named facilities remain high.
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
        severity: loc === 'perbatasan' ? 'medium' : loc === 'sektor' ? 'low' : 'high',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: loc === 'perbatasan' || loc === 'sektor'
          ? PUBLIC_CONTEXT_REASON
          : `Istilah fasilitas atau instalasi pertahanan '${match[0]}' teridentifikasi.`,
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
        severity: ['operasi', 'satgas', 'penugasan', 'patroli', 'pengamanan'].includes(mov) ? 'low' : 'medium',
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: ['operasi', 'satgas', 'penugasan', 'patroli', 'pengamanan'].includes(mov)
          ? PUBLIC_CONTEXT_REASON
          : `Kata kunci kegiatan/pergerakan '${match[0]}' terdeteksi; periksa apakah kegiatan ini sudah diumumkan resmi.`,
        recommendation: 'Hindari membagikan status keberangkatan, rute, atau pola pergerakan pasukan.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  for (const context of kamusKonteksMiliter) {
    const normalizedTerm = normalizeText(context.term);
    const termPattern = normalizedTerm.split(' ').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+');
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${termPattern}(?![\\p{L}\\p{N}])`, 'giu');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      findings.push({
        id: nextId(context.id),
        ruleId: context.id,
        category: context.category as Category,
        severity: context.severity as Severity,
        source,
        evidence: source !== 'ocr' ? match[0] : `${match[0]} (keyakinan ${confidence}%)`,
        reason: context.severity === 'info'
          ? context.reason
          : PUBLIC_CONTEXT_REASON,
        recommendation: context.severity === 'info'
          ? 'Hindari menambah rincian kegiatan atau lokasi yang belum layak dipublikasikan.'
          : 'Tinjau dan samarkan rincian operasional yang belum diumumkan secara resmi.',
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

  for (const [entryIndex, entry] of dikEntries.entries()) {
    const normalizedTerm = normalizeText(entry.term);
    if (!normalizedTerm) continue;
    const termPattern = normalizedTerm.split(' ').map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('[\\s_-]+');
    const regex = new RegExp(`(?<![\\p{L}\\p{N}])${termPattern}(?![\\p{L}\\p{N}])`, 'giu');
    let match;
    while ((match = regex.exec(text)) !== null) {
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      const category: Category = entry.kind === 'satuan' || entry.kind === 'kegiatan'
        ? 'operasional' : entry.kind === 'lokasi' ? 'lokasi' : 'identitas';
      const ruleSuffix = entryIndex + 1;
      findings.push({
        id: nextId(`dik-${entry.kind}-${ruleSuffix}`),
        ruleId: `dik-${entry.kind}-${ruleSuffix}`,
        category,
        severity: entry.severity ?? 'high',
        source,
        evidence: source === 'ocr' ? `${match[0]} (keyakinan ${confidence}%)` : match[0],
        reason: entry.catatan ? `Informasi ini tercantum dalam Daftar Informasi Kritis satuan. ${entry.catatan}` : 'Istilah ini ditandai sebagai informasi kritis oleh satuan.',
        recommendation: 'Hapus atau samarkan istilah yang tercantum dalam Daftar Informasi Kritis sebelum membagikan konten.',
        range: { start: match.index, end: match.index + match[0].length },
      });
    }
  }

  // Technical disclosures and implicit location clues, shared by OCR and captions.
  const technicalTypeByFindingId: Record<string, string> = {};
  for (const rule of aturanTeknis as Array<{ id: string; type: string; category: Category }>) {
    const regex = TECHNICAL_PATTERNS[rule.type];
    if (!regex) continue;
    regex.lastIndex = 0;
    let match: RegExpExecArray | null;
    while ((match = regex.exec(text)) !== null) {
      let captured = match[0];
      let start = match.index;
      let end = match.index + match[0].length;
      if (rule.type === 'password' || rule.type === 'token') {
        const capturedValue = match[1] ?? '';
        const offset = match[0].lastIndexOf(capturedValue);
        start = match.index + Math.max(0, offset);
        end = start + capturedValue.length;
        captured = capturedValue;
      }
      if (rule.type === 'ipv4' && !validIpv4(captured)) continue;
      if (rule.type === 'decimal-coordinate') {
        const latitude = Number(match[1]);
        const longitude = Number(match[2]);
        if (Math.abs(latitude) > 90 || Math.abs(longitude) > 180) continue;
      }
      if (rule.type === 'dms-coordinate') {
        const latitude = Number(match[1]);
        const longitude = Number(match[5]);
        const minutes = [Number(match[2]), Number(match[6])];
        const seconds = [Number(match[3]), Number(match[7])];
        if (latitude > 90 || longitude > 180 || minutes.some((value) => value >= 60) || seconds.some((value) => value >= 60)
          || (latitude === 90 && (minutes[0] !== 0 || seconds[0] !== 0))
          || (longitude === 180 && (minutes[1] !== 0 || seconds[1] !== 0))) continue;
      }
      const confidence = confidenceForRange(match.index, match.index + match[0].length);
      if (!shouldAcceptOcrRange(confidence)) continue;
      const severity = technicalSeverity(rule.type, captured);
      if (!severity) continue;
      const findingId = nextId(rule.id);
      const isSecret = rule.type === 'password' || rule.type === 'token';
      const evidenceText = isSecret ? `${maskSecret(captured)} (disamarkan)` : captured;
      const technicalFinding: Finding = {
        id: findingId,
        ruleId: rule.id,
        category: rule.category,
        severity,
        source,
        evidence: source === 'ocr' ? `${evidenceText} (keyakinan ${confidence}%)` : evidenceText,
        reason: rule.type === 'location-hint'
          ? 'Petunjuk lokasi atau check-in dapat memperjelas keberadaan pengguna.'
          : rule.type === 'password' || rule.type === 'token'
            ? 'Nilai akses yang diberi label terdeteksi; bukti disamarkan demi keamanan.'
            : rule.type === 'map-link' || rule.type.includes('coordinate')
              ? 'Tautan atau koordinat lokasi tertulis dapat mengungkap posisi.'
              : 'Informasi teknis atau identitas kontak terdeteksi dalam teks.',
        recommendation: isSecret
          ? 'Hapus nilai akses dari gambar atau caption dan segera rotasi kredensial jika nilai tersebut nyata.'
          : rule.type === 'location-hint' || rule.type.includes('coordinate') || rule.type === 'map-link'
            ? 'Hapus tautan, koordinat, atau petunjuk lokasi sebelum membagikan konten.'
            : 'Hapus atau samarkan informasi teknis dari gambar atau caption.',
        range: { start, end },
      };
      technicalTypeByFindingId[findingId] = rule.type;
      findings.push(technicalFinding);
      if (regex.lastIndex === match.index) regex.lastIndex++;
    }
  }

  const realtimeMatch = /\b(?:lagi\s+di|sekarang\s+di|live)\b/gi;
  let realtime: RegExpExecArray | null;
  while ((realtime = realtimeMatch.exec(text)) !== null) {
    const tail = text.slice(realtime.index + realtime[0].length, realtime.index + realtime[0].length + 100);
    const fixedLocation = kamusLokasi.find((term) => new RegExp(`\\b${escapeRegExp(term)}\\b`, 'i').test(tail));
    if (!fixedLocation) continue;
    const end = realtime.index + realtime[0].length + (tail.match(new RegExp(`\\b${fixedLocation}\\b`, 'i'))?.index ?? 0) + fixedLocation.length;
    const confidence = confidenceForRange(realtime.index, end);
    if (!shouldAcceptOcrRange(confidence)) continue;
    findings.push({
      id: nextId('location-realtime'), ruleId: 'location-realtime', category: 'lokasi', severity: 'medium', source,
      evidence: source === 'ocr' ? `${text.slice(realtime.index, end)} (keyakinan ${confidence}%)` : text.slice(realtime.index, end),
      reason: 'Frasa waktu nyata digabung dengan petunjuk lokasi tetap dapat mengungkap keberadaan saat ini.',
      recommendation: 'Hapus petunjuk waktu nyata dan lokasi sebelum mengunggah.', range: { start: realtime.index, end },
    });
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
