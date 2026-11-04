import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OcrTextPanel } from '../../src/components/OcrTextPanel';
import { ResultsPanel } from '../../src/components/ResultsPanel';
import type { AnalysisFile } from '../../src/types';

const makeFile = (ocrStatus: AnalysisFile['ocrStatus']): AnalysisFile => {
  const file = new File(['synthetic'], 'no-exif.jpg', { type: 'image/jpeg' });
  return {
    id: 'file-1', file, name: file.name, size: file.size, type: file.type,
    previewUrl: 'blob:test', status: 'done', exif: {}, ocrStatus, ocrDurationMs: 2345,
    ocrWords: [
      { text: 'OPERASI', conf: 91, bbox: { x0: 0, y0: 0, x1: 40, y1: 12 } },
      { text: 'BURAM', conf: 42, bbox: { x0: 41, y0: 0, x1: 80, y1: 12 } },
    ],
    score: { value: 0, level: 'Aman', findings: [] }, logs: [],
  };
};

describe('OCR transparency and coverage messages', () => {
  it('shows OCR words, per-word confidence, ignored status, counts, and duration', () => {
    render(<OcrTextPanel file={makeFile('recognized')} />);
    expect(screen.getByLabelText('Teks mentah OCR')).toHaveTextContent('OPERASI');
    expect(screen.getByLabelText('Teks mentah OCR')).toHaveTextContent('BURAM');
    expect(screen.getByText('diabaikan')).toBeInTheDocument();
    expect(screen.getByText('1 kata terbaca · 1 diabaikan')).toBeInTheDocument();
    expect(screen.getByText('Waktu proses: 2.35 detik')).toBeInTheDocument();
  });

  it('warns on successful empty OCR and replaces absolute safe wording with coverage', () => {
    const file = makeFile('empty');
    file.ocrWords = [];
    file.ocrDurationMs = 12;
    render(<ResultsPanel file={file} view="findings" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Teks pada gambar tidak terbaca, hasil mungkin tidak lengkap');
    const coverage = screen.getByRole('region', { name: 'Cakupan pemeriksaan' });
    expect(coverage).toHaveTextContent('Metadata: tidak ada');
    expect(coverage).toHaveTextContent('OCR: tidak ada teks');
    expect(coverage).toHaveTextContent('Aturan: 0 kecocokan');
    expect(coverage).toHaveTextContent('Isi visual (wajah, seragam, objek, lokasi) tidak diperiksa');
    expect(screen.queryByText(/foto ini bersih/i)).not.toBeInTheDocument();
  });
});
