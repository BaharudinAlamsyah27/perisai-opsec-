import type { Severity } from '../types';

export type DikKind = 'satuan' | 'lokasi' | 'kegiatan' | 'personel' | 'kode';

export interface DikEntry {
  id: string;
  term: string;
  kind: DikKind;
  severity: Severity;
  catatan: string;
}

const KINDS = new Set<DikKind>(['satuan', 'lokasi', 'kegiatan', 'personel', 'kode']);
const SEVERITIES = new Set<Severity>(['info', 'low', 'medium', 'high', 'critical']);

export function validateDikEntries(value: unknown): DikEntry[] {
  if (!Array.isArray(value)) throw new Error('Format JSON harus berupa daftar entri DIK.');
  return value.map((item, index) => {
    if (!item || typeof item !== 'object') throw new Error(`Entri ke-${index + 1} tidak valid.`);
    const record = item as Record<string, unknown>;
    if (typeof record.id !== 'string' || !record.id.trim()) throw new Error(`Entri ke-${index + 1}: ID wajib diisi.`);
    if (typeof record.term !== 'string' || !record.term.trim()) throw new Error(`Entri ke-${index + 1}: istilah wajib diisi.`);
    if (typeof record.kind !== 'string' || !KINDS.has(record.kind as DikKind)) throw new Error(`Entri ke-${index + 1}: jenis tidak dikenal.`);
    if (record.severity !== undefined && (typeof record.severity !== 'string' || !SEVERITIES.has(record.severity as Severity))) {
      throw new Error(`Entri ke-${index + 1}: tingkat temuan tidak dikenal.`);
    }
    if (record.catatan !== undefined && typeof record.catatan !== 'string') throw new Error(`Entri ke-${index + 1}: catatan harus berupa teks.`);
    return {
      id: record.id.trim(),
      term: record.term.trim(),
      kind: record.kind as DikKind,
      severity: (record.severity as Severity | undefined) ?? 'high',
      catatan: (record.catatan as string | undefined) ?? '',
    };
  });
}

export const FICTIONAL_DIK_EXAMPLE: DikEntry[] = [
  { id: 'contoh-kegiatan', term: 'Latihan Cakrawala Fiktif', kind: 'kegiatan', severity: 'high', catatan: 'Nama kegiatan rekaan untuk contoh.' },
  { id: 'contoh-kode', term: 'KODE-LATIH-73', kind: 'kode', severity: 'critical', catatan: 'Kode latihan rekaan, bukan kode operasional.' },
];
