# 04 — Progress Tracker (DOKUMEN HIDUP — update setiap sesi)

**Terakhir diperbarui:** 2 Nov 2026 oleh PM · **Fase:** Perencanaan selesai, siap Sprint 0
**Hari ke:** H1 dari 14 · **Sisa waktu ke deadline:** 13 hari

## 1. Dasbor Ringkas
| Area | Status | Catatan |
|---|---|---|
| Registrasi hackathon | ⬜ Belum | T-000 |
| Repo & scaffold | ✅ Selesai | T-001/T-002 |
| P0 (MVP) | 5 / 22 task | Gerbang: 9 Nov |
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
| T-005 | Komponen unggah | AG | ⬜ | | |
| T-006 | Engine metadata | CX/AG | ✅ | feat(T-006) | Ekstraksi EXIF via exifr, S/W hemisfer, pemetaan terpisah |
| T-007 | Peta Leaflet | AG | ⬜ | | |
| T-008 | Types + scoring | CX/AG | ✅ | feat(T-008) | Noisy-OR deterministik, level risiko, profil pengali |
| T-009 | Panel hasil | AG | ⬜ | | |
| T-010 | OCR worker | AG | ⬜ | | |
| T-011 | Kamus JSON | CX | ⬜ | | |
| T-012 | Rule engine | CX | ⬜ | | |
| T-013 | Mapping bbox | CX | ⬜ | | |
| T-014 | Combo boost | CX | ⬜ | | |
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

**Berikutnya yang harus dikerjakan:** T-000 (PO), T-001 (PO), lalu T-002 (AG).

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
