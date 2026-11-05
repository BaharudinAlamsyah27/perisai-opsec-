import React from 'react';
import { Printer } from 'lucide-react';
import type { AnalysisFile, Profile } from '../types';
import { BriefIntel } from './BriefIntel';
import { getFindingCategoryLabel, getSeverityLabel } from '../utils/uiLabels';

const PROFILE_NAMES: Record<Profile, string> = {
  prajurit: 'Prajurit',
  keluarga: 'Keluarga',
  satuan: 'Satuan',
};

interface RiskReportProps {
  file: AnalysisFile;
  profile: Profile;
}

export const RiskReport: React.FC<RiskReportProps> = ({ file, profile }) => {
  const score = file.score ?? { value: 0, level: 'Aman' as const, findings: [] };

  return (
    <article id="risk-report" className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 text-slate-100">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div>
          <h3 className="font-mono text-sm font-bold tracking-wide">LAPORAN RISIKO OPSEC</h3>
          <p className="mt-1 text-xs text-slate-400">Ringkasan analisis foto dan rekomendasi tindakan.</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className="no-print inline-flex items-center gap-2 rounded-lg border border-cyan-700 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
        >
          <Printer className="h-4 w-4" />
          Cetak / Simpan PDF
        </button>
      </div>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        <div><dt className="text-xs text-slate-400">Berkas</dt><dd className="break-all font-medium">{file.name}</dd></div>
        <div><dt className="text-xs text-slate-400">Skor</dt><dd className="font-semibold">{score.value}/100 — {score.level}</dd></div>
        <div><dt className="text-xs text-slate-400">Profil penilaian</dt><dd className="font-medium">{PROFILE_NAMES[profile]}</dd></div>
      </dl>

      <section className="mt-5">
        <h4 className="mb-2 text-xs font-bold uppercase tracking-wide">Temuan dan rekomendasi ({score.findings.length})</h4>
        {score.findings.length === 0 ? (
          <p className="rounded-lg border border-slate-700 p-3 text-sm text-slate-300">Tidak ada temuan berisiko pada analisis ini.</p>
        ) : (
          <ol className="space-y-3">
            {score.findings.map((finding, index) => (
              <li key={finding.id} id={`risk-finding-${finding.id}`} className="break-inside-avoid rounded-lg border border-slate-700 p-3">
                <h5 className="font-semibold">{index + 1}. {getFindingCategoryLabel(finding.category)} · {getSeverityLabel(finding.severity)}</h5>
                <p className="mt-1 text-sm"><strong>Bukti:</strong> {finding.evidence}</p>
                <p className="mt-1 text-sm"><strong>Alasan:</strong> {finding.reason}</p>
                <p className="mt-1 text-sm"><strong>Rekomendasi:</strong> {finding.recommendation}</p>
              </li>
            ))}
          </ol>
        )}
      </section>

      <p className="mt-3 text-sm font-semibold">{file.ignoredFindings?.length ?? 0} temuan diabaikan pengguna</p>

      <section className="mt-5 break-before-page" aria-label="Brief Intelijen Lawan">
        <BriefIntel file={file} />
      </section>

      <p className="mt-5 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
        Dibuat secara lokal oleh PERISAI OPSEC. Perlakukan laporan ini sebagai informasi sensitif.
      </p>
    </article>
  );
};
