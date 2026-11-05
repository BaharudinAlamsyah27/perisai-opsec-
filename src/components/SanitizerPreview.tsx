import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import type { AnalysisFile } from '../types';
import { sanitizeImage, RedactionStyle } from '../engine/sanitize';
import { ShieldCheck, Download, Sliders, Eye, RefreshCw } from 'lucide-react';
import { readMetadataFromFile } from '../engine/metadata';
import { runOcr } from '../engine/ocr';
import { analyzeText, buildOcrTextTokens } from '../engine/rules';
import { useDikStore } from '../store/useDikStore';
import { mapOcrWordsToFindings } from '../engine/ocr-mapper';
import { applyComboBoost } from '../engine/combos';
import { calculateScore } from '../engine/scoring';
import { useAnalysisStore } from '../store/useAnalysisStore';
import type { ExifData, Score } from '../types';

interface SanitizerPreviewProps {
  file: AnalysisFile;
  className?: string;
}

export const SanitizerPreview: React.FC<SanitizerPreviewProps> = ({ file, className = '' }) => {
  const [style, setStyle] = useState<RedactionStyle>('blackbox');
  const [sliderPos, setSliderPos] = useState<number>(50); // percentage 0-100
  const [sanitizedUrl, setSanitizedUrl] = useState<string | null>(null);
  const [sanitizedBlob, setSanitizedBlob] = useState<Blob | null>(null);
  const [safeScore, setSafeScore] = useState<Score | null>(null);
  const [safeExif, setSafeExif] = useState<ExifData | null>(null);
  const [reanalysis, setReanalysis] = useState<'pending' | 'running' | 'done' | 'error'>('pending');
  const [reanalysisError, setReanalysisError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const requestId = useRef(0);
  const activeProfile = useAnalysisStore((state) => state.activeProfile);

  const bboxes = useMemo(
    () => (file.score?.findings || []).flatMap((finding) => {
      const bbox = finding.bbox;
      return bbox && finding.source === 'ocr'
        && [bbox.x0, bbox.y0, bbox.x1, bbox.y1].every(Number.isFinite)
        && bbox.x1 > bbox.x0 && bbox.y1 > bbox.y0 ? [bbox] : [];
    }),
    [file.score?.findings]
  );
  const exifCountBefore = useMemo(
    () => Object.values(file.exif ?? {}).filter((value) => value !== undefined && value !== null && value !== '').length,
    [file.exif]
  );
  const exifCountAfter = safeExif
    ? Object.values(safeExif).filter((value) => value !== undefined && value !== null && value !== '').length
    : null;

  const handleGenerateSanitized = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsProcessing(true);
    setError(null);
    setSanitizedUrl((previousUrl) => {
      if (previousUrl) URL.revokeObjectURL(previousUrl);
      return null;
    });
    setSanitizedBlob(null);
    setSafeScore(null);
    setSafeExif(null);
    setReanalysis('pending');
    setReanalysisError(null);
    try {
      const result = await sanitizeImage(file.file, {
        bboxes,
        redactionStyle: style,
        imageFormat: 'image/jpeg',
      });
      if (requestId.current === currentRequest) {
        setSanitizedUrl(result.dataUrl);
        setSanitizedBlob(result.blob);
      }
      else URL.revokeObjectURL(result.dataUrl);
    } catch (cause) {
      if (requestId.current === currentRequest) {
        setError(cause instanceof Error ? cause.message : 'Gagal membuat versi aman.');
      }
    } finally {
      if (requestId.current === currentRequest) setIsProcessing(false);
    }
  }, [file.file, style, bboxes]);

  useEffect(() => {
    if (!sanitizedBlob) return;
    let cancelled = false;
    setReanalysis('running');
    setReanalysisError(null);
    void (async () => {
      try {
        const safeFile = new File([sanitizedBlob], 'perisai-opsec-versi-aman.jpg', { type: 'image/jpeg' });
        const { exif, findings: metadataFindings } = await readMetadataFromFile(safeFile);
        const ocrResult = await runOcr(safeFile);
        if (ocrResult.error) throw new Error(ocrResult.error);
        const recognized = buildOcrTextTokens(ocrResult.words);
        const ocrFindings = mapOcrWordsToFindings(ocrResult.words, analyzeText(recognized.text, 'ocr', recognized.tokens, useDikStore.getState().entries));
        const score = calculateScore(applyComboBoost([...metadataFindings, ...ocrFindings]), activeProfile);
        if (!cancelled) {
          setSafeExif(exif);
          setSafeScore(score);
          setReanalysis('done');
        }
      } catch (cause) {
        if (!cancelled) {
          setReanalysisError(cause instanceof Error ? cause.message : 'Analisis ulang versi aman gagal.');
          setReanalysis('error');
        }
      }
    })();
    return () => { cancelled = true; };
  }, [sanitizedBlob, activeProfile]);

  useEffect(() => {
    handleGenerateSanitized();
  }, [handleGenerateSanitized]);

  useEffect(() => () => {
    requestId.current += 1;
    if (sanitizedUrl) URL.revokeObjectURL(sanitizedUrl);
  }, [sanitizedUrl]);

  const handleDownload = () => {
    if (!sanitizedUrl) return;
    const a = document.createElement('a');
    a.href = sanitizedUrl;
    a.download = 'perisai-opsec-versi-aman.jpg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className={`bg-slate-950/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl ${className}`}>
      {/* HUD Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-4 border-b border-slate-800/80">
        <div>
          <h3 className="text-sm font-bold text-slate-100 tracking-wider font-mono flex items-center space-x-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>VERSI AMAN &amp; SANITASI METADATA</span>
          </h3>
          <p className="text-xs text-slate-400 font-sans mt-0.5">
            Metadata EXIF &amp; GPS dihapus 100%. Area visual sensitif disensor otomatis.
          </p>
        </div>

        {/* Style Selector */}
        <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-800 p-1 rounded-xl text-xs font-mono self-start sm:self-auto">
          <span className="text-slate-400 text-[10px] px-1.5">GAYA SENSOR:</span>
          <button
            onClick={() => setStyle('blackbox')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              style === 'blackbox'
                ? 'bg-cyan-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Blok Hitam
          </button>
          <button
            onClick={() => setStyle('blur')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              style === 'blur'
                ? 'bg-cyan-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Mosaik Gelap
          </button>
          <button
            onClick={() => setStyle('pixelate')}
            className={`px-2.5 py-1 rounded-lg transition-all ${
              style === 'pixelate'
                ? 'bg-cyan-600 text-white font-semibold shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pixelate
          </button>
        </div>
      </div>

      {/* Comparison Slider (Before / After) */}
      <div className="space-y-3">
        <div className="relative rounded-xl overflow-hidden bg-slate-900 border border-slate-800 aspect-video flex items-center justify-center select-none group">
          {/* Base Image (Original Before) */}
          <img
            src={file.previewUrl}
            alt="Foto asli sebelum disensor"
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          {/* Masked Image (Sanitized After) */}
          {sanitizedUrl && (
            <div
              style={{ clipPath: `inset(0 0 0 ${sliderPos}%)` }}
              className="absolute inset-0 w-full h-full pointer-events-none"
            >
              <img
                src={sanitizedUrl}
                alt="Foto versi aman setelah disensor"
                className="w-full h-full object-contain"
              />
            </div>
          )}

          {/* Divider Line */}
          <div
            style={{ left: `${sliderPos}%` }}
            className="absolute inset-y-0 w-0.5 bg-cyan-400 shadow-[0_0_10px_#06b6d4] pointer-events-none z-10"
          >
            <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-6 h-6 rounded-full bg-slate-950 border-2 border-cyan-400 flex items-center justify-center shadow-md">
              <Sliders className="w-3 h-3 text-cyan-400" />
            </div>
          </div>

          {/* Badges: SEBELUM vs SESUDAH */}
          <div className="absolute top-3 left-3 bg-slate-950/80 border border-rose-500/60 px-2 py-0.5 rounded text-[10px] font-mono text-rose-300 pointer-events-none z-10">
            ASLI (BERISIKO: {file.score?.value || 0}/100)
          </div>
          <div className="absolute top-3 right-3 bg-slate-950/80 border border-emerald-500/60 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 pointer-events-none z-10">
            {reanalysis === 'done' && safeScore ? `VERSI AMAN · SKOR: ${file.score?.value ?? 0} → ${safeScore.value}` : reanalysis === 'error' ? 'ANALISIS ULANG GAGAL' : reanalysis === 'running' ? 'MEMPROSES ANALISIS ULANG…' : 'MENYIAPKAN VERSI AMAN…'}
          </div>
        </div>

        {/* Range Slider Control */}
        <div className="flex items-center space-x-3 px-1">
          <Eye className="w-3.5 h-3.5 text-slate-400" />
          <label className="sr-only" htmlFor={`sanitizer-slider-${file.id}`}>Perbandingan foto asli dan versi aman</label>
          <input
            id={`sanitizer-slider-${file.id}`}
            type="range"
            min="0"
            max="100"
            value={sliderPos}
            onChange={(e) => setSliderPos(Number(e.target.value))}
            className="w-full accent-cyan-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] font-mono text-slate-400 w-12 text-right">{sliderPos}%</span>
        </div>
      </div>

      {reanalysis === 'running' && <p className="mt-2 text-xs text-cyan-200" role="status" aria-live="polite">Memproses analisis ulang versi aman. EXIF dibaca ulang dan OCR dijalankan pada gambar hasil encode, dengan batas waktu 45 detik.</p>}
      {reanalysis === 'done' && safeExif && safeScore && <div className="mt-3 rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-3 text-xs text-emerald-200" role="status" aria-live="polite">
        <p className="font-semibold">Skor: {file.score?.value ?? 0} → {safeScore.value} · Temuan: {file.score?.findings.length ?? 0} → {safeScore.findings.length}</p>
        <ul className="mt-2 space-y-1">
          <li>✓ Metadata EXIF dihapus ({exifCountBefore} → {exifCountAfter ?? 0})</li>
          <li>✓ {bboxes.length} area teks disensor</li>
          <li>✓ Hasil dianalisis ulang: {safeExif.latitude !== undefined && safeExif.longitude !== undefined ? 'GPS masih terdeteksi' : 'tidak ada GPS'}</li>
        </ul>
      </div>}
      {reanalysis === 'error' && <p role="alert" className="mt-2 text-xs text-amber-200">Analisis ulang belum selesai: {reanalysisError}</p>}

      {/* Action Download Row */}
      <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="text-xs font-mono text-slate-400 flex items-center space-x-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>HASIL DI-ENCODE ULANG UNTUK MENGHAPUS METADATA; PERIKSA SENSOR SEBELUM DIGUNAKAN.</span>
        </div>

        {error && <p role="alert" className="text-xs text-rose-300">Versi aman gagal dibuat: {error}</p>}

        <button
          onClick={handleDownload}
          disabled={!sanitizedUrl || isProcessing}
          className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-mono text-xs font-bold transition-all shadow-lg shadow-emerald-950/50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>MEMPROSES PENGODEAN ULANG...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>UNDUH FOTO VERSI AMAN</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

