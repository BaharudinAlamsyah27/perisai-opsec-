import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, AlertCircle } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const UploadZone: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const addFiles = useAnalysisStore((state) => state.addFiles);

  const processFiles = (selectedFiles: FileList | File[]) => {
    setErrorMessage(null);
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
      addFiles(validFiles);
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
        className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10 scale-[1.01]'
            : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800/70 hover:border-slate-600'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,.heic,.heif"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div>
            <p className="text-base font-semibold text-white">
              Tarik & Letakkan foto di sini, atau <span className="text-emerald-400 underline">pilih berkas</span>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Mendukung JPG, PNG, WebP (hingga 25 MB/berkas) • Multi-foto didukung
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-xs text-slate-400 bg-slate-900/60 px-3 py-1 rounded-full border border-slate-800">
            <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
            <span>Foto tidak akan pernah diunggah ke internet</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="mt-3 p-3 bg-rose-950/60 border border-rose-800/80 rounded-xl text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
