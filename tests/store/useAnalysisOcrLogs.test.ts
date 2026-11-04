import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';
import type { AnalysisFile } from '../../src/types';

vi.mock('../../src/engine/metadata', () => ({
  readMetadataFromFile: vi.fn(async () => ({ exif: {}, findings: [] })),
}));

vi.mock('../../src/engine/ocr', () => ({
  runOcr: vi.fn(async (_file: File, onProgress?: (percent: number, status?: string) => void) => {
    onProgress?.(0, 'OCR lintasan 1/3: gambar asli · PSM otomatis');
    onProgress?.(33, 'Lintasan 1/3 selesai: 8 kata mentah.');
    onProgress?.(66, 'OCR lintasan 2/3: grayscale + kontras · PSM otomatis');
    onProgress?.(100, 'OCR selesai: 3 lintasan, 8 kata unik.');
    return { words: [], durationMs: 3456 };
  }),
}));

describe('analysis OCR status and pass logs', () => {
  afterEach(() => useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit' }));

  it('records each OCR pass and distinguishes successful empty text with processing time', async () => {
    const file: AnalysisFile = {
      id: 'ocr-log', file: new File(['synthetic'], 'banner.jpg', { type: 'image/jpeg' }),
      previewUrl: 'blob:test', name: 'banner.jpg', size: 9, type: 'image/jpeg', status: 'idle',
    };
    useAnalysisStore.setState({ files: [file], activeFileId: file.id, activeProfile: 'prajurit' });

    await useAnalysisStore.getState().analyzeFile(file.id);

    const analyzed = useAnalysisStore.getState().files[0];
    expect(analyzed.ocrStatus).toBe('empty');
    expect(analyzed.ocrDurationMs).toBe(3456);
    expect(analyzed.logs?.some((log) => log.message.includes('gambar asli · PSM otomatis'))).toBe(true);
    expect(analyzed.logs?.some((log) => log.message.includes('grayscale + kontras · PSM otomatis'))).toBe(true);
    expect(analyzed.logs?.some((log) => log.message.includes('OCR berhasil; tidak ada teks yang dikenali'))).toBe(true);
    expect(analyzed.logs?.some((log) => log.message.includes('3.46 detik'))).toBe(true);
  });
});
