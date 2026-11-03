import React from 'react';
import { AnalysisFile, RiskLevel } from '../types';
import { FindingCard } from './FindingCard';
import { LeafletMap } from './LeafletMap';
import { ScoreGauge } from './ScoreGauge';
import { RiskRadar } from './RiskRadar';
import { ShieldCheck, UserCheck, Users, Building2 } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';

interface ResultsPanelProps {
  file: AnalysisFile;
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

export const ResultsPanel: React.FC<ResultsPanelProps> = ({ file }) => {
  const { activeProfile, setActiveProfile } = useAnalysisStore();
  const score = file.score ?? { value: 0, level: 'Aman', findings: [] };
  const style = LEVEL_STYLE[score.level] ?? LEVEL_STYLE.Aman;

  const hasGPS = file.exif?.latitude !== undefined && file.exif?.longitude !== undefined;

  return (
    <div className="space-y-6">
      {/* Top Header: Futuristic Score & Radar Dual-HUD */}
      <div className={`p-6 rounded-2xl border ${style.border} ${style.bg} backdrop-blur relative overflow-hidden shadow-2xl`}>
        {/* HUD Corner Accents */}
        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Circular Score Gauge */}
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <ScoreGauge score={score.value} level={score.level} size={150} />

            <div className="space-y-2 text-center sm:text-left max-w-sm">
              <div className="flex items-center justify-center sm:justify-start space-x-2">
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-cyan-400">
                  STATUS EVALUASI
                </span>
                <span className={`text-base font-bold font-mono ${style.text}`}>
                  {score.level.toUpperCase()}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {style.description}
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
              <span>Prajurit (1.2x)</span>
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
              <span>Keluarga (1.3x)</span>
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
              <span>Satuan (1.3x)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Geolocation Section if GPS present */}
      {hasGPS && file.exif?.latitude && file.exif?.longitude && (
        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>PETA KOORDINAT GPS (OPT-IN BROWSER)</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Peta Leaflet dimuat secara lokal dengan perlindungan zero-upload; tile OSM hanya dimuat setelah persetujuan Anda.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                {file.exif.latitude.toFixed(6)}, {file.exif.longitude.toFixed(6)}
              </span>
            </div>
          </div>
          <LeafletMap
            latitude={file.exif.latitude}
            longitude={file.exif.longitude}
            popupTitle={file.name}
          />
        </div>
      )}

      {/* Findings List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center space-x-2 font-mono tracking-wider">
            <span>DAFTAR TEMUAN KEBOCORAN OPSEC</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-cyan-800/40 font-mono">
              {score.findings.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            KATALOG ATURAN DETERMINISTIK
          </span>
        </div>

        {score.findings.length === 0 ? (
          <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-white">Tidak Ditemukan Kebocoran Berisiko</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1 font-mono">
              Foto ini bersih dari koordinat GPS, serial nomor perangkat keras, atau teks operasional berisiko.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {score.findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
