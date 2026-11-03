import React, { useRef, useEffect } from 'react';
import type { AnalysisLog } from '../types';
import { Terminal, ShieldCheck } from 'lucide-react';

interface AnalysisConsoleProps {
  logs: AnalysisLog[];
  className?: string;
}

export const AnalysisConsole: React.FC<AnalysisConsoleProps> = ({ logs, className = '' }) => {
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className={`bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden font-mono text-xs ${className}`}>
      {/* Console Top Bar */}
      <div className="bg-slate-900/80 px-3 py-2 border-b border-slate-800 flex items-center justify-between text-slate-400">
        <div className="flex items-center space-x-2">
          <Terminal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-semibold text-slate-300">OPSEC KERNEL LOGS</span>
        </div>
        <div className="flex items-center space-x-1.5 text-[10px] text-emerald-400">
          <ShieldCheck className="w-3 h-3" />
          <span>ZERO-UPLOAD SECURE</span>
        </div>
      </div>

      {/* Log Terminal Window */}
      <div className="p-3 max-h-48 overflow-y-auto space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
        {logs.length === 0 ? (
          <div className="text-slate-600 italic">Menunggu berkas untuk dipindai...</div>
        ) : (
          logs.map((log, index) => {
            const levelColor =
              log.level === 'crit'
                ? 'text-rose-400'
                : log.level === 'warn'
                ? 'text-amber-300'
                : 'text-slate-300';

            const sourceBadge =
              log.source === 'SYSTEM'
                ? 'bg-slate-800 text-cyan-300'
                : log.source === 'EXIF'
                ? 'bg-blue-950/70 text-blue-300 border border-blue-800/40'
                : log.source === 'OCR'
                ? 'bg-purple-950/70 text-purple-300 border border-purple-800/40'
                : log.source === 'RULES'
                ? 'bg-amber-950/70 text-amber-300 border border-amber-800/40'
                : 'bg-rose-950/70 text-rose-300 border border-rose-800/40';

            return (
              <div key={index} className="flex items-start space-x-2 font-mono text-[11px] leading-relaxed">
                <span className="text-slate-500 flex-shrink-0">[{log.timestamp}]</span>
                <span className={`px-1 py-0 rounded text-[9px] font-semibold flex-shrink-0 ${sourceBadge}`}>
                  {log.source}
                </span>
                <span className={`${levelColor} break-all`}>{log.message}</span>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>
    </div>
  );
};
