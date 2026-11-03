import type { Finding, OcrWord, BoundingBox } from '../types';

/**
 * Maps findings derived from text analysis to OCR words' bounding boxes.
 * When a finding evidence spans multiple consecutive words, their bounding boxes
 * are merged into a single enclosing bounding box.
 */
export function mapOcrWordsToFindings(
  words: OcrWord[],
  findings: Finding[]
): Finding[] {
  if (!words || words.length === 0 || !findings || findings.length === 0) {
    return findings;
  }

  return findings.map((finding) => {
    // If finding already has a bounding box, keep it
    if (finding.bbox) return finding;

    const evidenceWords = finding.evidence
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean);

    if (evidenceWords.length === 0) return finding;

    // Search for sequence of matching words in OCR words
    let matchedBboxes: BoundingBox[] = [];

    for (let i = 0; i <= words.length - evidenceWords.length; i++) {
      let match = true;
      for (let j = 0; j < evidenceWords.length; j++) {
        const ocrClean = words[i + j].text.toLowerCase().replace(/[^a-z0-9]/gi, '');
        const evClean = evidenceWords[j].toLowerCase().replace(/[^a-z0-9]/gi, '');

        if (!ocrClean.includes(evClean) && !evClean.includes(ocrClean)) {
          match = false;
          break;
        }
      }

      if (match) {
        matchedBboxes = words.slice(i, i + evidenceWords.length).map((w) => w.bbox);
        break;
      }
    }

    if (matchedBboxes.length > 0) {
      // Merge into enclosing bbox
      const mergedBbox: BoundingBox = {
        x0: Math.min(...matchedBboxes.map((b) => b.x0)),
        y0: Math.min(...matchedBboxes.map((b) => b.y0)),
        x1: Math.max(...matchedBboxes.map((b) => b.x1)),
        y1: Math.max(...matchedBboxes.map((b) => b.y1)),
      };

      return {
        ...finding,
        bbox: mergedBbox,
      };
    }

    return finding;
  });
}
