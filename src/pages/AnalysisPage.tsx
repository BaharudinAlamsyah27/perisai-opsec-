import React from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { UploadZone } from '../components/UploadZone';
import { ResultsPanel } from '../components/ResultsPanel';
import { GlobeHero } from '../components/GlobeHero';
import { ScanOverlay } from '../components/ScanOverlay';
import { AnalysisConsole } from '../components/AnalysisConsole';
import { StatTiles } from '../components/StatTiles';
import { CaptionAnalysis } from '../components/CaptionAnalysis';
import { SanitizerPreview } from '../components/SanitizerPreview';
import { Trash2, FileText, Image as ImageIcon, Loader2 } from 'lucide-react';

export const AnalysisPage: React.FC = () => {
  const { files, activeFileId, setActiveFileId, removeFile, clearAll } = useAnalysisStore();
  const [hoveredFindingId, setHoveredFindingId] = React.useState<string | null>(null);

  const activeFile = files.find((f) => f.id === activeFileId) ?? files[0];

  const targetGPS =
    activeFile?.exif?.latitude !== undefined && activeFile?.exif?.longitude !== undefined
      ? { latitude: activeFile.exif.latitude, longitude: activeFile.exif.longitude }
      : undefined;

  return (
    <div className="space-y-8">
      {/* Session Stats Banner */}
      <section>
        <StatTiles files={files} />
      </section>

      {/* Hero: Command Center OPSEC (Upload Zone + 3D Tactical Globe) */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-8 flex flex-col">
          <UploadZone />
        </div>
        <div className="lg:col-span-4 bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden shadow-2xl">
          <div className="w-full flex items-center justify-between pb-2 mb-1 border-b border-slate-800/80 text-[10px] font-mono text-cyan-400">
            <span>GLOBE GEOLOKASI (WASM)</span>
            <span className="text-slate-500">OFFLINE 3D</span>
          </div>
          <div className="flex-1 flex items-center justify-center py-1">
            <GlobeHero targetLocation={targetGPS} />
          </div>
        </div>
      </section>

      {/* Caption Analysis Section (F-07 / T-015) */}
      <section>
        <CaptionAnalysis />
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
                    className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all border ${
                      isSelected
                        ? 'bg-cyan-950/60 border-cyan-500/80 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="max-w-[120px] truncate">{file.name}</span>
                    {file.status === 'analyzing' && (
                      <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
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
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono text-rose-400 hover:bg-rose-950/40 border border-rose-900/40 transition-colors self-start sm:self-auto"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>RESET SEMUA SESI</span>
            </button>
          </div>

          {/* Active File Content View */}
          {activeFile && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Image Preview with ScanOverlay & Terminal Logs */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 overflow-hidden shadow-2xl relative">
                  <div className="relative group rounded-xl overflow-hidden bg-slate-900 aspect-video flex items-center justify-center">
                    <img
                      src={activeFile.previewUrl}
                      alt={activeFile.name}
                      className="object-contain w-full h-full max-h-80"
                    />

                    {/* ScanOverlay HUD with Scanline & Interactive Target Lock BBoxes */}
                    <ScanOverlay
                      isScanning={activeFile.status === 'analyzing'}
                      progress={activeFile.ocrProgress || 0}
                      findings={activeFile.score?.findings || []}
                      hoveredFindingId={hoveredFindingId}
                      onHoverFinding={setHoveredFindingId}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-3">
                    <div className="flex items-center space-x-2 truncate">
                      <FileText className="w-4 h-4 text-cyan-400 flex-shrink-0" />
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

                {/* Analysis Terminal Console */}
                <AnalysisConsole logs={activeFile.logs || []} />

                {/* Technical Meta summary */}
                {activeFile.exif && Object.keys(activeFile.exif).length > 0 && (
                  <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 text-xs font-mono space-y-2">
                    <span className="text-[10px] font-semibold text-cyan-400 block uppercase tracking-wider">
                      RINCIAN METADATA EXIF TERDETEKSI
                    </span>
                    <div className="grid grid-cols-2 gap-2 text-slate-400">
                      <div>
                        <span className="block text-[10px] text-slate-500">KAMERA / HP:</span>
                        <span className="text-slate-200">{activeFile.exif.make || '-'} {activeFile.exif.model || ''}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">WAKTU DIAMBIL:</span>
                        <span className="text-slate-200">{activeFile.exif.takenAt || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">NOMOR SERI:</span>
                        <span className="text-slate-200 font-mono">{activeFile.exif.serialNumber || '-'}</span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-slate-500">SOFTWARE PENGOLAH:</span>
                        <span className="text-slate-200 truncate block">{activeFile.exif.software || '-'}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Results & Analysis Findings & Sanitizer */}
              <div className="lg:col-span-7 space-y-6">
                <ResultsPanel
                  file={activeFile}
                  hoveredFindingId={hoveredFindingId}
                  onHoverFinding={setHoveredFindingId}
                />

                {/* Sanitizer & Comparison Preview (T-017, T-018, T-019) */}
                <SanitizerPreview file={activeFile} />
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
