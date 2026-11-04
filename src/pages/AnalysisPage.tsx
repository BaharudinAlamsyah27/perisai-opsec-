import React, { useEffect, useState } from 'react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { UploadZone } from '../components/UploadZone';
import { ResultsPanel } from '../components/ResultsPanel';
import { GlobeHero } from '../components/GlobeHero';
import { ScanOverlay } from '../components/ScanOverlay';
import { AnalysisConsole } from '../components/AnalysisConsole';
import { CaptionAnalysis } from '../components/CaptionAnalysis';
import { SanitizerPreview } from '../components/SanitizerPreview';
import { BriefIntel } from '../components/BriefIntel';
import { Trash2, FileText, Image as ImageIcon, Loader2, ShieldCheck, Printer } from 'lucide-react';
import { RiskReport } from '../components/RiskReport';
import { ScoreGauge } from '../components/ScoreGauge';
import { RiskRadar } from '../components/RiskRadar';
import { PROFILE_MULTIPLIERS } from '../engine/scoring';
import { useAnalysisStore as analysisStore } from '../store/useAnalysisStore';
import { MIN_OCR_WORD_CONFIDENCE, isContextOnlyFindings } from '../engine/rules';

const TABS = [
  { id: 'findings', label: 'Temuan' },
  { id: 'metadata', label: 'Metadata' },
  { id: 'safe', label: 'Versi Aman' },
  { id: 'logs', label: 'Log' },
] as const;
type DashboardTab = typeof TABS[number]['id'];

export const AnalysisPage: React.FC = () => {
  const { files, activeFileId, setActiveFileId, removeFile, clearAll } = useAnalysisStore();
  const { activeProfile, setActiveProfile } = analysisStore();
  const [hoveredFindingId, setHoveredFindingId] = useState<string | null>(null);
  const [tab, setTab] = useState<DashboardTab>('findings');
  const [reportOpen, setReportOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [pendingFindingId, setPendingFindingId] = useState<string | null>(null);

  const activeFile = files.find((file) => file.id === activeFileId) ?? files[0];
  const targetGPS = activeFile?.exif?.latitude !== undefined && activeFile?.exif?.longitude !== undefined
    ? { latitude: activeFile.exif.latitude, longitude: activeFile.exif.longitude }
    : undefined;
  const findings = activeFile?.score?.findings ?? [];
  const confidentOcrCount = activeFile?.ocrWords?.filter((word) => word.conf >= MIN_OCR_WORD_CONFIDENCE).length ?? 0;
  const limitedCoverage = activeFile?.status === 'done' && findings.length === 0
    && (!activeFile.ocrStatus || activeFile.ocrStatus === 'empty' || activeFile.ocrStatus === 'error' || activeFile.ocrStatus === 'skipped' || (activeFile.ocrStatus === 'recognized' && confidentOcrCount === 0));
  const contextRiskLabel = activeFile?.score && activeFile.score.value > 0 && activeFile.score.value < 50 && isContextOnlyFindings(findings)
    ? 'Perlu verifikasi publikasi' : undefined;
  const topFindings = [...findings].sort((a, b) => {
    const rank = { critical: 0, high: 1, medium: 2, low: 3, info: 4 };
    return rank[a.severity] - rank[b.severity];
  }).slice(0, 2);

  const selectFinding = (id: string) => {
    setHoveredFindingId(id);
    setPendingFindingId(id);
    setTab('findings');
  };

  useEffect(() => {
    if (!pendingFindingId || tab !== 'findings') return;
    const layout = window.matchMedia?.('(min-width: 1024px)').matches ? 'desktop' : 'mobile';
    document.getElementById(`finding-${layout}-${pendingFindingId}`)?.scrollIntoView?.({ block: 'nearest', behavior: 'smooth' });
    setPendingFindingId(null);
  }, [pendingFindingId, tab]);

  return <div className="space-y-4">
    {!activeFile ? <section className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-12" aria-label="Mulai analisis">
      <div className="lg:col-span-8"><UploadZone /></div>
      <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-2xl border border-slate-800 bg-slate-950/80 p-4 shadow-2xl lg:col-span-4">
        <div className="mb-2 w-full border-b border-slate-800 pb-2 font-mono text-[10px] text-cyan-400">GLOBE GEOLOKASI · OFFLINE 3D</div>
        <GlobeHero targetLocation={undefined} />
      </div>
      <CaptionAnalysis className="lg:col-span-12" />
    </section> : <>
      <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950/80 p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><ImageIcon className="h-4 w-4 shrink-0 text-cyan-400" /><span className="truncate text-xs text-slate-300">{files.length} foto dalam sesi · {activeFile.name}</span></div>
        <div className="flex items-center gap-2"><UploadZone compact /><button type="button" onClick={clearAll} className="rounded-lg border border-rose-900/70 px-3 py-2 text-xs text-rose-300 hover:bg-rose-950/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><Trash2 className="inline h-3.5 w-3.5" /> Reset</button></div>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Pilih foto">
        {files.map((file) => <button key={file.id} type="button" onClick={() => setActiveFileId(file.id)} aria-pressed={file.id === activeFile.id} className={`flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-xs ${file.id === activeFile.id ? 'border-cyan-500 bg-cyan-950/60 text-cyan-200' : 'border-slate-800 bg-slate-900 text-slate-400'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400`}><span className="max-w-36 truncate">{file.name}</span>{file.status === 'analyzing' && <Loader2 className="h-3 w-3 animate-spin" />}{file.score && <span>{file.score.value}</span>}</button>)}
      </div>

      <section className="grid grid-cols-1 items-start gap-4 lg:grid-cols-12" aria-label="Dasbor hasil analisis">
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-3 shadow-xl lg:col-span-4">
          <div style={{ width: imageSize.width && imageSize.height ? `min(100%, ${360 * imageSize.width / imageSize.height}px)` : '100%', aspectRatio: imageSize.width && imageSize.height ? `${imageSize.width}/${imageSize.height}` : '16/9' }} className="relative mx-auto overflow-hidden rounded-xl bg-slate-900">
            <img src={activeFile.previewUrl} alt={activeFile.name} onLoad={(event) => setImageSize({ width: event.currentTarget.naturalWidth, height: event.currentTarget.naturalHeight })} className="h-full w-full object-contain" />
            <ScanOverlay isScanning={activeFile.status === 'analyzing'} progress={activeFile.ocrProgress || 0} findings={findings} imageWidth={imageSize.width} imageHeight={imageSize.height} hoveredFindingId={hoveredFindingId} onHoverFinding={setHoveredFindingId} onSelectFinding={selectFinding} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-2 border-t border-slate-800 pt-2 text-xs text-slate-400"><span className="flex min-w-0 items-center gap-2"><FileText className="h-4 w-4 shrink-0 text-cyan-400" /><span className="truncate">{activeFile.name}</span></span><button type="button" aria-label="Hapus foto ini" onClick={() => removeFile(activeFile.id)} className="rounded p-2 text-slate-400 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><Trash2 className="h-4 w-4" /></button></div>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 lg:col-span-4">
          <div className="flex flex-col items-center justify-center gap-3 2xl:flex-row"><ScoreGauge score={activeFile.score?.value ?? 0} level={activeFile.score?.level ?? 'Aman'} size={128} suppressLevelLabel={limitedCoverage} levelLabel={contextRiskLabel} /><RiskRadar findings={findings} /></div>
          <p className="my-2 text-center text-xs text-slate-400">Profil penilaian</p>
          <div className="flex flex-wrap justify-center gap-2">{(['prajurit', 'keluarga', 'satuan'] as const).map((profile) => <button key={profile} type="button" onClick={() => setActiveProfile(profile)} aria-pressed={activeProfile === profile} title={Object.entries(PROFILE_MULTIPLIERS[profile]).map(([name, value]) => `${name} ${value}×`).join(' · ')} className={`rounded-lg border px-3 py-2 text-xs capitalize focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${activeProfile === profile ? 'border-cyan-500 bg-cyan-900 text-white' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>{profile}</button>)}</div>
        </div>

        <aside className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 lg:col-span-4" aria-label="Aksi cepat">
          <h2 className="mb-3 font-mono text-sm font-bold text-cyan-300">AKSI CEPAT</h2>
          <div className="mb-3 space-y-1">{topFindings.length ? topFindings.map((finding) => <button key={finding.id} type="button" onMouseEnter={() => setHoveredFindingId(finding.id)} onMouseLeave={() => setHoveredFindingId(null)} onClick={() => selectFinding(finding.id)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-slate-800 px-2 py-1.5 text-left text-xs hover:border-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"><span className="truncate text-slate-200">{finding.evidence}</span><span className="shrink-0 text-slate-400">{finding.severity}</span></button>) : <p className="text-xs text-slate-400">Belum ada temuan.</p>}</div>
          {findings.length > topFindings.length && <button type="button" onClick={() => setTab('findings')} className="mb-2 w-full text-right text-[11px] text-cyan-300 underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Lihat semua ({findings.length})</button>}
          <button type="button" onClick={() => setTab('safe')} className="w-full rounded-lg bg-emerald-700 px-4 py-3 text-sm font-bold text-white hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><ShieldCheck className="mr-2 inline h-4 w-4" />Buat Versi Aman</button>
          <button type="button" onClick={() => setReportOpen(true)} className="mt-2 w-full rounded-lg border border-cyan-700 px-4 py-2 text-xs text-cyan-200 hover:bg-cyan-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><Printer className="mr-2 inline h-4 w-4" />Laporan</button>
          <button type="button" onClick={() => setBriefOpen(true)} className="mt-2 w-full rounded-lg border border-violet-700 px-4 py-2 text-xs text-violet-200 hover:bg-violet-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300">Brief Intelijen</button>
        </aside>

        <div className="hidden gap-4 lg:col-span-12 lg:grid lg:grid-cols-12">
          <div className="lg:col-span-7"><ResultsPanel file={activeFile} view="findings" findingIdPrefix="desktop" fixedFindingsHeight hoveredFindingId={hoveredFindingId} onHoverFinding={setHoveredFindingId} onSelectFinding={selectFinding} /><div className="mt-4"><CaptionAnalysis /></div></div>
          <div className="lg:col-span-5"><div className="mx-auto mb-2 max-w-[230px]"><GlobeHero targetLocation={targetGPS} /></div><ResultsPanel file={activeFile} view="metadata" /></div>
        </div>
        <div className="hidden lg:col-span-12 lg:block"><SanitizerPreview file={activeFile} /></div>
        <details className="hidden rounded-2xl border border-slate-800 bg-slate-950/80 lg:col-span-12 lg:block"><summary className="cursor-pointer px-4 py-3 text-sm font-mono text-cyan-300">Log kernel ({activeFile.logs?.length ?? 0} baris)</summary><AnalysisConsole logs={activeFile.logs ?? []} /></details>

        <div className="lg:hidden lg:col-span-12">
          <div role="tablist" aria-label="Panel analisis" className="flex gap-1 overflow-x-auto rounded-xl border border-slate-800 bg-slate-950 p-1">{TABS.map((item) => <button key={item.id} role="tab" id={`tab-${item.id}`} aria-selected={tab === item.id} aria-controls={`panel-${item.id}`} tabIndex={tab === item.id ? 0 : -1} onClick={() => setTab(item.id)} onKeyDown={(event) => { const index = TABS.findIndex((entry) => entry.id === tab); const next = event.key === 'ArrowRight' ? (index + 1) % TABS.length : event.key === 'ArrowLeft' ? (index + TABS.length - 1) % TABS.length : -1; if (next >= 0) { event.preventDefault(); setTab(TABS[next].id); document.getElementById(`tab-${TABS[next].id}`)?.focus(); } }} className={`shrink-0 rounded-lg px-3 py-2 text-xs focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 ${tab === item.id ? 'bg-cyan-900 text-white' : 'text-slate-300 hover:bg-slate-800'}`}>{item.label}</button>)}</div>
          <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="mt-3 rounded-2xl border border-slate-800 bg-slate-950/80 p-3">
            {tab === 'findings' && <><ResultsPanel file={activeFile} view="findings" findingIdPrefix="mobile" hoveredFindingId={hoveredFindingId} onHoverFinding={setHoveredFindingId} onSelectFinding={selectFinding} /><div className="mt-4"><CaptionAnalysis /></div></>}
            {tab === 'metadata' && <><div className="mb-3 flex justify-center"><GlobeHero className="max-w-[220px]" targetLocation={targetGPS} /></div><ResultsPanel file={activeFile} view="metadata" /></>}
            {tab === 'safe' && <SanitizerPreview file={activeFile} />}
            {tab === 'logs' && <details className="rounded-xl border border-slate-800"><summary className="cursor-pointer px-3 py-2 text-sm text-cyan-300">Log kernel ({activeFile.logs?.length ?? 0} baris)</summary><AnalysisConsole logs={activeFile.logs ?? []} /></details>}
          </div>
        </div>
      </section>
      {reportOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Laporan risiko"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-4"><div className="mb-3 flex justify-end"><button type="button" onClick={() => setReportOpen(false)} autoFocus className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Tutup laporan</button></div><RiskReport file={activeFile} profile={activeProfile} /></div></div>}
      {briefOpen && <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/80 p-4" role="dialog" aria-modal="true" aria-label="Brief Intelijen Lawan"><div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-700 bg-slate-950 p-4"><div className="mb-3 flex justify-end"><button type="button" onClick={() => setBriefOpen(false)} autoFocus className="rounded-lg border border-slate-600 px-3 py-2 text-xs text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Tutup brief</button></div><BriefIntel file={activeFile} onSelectFinding={(findingId) => { setBriefOpen(false); selectFinding(findingId); }} /></div></div>}
    </>}
  </div>;
};
