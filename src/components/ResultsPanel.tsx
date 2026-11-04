import React, { useMemo, useState } from 'react';
import { AnalysisFile, RiskLevel } from '../types';
import { FindingCard } from './FindingCard';
import { LeafletMap } from './LeafletMap';
import { ScoreGauge } from './ScoreGauge';
import { RiskRadar } from './RiskRadar';
import { UserCheck, Users, Building2 } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { PROFILE_MULTIPLIERS } from '../engine/scoring';
import { RiskReport } from './RiskReport';
import { AnalysisCoverage } from './AnalysisCoverage';
import { OcrTextPanel } from './OcrTextPanel';
import { isContextOnlyFindings, isPublicContextFinding } from '../engine/rules';

interface ResultsPanelProps {
  file: AnalysisFile;
  hoveredFindingId?: string | null;
  onHoverFinding?: (id: string | null) => void;
  view?: 'score' | 'findings' | 'metadata' | 'report' | 'all';
  onSelectFinding?: (id: string) => void;
  findingIdPrefix?: string;
  fixedFindingsHeight?: boolean;
}

const LEVEL_STYLE: Record<
  RiskLevel,
  { text: string; bg: string; border: string; description: string }
> = {
  Aman: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/20',
    border: 'border-emerald-500/30',
    description: 'Foto dan teks relatif aman, tidak ditemukan metadata lokasi atau identitas sensitif.',
  },
  Waspada: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/20',
    border: 'border-amber-500/30',
    description: 'Terdapat metadata atau rincian waktu/perangkat yang sebaiknya dibersihkan sebelum diunggah.',
  },
  Tinggi: {
    text: 'text-orange-400',
    bg: 'bg-orange-950/20',
    border: 'border-orange-500/30',
    description: 'Ditemukan kebocoran serius seperti koordinat posisi, identitas personel, atau penugasan.',
  },
  Kritis: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/30',
    border: 'border-rose-500/40',
    description: 'BAHAYA OPSEC: Foto membocorkan koordinat presisi atau dokumen rahasia. Dilarang diunggah!',
  },
};

const PROFILE_LABELS = {
  prajurit: 'Prajurit',
  keluarga: 'Keluarga',
  satuan: 'Satuan',
} as const;

const CATEGORY_LABELS = {
  lokasi: 'Lokasi',
  identitas: 'Identitas',
  operasional: 'Operasional',
  teknis: 'Teknis',
} as const;

const SEVERITY_RANK = { critical: 0, high: 1, medium: 2, low: 3, info: 4 } as const;

function profileWeightsDescription(profile: keyof typeof PROFILE_MULTIPLIERS): string {
  const weights = PROFILE_MULTIPLIERS[profile];
  const categories = Object.keys(CATEGORY_LABELS) as Array<keyof typeof CATEGORY_LABELS>;
  return `${PROFILE_LABELS[profile]} — ${categories.map((category) => `${CATEGORY_LABELS[category]} ${weights[category].toFixed(1)}×`).join(', ')}`;
}

export const ResultsPanel: React.FC<ResultsPanelProps> = ({
  file,
  hoveredFindingId = null,
  onHoverFinding,
  view = 'all',
  onSelectFinding,
  findingIdPrefix,
  fixedFindingsHeight = false,
}) => {
  const { activeProfile, setActiveProfile } = useAnalysisStore();
  const score = file.score ?? { value: 0, level: 'Aman', findings: [] };
  const style = LEVEL_STYLE[score.level] ?? LEVEL_STYLE.Aman;
  const contextOnly = isContextOnlyFindings(score.findings);
  const contextLabel = contextOnly && score.value > 0 && score.value < 50 ? 'Perlu verifikasi publikasi' : undefined;

  const hasGPS = file.exif?.latitude !== undefined && file.exif?.longitude !== undefined;
  const [category, setCategory] = useState<'semua' | keyof typeof CATEGORY_LABELS>('semua');
  const [metadataOpen, setMetadataOpen] = useState(true);
  const orderedFindings = useMemo(() => [...score.findings].sort((a, b) => {
    const sourceRank = (source: string) => source === 'metadata' ? 1 : 0;
    return sourceRank(a.source) - sourceRank(b.source)
      || SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity];
  }), [score.findings]);
  const visibleFindings = orderedFindings.filter((finding) => category === 'semua' || finding.category === category);
  const metadataFindings = visibleFindings.filter((finding) => finding.source === 'metadata');
  const textFindings = visibleFindings.filter((finding) => finding.source !== 'metadata');
  const publicContextFindings = textFindings.filter(isPublicContextFinding);
  const individualTextFindings = publicContextFindings.length >= 3
    ? textFindings.filter((finding) => !isPublicContextFinding(finding))
    : textFindings;

  return (
    <div className="space-y-6">
      {/* Top Header: Futuristic Score & Radar Dual-HUD */}
      {(view === 'score' || view === 'all') && <div className={`p-6 rounded-2xl border ${style.border} ${style.bg} backdrop-blur relative overflow-hidden shadow-2xl`}>
        {/* HUD Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Circular Score Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={score.value} level={score.level} size={150} levelLabel={contextLabel} />

            <div className="space-y-2 text-center sm:text-left max-w-sm">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                  STATUS EVALUASI
                </span>
                <span className={`text-base font-bold font-mono ${contextLabel ? 'text-amber-300' : style.text}`}>
                  {contextLabel ?? score.level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {contextLabel ? 'Kecocokan konteks kegiatan ditemukan. Verifikasi status publikasinya sebelum mengunggah.' : style.description}
              </p>
            </div>
          </div>

          {/* SVG Pure Radar Chart */}
          <div className="w-full lg:w-auto flex justify-center">
            <RiskRadar findings={score.findings} />
          </div>
        </div>

        {/* Profile Switcher Row */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-[11px] font-mono text-slate-400 flex items-center space-x-2">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            <span>BOBOT ANALISIS BERDASARKAN PERSONA PENGGUNA:</span>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 p-1 rounded-xl flex items-center space-x-1 text-xs font-mono">
            <button
              onClick={() => setActiveProfile('prajurit')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeProfile === 'prajurit'
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="group/profile relative">Prajurit
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-cyan-700 bg-slate-950 px-3 py-2 text-left text-[10px] leading-relaxed text-slate-200 opacity-0 shadow-xl transition-opacity group-hover/profile:opacity-100 group-focus-within/profile:opacity-100">
                  {profileWeightsDescription('prajurit')}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveProfile('keluarga')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeProfile === 'keluarga'
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span className="group/profile relative">Keluarga
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-cyan-700 bg-slate-950 px-3 py-2 text-left text-[10px] leading-relaxed text-slate-200 opacity-0 shadow-xl transition-opacity group-hover/profile:opacity-100 group-focus-within/profile:opacity-100">
                  {profileWeightsDescription('keluarga')}
                </span>
              </span>
            </button>
            <button
              onClick={() => setActiveProfile('satuan')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeProfile === 'satuan'
                  ? 'bg-cyan-600 text-white font-semibold shadow-md shadow-cyan-900/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span className="group/profile relative">Satuan
                <span role="tooltip" className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 w-56 -translate-x-1/2 rounded-lg border border-cyan-700 bg-slate-950 px-3 py-2 text-left text-[10px] leading-relaxed text-slate-200 opacity-0 shadow-xl transition-opacity group-hover/profile:opacity-100 group-focus-within/profile:opacity-100">
                  {profileWeightsDescription('satuan')}
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>}

      {/* Findings List */}
      {(view === 'findings' || view === 'all') && <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-wider">
            <span>DAFTAR TEMUAN KEBOCORAN OPSEC</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-cyan-800/40 font-mono">
              {score.findings.length}
            </span>
          </h3>
          <div className="flex flex-wrap gap-1" aria-label="Filter kategori temuan">
            {(['semua', 'lokasi', 'identitas', 'operasional', 'teknis'] as const).map((item) => (
              <button key={item} type="button" onClick={() => setCategory(item)} aria-pressed={category === item}
                className={`rounded border px-2 py-1 text-[10px] font-mono focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${category === item ? 'border-cyan-500 bg-cyan-950 text-cyan-200' : 'border-slate-700 text-slate-300 hover:bg-slate-800'}`}>
                {item === 'semua' ? 'Semua' : CATEGORY_LABELS[item]}
              </button>
            ))}
          </div>
        </div>

        {visibleFindings.length === 0 ? (
          <div className="space-y-3">
            <div className="rounded-xl border border-slate-700 bg-slate-950/60 p-4 text-center">
              <p className="text-sm font-semibold text-slate-100">{score.findings.length === 0 ? 'Tidak ada kecocokan aturan pada sumber yang diperiksa.' : 'Tidak ada temuan pada filter kategori ini.'}</p>
              {score.findings.length === 0 && <p className="mt-1 text-xs text-slate-400">Ini bukan jaminan bahwa seluruh isi foto aman.</p>}
            </div>
            {score.findings.length === 0 && file.status === 'done' && <AnalysisCoverage file={file} />}
          </div>
        ) : (
          <div className={`${fixedFindingsHeight ? 'h-[34rem]' : 'max-h-[34rem]'} space-y-2 overflow-y-auto pr-1`} data-testid="findings-scroll">
            {publicContextFindings.length >= 3 && <article className="rounded-xl border border-amber-700/60 bg-amber-950/25 p-3" aria-label="Konteks kegiatan operasional">
              <h4 className="font-mono text-xs font-bold text-amber-200">Konteks kegiatan operasional</h4>
              <p className="mt-1 text-xs text-slate-200">{publicContextFindings.map((finding) => finding.evidence.replace(/ \(keyakinan \d+%\)$/, '')).filter((evidence, index, all) => all.indexOf(evidence) === index).join(' · ')}</p>
              <p className="mt-2 text-[11px] text-slate-400">Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.</p>
              <p className="mt-1 text-[10px] text-slate-500">{publicContextFindings.length} kecocokan konteks digabungkan.</p>
            </article>}
            {individualTextFindings.map((finding) => <FindingCard key={finding.id} finding={finding} compact idPrefix={findingIdPrefix} isHovered={hoveredFindingId === finding.id} onHover={onHoverFinding} onSelect={onSelectFinding} />)}
            {metadataFindings.length > 0 && <section className="space-y-2">
              <button type="button" aria-expanded={metadataOpen} onClick={() => setMetadataOpen((value) => !value)} className="w-full rounded px-2 py-2 text-left text-sm font-semibold text-cyan-200 hover:bg-slate-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Metadata ({metadataFindings.length})</button>
              {metadataOpen && <div className="space-y-2">{metadataFindings.map((finding) => <FindingCard key={finding.id} finding={finding} compact idPrefix={findingIdPrefix} isHovered={hoveredFindingId === finding.id} onHover={onHoverFinding} onSelect={onSelectFinding} />)}</div>}
            </section>}
          </div>
        )}
      </div>}

      {(view === 'findings' || view === 'all') && file.status === 'done' && <OcrTextPanel file={file} />}

      {(view === 'metadata' || view === 'all') && <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4" aria-label="Metadata dan lokasi">
        <h3 className="mb-3 font-mono text-sm font-bold text-cyan-300">METADATA &amp; LOKASI</h3>
        <dl className="grid grid-cols-1 gap-2 text-xs sm:grid-cols-2">
          {([['Kamera', [file.exif?.make, file.exif?.model].filter(Boolean).join(' ')], ['Waktu menurut perangkat', file.exif?.takenAt], ['Nomor seri', file.exif?.serialNumber], ['Software', file.exif?.software], ['Ketinggian', file.exif?.altitude === undefined ? undefined : `${file.exif.altitude} m`], ['Arah bidik', file.exif?.direction === undefined ? undefined : `${file.exif.direction}°`]] as const).map(([label, value]) => <div key={label} className="border-b border-slate-800 py-2"><dt className="text-slate-400">{label}</dt><dd className="break-words text-slate-100">{value || '—'}</dd></div>)}
        </dl>
        {hasGPS && file.exif?.latitude !== undefined && file.exif?.longitude !== undefined && <div className="mt-3"><LeafletMap latitude={file.exif.latitude} longitude={file.exif.longitude} popupTitle={file.name} /></div>}
        {!hasGPS && <p className="text-xs text-slate-400">Tidak ada koordinat GPS di metadata.</p>}
      </section>}
      {view === 'report' && <RiskReport file={file} profile={activeProfile} />}
    </div>
  );
};
