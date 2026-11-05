import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { AnalysisPage } from '../../src/pages/AnalysisPage';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';

vi.mock('../../src/components/GlobeHero', () => ({ GlobeHero: () => <div>Globe</div> }));

const defaultAddFiles = useAnalysisStore.getState().addFiles;

describe('analysis dashboard layout', () => {
  beforeEach(() => useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit', addFiles: defaultAddFiles }));
  afterEach(() => vi.unstubAllGlobals());

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

  it('shows a cross-photo pattern card only with at least three GPS and time observations', () => {
    const createFile = (id: string, takenAt: string) => {
      const file = new File(['image'], `${id}.jpg`, { type: 'image/jpeg' });
      return { id, file, previewUrl: `blob:${id}`, name: file.name, size: file.size, type: file.type, status: 'done' as const, exif: { latitude: -6.1754, longitude: 106.8272, takenAt }, score: { value: 0, level: 'Aman' as const, findings: [] }, logs: [] };
    };
    const onOpenTab = vi.fn();
    const observations = [
      createFile('p1', '2026:11:02 05:50:00'),
      createFile('p2', '2026:11:03 05:52:00'),
      createFile('p3', '2026:11:04 05:48:00'),
    ];
    useAnalysisStore.setState({ files: observations, activeFileId: 'p1' });
    const { rerender } = render(<AnalysisPage onOpenTab={onOpenTab} />);
    expect(screen.getByRole('region', { name: 'Pola lintas foto terdeteksi' })).toHaveTextContent(/selama 3 hari berbeda/);
    fireEvent.click(screen.getByRole('button', { name: 'Lihat Pola Hidup' }));
    expect(onOpenTab).toHaveBeenCalledWith('pola-hidup');

    useAnalysisStore.setState({ files: [...observations.slice(0, 2), createFile('no-time', '')], activeFileId: 'p1' });
    rerender(<AnalysisPage onOpenTab={onOpenTab} />);
    expect(screen.queryByRole('region', { name: 'Pola lintas foto terdeteksi' })).not.toBeInTheDocument();
  });

  it('loads the weekly pattern scenario from the empty hero and opens Pattern Life', async () => {
    const addFiles = vi.fn();
    const onOpenTab = vi.fn();
    useAnalysisStore.setState({ files: [], activeFileId: null, addFiles });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['synthetic'], { type: 'image/jpeg' }) }));
    render(<AnalysisPage onOpenTab={onOpenTab} />);
    fireEvent.click(screen.getByRole('button', { name: 'Skenario contoh: seminggu unggahan' }));
    await waitFor(() => expect(addFiles).toHaveBeenCalledTimes(1));
    expect(addFiles.mock.calls[0]?.[0]).toHaveLength(8);
    expect(addFiles.mock.calls[0]?.[1]).toEqual({ metadataOnly: true });
    expect(onOpenTab).toHaveBeenCalledWith('pola-hidup');
  });

  it('provides a shortcut to edit the unit critical information list', () => {
    const file = new File(['image'], 'sample.jpg', { type: 'image/jpeg' });
    const onOpenTab = vi.fn();
    useAnalysisStore.setState({
      files: [{ id: 'sample', file, previewUrl: 'blob:sample', name: file.name, size: file.size, type: file.type, status: 'done', exif: {}, score: { value: 0, level: 'Aman', findings: [] }, logs: [] }],
      activeFileId: 'sample',
    });
    render(<AnalysisPage onOpenTab={onOpenTab} />);
    fireEvent.click(screen.getAllByRole('button', { name: 'Satuan Anda punya istilah sendiri? Atur Daftar Informasi Kritis' })[0]!);
    expect(onOpenTab).toHaveBeenCalledWith('dik');
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
    expect(within(quickActions).getAllByText('Tinggi')).toHaveLength(2);
    expect(within(quickActions).getByRole('button', { name: /bukti dua/i })).toBeInTheDocument();
    expect(screen.getAllByText('INDEKS RISIKO').length).toBeGreaterThan(0);
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
