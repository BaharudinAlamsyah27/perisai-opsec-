import { describe, expect, it } from 'vitest';
import { mergeUniqueOcrWords, OCR_PASS_NAMES } from '../../src/engine/ocrMerge';

const box = (x0: number, y0 = 10) => ({ x0, y0, x1: x0 + 45, y1: y0 + 20 });

describe('multi-pass OCR word merge', () => {
  it('plans contrast/invert passes with PSM 11 and keeps unique words at the best confidence', () => {
    expect(OCR_PASS_NAMES).toHaveLength(3);
    expect(OCR_PASS_NAMES.some((name) => name.includes('PSM 11'))).toBe(true);
    const merged = mergeUniqueOcrWords([
      [
        { text: 'OPERASI', conf: 72, bbox: box(10) },
        { text: 'POS', conf: 81, bbox: box(100) },
      ],
      [
        { text: 'operasi', conf: 94, bbox: box(12, 11) },
        { text: 'TERITORIAL', conf: 90, bbox: box(160) },
      ],
    ]);
    expect(merged.map((word) => word.text)).toEqual(['operasi', 'POS', 'TERITORIAL']);
    expect(merged[0].conf).toBe(94);
  });

  it('does not merge different words or repeated words at separate positions', () => {
    const merged = mergeUniqueOcrWords([[
      { text: 'POS', conf: 90, bbox: box(0) },
      { text: 'POS', conf: 91, bbox: box(120) },
      { text: 'JAGA', conf: 90, bbox: box(60) },
    ]]);
    expect(merged).toHaveLength(3);
  });
});
