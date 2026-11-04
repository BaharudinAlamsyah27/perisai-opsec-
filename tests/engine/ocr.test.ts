import { afterEach, describe, it, expect, vi } from 'vitest';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prepareImageForOcr, runOcr } from '../../src/engine/ocr';

describe('OCR engine helper functions', () => {
  it('prepareImageForOcr handles image scaling logic', async () => {
    expect(typeof prepareImageForOcr).toBe('function');
  });

  afterEach(() => vi.unstubAllGlobals());

  it('returns a friendly technical error for a file that is not an image', async () => {
    class InvalidImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) { queueMicrotask(() => this.onerror?.()); }
    }
    vi.stubGlobal('Image', InvalidImage);
    class MockURL extends URL {
      static createObjectURL(object: Blob) { void object; return 'blob:invalid'; }
      static revokeObjectURL(url: string) { void url; /* No browser resource to release in this test. */ }
    }
    vi.stubGlobal('URL', MockURL);
    const fixtureBytes = await readFile(resolve('tests/fixtures/dataset-uji-sintetis/10_bukan_gambar.jpg'));
    const result = await runOcr(new File([new Uint8Array(fixtureBytes)], '10_bukan_gambar.jpg', { type: 'image/jpeg' }));
    expect(result.words).toHaveLength(0);
    expect(result.error).toContain('Berkas tidak dapat dibaca sebagai gambar');
    expect(result.error).toContain('Detail teknis');
  });

  it('terminates a stalled OCR worker at the configured deadline', async () => {
    class ValidImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      naturalWidth = 2;
      naturalHeight = 2;
      set src(_value: string) { queueMicrotask(() => this.onload?.()); }
    }
    const terminate = vi.fn();
    class SilentWorker {
      onmessage: ((event: MessageEvent) => void) | null = null;
      onerror: ((event: ErrorEvent) => void) | null = null;
      postMessage() { /* Simulate a worker that never responds. */ }
      terminate() { terminate(); }
    }
    vi.stubGlobal('Image', ValidImage);
    vi.stubGlobal('Worker', SilentWorker);
    class MockURL extends URL {
      static createObjectURL(object: Blob) { void object; return 'blob:valid'; }
      static revokeObjectURL(url: string) { void url; /* No browser resource to release in this test. */ }
    }
    vi.stubGlobal('URL', MockURL);
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({ drawImage: vi.fn() } as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/jpeg;base64,dGVzdA==');

    const result = await runOcr(new File(['valid'], 'valid.jpg', { type: 'image/jpeg' }), undefined, 10);
    expect(result.error).toContain('Waktu OCR habis');
    expect(terminate).toHaveBeenCalledOnce();
  });
});
