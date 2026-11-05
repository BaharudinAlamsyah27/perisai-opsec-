import React from 'react';
import type { Finding } from '../types';
import { calculateCategoryScores } from '../utils/visualHelpers';

interface RiskRadarProps {
  findings: Finding[];
  className?: string;
}

export const RiskRadar: React.FC<RiskRadarProps> = ({ findings, className = '' }) => {
  const norm = calculateCategoryScores(findings);

  // SVG Radar Dimensions: 200x200, center at (100, 100), radius = 65
  const cx = 100;
  const cy = 100;
  const r = 65;

  const ptLokasi = `${cx},${cy - r * (0.1 + norm.lokasi * 0.9)}`;
  const ptIdentitas = `${cx + r * (0.1 + norm.identitas * 0.9)},${cy}`;
  const ptOperasional = `${cx},${cy + r * (0.1 + norm.operasional * 0.9)}`;
  const ptTeknis = `${cx - r * (0.1 + norm.teknis * 0.9)},${cy}`;

  const polygonPoints = `${ptLokasi} ${ptIdentitas} ${ptOperasional} ${ptTeknis}`;

  return (
    <div className={`relative flex min-w-0 flex-col items-center justify-center rounded-xl border border-slate-800 bg-slate-950/70 p-3 ${className}`}>
      {/* HUD Header */}
      <div className="w-full flex items-center justify-between pb-1 mb-1 border-b border-slate-800/80">
        <span className="text-[10px] font-mono tracking-wider text-cyan-400">VEKTOR ANCAMAN OPSEC</span>
        <span className="text-[9px] font-mono text-slate-500">4 SUMBU</span>
      </div>

      <svg viewBox="0 0 200 200" className="h-auto w-full max-w-44 overflow-visible">
        {/* Background Grid Circles */}
        {[0.33, 0.66, 1].map((step, idx) => (
          <circle
            key={idx}
            cx={cx}
            cy={cy}
            r={r * step}
            fill="none"
            stroke="#1e293b"
            strokeDasharray={step === 1 ? 'none' : '3 3'}
            strokeWidth="1"
          />
        ))}

        {/* Axis Crosslines */}
        <line x1={cx} y1={cy - r} x2={cx} y2={cy + r} stroke="#334155" strokeWidth="1" />
        <line x1={cx - r} y1={cy} x2={cx + r} y2={cy} stroke="#334155" strokeWidth="1" />

        {/* Radar Value Filled Polygon */}
        <polygon
          points={polygonPoints}
          className="fill-cyan-500/25 stroke-cyan-400 transition-all duration-500"
          strokeWidth="1.5"
        />

        {/* Node dots */}
        <circle cx={cx} cy={cy - r * (0.1 + norm.lokasi * 0.9)} r="2.5" className="fill-cyan-300" />
        <circle cx={cx + r * (0.1 + norm.identitas * 0.9)} cy={cy} r="2.5" className="fill-cyan-300" />
        <circle cx={cx} cy={cy + r * (0.1 + norm.operasional * 0.9)} r="2.5" className="fill-cyan-300" />
        <circle cx={cx - r * (0.1 + norm.teknis * 0.9)} cy={cy} r="2.5" className="fill-cyan-300" />

        {/* Axis Labels */}
        <text x={cx} y={cy - r - 8} textAnchor="middle" className="text-[9px] font-mono fill-slate-300 font-semibold">
          LOKASI
        </text>
        <text x={cx + r + 12} y={cy + 3} textAnchor="start" className="text-[9px] font-mono fill-slate-300 font-semibold">
          IDENTITAS
        </text>
        <text x={cx} y={cy + r + 14} textAnchor="middle" className="text-[9px] font-mono fill-slate-300 font-semibold">
          OPERASIONAL
        </text>
        <text x={cx - r - 12} y={cy + 3} textAnchor="end" className="text-[9px] font-mono fill-slate-300 font-semibold">
          TEKNIS
        </text>
      </svg>
    </div>
  );
};
