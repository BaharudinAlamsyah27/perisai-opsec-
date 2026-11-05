import { describe, expect, it } from 'vitest';
import { binarizeOtsu, preprocessOcrImage, upscaleForSmallText, type RgbaImageData } from '../../src/engine/ocrPreprocess';

function darkScreen(): RgbaImageData {
  const width = 100;
  const height = 60;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let pixel = 0; pixel < width * height; pixel++) {
    const offset = pixel * 4;
    data[offset] = 15;
    data[offset + 1] = 25;
    data[offset + 2] = 35;
    data[offset + 3] = 255;
  }
  // A small bright glyph-like block on the dark terminal background.
  for (let y = 18; y < 24; y++) {
    for (let x = 20; x < 75; x++) {
      if (y === 18 || y === 23 || x === 20 || x === 74 || (x + y) % 7 === 0) {
        const offset = (y * width + x) * 4;
        data[offset] = 245;
        data[offset + 1] = 230;
        data[offset + 2] = 210;
      }
    }
  }
  return { width, height, data };
}

describe('OCR preprocessing for light text on dark screens', () => {
  it('detects dark average luminance, inverts polarity, and stretches contrast', () => {
    const processed = preprocessOcrImage(darkScreen());
    expect(processed.averageLuminance).toBeLessThan(127);
    expect(processed.inverted).toBe(true);
    expect(processed.highPercentile - processed.lowPercentile).toBeGreaterThan(100);
    expect(processed.image.data[(5 * processed.image.width + 5) * 4]).toBeGreaterThanOrEqual(254);
    expect(processed.image.data[(20 * processed.image.width + 22) * 4]).toBe(0);
  });

  it('creates a binary Otsu variant and enlarges small input within the 3200 pixel limit', () => {
    const processed = preprocessOcrImage(darkScreen()).image;
    const binary = binarizeOtsu(processed);
    const colors = new Set<number>();
    for (let index = 0; index < binary.data.length; index += 4) colors.add(binary.data[index] ?? 0);
    expect([...colors].every((color) => color === 0 || color === 255)).toBe(true);

    const enlarged = upscaleForSmallText(processed);
    expect(enlarged.width).toBe(200);
    expect(enlarged.height).toBe(120);
    expect(Math.max(enlarged.width, enlarged.height)).toBeLessThanOrEqual(3200);
  });
});
