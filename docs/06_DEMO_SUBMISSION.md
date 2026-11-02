# 06 — Demo, Aset & Submission

## 1. Daftar Kelengkapan Wajib (rulebook §G)
- [ ] **Link karya:** URL hosting publik tanpa login (+ ZIP cadangan jika perlu)
- [ ] **Thumbnail:** 1200×630 px, JPG/PNG/WebP, ≤ 500 KB
- [ ] **Screenshot:** maksimal 5 gambar
- [ ] **Video:** ≤ 10 menit, diunggah ke YouTube (set *Unlisted/Public*, cek bisa dibuka tanpa login)
- [ ] **Slide penjelasan:** fitur, arsitektur, teknologi, dampak

**Aturan penting yang harus dipatuhi:** karya buatan sendiri selama periode program; pihak ketiga dengan atribusi (halaman Kredit); hanya submission terakhir dinilai; tidak ada data pribadi pihak ketiga; tidak ada malware aktif. Deklarasikan penggunaan AI coding assistant dan library open source di halaman Tentang dan di slide.

## 2. Lima Screenshot yang Disarankan
1. Beranda + banner "Diproses di perangkat Anda"
2. Hasil analisis foto: skor Kritis, overlay bbox, daftar temuan
3. Peta GPS hasil ekstraksi metadata
4. Perbandingan sebelum/sesudah versi aman (skor turun)
5. Halaman Pola Hidup (peta multi-titik + linimasa)

## 3. Thumbnail
Latar gelap sober, judul "PERISAI OPSEC", subjudul "Periksa sebelum unggah", ikon perisai + mata + kunci, logo kategori "Penangkalan". Teks besar agar terbaca saat kecil.

## 4. Naskah Video (target 7–8 menit)
| Waktu | Segmen | Isi |
|---|---|---|
| 0:00–0:40 | Masalah | Cerita singkat: satu foto selfie di pos jaga → apa yang bisa dibaca pihak luar? Sebut contoh nyata kebocoran lokasi dari media sosial/aplikasi olahraga |
| 0:40–1:20 | Solusi | Perkenalan Perisai OPSEC: privasi di browser, tanpa server, skor transparan |
| 1:20–3:30 | Demo 1 | Unggah foto sintetis berEXIF + papan satuan: skor Kritis, peta, OCR, temuan, penjelasan |
| 3:30–4:30 | Demo 2 | Caption "Besok jam 05.00 berangkat ke pos perbatasan…" → highlight + Pola Penugasan Terbaca + saran aman |
| 4:30–5:30 | Versi aman | Sensor otomatis, unduh, perbandingan, skor turun, bukti EXIF kosong |
| 5:30–6:40 | Pola Hidup | Unggah 8 foto → rutinitas terbaca → "kesimpulan pihak luar" |
| 6:40–7:20 | Bukti privasi | DevTools Network: tidak ada unggahan; mode offline |
| 7:20–8:00 | Arsitektur & dampak | Stack singkat, kelayakan di satuan, kamus bisa disesuaikan, rencana lanjutan |

Tips rekam: resolusi 1080p, mic jernih, zoom pada bagian penting, teks ringkas di layar, tanpa musik berlebihan. Siapkan dua kali pengambilan.

## 5. Kerangka Slide (10–12 slide)
1. Judul + tagline + kategori
2. Masalah: kebocoran OPSEC di media sosial (kasus nyata, tanpa data personel)
3. Pengguna & kebutuhan
4. Solusi: alur "Periksa sebelum unggah"
5. Fitur utama (metadata, OCR, aturan, skor, versi aman)
6. Skor transparan (rumus noisy-OR + level)
7. Pembeda: Pola Hidup + boost kombinasi + profil
8. Arsitektur & stack (diagram)
9. Privasi & keamanan (CSP, zero-upload, bukti)
10. Hasil uji (dataset, akurasi, kinerja)
11. Kelayakan implementasi & peta jalan (PWA, kamus satuan, integrasi pelatihan Pamsiber)
12. Kredit lisensi & deklarasi AI + penutup

## 6. Rencana Presentasi Final (jika lolos 10 besar, 24 Nov, 10 menit)
- 1 mnt masalah · 1 mnt solusi · 4 mnt demo live (cadangkan rekaman bila jaringan buruk) · 1,5 mnt arsitektur & privasi · 1 mnt dampak/kelayakan · 1,5 mnt tanya jawab.
- Siapkan **demo offline di laptop** (build lokal) dan file uji siap pakai.

**Antisipasi pertanyaan juri:**
- *Kenapa tidak pakai AI penuh?* → Keandalan, privasi, tanpa biaya, bisa dijalankan di jaringan tertutup; AI opsional untuk perluasan.
- *Bagaimana akurasi OCR/aturan?* → Tampilkan hasil dataset uji dan batasannya secara jujur; pengguna dapat mengedit teks OCR dan kamus.
- *Bagaimana penerapan di satuan?* → Hosting statis di intranet, kamus kustom per satuan, tanpa instalasi.
- *Risiko salah deteksi?* → Alat bantu keputusan, bukan pengganti kebijakan; selalu ada penjelasan.
- *Bagaimana pengembangan lanjutan?* → PWA, integrasi pelatihan, deteksi wajah/QR, analitik agregat anonim opsional di jaringan internal.

## 7. Checklist Hari Submit (14 Nov)
- [ ] Buka URL publik dari HP (data seluler) dan laptop lain
- [ ] Jalankan satu alur demo penuh di URL publik
- [ ] Video YouTube bisa diputar dari akun lain/incognito
- [ ] Thumbnail, 5 screenshot, slide terunggah, ukuran sesuai
- [ ] Deskripsi karya sesuai versi final; kategori **Penangkalan**
- [ ] Tekan submit; simpan screenshot konfirmasi
- [ ] Cek ulang tampilan submission di platform
- [ ] Jangan ubah apa pun di URL publik sampai penjurian selesai kecuali perbaikan darurat

## 8. Kata Kunci Deskripsi Karya (siap pakai untuk formulir)
**Nama Karya:** Perisai OPSEC
**Deskripsi singkat:** Aplikasi web pemeriksa kebocoran informasi operasional (OPSEC) sebelum unggah ke media sosial. Menganalisis metadata foto, teks di dalam foto (OCR), dan keterangan unggahan menggunakan kamus konteks TNI AD, memberi skor risiko transparan, lalu menghasilkan versi aman. Seluruh pemrosesan berlangsung di browser tanpa mengirim data ke server. Fitur Rekonstruksi Pola Hidup menunjukkan bagaimana kumpulan unggahan dapat membocorkan rutinitas.
