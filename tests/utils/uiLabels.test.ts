import { describe, expect, it } from 'vitest';
import { getFindingSourceLabel, getSeverityLabel } from '../../src/utils/uiLabels';

describe('Indonesian UI label mappings', () => {
  it('maps every severity value to its Indonesian label', () => {
    expect(['critical', 'high', 'medium', 'low', 'info'].map((severity) => getSeverityLabel(severity as 'critical' | 'high' | 'medium' | 'low' | 'info')))
      .toEqual(['Kritis', 'Tinggi', 'Sedang', 'Rendah', 'Info']);
  });

  it('keeps internal finding sources out of user-facing labels', () => {
    expect(['metadata', 'ocr', 'caption', 'combo'].map((source) => getFindingSourceLabel(source as 'metadata' | 'ocr' | 'caption' | 'combo')))
      .toEqual(['Metadata', 'OCR', 'Keterangan', 'Gabungan']);
  });
});
