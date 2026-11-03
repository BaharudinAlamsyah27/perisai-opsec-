import React from 'react';
import { ShieldCheck, Cpu, WifiOff, AlertTriangle } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-800/40 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-emerald-300">Privasi Maksimal:</span>
          <span>
            Foto &amp; analisis{' '}
            <span className="underline decoration-emerald-500 font-medium text-white">
              100% diproses di perangkat Anda
            </span>
            . Tidak ada upload. Peta bersifat{' '}
            <span className="text-amber-300 font-medium">opt-in</span> karena tile OSM
            dapat mengungkap area lokasi kasar.
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebAssembly &amp; Web Worker</span>
          </span>
          <span className="flex items-center space-x-1">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Siap Offline</span>
          </span>
          <span className="flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span className="text-amber-300">Peta: opt-in</span>
          </span>
        </div>
      </div>
    </div>
  );
};
