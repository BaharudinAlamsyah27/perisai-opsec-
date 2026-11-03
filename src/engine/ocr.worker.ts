import { createWorker } from 'tesseract.js';
import type { OcrWord } from '../types';
import { mapTesseractBlocksToWords } from './ocrWords';

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
    const tessdataPath = new URL(`${import.meta.env.BASE_URL}tessdata/`, self.location.origin).href;
    const worker = await createWorker(['ind', 'eng'], 1, {
      workerPath: new URL('worker.min.js', tessdataPath).href,
      corePath: tessdataPath,
      langPath: tessdataPath,
      // Aset lokal berformat .traineddata biasa, bukan .traineddata.gz.
      gzip: false,
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

    const ret = await worker.recognize(imageSource, {}, { text: true, blocks: true });
    await worker.terminate();

    const scaleX = scaledWidth > 0 ? originalWidth / scaledWidth : 1;
    const scaleY = scaledHeight > 0 ? originalHeight / scaledHeight : 1;
    const words = mapTesseractBlocksToWords(ret.data.blocks, scaleX, scaleY);

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
