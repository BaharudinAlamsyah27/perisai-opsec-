# 04 — Progress Tracker (DOKUMEN HIDUP — update setiap sesi)

**Posisi terakhir: Checkpoint H selesai (Visual Upgrade Command Center OPSEC, Globe 3D, Radar, Gauge, Console, ScanOverlay), lanjut T-015**

**Terakhir diperbarui:** 3 Nov 2026 oleh AG · **Fase:** Sprint 1 (P0 + Visual Upgrade)
**Hari ke:** H2 dari 14 · **Sisa waktu ke deadline:** 12 hari

## 1. Dasbor Ringkas
| Area | Status | Catatan |
|---|---|---|
| Registrasi hackathon | ⬜ Belum | T-000 |
| Repo & scaffold | ✅ Selesai | T-001/T-002 |
| P0 (MVP) | 8 / 22 task | Gerbang: 9 Nov |
| P1 (Pembeda) | 0 / 5 task | Gerbang: 11 Nov |
| QA | ⬜ | 12 Nov |
| Deploy publik | ⬜ | 12 Nov |
| Aset submission | ⬜ | 13 Nov |
| Submit | ⬜ | 14 Nov |

Status: ⬜ belum · 🔄 berjalan · ✅ selesai · ⛔ terblokir · ✂️ dipotong

## 2. Papan Task
> Salin ID task dari `03_RENCANA_KERJA.md`. Ubah status saat bekerja.

| ID | Task | Owner | Status | Commit/PR | Catatan |
|---|---|---|---|---|---|
| T-000 | Registrasi tim | PO | ⬜ | | |
| T-001 | Repo + docs | PO | ⬜ | | |
| T-002 | Scaffold & tooling | AG | ✅ | feat(T-002) | Vite+React18+TS strict+Tailwind v3+Vitest |
| T-003 | Layout & routing | AG | ✅ | feat(T-003) | Header, Navigasi ID, Tab routing |
| T-004 | CSP + banner privasi | AG | ✅ | feat(T-004) | netlify.toml, vercel.json, banner Zero-Upload |
| T-005 | Komponen unggah | AG | ✅ | feat(T-005) | Drag-drop, multi-file, validasi 25MB, store Zustand |
| T-006 | Engine metadata | CX/AG | ✅ | feat(T-006) | Ekstraksi EXIF via exifr, S/W hemisfer, pemetaan terpisah |
| T-007 | Peta Leaflet | AG | ✅ | feat(T-007) | Leaflet map, marker lokal ter-bundle, offline fallback; D-008: peta jadi opt-in |
| T-008 | Types + scoring | CX/AG | ✅ | feat(T-008) | Noisy-OR deterministik, level risiko, profil pengali |
| T-009 | Panel hasil | AG | ✅ | feat(T-009) | Skor 0-100, badge level, switcher profil, daftar temuan |
| T-010 | OCR worker | AG | ✅ | feat(T-010..T-014) | Tesseract.js worker lokal ind+eng, downscaling maks 2400px, bbox scaling |
| T-011 | Kamus JSON | AG | ✅ | feat(T-010..T-014) | Kamus satuan, lokasi, pergerakan, jadwal, identitas, dokumen di src/data/ |
| T-012 | Rule engine | AG | ✅ | feat(T-010..T-014) | rules.ts fungsi murni, normalisasi teks, validasi pola kontekstual |
| T-013 | Mapping bbox | AG | ✅ | feat(T-010..T-014) | ocr-mapper.ts menggabungkan urutan kata OCR ke bbox temuan |
| T-014 | Combo boost | AG | ✅ | feat(T-010..T-014) | combos.ts mendeteksi >=3 grup operasional -> temuan sintetis kritis |
| T-015 | Analisis caption | AG | ⬜ | | |
| T-016 | Overlay bbox | AG | ⬜ | | |
| T-017 | Sanitize strip | CX | ⬜ | | |
| T-018 | Sensor otomatis | AG | ⬜ | | |
| T-019 | Perbandingan sebelum/sesudah | AG | ⬜ | | |
| T-020 | Laporan risiko | AG | ⬜ | | |
| T-021 | Privasi/Tentang/Kredit | AG | ⬜ | | |
| T-022 | Gerbang P0 | CX/PO | ⬜ | | |
| T-023 | Engine pola hidup | CX | ⬜ | | |
| T-024 | Halaman pola hidup | AG | ⬜ | | |
| T-025 | Profil pengguna | AG | ⬜ | | |
| T-026 | Sensor manual | AG | ⬜ | | |
| T-027 | Editor kamus | AG | ⬜ | | |
| T-028 | Mode edukasi | AG | ⬜ | | |
| T-029 | AI Vision opsional | AG | ⬜ | | |
| T-030 | Dataset uji | PO+CX | ⬜ | | |
| T-031 | QA penuh | CX | ⬜ | | |
| T-032 | Bugfix & polish | AG | ⬜ | | |
| T-033 | Deploy publik | PO+AG | ⬜ | | |
| T-034 | README + ZIP | AG | ⬜ | | |
| T-035 | Aset submission | PO+PM | ⬜ | | |
| T-036 | Submit | PO | ⬜ | | |

**Berikutnya yang harus dikerjakan:** T-015 (AG: Analisis teks keterangan / caption + template penulisan ulang).

## 3. Log Sesi (terbaru di atas)
Format:
```
### [Tanggal] — [Agent/Orang] — Sesi #N
- Dikerjakan: ...
- Hasil/verifikasi: ... (perintah & output ringkas)
- Belum selesai: ...
- Keputusan: ...
- Blocker/pertanyaan: ...
- Commit: ...
```

### 3 Nov 2026 — AG (Antigravity) — Sesi #4 (Checkpoint H: Visual Upgrade)
- Dikerjakan:
  1. Transformasi tema UI menjadi 'Command Center OPSEC' militer-siber: palet gelap cyan/emerald dengan batas aksen HUD corner brackets, grid halus, dan kontras AA penuh.
  2. GlobeHero (`src/components/GlobeHero.tsx`): globe 3D WebGL via library ringan `cobe` (~5 KB, MIT, D-010). Berputar pelan secara lokal, memutar halus ke titik GPS target saat ada koordinat foto terdeteksi, dengan fallback senyap dan dukungan prefers-reduced-motion.
  3. ScanOverlay (`src/components/ScanOverlay.tsx`): efek garis pemindaian cyan bercahaya di atas foto saat status 'analyzing', dan target-lock reticle bounding box untuk temuan visual OCR.
  4. RiskRadar (`src/components/RiskRadar.tsx`): visualisasi vektor ancaman 4 sumbu (Lokasi, Identitas, Operasional, Teknis) berbasis SVG murni tanpa dependensi chart eksternal.
  5. ScoreGauge (`src/components/ScoreGauge.tsx`): circular gauge SVG dengan animasi counter naik dan pewarnaan dinamis sesuai tingkat risiko.
  6. AnalysisConsole (`src/components/AnalysisConsole.tsx`): terminal log audit interaktif yang menampilkan proses nyata engine (EXIF, OCR, RULES, COMBO).
  7. StatTiles (`src/components/StatTiles.tsx`): dasbor metrik sesi (total foto, titik temuan, skor puncak, indikator 0 byte data keluar).
  8. Header, PrivacyBanner, UploadZone, dan ResultsPanel disinkronkan dengan tema Command Center.
- Hasil/verifikasi: `npm test` 37/37 lulus; `npm run lint` 0 error/0 warning; `npm run build` sukses.
- Keputusan: D-010 (Library 3D WebGL `cobe` untuk visualisasi geolokasi globe).
- Commit: feat(H): visual upgrade to opsec command center

### 3 Nov 2026 — AG (Antigravity) — Sesi #3 (Checkpoint E, F, G)
- Dikerjakan:
  1. Checkpoint E (T-010): Web Worker OCR (`src/engine/ocr.worker.ts`) dengan Tesseract.js v7 + core WASM + traineddata fast lokal (ind+eng) di `public/tessdata/`, penanganan downscale gambar maks 2400px dengan proyeksi kembali skala bbox, wrapper OCR dengan retry max 2x (`src/engine/ocr.ts`).
  2. Checkpoint F (T-011 + T-012): Kamus JSON militer di `src/data/` (satuan, lokasi, pergerakan, jadwal, identitas, klasifikasi dokumen) serta engine aturan teks murni (`src/engine/rules.ts`) dengan normalisasi dan validasi konteks.
  3. Checkpoint G (T-013 + T-014): Pemetaan kata OCR berurutan ke bounding box temuan (`src/engine/ocr-mapper.ts`) dan boost kombinasi co-occurrence operasional (`src/engine/combos.ts`) yang menghasilkan temuan sintetis 'Pola Penugasan Terbaca' (critical).
  4. Integrasi ke Zustand `useAnalysisStore.ts` dan kalkulasi scoring deterministik Noisy-OR.
- Hasil/verifikasi:
  - `npm test`: 35/35 test lulus (scoring, metadata, rules, combos, ocr, map, app smoke).
  - `npm run lint`: 0 error, 0 warning (TypeScript strict tanpa any).
  - `npm run build`: bundle produksi sukses tsc & vite build.
- Keputusan: D-009 (Aset Tesseract dan tessdata_fast lokal Apache-2.0).
- Commit: feat(T-010..T-014)

### 3 Nov 2026 — AG (Antigravity) — Sesi #2 (Checkpoint D)
- Dikerjakan: Map opt-in (LeafletMap.tsx): tile OSM hanya dimuat setelah pengguna klik tombol eksplisit; tampilkan koordinat teks + peringatan area kasar lokasi; update PrivacyBanner + PrivacyPage; 4 test LeafletMap baru; update AGENTS.md §2.1 dan PRD §9 untuk mencerminkan opt-in; package-lock.json ter-commit; node_modules di .gitignore.
- Hasil/verifikasi: npm test lulus; npm run lint bersih; npm run build berhasil.
- Keputusan: D-008 (peta OSM jadi opt-in eksplisit).
- Commit: feat(D): map opt-in for privacy, update docs and tests (D-008)

### 2 Nov 2026 — AG (Antigravity) — Sesi #1 (Checkpoint C)
- Dikerjakan: Komponen unggah drag-drop multi-file dengan validasi format dan batas 25MB (T-005), Zustand store untuk reaktivitas analisis dan profil switcher (`useAnalysisStore`), peta Leaflet interaktif dengan bundling lokal marker icon PNG dan fallback offline anggun (T-007), serta panel hasil analisis lengkap dengan skor noisy-OR 0–100, badge tingkat risiko, pemilih persona (Prajurit/Keluarga/Satuan), dan kartu temuan eviden/alasan/rekomendasi (T-009).
- Hasil/verifikasi: `npm run lint` bersih (0 warning, 0 error), `npm run build` berhasil (bundle dist/ lengkap), `npm test` lulus 18/18 test suite.
- Commit: feat(T-005,T-007,T-009)

### 2 Nov 2026 — AG (Antigravity) — Sesi #1 (Checkpoint B)
- Dikerjakan: Types terpadu (`src/types/index.ts`), pemetaan aturan ke grup kombinasi (`src/data/combo-groups.json`), scoring engine deterministik Noisy-OR dengan pengali profil (`src/engine/scoring.ts`, T-008), dan metadata engine dengan isolasi fungsi parsing/pemetaan dari pembaca file (`src/engine/metadata.ts`, T-006).
- Hasil/verifikasi: 16 unit test engine di `scoring.test.ts` dan `metadata.test.ts` lulus 100% tanpa mock gambar nyata.
- Commit: feat(T-006,T-008)

### 2 Nov 2026 — AG (Antigravity) — Sesi #1 (Checkpoint A)
- Dikerjakan: Scaffold Vite + React 18 + TS strict + Tailwind v3 + Vitest + ESLint + Prettier (T-002), layout dan routing navigasi dasar bahasa Indonesia (T-003), banner privasi zero-upload dan konfigurasi CSP produksi di netlify.toml & vercel.json (T-004).
- Hasil/verifikasi: `npm run build` dan `npm test` lulus.
- Keputusan: D-006 (lucide-react), D-007 (Tailwind v3).
- Commit: feat(T-002..T-004)

### 2 Nov 2026 — PM (Claude) — Sesi #0
- Dikerjakan: memilih konsep (Perisai OPSEC, kategori Penangkalan), menyusun PRD, arsitektur, rencana kerja, QA, naskah demo.
- Keputusan: lihat Decision Log D-001 s.d. D-005.
- Berikutnya: PO registrasi + buat repo; AG scaffold.

## 4. Decision Log
| ID | Tanggal | Keputusan | Alasan | Alternatif ditolak |
|---|---|---|---|---|
| D-001 | 2 Nov | Pilih ide Perisai OPSEC (kategori Penangkalan) | Langka, relevan TNI AD, aman dikerjakan solo, demo kuat | Sentinel Narasi (butuh data sulit), Radar Impersonasi (bergantung LLM), Triase Log (generik) |
| D-002 | 2 Nov | Client-side only, tanpa backend | Privasi, hosting gratis, minim risiko demo | Backend FastAPI |
| D-003 | 2 Nov | Inti deterministik, AI opsional opt-in | Tanpa biaya, andal, tidak bergantung kuota | LLM sebagai inti |
| D-004 | 2 Nov | Target submit 14 Nov (buffer 1 hari) | Hindari kegagalan di menit terakhir | Submit 15 Nov |
| D-005 | 2 Nov | Rekonstruksi Pola Hidup jadi P1 utama | Pembeda inovasi | Fitur AI vision sebagai pembeda |
| D-006 | 2 Nov | Tambahkan library ikon `lucide-react` (lisensi ISC) | Ikon UI standar, ringan, lisensi permisif | SVG manual yang verbose |
| D-007 | 2 Nov | Gunakan Tailwind CSS v3 (v3.4.17) | Kompatibilitas stabil dengan PostCSS & bundler | Tailwind v4 (masih transisi breaking changes) |
| D-008 | 3 Nov | Peta OSM jadi opt-in eksplisit | Tile request mengungkap area lokasi kasar ke server OSM; prinsip zero-upload diperkuat | Auto-load tile seperti semula |
| D-009 | 3 Nov | Bundling aset Tesseract.js & tessdata_fast lokal (Apache-2.0) | Zero-upload dan zero-CDN di runtime, privasi & offline penuh | Mengambil traineddata dari CDN saat runtime |
| D-010 | 3 Nov | Gunakan library 3D WebGL `cobe` (~5 KB, MIT) untuk GlobeHero | Ringan, tanpa request CDN/jaringan, performa tinggi tanpa tile peta | Canvas 2D manual atau Three.js yang membengkakkan bundle |

## 5. Daftar Risiko
| ID | Risiko | Kemungkinan | Dampak | Mitigasi | Pemilik | Status |
|---|---|---|---|---|---|---|
| R-01 | Waktu tidak cukup (13 hari, solo) | Sedang | Tinggi | P0 dulu, feature freeze 11 Nov, potong P1/P2 | PO | Terbuka |
| R-02 | OCR Indonesia kurang akurat pada foto berisik | Tinggi | Sedang | Downscale/kontras praproses, uji dengan foto sintetis jelas, tampilkan skor keyakinan, pengguna dapat edit teks OCR | CX | Terbuka |
| R-03 | Tesseract/WASM bermasalah dengan CSP/worker | Sedang | Sedang | Uji di Sprint 2 awal; tessdata lokal; sesuaikan `worker-src`/`wasm-unsafe-eval` | AG | Terbuka |
| R-04 | Tile peta gagal (offline) | Rendah | Rendah | Fallback koordinat teks | AG | Terbuka |
| R-05 | Dianggap "hanya EXIF viewer" | Sedang | Tinggi | Tonjolkan skor kontekstual, boost kombinasi, Pola Hidup, profil | PM | Terbuka |
| R-06 | Kuota/syarat AI gratis berubah | Sedang | Rendah | AI hanya P2 opsional | PM | Terbuka |
| R-07 | Konflik edit antar agent | Sedang | Sedang | Branch per task; satu task satu agent; baca PROGRESS di awal sesi | PO | Terbuka |
| R-08 | Dataset uji menyentuh data pribadi pihak ketiga | Rendah | Tinggi | Hanya sintetis/milik sendiri | PO | Terbuka |
| R-09 | Lupa/telat submit atau tautan mati | Rendah | Kritis | Submit 14 Nov; cek tautan dari perangkat lain; ZIP cadangan | PO | Terbuka |
| R-10 | HEIC dari iPhone tidak terbaca | Sedang | Rendah | Pesan ramah + opsi heic2any bila sempat | AG | Terbuka |

## 6. Pertanyaan untuk PO
(Agent: tambahkan di sini, beri tanda tanggal.)
- —

## 7. Blocker Aktif
- —

## 8. Changelog (rilis internal)
- v0.0.0 — Perencanaan.

## 9. Ringkasan Harian (isi PO tiap malam, 2 menit)
| Tanggal | Target hari ini | Tercapai? | Risiko baru | Rencana besok |
|---|---|---|---|---|
| 2 Nov | Dokumen + registrasi + scaffold | | | |
