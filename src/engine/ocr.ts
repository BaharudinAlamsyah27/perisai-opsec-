import type { OcrWord } from '../types';

export interface OcrResult {
  words: OcrWord[];
  error?: string;
}

const MAX_DIMENSION = 2400;

export async function prepareImageForOcr(file: File): Promise<{
  dataUrl: string;
  originalWidth: number;
  originalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
}> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);

    img.onload = () => {
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
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image for OCR preparation'));
    };

    img.src = url;
  });
}

export async function runOcr(
  file: File,
  onProgress?: (percent: number) => void
): Promise<OcrResult> {
  let attempt = 0;
  const maxAttempts = 2;

  while (attempt < maxAttempts) {
    attempt++;
    try {
      const prepared = await prepareImageForOcr(file);

      const worker = new Worker(new URL('./ocr.worker.ts', import.meta.url), {
        type: 'module',
      });

      const result = await new Promise<OcrResult>((resolve, reject) => {
        worker.onmessage = (e: MessageEvent) => {
          const msg = e.data;
          if (msg.type === 'progress') {
            if (onProgress && typeof msg.progress === 'number') {
              onProgress(msg.progress);
            }
          } else if (msg.type === 'success') {
            worker.terminate();
            resolve({ words: msg.words || [] });
          } else if (msg.type === 'error') {
            worker.terminate();
            reject(new Error(msg.error || 'Worker OCR error'));
          }
        };

        worker.onerror = (err) => {
          worker.terminate();
          reject(err);
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
      if (attempt >= maxAttempts) {
        const message = err instanceof Error ? err.message : 'Error tidak diketahui';
        return {
          words: [],
          error: `Gagal membaca teks dari gambar setelah 2 percobaan: ${message}`,
        };
      }
    }
  }

  return { words: [], error: 'OCR tidak dapat diselesaikan' };
}
