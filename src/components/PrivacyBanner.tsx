import React from 'react';
import { ShieldCheck, Cpu, WifiOff } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-emerald-950/70 via-slate-900 to-emerald-950/70 border-b border-emerald-800/40 px-4 py-2 text-xs text-slate-300">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span className="font-semibold text-emerald-300">Jaminan Privasi Penuh:</span>
          <span>
            Foto dan data Anda <span className="underline decoration-emerald-500 font-medium text-white">100% diproses di perangkat</span>. Tidak ada pengunggahan ke server, tidak ada analitik, tidak ada pelacakan.
          </span>
        </div>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>WebAssembly & Web Worker</span>
          </span>
          <span className="flex items-center space-x-1">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span>Siap Mode Offline</span>
          </span>
        </div>
      </div>
    </div>
  );
};
