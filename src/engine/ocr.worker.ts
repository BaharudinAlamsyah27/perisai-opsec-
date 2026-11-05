import { createWorker, PSM } from 'tesseract.js';
import type { PSM as PSMType } from 'tesseract.js';
import type { BoundingBox, OcrWord } from '../types';
import { mapTesseractBlocksToWords } from './ocrWords';
import { mergeUniqueOcrWords, OCR_PASS_NAMES } from './ocrMerge';
import { binarizeOtsu, preprocessOcrImage, upscaleForSmallText, type RgbaImageData } from './ocrPreprocess';

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

async function makeEnhancedVariant(source: ImageBitmap, otsu = false): Promise<{ blob: Blob; width: number; height: number; inverted: boolean; upscaled: boolean; averageLuminance: number }> {
  const canvas = new OffscreenCanvas(source.width, source.height);
  const context = canvas.getContext('2d', { willReadFrequently: true });
  if (!context) throw new Error('Canvas OCR tidak tersedia di worker.');
  context.drawImage(source, 0, 0);
  const pixels = context.getImageData(0, 0, source.width, source.height);
  const processed = preprocessOcrImage(pixels as RgbaImageData);
  const enlarged = upscaleForSmallText(processed.image);
  const selected = otsu ? binarizeOtsu(enlarged) : enlarged;
  const output = new OffscreenCanvas(selected.width, selected.height);
  const outputContext = output.getContext('2d', { willReadFrequently: true });
  if (!outputContext) throw new Error('Canvas OCR tidak tersedia saat menyimpan hasil praproses.');
  const safePixels = new Uint8ClampedArray(selected.data.length);
  safePixels.set(selected.data);
  const result = new ImageData(safePixels, selected.width, selected.height);
  outputContext.putImageData(result, 0, 0);
  return {
    blob: await output.convertToBlob({ type: 'image/png' }),
    width: selected.width,
    height: selected.height,
    inverted: processed.inverted,
    upscaled: selected.width !== source.width || selected.height !== source.height,
    averageLuminance: processed.averageLuminance,
  };
}

// Handler inside Web Worker. The caller terminates this worker after 20 seconds at most.
self.onmessage = async (event: MessageEvent<OcrWorkerRequest>) => {
  const startedAt = Date.now();
  const { imageBitmap, imageDataUrl, originalWidth, originalHeight } = event.data;
  let worker: Awaited<ReturnType<typeof createWorker>> | undefined;
  let sourceBitmap: ImageBitmap | undefined;
  let activePassIndex = 0;
  let totalPasses: number = OCR_PASS_NAMES.length;
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
    let enhanced: Awaited<ReturnType<typeof makeEnhancedVariant>> | undefined;
    let otsu: Awaited<ReturnType<typeof makeEnhancedVariant>> | undefined;
    try {
      enhanced = await makeEnhancedVariant(sourceBitmap);
      emitProgress(0, `Praproses: luminans ${Math.round(enhanced.averageLuminance)} · ${enhanced.inverted ? 'polaritas dibalik' : 'polaritas normal'} · grayscale, kontras persentil 2–98${enhanced.upscaled ? ' · diperbesar' : ''}.`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'praproses tidak tersedia';
      emitProgress(0, `Praproses grayscale/kontras dilewati: ${message}`);
    }
    try {
      otsu = await makeEnhancedVariant(sourceBitmap, true);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'binarisasi tidak tersedia';
      emitProgress(0, `Praproses Otsu dilewati: ${message}`);
    }

    const originalCanvas = new OffscreenCanvas(sourceBitmap.width, sourceBitmap.height);
    const originalContext = originalCanvas.getContext('2d');
    if (!originalContext) throw new Error('Canvas OCR tidak tersedia untuk gambar asli.');
    originalContext.drawImage(sourceBitmap, 0, 0);
    const originalBlob = await originalCanvas.convertToBlob({ type: 'image/png' });
    const passes: Array<{ name: string; image: Blob; width: number; height: number; psm: PSMType }> = [
      { name: OCR_PASS_NAMES[0], image: originalBlob, width: sourceBitmap.width, height: sourceBitmap.height, psm: PSM.SINGLE_BLOCK },
      { name: OCR_PASS_NAMES[1], image: originalBlob, width: sourceBitmap.width, height: sourceBitmap.height, psm: PSM.SPARSE_TEXT },
      ...(enhanced ? [{ name: OCR_PASS_NAMES[2], image: enhanced.blob, width: enhanced.width, height: enhanced.height, psm: PSM.SINGLE_BLOCK }] : []),
      ...(enhanced ? [{ name: OCR_PASS_NAMES[3], image: enhanced.blob, width: enhanced.width, height: enhanced.height, psm: PSM.SPARSE_TEXT }] : []),
      ...(otsu ? [{ name: OCR_PASS_NAMES[4], image: otsu.blob, width: otsu.width, height: otsu.height, psm: PSM.SINGLE_BLOCK }] : []),
      ...(otsu ? [{ name: OCR_PASS_NAMES[5], image: otsu.blob, width: otsu.width, height: otsu.height, psm: PSM.SPARSE_TEXT }] : []),
    ];
    totalPasses = passes.length;
    const wordPasses: OcrWord[][] = [];
    const failures: string[] = [];
    const deadline = startedAt + 20_000;

    for (let index = 0; index < passes.length; index++) {
      if (Date.now() >= deadline) {
        emitProgress(Math.round(index / passes.length * 100), 'Batas waktu total OCR tercapai; memakai hasil lintasan yang sudah selesai.');
        break;
      }
      const pass = passes[index];
      activePassIndex = index;
      const progressBase = Math.round(index / passes.length * 100);
      emitProgress(progressBase, `OCR lintasan ${index + 1}/${passes.length}: ${pass.name} (${pass.width}×${pass.height} px)`);
      try {
        await worker.setParameters({ tessedit_pageseg_mode: pass.psm });
        // Tesseract.js runtime supports Blob here, while its public ImageLike type omits Blob.
        const result = await worker.recognize(pass.image as unknown as HTMLCanvasElement, {}, { text: true, blocks: true });
        const scaleX = pass.width > 0 ? originalWidth / pass.width : 1;
        const scaleY = pass.height > 0 ? originalHeight / pass.height : 1;
        const words = mapTesseractBlocksToWords(result.data.blocks as TesseractBlock[], scaleX, scaleY);
        wordPasses.push(words);
        emitProgress(Math.round((index + 1) / passes.length * 100), `Lintasan ${index + 1}/${passes.length} selesai: ${words.length} kata mentah.`);
        const uniqueConfident = mergeUniqueOcrWords(wordPasses).filter((word) => word.conf >= 70).length;
        if (uniqueConfident >= 40) {
          emitProgress(Math.round((index + 1) / passes.length * 100), `OCR berhenti dini: ${uniqueConfident} kata unik berkeyakinan minimal 70%.`);
          break;
        }
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
  }
};
