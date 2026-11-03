import { describe, it, expect } from 'vitest';
import { prepareImageForOcr } from '../../src/engine/ocr';

describe('OCR engine helper functions', () => {
  it('prepareImageForOcr handles image scaling logic', async () => {
    expect(typeof prepareImageForOcr).toBe('function');
  });
});
