# 01 — PRD: PERISAI OPSEC

**Versi:** 1.0 · **Tanggal:** 2 Nov 2026 · **PO:** (peserta tunggal) · **Kategori:** Penangkalan

## 1. Latar Belakang
Prajurit, keluarga, dan satuan aktif di media sosial. Satu foto dapat membocorkan lokasi lewat metadata GPS, nama satuan lewat teks di latar, atau jadwal penugasan lewat keterangan. Kebocoran semacam ini nyata dan sulit dikenali manusia saat terburu-buru. Belum ada alat sederhana, offline, dan sadar konteks militer Indonesia yang bisa dipakai prajurit sebelum menekan tombol "unggah".

## 2. Visi
> "Periksa sebelum unggah." Satu alat, tanpa instalasi, tanpa server, yang mengubah foto dan teks berisiko menjadi versi aman dengan penjelasan yang dipahami orang awam.

## 3. Pengguna
| Persona | Kebutuhan |
|---|---|
| **Prajurit** | Cek cepat foto/teks sebelum posting; paham alasan risikonya |
| **Keluarga prajurit** | Tidak sengaja membocorkan jadwal, lokasi rumah dinas, atau penugasan |
| **Pembina satuan / Pamsiber** | Bahan edukasi dan standar pemeriksaan satuan |

## 4. Tujuan & Non-Tujuan
**Tujuan:** deteksi kebocoran OPSEC multi-sumber, skor risiko transparan, versi aman, laporan, mode edukasi, privasi total.
**Non-tujuan:** tidak mengambil data dari media sosial, tidak melacak individu, tidak menyimpan data di server, tidak ada IoT, tidak ada fitur ofensif.

## 5. Ruang Lingkup Fitur

### P0 — Wajib (MVP, harus selesai tanpa kompromi)
| ID | Fitur | Acceptance Criteria |
|---|---|---|
| F-01 | Unggah foto (drag-drop, multi-file, JPG/PNG/WebP/HEIC bila didukung) | File diproses lokal; error ramah untuk format tak didukung; batas 25 MB/file |
| F-02 | Analisis metadata EXIF | Menampilkan GPS (koordinat di peta), waktu, perangkat, serial, pembuat; tiap temuan punya severity |
| F-03 | OCR teks pada foto (ind+eng) | Mengekstrak teks + bounding box; berjalan di worker; indikator progres |
| F-04 | Mesin aturan OPSEC (teks OCR + keterangan) | Mendeteksi kategori: satuan, lokasi, jadwal, pergerakan, identitas (NRP/NIK/HP), klasifikasi dokumen, kendaraan; berbasis kamus JSON |
| F-05 | Skor risiko 0–100 + level | Sesuai spesifikasi scoring §7; setiap temuan punya bukti, alasan, rekomendasi |
| F-06 | Versi aman | Hapus semua metadata (re-encode via canvas) + sensor otomatis area teks sensitif (blur/blok hitam); pratinjau sebelum/sesudah; unduh |
| F-07 | Analisis teks keterangan (caption) | Tempel teks, temuan di-highlight di dalam teks, saran penulisan ulang aman berbasis template |
| F-08 | Laporan risiko | Halaman ringkasan + ekspor cetak/PDF (via print CSS) |
| F-09 | Bukti privasi | Halaman "Privasi" + banner "diproses di perangkat Anda"; CSP ketat |
| F-10 | Hosting publik + halaman Tentang/Kredit lisensi | Link dapat diakses juri tanpa login |

### P1 — Pembeda (kerjakan setelah semua P0 hijau)
| ID | Fitur | Nilai |
|---|---|---|
| F-11 | **Rekonstruksi Pola Hidup** — unggah beberapa foto, sistem menyusun linimasa + peta yang menunjukkan rutinitas/lokasi berulang (rumah, kantor, jalur) | Ini fitur "wow": menunjukkan bahwa kumpulan postingan aman satuan bisa membocorkan pola |
| F-12 | **Profil Pengguna** (Prajurit / Keluarga / Satuan) dengan bobot skor berbeda | Kesesuaian konteks militer |
| F-13 | Sensor manual (kuas blur / kotak) di atas hasil sensor otomatis | Kontrol pengguna |
| F-14 | Editor kamus (tambah istilah satuan/lokasi sensitif, impor/ekspor JSON) | Kelayakan implementasi per satuan |
| F-15 | Mode Edukasi/Kuis singkat berbasis temuan nyata | Nilai pembinaan |

### P2 — Opsional (hanya jika waktu sisa, jangan korbankan QA)
| ID | Fitur |
|---|---|
| F-16 | AI Vision opsional (BYOK Gemini free tier, opt-in, peringatan privasi jelas) untuk mengenali landmark/dokumen di foto |
| F-17 | PWA (instal & offline penuh) |
| F-18 | Deteksi QR/barcode (BarcodeDetector API bila ada) |
| F-19 | Deteksi wajah → blur (FaceDetector API bila ada) |
| F-20 | Mode gelap/terang, dukungan English |

## 6. Cerita Pengguna Inti
1. *Sebagai prajurit,* saya menyeret foto selfie di pos jaga dan melihat bahwa foto itu menyimpan koordinat tepat pos, nama satuan terbaca di papan, dan jam pengambilan, sehingga saya paham kenapa tidak boleh diposting apa adanya.
2. *Sebagai istri prajurit,* saya menempel caption "Besok Ayah berangkat ke perbatasan jam 05.00 😢" dan sistem menandai pola pergerakan + jadwal serta menyarankan versi aman.
3. *Sebagai pembina satuan,* saya mengunggah 6 foto kegiatan satu minggu dan melihat bahwa kombinasinya menggambarkan rutinitas patroli.

## 7. Spesifikasi Scoring (deterministik)
**Temuan (Finding):** `{ id, ruleId, category, severity, evidence, reason, recommendation, source(metadata|ocr|caption), bbox? }`

**Severity → probabilitas kebocoran dasar `p`:** critical 0.60 · high 0.40 · medium 0.20 · low 0.08 · info 0

**Rumus skor (noisy-OR):** `skor = 100 × (1 − Π(1 − p_i × m_i))` dengan `m_i` = pengali profil untuk kategori temuan i. Dibatasi 0–100, dibulatkan.

**Level:** 0–24 **Aman** · 25–49 **Waspada** · 50–74 **Tinggi** · 75–100 **Kritis**

**Pengali profil `m`:**
| Kategori | Prajurit | Keluarga | Satuan |
|---|---|---|---|
| Lokasi | 1.0 | 1.1 | 1.3 |
| Identitas | 1.2 | 1.0 | 1.0 |
| Operasional (jadwal/pergerakan/satuan) | 1.2 | 1.3 | 1.2 |
| Perangkat/Teknis | 1.0 | 1.0 | 1.0 |

**Boost kombinasi (co-occurrence):** bila dalam satu analisis muncul ≥3 dari kategori {satuan, lokasi, waktu/jadwal, pergerakan}, tambahkan temuan sintetis "Pola Penugasan Terbaca" severity **critical**.

## 8. Katalog Aturan Awal (kamus di `src/data/`)
**Metadata:** GPS ada (critical) · arah/ketinggian GPS (medium) · waktu pengambilan (medium) · merek/model perangkat (low) · nomor seri perangkat/lensa (medium) · nama pembuat/hak cipta (medium) · thumbnail tertanam (low) · software pengolah (info).
**OCR/Caption — Operasional:** nama satuan/kesatuan (Kodam, Kodim, Koramil, Korem, Yonif, Yonkav, Yonarmed, Brigif, Kostrad, Kopassus, Kodiklat, dll) high · istilah fasilitas (markas, mako, pos, asrama, rumah dinas, perbatasan) high · pergerakan (berangkat, tiba, menuju, geser, BKO, penugasan, satgas, operasi, latihan) medium · jadwal (tanggal, jam, hari + "besok/lusa/minggu depan") medium · jumlah personel/alutsista (ranpur, kendaraan, "N personel") high · klasifikasi dokumen (RAHASIA, TERBATAS, SANGAT RAHASIA, KONFIDENSIAL) critical.
**Identitas:** NIK 16 digit (high) · NRP 8–10 digit berlabel "NRP" (high) · nomor HP +62/08 (medium) · plat nomor kendaraan (medium) · alamat (Jl., Jalan, Desa, Kec., RT/RW) (medium) · pita nama seragam (heuristik: teks kapital pendek di area dada, medium).
**Real-time:** "sekarang di", "live", "lagi di" + lokasi (medium) · tag lokasi/check-in (medium).

## 9. Persyaratan Non-Fungsional
- **Privasi:** zero-upload; CSP `connect-src 'none'` (kecuali fitur AI opt-in yang mengubah kebijakan secara eksplisit di build terpisah/flag). **Peta bersifat opt-in**; tile OSM hanya dimuat setelah persetujuan eksplisit pengguna karena permintaan tile dapat mengungkap area kasar lokasi foto ke server OSM.
- **Kinerja:** foto 12 MP dianalisis < 15 detik di laptop menengah; UI tidak membeku (worker).
- **Kompatibilitas:** Chrome/Edge/Firefox terbaru; mobile Chrome/Safari layak pakai.
- **Aksesibilitas:** navigasi keyboard, kontras AA, label ARIA dasar.
- **Offline:** setelah dimuat, fitur inti bekerja tanpa internet (kecuali tile peta).
- **Lisensi:** semua dependency bersertifikasi open-source; atribusi di halaman Kredit.

## 10. Pemetaan ke Kriteria Penilaian Juri
| Kriteria (bobot) | Bagaimana kita menjawab |
|---|---|
| Relevansi & Manfaat (25%) | Masalah OPSEC prajurit nyata; profil Prajurit/Keluarga/Satuan; kamus istilah TNI AD |
| Inovasi Teknis (25%) | Privasi di browser, skor transparan, Rekonstruksi Pola Hidup, boost kombinasi |
| Fungsionalitas (25%) | Inti tanpa AI/tanpa server → demo hampir pasti berjalan; demo live link |
| Kelayakan Implementasi (15%) | Hosting statis, tanpa instalasi, kamus bisa disesuaikan per satuan |
| Dokumentasi (10%) | README, arsitektur, video ≤10 mnt, slide, halaman Tentang |

## 11. Metrik Keberhasilan (internal)
- 100% fitur P0 lulus acceptance criteria sebelum 11 Nov
- Dataset uji sintetis ≥ 15 kasus, deteksi benar ≥ 90% pada kasus yang dirancang
- 0 panggilan jaringan membawa data pengguna (diverifikasi di DevTools)
- Video demo selesai ≤ 8 menit, submission terkirim paling lambat 14 Nov
