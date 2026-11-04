import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResultsPanel } from '../../src/components/ResultsPanel';
import { analyzeText } from '../../src/engine/rules';
import { calculateScore } from '../../src/engine/scoring';
import type { AnalysisFile } from '../../src/types';

describe('public operational context summary', () => {
  it('groups three or more public context findings and labels low scores for publication review', () => {
    const findings = analyzeText('OPERASI TERITORIAL DI WILAYAH PERBATASAN DAN RAWAN KONFLIK', 'caption');
    const score = calculateScore(findings);
    const file = new File(['synthetic'], 'context.jpg', { type: 'image/jpeg' });
    const analysis: AnalysisFile = {
      id: 'context', file, name: file.name, size: file.size, type: file.type,
      previewUrl: 'blob:context', status: 'done', exif: {}, ocrStatus: 'recognized',
      ocrWords: [], score, logs: [],
    };
    render(<ResultsPanel file={analysis} view="all" />);

    expect(screen.getByRole('article', { name: 'Konteks kegiatan operasional' })).toBeInTheDocument();
    expect(screen.getAllByText('Perlu verifikasi publikasi')).toHaveLength(2);
    expect(screen.getByText('Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.')).toBeInTheDocument();
    expect(screen.queryByText(/Kata kunci kegiatan\/pergerakan/)).not.toBeInTheDocument();
  });
});
