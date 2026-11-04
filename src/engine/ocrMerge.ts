import type { OcrWord } from '../types';

export const OCR_PASS_NAMES = [
  'gambar asli · PSM otomatis',
  'grayscale + kontras · PSM otomatis',
  'gambar terbalik · PSM 11',
] as const;

export function mergeUniqueOcrWords(passes: OcrWord[][]): OcrWord[] {
  const merged: OcrWord[] = [];
  for (const word of passes.flat()) {
    const normalized = word.text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '');
    if (!normalized) continue;
    const area = Math.max(1, (word.bbox.x1 - word.bbox.x0) * (word.bbox.y1 - word.bbox.y0));
    const duplicateIndex = merged.findIndex((existing) => {
      if (existing.text.toLocaleLowerCase().replace(/[^\p{L}\p{N}]/gu, '') !== normalized) return false;
      const intersectionWidth = Math.max(0, Math.min(existing.bbox.x1, word.bbox.x1) - Math.max(existing.bbox.x0, word.bbox.x0));
      const intersectionHeight = Math.max(0, Math.min(existing.bbox.y1, word.bbox.y1) - Math.max(existing.bbox.y0, word.bbox.y0));
      return (intersectionWidth * intersectionHeight) / area >= 0.25;
    });
    if (duplicateIndex < 0) merged.push(word);
    else if (word.conf > merged[duplicateIndex].conf) merged[duplicateIndex] = word;
  }
  return merged.sort((a, b) => {
    const rowDelta = (a.bbox.y0 + a.bbox.y1) - (b.bbox.y0 + b.bbox.y1);
    return Math.abs(rowDelta) > 18 ? rowDelta : a.bbox.x0 - b.bbox.x0;
  });
}
