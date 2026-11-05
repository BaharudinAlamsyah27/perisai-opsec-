import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle, FlaskConical, Route } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { getQuickFileFingerprint, sameQuickFileFingerprint } from '../utils/quickFileFingerprint';
import { DEMO_SAMPLE_NAMES, fetchPublicSamples } from '../utils/publicSamples';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadZone: React.FC<{ compact?: boolean; onLoadPatternExamples?: () => Promise<void> }> = ({ compact = false, onLoadPatternExamples }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingSamples, setLoadingSamples] = useState(false);
  const [duplicateChoice, setDuplicateChoice] = useState<{
    all: File[];
    unique: File[];
    duplicateCount: number;
  } | null>(null);
  const addFiles = useAnalysisStore((state) => state.addFiles);
  const existingFiles = useAnalysisStore((state) => state.files);

  const processFiles = async (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
    setDuplicateChoice(null);
    const validFiles: File[] = [];

    Array.from(selectedFiles).forEach((file) => {
      // 1. Check size limit (25 MB)
      if (file.size > MAX_FILE_SIZE) {
        setErrorMessage(`Berkas "${file.name}" melebihi batas ukuran maksimal 25 MB.`);
        return;
      }

      // 2. Check format
      const lowerName = file.name.toLowerCase();
      if (lowerName.endsWith('.heic') || lowerName.endsWith('.heif')) {
        setErrorMessage(
          `Berkas "${file.name}" berformat HEIC. Untuk menjaga privasi offline penuh tanpa koneksi, silakan konversi ke JPG/PNG sebelum diperiksa.`
        );
        return;
      }

      if (!ACCEPTED_TYPES.includes(file.type) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
        setErrorMessage(`Format berkas "${file.name}" tidak didukung. Harap gunakan format JPG, PNG, atau WebP.`);
        return;
      }

      validFiles.push(file);
    });

    if (validFiles.length > 0) {
      try {
        const existingFingerprints = await Promise.all(
          existingFiles.map((item) => getQuickFileFingerprint(item.file))
        );
        const incomingFingerprints = await Promise.all(validFiles.map(getQuickFileFingerprint));
        const known = [...existingFingerprints];
        const unique: File[] = [];
        let duplicateCount = 0;

        incomingFingerprints.forEach((fingerprint, index) => {
          if (known.some((candidate) => sameQuickFileFingerprint(candidate, fingerprint))) {
            duplicateCount += 1;
          } else {
            known.push(fingerprint);
            unique.push(validFiles[index]);
          }
        });

        if (duplicateCount > 0) {
          setDuplicateChoice({ all: validFiles, unique, duplicateCount });
        } else {
          addFiles(validFiles);
        }
      } catch {
        setErrorMessage('Berkas tidak dapat diperiksa untuk duplikat. Coba pilih ulang berkasnya.');
      }
    }
  };

  const loadExamples = async () => {
    setLoadingSamples(true);
    setErrorMessage(null);
    try {
      const samples = await fetchPublicSamples(DEMO_SAMPLE_NAMES);
      await processFiles(samples);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Foto contoh tidak dapat dimuat.');
    } finally {
      setLoadingSamples(false);
    }
  };

  const loadPatternExamples = async () => {
    if (!onLoadPatternExamples) return;
    setLoadingSamples(true);
    setErrorMessage(null);
    try {
      await onLoadPatternExamples();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Skenario contoh pola hidup tidak dapat dimuat.');
    } finally {
      setLoadingSamples(false);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
      // Reset input value so same file can be uploaded again if needed
      e.target.value = '';
    }
  };

  return (
    <div className={compact ? 'w-auto min-w-0 shrink-0' : 'w-full min-w-0'}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={0}
        aria-label={compact ? 'Tambah foto' : 'Pilih foto untuk dianalisis'}
        className={`relative text-center cursor-pointer transition-all duration-300 overflow-hidden ${compact ? 'flex min-h-11 items-center rounded-lg border border-cyan-800/70 bg-cyan-950/30 px-3 py-2 hover:border-cyan-500' : 'border-2 border-dashed rounded-2xl p-5 sm:p-12'} ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/30 scale-[1.005] shadow-[0_0_25px_rgba(6,182,212,0.25)]'
            : 'border-slate-800 hover:border-cyan-500/50 bg-slate-950/60 hover:bg-slate-900/50'
        }`}
      >
        {/* HUD Corner Brackets */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,.heic,.heif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className={compact ? 'flex min-w-0 items-center justify-center gap-2' : 'flex flex-col items-center justify-center space-y-3'}>
          <div className={`bg-cyan-950/40 text-cyan-400 rounded-xl border border-cyan-500/30 shadow-inner ${compact ? 'p-1.5' : 'p-4'}`}>
            <UploadCloud className={compact ? 'h-4 w-4' : 'w-8 h-8'} />
          </div>
          <div>
            <p className={compact ? 'text-xs font-semibold text-white' : 'text-base font-semibold text-white tracking-wide'}>
              {compact ? 'Tambah foto' : <>Tarik &amp; Letakkan foto di sini, atau <span className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">pilih berkas</span></>}
            </p>
            {!compact && <p className="text-xs text-slate-400 mt-1 font-mono">
              Mendukung JPG, PNG, WebP (hingga 25 MB/berkas) • Multi-foto didukung
            </p>}
          </div>
          {!compact && <div className="inline-flex items-center space-x-1.5 text-xs text-cyan-300/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40 font-mono">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>KONTROL OPSEC MILITER • ANALISIS DI PERANGKAT</span>
          </div>}
        </div>
      </div>

      {!compact && <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={() => void loadExamples()} disabled={loadingSamples} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-amber-600/60 bg-amber-950/40 px-4 py-2 text-xs font-bold text-amber-100 hover:bg-amber-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-60"><FlaskConical className="h-4 w-4" />{loadingSamples ? 'Memuat contoh…' : 'Coba foto contoh'}</button>
        {onLoadPatternExamples && <button type="button" onClick={() => void loadPatternExamples()} disabled={loadingSamples} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-cyan-700/70 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-60"><Route className="h-4 w-4 shrink-0" /><span>Skenario contoh: seminggu unggahan</span></button>}
        <span className="rounded-full border border-slate-700 px-2.5 py-1 text-[10px] font-mono font-bold tracking-wide text-emerald-200">DATA CONTOH FIKTIF</span>
      </div>}

      {duplicateChoice && (
        <div className="mt-3 rounded-xl border border-amber-700/70 bg-amber-950/40 p-4 text-sm text-amber-100" role="status">
          <p>{duplicateChoice.duplicateCount} foto tampak seperti duplikat berdasarkan nama, ukuran, dan sidik berkas cepat. Apa yang ingin dilakukan?</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                if (duplicateChoice.unique.length > 0) addFiles(duplicateChoice.unique);
                setDuplicateChoice(null);
              }}
              className="rounded-lg border border-amber-500/60 px-3 py-1.5 text-xs font-semibold hover:bg-amber-900/60"
            >
              Lewati yang duplikat
            </button>
            <button
              type="button"
              onClick={() => {
                addFiles(duplicateChoice.all);
                setDuplicateChoice(null);
              }}
              className="rounded-lg border border-slate-600 px-3 py-1.5 text-xs hover:bg-slate-800"
            >
              Tetap tambahkan semua
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2 font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};

