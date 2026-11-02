# 03 — Rencana Kerja (Work Breakdown & Jadwal)

**Hari ini:** 2 Nov 2026 · **Deadline resmi:** 15 Nov 23:59 WIB · **Target internal selesai:** 13 Nov · **Target submit:** 14 Nov (buffer 1 hari)

Legenda owner: **AG** = Antigravity · **CX** = Codex · **PO** = Anda · **PM** = Claude. Prioritas P0/P1/P2 sesuai PRD.

## Jadwal Tingkat Tinggi
| Tanggal | Hari | Fokus | Gerbang (exit criteria) |
|---|---|---|---|
| 2 Nov | H1 | Registrasi, repo, dokumen, scaffold | Terdaftar di platform; repo + docs siap; app kosong jalan |
| 3 Nov | H2 | Ingest + EXIF + peta | Unggah foto → GPS tampil di peta |
| 4 Nov | H3 | Engine skor + temuan metadata + UI hasil | Skor muncul dengan penjelasan |
| 5 Nov | H4 | OCR worker (+ webinar 2, opsional) | Teks & bbox dari foto sintetis |
| 6 Nov | H5 | Rule engine teks (kamus) | Temuan OCR/caption + highlight |
| 7 Nov | H6 | Combo boost + analisis caption + tes engine | Test engine hijau |
| 8 Nov | H7 | Versi aman (strip + blur) | Unduh hasil tanpa EXIF, area teks tersensor |
| 9 Nov | H8 | Laporan + halaman Privasi/Tentang/Kredit | **Gerbang P0 selesai** |
| 10 Nov | H9 | P1: Pola Hidup (F-11) | Linimasa + peta pola multi-foto |
| 11 Nov | H10 | P1: Profil, sensor manual, polish UI | Fitur dibekukan (feature freeze) |
| 12 Nov | H11 | QA penuh, bugfix, deploy publik | URL publik stabil, CSP aktif |
| 13 Nov | H12 | Video, screenshot, thumbnail, slide | Semua aset siap |
| 14 Nov | H13 | **SUBMIT** + verifikasi | Submission terkirim & dicek ulang |
| 15 Nov | H14 | Cadangan darurat saja | Jangan submit di hari ini kecuali terpaksa |

> Aturan: bila ada task P0 yang molor lebih dari setengah hari, **potong P1/P2**, jangan geser jadwal submit.

## Daftar Task

### Sprint 0 — Fondasi (H1)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-000 | Registrasi tim di codepolitan.com/dashboard/kartika-cyber-hackathon-2026 (pilih kategori **Penangkalan**; isi nama karya & deskripsi) | PO | P0 | Status "disetujui"; screenshot bukti tersimpan |
| T-001 | Buat repo Git, tambahkan AGENTS.md + docs/ | PO | P0 | Repo ada, commit awal |
| T-002 | Scaffold Vite+React+TS+Tailwind, ESLint/Prettier, Vitest | AG | P0 | `npm run dev/build/test` jalan |
| T-003 | Layout dasar + routing (Analisis, Pola Hidup, Privasi, Tentang) berbahasa Indonesia | AG | P0 | Navigasi berfungsi |
| T-004 | Header CSP di config hosting + banner "Diproses di perangkat Anda" | AG | P0 | Banner tampil; CSP terpasang |

### Sprint 1 — Ingest & Metadata (H2–H3)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-005 | Komponen unggah (drag-drop, multi-file, validasi tipe/ukuran) | AG | P0 | F-01 |
| T-006 | `engine/metadata.ts` (exifr) → Finding[] | CX | P0 | Test: GPS, waktu, perangkat, serial terdeteksi |
| T-007 | Peta Leaflet menampilkan koordinat + fallback offline | AG | P0 | Marker muncul; tanpa internet tampil koordinat teks |
| T-008 | `types/` + `engine/scoring.ts` (noisy-OR, level, profil) | CX | P0 | Test sesuai PRD §7 (nilai tepat) |
| T-009 | Panel hasil: skor, daftar temuan, severity badge, alasan & rekomendasi | AG | P0 | F-05 |

### Sprint 2 — OCR & Rule Engine (H4–H6)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-010 | `ocr.worker.ts` + tessdata lokal (ind+eng) + progres | AG | P0 | F-03; UI tidak membeku |
| T-011 | Kamus JSON awal (satuan, lokasi, pergerakan, identitas, klasifikasi, jadwal) | CX | P0 | Mencakup katalog PRD §8 |
| T-012 | `engine/rules.ts` (regex + kata kunci + normalisasi huruf besar/kecil, singkatan) | CX | P0 | Test per aturan, termasuk kasus negatif |
| T-013 | Mapping kata OCR → bbox temuan (gabungkan kata berurutan) | CX | P0 | Temuan punya bbox benar pada skala asli |
| T-014 | `engine/combos.ts` (Pola Penugasan Terbaca) | CX | P0 | Test ≥3 kategori → critical |
| T-015 | Analisis caption: input teks, highlight inline, saran penulisan ulang aman | AG | P0 | F-07 |
| T-016 | Overlay bbox temuan di atas pratinjau foto | AG | P0 | Hover temuan ↔ sorot area |

### Sprint 3 — Versi Aman & Laporan (H7–H8)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-017 | `sanitize/`: re-encode canvas (strip metadata) | CX | P0 | Test: hasil tanpa EXIF (cek exifr kosong) |
| T-018 | Sensor otomatis bbox (blur/blok hitam, pilihan pengguna) | AG | P0 | Pratinjau sebelum/sesudah; unduh |
| T-019 | Slider perbandingan sebelum/sesudah + skor "sebelum → sesudah" | AG | P0 | Skor ulang pada hasil aman lebih rendah |
| T-020 | Laporan risiko (ringkasan, tabel temuan, rekomendasi) + print CSS/PDF | AG | P0 | F-08 |
| T-021 | Halaman Privasi (penjelasan + cara verifikasi di DevTools), Tentang, Kredit lisensi, deklarasi penggunaan AI coding | AG | P0 | F-09, F-10 |
| T-022 | **Gerbang P0:** review menyeluruh oleh CX + uji manual PO | CX/PO | P0 | Checklist QA P0 lulus |

### Sprint 4 — Pembeda (H9–H10)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-023 | `engine/pattern.ts`: kelompokkan foto per lokasi (cluster jarak), hitung frekuensi & jam, deteksi lokasi berulang | CX | P1 | Test dengan 8 foto sintetis |
| T-024 | Halaman Pola Hidup: peta multi-titik, linimasa, kartu "kesimpulan yang bisa ditarik pihak luar" | AG | P1 | F-11 |
| T-025 | Profil pengguna (Prajurit/Keluarga/Satuan) mengubah bobot | AG | P1 | F-12; skor berubah sesuai tabel |
| T-026 | Sensor manual (kotak/kuas) | AG | P1 | F-13 |
| T-027 | Editor kamus + impor/ekspor JSON | AG | P1 | F-14 |
| T-028 | Mode edukasi/kuis singkat | AG | P2 | F-15 |
| T-029 | AI Vision opsional BYOK (opt-in) | AG | P2 | F-16; dikerjakan hanya jika semua lain selesai |

### Sprint 5 — QA, Deploy, Aset (H11–H13)
| ID | Task | Owner | Prio | Acceptance |
|---|---|---|---|---|
| T-030 | Dataset uji sintetis ≥15 kasus + `expected.json` | PO+CX | P0 | Lihat 05_QA |
| T-031 | QA penuh sesuai `05_QA_TEST_PLAN.md`, daftar bug diprioritaskan | CX | P0 | Tidak ada bug Critical/High terbuka |
| T-032 | Perbaikan bug + polish UI/UX (loading, error, empty state) | AG | P0 | — |
| T-033 | Deploy publik + verifikasi CSP + uji dari perangkat lain | PO+AG | P0 | URL publik stabil |
| T-034 | README lengkap + arsip ZIP `dist/` | AG | P0 | README ada panduan jalan 3 langkah |
| T-035 | Aset submission: thumbnail, 5 screenshot, video, slide | PO+PM | P0 | Lihat `06_DEMO_SUBMISSION.md` |
| T-036 | Submit di platform + verifikasi ulang tautan | PO | P0 | Konfirmasi tersimpan |

## Dependensi Kritis
T-002 → semua · T-006/T-008 → T-009 · T-010 → T-012/T-013 → T-016/T-018 · T-017 → T-019 · P0 selesai (T-022) → P1.

## Aturan Perubahan Scope
1. Penambahan fitur harus melalui PO dan dicatat di Decision Log.
2. Feature freeze: **11 Nov**. Setelah itu hanya bugfix, QA, dan aset.
3. Bila ragu P1 sempat atau tidak, utamakan F-11 (Pola Hidup) dan F-12, buang sisanya.
