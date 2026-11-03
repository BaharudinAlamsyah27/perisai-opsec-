import React from 'react';
import { Files, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';
import type { AnalysisFile } from '../types';

interface StatTilesProps {
  files: AnalysisFile[];
  className?: string;
}

export const StatTiles: React.FC<StatTilesProps> = ({ files, className = '' }) => {
  const totalFiles = files.length;
  const analyzedFiles = files.filter((f) => f.score);
  const totalFindings = analyzedFiles.reduce((acc, f) => acc + (f.score?.findings.length || 0), 0);
  const highestScore = analyzedFiles.reduce(
    (max, f) => Math.max(max, f.score?.value || 0),
    0
  );

  return (
    <div className={`grid grid-cols-2 lg:grid-cols-4 gap-3 ${className}`}>
      {/* Tile 1: Total Foto Sesi */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 relative overflow-hidden">
        <div className="p-2 rounded-lg bg-cyan-950/60 border border-cyan-800/40 text-cyan-400">
          <Files className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Berkas Sesi</div>
          <div className="text-xl font-mono font-bold text-slate-100">{totalFiles} Foto</div>
        </div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-cyan-500/50" />
      </div>

      {/* Tile 2: Total Temuan Bocor */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 relative overflow-hidden">
        <div className="p-2 rounded-lg bg-amber-950/60 border border-amber-800/40 text-amber-400">
          <AlertTriangle className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Total Temuan</div>
          <div className="text-xl font-mono font-bold text-amber-300">{totalFindings} Titik</div>
        </div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-amber-500/50" />
      </div>

      {/* Tile 3: Skor Risiko Puncak */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 relative overflow-hidden">
        <div className="p-2 rounded-lg bg-rose-950/60 border border-rose-800/40 text-rose-400">
          <Zap className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Risiko Tertinggi</div>
          <div className="text-xl font-mono font-bold text-rose-400">{highestScore}/100</div>
        </div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-rose-500/50" />
      </div>

      {/* Tile 4: Zero-Upload Counter */}
      <div className="bg-slate-950/70 border border-slate-800 rounded-xl p-3 flex items-center space-x-3 relative overflow-hidden">
        <div className="p-2 rounded-lg bg-emerald-950/60 border border-emerald-800/40 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">Trafik Server</div>
          <div className="text-xl font-mono font-bold text-emerald-400">0 Byte Keluar</div>
        </div>
        <div className="absolute top-1 right-1 w-1.5 h-1.5 border-t border-r border-emerald-500/50" />
      </div>
    </div>
  );
};

