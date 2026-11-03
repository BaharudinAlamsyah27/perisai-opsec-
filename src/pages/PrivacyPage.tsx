import React from 'react';
import { Lock, ShieldCheck, Terminal, CheckCircle2 } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Privasi & Jaminan Keamanan</h1>
          <p className="text-sm text-slate-400">Arsitektur Zero-Upload: Data Anda Tidak Pernah Keluar Dari Browser</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Core Principles */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span>Prinsip Keamanan Utama</span>
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Pemrosesan 100% di Perangkat:</strong> Ekstraksi metadata EXIF, pembacaan teks OCR, dan mesin aturan OPSEC dieksekusi secara lokal menggunakan JavaScript, WebAssembly, dan Web Worker di memori browser Anda.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Tanpa Backend & Tanpa Penyimpanan:</strong> Aplikasi ini tidak memiliki server API penampung data. Foto Anda tidak disimpan di server mana pun, tidak disimpan di database, dan tidak ada cookie pelacak.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Tanpa Pelacakan & Analytics:</strong> Tidak ada skrip analitik pihak ketiga (Google Analytics, Mixpanel, dsb). Tidak ada CDN eksternal yang melacak saat runtime.</span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span><strong>Pengecualian Tunggal:</strong> Tile peta OpenStreetMap dimuat langsung oleh komponen peta untuk menampilkan letak koordinat GPS. Permintaan ini hanya mengambil gambar peta statis dan tidak menyertakan data pribadi Anda.</span>
            </li>
          </ul>
        </div>

        {/* How to verify in DevTools */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Cara Memverifikasi Secara Mandiri (DevTools)</span>
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            Anda dapat memverifikasi klaim privasi ini secara transparan kapan saja menggunakan browser Anda:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 font-mono bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            <li>Buka alat pengembang browser (<kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-400">F12</kbd> atau <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-400">Ctrl+Shift+I</kbd>).</li>
            <li>Pilih tab <strong>Network</strong> (Jaringan) dan centang opsi <em>Preserve log</em>.</li>
            <li>Unggah foto dan lakukan analisis di aplikasi PERISAI OPSEC.</li>
            <li>Amati daftar request: <strong>Nol permintaan HTTP</strong> berisi payload foto/teks Anda ke server manapun.</li>
            <li>Matikan koneksi WiFi/Internet Anda: aplikasi tetap dapat menganalisis foto secara offline.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

