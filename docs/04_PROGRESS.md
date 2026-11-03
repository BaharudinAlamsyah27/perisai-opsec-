# 04 — Progress Tracker (DOKUMEN HIDUP — update setiap sesi)

**Posisi terakhir: Checkpoint I1–I7 diterapkan dan di-commit; uji UI browser I1 masih pending. T-020 laporan risiko selesai, lanjut validasi T-017–T-019 lalu T-022**

**Terakhir diperbarui:** 3 Nov 2026 oleh AG · **Fase:** Sprint 2 (P0)
**Hari ke:** H2 dari 14 · **Sisa waktu ke deadline:** 12 hari

## 1. Dasbor Ringkas
| Area | Status | Catatan |
|---|---|---|
| Registrasi hackathon | ⬜ Belum | T-000 |
| Repo & scaffold | ✅ Selesai | T-001/T-002 |
| P0 (MVP) | Implementasi T-002–T-021 tersedia; T-017–T-019 verifikasi dan T-022 gate masih pending | Gerbang: 9 Nov |
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
| T-015 | Analisis caption | AG | ✅ | feat(T-015) | Input caption, live inline highlight, generator template penulisan ulang aman |
| T-016 | Overlay bbox | AG | ✅ | feat(T-016) | Interaktivitas hover kartu temuan <-> sorot visual target-lock bbox |
| T-017 | Sanitize strip | CX | 🔄 | | Canvas re-encode tersedia; cek metadata hasil masih perlu diuji |
| T-018 | Sensor otomatis | AG | 🔄 | | BBox temuan disensor otomatis; gaya mosaik dan blok hitam |
| T-019 | Perbandingan sebelum/sesudah | AG | 🔄 | | Slider tersedia; skor versi aman tidak diklaim 0 tanpa analisis ulang |
| T-020 | Laporan risiko | AG | ✅ | 7e4d243 | Ringkasan temuan dan cetak/simpan PDF dengan print CSS |
| T-021 | Privasi/Tentang/Kredit | AG | ✅ | 6430ce3 | Halaman privasi/tentang tersedia; lisensi OCR dan globe dicantumkan |
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

**Berikutnya yang harus dikerjakan:** verifikasi T-017–T-019 (terutama ekspor tanpa EXIF dan akurasi sensor), kemudian T-022 gerbang review P0. Checkpoint F/G (T-011–T-014) telah selesai.

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

### 3 Nov 2026 — Codex — Sesi analisis & lanjutan T-017–T-019
- Dikerjakan: Membaca PRD, arsitektur, rencana kerja, progress tracker, dan implementasi yang ada. Melanjutkan perubahan lokal SanitizerPreview/sanitize yang belum di-commit; area sensor sekarang benar-benar dimosaikkan atau diblok hitam, bbox di-clamp dan bbox kosong dilewati, pratinjau memakai object URL yang dibersihkan, nama unduhan generik, serta klaim skor 0 dihapus karena hasil belum dianalisis ulang.
- Hasil/verifikasi: Unit test, lint, dan build produksi lulus pada validasi berikutnya; uji metadata hasil dan browser masih pending.
- Belum selesai: Uji ekspor tanpa EXIF, visual bbox pada berbagai rasio gambar, penanganan error browser, dan penilaian ulang skor versi aman.
- Keputusan: Tidak mengarang skor hasil sanitasi; UI menyatakan perlu analisis ulang.
- Blocker/pertanyaan: —
- Commit: cdd4254

### 3 Nov 2026 — Codex — Checkpoint I1 (perbaikan OCR)
- Dikerjakan: Menetapkan `gzip: false` untuk aset traineddata yang tidak dikompresi; memakai base URL lokal untuk worker/core/bahasa; meminta output `blocks` Tesseract.js v7 dan memetakan kata+bbox dari struktur bersarangnya; membedakan error OCR teknis dari hasil berhasil tanpa teks; log error menyertakan pesan teknis. Fixture sintetis `POS JAGA YONIF 999` dibuat.
- Hasil/verifikasi: `npm test` 49/49 lulus, lint bersih, build produksi sukses. OCR Tesseract Node offline mengenali “POS JAGA YONIF 999” dengan 4 kata+bbox memakai aset `public/tessdata` dan `dist/tessdata`.
- Belum selesai: Reproduksi UI browser dev vs `preview`, pemeriksaan MIME/CSP dari respons HTTP, dan uji app browser offline belum dapat dilakukan karena localhost tidak terjangkau dari browser/tool pada sesi ini.
- Keputusan: CSP deploy tidak diubah; kebijakan saat ini sudah mencakup worker lokal/blob, WASM, dan koneksi same-origin.
- Blocker/pertanyaan: Perlu uji browser dev/preview dari browser lokal yang dapat membuka server host.
- Commit: c0411bf

### 3 Nov 2026 — Codex — Checkpoint I2 (konsistensi skor)
- Dikerjakan: Skor final sekarang memakai profil aktif pada saat kalkulasi. Log mencatat profil dan nilai skor; pergantian persona menambahkan baris log dengan skor hasil kalkulasi ulang. Pergantian profil saat OCR berjalan juga tercatat dan disertakan di log akhir.
- Hasil/verifikasi: Unit test store memastikan skor Keluarga 26 muncul sama di state dan log.
- Belum selesai: —
- Keputusan: —
- Blocker/pertanyaan: —
- Commit: c940222

### 3 Nov 2026 — Codex — Checkpoint I3 (bobot profil)
- Dikerjakan: Mengganti satu angka di label persona dengan tooltip yang memuat bobot Lokasi, Identitas, Operasional, dan Teknis; sumber nilainya langsung dari `PROFILE_MULTIPLIERS` scoring engine.
- Hasil/verifikasi: Test komponen memeriksa nilai tooltip untuk ketiga profil.
- Belum selesai: —
- Keputusan: Tooltip muncul melalui hover dan fokus keyboard.
- Blocker/pertanyaan: —
- Commit: 8eedb4c

### 3 Nov 2026 — Codex — Checkpoint I4 (orientasi globe)
- Dikerjakan: Konversi GPS ke orientasi Cobe diekstrak menjadi fungsi murni; orientasi GPS diinterpolasi secara halus dengan sudut terdekat agar tidak berputar jauh pada batas longitude; marker memakai latitude/longitude temuan secara langsung.
- Hasil/verifikasi: Test unit menguji konversi koordinat dan longitude yang melintasi ±π.
- Belum selesai: Pemeriksaan visual globe di browser masih menunggu uji browser lokal.
- Keputusan: —
- Blocker/pertanyaan: Uji visual marker/rotasi langsung di UI masih tertunda bersama I1.
- Commit: f5442b3

### 3 Nov 2026 — Codex — Checkpoint I5 (duplikat unggahan)
- Dikerjakan: Membuat sidik berkas cepat dari nama ternormalisasi, ukuran, dan sampel lokal awal/tengah/akhir. Unggahan yang cocok menampilkan pilihan “Lewati yang duplikat” atau “Tetap tambahkan semua”.
- Hasil/verifikasi: Unit test sidik berkas dan test komponen untuk kedua pilihan.
- Belum selesai: —
- Keputusan: Tidak ada data berkas yang dikirim; hash dihitung di browser.
- Blocker/pertanyaan: —
- Commit: ccacee6

### 3 Nov 2026 — Codex — Checkpoint I6 (label waktu EXIF)
- Dikerjakan: Waktu EXIF diformat tanpa `Z` atau klaim zona waktu; objek Date dipresentasikan memakai komponen waktu perangkat. Label UI menyatakan “WAKTU MENURUT PERANGKAT”.
- Hasil/verifikasi: Unit test memastikan format tidak memiliki `Z` dan menjaga jam yang dikodekan EXIF.
- Belum selesai: —
- Keputusan: —
- Blocker/pertanyaan: —
- Commit: 552ddaf

### 3 Nov 2026 — Codex — Checkpoint I7 (tagline & klaim lokal)
- Dikerjakan: Subjudul header diganti menjadi “Periksa sebelum unggah.” Klaim persentase pemrosesan lokal di badge header, upload zone, dan footer diganti dengan label yang tidak berulang; klaim eksplisit tetap ada di banner privasi.
- Hasil/verifikasi: Smoke test memeriksa tagline dan batas maksimal dua klaim `100%` lokal/perangkat pada layar awal.
- Belum selesai: —
- Keputusan: —
- Blocker/pertanyaan: —
- Commit: 58a0b2c

### 3 Nov 2026 — Codex — T-020 (laporan risiko)
- Dikerjakan: Menambah ringkasan laporan foto aktif, profil, skor, bukti, alasan, serta rekomendasi; tombol cetak/simpan PDF dan CSS khusus cetak A4.
- Hasil/verifikasi: Test laporan memastikan ringkasan dan seluruh bukti/alasan/rekomendasi muncul serta tombol memanggil fungsi cetak. Validasi akhir: 53 test lulus, lint bersih, build sukses.
- Belum selesai: Ekspor cetak/PDF perlu pemeriksaan visual di browser.
- Keputusan: —
- Blocker/pertanyaan: Pemeriksaan visual browser lokal masih tidak tersedia di sesi ini.
- Commit: 7e4d243

### 3 Nov 2026 — Codex — T-021 (kredit lisensi)
- Dikerjakan: Melengkapi kredit Tentang untuk Tesseract.js/Core, model tessdata Indonesia/Inggris, dan Cobe beserta lisensinya. Halaman Privasi/Tentang sudah tersedia.
- Hasil/verifikasi: Validasi akhir lint dan build lulus; seluruh suite 53 test lulus.
- Belum selesai: —
- Keputusan: —
- Blocker/pertanyaan: —
- Commit: 6430ce3

### 3 Nov 2026 — Codex — Validasi akhir Checkpoint I & T-020/T-021
- Dikerjakan: Test, lint, dan build untuk keseluruhan perubahan.
- Hasil/verifikasi: `npm test` — 18 file, 53 test lulus; `npm run lint` — bersih; `npm run build` — sukses. Vite menampilkan peringatan ukuran bundle utama sedikit di atas 500 kB.
- Belum selesai: Reproduksi dan uji OCR pada UI browser dev/preview/offline; pemeriksaan visual globe dan laporan cetak; validasi EXIF/sensor ekspor versi aman.
- Keputusan: OCR Node offline mengonfirmasi model lokal dan bbox pada `public/tessdata` serta `dist/tessdata`; ini belum menggantikan verifikasi browser.
- Blocker/pertanyaan: Browser/tool sesi tidak dapat membuka server localhost sehingga validasi UI tetap menunggu lingkungan browser lokal.
- Commit: menunggu

### 3 Nov 2026 — AG (Antigravity) — Sesi #7 (Task T-016: Overlay BBox Temuan Interaktif)
- Dikerjakan:
  1. Implementasi state `hoveredFindingId` terpadu pada `AnalysisPage.tsx`.
  2. Modifikasi `FindingCard.tsx` dengan event `onMouseEnter`/`onMouseLeave` dan indikator badge `SOROT VISUAL` untuk temuan yang memiliki koordinat bbox.
  3. Modifikasi `ScanOverlay.tsx` dengan reticle target-lock dinamis, ring cyan bercahaya dan efek elevasi saat kartu temuan di-hover (serta sebaliknya saat bbox di foto di-hover).
- Hasil/verifikasi: `npm test` 39/39 passed, `npm run lint` 0 warning/error, `npm run build` sukses.
- Commit: feat(T-016): interactive bbox overlay with bi-directional hover highlighting

### 3 Nov 2026 — AG (Antigravity) — Sesi #6 (GlobeHero Polish & Layout Alignment)
- Dikerjakan:
  1. Kontras titik benua pada GlobeHero ditingkatkan signifikan (`mapBrightness: 14`, `mapBaseBrightness: 0.12`, `baseColor: [0.15, 0.45, 0.58]`, `diffuse: 1.6`) sehingga kontur benua terbaca jelas, tegas, dan berkelas.
  2. Status label di bawah globe disesuaikan dengan instruksi: "MENUNGGU DATA GPS DARI FOTO" (monospace) saat standby, dan format koordinat presisi saat GPS terdeteksi.
  3. Penyelarasan tinggi layout desktop (`items-stretch`) antara zona unggah dan panel globe untuk mengeliminasi ruang kosong berlebih.
  4. Verifikasi animasi idle putaran pelan, berhenti saat `document.hidden` atau `prefers-reduced-motion`.
- Hasil/verifikasi: `npm test` 39/39 passed, `npm run lint` 0 warning/error, `npm run build` sukses.
- Commit: fix(visual): enhance globe contrast, status label, and layout alignment

### 3 Nov 2026 — AG (Antigravity) — Sesi #5 (Task T-015: Analisis Caption & Safe Rewrites)
- Dikerjakan:
  1. Engine penulisan ulang aman (`src/engine/captionRewriter.ts`): menghasilkan template penulisan ulang aman militer (*Dukungan Moral & Semangat*, *Dokumentasi Pasca-Kegiatan*, *Sensor Otomatis/Redacted*, dan *Persona Keluarga Prajurit*).
  2. Komponen UI Analisis Caption (`src/components/CaptionAnalysis.tsx`): input teks caption langsung, inline live highlighting untuk setiap kata/frasa berisiko berdasarkan aturan OPSEC, daftar badge temuan, serta kartu kartu template penulisan ulang aman dengan tombol satu-klik salin ke clipboard.
  3. Integrasi ke `AnalysisPage.tsx` dan penambahan unit test di `captionRewriter.test.ts`.
- Hasil/verifikasi: `npm test` 39/39 lulus; `npm run lint` 0 error/0 warning; `npm run build` sukses.
- Commit: feat(T-015): implement caption analysis, inline highlight, and safe rewrite templates

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
