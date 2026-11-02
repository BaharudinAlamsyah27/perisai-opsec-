# 05 — QA & Test Plan

## 1. Strategi
Prioritas pengujian mengikuti bobot juri: **Fungsionalitas (25%)** harus mulus saat demo. Uji yang paling penting: alur utama tidak pernah error, privasi terbukti, dan hasil deteksi benar pada dataset sintetis.

## 2. Dataset Uji Sintetis (T-030)
**Aturan:** semua gambar dibuat sendiri (foto milik sendiri, atau gambar teks buatan). Nama, satuan, NRP, nomor HP, plat adalah **fiktif**. Jangan pakai lokasi/orang nyata yang sensitif; gunakan koordinat tempat umum (mis. taman/kampus Anda).

Cara membuat metadata palsu dengan `exiftool` (offline):
```
exiftool -GPSLatitude=-7.5561 -GPSLatitudeRef=S -GPSLongitude=110.8316 -GPSLongitudeRef=E \
  -DateTimeOriginal="2026:11:03 05:12:00" -Make="Contoh" -Model="Fon-X" \
  -SerialNumber="SN-FIKTIF-001" foto01.jpg
```
Cara membuat gambar bertulis: buat poster/papan tulisan dengan editor gambar atau canvas (mis. "POS JAGA YONIF 999 — NRP 12345678"), foto layar atau ekspor langsung.

| # | Kasus | Isi | Harapan |
|---|---|---|---|
| 1 | Foto bersih | Tanpa EXIF, tanpa teks | Skor Aman (0–24) |
| 2 | GPS saja | EXIF GPS | Temuan GPS critical; skor ≥ 60 |
| 3 | Waktu + perangkat | EXIF tanpa GPS | Skor Waspada |
| 4 | Papan satuan | Teks "KODIM 9999" | Temuan satuan high + bbox |
| 5 | NRP & NIK fiktif | Angka berlabel | Temuan identitas high |
| 6 | Nomor HP | +62812xxxx | Medium |
| 7 | Plat nomor fiktif | "B 1234 XYZ" | Medium |
| 8 | Dokumen berlabel | "RAHASIA" | critical |
| 9 | Caption jadwal | "Besok jam 05.00 berangkat" | jadwal + pergerakan |
| 10 | Caption penugasan lengkap | satuan + lokasi + jadwal + pergerakan | Combo "Pola Penugasan Terbaca" critical |
| 11 | Caption aman | "Selamat pagi, semangat!" | Aman |
| 12 | Huruf campur/singkatan | "kodim", "Yon-if", "Koramil" | Terdeteksi (normalisasi) |
| 13 | False positive | "Kodim" dalam konteks edukasi umum? tidak ada | Tidak berlebihan; dicatat |
| 14 | Foto 12 MP | Besar | Selesai < 15 dtk, UI responsif |
| 15 | File rusak / bukan gambar | .txt diganti .jpg | Pesan error ramah, app tidak crash |
| 16 | Multi-foto 8 file | Titik GPS berulang | Pola Hidup menemukan lokasi berulang |

Simpan semua di `tests/fixtures/` dengan `expected.json` (temuan wajib & rentang skor).

## 3. Unit Test (CX)
- `scoring`: nilai tepat untuk kombinasi severity (mis. 1 critical = 60, critical+high = 100×(1−0.4×0.6)=76 pada pengali 1.0), batas 0–100, level, pengali profil.
- `rules`: tiap aturan punya ≥1 kasus positif dan ≥1 negatif; normalisasi.
- `combos`: tepat 3 kategori memicu; 2 tidak memicu.
- `metadata`: parser GPS (hemisfer S/W bernilai negatif).
- `sanitize`: hasil ekspor tidak memiliki EXIF (exifr mengembalikan kosong).
- `pattern`: pengelompokan jarak (radius dapat diatur), jam berulang.

## 4. Uji Fungsional Manual (PO) — Checklist P0
- [ ] Seret 1 foto → hasil muncul tanpa error
- [ ] Seret banyak foto → antrean berjalan, tiap foto punya hasil sendiri
- [ ] GPS tampil di peta; offline tampil koordinat
- [ ] OCR menunjukkan progres; hasil teks dapat dilihat
- [ ] Temuan punya alasan + rekomendasi; hover menyorot area foto
- [ ] Caption: highlight inline + saran penulisan aman
- [ ] Versi aman: unduh, buka di perangkat lain, cek metadata kosong (exiftool atau situs-cek lokal)
- [ ] Skor setelah sanitasi < skor sebelum
- [ ] Laporan dapat dicetak ke PDF dan terbaca rapi
- [ ] Halaman Privasi, Tentang, Kredit tersedia
- [ ] Tombol "Hapus data sesi" bekerja

## 5. Uji Privasi (kritis)
1. Buka DevTools → Network → Preserve log.
2. Muat app, unggah 3 foto, jalankan analisis, buat versi aman.
3. **Harapan:** tidak ada request berisi data pengguna; hanya aset statis dan (opsional) tile peta.
4. Matikan internet setelah muat: analisis tetap berjalan (kecuali tile).
5. Periksa header CSP di tab Response pada situs yang sudah deploy.
Tangkap screenshot sebagai bukti untuk slide & video.

## 6. Uji Kompatibilitas & Kinerja
| Lingkungan | Status |
|---|---|
| Chrome desktop | ⬜ |
| Edge | ⬜ |
| Firefox | ⬜ |
| Chrome Android | ⬜ |
| Safari iOS (HEIC) | ⬜ |
Kinerja: foto 12 MP < 15 dtk; 8 foto beruntun tanpa kehabisan memori; UI tetap responsif.

## 7. Klasifikasi Bug
- **Critical:** crash, kebocoran data, hasil salah pada alur demo → wajib diperbaiki sebelum lanjut
- **High:** fitur P0 tidak berfungsi sebagian
- **Medium:** UI/teks salah, kasus tepi
- **Low:** kosmetik

**Kriteria rilis:** 0 Critical/High terbuka; semua checklist P0 lulus; dataset uji ≥ 90% sesuai harapan.

## 8. Template Laporan Bug
```
ID: B-001 | Severity: High | Ditemukan: [tanggal, oleh]
Langkah: 1) ... 2) ...
Harapan: ...  Aktual: ...
Bukti: screenshot/log
Status: Terbuka/Diperbaiki (commit ...)
```
