import React from 'react';
import type { AnalysisFile } from '../types';
import { MIN_OCR_WORD_CONFIDENCE } from '../engine/rules';
import { Eye, Timer } from 'lucide-react';

interface OcrTextPanelProps {
  file: AnalysisFile;
}

export const OcrTextPanel: React.FC<OcrTextPanelProps> = ({ file }) => {
  const words = file.ocrWords ?? [];
  const readable = words.filter((word) => word.conf >= MIN_OCR_WORD_CONFIDENCE).length;
  const ignored = words.length - readable;
  if (file.ocrStatus === 'skipped' || file.status === 'idle' || file.status === 'analyzing') return null;

  return <section className="rounded-xl border border-slate-800 bg-slate-950/80 p-4" aria-label="Teks terbaca OCR">
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-200"><Eye className="h-4 w-4" />TEKS TERBACA (OCR)</h3>
      <span className="text-[11px] text-slate-400">{readable} kata terbaca · {ignored} diabaikan</span>
    </div>
    <p className="mt-2 flex items-center gap-1.5 text-[11px] text-slate-400"><Timer className="h-3.5 w-3.5" />Waktu proses: {file.ocrDurationMs === undefined ? '—' : `${(file.ocrDurationMs / 1000).toFixed(2)} detik`}</p>
    {words.length > 0 ? <p className="mt-3 break-words rounded-lg border border-slate-800 bg-slate-900/70 p-3 text-sm leading-relaxed" aria-label="Teks mentah OCR">
      {words.map((word, index) => {
        const ignoredWord = word.conf < MIN_OCR_WORD_CONFIDENCE;
        return <React.Fragment key={`${word.text}-${index}`}>
          {index > 0 && ' '}
          <span className={ignoredWord ? 'text-slate-600' : 'text-slate-100'} title={`Keyakinan ${Math.round(word.conf)}%`}>
            {word.text}<span className="ml-1 text-[10px] text-slate-500">{Math.round(word.conf)}%</span>{ignoredWord && <span className="ml-1 text-[9px] text-amber-500">diabaikan</span>}
          </span>
        </React.Fragment>;
      })}
    </p> : <p className="mt-3 text-xs text-slate-400">{file.ocrStatus === 'error' ? 'OCR gagal karena error teknis.' : 'OCR berhasil tetapi tidak ada teks yang dikenali.'}</p>}
  </section>;
};
