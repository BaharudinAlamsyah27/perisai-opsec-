export interface RgbaImageData {
  width: number;
  height: number;
  data: Uint8ClampedArray;
}

export interface OcrPreprocessResult {
  image: RgbaImageData;
  averageLuminance: number;
  inverted: boolean;
  lowPercentile: number;
  highPercentile: number;
}

export const OCR_MAX_LONG_SIDE = 3200;

function luminanceAt(data: Uint8ClampedArray, offset: number): number {
  return 0.2126 * data[offset] + 0.7152 * data[offset + 1] + 0.0722 * data[offset + 2];
}

function percentile(histogram: Uint32Array, total: number, ratio: number): number {
  const target = Math.floor((total - 1) * ratio);
  let sum = 0;
  for (let value = 0; value < histogram.length; value++) {
    sum += histogram[value];
    if (sum > target) return value;
  }
  return 255;
}

export function preprocessOcrImage(image: RgbaImageData): OcrPreprocessResult {
  const pixelCount = image.width * image.height;
  if (pixelCount === 0 || image.data.length < pixelCount * 4) throw new Error('Data gambar OCR tidak valid.');

  const gray = new Uint8ClampedArray(pixelCount);
  const histogram = new Uint32Array(256);
  let luminanceSum = 0;
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const value = luminanceAt(image.data, pixel * 4);
    luminanceSum += value;
    const rounded = Math.round(value);
    gray[pixel] = rounded;
    histogram[rounded]++;
  }

  const averageLuminance = luminanceSum / pixelCount;
  const inverted = averageLuminance < 127;
  const lowPercentile = percentile(histogram, pixelCount, 0.02);
  const highPercentile = percentile(histogram, pixelCount, 0.98);
  const range = Math.max(1, highPercentile - lowPercentile);
  const data = new Uint8ClampedArray(pixelCount * 4);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const source = inverted ? 255 - gray[pixel] : gray[pixel];
    const contrasted = Math.round(Math.max(0, Math.min(255, (source - lowPercentile) * 255 / range)));
    const targetOffset = pixel * 4;
    data[targetOffset] = contrasted;
    data[targetOffset + 1] = contrasted;
    data[targetOffset + 2] = contrasted;
    data[targetOffset + 3] = image.data[targetOffset + 3];
  }

  return {
    image: { width: image.width, height: image.height, data },
    averageLuminance,
    inverted,
    lowPercentile,
    highPercentile,
  };
}

export function binarizeOtsu(image: RgbaImageData): RgbaImageData {
  const histogram = new Uint32Array(256);
  const pixelCount = image.width * image.height;
  let totalWeighted = 0;
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const value = Math.round(luminanceAt(image.data, pixel * 4));
    histogram[value]++;
    totalWeighted += value;
  }

  let backgroundWeight = 0;
  let backgroundSum = 0;
  let maxVariance = -1;
  let threshold = 127;
  for (let value = 0; value < 256; value++) {
    backgroundWeight += histogram[value];
    if (backgroundWeight === 0) continue;
    const foregroundWeight = pixelCount - backgroundWeight;
    if (foregroundWeight === 0) break;
    backgroundSum += value * histogram[value];
    const backgroundMean = backgroundSum / backgroundWeight;
    const foregroundMean = (totalWeighted - backgroundSum) / foregroundWeight;
    const variance = backgroundWeight * foregroundWeight * (backgroundMean - foregroundMean) ** 2;
    if (variance > maxVariance) {
      maxVariance = variance;
      threshold = value;
    }
  }

  const data = new Uint8ClampedArray(image.data.length);
  for (let pixel = 0; pixel < pixelCount; pixel++) {
    const offset = pixel * 4;
    const value = luminanceAt(image.data, offset) > threshold ? 255 : 0;
    data[offset] = value;
    data[offset + 1] = value;
    data[offset + 2] = value;
    data[offset + 3] = image.data[offset + 3];
  }
  return { width: image.width, height: image.height, data };
}

export function upscaleForSmallText(image: RgbaImageData): RgbaImageData {
  const longSide = Math.max(image.width, image.height);
  const factor = Math.min(2, OCR_MAX_LONG_SIDE / longSide);
  if (factor < 1.5) return image;
  const width = Math.min(OCR_MAX_LONG_SIDE, Math.round(image.width * factor));
  const height = Math.min(OCR_MAX_LONG_SIDE, Math.round(image.height * factor));
  const data = new Uint8ClampedArray(width * height * 4);

  for (let y = 0; y < height; y++) {
    const sourceY = ((y + 0.5) * image.height / height) - 0.5;
    const y0 = Math.max(0, Math.floor(sourceY));
    const y1 = Math.min(image.height - 1, y0 + 1);
    const yWeight = Math.max(0, sourceY - y0);
    for (let x = 0; x < width; x++) {
      const sourceX = ((x + 0.5) * image.width / width) - 0.5;
      const x0 = Math.max(0, Math.floor(sourceX));
      const x1 = Math.min(image.width - 1, x0 + 1);
      const xWeight = Math.max(0, sourceX - x0);
      const target = (y * width + x) * 4;
      for (let channel = 0; channel < 4; channel++) {
        const topLeft = image.data[(y0 * image.width + x0) * 4 + channel];
        const topRight = image.data[(y0 * image.width + x1) * 4 + channel];
        const bottomLeft = image.data[(y1 * image.width + x0) * 4 + channel];
        const bottomRight = image.data[(y1 * image.width + x1) * 4 + channel];
        const top = topLeft + (topRight - topLeft) * xWeight;
        const bottom = bottomLeft + (bottomRight - bottomLeft) * xWeight;
        data[target + channel] = Math.round(top + (bottom - top) * yWeight);
      }
    }
  }
  return { width, height, data };
}
