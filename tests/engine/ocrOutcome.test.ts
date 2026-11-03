import { describe, expect, it } from 'vitest';
import { getOcrOutcome } from '../../src/engine/ocrOutcome';

describe('OCR outcome classification', () => {
  it('keeps technical failures distinct from a successful empty recognition', () => {
    expect(getOcrOutcome({ words: [], error: 'Gagal memuat traineddata' })).toBe('error');
    expect(getOcrOutcome({ words: [] })).toBe('empty');
    expect(getOcrOutcome({ words: [{ text: 'POS', conf: 99, bbox: { x0: 0, y0: 0, x1: 10, y1: 10 } }] })).toBe('recognized');
  });
});
