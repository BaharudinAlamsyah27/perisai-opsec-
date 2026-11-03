import React from 'react';
import { Activity, Clock, ShieldAlert } from 'lucide-react';

export const PatternPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 text-center">
      <div className="inline-flex p-4 rounded-2xl bg-slate-800/80 border border-slate-700 text-amber-400 mb-6 shadow-xl">
        <Activity className="w-12 h-12" />
      </div>
      <h1 className="text-2xl font-bold text-white mb-2">
        Rekonstruksi Pola Hidup (Pattern of Life)
      </h1>
      <div className="inline-block px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold rounded-full mb-6">
        Fitur P1 — Segera Hadir
      </div>
      <p className="text-slate-300 text-base max-w-2xl mx-auto mb-8 leading-relaxed">
        Fitur ini akan menyusun linimasa kronologis dan peta agregat dari beberapa foto sekaligus untuk menunjukkan bagaimana rutinitas patroli, lokasi rumah dinas, atau jalur pergerakan prajurit dapat disimpulkan oleh pihak luar melalui kumpulan postingan media sosial yang terpisah.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left max-w-xl mx-auto">
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-emerald-400 font-semibold text-sm mb-1">
            <Clock className="w-4 h-4" />
            <span>Kluster Waktu & Frekuensi</span>
          </div>
          <p className="text-xs text-slate-400">
            Mendeteksi jam dan hari berulang saat foto diambil di lokasi yang berdekatan.
          </p>
        </div>
        <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
          <div className="flex items-center space-x-2 text-rose-400 font-semibold text-sm mb-1">
            <ShieldAlert className="w-4 h-4" />
            <span>Kesimpulan Pihak Luar</span>
          </div>
          <p className="text-xs text-slate-400">
            Simulasi intelijen sumber terbuka (OSINT) untuk mengidentifikasi pos statis dan rute logistik.
          </p>
        </div>
      </div>
    </div>
  );
};

