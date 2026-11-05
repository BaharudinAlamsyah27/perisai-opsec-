import React from 'react';
import { Lock, ShieldCheck, Terminal, CheckCircle2, AlertTriangle } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <Lock className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Privasi &amp; Jaminan Keamanan</h1>
          <p className="text-sm text-slate-400">
            Arsitektur Zero-Upload: Data Anda Tidak Pernah Keluar Dari Browser
          </p>
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
              <span>
                <strong>Pemrosesan 100% di Perangkat:</strong> Ekstraksi metadata EXIF,
                pembacaan teks OCR, dan mesin aturan OPSEC dieksekusi secara lokal menggunakan
                JavaScript, WebAssembly, dan Web Worker di memori browser Anda. Foto tidak
                pernah meninggalkan perangkat.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Tanpa Backend &amp; Tanpa Penyimpanan:</strong> Aplikasi ini tidak
                memiliki server API. Foto, teks, dan hasil analisis tidak disimpan di server
                mana pun. Tidak ada cookie pelacak.
              </span>
            </li>
            <li className="flex items-start space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>
                <strong>Tanpa Pelacakan &amp; Analitik:</strong> Tidak ada skrip analitik
                pihak ketiga (Google Analytics, dsb). Semua aset (termasuk model OCR) disertakan
                lokal.
              </span>
            </li>
          </ul>
        </div>

        {/* Peta Opt-in Note */}
        <div className="bg-amber-900/20 border border-amber-500/40 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-400" />
            <span>Pengecualian: Peta (Atas Persetujuan)</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Fitur peta interaktif hanya aktif setelah <strong className="text-amber-300">Anda menyetujuinya</strong>.
            Secara default, aplikasi hanya menampilkan teks koordinat GPS tanpa memuat peta.
            Jika Anda menekan tombol &ldquo;Tampilkan Peta&rdquo;, browser akan memuat gambar
            <em> gambar peta</em> dari server <strong>OpenStreetMap</strong>. Permintaan peta tersebut
            mengandung informasi koordinat peta (tingkat pembesaran dan posisi kisi), sehingga server
            OpenStreetMap dapat mengetahui <strong>area kasar lokasi</strong> foto Anda.
            Data foto Anda tetap tidak pernah dikirim. Jika privasi penuh diperlukan, jangan
            aktifkan peta.
          </p>
        </div>

        {/* How to verify in DevTools */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <span>Cara Memverifikasi Secara Mandiri (DevTools)</span>
          </h2>
          <p className="text-sm text-slate-300 mb-3">
            Anda dapat memverifikasi klaim privasi ini secara transparan kapan saja:
          </p>
          <ol className="list-decimal list-inside space-y-2 text-sm text-slate-300 font-mono bg-slate-900/80 p-4 rounded-lg border border-slate-800">
            <li>
              Buka alat pengembang browser (
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-400">
                F12
              </kbd>{' '}
              atau{' '}
              <kbd className="bg-slate-800 px-1.5 py-0.5 rounded text-xs text-emerald-400">
                Ctrl+Shift+I
              </kbd>
              ).
            </li>
            <li>Pilih tab Jaringan (Network) dan centang opsi Simpan log (Preserve log).</li>
            <li>Unggah foto dan lakukan analisis di PERISAI OPSEC.</li>
            <li>
              Amati daftar permintaan jaringan: <strong>nol permintaan</strong> berisi payload foto/teks ke
              server mana pun.
            </li>
            <li>
              Jika peta tidak diaktifkan: <strong>tidak ada permintaan ke server peta OpenStreetMap</strong>.
            </li>
            <li>Matikan Wi-Fi/internet: analisis tetap berjalan tanpa koneksi.</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
