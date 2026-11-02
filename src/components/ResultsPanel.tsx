import React from 'react';
import { AnalysisFile, RiskLevel } from '../types';
import { FindingCard } from './FindingCard';
import { LeafletMap } from './LeafletMap';
import { ShieldCheck, ShieldAlert, AlertTriangle, UserCheck, Users, Building2 } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';

interface ResultsPanelProps {
  file: AnalysisFile;
}

const LEVEL_STYLE: Record<
  RiskLevel,
  { text: string; bg: string; border: string; barColor: string; description: string }
> = {
  Aman: {
    text: 'text-emerald-400',
    bg: 'bg-emerald-950/40',
    border: 'border-emerald-500/40',
    barColor: 'bg-emerald-500',
    description: 'Foto dan teks relatif aman, tidak ditemukan metadata lokasi atau identitas sensitif.',
  },
  Waspada: {
    text: 'text-amber-400',
    bg: 'bg-amber-950/40',
    border: 'border-amber-500/40',
    barColor: 'bg-amber-500',
    description: 'Terdapat metadata atau rincian waktu/perangkat yang sebaiknya dibersihkan sebelum diunggah.',
  },
  Tinggi: {
    text: 'text-orange-400',
    bg: 'bg-orange-950/40',
    border: 'border-orange-500/40',
    barColor: 'bg-orange-500',
    description: 'Ditemukan kebocoran serius seperti koordinat posisi, identitas personel, atau penugasan.',
  },
  Kritis: {
    text: 'text-rose-400',
    bg: 'bg-rose-950/40',
    border: 'border-rose-500/40',
    barColor: 'bg-rose-500',
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
      {/* Top Header: Score Card & Profile Selector */}
      <div className={`p-6 rounded-2xl border ${style.border} ${style.bg} backdrop-blur`}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          {/* Score Badge */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col items-center justify-center w-20 h-20 rounded-2xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <span className={`text-3xl font-black ${style.text}`}>
                {score.value}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">/ 100</span>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className={`text-xl font-bold ${style.text}`}>
                  Tingkat Risiko: {score.level}
                </span>
                {score.value >= 75 ? (
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                ) : score.value >= 25 ? (
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                ) : (
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                )}
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                {style.description}
              </p>
            </div>
          </div>

          {/* Persona / Profile Selector */}
          <div className="bg-slate-900/90 border border-slate-800 p-1.5 rounded-xl flex items-center space-x-1 text-xs">
            <span className="text-[11px] text-slate-400 px-2 font-medium">Profil:</span>
            <button
              onClick={() => setActiveProfile('prajurit')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
                activeProfile === 'prajurit'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Prajurit</span>
            </button>
            <button
              onClick={() => setActiveProfile('keluarga')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
                activeProfile === 'keluarga'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Keluarga</span>
            </button>
            <button
              onClick={() => setActiveProfile('satuan')}
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg transition-colors ${
                activeProfile === 'satuan'
                  ? 'bg-emerald-600 text-white font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Satuan</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-950/60 rounded-full h-2 mt-5 overflow-hidden border border-slate-800">
          <div
            className={`h-full transition-all duration-500 ${style.barColor}`}
            style={{ width: `${Math.min(100, Math.max(3, score.value))}%` }}
          />
        </div>
      </div>

      {/* Geolocation Section if GPS present */}
      {hasGPS && file.exif?.latitude && file.exif?.longitude && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                <span>Peta Titik Koordinat GPS Foto</span>
              </h3>
              <p className="text-xs text-slate-400">
                Peta dimuat secara lokal dengan tile gambar OpenStreetMap tanpa mengirim data Anda.
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs font-mono text-emerald-400">
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
          <h3 className="text-base font-bold text-white flex items-center space-x-2">
            <span>Daftar Temuan Kebocoran OPSEC</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {score.findings.length}
            </span>
          </h3>
          <span className="text-xs text-slate-400">
            Kamus aturan deterministik TNI AD
          </span>
        </div>

        {score.findings.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-2xl">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto mb-2 opacity-80" />
            <p className="text-sm font-semibold text-white">Tidak Ditemukan Kebocoran Berisiko</p>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Foto ini bersih dari koordinat GPS, perangkat teridentifikasi, atau teks operasional berisiko.
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
