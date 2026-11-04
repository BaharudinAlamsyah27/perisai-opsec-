import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import { AnalysisPage } from '../../src/pages/AnalysisPage';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';

vi.mock('../../src/components/GlobeHero', () => ({ GlobeHero: () => <div>Globe</div> }));

describe('analysis dashboard layout', () => {
  beforeEach(() => useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit' }));

  it('shows the upload hero for an empty session', () => {
    render(<AnalysisPage />);
    expect(screen.getByText(/Tarik & Letakkan foto di sini/)).toBeInTheDocument();
    expect(screen.getByText(/GLOBE GEOLOKASI/)).toBeInTheDocument();
  });

  it('shows a compact add-photo action and dashboard panels for analyzed files', () => {
    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    useAnalysisStore.setState({
      files: [{ id: 'sample', file, previewUrl: 'blob:sample', name: file.name, size: file.size, type: file.type, status: 'done', exif: {}, score: { value: 83, level: 'Kritis', findings: [] }, logs: [] }],
      activeFileId: 'sample',
    });
    render(<AnalysisPage />);
    expect(screen.getByText('Tambah foto')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Temuan' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('heading', { name: 'AKSI CEPAT' })).toBeInTheDocument();
    expect(screen.queryByRole('article', { name: /LAPORAN RISIKO/ })).not.toBeInTheDocument();
    expect(screen.queryByText('LAPORAN RISIKO OPSEC')).not.toBeInTheDocument();
  });

  it('does not show a reassuring Aman level when OCR found no text', () => {
    const file = new File(['image'], 'empty.jpg', { type: 'image/jpeg' });
    useAnalysisStore.setState({
      files: [{ id: 'empty', file, previewUrl: 'blob:empty', name: file.name, size: file.size, type: file.type, status: 'done', exif: {}, ocrStatus: 'empty', ocrWords: [], score: { value: 0, level: 'Aman', findings: [] }, logs: [] }],
      activeFileId: 'empty',
    });
    render(<AnalysisPage />);
    expect(screen.getByText('CAKUPAN TERBATAS')).toBeInTheDocument();
    expect(screen.queryByText('AMAN')).not.toBeInTheDocument();
    expect(screen.getAllByRole('alert').some((element) => element.textContent?.includes('hasil mungkin tidak lengkap'))).toBe(true);
  });

  it('keeps the primary safe-version action with only two findings in the quick panel', () => {
    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    const findings = ['bukti satu', 'bukti dua', 'bukti tiga'].map((evidence, index) => ({
      id: `f-${index}`,
      ruleId: `rule-${index}`,
      category: 'operasional' as const,
      severity: 'high' as const,
      source: 'ocr' as const,
      evidence,
      reason: 'Alasan uji.',
      recommendation: 'Samarkan.',
    }));
    useAnalysisStore.setState({
      files: [{ id: 'sample', file, previewUrl: 'blob:sample', name: file.name, size: file.size, type: file.type, status: 'done', exif: {}, score: { value: 83, level: 'Kritis', findings }, logs: [] }],
      activeFileId: 'sample',
    });
    render(<AnalysisPage />);
    const quickActions = screen.getByRole('complementary', { name: 'Aksi cepat' });
    expect(within(quickActions).getByRole('button', { name: /Buat Versi Aman/ })).toBeInTheDocument();
    expect(within(quickActions).getByRole('button', { name: /Laporan/ })).toBeInTheDocument();
    expect(within(quickActions).getByRole('button', { name: /Lihat semua \(3\)/ })).toBeInTheDocument();
    expect(within(quickActions).getByRole('button', { name: /bukti satu/i })).toBeInTheDocument();
    expect(within(quickActions).getByRole('button', { name: /bukti dua/i })).toBeInTheDocument();
    expect(within(quickActions).queryByRole('button', { name: /bukti tiga/i })).not.toBeInTheDocument();
  });

  it('opens the intel brief from Quick Actions and follows a source link to its finding', () => {
    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    const sourceFinding = {
      id: 'gps-brief-source', ruleId: 'meta-gps', category: 'lokasi' as const, severity: 'critical' as const,
      source: 'metadata' as const, evidence: 'Koordinat: -6.2, 106.8', reason: 'GPS ditemukan.', recommendation: 'Hapus GPS.',
    };
    useAnalysisStore.setState({
      files: [{ id: 'sample', file, previewUrl: 'blob:sample', name: file.name, size: file.size, type: file.type, status: 'done', exif: {}, score: { value: 60, level: 'Tinggi', findings: [sourceFinding] }, logs: [] }],
      activeFileId: 'sample',
    });
    render(<AnalysisPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Brief Intelijen' }));
    expect(screen.getByRole('dialog', { name: 'Brief Intelijen Lawan' })).toBeInTheDocument();
    fireEvent.click(screen.getAllByRole('link', { name: '[gps-brief-source]' })[0]);
    expect(screen.queryByRole('dialog', { name: 'Brief Intelijen Lawan' })).not.toBeInTheDocument();
  });
});
