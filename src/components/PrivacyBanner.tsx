import React, { useState } from 'react';
import { AlertTriangle, Cpu, WifiOff } from 'lucide-react';

export const PrivacyBanner: React.FC = () => {
  const [detailsOpen, setDetailsOpen] = useState(false);

  return <section className="border-b border-cyan-800/40 bg-gradient-to-r from-cyan-950/70 via-slate-950 to-cyan-950/70 px-3 py-2 font-mono text-xs text-slate-300 sm:px-4" aria-label="Jaminan privasi">
    <div className="mx-auto flex max-w-7xl min-w-0 items-center justify-between gap-2">
      <p className="min-w-0 whitespace-nowrap font-sans text-[11px] leading-snug tracking-tight text-slate-200 sm:text-xs">
        Diproses 100% di perangkat Anda. Tanpa unggah.
      </p>
      <button type="button" aria-expanded={detailsOpen} aria-controls="privacy-details" onClick={() => setDetailsOpen((open) => !open)} className="min-h-9 shrink-0 rounded-md border border-cyan-700/70 px-2.5 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
        {detailsOpen ? 'Tutup' : 'Detail'}
      </button>
    </div>
    <div id="privacy-details" hidden={!detailsOpen} className={`${detailsOpen ? 'flex' : 'hidden'} mx-auto mt-2 max-w-7xl min-w-0 flex-wrap items-center gap-2 border-t border-cyan-900/50 pt-2 text-[10px] text-slate-300 sm:text-[11px]`}>
      <span className="min-w-0 flex-1 basis-full text-slate-400 sm:basis-auto">Foto dan analisis diproses di perangkat; tidak dikirim ke server. Peta hanya memuat tile setelah Anda menyetujuinya.</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-cyan-800/60 px-2 py-1"><Cpu className="h-3.5 w-3.5 text-cyan-400" aria-hidden="true" />Pekerja web</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-800/60 px-2 py-1"><WifiOff className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />Siap tanpa internet</span>
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-800/60 px-2 py-1 text-amber-200"><AlertTriangle className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />Peta atas izin</span>
    </div>
  </section>;
};
