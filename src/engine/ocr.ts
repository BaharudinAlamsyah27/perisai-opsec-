import type { OcrWord } from '../types';

export interface OcrResult {
  words: OcrWord[];
  error?: string;
  durationMs?: number;
}

const MAX_DIMENSION = 2400;
export const DEFAULT_OCR_TIMEOUT_MS = 20_000;

export async function prepareImageForOcr(file: File, timeoutMs = DEFAULT_OCR_TIMEOUT_MS): Promise<{
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    let settled = false;
    const timeout = window.setTimeout(() => {
      settled = true;
      URL.revokeObjectURL(url);
      img.src = '';
      reject(new Error('Waktu memuat gambar untuk OCR habis. Coba gunakan foto JPG atau PNG yang valid.'));
    }, timeoutMs);

    img.onload = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      const originalWidth = img.naturalWidth;
      const originalHeight = img.naturalHeight;

      let scaledWidth = originalWidth;
      let scaledHeight = originalHeight;

      const maxSide = Math.max(originalWidth, originalHeight);
      if (maxSide > MAX_DIMENSION) {
        const ratio = MAX_DIMENSION / maxSide;
        scaledWidth = Math.round(originalWidth * ratio);
        scaledHeight = Math.round(originalHeight * ratio);
      }

      const canvas = document.createElement('canvas');
      canvas.width = scaledWidth;
      canvas.height = scaledHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Cannot get canvas 2d context for image downscaling'));
        return;
      }

      ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);

      resolve({
        dataUrl,
        originalWidth,
        originalHeight,
        scaledWidth,
        scaledHeight,
      });
    };

    img.onerror = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for OCR preparation'));
    };

    img.src = url;
  });
}

export async function runOcr(
  file: File,
  onProgress?: (percent: number, status?: string) => void,
  timeoutMs = DEFAULT_OCR_TIMEOUT_MS
): Promise<OcrResult> {
  const startedAt = Date.now();
  let activeWorker: Worker | null = null;
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const remainingMs = timeoutMs - (Date.now() - startedAt);
      if (remainingMs <= 0) throw new Error('Waktu OCR habis. Coba gunakan foto yang lebih kecil atau jelas.');
      const prepared = await prepareImageForOcr(file, remainingMs);

      const worker = new Worker(new URL('./ocr.worker.ts', import.meta.url), {
        type: 'module',
      });
      activeWorker = worker;

      const result = await new Promise<OcrResult>((resolve, reject) => {
        let settled = false;
        const finish = (callback: () => void) => {
          if (settled) return;
          settled = true;
          window.clearTimeout(timeout);
          worker.terminate();
          if (activeWorker === worker) activeWorker = null;
          callback();
        };
        const timeout = window.setTimeout(() => {
          finish(() => reject(new Error('Waktu OCR habis. Coba gunakan foto yang lebih kecil atau jelas.')));
        }, Math.max(1, timeoutMs - (Date.now() - startedAt)));

        worker.onmessage = (e: MessageEvent) => {
          const msg = e.data;
          if (msg.type === 'progress') {
            if (onProgress && typeof msg.progress === 'number') onProgress(msg.progress, msg.status);
          } else if (msg.type === 'success') {
            finish(() => resolve({ words: msg.words || [], durationMs: Date.now() - startedAt }));
          } else if (msg.type === 'error') {
            finish(() => reject(new Error(msg.error || 'Worker OCR error')));
          }
        };

        worker.onerror = (err: ErrorEvent) => {
          finish(() => reject(new Error(err.message || `Worker OCR gagal pada ${err.filename || 'skrip worker'}`)));
        };

        worker.postMessage({
          imageDataUrl: prepared.dataUrl,
          originalWidth: prepared.originalWidth,
          originalHeight: prepared.originalHeight,
          scaledWidth: prepared.scaledWidth,
          scaledHeight: prepared.scaledHeight,
        });
      });

      return result;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Error tidak diketahui';
      if (message.startsWith('Waktu')) {
        activeWorker?.terminate();
        return { words: [], error: message, durationMs: Date.now() - startedAt };
      }
      if (/Failed to load image for OCR preparation/i.test(message)) {
        activeWorker?.terminate();
        return {
          words: [],
          durationMs: Date.now() - startedAt,
          error: 'Berkas tidak dapat dibaca sebagai gambar. Pastikan file JPG atau PNG valid. (Detail teknis: gambar gagal dimuat untuk OCR.)',
        };
      }
      if (attempt >= maxAttempts) {
        activeWorker?.terminate();
        return {
          words: [],
          error: `Gagal membaca teks dari gambar setelah 2 percobaan: ${message}`,
          durationMs: Date.now() - startedAt,
        };
      }
    }
  }

  activeWorker?.terminate();
  return { words: [], error: 'OCR tidak dapat diselesaikan', durationMs: Date.now() - startedAt };
}
