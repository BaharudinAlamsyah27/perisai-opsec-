import { describe, it, expect } from 'vitest';
import { sanitizeImage } from '../../src/engine/sanitize';

describe('Sanitize Engine (T-017 & T-018)', () => {
  it('exports sanitizeImage function', () => {
    expect(typeof sanitizeImage).toBe('function');
  });
});

