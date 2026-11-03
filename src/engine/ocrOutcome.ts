import type { OcrWord } from '../types';

export type OcrOutcome = 'error' | 'recognized' | 'empty';

export function getOcrOutcome(result: { error?: string; words: OcrWord[] }): OcrOutcome {
  if (result.error) return 'error';
  return result.words.length > 0 ? 'recognized' : 'empty';
}
