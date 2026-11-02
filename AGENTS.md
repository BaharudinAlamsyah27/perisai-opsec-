# AGENTS.md — Aturan Proyek PERISAI OPSEC

Berlaku untuk semua AI agent (Antigravity, Codex, dll). Baca penuh sebelum bekerja.

## 1. Ringkasan
PERISAI OPSEC adalah aplikasi web statis, berjalan 100% di browser, yang menganalisis foto dan teks
sebelum diunggah ke media sosial untuk menemukan kebocoran informasi operasional (OPSEC),
memberi skor risiko, dan menghasilkan versi aman. Kategori hackathon: **Penangkalan**.

## 2. Prinsip yang tidak boleh dilanggar
1. **Zero-upload:** data pengguna tidak boleh keluar dari browser. Tidak ada `fetch`/XHR/WebSocket yang membawa data pengguna. Tidak ada analytics, font CDN, atau skrip pihak ketiga saat runtime (semua aset di-bundle). Pengecualian tunggal: tile peta (permintaan gambar, tanpa data pengguna) dan fitur AI opsional yang opt-in.
2. **Inti deterministik:** skor dan temuan harus bisa direproduksi tanpa AI. Input sama menghasilkan output sama.
3. **Disiplin scope:** P0 dulu, lalu P1, lalu P2. Jangan menambah fitur di luar PRD tanpa persetujuan PO.
4. **Penjelasan:** setiap temuan wajib punya bukti (evidence), alasan, dan rekomendasi tindakan. Skor tanpa penjelasan dianggap bug.
5. **Data uji:** hanya sintetis atau milik sendiri. Dilarang data personel nyata.
6. **Bukan alat ofensif:** jangan menambah fitur pengintaian, scraping, atau pelacakan individu.

## 3. Stack (terkunci)
Vite + React 18 + TypeScript (strict) + Tailwind CSS · exifr · tesseract.js (bahasa `ind`+`eng`, dihosting lokal) · Leaflet (+ tile OSM) · Zustand · Vitest + Testing Library · Playwright (smoke, opsional) · ESLint + Prettier.
Detail ada di `docs/02_ARSITEKTUR.md`.

## 4. Perintah
```
npm install
npm run dev        # dev server
npm run build      # build produksi (harus lulus)
npm test           # unit test (harus lulus)
npm run lint
```

## 5. Konvensi kode
- TypeScript strict, tanpa `any` kecuali dikomentari alasannya.
- Logika analisis ada di `src/engine/` sebagai fungsi murni, tanpa import React.
- Kamus/aturan ada di `src/data/*.json`, bukan di-hardcode dalam kode.
- Komponen UI kecil, satu tanggung jawab. UI berbahasa Indonesia. Kontras dan fokus keyboard dijaga.
- Pekerjaan berat (OCR, resize gambar besar) berjalan di Web Worker agar UI tidak membeku.
- Commit: Conventional Commits (`feat:`, `fix:`, `test:`, `docs:`, `chore:`), merujuk ID task, mis. `feat(T-012): add text rule engine`.

## 6. Definition of Done (per task)
- [ ] Memenuhi acceptance criteria di PRD/rencana kerja
- [ ] `npm run build` dan `npm test` lulus, lint bersih
- [ ] Test baru untuk logika baru (engine wajib)
- [ ] Tidak ada panggilan jaringan baru yang membawa data pengguna
- [ ] `docs/04_PROGRESS.md` diperbarui (status, log sesi, keputusan, blocker)
- [ ] Commit dengan pesan jelas

## 7. Saat ragu
Pilih opsi paling sederhana yang menjaga prinsip di bagian 2. Tulis keraguan sebagai pertanyaan di `04_PROGRESS.md` bagian "Pertanyaan untuk PO" dan lanjut ke task lain yang tidak terblokir.
