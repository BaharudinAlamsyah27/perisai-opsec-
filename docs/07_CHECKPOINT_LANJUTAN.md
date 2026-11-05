# 07 — Spesifikasi Checkpoint Lanjutan (sumber kebenaran untuk semua agent)

Dokumen ini melengkapi `03_RENCANA_KERJA.md`. Jika bertentangan, dokumen ini yang berlaku.
Status tiap checkpoint dicatat di `04_PROGRESS.md`. Jangan percaya klaim "selesai" tanpa memeriksa kodenya.

## Urutan dan prioritas
K -> K-diagnosa -> P1-P4 -> Q -> **L** -> **M** -> **N** -> **P5** -> **O**
Jika waktu mepet, potong dengan urutan ini: N (DIK) -> P5 (deteksi wajah) -> sebagian M (versi sederhana).
TIDAK BOLEH dikorbankan: Versi Aman, QA, deploy, tombol "Coba foto contoh", README.
Dibatalkan total: AI vision cloud, mode edukasi, PWA, pengenalan seragam/senjata.

## Aturan umum
- Setiap checkpoint: test, lint, build lulus; commit per butir; update 04_PROGRESS.md (status, "Posisi terakhir", "Berikutnya").
- Jika commit gagal karena izin sistem: JANGAN menghindarinya. Catat di Blocker dan lanjut; PO commit manual.
- Jangan menyalin foto milik pihak lain ke repo. Data uji hanya dataset sintetis di tests/fixtures.
- Zero-upload tetap berlaku. Dependency baru wajib dicatat di Decision Log (nama, versi, lisensi, ukuran).

## Ringkasan checkpoint yang sudah diminta sebelumnya (verifikasi statusnya di kode)
- K: Versi Aman tuntas (skor sebelum -> sesudah, checklist bukti, analisis ulang hasil sanitasi), polesan layout, uji dataset sintetis 01-10 dengan tabel hasil.
- K-diagnosa (D1-D6): panel "Teks terbaca" + keyakinan, panel cakupan pemeriksaan (bukan "AMAN" absolut), OCR multi-lintasan (skala, kontras, invert, PSM 11), kamus istilah militer, test teks.
- P1-P4: OCR teks bergaya, catatan "metadata hilang karena WhatsApp/sosmed" (bukan temuan), tips di zona unggah, penanda konteks militer bobot nol.
- Q: kata operasional publik (operasi, perbatasan, rawan konflik, satgas, patroli, dst) menjadi temuan ringan "periksa publikasi resmi", level "Perlu verifikasi publikasi", teks "Dirgahayu TNI" tetap nol.

## Checkpoint L — Brief Intelijen Lawan
Tujuan: ubah temuan teknis menjadi laporan naratif sudut pandang analis OSINT pihak lawan: "apa yang dapat disimpulkan pihak luar dari unggahan ini".
Aturan keras:
- Deterministik, tanpa AI, berbasis template: `src/engine/brief.ts` + `src/data/brief-templates.json`.
- Setiap kalimat kesimpulan WAJIB menautkan ID temuan sumber. Tanpa temuan pendukung, kalimat tidak ditulis. Dilarang mengarang fakta (spesifikasi perangkat, kerentanan tertentu). Bahasa konservatif ("dapat", "kemungkinan").
Struktur (urutan tetap):
1. Ringkasan satu kalimat + level + skor.
2. Kesimpulan pihak luar: SIAPA (satuan, identitas, perangkat), DI MANA (koordinat, ketinggian, arah bidik, nama lokasi dari teks), KAPAN (tanggal, hari dalam seminggu, jam menurut perangkat), APA (kegiatan/pergerakan), POLA (hasil combo). Tiap butir punya keyakinan: Tinggi (data langsung metadata/teks OCR keyakinan tinggi), Sedang (OCR keyakinan menengah), Rendah (inferensi).
3. Dampak potensial (maks 3 butir, template per kategori).
4. Langkah penanggulangan berprioritas (urut severity, dari rekomendasi temuan).
5. Keputusan disarankan: "Jangan unggah" / "Unggah setelah Versi Aman" / "Aman diunggah" berdasarkan level.
UI: tombol "Brief Intelijen" di panel Aksi Cepat (modal/tab), ikut tercetak di Laporan. Catatan bawah: "Brief ini disusun otomatis dari temuan; bukan penilaian intelijen resmi."
Test: Analysis tiruan (GPS saja; papan satuan+NRP; dokumen RAHASIA; foto bersih -> brief menyatakan tidak ada kebocoran bermakna; caption penugasan lengkap) + test bahwa tidak ada kalimat tanpa tautan sumber.

## Checkpoint M — Rekonstruksi Pola Hidup
Tujuan: dari beberapa foto (GPS + waktu EXIF) tunjukkan bahwa kumpulan unggahan "aman" pun membocorkan rutinitas. Fitur pembeda utama.
Engine `src/engine/pattern.ts` (fungsi murni):
- Input Analysis[] dengan exif.lat/lon/takenAt; foto tanpa GPS/waktu dikecualikan dan dihitung "tidak dapat dipetakan: N foto".
- Klaster lokasi: haversine, radius default 100 m (konfigurasi). Label netral "Lokasi 1, 2, 3" (boleh diganti pengguna, hanya di memori).
- Per klaster: jumlah foto, jumlah hari berbeda, median jam, rentang jam, hari pertama/terakhir.
- Rutinitas: klaster >=3 foto pada >=2 hari berbeda dengan jam dalam jendela +/-60 menit.
- Transisi: pasangan klaster berurutan di hari yang sama yang berulang (mis. A -> B pagi).
- Kesimpulan pihak luar: kalimat template konservatif, tiap kalimat menautkan klaster sumber; keyakinan Tinggi (>=3 hari), Sedang (2 hari), Rendah. Dilarang menebak fungsi tempat (rumah/kantor) secara pasti; pakai "titik berangkat pagi hari yang berulang", dst.
- Tingkat keterbacaan pola: Tinggi (>=2 rutinitas), Sedang (1), Rendah (0).
UI (PatternPage): tombol "Analisis pola dari sesi ini"; "Mode cepat (hanya metadata, tanpa OCR)"; visual SVG murni tanpa tile: sebar titik relatif, linimasa harian, heatmap hari x jam, kartu klaster, kartu kesimpulan dengan lencana keyakinan; peta OSM tetap opsional (opt-in). Tidak ada data palsu.
Test (meniru fixtures 11-18): 3 klaster (A: 4 foto/4 hari ~05.50; B: 3 foto/3 hari ~07.30; C: 1 foto), 2 rutinitas, transisi A->B 3 kali, keterbacaan Tinggi. Tambah test foto tanpa GPS dan klaster tunggal.

## Checkpoint N — Daftar Informasi Kritis (DIK) Satuan
Tujuan: tiap satuan menentukan informasi kritisnya sendiri; mesin aturan ikut mendeteksinya.
- Entri: { id, term, kind: satuan|lokasi|kegiatan|personel|kode, severity (default high), catatan }.
- Pencocokan ternormalisasi (huruf, spasi, tanda hubung, batas kata), terintegrasi ke rules.ts sebagai kamus tambahan; ruleId "dik-*"; kategori: satuan/kegiatan -> operasional, lokasi -> lokasi, personel/kode -> identitas; ikut combo-groups.
- UI (tab "Daftar Kritis" sudah ada di header): tambah/ubah/hapus, impor/ekspor JSON, "Muat contoh" (data FIKTIF), "Hapus semua".
- Privasi: default hanya di memori sesi; opsi "Simpan di perangkat ini" (localStorage) dengan peringatan bahwa daftar bisa sensitif; anjurkan ekspor/impor file.
- Temuan DIK berlabel "Dari Daftar Informasi Kritis".
Test: pencocokan, normalisasi, kategori, integrasi skor, impor JSON tidak valid (error ramah).

## Checkpoint P5 — Deteksi wajah ML di perangkat (batasi waktu)
- MediaPipe Tasks Vision FaceDetector (BlazeFace short-range). Verifikasi lisensi (Apache-2.0), ukuran WASM + model; bundel LOKAL di public/. Dilarang CDN/storage eksternal saat runtime. Catat di Decision Log.
- Muat malas setelah OCR; batas waktu proses (~8 dtk) dengan pesan ramah; aplikasi tetap berfungsi tanpa fitur ini.
- Hanya mendeteksi keberadaan wajah, tidak mengenali identitas. ruleId vis-wajah, kategori identitas, severity low (1-2 wajah) / medium (>=3). Alasan: "Wajah personel/keluarga terlihat jelas; pertimbangkan menyamarkan sebelum diunggah".
- Fungsi pemetaan wajah -> Finding[] murni, diuji dengan data tiruan (tanpa memuat model di test).
- Versi Aman: wajah ikut disensor lalu dianalisis ulang. Panel cakupan: "Wajah: N terdeteksi (deteksi di perangkat)".
- Verifikasi build produksi: tanpa request jaringan, CSP lolos, jalan offline.
- HENTIKAN dan tandai "dipotong" bila integrasi melewati ~1,5 jam, bundle membengkak (>15 MB tambahan), atau CSP/WASM bermasalah.
- Foto uji wajah: foto diri sendiri atau berlisensi bebas; jangan masuk repo kecuali lisensi jelas.
- Update PRD (F-19 naik ke P1) dan bagian Batasan README/Tentang: aplikasi tidak menilai isi visual selain deteksi wajah, tidak mengenali seragam/senjata/objek.

## Checkpoint O — Penyelesaian (setelah FEATURE FREEZE)
O1. Tombol "Coba foto contoh" (prioritas): 5 gambar sintetis terpilih (03 papan satuan, 04 dokumen rahasia, 05 plat sah, 02 GPS saja, 01 bersih) + set pola 11-18 di public/samples/, dimuat dengan satu klik; tombol "Muat contoh pola hidup". Total < 2 MB, label "Data contoh fiktif".
O2. QA penuh sesuai 05_QA_TEST_PLAN.md bagian 4-6; isi tabel hasil di PROGRESS; perbaiki bug Critical/High; uji lebar 1920, 1366, 1024, 768, 390 px.
O3. Verifikasi privasi di build produksi (build + preview): Network tanpa request membawa data pengguna, OCR jalan offline, CSP aktif; catat hasil.
O4. Halaman Tentang/Kredit: daftar dependency + lisensi (skrip scripts/licenses.mjs tanpa dependency baru -> src/data/licenses.json), deklarasi penggunaan AI coding assistant, pernyataan data contoh fiktif.
O5. README lengkap: ringkasan, fitur, cara menjalankan 3 langkah, arsitektur singkat, privasi, batasan jujur (OCR tidak sempurna, HEIC belum didukung, isi visual tidak dinilai), kredit.
O6. netlify.toml/vercel.json siap deploy; langkah deploy ditulis di README.

## Checkpoint T — Kebocoran teknis, lokasi tersirat, kontrol pengguna

T1 KEBOCORAN TEKNIS (OCR + caption), aturan di `src/data/aturan-teknis.json`, logika di `rules.ts`:
- IPv4 valid (oktet 0-255): privat (10/8, 172.16/12, 192.168/16) severity high; publik medium; abaikan 0.0.0.0 dan 127.x. Kategori teknis.
- Email: domain instansi (.mil.id, .go.id) high; lainnya medium. Kategori identitas.
- URL/host internal (.local, .internal, intranet, localhost, host:port): high. Teknis.
- Sandi berlabel (password|passwd|pwd|pass|kata sandi|sandi + : atau =): critical. Teknis.
- Token/kunci berlabel (api_key|token|secret|bearer + : atau = + >=8 karakter): critical. Teknis.
- Pola "ssh user@host": medium. Teknis.
- Combo baru: >=2 jenis kebocoran teknis berbeda -> temuan sintetis "Gambaran Infrastruktur Terbaca" severity critical (grup `infrastruktur` di `combo-groups.json`).
- PENYAMARAN BUKTI: nilai sandi/token/kunci tidak boleh tampil utuh di UI, log, Brief, atau Laporan cetak; tampilkan 2 karakter awal + "••••". Uji Brief dan Laporan agar tidak memuat nilai rahasia asli fixture.
- Versi Aman otomatis menyensor bbox temuan teknis dan identitas dari OCR.

T2 LOKASI TERSIRAT (caption dan OCR):
- Tautan peta (maps.app.goo.gl, goo.gl/maps, google.com/maps, maps.google, waze.com/ul, openstreetmap.org, bing.com/maps): high.
- Koordinat teks desimal (lat -90..90, lon -180..180, minimal 4 desimal) dan DMS: high.
- Emoji 📍, "check-in", "lokasi:", "posisi", "titik kumpul", "share loc": medium.
- Frasa waktu nyata ("lagi di", "sekarang di", "live") + lokasi tetap sesuai aturan lama.

T3 KONTROL PENGGUNA:
- Tombol "Abaikan temuan" pada kartu (alasan opsional): temuan keluar dari skor, tampil redup di bagian "Diabaikan (N)" dengan tombol "Pulihkan"; hanya memori sesi.
- Brief dan Laporan wajib menyebut "N temuan diabaikan pengguna" demi transparansi. Skor, radar, gauge dihitung ulang.
- "Edit teks OCR": area teks bisa diedit pada panel Teks terbaca; "Terapkan koreksi" menjalankan ulang aturan pada teks hasil edit. Temuan koreksi tidak memiliki bbox dan diberi label "dari teks koreksi".

T4 TEST:
- `caption-uji.json` menggerakkan test unit (tiap id memuat kategori harapan; c10-c12 nol temuan).
- OCR untuk `19_screenshot_teknis.png`: minimal 4 dari 5 jenis (IP, email, sandi, token, URL) terdeteksi.
- Test abaikan/pulihkan mengubah skor. Dataset 01-18 tidak berubah hasilnya.

T5 UI kecil: ganti lencana "FITUR P1" di halaman Pola Hidup menjadi "Fitur lanjutan". Perbarui PRD, README, dan Tentang.

Selesai: test, lint, build lulus; update PROGRESS (Posisi terakhir, Berikutnya); laporkan ringkas dan sebutkan yang belum.
