import type { BoundingBox } from '../types';

export type RedactionStyle = 'blackbox' | 'blur' | 'pixelate';

export interface SanitizeOptions {
  stripMetadataOnly?: boolean;
  bboxes?: BoundingBox[];
  redactionStyle?: RedactionStyle;
  imageFormat?: 'image/jpeg' | 'image/png';
  quality?: number; // 0.1 to 1.0 (default 0.92)
}

/**
 * Strips all metadata by re-encoding the image onto an HTML5 Canvas.
 * Optionally applies censorship (black box, blur, or pixelate) on specific bounding boxes.
 * Pure utility function, works in browser runtime.
 */
export async function sanitizeImage(
  imageSource: Blob | File | string,
  options: SanitizeOptions = {}
): Promise<{ blob: Blob; dataUrl: string; width: number; height: number }> {
  const {
    bboxes = [],
    redactionStyle = 'blackbox',
    imageFormat = 'image/jpeg',
    quality = 0.92,
  } = options;

  if (!Number.isFinite(quality) || quality < 0.1 || quality > 1) {
    throw new RangeError('Kualitas gambar harus berada di antara 0.1 dan 1.0');
  }

  return new Promise((resolve, reject) => {
    const img = new Image();
    let objectUrl = '';
    const cleanup = () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = '';
      }
    };

    if (typeof imageSource === 'string') {
      img.src = imageSource;
    } else {
      objectUrl = URL.createObjectURL(imageSource);
      img.src = objectUrl;
    }

    img.onload = () => {
      cleanup();

      const width = img.naturalWidth || img.width;
      const height = img.naturalHeight || img.height;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas 2D tidak dapat disiapkan untuk membuat versi aman.'));
        return;
      }

      // Draw base image onto canvas (automatically drops EXIF / GPS / device metadata)
      ctx.drawImage(img, 0, 0, width, height);

      // Apply redactions if any bounding boxes are passed
      for (const bbox of bboxes) {
        const left = Math.max(0, Math.min(bbox.x0, bbox.x1, width));
        const top = Math.max(0, Math.min(bbox.y0, bbox.y1, height));
        const right = Math.max(0, Math.min(Math.max(bbox.x0, bbox.x1), width));
        const bottom = Math.max(0, Math.min(Math.max(bbox.y0, bbox.y1), height));
        const x = Math.floor(left);
        const y = Math.floor(top);
        const w = Math.ceil(right) - x;
        const h = Math.ceil(bottom) - y;
        if (w <= 0 || h <= 0) continue;

        if (redactionStyle === 'blackbox') {
          // Tactical solid black block
          ctx.fillStyle = '#05070b';
          ctx.fillRect(x, y, w, h);

          // Subtle security border
          ctx.strokeStyle = '#ef4444';
          ctx.lineWidth = Math.max(1, Math.round(width / 800));
          ctx.strokeRect(x, y, w, h);
        } else if (redactionStyle === 'blur') {
          // Pixelate the selected source region, then darken it slightly.
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();
          const pixelSize = Math.max(12, Math.round(Math.min(w, h) / 6));
          const smallWidth = Math.max(1, Math.ceil(w / pixelSize));
          const smallHeight = Math.max(1, Math.ceil(h / pixelSize));
          const mosaic = document.createElement('canvas');
          mosaic.width = smallWidth;
          mosaic.height = smallHeight;
          const mosaicContext = mosaic.getContext('2d');
          if (mosaicContext) {
            mosaicContext.drawImage(canvas, x, y, w, h, 0, 0, smallWidth, smallHeight);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(mosaic, 0, 0, smallWidth, smallHeight, x, y, w, h);
            ctx.imageSmoothingEnabled = true;
          }
          ctx.fillStyle = 'rgba(10, 15, 25, 0.35)';
          ctx.fillRect(x, y, w, h);
          ctx.restore();
        } else if (redactionStyle === 'pixelate') {
          // Pixelation effect
          const pixelSize = Math.max(8, Math.round(w / 8));
          ctx.save();
          ctx.beginPath();
          ctx.rect(x, y, w, h);
          ctx.clip();

          const pixelated = document.createElement('canvas');
          pixelated.width = Math.max(1, Math.ceil(w / pixelSize));
          pixelated.height = Math.max(1, Math.ceil(h / pixelSize));
          const pixelContext = pixelated.getContext('2d');
          if (pixelContext) {
            pixelContext.drawImage(canvas, x, y, w, h, 0, 0, pixelated.width, pixelated.height);
            ctx.imageSmoothingEnabled = false;
            ctx.drawImage(pixelated, 0, 0, pixelated.width, pixelated.height, x, y, w, h);
            ctx.imageSmoothingEnabled = true;
          }
          ctx.restore();
        }
      }

      // Export re-encoded blob & dataUrl
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Berkas gambar versi aman tidak dapat dibuat.'));
            return;
          }
          resolve({ blob, dataUrl: URL.createObjectURL(blob), width, height });
        },
        imageFormat,
        quality
      );
    };

    img.onerror = () => {
      cleanup();
      reject(new Error('Gambar tidak dapat dimuat untuk proses sanitasi.'));
    };
  });
}

