import { describe, expect, it } from 'vitest';
import { mapTesseractBlocksToWords } from '../../src/engine/ocrWords';

describe('mapTesseractBlocksToWords', () => {
  it('reads nested Tesseract v7 blocks and scales word bounding boxes', () => {
    const words = mapTesseractBlocksToWords([
      { paragraphs: [{ lines: [{ words: [
        { text: ' POS ', confidence: 96, bbox: { x0: 10, y0: 20, x1: 40, y1: 50 } },
        { text: 'YONIF', confidence: 88, bbox: { x0: 50, y0: 20, x1: 90, y1: 50 } },
      ] }] }] },
    ], 2, 3);

    expect(words).toEqual([
      { text: 'POS', conf: 96, bbox: { x0: 20, y0: 60, x1: 80, y1: 150 } },
      { text: 'YONIF', conf: 88, bbox: { x0: 100, y0: 60, x1: 180, y1: 150 } },
    ]);
  });

  it('returns no words for missing blocks and drops whitespace-only words', () => {
    expect(mapTesseractBlocksToWords(null)).toEqual([]);
    expect(mapTesseractBlocksToWords([{ paragraphs: [{ lines: [{ words: [{ text: ' ' }] }] }] }])).toEqual([]);
  });
});
