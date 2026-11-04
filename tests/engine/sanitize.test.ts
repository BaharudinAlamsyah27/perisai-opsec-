import { afterEach, describe, it, expect, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import exifr from 'exifr';
import { sanitizeImage } from '../../src/engine/sanitize';

describe('Sanitize Engine (T-017 & T-018)', () => {
  afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); });

  it('exports sanitizeImage function', () => {
    expect(typeof sanitizeImage).toBe('function');
  });

  it('re-encodes a JPEG with EXIF into a JPEG exifr reads without metadata', async () => {
    const [sourceBytes, cleanBytes] = await Promise.all([
      readFile(resolve('tests/fixtures/sanitize-with-exif.jpg')),
      readFile(resolve('tests/fixtures/sanitize-clean.jpg')),
    ]);
    const cleanJpeg = new Blob([new Uint8Array(cleanBytes)], { type: 'image/jpeg' });
    const sourceWithExif = new Blob([new Uint8Array(sourceBytes)], { type: 'image/jpeg' });
    expect((await exifr.parse(sourceWithExif))?.Make).toBe('SyntheticCamera');

    const context = { drawImage: vi.fn(), fillRect: vi.fn(), strokeRect: vi.fn() };
    class MockImage {
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      naturalWidth = 2;
      naturalHeight = 2;
      width = 2;
      height = 2;
      set src(_value: string) { queueMicrotask(() => this.onload?.(new Event('load'))); }
    }
    vi.stubGlobal('Image', MockImage);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(cleanJpeg));

    const result = await sanitizeImage(sourceWithExif);
    expect(result.blob.type).toBe('image/jpeg');
    const metadata = await exifr.parse(result.blob);
    expect(!metadata || Object.keys(metadata).length === 0).toBe(true);
  });

  it('applies visibly different canvas operations for each redaction style', async () => {
    class MockImage {
      onload: ((event: Event) => void) | null = null;
      onerror: ((event: Event) => void) | null = null;
      naturalWidth = 120;
      naturalHeight = 60;
      width = 120;
      height = 60;
      set src(_value: string) { queueMicrotask(() => this.onload?.(new Event('load'))); }
    }
    const drawImage = vi.fn();
    const context = {
      drawImage,
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      save: vi.fn(),
      beginPath: vi.fn(),
      rect: vi.fn(),
      clip: vi.fn(),
      restore: vi.fn(),
      imageSmoothingEnabled: true,
      fillStyle: '',
      strokeStyle: '',
      lineWidth: 1,
    };
    vi.stubGlobal('Image', MockImage);
    vi.stubGlobal('URL', { ...URL, createObjectURL: vi.fn(() => 'blob:mock'), revokeObjectURL: vi.fn() });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toBlob').mockImplementation((callback) => callback(new Blob(['jpeg'], { type: 'image/jpeg' })));
    const bbox = { x0: 10, y0: 10, x1: 70, y1: 40 };

    await sanitizeImage(new Blob(['source'], { type: 'image/jpeg' }), { bboxes: [bbox], redactionStyle: 'blackbox' });
    expect(context.fillRect).toHaveBeenCalledOnce();
    expect(drawImage).toHaveBeenCalledTimes(1);
    drawImage.mockClear();
    context.fillRect.mockClear();

    await sanitizeImage(new Blob(['source'], { type: 'image/jpeg' }), { bboxes: [bbox], redactionStyle: 'blur' });
    expect(context.fillRect).toHaveBeenCalledOnce();
    expect(drawImage).toHaveBeenCalledTimes(3);
    drawImage.mockClear();
    context.fillRect.mockClear();

    await sanitizeImage(new Blob(['source'], { type: 'image/jpeg' }), { bboxes: [bbox], redactionStyle: 'pixelate' });
    expect(drawImage).toHaveBeenCalledTimes(3);
    expect(context.fillRect).not.toHaveBeenCalled();
  });
});
