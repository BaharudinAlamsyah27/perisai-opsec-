import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, fireEvent } from '@testing-library/react';
import { SanitizerPreview } from '../../src/components/SanitizerPreview';
import type { AnalysisFile } from '../../src/types';

const { sanitizeImageMock, runOcrMock } = vi.hoisted(() => ({
  sanitizeImageMock: vi.fn(),
  runOcrMock: vi.fn(),
}));

vi.mock('../../src/engine/sanitize', () => ({ sanitizeImage: sanitizeImageMock }));
vi.mock('../../src/engine/ocr', () => ({ runOcr: runOcrMock }));

describe('sanitized image reanalysis', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('reanalyzes the generated JPEG, shows before and after scores, and downloads neutrally', async () => {
    const blob = new Blob(['clean jpeg'], { type: 'image/jpeg' });
    sanitizeImageMock.mockResolvedValue({ blob, dataUrl: 'blob:safe-preview', width: 100, height: 100 });
    runOcrMock.mockResolvedValue({ words: [] });
    vi.stubGlobal('URL', { createObjectURL: vi.fn(() => 'blob:safe-preview'), revokeObjectURL: vi.fn() });
    const file = new File(['original'], 'sensitive-name.jpg', { type: 'image/jpeg' });
    const finding = { id: 'ocr-a', ruleId: 'id-nik', category: 'identitas' as const, severity: 'high' as const, source: 'ocr' as const, evidence: '1234567890123456', reason: 'Identitas', recommendation: 'Samarkan', bbox: { x0: 1, y0: 1, x1: 20, y1: 20 } };
    const analysisFile: AnalysisFile = {
      id: 'safe-test', file, previewUrl: 'blob:original', name: file.name, size: file.size, type: file.type,
      status: 'done', score: { value: 83, level: 'Kritis', findings: [finding] },
    };
    const downloadedNames: string[] = [];
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) { downloadedNames.push(this.download); });

    render(<SanitizerPreview file={analysisFile} />);
    expect(await screen.findByText(/Skor: 83 → 0/)).toBeInTheDocument();
    expect(screen.getByText(/Temuan: 1 → 0/)).toBeInTheDocument();
    expect(screen.getByText(/Metadata EXIF dihapus/)).toHaveTextContent('(0 → 0)');
    expect(screen.getByText(/area teks disensor/)).toHaveTextContent('1 area teks disensor');
    expect(screen.getByText(/Hasil dianalisis ulang/)).toHaveTextContent('tidak ada GPS');
    expect(screen.queryByText(/ANALISIS ULANG DIPERLUKAN/)).not.toBeInTheDocument();
    expect(runOcrMock).toHaveBeenCalledWith(expect.any(File));

    fireEvent.click(screen.getByRole('button', { name: /UNDUH FOTO VERSI AMAN/ }));
    expect(click).toHaveBeenCalledOnce();
    expect(downloadedNames).toEqual(['perisai-opsec-versi-aman.jpg']);
    expect(sanitizeImageMock).toHaveBeenCalledWith(file, expect.objectContaining({
      bboxes: [finding.bbox], imageFormat: 'image/jpeg',
    }));
    click.mockRestore();
  });
});
