import { fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { RiskReport } from '../../src/components/RiskReport';
import type { AnalysisFile, Finding } from '../../src/types';
import { analyzeText } from '../../src/engine/rules';
import { calculateScore } from '../../src/engine/scoring';

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
    expect(screen.getAllByText(/Koordinat sintetis/).length).toBeGreaterThan(0);
    expect(screen.getByText(/Koordinat dapat mengungkap/)).toBeInTheDocument();
    expect(screen.getAllByText(/Hapus metadata GPS/).length).toBeGreaterThan(0);
    expect(screen.getByRole('heading', { name: 'BRIEF INTELIJEN LAWAN' })).toBeInTheDocument();
    expect(screen.getByText(/Brief ini disusun otomatis dari temuan/)).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: '[report-finding]' }).length).toBeGreaterThan(0);
    expect(document.getElementById('risk-finding-report-finding')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Cetak / Simpan PDF' }));
    expect(print).toHaveBeenCalledOnce();
  });

  it('does not render an original synthetic password or token in the report or brief', () => {
    const findings = analyzeText('password: BiruUji91 token: HijauContoh82', 'caption');
    const secretFile: AnalysisFile = { ...file, score: calculateScore(findings), ignoredFindings: [finding] };
    const { container } = render(<RiskReport file={secretFile} profile="prajurit" />);
    expect(container.textContent).not.toContain('BiruUji91');
    expect(container.textContent).not.toContain('HijauContoh82');
    expect(container.textContent).toContain('1 temuan diabaikan pengguna');
  });
});
