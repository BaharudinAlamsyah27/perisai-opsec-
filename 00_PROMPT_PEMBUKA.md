# PROMPT PEMBUKA (tempel ke Antigravity / Codex di awal sesi pertama)

> Cara pakai: salin isi blok di bawah apa pun yang Anda pakai. Letakkan `AGENTS.md` di root repo dan folder `docs/` di dalam repo sebelum memulai.

---

```
Kamu adalah engineer senior yang bergabung di proyek "PERISAI OPSEC" untuk kompetisi
Kartika Cyber Hackathon 2026 (kategori: Penangkalan). Deadline submission 15 November 2026
23:59 WIB, target selesai internal 13 November. Saya (product owner) bekerja sendirian dan
menggunakan beberapa AI agent bergantian, jadi dokumentasi dan progress adalah satu-satunya
memori bersama kita.

LANGKAH WAJIB SEBELUM MENULIS KODE:
1. Baca berurutan: AGENTS.md, docs/01_PRD.md, docs/02_ARSITEKTUR.md, docs/03_RENCANA_KERJA.md,
   docs/04_PROGRESS.md, docs/05_QA_TEST_PLAN.md.
2. Ringkas pemahamanmu dalam maksimal 10 baris: apa yang dibangun, batasan utama (privasi,
   client-side only, scope P0), dan task yang akan kamu kerjakan di sesi ini.
3. Sebutkan asumsi atau pertanyaan yang memblokir. Jika tidak ada, lanjut kerja.

ATURAN KERJA:
- Kerjakan task sesuai urutan di docs/03_RENCANA_KERJA.md. Jangan loncat ke P1/P2 sebelum
  semua P0 hijau (lulus build + test).
- Seluruh pemrosesan file pengguna terjadi di browser. DILARANG mengirim foto, teks, atau hasil
  analisis ke server/API mana pun secara default. Tidak ada analytics/tracking.
- Mesin analisis inti harus deterministik (tanpa AI). AI hanya fitur opsional, opt-in.
- Jangan menambah dependency di luar daftar di docs/02_ARSITEKTUR.md tanpa menulis alasan dan
  lisensinya di docs/04_PROGRESS.md (Decision Log).
- Antarmuka berbahasa Indonesia. Kode, nama variabel, dan komentar berbahasa Inggris.
- Gunakan hanya data uji sintetis atau foto milik sendiri. Jangan pernah memakai data personel nyata.
- Setiap akhir sesi: jalankan `npm run build` dan `npm test`, update docs/04_PROGRESS.md
  (status task, log sesi, keputusan, blocker), lalu commit dengan format Conventional Commits.

OUTPUT SESI INI: kerjakan Sprint 0 + task T-001 sampai T-006 (scaffold, tooling, CI lokal,
halaman kerangka, pemuat file, pembaca EXIF). Setelah selesai, laporkan: apa yang jadi,
bagaimana memverifikasinya, apa yang belum, dan task berikutnya.
```

---

## Pembagian peran agent (saran)

| Agent | Peran utama | Contoh tugas |
|---|---|---|
| **Antigravity** | Builder fitur & UI | Scaffold, komponen React, alur upload, peta, halaman laporan |
| **Codex** | Engine, test, review | Rule engine teks, scoring, unit test, review kode, perbaikan bug, hardening |
| **Anda (PO)** | Keputusan & verifikasi | Uji manual, pilih prioritas, rekam video, submit |
| **Claude (PM)** | Perencana | Revisi dokumen, risk review, naskah demo/slide |

**Aturan serah-terima:** satu agent mengerjakan satu task sampai selesai dan tercatat di `04_PROGRESS.md` sebelum agent lain mengambil alih. Hindari dua agent mengubah file yang sama di waktu bersamaan (pakai branch terpisah per task: `feat/T-014-text-rules`).

## Prompt singkat untuk sesi berikutnya

```
Lanjutkan proyek PERISAI OPSEC. Baca AGENTS.md dan docs/04_PROGRESS.md terlebih dahulu,
ambil task "Berikutnya" di daftar, kerjakan sampai selesai sesuai Definition of Done di
AGENTS.md, lalu update docs/04_PROGRESS.md. Laporkan ringkas di akhir.
```

## Prompt review (untuk Codex setelah Antigravity selesai satu fase)

```
Lakukan code review untuk perubahan terbaru pada proyek PERISAI OPSEC. Periksa: (1) apakah ada
panggilan jaringan yang mengirim data pengguna, (2) kebenaran logika scoring terhadap
docs/01_PRD.md bagian Spesifikasi Scoring, (3) cakupan test, (4) bug dan edge case (file besar,
EXIF rusak, foto tanpa EXIF, HEIC), (5) aksesibilitas dasar. Beri daftar temuan berprioritas
dan perbaiki yang kritis.
```
