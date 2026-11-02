import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { UploadZone } from '../components/UploadZone';
import { ResultsPanel } from '../components/ResultsPanel';
import { Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { files, activeFileId, setActiveFileId, removeFile, clearAll } = useAnalysisStore();

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  return (
    <div className="space-y-8">
      {/* Upload Zone */}
      <section>
        <UploadZone />
      </section>

      {/* Main Analysis Section */}
      {files.length > 0 && (
        <section className="space-y-6">
          {/* File Carousel / Tab Bar & Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1 max-w-full">
              {files.map((file) => {
                const isSelected = file.id === (activeFile?.id ?? '');
                return (
                  <button
                    key={file.id}
                    onClick={() => setActiveFileId(file.id)}
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all border ${
                      isSelected
                        ? 'bg-emerald-600/20 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    {file.status === 'analyzing' && (
                      <Loader2 className="w-3 h-3 animate-spin text-emerald-400" />
                    )}
                    {file.score && (
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          file.score.value >= 75
                            ? 'bg-rose-500/30 text-rose-300'
                            : file.score.value >= 25
                            ? 'bg-amber-500/30 text-amber-300'
                            : 'bg-emerald-500/30 text-emerald-300'
                        }`}
                      >
                        {file.score.value}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <button
              onClick={clearAll}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Hapus Semua Sesi</span>
            </button>
          </div>

          {/* Active File Content View */}
          {activeFile && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Preview & File Meta */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-lg">
                  <div className="relative group rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                    <img
                      src={activeFile.previewUrl}
                      alt={activeFile.name}
                      className="object-contain w-full h-full max-h-80"
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span className="font-medium text-slate-200 truncate">{activeFile.name}</span>
                    </div>
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      <span>{(activeFile.size / 1024).toFixed(1)} KB</span>
                      <button
                        onClick={() => removeFile(activeFile.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                        title="Hapus foto ini"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Technical Meta summary */}
                {activeFile.exif && Object.keys(activeFile.exif).length > 0 && (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                    <span className="text-[11px] font-semibold text-slate-300 block uppercase tracking-wider">
                      Rincian Metadata Terbaca
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-400">Kamera / HP:</span>
                        <span className="text-slate-200">{activeFile.exif.make || '-'} {activeFile.exif.model || ''}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Waktu Foto:</span>
                        <span className="text-slate-200">{activeFile.exif.takenAt || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Nomor Seri:</span>
                        <span className="text-slate-200 font-mono">{activeFile.exif.serialNumber || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-400">Software:</span>
                        <span className="text-slate-200 truncate block">{activeFile.exif.software || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Results & Analysis Findings */}
              <div className="lg:col-span-7">
                <ResultsPanel file={activeFile} />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
