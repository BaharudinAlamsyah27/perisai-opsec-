# PERISAI OPSEC

**Periksa sebelum unggah.** PERISAI OPSEC adalah aplikasi web statis untuk membantu memeriksa potensi kebocoran informasi operasional dari foto dan caption sebelum dibagikan. Proyek ini dibuat untuk Kartika Cyber Hackathon 2026, kategori Penangkalan.

## Fitur

- Baca metadata foto: GPS, waktu menurut perangkat, perangkat, dan metadata lain yang tersedia.
- OCR bahasa Indonesia dan Inggris untuk mendeteksi teks di dalam gambar, termasuk kotak bukti (bbox).
- Analisis caption, kamus aturan OPSEC, Daftar Informasi Kritis (DIK) satuan, dan temuan kombinasi pola.
- Skor risiko transparan, profil penilaian, brief intelijen otomatis, laporan cetak, dan versi foto aman.
- Rekonstruksi pola hidup dari GPS dan waktu beberapa foto.
- Foto contoh fiktif untuk demonstrasi tanpa perlu menyiapkan dataset sendiri.

## Menjalankan secara lokal (3 langkah)

1. Pasang Node.js LTS, lalu jalankan `npm install` dari root proyek.
2. Jalankan `npm run dev`.
3. Buka URL lokal yang ditampilkan Vite (biasanya `http://localhost:5173`).

Periksa sebelum rilis dengan `npm test`, `npm run lint`, dan `npm run build`. Untuk memeriksa hasil produksi secara lokal, jalankan `npm run preview` setelah build.

## Arsitektur singkat

Aplikasi adalah SPA React + TypeScript yang dibangun Vite. Zustand menyimpan sesi di memori browser. Fungsi murni di `src/engine/` membaca EXIF, menjalankan OCR berbasis Tesseract.js Web Worker dan WASM, mencocokkan kamus, memberi skor deterministik, dan menyusun pola. Canvas membuat versi foto aman dan menghapus metadata saat encode ulang. Tidak ada backend aplikasi.

## Privasi

- Foto, caption, OCR, DIK, dan analisis berjalan di browser. Data pengguna tidak dikirim ke server aplikasi.
- Aset aplikasi, worker, WASM, traineddata OCR, dan foto contoh disajikan sebagai file statis lokal.
- Peta OpenStreetMap opsional; tile hanya diminta setelah pengguna menekan kontrol persetujuan. Permintaan tile dapat mengungkap area peta yang dilihat.
- DIK default hanya disimpan di memori sesi. Opsi penyimpanan perangkat menggunakan localStorage dan harus diaktifkan secara eksplisit.
- Semua foto contoh di `public/samples/` dibuat sintetis. Nama, kode, tulisan, GPS, dan waktu di dalamnya fiktif.

## Batasan

- OCR tidak sempurna; tulisan kecil, buram, miring, tertutup, atau bahasa yang tidak didukung dapat terlewat atau salah dibaca. Periksa hasil sebelum mengambil keputusan.
- HEIC/HEIF belum didukung; konversikan salinan ke JPG atau PNG terlebih dahulu.
- Temuan berbasis kamus bergantung pada istilah yang dikonfigurasi dan bukan pengganti pemeriksaan manusia.
- Versi aman hanya menyensor area teks yang berhasil dideteksi; periksa pratinjau dan hasil unduhan.
- Tile OSM memerlukan internet dan persetujuan. Analisis metadata dan OCR tidak memerlukan layanan peta.

## Foto contoh

Pada halaman Analisis, pilih **Coba foto contoh** untuk memuat lima gambar sintetis: foto bersih, GPS saja, papan satuan/NRP fiktif, dokumen bertanda RAHASIA fiktif, dan plat contoh yang sah. Pada halaman Pola Hidup, pilih **Muat contoh pola hidup** untuk memuat delapan foto metadata sintetis. Keseluruhan 13 JPG berukuran kurang dari 2 MB.

## Kredit dan lisensi

Daftar dependency dan lisensinya dibuat dari `package.json` dan `node_modules` dengan `npm run licenses`, lalu ditampilkan pada halaman Tentang. Aset traineddata Tesseract menyertakan bahasa Indonesia dan Inggris dan dilisensikan Apache-2.0. Peta menggunakan OpenStreetMap (ODbL) hanya saat opt-in.

Proyek dikembangkan dengan bantuan AI coding assistant (Antigravity dan Codex); kode dan aturan keamanan diverifikasi serta diuji.

## Deploy statis

Konfigurasi header keamanan dan fallback SPA tersedia pada `netlify.toml` dan `vercel.json`.

### Netlify

1. Hubungkan repository Git ke Netlify dan pilih build command `npm run build`.
2. Isi publish directory `dist`.
3. Deploy; pastikan header `Content-Security-Policy` muncul pada dokumen utama dan file aset dapat diakses di `/samples/` serta `/tessdata/`.

### Vercel

1. Impor repository ke Vercel dan pilih framework Vite (build command `npm run build`, output `dist`).
2. Deploy dengan `vercel.json` di root repository.
3. Verifikasi header CSP dan fallback URL SPA pada hasil deploy.

Sebelum publikasi, jalankan `npm test`, `npm run lint`, `npm run build`, dan periksa aplikasi pada URL preview produksi. Jangan mengaktifkan peta saat demonstrasi privasi penuh.

## Dokumentasi

Lihat `docs/01_PRD.md`, `docs/02_ARSITEKTUR.md`, `docs/03_RENCANA_KERJA.md`, `docs/04_PROGRESS.md`, `docs/05_QA_TEST_PLAN.md`, dan `docs/06_DEMO_SUBMISSION.md`.
