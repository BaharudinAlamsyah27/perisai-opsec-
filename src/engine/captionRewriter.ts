import type { Finding } from '../types';

export interface RewriteSuggestion {
  templateName: string;
  text: string;
  rationale: string;
}

/**
 * Generates safe rewritten templates from the original caption based on detected findings.
 * Follows TNI AD OPSEC discipline guidelines:
 * - Omits exact time, unit names, exact coordinates/locations, and upcoming movement status.
 * - Replaces with non-sensitive patriotic, morale-boosting, or post-activity expressions.
 */
export function generateSafeRewrites(originalText: string, findings: Finding[]): RewriteSuggestion[] {
  if (!originalText || originalText.trim().length === 0) {
    return [];
  }

  // If there are no findings, the caption is already safe
  if (findings.length === 0) {
    return [
      {
        templateName: 'Status Aman',
        text: originalText,
        rationale: 'Keterangan ini tidak mengandung unsur kebocoran OPSEC terdeteksi.',
      },
    ];
  }

  const suggestions: RewriteSuggestion[] = [];

  const hasMovement = findings.some((f) => f.ruleId === 'opr-pergerakan');
  const hasSchedule = findings.some((f) => f.ruleId === 'opr-jadwal');
  const hasSatuan = findings.some((f) => f.ruleId === 'opr-satuan');
  const hasFasilitas = findings.some((f) => f.ruleId === 'opr-fasilitas');

  // Template 1: Jiwa Korsa & Doa Penugasan Umum (Cocok untuk keluarga/prajurit)
  suggestions.push({
    templateName: 'Dukungan Moral & Semangat (Umum)',
    text: 'Semangat mengabdi untuk bangsa dan negara. Mohon doa restu selalu agar senantiasa diberikan kelancaran dan perlindungan. 🇮🇩✊',
    rationale: 'Menghilangkan nama satuan, jadwal tanggal/jam, dan rute lokasi spesifik. Aman dari pelacakan pihak luar.',
  });

  // Template 2: Pasca-Kegiatan (Past-tense / Dokumentasi)
  if (hasSchedule || hasMovement) {
    suggestions.push({
      templateName: 'Dokumentasi Pasca-Kegiatan',
      text: 'Kegiatan pengabdian berjalan dengan tertib dan lancar. Terus melangkah menjaga kedaulatan NKRI.',
      rationale: 'Mengubah pengumuman pergerakan masa depan (besok/lusa/jam) menjadi rekapan kegiatan umum tanpa rincian agenda.',
    });
  }

  // Template 3: Versi Disensor Otomatis (Redacted)
  let redacted = originalText;
  // Sort findings by start descending to replace accurately without index shift
  const sortedFindings = [...findings]
    .filter((f) => f.range)
    .sort((a, b) => (b.range?.start ?? 0) - (a.range?.start ?? 0));

  for (const f of sortedFindings) {
    if (f.range && f.range.start >= 0 && f.range.end <= redacted.length) {
      const before = redacted.slice(0, f.range.start);
      const after = redacted.slice(f.range.end);
      const mask = '[DISENSOR]';
      redacted = before + mask + after;
    }
  }

  if (redacted !== originalText) {
    suggestions.push({
      templateName: 'Sensor Otomatis (Redacted)',
      text: redacted,
      rationale: 'Menyensor kata-kata yang memicu kebocoran aturan secara langsung dari kalimat asli Anda.',
    });
  }

  // Template 4: Khusus Keluarga Prajurit (jika menyebut satuan/pos)
  if (hasSatuan || hasFasilitas) {
    suggestions.push({
      templateName: 'Persona Keluarga Prajurit',
      text: 'Doa terbaik untuk Ayah dalam menjalankan tugas negara. Kami bangga dan setia menanti di rumah. ❤️🇮🇩',
      rationale: 'Ungkapan cinta keluarga tanpa menyebutkan pangkalan militer atau kesatuan penugasan suami/ayah.',
    });
  }

  return suggestions;
}

