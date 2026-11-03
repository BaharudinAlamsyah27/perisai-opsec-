import { createWorker } from 'tesseract.js';
import type { OcrWord } from '../types';

export interface OcrProgressMessage {
  type: 'progress';
  progress: number;
  status: string;
}

export interface OcrSuccessMessage {
  type: 'success';
  words: OcrWord[];
}

export interface OcrErrorMessage {
  type: 'error';
  error: string;
}

export type OcrWorkerMessage = OcrProgressMessage | OcrSuccessMessage | OcrErrorMessage;

export interface OcrWorkerRequest {
  imageBitmap?: ImageBitmap;
  imageDataUrl?: string;
  originalWidth: number;
  originalHeight: number;
  scaledWidth: number;
  scaledHeight: number;
}

// Handler inside Web Worker
self.onmessage = async (e: MessageEvent<OcrWorkerRequest>) => {
  const { imageBitmap, imageDataUrl, originalWidth, originalHeight, scaledWidth, scaledHeight } = e.data;

  try {
    const worker = await createWorker(['ind', 'eng'], 1, {
      workerPath: '/tessdata/worker.min.js',
      corePath: '/tessdata',
      langPath: '/tessdata',
      logger: (m) => {
        if (m.status === 'recognizing text') {
          const progress = Math.round((m.progress || 0) * 100);
          self.postMessage({
            type: 'progress',
            progress,
            status: m.status,
          } as OcrProgressMessage);
        }
      },
    });

    const imageSource = imageBitmap || imageDataUrl;
    if (!imageSource) {
      throw new Error('No valid image provided for OCR');
    }

    const ret = await worker.recognize(imageSource);
    await worker.terminate();

    const scaleX = scaledWidth > 0 ? originalWidth / scaledWidth : 1;
    const scaleY = scaledHeight > 0 ? originalHeight / scaledHeight : 1;

    const words: OcrWord[] = [];
    const tesseractWords = (ret.data as { words?: Array<{ text?: string; confidence?: number; bbox?: { x0: number; y0: number; x1: number; y1: number } }> })?.words || [];

    for (const w of tesseractWords) {
      const text = (w.text || '').trim();
      if (!text) continue;

      const x0 = Math.round((w.bbox?.x0 ?? 0) * scaleX);
      const y0 = Math.round((w.bbox?.y0 ?? 0) * scaleY);
      const x1 = Math.round((w.bbox?.x1 ?? 0) * scaleX);
      const y1 = Math.round((w.bbox?.y1 ?? 0) * scaleY);

      words.push({
        text,
        conf: typeof w.confidence === 'number' ? w.confidence : 0,
        bbox: { x0, y0, x1, y1 },
      });
    }

    self.postMessage({
      type: 'success',
      words,
    } as OcrSuccessMessage);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'OCR processing failed';
    self.postMessage({
      type: 'error',
      error: message,
    } as OcrErrorMessage);
  }
};
