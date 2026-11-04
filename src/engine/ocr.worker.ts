import { createWorker, PSM } from 'tesseract.js';
import type { PSM as PSMType } from 'tesseract.js';
import type { BoundingBox, OcrWord } from '../types';
import { mapTesseractBlocksToWords } from './ocrWords';
import { mergeUniqueOcrWords, OCR_PASS_NAMES } from './ocrMerge';

export interface OcrProgressMessage {
  type: 'progress';
  progress: number;
  status: string;
}

export interface OcrSuccessMessage {
  type: 'success';
  words: OcrWord[];
  durationMs: number;
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

interface TesseractWord {
  text?: string;
  confidence?: number;
  bbox?: BoundingBox;
}

interface TesseractBlock {
  paragraphs?: Array<{ lines?: Array<{ words?: TesseractWord[] }> }>;
}

const emitProgress = (progress: number, status: string) => {
  self.postMessage({ type: 'progress', progress, status } as OcrProgressMessage);
};

function imageDataUrlToBlob(dataUrl: string): Blob {
  const [header, encoded] = dataUrl.split(',');
  if (!header || !encoded) throw new Error('Data gambar OCR tidak valid.');
  const mimeType = header.match(/^data:([^;]+)/)?.[1] ?? 'image/jpeg';
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index++) bytes[index] = binary.charCodeAt(index);
  return new Blob([bytes], { type: mimeType });
}

async function makeContrastVariant(source: ImageBitmap, inverted: boolean): Promise<ImageBitmap> {
  const canvas = new OffscreenCanvas(source.width, source.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas OCR tidak tersedia di worker.');
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    const luminance = 0.299 * pixels.data[index] + 0.587 * pixels.data[index + 1] + 0.114 * pixels.data[index + 2];
    const contrasted = Math.max(0, Math.min(255, (luminance - 128) * 1.5 + 128));
    const value = Math.round(inverted ? 255 - contrasted : contrasted);
    pixels.data[index] = value;
    pixels.data[index + 1] = value;
    pixels.data[index + 2] = value;
  }
  context.putImageData(pixels, 0, 0);
  return createImageBitmap(await canvas.convertToBlob({ type: 'image/png' }));
}

// Handler inside Web Worker. The caller terminates this worker after 20 seconds at most.
self.onmessage = async (event: MessageEvent<OcrWorkerRequest>) => {
  const startedAt = Date.now();
  const { imageBitmap, imageDataUrl, originalWidth, originalHeight, scaledWidth, scaledHeight } = event.data;
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let sourceBitmap: ImageBitmap | undefined;
  const variants: ImageBitmap[] = [];
  let activePassIndex = 0;
  let totalPasses = 3;
  try {
    const tessdataPath = new URL(`${import.meta.env.BASE_URL}tessdata/`, self.location.origin).href;
    worker = await createWorker(['ind', 'eng'], 1, {
      workerPath: new URL('worker.min.js', tessdataPath).href,
      corePath: tessdataPath,
      langPath: tessdataPath,
      gzip: false,
      logger: (message) => {
        if (message.status === 'recognizing text') {
          const localProgress = Math.max(0, Math.min(1, message.progress ?? 0));
          const progress = Math.round((activePassIndex + localProgress) / totalPasses * 100);
          emitProgress(progress, `Mengenali teks · lintasan ${activePassIndex + 1}/${totalPasses}`);
        }
      },
    });

    sourceBitmap = imageBitmap ?? (imageDataUrl ? await createImageBitmap(imageDataUrlToBlob(imageDataUrl)) : undefined);
    if (!sourceBitmap) throw new Error('Tidak ada gambar yang dapat dibaca oleh OCR.');
    let enhanced: ImageBitmap | undefined;
    let inverted: ImageBitmap | undefined;
    try {
      enhanced = await makeContrastVariant(sourceBitmap, false);
      variants.push(enhanced);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'praproses tidak tersedia';
      emitProgress(0, `Praproses grayscale/kontras dilewati: ${message}`);
    }
    try {
      inverted = await makeContrastVariant(sourceBitmap, true);
      variants.push(inverted);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'praproses tidak tersedia';
      emitProgress(0, `Praproses invert dilewati: ${message}`);
    }

    const passes: Array<{ name: string; image: ImageBitmap; psm: PSMType }> = [
      { name: OCR_PASS_NAMES[0], image: sourceBitmap, psm: PSM.AUTO },
      ...(enhanced ? [{ name: OCR_PASS_NAMES[1], image: enhanced, psm: PSM.AUTO }] : []),
      ...(inverted ? [{ name: OCR_PASS_NAMES[2], image: inverted, psm: PSM.SPARSE_TEXT }] : []),
      ...(!inverted ? [{ name: 'gambar asli · PSM 11', image: sourceBitmap, psm: PSM.SPARSE_TEXT }] : []),
    ];
    totalPasses = passes.length;
    const scaleX = scaledWidth > 0 ? originalWidth / scaledWidth : 1;
    const scaleY = scaledHeight > 0 ? originalHeight / scaledHeight : 1;
    const wordPasses: OcrWord[][] = [];
    const failures: string[] = [];

    for (let index = 0; index < passes.length; index++) {
      const pass = passes[index];
      activePassIndex = index;
      const progressBase = Math.round(index / passes.length * 100);
      emitProgress(progressBase, `OCR lintasan ${index + 1}/${passes.length}: ${pass.name} (${scaledWidth}×${scaledHeight} px)`);
      try {
        await worker.setParameters({ tessedit_pageseg_mode: pass.psm });
        const result = await worker.recognize(pass.image, {}, { text: true, blocks: true });
        const words = mapTesseractBlocksToWords(result.data.blocks as TesseractBlock[], scaleX, scaleY);
        wordPasses.push(words);
        emitProgress(Math.round((index + 1) / passes.length * 100), `Lintasan ${index + 1}/${passes.length} selesai: ${words.length} kata mentah.`);
      } catch (error) {
        const message = error instanceof Error ? error.message : 'kesalahan tidak diketahui';
        failures.push(`${pass.name}: ${message}`);
        emitProgress(Math.round((index + 1) / passes.length * 100), `Lintasan ${index + 1}/${passes.length} gagal: ${message}`);
      }
    }

    const words = mergeUniqueOcrWords(wordPasses);
    if (wordPasses.length === 0) throw new Error(failures.join(' | ') || 'Semua lintasan OCR gagal.');
    emitProgress(100, `OCR selesai: ${wordPasses.length} lintasan, ${words.length} kata unik${failures.length ? `, ${failures.length} lintasan gagal` : ''}.`);
    self.postMessage({ type: 'success', words, durationMs: Date.now() - startedAt } as OcrSuccessMessage);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'OCR processing failed';
    self.postMessage({ type: 'error', error: message } as OcrErrorMessage);
  } finally {
    await worker?.terminate();
    sourceBitmap?.close();
    variants.forEach((bitmap) => bitmap.close());
  }
};
