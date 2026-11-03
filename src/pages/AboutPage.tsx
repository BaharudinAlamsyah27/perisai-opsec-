import React from 'react';
import { Shield, Award, BookOpen, Code2 } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex items-center space-x-3 mb-6">
        <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30">
          <Shield className="w-8 h-8" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Tentang PERISAI OPSEC</h1>
          <p className="text-sm text-slate-400">Teknologi Penangkalan Mandiri untuk Keamanan Personel dan Satuan TNI AD</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Hackathon Context */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Award className="w-5 h-5 text-amber-400" />
            <span>Konteks Hackathon</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed">
            Karya ini dikembangkan untuk <strong>Kartika Cyber Hackathon 2026</strong> yang diselenggarakan oleh <strong>Pusat Siber Angkatan Darat (PUSSIBERAD)</strong> bersama Codepolitan dalam kategori <strong>PENANGKALAN</strong>. Tujuannya adalah mencegah dan menanggulangi ancaman kebocoran data intelijen operasional (OPSEC) yang sering tidak disadari saat prajurit atau keluarganya mengunggah konten ke media sosial.
          </p>
        </div>

        {/* Methodology */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-emerald-400" />
            <span>Metodologi Analisis Deterministik</span>
          </h2>
          <p className="text-sm text-slate-300 leading-relaxed mb-3">
            Sistem menganalisis potensi kebocoran melalui 4 pilar utama:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">1. Metadata Forensik</strong>
              Membaca EXIF foto: koordinat GPS presisi, tanggal & jam pengambilan, model kamera, dan nomor seri perangkat.
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">2. OCR Teks Gambar</strong>
              Ekstraksi teks di dalam latar foto secara lokal untuk mendeteksi plang pos jaga, seragam, spanduk, atau dokumen.
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">3. Kamus Aturan OPSEC</strong>
              Mencocokkan istilah kesatuan (Kodam/Korem/Yonif), tanda kehormatan, nomor registrasi personel (NRP), NIK, dan plat kendaraan.
            </div>
            <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800">
              <strong className="text-emerald-400 block mb-1">4. Skor Noisy-OR Transparan</strong>
              Perhitungan probabilitas risiko matematis yang dapat dijelaskan secara transparan tanpa model black-box AI.
            </div>
          </div>
        </div>

        {/* Open Source Credits & AI Declaration */}
        <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-sky-400" />
            <span>Kredit Komponen Open Source & Deklarasi AI</span>
          </h2>
          <p className="text-xs text-slate-400 mb-3">
            Dibangun dengan teknologi berlisensi terbuka (MIT / ISC / BSD):
          </p>
          <ul className="text-xs text-slate-300 space-y-1 font-mono">
            <li>• React & TypeScript (MIT) — Antarmuka reaktif dan pengetikan ketat</li>
            <li>• Vite & Tailwind CSS (MIT) — Bundler cepat dan tata letak responsif</li>
            <li>• Zustand (MIT) — Manajemen state client-side ringan</li>
            <li>• exifr (MIT) — Pengurai metadata EXIF/GPS berkinerja tinggi</li>
            <li>• Leaflet & OpenStreetMap (BSD-2-Clause / ODbL) — Visualisasi peta geospasial offline-ready</li>
            <li>• Lucide React (ISC) — Ikon antarmuka pengguna</li>
          </ul>
          <div className="mt-4 pt-3 border-t border-slate-700/60 text-xs text-slate-400">
            <strong>Deklarasi AI:</strong> Proyek ini dirancang dan dikembangkan dengan bantuan AI coding assistant (Antigravity & Codex) selama periode resmi kompetisi. Seluruh aturan keamanan dan kode sumber diverifikasi serta diuji secara ketat.
          </div>
        </div>
      </div>
    </div>
  );
};

