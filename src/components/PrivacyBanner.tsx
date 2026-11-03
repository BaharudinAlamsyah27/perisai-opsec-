import React from 'react';
import { ShieldCheck, Cpu, WifiOff, AlertTriangle } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-cyan-950/70 via-slate-950 to-cyan-950/70 border-b border-cyan-800/40 px-4 py-2 text-xs font-mono text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400 flex-shrink-0" />
          <span className="font-semibold text-cyan-300">ZERO-UPLOAD GUARANTEE:</span>
          <span>
            Foto &amp; analisis{' '}
            <span className="underline decoration-cyan-500 font-medium text-white">
              100% diproses di perangkat lokal Anda
            </span>
            . Tanpa server luar. Peta bersifat{' '}
            <span className="text-amber-300 font-medium">opt-in</span> (tile OSM dimuat hanya atas izin Anda).
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>WASM &amp; WEB WORKER</span>
          </span>
          <span className="flex items-center space-x-1">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>OFFLINE READY</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300">OSM: OPT-IN</span>
          </span>
        </div>
      </div>
    </div>
  );
};
