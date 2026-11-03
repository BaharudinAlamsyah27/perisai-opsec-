import type { BoundingBox, OcrWord } from '../types';

interface TesseractWord {
  text?: string;
  confidence?: number;
  bbox?: BoundingBox;
}

interface TesseractBlock {
  paragraphs?: Array<{
    lines?: Array<{
      words?: TesseractWord[];
    }>;
  }>;
}

export function mapTesseractBlocksToWords(
  blocks: TesseractBlock[] | null | undefined,
  scaleX = 1,
  scaleY = 1
): OcrWord[] {
  return (blocks ?? []).flatMap((block) =>
    (block.paragraphs ?? []).flatMap((paragraph) =>
      (paragraph.lines ?? []).flatMap((line) =>
        (line.words ?? []).flatMap((word) => {
          const text = (word.text ?? '').trim();
          if (!text) return [];
          const bbox = word.bbox ?? { x0: 0, y0: 0, x1: 0, y1: 0 };
          return [{
            text,
            conf: typeof word.confidence === 'number' ? word.confidence : 0,
            bbox: {
              x0: Math.round(bbox.x0 * scaleX),
              y0: Math.round(bbox.y0 * scaleY),
              x1: Math.round(bbox.x1 * scaleX),
              y1: Math.round(bbox.y1 * scaleY),
            },
          }];
        })
      )
    )
  );
}
