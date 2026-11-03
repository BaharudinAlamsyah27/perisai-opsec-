import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { getQuickFileFingerprint, sameQuickFileFingerprint } from '../utils/quickFileFingerprint';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadZone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
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
    <div className="w-full">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all duration-300 overflow-hidden ${
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

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-cyan-950/40 text-cyan-400 rounded-2xl border border-cyan-500/30 shadow-inner group-hover:scale-105 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-white tracking-wide">
              Tarik & Letakkan foto di sini, atau <span className="text-cyan-400 underline underline-offset-4 hover:text-cyan-300">pilih berkas</span>
            </p>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Mendukung JPG, PNG, WebP (hingga 25 MB/berkas) • Multi-foto didukung
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-cyan-300/80 bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/40 font-mono">
            <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
          <span>KONTROL OPSEC MILITER • ANALISIS DI PERANGKAT</span>
          </div>
        </div>
      </div>

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

