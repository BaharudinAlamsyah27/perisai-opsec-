import React from 'react';
import type { AnalysisFile } from '../types';
import { MIN_OCR_WORD_CONFIDENCE } from '../engine/rules';
import { useCaptionStore } from '../store/useCaptionStore';
import { AlertTriangle, ClipboardCheck } from 'lucide-react';

interface AnalysisCoverageProps {
  file: AnalysisFile;
}

export const AnalysisCoverage: React.FC<AnalysisCoverageProps> = ({ file }) => {
  const caption = useCaptionStore((state) => state.caption);
  const words = file.ocrWords ?? [];
  const readableWords = words.filter((word) => word.conf >= MIN_OCR_WORD_CONFIDENCE).length;
  const ignoredWords = words.length - readableWords;
  const confidenceLowOnly = file.ocrStatus === 'recognized' && words.length > 0 && readableWords === 0;
  const metadataPresent = Object.values(file.exif ?? {}).some((value) => value !== undefined && value !== null && value !== '');
  const caution = !file.ocrStatus || file.ocrStatus === 'empty' || file.ocrStatus === 'error' || file.ocrStatus === 'skipped' || (file.ocrStatus === 'recognized' && readableWords === 0);
  const ocrSummary = confidenceLowOnly
    ? `${words.length} kata terbaca tetapi keyakinan rendah`
    : file.ocrStatus === 'error'
    ? 'gagal'
    : file.ocrStatus === 'empty' ? 'tidak ada teks'
      : file.ocrStatus === 'skipped' || !file.ocrStatus ? 'tidak dijalankan'
        : `${readableWords} kata terbaca / ${ignoredWords} diabaikan`;

  return <section className={`rounded-xl border p-4 ${caution ? 'border-amber-700/70 bg-amber-950/30' : 'border-slate-800 bg-slate-950/80'}`} aria-label="Cakupan pemeriksaan">
    <h3 className="flex items-center gap-2 font-mono text-xs font-bold text-cyan-200"><ClipboardCheck className="h-4 w-4" />CAKUPAN PEMERIKSAAN</h3>
    {caution && <p role="alert" className="mt-3 flex items-start gap-2 text-sm font-semibold text-amber-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />{confidenceLowOnly ? `${words.length} kata terbaca tetapi keyakinan rendah.` : 'Teks pada gambar tidak terbaca, hasil mungkin tidak lengkap.'} {confidenceLowOnly && <a className="underline underline-offset-2" href="#ocr-raw-transcript">Lihat teks mentah</a>}</p>}
    <ul className="mt-3 grid gap-2 text-xs text-slate-200 sm:grid-cols-2">
      <li>Metadata EXIF: <strong>{metadataPresent ? 'ditemukan' : 'tidak ditemukan pada file ini'}</strong></li>
      <li>OCR: <strong>{ocrSummary}</strong></li>
      <li>Aturan: <strong>{file.score?.findings.filter((finding) => finding.source === 'ocr').length ?? 0} kecocokan</strong></li>
      <li>Caption: <strong>{caption.trim() ? 'diisi' : 'tidak diisi'}</strong></li>
    </ul>
    {!metadataPresent && <p className="mt-3 rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-xs leading-relaxed text-slate-300">Metadata yang tidak ditemukan tidak membuktikan file aman; metadata mungkin sudah dihapus sebelum file ini dipilih. Untuk memeriksa metadata sebelum unggahan media sosial, pilih file asli dari perangkat. Teks pada gambar dan caption tetap diperiksa secara terpisah.</p>}
    {file.ocrStatus === 'error' && file.logs?.some((log) => log.message.includes('OCR GAGAL')) && <p className="mt-2 break-words text-[11px] text-amber-100">Detail teknis: {file.logs.find((log) => log.message.includes('OCR GAGAL'))?.message.replace(/^.*OCR GAGAL \(ERROR TEKNIS\): /, '')}</p>}
    <p className="mt-3 border-t border-slate-800 pt-3 text-xs text-slate-400">Isi visual (wajah, seragam, objek, lokasi) tidak diperiksa.</p>
  </section>;
};
