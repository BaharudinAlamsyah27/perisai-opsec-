import React from 'react';
import { Finding, Severity } from '../types';
import { AlertTriangle, AlertCircle, Info, ShieldAlert, CheckCircle } from 'lucide-react';

interface FindingCardProps {
  finding: Finding;
}

const SEVERITY_CONFIG: Record<
  Severity,
  { label: string; badgeClass: string; borderClass: string; icon: React.ReactNode }
> = {
  critical: {
    label: 'Kritis',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    borderClass: 'border-rose-900/60 hover:border-rose-600/80 bg-rose-950/20',
    icon: <ShieldAlert className="w-4 h-4 text-rose-400" />,
  },
  high: {
    label: 'Tinggi',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    borderClass: 'border-orange-900/60 hover:border-orange-600/80 bg-orange-950/20',
    icon: <AlertTriangle className="w-4 h-4 text-orange-400" />,
  },
  medium: {
    label: 'Sedang',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    borderClass: 'border-amber-900/60 hover:border-amber-600/80 bg-amber-950/20',
    icon: <AlertCircle className="w-4 h-4 text-amber-400" />,
  },
  low: {
    label: 'Rendah',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    borderClass: 'border-sky-900/60 hover:border-sky-600/80 bg-sky-950/20',
    icon: <Info className="w-4 h-4 text-sky-400" />,
  },
  info: {
    label: 'Info',
    badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
    borderClass: 'border-slate-800 hover:border-slate-700 bg-slate-900/40',
    icon: <Info className="w-4 h-4 text-slate-400" />,
  },
};

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const config = SEVERITY_CONFIG[finding.severity] ?? SEVERITY_CONFIG.info;

  return (
    <div
      className={`border rounded-xl p-4 transition-all duration-200 ${config.borderClass}`}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center space-x-2">
          {config.icon}
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${config.badgeClass}`}
          >
            {config.label}
          </span>
          <span className="text-xs text-slate-400 uppercase font-mono tracking-wider">
            [{finding.category}] • {finding.source}
          </span>
        </div>
      </div>

      {/* Evidence */}
      <div className="mb-2 bg-slate-950/70 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-400 break-words">
        <span className="text-slate-400 font-sans block text-[10px] uppercase tracking-wide">
          Bukti Temuan:
        </span>
        {finding.evidence}
      </div>

      {/* Reason */}
      <div className="text-xs text-slate-300 mb-2 leading-relaxed">
        <strong className="text-slate-200">Alasan Risiko: </strong>
        {finding.reason}
      </div>

      {/* Recommendation */}
      <div className="text-xs text-emerald-300/90 bg-emerald-950/30 p-2 rounded-lg border border-emerald-900/40 flex items-start space-x-1.5">
        <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <strong className="text-emerald-300">Rekomendasi: </strong>
          {finding.recommendation}
        </div>
      </div>
    </div>
  );
};
