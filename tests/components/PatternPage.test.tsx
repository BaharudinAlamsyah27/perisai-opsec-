import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PatternPage } from '../../src/pages/PatternPage';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';
import type { AnalysisFile } from '../../src/types';

const observations = [
  ['11', -6.1754, 106.8272, '2026:11:02 05:50:00'],
  ['12', -6.1900, 106.8300, '2026:11:02 07:30:00'],
  ['13', -6.1754, 106.8272, '2026:11:03 05:55:00'],
  ['14', -6.1900, 106.8300, '2026:11:03 07:28:00'],
  ['15', -6.1754, 106.8272, '2026:11:04 05:48:00'],
  ['16', -6.1900, 106.8300, '2026:11:04 07:35:00'],
  ['17', -6.2100, 106.8450, '2026:11:04 19:10:00'],
  ['18', -6.1754, 106.8272, '2026:11:05 05:52:00'],
] as const;

function sessionFiles(): AnalysisFile[] {
  return observations.map(([id, latitude, longitude, takenAt]) => ({
    id,
    file: new File([], `${id}.jpg`, { type: 'image/jpeg' }),
    previewUrl: '',
    name: `${id}.jpg`,
    size: 0,
    type: 'image/jpeg',
    exif: { latitude, longitude, takenAt },
    status: 'done',
  }));
}

describe('PatternPage', () => {
  afterEach(() => vi.unstubAllGlobals());
  beforeEach(() => {
    useAnalysisStore.setState({ files: sessionFiles(), activeFileId: '11' });
  });

  it('analyzes session metadata, shows the expected patterns, and keeps labels in page state', async () => {
    render(<PatternPage />);
    expect(screen.getByLabelText('Mode cepat (hanya metadata, tanpa OCR)')).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: 'Analisis pola dari sesi ini' }));

    expect(await screen.findByText('Tinggi')).toBeInTheDocument();
    expect(screen.getByText('2 rutinitas · 1 transisi berulang')).toBeInTheDocument();
    expect(screen.getByText(/0 foto tidak dapat dipetakan/)).toBeInTheDocument();
    expect(screen.getAllByText(/Lokasi 1 → Lokasi 2/).length).toBeGreaterThanOrEqual(2);
    expect(document.querySelector('svg[role="img"]')).not.toBeNull();
    expect(document.querySelectorAll('svg').length).toBeGreaterThanOrEqual(2);

    const firstLabel = screen.getByLabelText('LABEL LOKASI · 4 FOTO');
    fireEvent.change(firstLabel, { target: { value: 'Titik A' } });
    expect(screen.getAllByText(/Titik A → Lokasi 2/).length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText('PETA OSM OPSIONAL · PERLU PERSETUJUAN')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Muat peta/ })).not.toBeInTheDocument();
  });

  it('reports an empty session without fabricating observations', async () => {
    useAnalysisStore.setState({ files: [], activeFileId: null });
    render(<PatternPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Analisis pola dari sesi ini' }));
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(/Belum ada foto dalam sesi/));
    expect(screen.queryByText('TINGKAT KETERBACAAN POLA')).not.toBeInTheDocument();
  });

  it('loads the eight fictional pattern samples with EXIF-only processing', async () => {
    const addFiles = vi.fn();
    useAnalysisStore.setState({ files: [], activeFileId: null, addFiles });
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, blob: async () => new Blob(['synthetic'], { type: 'image/jpeg' }) }));
    render(<PatternPage />);
    fireEvent.click(screen.getByRole('button', { name: 'Muat contoh pola hidup' }));
    await waitFor(() => expect(addFiles).toHaveBeenCalledTimes(1));
    expect(addFiles.mock.calls[0]?.[0]).toHaveLength(8);
    expect(addFiles.mock.calls[0]?.[1]).toEqual({ metadataOnly: true });
    expect(screen.getByRole('status')).toHaveTextContent('8 foto contoh pola hidup dimuat');
  });
});
