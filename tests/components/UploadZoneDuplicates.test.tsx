import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { UploadZone } from '../../src/components/UploadZone';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';
import type { AnalysisFile } from '../../src/types';

vi.mock('../../src/engine/ocr', () => ({
  runOcr: vi.fn().mockResolvedValue({ words: [] }),
}));

function seedStore(file: File) {
  const existing: AnalysisFile = {
    id: 'existing-file',
    file,
    previewUrl: 'blob:existing',
    name: file.name,
    size: file.size,
    type: file.type,
    status: 'done',
    score: { value: 0, level: 'Aman', findings: [] },
  };
  useAnalysisStore.setState({ files: [existing], activeFileId: existing.id, activeProfile: 'prajurit' });
}

describe('UploadZone duplicate handling', () => {
  beforeEach(() => {
    Object.defineProperty(URL, 'createObjectURL', { configurable: true, value: vi.fn(() => 'blob:mock') });
    Object.defineProperty(URL, 'revokeObjectURL', { configurable: true, value: vi.fn() });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit' });
  });

  it('lets users skip files identified as duplicates', async () => {
    seedStore(new File(['same synthetic bytes'], 'latihan.png', { type: 'image/png' }));
    const { container } = render(<UploadZone />);
    const input = container.querySelector('input[type="file"]');
    if (!input) throw new Error('Input file tidak ditemukan');

    fireEvent.change(input, { target: { files: [new File(['same synthetic bytes'], 'latihan.png', { type: 'image/png' })] } });
    await screen.findByText(/1 foto tampak seperti duplikat/);
    fireEvent.click(screen.getByRole('button', { name: 'Lewati yang duplikat' }));

    expect(useAnalysisStore.getState().files).toHaveLength(1);
  });

  it('lets users add a duplicate anyway', async () => {
    seedStore(new File(['same synthetic bytes'], 'latihan.png', { type: 'image/png' }));
    const { container } = render(<UploadZone />);
    const input = container.querySelector('input[type="file"]');
    if (!input) throw new Error('Input file tidak ditemukan');

    fireEvent.change(input, { target: { files: [new File(['same synthetic bytes'], 'latihan.png', { type: 'image/png' })] } });
    await screen.findByText(/1 foto tampak seperti duplikat/);
    fireEvent.click(screen.getByRole('button', { name: 'Tetap tambahkan semua' }));

    await waitFor(() => expect(useAnalysisStore.getState().files).toHaveLength(2));
  });

  it('loads the five public fictional photo samples in one action', async () => {
    const addFiles = vi.fn();
    useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit', addFiles });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['synthetic'], { type: 'image/jpeg' }) }));
    render(<UploadZone />);
    fireEvent.click(screen.getByRole('button', { name: /Coba foto contoh/i }));
    await waitFor(() => expect(addFiles).toHaveBeenCalledTimes(1));
    const loadedFiles = addFiles.mock.calls[0]?.[0] as File[];
    expect(loadedFiles.map(({ name }) => name)).toEqual([
      '03_papan_satuan_nrp.jpg', '04_dokumen_rahasia.jpg', '05_plat_nomor_sah.jpg', '02_gps_saja.jpg', '01_foto_bersih.jpg',
    ]);
    expect(screen.getByText('DATA CONTOH FIKTIF')).toBeInTheDocument();
  });
});
