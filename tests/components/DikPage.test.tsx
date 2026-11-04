import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DikPage } from '../../src/pages/DikPage';
import { useDikStore } from '../../src/store/useDikStore';

describe('Daftar Informasi Kritis page', () => {
  const saved = new Map<string, string>();
  beforeEach(() => {
    saved.clear();
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => saved.get(key) ?? null,
      setItem: (key: string, value: string) => { saved.set(key, value); },
      removeItem: (key: string) => { saved.delete(key); },
      clear: () => saved.clear(),
    });
    useDikStore.setState({ entries: [] });
  });

  it('adds fictional entries to session memory and shows editable findings list', () => {
    render(<DikPage />);
    fireEvent.change(screen.getByPlaceholderText('Contoh istilah kritis'), { target: { value: 'Operasi Fiktif' } });
    fireEvent.change(screen.getByLabelText('Jenis', { selector: 'select' }), { target: { value: 'kegiatan' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah entri' }));
    expect(useDikStore.getState().entries[0]).toMatchObject({ term: 'Operasi Fiktif', kind: 'kegiatan', severity: 'high' });
    expect(saved.size).toBe(0);
    fireEvent.click(screen.getByRole('button', { name: 'Muat contoh FIKTIF' }));
    expect(useDikStore.getState().entries.map(({ term }) => term)).toContain('KODE-LATIH-73');
  });

  it('shows a friendly error when imported JSON is invalid', async () => {
    render(<DikPage />);
    const picker = screen.getByLabelText('Pilih file JSON DIK');
    const invalidJsonFile = { name: 'invalid.json', text: async () => '{' } as File;
    fireEvent.change(picker, { target: { files: [invalidJsonFile] } });
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Impor gagal: JSON tidak valid atau rusak.'));
    expect(useDikStore.getState().entries).toEqual([]);
  });

  it('requires explicit opt-in to persist and removes local copy when disabled', () => {
    render(<DikPage />);
    fireEvent.change(screen.getByPlaceholderText('Contoh istilah kritis'), { target: { value: 'Kode Fiktif' } });
    fireEvent.click(screen.getByRole('button', { name: 'Tambah entri' }));
    const persistence = screen.getByRole('checkbox', { name: /Simpan di perangkat ini/ });
    fireEvent.click(persistence);
    expect(saved.get('perisai-opsec-dik-v1')).toContain('Kode Fiktif');
    fireEvent.click(persistence);
    expect(saved.get('perisai-opsec-dik-v1')).toBeUndefined();
  });
});
