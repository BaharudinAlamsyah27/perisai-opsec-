import React from 'react';
import type { Finding } from '../types';

interface ScanOverlayProps {
  isScanning: boolean;
  progress?: number;
  findings?: Finding[];
  imageWidth?: number;
  imageHeight?: number;
  hoveredFindingId?: string | null;
  onHoverFinding?: (id: string | null) => void;
}

export const ScanOverlay: React.FC<ScanOverlayProps> = ({
  isScanning,
  progress = 0,
  findings = [],
  imageWidth = 0,
  imageHeight = 0,
  hoveredFindingId = null,
  onHoverFinding,
}) => {
  const bboxFindings = findings.filter((f) => f.bbox);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* HUD Corner Brackets */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-400/80" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-400/80" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-400/80" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-400/80" />

      {/* Real-time Scanning Line Animation during analysis */}
      {isScanning && (
        <>
          <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#06b6d4] animate-scanline" />
          <div className="absolute top-3 left-4 bg-slate-950/80 border border-cyan-500/50 px-2 py-0.5 rounded text-[10px] font-mono text-cyan-300 flex items-center space-x-1.5 backdrop-blur">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
            <span>PEMINDAIAN OPSEC... {progress}%</span>
          </div>
        </>
      )}

      {/* Target Lock BBoxes for Detected Visual Findings */}
      {bboxFindings.map((finding) => {
        const bbox = finding.bbox!;
        const left = imageWidth > 0 ? (bbox.x0 / imageWidth) * 100 : 0;
        const top = imageHeight > 0 ? (bbox.y0 / imageHeight) * 100 : 0;
        const width = imageWidth > 0 ? ((bbox.x1 - bbox.x0) / imageWidth) * 100 : 0;
        const height = imageHeight > 0 ? ((bbox.y1 - bbox.y0) / imageHeight) * 100 : 0;

        const isHovered = hoveredFindingId === finding.id;
        const isCrit = finding.severity === 'critical';
        const isHigh = finding.severity === 'high';

        const baseColor = isCrit
          ? 'border-rose-500 bg-rose-500/20 text-rose-300'
          : isHigh
          ? 'border-orange-500 bg-orange-500/20 text-orange-300'
          : 'border-amber-400 bg-amber-400/20 text-amber-200';

        const highlightClass = isHovered
          ? 'ring-4 ring-cyan-400 border-cyan-300 bg-cyan-500/30 shadow-[0_0_20px_#06b6d4] scale-[1.02] z-30'
          : `${baseColor} opacity-85 hover:opacity-100`;

        return (
          <div
            key={finding.id}
            onMouseEnter={() => onHoverFinding?.(finding.id)}
            onMouseLeave={() => onHoverFinding?.(null)}
            style={{
              left: `${Math.max(0, left)}%`,
              top: `${Math.max(0, top)}%`,
              width: `${Math.min(100, Math.max(3, width))}%`,
              height: `${Math.min(100, Math.max(3, height))}%`,
            }}
            className={`absolute border-2 transition-all duration-200 cursor-pointer pointer-events-auto ${highlightClass}`}
          >
            {/* Target Reticle corners */}
            <div className="absolute -top-1 -left-1 w-2 h-2 border-t-2 border-l-2 border-current" />
            <div className="absolute -bottom-1 -right-1 w-2 h-2 border-b-2 border-r-2 border-current" />

            {/* Micro Tag Label */}
            <span
              className={`absolute -top-5 left-0 text-[10px] font-mono px-1.5 py-0.5 rounded border border-current whitespace-nowrap overflow-hidden max-w-[150px] truncate shadow-md ${
                isHovered
                  ? 'bg-cyan-950 text-cyan-200 border-cyan-400 font-bold'
                  : 'bg-slate-950/90'
              }`}
            >
              {finding.evidence || finding.ruleId}
            </span>
          </div>
        );
      })}
    </div>
  );
};
