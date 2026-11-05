import type { Category, Severity, Source } from '../types';

const SEVERITY_LABELS: Record<Severity, string> = {
  critical: 'Kritis',
  high: 'Tinggi',
  medium: 'Sedang',
  low: 'Rendah',
  info: 'Info',
};

const SOURCE_LABELS: Record<Source, string> = {
  metadata: 'Metadata',
  ocr: 'OCR',
  caption: 'Keterangan',
  correction: 'Dari teks koreksi',
  combo: 'Gabungan',
};

const CATEGORY_LABELS: Record<Category, string> = {
  lokasi: 'Lokasi', identitas: 'Identitas', operasional: 'Operasional', teknis: 'Teknis',
};

export function getSeverityLabel(severity: Severity): string {
  return SEVERITY_LABELS[severity];
}

export function getFindingSourceLabel(source: Source): string {
  return SOURCE_LABELS[source];
}

export function getFindingCategoryLabel(category: Category): string {
  return CATEGORY_LABELS[category];
}
