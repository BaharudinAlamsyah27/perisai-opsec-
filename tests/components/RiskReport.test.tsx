import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RiskReport } from '../../src/components/RiskReport';
import type { AnalysisFile, Finding } from '../../src/types';

const finding: Finding = {
  id: 'report-finding',
  ruleId: 'meta-gps',
  category: 'lokasi',
  severity: 'critical',
  source: 'metadata',
  evidence: 'Koordinat sintetis: -6.2, 106.8',
  reason: 'Koordinat dapat mengungkap lokasi foto.',
  recommendation: 'Hapus metadata GPS sebelum membagikan foto.',
};

const file: AnalysisFile = {
  id: 'report-fixture',
  file: new File(['synthetic'], 'foto-sintetis.jpg'),
  previewUrl: 'blob:report',
  name: 'foto-sintetis.jpg',
  size: 9,
  type: 'image/jpeg',
  status: 'done',
  score: { value: 60, level: 'Tinggi', findings: [finding] },
};

describe('RiskReport', () => {
  afterEach(() => vi.restoreAllMocks());

  it('prints a report containing score, evidence, reason, and recommendation', () => {
    const print = vi.fn();
    Object.defineProperty(window, 'print', { configurable: true, value: print });
    render(<RiskReport file={file} profile="prajurit" />);

    expect(screen.getByText('60/100 — Tinggi')).toBeInTheDocument();
    expect(screen.getByText(/Koordinat sintetis/)).toBeInTheDocument();
    expect(screen.getByText(/Koordinat dapat mengungkap/)).toBeInTheDocument();
    expect(screen.getByText(/Hapus metadata GPS/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cetak / Simpan PDF' }));
    expect(print).toHaveBeenCalledOnce();
  });
});
