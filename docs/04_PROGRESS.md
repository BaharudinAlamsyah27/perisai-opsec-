# 04 — Progress Tracker (DOKUMEN HIDUP — update setiap sesi)

**Posisi terakhir (5 Nov 2026): Checkpoint T diimplementasikan sebagian-terverifikasi: aturan teknis/lokasi tersirat, penyamaran bukti rahasia, ignore/restore sesi, koreksi OCR tanpa bbox, transparansi Brief/Laporan, serta pembaruan T5 tersedia. `npm test` lulus (37 file/130 tes), lint bersih, build sukses (JS utama 589.01 kB; peringatan chunk >500 kB). Fixture yang dijanjikan PO (`tests/fixtures/dataset-tambahan/19_screenshot_teknis.png` dan `caption-uji.json`) tidak ada di workspace, sehingga OCR screenshot dan seluruh kasus caption PO belum dapat diverifikasi. Perubahan lama S6–S8 dan hasil T berbagi working tree; tidak ada commit terpisah agar tidak mencampur perubahan lama.**

**Terakhir diperbarui:** 5 Nov 2026 oleh Codex · **Fase:** Sprint 2 (P0)
**Hari ke:** H2 dari 14 · **Sisa waktu ke deadline:** 12 hari

## 1. Dasbor Ringkas
| Area | Status | Catatan |
|---|---|---|
| Registrasi hackathon | ⬜ Belum | T-000 |
| Repo & scaffold | ✅ Selesai | T-001/T-002 |
| P0 (MVP) | T-002–T-021 implementasi tersedia dan T-017–T-019 terverifikasi; T-022 gate masih pending | Gerbang: 9 Nov |
| P1 (Pembeda) | ✂️ | L/M/N selesai-terverifikasi; P5 dipangkas oleh batas ukuran; P1–P4 audit parsial |
| QA | 🔄 | Suite lulus; O2 ukuran layar dan O3 Network/offline/CSP belum terverifikasi manual |
| Deploy publik | 🔄 | O6: konfigurasi Netlify/Vercel tersedia; deploy belum dilakukan |
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
| T-017 | Sanitize strip | CX | ✅ | menunggu commit | EXIF hasil encode dibaca ulang |
| T-018 | Sensor otomatis | AG | ✅ | menunggu commit | Tiga gaya sensor diuji melalui operasi canvas berbeda |
| T-019 | Perbandingan sebelum/sesudah | AG | ✅ | menunggu commit | OCR dan metadata hasil aman dianalisis ulang dengan batas waktu |
| T-020 | Laporan risiko | AG | ✅ | 7e4d243 | Ringkasan temuan dan cetak/simpan PDF dengan print CSS |
| T-021 | Privasi/Tentang/Kredit | AG | ✅ | 6430ce3 | Halaman privasi/tentang tersedia; lisensi OCR dan globe dicantumkan |
| T-022 | Gerbang P0 | CX/PO | ⬜ | | |
| T-023 | Engine pola hidup | CX | ✅ | menunggu PO | Klaster GPS/waktu, rutinitas, transisi, confidence dan template konservatif |
| T-024 | Halaman pola hidup | AG | ✅ | menunggu PO | SVG lokal, linimasa, heatmap, kartu klaster, label dalam memori, OSM opt-in |
| T-025 | Profil pengguna | AG | ⬜ | | |
| T-026 | Sensor manual | AG | ⬜ | | |
| T-027 | Daftar Informasi Kritis satuan | AG | ✅ | menunggu PO | Editor entri lokal, impor/ekspor, aturan tambahan OCR/caption, penyimpanan perangkat opt-in |
| T-028 | Mode edukasi | AG | ⬜ | | |
| T-029 | AI Vision opsional | AG | ⬜ | | |
| T-030 | Dataset uji | PO+CX | ✅ | menunggu commit | Dataset sintetis PO tersedia di tests/fixtures |
| T-031 | QA penuh | CX | ⬜ | | |
| T-032 | Bugfix & polish | AG | ⬜ | | |
| T-033 | Deploy publik | PO+AG | ⬜ | | |
| T-034 | README + ZIP | AG | ⬜ | | |
| T-035 | Aset submission | PO+PM | ⬜ | | |
| T-036 | Submit | PO | ⬜ | | |
| T | Kebocoran teknis, lokasi tersirat, kontrol pengguna | Codex | 🔄 | belum | T1-T3/T5 implementasi; T4 sebagian karena fixture tambahan PO belum tersedia |

**Checkpoint J:** J1 selesai/commit PO dd21e8b. Perubahan J2–J6 terdahulu masih berada di working tree untuk commit manual PO.

**Checkpoint K:** K0 dataset sintetis PO tersedia. K1–K5 implementasi selesai. K4 kasus 01–10 seluruhnya lulus berdasarkan `expected.json` dan pesan ramah untuk berkas non-gambar. Test/lint/build final lulus.

**Checkpoint L:** Brief Intelijen Lawan deterministik selesai. Kesimpulan, dampak, dan rekomendasi memiliki tautan ID temuan; laporan cetak ikut memuat brief.

**Checkpoint M:** T-023/T-024 rekonstruksi pola hidup selesai. Mesin murni mengelompokkan lokasi GPS (radius baku 100 m), menghitung statistik waktu, rutinitas dan transisi berulang, mengecualikan foto tanpa GPS/waktu valid, serta menulis kesimpulan konservatif bersumber klaster. Halaman membaca metadata sesi, menyediakan mode cepat tanpa OCR, visual SVG tanpa tile, label sementara dalam memori, dan peta OSM yang tetap opt-in.

**Checkpoint N:** T-027 DIK satuan selesai. Kamus tambahan dicocokkan secara case-insensitive dengan normalisasi spasi/tanda hubung dan batas kata, dipakai oleh OCR/caption/analisis ulang, diberi kategori dan severity, memengaruhi scoring dan combo, serta ditandai sumbernya pada kartu. Editor mendukung tambah/ubah/hapus, impor/ekspor JSON, contoh fiktif, hapus semua, dan penyimpanan localStorage yang opt-in dengan peringatan.

**Checkpoint O:** O1 menyertakan 5 foto demo dan 8 foto pola sintetis (797,177 byte total) dengan label fiktif serta tombol muat contoh. O4 membuat 27 dependency/license records dari `package.json` dan `node_modules`, deklarasi AI, dan keterangan contoh fiktif. O5 README memuat fitur, setup 3 langkah, arsitektur, privasi, batasan, kredit, serta panduan deploy. O6 memeriksa konfigurasi Netlify/Vercel dan menambahkan security headers untuk Vite preview. O2 test otomatis lulus; hasil QA dirangkum di log sesi berikut. O3 source audit tidak menemukan upload foto/caption; uji browser Network/offline dan respons CSP belum dapat diamati.

**Checkpoint T:** T1 aturan teknis (IPv4, email, host internal, sandi/token berlabel, SSH), masking secret, combo infrastruktur dan pemetaan bbox OCR telah dibuat. T2 tautan peta, koordinat desimal/DMS tervalidasi, petunjuk lokasi, serta frasa real-time + lokasi ditangani. T3 tombol Abaikan/Pulihkan menghitung ulang skor dan combo di memori sesi; panel OCR mendukung koreksi yang diberi sumber `Teks koreksi` tanpa bbox; Brief dan Laporan mencantumkan jumlah yang diabaikan. T5 label Pola Hidup, PRD, README, Tentang diperbarui. T4 unit sintetis untuk rules, masking, bbox, Brief/Laporan dan ignore/restore tersedia, tetapi dataset PO di `tests/fixtures/dataset-tambahan/` tidak ditemukan; OCR screenshot 19, skenario `caption-uji.json`, dan regresi dataset 01–18 belum diverifikasi penuh.

### Audit R0 — 4 Nov 2026

| Checkpoint | Status | Bukti | Yang kurang |
|---|---|---|---|
| K | Sebagian | `tests/engine/sanitize.test.ts` membuktikan EXIF hilang dan tiga gaya sensor; `tests/engine/syntheticDataset.test.ts` menguji 01–09; `tests/engine/ocr.test.ts` menguji file bukan gambar | Verifikasi end-to-end kasus 10 serta QA manual K2/layout dan hasil sanitasi pada setiap fixture belum dibuktikan dalam tes integrasi |
| K-diagnosa | Selesai-terverifikasi | `OcrTextPanel.tsx`, `AnalysisCoverage.tsx`, `ocr.worker.ts`, `ocrMerge.test.ts`, `OcrTransparency.test.tsx`; 3 lintasan OCR dan coverage diuji | D6 aturan nama file memang opsional dan tidak dikerjakan |
| P1–P4 | Sebagian | `kamus-konteks-militer.json`, `rules.test.ts`, upload zone dan OCR menunjukkan kamus/penanda konteks serta OCR tersedia | Catatan metadata yang hilang akibat kompresi sosial dan tips khusus zona unggah tidak ditemukan; cakupan checkpoint ini belum lengkap |
| Q | Selesai-terverifikasi | `rules.test.ts` Q2/Q5 dan tes konteks; `ContextSummary.test.tsx`; suite memastikan skor konteks, publikasi, dan regresi dataset 03/04/05/08 | Tidak ada kekurangan fungsional yang terlihat pada audit kode |
| L | Selesai-terverifikasi | `src/engine/brief.ts`, `brief-templates.json`, `BriefIntel.tsx`, `tests/engine/brief.test.ts` menguji sumber ID untuk setiap klaim | Uji cetak visual belum manual |
| M | Selesai-terverifikasi | `src/engine/pattern.ts`, `PatternPage.tsx`, `tests/engine/pattern.test.ts` dan `PatternPage.test.tsx`; tiga klaster, dua rutinitas, transisi tiga kali, tanpa GPS/waktu | Uji visual browser belum manual |
| N | Selesai-terverifikasi | `src/engine/dik.ts`, `DikPage.tsx`, `useDikStore.ts`, integrasi `rules.ts`; tes rules dan `DikPage.test.tsx` mencakup normalisasi, kategori/skor, impor dan UI | Tidak ada kekurangan fungsional yang terlihat pada audit kode |
| P5 | Belum (R1 dipangkas) | Evaluasi package MediaPipe Tasks Vision v1.2.2: satu WASM yang diperlukan 14,603,354 byte, loader 334,128 byte, dan model BlazeFace resmi 229,746 byte = 15,167,228 byte sebelum kode integrasi. Sudah melewati batas tambahan 15 MB pada spesifikasi | Deteksi wajah, sanitizer, panel cakupan, dan test tidak dibuat; fitur tetap di luar build sesuai hard stop P5 |
| O | Sebagian | Tombol/sampel ada (`UploadZone.tsx`, `PatternPage.tsx`, `public/samples`, 797,177 byte); `AboutPage.tsx`, `licenses.mjs`, README, `netlify.toml`, `vercel.json` tersedia | O2 lima ukuran layar belum diuji visual; O3 Network, mode offline, dan CSP response belum terverifikasi manual |

Audit gate R0: `git log --oneline -15` menunjukkan Q committed pada `2d35ebc`; `npm test` 32 file/111 tes lulus; `npm run lint` lulus; `npm run build` lulus dengan peringatan chunk utama 572.17 kB (>500 kB). Worktree hanya memiliki `docs/07_CHECKPOINT_LANJUTAN.md` untracked (spesifikasi PO), tidak ada perubahan kode lokal yang tertinggal. Tidak ada upaya push.

**Berikutnya:** PO meninjau S8 pada lebar 360/390/430/768/1024/1366/1920 px memakai daftar cek di bawah. Setelah itu, S7 latar dapat dirancang ulang sesuai arahan PO. O2/O3 QA browser produksi dan checkpoint O tetap belum selesai.

## 3. Log Sesi (terbaru di atas)
Format:
### 5 Nov 2026 — Codex — Checkpoint T
- T1 — Menambahkan `aturan-teknis.json` dan aturan deterministik OCR/caption: validasi IP/rentang privat, email instansi, host internal, secret berlabel, SSH; secret ditampilkan sebagai 2 karakter awal + empat bullet. `combo-groups.json` dan `combos.ts` menghasilkan temuan kritis “Gambaran Infrastruktur Terbaca” dari dua jenis kebocoran. Bbox rahasia OCR dipetakan berdasarkan range agar tetap dapat disensor Versi Aman.
- T2 — Menambahkan deteksi link peta, koordinat desimal dengan batas lat/lon, koordinat DMS dengan batas derajat/menit/detik, petunjuk check-in/lokasi, dan frasa real-time yang berdekatan dengan lokasi tetap.
- T3 — Kartu temuan memiliki Abaikan; bagian Diabaikan (N) menyediakan Pulihkan. Skor aktif dan combo dibangun ulang setelah perubahan. Panel OCR bisa menerapkan koreksi yang disimpan selama sesi; sumber “Teks koreksi” tanpa bbox. Brief dan Laporan menampilkan jumlah yang diabaikan pengguna.
- T5 — Badge halaman Pola Hidup menjadi “Fitur lanjutan”; PRD, README, dan Tentang menyebut cakupan.
- Verifikasi akhir: `npm test` 37 file/130 tes lulus; lint bersih; build sukses. Uji targeted sesudah pemolesan aturan 3 file/10 tes lulus. JS utama 589.01 kB (peringatan Vite >500 kB), CSS 60.41 kB. `git diff --check` bersih.
- Blocker T4 — `tests/fixtures/dataset-tambahan/` tidak ditemukan saat dicek. Tidak ada file uji PO yang dibuat/ditiru; tes OCR `19_screenshot_teknis.png` dan expected dari `caption-uji.json` menunggu PO menaruh fixture.

### 5 Nov 2026 — Codex — S8 penyelarasan tombol Menu
- Mengelompokkan badge status dan tombol Menu ke sisi kanan header (`ml-auto`) agar flex `justify-between` tidak menempatkan tombol Menu di tengah pada layar lebar. Pada layar kecil, badge tetap tersembunyi sehingga tombol berada di tepi kanan.
- Test Header 4/4 lulus; `npm run lint` dan `npm run build` lulus. Build: JS utama 579.02 kB, CSS 60.17 kB; peringatan Vite >500 kB tetap ada. Test tidak menjalankan browser visual; PO dapat meninjau melalui daftar cek S8 di atas.

### 4 Nov 2026 — Codex — S8 Header dan tampilan mobile
- S8-1 — Mengganti navigasi lima item menjadi tautan logo ke Analisis dan satu tombol Menu. Menu menampilkan Pola Hidup, Daftar Kritis, Privasi, Tentang; mobile berupa panel selebar viewport dan desktop berupa popover. Ditambah `aria-expanded`/`aria-controls`, penutupan Escape/klik luar, pemulihan fokus, navigasi tombol panah/Home/End, target sentuh 44 px, serta tautan footer Privasi/Tentang. Badge tanpa unggah hanya muncul mulai 1280 px; tagline mulai 640 px dan COMMAND CENTER mulai 1024 px.
- S8-2 — Banner privasi diringkas menjadi satu kalimat dan tombol Detail. Detail membuka keterangan lengkap serta chip Pekerja web, Siap tanpa internet, dan Peta atas izin.
- S8-3 — Padding halaman mobile diringkas; bar sesi menumpuk di bawah 640 px, unggah compact tidak memakai kotak putus-putus, nama berkas dipotong, tab foto menggulir di wadahnya. Dasbor hasil 1 kolom (<768), 2 kolom (768–1023), 3 kolom (>=1024); panel gauge/radar menumpuk saat ruang tidak cukup.
- S8-4 — Halaman Analisis menampilkan ringkasan berbasis `analyzePatterns()` hanya jika ada minimal 3 observasi dengan GPS dan waktu valid; tombol menuju Pola Hidup. Hero memiliki “Skenario contoh: seminggu unggahan” yang memuat 8 foto sintetis tanpa OCR dan membuka Pola Hidup. Ditambah pintasan ke Daftar Informasi Kritis.
- S8-5 — Test menu (status aria, empat tautan, Escape, klik luar, navigasi keyboard/fokus), banner, pola dengan metadata valid/tidak valid, pemuatan skenario, pintasan DIK, dan pembaruan test smoke. Hasil: `npm test` 35 file/121 tes lulus; lint/build final lulus. Bundle sesudah S8: JS utama 578.99 kB dan CSS 60.14 kB; dibanding build prototipe tepat sebelum S8 +4.02 kB JS dan +0.07 kB CSS. Peringatan Vite chunk >500 kB tetap ada.
- Tindak lanjut S7 — Setelah PO menilai tampilan krem memburuk, prototipe krem dan lapisan S7 dikeluarkan dari aplikasi. Latar S7 tidak dianggap selesai dan ditunda untuk rancangan ulang; engine/skor/aturan tidak diubah pada S8.
- Cek visual untuk PO (browser lokal tidak tersedia bagi Codex): 360/390/430 px — logo satu baris, banner dan Menu tidak meluber, panel pola/unggah tidak membuat geser horizontal, bar sesi vertikal, radar menumpuk, aksi aman mudah dijangkau. 768 px — dua kolom dan panel tab mengisi lebar. 1024 px — tiga panel dan popover Menu. 1366/1920 px — tagline/badge muncul sesuai breakpoint, menu menjadi popover, footer tidak bertumpuk. Semua ukuran — buka/tutup menu dengan klik, Escape, klik luar dan keyboard; Detail privasi; skenario contoh; kartu Pola Hidup; tautan DIK/footer.
- Commit S8 belum dicoba pada sesi ini karena working tree masih memuat perubahan S6 dan komponen lama yang belum dikomit; perlu pemisahan agar commit S8 tidak mencampur pekerjaan terdahulu.

### 4 Nov 2026 — Codex — Prototipe tema terang “peta kertas”
- Menanggapi masukan PO bahwa tampilan terlalu hitam, mengubah kanvas aplikasi dari slate gelap ke krem pucat (`#f4f1e8`) sambil mempertahankan panel HUD/header gelap, aksen cyan, dan globe. Tujuannya membuat kartu lebih menonjol tanpa membalik warna teks/kontrol seluruh aplikasi.
- Menurunkan intensitas grid/titik, menghangatkan vignette, dan melembutkan cahaya sudut; warna risiko tetap mengalir dari pemetaan skor yang sama. Footer disesuaikan agar kontras pada kanvas terang; latar tetap disembunyikan pada print dan tidak ada aset/dependency/network/CSP baru.
- Verifikasi otomatis: `npm test` 34 file/116 tes lulus; `npm run lint` lulus; `npm run build` lulus. CSS produksi 60.07 kB dibanding 59.78 kB sebelum prototipe (+0.29 kB); JS 574.97 kB (sebelumnya 574.99 kB). Build masih memberi peringatan chunk >500 kB. Test mengeluarkan warning React `act(...)` dan jsdom canvas/globe yang sudah ada, tetapi suite lulus.
- Pemeriksaan browser/screenshot tidak dilakukan karena akses browser lokal dinonaktifkan pada pengaturan Work di sesi ini; responsivitas visual akhir perlu ditinjau saat preview dibuka lokal.
- Koreksi 4 Nov: PO menilai prototipe krem memburuk. Perubahan krem dibatalkan pada sesi S8; catatan ini bersifat historis, bukan tampilan aplikasi saat ini.

### 4 Nov 2026 — Codex — S6 Konsistensi bahasa dan polesan
- Menambahkan `getSeverityLabel()` sebagai satu pemetaan bersama untuk Kritis/Tinggi/Sedang/Rendah/Info dan memakai di Aksi Cepat, kartu temuan, brief, laporan cetak, serta editor DIK. Menyatukan label sumber/kategori untuk kartu temuan agar nilai internal `ocr`, `metadata`, dan lain-lain tidak tampil mentah.
- Melokalkan string antarmuka yang masih mencolok: indeks gauge, panel log dan badge sumber, caption, privasi/peta, editor metadata, kredit/tentang, serta pesan teknis OCR/sanitasi. Ukuran/spacing label “INDEKS RISIKO” disesuaikan agar muat di gauge kecil dan tidak menempel ke tepi.
- Test baru memeriksa pemetaan severity/sumber dan label kartu/Aksi Cepat. Hasil akhir: `npm test` 33 file, 113/113 lulus; `npm run lint` lulus; `npm run build` lulus (JS utama 572.73 kB; peringatan Vite >500 kB); `git diff --check` bersih. Test awal sempat gagal karena assertion mengharapkan satu label “Tinggi” padahal dua temuan tampil; assertion diperbaiki dan seluruh suite akhir lulus.
- Blocker commit S6: `git add` ditolak saat membuat `.git/index.lock` (`Permission denied`). Tidak dicoba menghindarinya; perubahan menunggu commit manual PO.

### 4 Nov 2026 — Codex — S7 Latar “Peta Operasi”
- Menambahkan `TacticalBackground` sebagai lapisan `fixed`, `pointer-events: none`, di bawah konten. Kontur topografi berupa SVG inline; grid dan titik koordinat serta cahaya sudut/vignette berupa CSS lokal. Tidak memakai aset eksternal/dependency baru, filter blur, atau animasi; hanya warna cahaya yang transisi 600 ms. `prefers-reduced-motion` meniadakan transisi.
- Warna cahaya diambil dari palet `getScoreTheme()` yang sama dengan gauge: netral cyan saat belum ada skor, lalu hijau/kuning/oranye/merah berdasarkan skor aktif. Root `isolate` menempatkan dekorasi di bawah konten; inset viewport dan SVG `preserveAspectRatio` menjaga latar mengikuti lebar layar tanpa membuat elemen melebar. Print CSS menyembunyikan latar; panel laporan tetap putih.
- Ukuran build sebelum (S6): JS utama 572.73 kB, CSS 58.72 kB. Sesudah S7: JS utama 574.99 kB (**+2.26 kB**), CSS 59.78 kB (**+1.06 kB**); gzip sesudah: JS 180.87 kB, CSS 14.79 kB. Tidak ada perubahan CSP atau request jaringan.
- Verifikasi: test 34 file, 116/116 lulus, termasuk pemetaan warna dan render lapisan; lint lulus; build lulus dengan peringatan Vite untuk JS utama >500 kB. `git diff --check` bersih. Pemeriksaan mobile 390 px dilakukan dari geometri CSS (lapisan memakai `inset: 0`, lebar SVG 100%, tanpa transform/blur); belum ada screenshot browser manual.
- Blocker commit S7: `git add` ditolak saat membuat `.git/index.lock` (`Permission denied`). Tidak dicoba menghindarinya; perubahan menunggu commit manual PO.

### 4 Nov 2026 — Codex — Audit R0 dan evaluasi P5
- Audit R0 — Menjalankan `git log --oneline -15`, `npm test` (32 file, 111/111), `npm run lint`, dan `npm run build` (sukses; chunk utama 572.17 kB, peringatan Vite >500 kB). Bukti per checkpoint dan kekurangan dicatat pada tabel Audit R0 di atas.
- P5 — Memeriksa package dan model resmi MediaPipe. Tasks Vision memakai Apache-2.0; paket memerlukan WASM 14,603,354 byte dan loader 334,128 byte. Model BlazeFace short-range resmi berukuran 229,746 byte, sehingga jumlah aset lokal wajib sekitar 15.17 MB sebelum integrasi JS. Sesuai hard stop P5 (>15 MB tambahan), checkpoint dipangkas. Dependency tidak dipertahankan; tidak ada file model/WASM ditambahkan.
- Privasi — Dokumentasi resmi MediaPipe menyatakan pemrosesan input di perangkat, tetapi juga menjelaskan SDK mengirim metrik performa/penggunaan. Karena proyek melarang analytics/runtime request baru, integrasi tidak dilanjutkan tanpa jalur telemetry-free yang terverifikasi.
- Blocker commit — `git restore` dan `git add docs/04_PROGRESS.md` ditolak karena `.git/index.lock` Permission denied. Tidak dicoba menghindari izin; dependency/lockfile dikembalikan manual. Perubahan progress audit menunggu commit manual PO.
- Berikutnya: lanjut O2/O3 QA produksi dan responsive; P1–P4 dan K juga masih memiliki celah yang ditandai pada tabel audit.

### 4 Nov 2026 — Codex — Checkpoint Q: bobot konteks publikasi kegiatan
- Q1 — Meninjau ulang panel Teks terbaca/log dan lintasan yang ditambahkan di K-diagnosa: worker menjalankan gambar asli skala maks 2400 px/PSM otomatis, grayscale-kontras/PSM otomatis, dan invert/PSM 11; log tiap lintasan, jumlah kata, ukuran, kegagalan praproses dan durasi. Tidak ada foto milik pihak lain ditambahkan. Dataset sintetis OCR 03/04/05/08 lulus regresi.
- Q2 — Kamus konteks mengatur operasi, teritorial, rawan konflik, satgas, penugasan, patroli, pengamanan sebagai severity low; perbatasan medium; TNI, Tentara Nasional Indonesia, Dirgahayu info (skor nol). Temuan kegiatan memakai alasan persis: “Kegiatan satuan terdeteksi. Periksa apakah sudah diumumkan resmi sebelum diunggah.”
- Q3 — Jika ada minimal tiga kecocokan konteks, daftar temuan merender satu catatan “Konteks kegiatan operasional” dan meringkas bukti; temuan tetap individual di engine untuk penjelasan/skoring.
- Q4 — Untuk skor rendah yang hanya bersumber dari temuan konteks publikasi, panel skor dan gauge menampilkan “Perlu verifikasi publikasi”, termasuk deskripsi yang tidak menyatakan foto aman.
- Q5 — String operasi-teritorial lengkap menghasilkan minimal tiga temuan, tidak ada critical, skor uji 20–35. “Dirgahayu TNI 5 Oktober 2021” memberi skor risiko 0. Skor konteks teks yang saling berkorelasi dihitung dari sinyal konteks terkuat satu kali agar pengulangan kata dalam kalimat tidak menggandakan risiko. Dataset 03, 04, 05, 08 lulus tanpa rule `mil-*` baru.
- Verifikasi: `npm test` — 32 file, 111/111 lulus; `npm run lint` bersih; `npm run build` sukses (JS utama 572.17 kB; peringatan Vite >500 kB). `git diff --check` diperiksa setelah pembaruan tracker.
- Commit per butir: belum dibuat. File `rules.ts`, kamus konteks dan tracker juga memuat perubahan K-diagnosa/O yang belum dikomit; staging file penuh akan mencampur butir. Git sebelumnya menolak `.git/index.lock`; tidak dilakukan bypass. PO perlu memisahkan hunks saat commit manual.

### 4 Nov 2026 — Codex — Audit ulang Checkpoint O1–O6
- O1 — Audit sampel: 13 JPG di `public/samples/`, total 797.177 byte (<2 MB); tombol contoh utama/pola dan label data fiktif tersedia. Tidak menyalin foto pihak lain.
- O2 — Regression test: `npm test` 31 file, 108/108 lulus; lint bersih; build lulus. Tidak ada test gagal atau bug Critical/High terungkap secara otomatis. Checklist fungsional otomatis pada tabel O sebelumnya tetap lulus.
- O2 — Viewport 1920, 1366, 1024, 768, 390 px belum diverifikasi visual. Browser automation tidak tersedia pada sesi ini; Playwright tidak terpasang. Kompatibilitas browser dan tab/keyboard visual tetap belum lengkap.
- O3 — `npm run preview` berjalan setelah izin loopback diberikan. GET dokumen utama mendapat HTTP 200 dan CSP aktif: `default-src 'self'`, `script-src 'self' 'wasm-unsafe-eval'`, `worker-src 'self' blob:`, `connect-src 'self'`; `X-Content-Type-Options: nosniff` aktif. Worker/assets berstatus 200; `.wasm` bertipe `application/wasm`; `.traineddata` berstatus 200 dengan panjang sesuai file tetapi tanpa header Content-Type eksplisit. Source audit menemukan hanya GET sampel statis dan tile OSM opt-in, tidak ada fetch/XHR/WebSocket yang membawa foto/caption. OCR test sintetis memakai aset WASM/traineddata lokal; toggle offline dan Network capture browser belum diverifikasi.
- O4 — `npm run licenses` berhasil menghasilkan 27 dependency langsung/dev dari `package.json` dan `node_modules`. Halaman Tentang, deklarasi AI coding assistant, serta keterangan foto fiktif tersedia.
- O5/O6 — README, batasan OCR/HEIC, arsitektur, privasi, kredit, tiga langkah penggunaan, dan instruksi deploy Netlify/Vercel diaudit; konfigurasi rewrite SPA dan CSP tersedia.
- Hasil akhir: test 108/108 lulus, lint lulus, build lulus (JS utama 570.71 kB; peringatan Vite >500 kB). O1 commit dicoba, tetapi Git menolak pembuatan `.git/index.lock` (`Permission denied`). Tidak ada perubahan yang masuk staging; commit O1–O6 menunggu PO.

### 4 Nov 2026 — Codex — K-diagnosa: transparansi hasil OCR dan cakupan pemeriksaan
- D1 — Ditambahkan panel **Teks terbaca (OCR)** yang menampilkan kata mentah, keyakinan per kata, kata di bawah 70% yang diredupkan dan diberi tanda “diabaikan”, jumlah terbaca/diabaikan, serta durasi proses.
- D2 — Mengganti klaim bersih absolut dengan cakupan Metadata/OCR/Aturan/Caption dan catatan bahwa isi visual tidak diperiksa. OCR kosong/gagal/dilewati atau hanya menghasilkan kata di bawah ambang memicu peringatan “Teks pada gambar tidak terbaca, hasil mungkin tidak lengkap”; label gauge Aman disembunyikan dan diganti “Cakupan terbatas” tanpa mengubah nilai/level skor pada data.
- D3 — OCR tetap pada Web Worker dan kini memakai tiga lintasan: gambar asli yang diskalakan maksimum 2400 px dengan PSM otomatis, grayscale+kontras dengan PSM otomatis, serta gambar terbalik dengan PSM 11. Kata unik digabung berdasarkan teks dan tumpang tindih bbox, confidence terbaik dipertahankan, total waktu dibatasi 20 detik. Log kini mencatat awal/hasil tiap lintasan, sumber/PSM/ukuran gambar, jumlah kata, praproses yang dilewati/gagal, dan durasi total.
- D4/D5 — Menambah kamus `kamus-konteks-militer.json` untuk teritorial, rawan konflik, pengamanan, apel, personel, TNI, dan Tentara Nasional Indonesia; istilah umum memakai severity low–medium/info, sedangkan kata kunci konteks menyarankan pemeriksaan pengumuman resmi. Istilah umum wilayah perbatasan/sektor kini medium. Test string brief operasi-teritorial-perbatasan lulus; caption aman tetap nol temuan.
- D6 — Tidak dikerjakan (opsional), agar sumber nama berkas tidak menambah klaim atau temuan di luar kebutuhan utama.
- Hasil uji: dataset sintetis **03 papan satuan/NRP — lulus**, **04 dokumen RAHASIA — lulus**, **07 variasi penulisan — lulus**. `npm test` — 31 file, 108/108 lulus; `npm run lint` lulus; `npm run build` lulus (bundle utama 570.71 kB; peringatan Vite >500 kB). Tidak ada gambar unduhan pihak lain di repo.
- Commit per butir: belum dapat dipisahkan aman karena file integrasi seperti `AnalysisPage`, `ResultsPanel`, `rules.ts`, `ocr.worker.ts`, dan `useAnalysisStore.ts` memuat perubahan J–O terdahulu di working tree. Memasukkannya langsung akan membuat commit campuran; riwayat sebelumnya juga mencatat izin `.git/index.lock` ditolak. Perlu staging selektif/commit manual PO.

### 4 Nov 2026 — Codex — Verifikasi ulang Checkpoint N: DIK Satuan (T-027)
- Meninjau ulang `AGENTS.md`, tracker, engine, integrasi rules/combo, halaman DIK, dan test. Implementasi sebelumnya sudah memenuhi spesifikasi: tipe entri lima jenis, severity default `high`, normalisasi kapital/spasi/tanda hubung dan batas kata, kategori sesuai jenis, `dik-*`, integrasi skor/combo, CRUD, impor/ekspor, contoh fiktif, hapus semua, penyimpanan sesi default dan localStorage opt-in dengan peringatan.
- Hasil: `npm test` — 28 file, 101/101 lulus (termasuk DIK matching/kategori/scoring/import error/UI); `npm run lint` lulus; `npm run build` lulus. Build mempertahankan peringatan chunk utama 563.27 kB. Tidak ada perubahan engine baru diperlukan pada verifikasi ulang ini.
- Commit: belum dibuat. Perubahan DIK berada pada beberapa file yang juga memuat perubahan checkpoint J–O belum dikomit; commit selektif/terpisah tanpa mencampur perubahan tersebut perlu dilakukan manual oleh PO.

### 4 Nov 2026 — Codex — Checkpoint O: demo publik, QA, privasi, dokumentasi, deploy
- O1 — Dikerjakan: Menyalin 5 kasus pilihan (03, 04, 05, 02, 01) dan 8 gambar pola 11–18 ke `public/samples/`. Menambahkan tombol **Coba foto contoh** di hero dan **Muat contoh pola hidup** yang membaca EXIF tanpa OCR, plus label `DATA CONTOH FIKTIF`. Total sampel 797,177 byte (<2 MB). Test UI memastikan set lima file dan set pola delapan file masuk ke jalur metadata-saja.
- O2 — Hasil QA otomatis: `npm test` — 28 file, 101/101 lulus pada run stabil (foto 12 MP sekitar 7.7 dtk). Dataset sintetis 01–09 lulus, pola 11–18 sesuai target, caption/versi aman/laporan/peta opt-in/DIK/kredit dan hapus sesi teruji. Tidak ditemukan bug Critical/High pada pemeriksaan otomatis.
- O2 — Tabel checklist manual P0:

| Checklist QA §4 | Hasil | Bukti/catatan |
|---|---|---|
| Analisis satu foto | Lulus otomatis | Test alur unggah dan dataset sintetis |
| Multi-foto | Lulus otomatis | Lima sample demo; suite dataset/pola |
| GPS dan peta/offline fallback | Sebagian | Opt-in peta diuji unit; fallback offline belum diuji visual |
| Progres OCR | Lulus analisis | OCR lokal berjalan pada dataset; progres UI belum diperiksa visual |
| Alasan, rekomendasi, bbox | Lulus | Kasus papan satuan dan test bbox OCR |
| Caption highlight/saran | Lulus | Test caption risiko dan aman |
| Versi aman tanpa EXIF | Lulus | Test baca ulang keluaran dengan exifr |
| Skor versi aman turun | Lulus otomatis | Test SanitizerPreview sebelum/sesudah |
| Laporan cetak | Lulus otomatis | Test memanggil `window.print()` |
| Privasi, Tentang, Kredit | Lulus otomatis | Test halaman Kredit/daftar lisensi; source audit network |
| Hapus sesi | Lulus otomatis | Test `clearAll` menghapus state dan URL preview |

- O2 — Ukuran layar: 1920 px — belum diverifikasi visual; 1366 px — belum diverifikasi visual; 1024 px — belum diverifikasi visual; 768 px — belum diverifikasi visual; 390 px — belum diverifikasi visual. Pemeriksaan browser terhenti saat Computer Use menyatakan input Escape fisik dari pengguna; tidak dilakukan interaksi browser lanjutan.
- O2 — Kompatibilitas §6: Chrome desktop teruji sebagian melalui test/browser yang sebelumnya berjalan; Edge, Firefox, Chrome Android, Safari iOS tidak diuji. HEIC/HEIF tetap tidak didukung dan pesan validasi tersedia.
- O3 — Build dan preview: `npm run build` sukses (bundle JS utama 563.27 kB; peringatan Vite >500 kB). `npm run preview` berhasil start. Vite preview dikonfigurasi CSP (`worker-src 'self' blob:` dan `'wasm-unsafe-eval'`) selaras dengan Netlify/Vercel; header HTTP tidak dapat dibaca dari shell karena sandbox menolak koneksi localhost. Browser production Network/offline manual belum diverifikasi setelah interaksi browser dihentikan. Source audit hanya menemukan GET sampel statis dan tile OSM opt-in; tidak ada fetch/XHR/WebSocket yang mengirim foto/caption. OCR sintetis menggunakan WASM/traineddata lokal lulus dalam suite tanpa layanan OCR eksternal.
- O4 — Dikerjakan: `npm run licenses` membangun `src/data/licenses.json` dari 27 dependency langsung/dev di package.json dan metadata node_modules, tanpa dependency baru. Halaman Tentang merender nama/version/lisensi, kredit aset, deklarasi AI coding assistant, dan pernyataan data contoh sintetis. Test halaman lulus.
- O5/O6 — Dikerjakan: README ditulis ulang dengan ringkasan, fitur, setup tiga langkah, arsitektur, privasi, batasan OCR/HEIC, kredit, dan panduan Netlify/Vercel. `netlify.toml`/`vercel.json` diperiksa; CSP dan rewrite SPA tersedia, `vite.config.ts` memberi security headers pada preview lokal.
- Verifikasi akhir: `npm test` — 28 file, 101/101; `npm run lint` bersih; `npm run build` sukses (bundle utama 563.27 kB; peringatan Vite >500 kB); `git diff --check` bersih.
- Belum selesai: screenshot/responsive manual 5 lebar, Network capture browser, toggle offline OCR di browser, dan pembacaan aktual header response CSP.
- Blocker/pertanyaan: Preview host berhasil start, tetapi PowerShell tidak dapat membuka localhost (`socket access denied`). Computer Use kemudian berhenti karena Escape fisik pengguna; instruksi tool meminta menghentikan semua aksi UI lanjutan. Tidak ada upaya bypass.
- Commit O1–O6: percobaan commit O1 ditolak saat membuat `.git/index.lock` (`Permission denied`). Tidak dicoba bypass. Seluruh perubahan Checkpoint O menunggu commit manual PO.

### 4 Nov 2026 — Codex — Checkpoint N: Daftar Informasi Kritis Satuan (T-027)
- Dikerjakan: Menambahkan tipe dan validator DIK, pencocokan batas kata tanpa membocorkan nilai ID ke ruleId, kategori dan severity sesuai jenis, integrasi pada OCR/caption/analisis ulang, grup combo untuk satuan/lokasi/kegiatan, serta label sumber DIK pada kartu temuan. Menambah halaman editor dengan tambah/ubah/hapus, impor/ekspor, contoh fiktif, hapus semua, memori sesi default, dan penyimpanan localStorage opt-in dengan peringatan sensitivitas.
- Hasil/verifikasi: `npm test` — 27 file, 97/97 lulus; mencakup normalisasi kapital/spasi/tanda hubung, batas kata, kategori, scoring/combo, validasi impor dan pesan error ramah, UI penyimpanan opt-in, serta label kartu temuan. `npm run lint` bersih; `npm run build` sukses dengan peringatan bundle utama 557.73 kB.
- Belum selesai: commit T-027 belum dibuat karena izin sistem.
- Keputusan: Rule engine tetap murni dengan DIK sebagai argumen eksplisit. LocalStorage hanya dibaca jika ada salinan yang sebelumnya disimpan dengan flag opt-in.
- Blocker/pertanyaan: Commit T-027 ditolak sistem saat membuat `.git/index.lock` (`Permission denied`). Tidak dilakukan bypass; PO dapat melakukan commit manual.
- Commit: menunggu PO (izin `.git/index.lock`).

### 4 Nov 2026 — Codex — Checkpoint M: Rekonstruksi Pola Hidup (T-023/T-024)
- Dikerjakan: Menambahkan `src/engine/pattern.ts` sebagai mesin deterministik murni untuk validasi waktu/koordinat, jarak haversine, klasterisasi centroid greedy, jumlah foto/hari, median dan rentang jam, rutinitas ±60 menit, transisi berulang, tingkat keterbacaan, keyakinan, dan kalimat konservatif yang menyebut label klaster sumber. Mengganti placeholder PatternPage dengan analisis metadata sesi; mode cepat tidak menunggu OCR; menyajikan sebaran SVG lokal, linimasa harian, heatmap hari×jam, kartu klaster yang labelnya hanya tersimpan di state halaman, kartu kesimpulan, dan peta OSM opsional yang tile-nya tetap perlu persetujuan.
- Hasil/verifikasi: Data sintetis meniru kasus 11–18 menghasilkan 3 klaster (4/4, 3/3, 1/1 foto/hari), 2 rutinitas, transisi Lokasi 1→Lokasi 2 pada 3 hari, keterbacaan Tinggi; test missing GPS/waktu dan klaster tunggal lulus. `npm test` — 26 file, 90/90 lulus; `npm run lint` bersih; `npm run build` sukses. Build memberi peringatan ukuran bundle utama 543.36 kB. `git diff --check` bersih.
- Belum selesai: commit T-023/T-024 per butir belum dibuat; belum dilakukan uji visual browser.
- Keputusan: Waktu EXIF diperlakukan sebagai waktu dinding tanpa zona waktu dengan tanggal/weekday deterministik. Median pasangan nilai genap memakai nilai tengah bawah sehingga tidak menampilkan setengah menit. Peta relatif SVG adalah visualisasi tanpa jalan/tiles; OSM tetap eksplisit opt-in.
- Blocker/pertanyaan: Commit T-023 dan T-024 ditolak izin sistem saat membuat `.git/index.lock` (`Permission denied`). Sesuai arahan tidak dilakukan bypass; perubahan tetap lokal.
- Commit T-023/T-024: menunggu PO (izin `.git/index.lock`).

### 4 Nov 2026 — Codex — Checkpoint L: Brief Intelijen Lawan
- Dikerjakan: Menambahkan engine murni `src/engine/brief.ts` dengan template di `src/data/brief-templates.json`. Brief tersusun tetap: ringkasan risiko/skor, kesimpulan SIAPA/DI MANA/KAPAN/APA/POLA, maksimal tiga dampak, rekomendasi temuan berurutan severity, dan keputusan dari level skor. Setiap pernyataan yang bersumber dari temuan menautkan ID temuannya; status foto bersih berupa label tanpa kesimpulan intelijen. Keyakinan OCR mengikuti nilai kata, metadata/caption langsung diberi Tinggi, dan combo/inferensi diberi Rendah. Tombol Aksi Cepat membuka modal brief, tautan sumber menuju kartu temuan, dan brief disertakan pada Laporan cetak.
- Hasil/verifikasi: `npm test` — 24 file, 84/84 lulus, termasuk GPS saja, satuan+NRP, dokumen RAHASIA, foto bersih, caption lengkap+combo, dan pemeriksaan ID sumber; `npm run lint` bersih; `npm run build` sukses. Vite memberi peringatan ukuran bundle utama 521.62 kB.
- Belum selesai: commit belum dibuat karena blocker `.git/index.lock` yang telah terjadi pada sesi sebelumnya; uji browser visual tidak dilakukan.
- Keputusan: Status bersih ditampilkan sebagai label “TIDAK ADA KEBOCORAN BERMAKNA TERDETEKSI” tanpa membuat kalimat kesimpulan tanpa sumber. Waktu EXIF memakai nama hari berdasarkan tanggal kalender UTC agar deterministik; jam tetap mengikuti waktu yang tercatat perangkat.
- Blocker/pertanyaan: Tidak ada blocker implementasi. Commit J–L menunggu PO karena izin `.git/index.lock`; tidak dilakukan bypass.
- Commit: menunggu PO.

### 4 Nov 2026 — Codex — Checkpoint K1–K5
- Dikerjakan: K1 menampilkan status/batas waktu analisis ulang versi aman, skor dan jumlah temuan sebelum/sesudah, serta checklist EXIF, area sensor, dan GPS dari file hasil encode. Worker OCR dihentikan saat melewati tenggat; error berkas non-gambar dibedakan dengan pesan ramah. OCR dokumen memakai fallback segmentasi teks jarang untuk memulihkan cap RAHASIA. K2 merapatkan panel atas, menjaga panel mulai dari tinggi konten, membatasi Aksi Cepat menjadi dua temuan dan menyediakan “Lihat semua”. K3 menghilangkan bingkai bukti berlapis. K4 menguji dataset sintetis 01–10 dengan Tesseract lokal, memperbaiki variasi satuan bertanda hubung dan nomor telepon OCR bertanda pisah. K5 memastikan caption berisiko memicu combo dan teks aman tetap bersih.
- Hasil uji dataset (`tests/fixtures/dataset-uji-sintetis/expected.json`):

| File | Harapan | Hasil | Status |
|---|---|---|---|
| 01_foto_bersih.jpg | 0 temuan, Aman | 0 temuan | Lulus |
| 02_gps_saja.jpg | GPS, waktu, perangkat; skor ≥60 | Tiga temuan wajib terdeteksi; skor memenuhi ambang | Lulus |
| 03_papan_satuan_nrp.jpg | Satuan, NRP, HP, GPS; bbox valid | Empat temuan wajib terdeteksi; bbox OCR positif dan terpetakan | Lulus |
| 04_dokumen_rahasia.jpg | RAHASIA, jadwal, pergerakan | Ketiganya terdeteksi; fallback OCR menemukan cap RAHASIA | Lulus |
| 05_plat_nomor_sah.jpg | Plat AD 1234 XY | `id-plate` terdeteksi | Lulus |
| 06_negatif_bukan_plat.jpg | SG 3 ow tidak menjadi plat; 0 temuan | Teks dikenali; tidak ada temuan | Lulus |
| 07_variasi_penulisan.jpg | Tiga satuan termasuk huruf kecil/tanda hubung | Tiga temuan satuan terdeteksi | Lulus |
| 08_nik_fiktif.jpg | NIK 16 digit | `id-nik` terdeteksi | Lulus |
| 09_foto_besar_12mp.jpg | OCR <15 dtk; bbox skala asli | OCR sekitar 4–8 dtk saat uji; bbox berada pada koordinat gambar asli (>2400 px) | Lulus |
| 10_bukan_gambar.jpg | Error ramah, aplikasi tidak crash | Pesan berbahasa Indonesia dengan detail teknis; 0 kata OCR | Lulus |

- Verifikasi penuh: `npm test` — 23 file, 77/77 test lulus. `npm run lint` — bersih. `npm run build` — sukses; Vite memberi peringatan ukuran bundle utama 510.27 kB (batas saran 500 kB). Test Aksi Cepat memastikan hanya dua bukti ringkas tampil dan tombol utama tetap tersedia.
- Belum selesai: commit per butir belum dibuat; uji visual browser khusus pada 1366×768 tidak dilakukan di sesi ini. Test menunjukkan waktu OCR kasus 09 sekitar 3.8–7.6 detik pada mesin ini; waktu dapat berubah menurut perangkat.
- Keputusan: kasus RAHASIA memakai OCR ulang mode sparse hanya ketika konteks dokumen ada dan pengenalan utama melewatkan cap; hanya hasil fallback yang memulihkan klasifikasi yang digunakan.
- Blocker/pertanyaan: izin `.git/index.lock` telah menolak commit J2 sebelumnya. Sesuai instruksi, tidak dilakukan bypass atau pengubahan izin; commit K dibiarkan untuk PO agar dapat dibuat per butir secara manual.
- Commit: menunggu PO.

### 4 Nov 2026 — Codex — Checkpoint J2 (perakitan ulang halaman analisis)
- Dikerjakan: Menyusun dasbor hasil dalam tiga panel baris atas, temuan dan metadata/lokasi pada baris kedua, versi aman lebar penuh, serta log tertutup. Sesi kosong tetap memakai hero; sesi berisi hasil memakai unggah ringkas. Layar di bawah 1024 px memakai tab aksesibel. Laporan dipindah ke modal/cetak. Temuan dapat difilter, diurut, dan dibuka.
- Hasil/verifikasi: `npm test` 61/61 lulus; `npm run lint` bersih; `npm run build` sukses.
- Belum selesai: Verifikasi visual browser pada ukuran 1920/1366/1024/768/390 px dilakukan pada J6.
- Keputusan: Breakpoint layout desktop dimulai pada 1024 px agar sesuai acceptance criteria.
- Blocker/pertanyaan: —
- Commit: tidak dapat dibuat; `git add`/`git commit` ditolak karena akses ke `.git/index.lock` (catatan 4 Nov 2026). Perubahan J2 berada di working tree untuk commit manual PO.

### 4 Nov 2026 — Codex — Checkpoint J3 (interaksi foto-temuan)
- Dikerjakan: Menghubungkan hover kartu dan bbox; klik/keyboard pada bbox memilih dan menggulir ke kartu temuan yang sesuai. Bbox diposisikan pada rasio/ukuran foto yang tampil, termasuk foto potret; ID target dipisah antara panel desktop dan tab seluler.
- Hasil/verifikasi: Test interaksi 2/2 lulus; lint bersih; build sukses.
- Belum selesai: Pemeriksaan visual pada beberapa rasio/ukuran layar akan dilakukan bersama J6.
- Keputusan: —
- Blocker/pertanyaan: Commit ditahan blocker izin `.git/index.lock` yang sama; tidak dicoba bypass.
- Commit: belum dibuat; perubahan lokal untuk commit manual PO.
### [Tanggal] — [Agent/Orang] — Sesi #N
- Dikerjakan: ...
- Hasil/verifikasi: ... (perintah & output ringkas)
- Belum selesai: ...
- Keputusan: ...
- Blocker/pertanyaan: ...
- Commit: ...

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
- 5 Nov 2026 — Fixture Checkpoint T yang dijanjikan PO belum tersedia di `tests/fixtures/dataset-tambahan/`; OCR screenshot teknis dan test berbasis `caption-uji.json` belum bisa dijalankan. Tidak ada fixture foto pihak lain yang ditambahkan.
- 5 Nov 2026 — Commit T belum dicoba karena working tree masih mencampur perubahan S6–S8 lama dengan file integrasi yang kini disentuh T; staging per-file berisiko memasukkan perubahan lama ke commit checkpoint. PO dapat meninjau dan commit perubahan manual setelah fixture masuk.
- 4 Nov 2026 — Commit J2, T-023, T-024, dan T-027 gagal karena izin sistem menolak akses `.git/index.lock`. O2/O3 manual browser QA juga belum lengkap: Computer Use berhenti setelah Escape fisik pengguna, dan localhost ditolak sandbox shell. Perubahan J–O tetap di working tree; tidak dilakukan bypass. Push dilakukan PO.
- 4 Nov 2026 — Percobaan commit O1 gagal karena izin sistem menolak pembuatan `.git/index.lock` (`Permission denied`). O1–O6 menunggu commit manual PO; tidak dilakukan bypass.
- 4 Nov 2026 — Verifikasi ulang T-027 lulus. Commit N belum bisa dipisahkan aman dari perubahan J–O yang masih bercampur pada file integrasi; commit manual PO diperlukan setelah pemisahan/peninjauan staging.
- 4 Nov 2026 — K-diagnosa D1–D5 telah diverifikasi, tetapi commit per butir belum dibuat. Perubahan pada OCR, rules, komponen hasil, dan store berbagi file dengan checkpoint J–O yang masih uncommitted; staging file penuh akan mencampur butir. Riwayat `.git/index.lock` juga menunjukkan penolakan izin, sehingga tidak dilakukan bypass.
- 4 Nov 2026 — Audit ulang O1–O6: preview loopback/CSP/WASM telah diverifikasi; viewport, Network browser, dan offline browser masih pending. Percobaan `git add` O1 kembali gagal di `.git/index.lock` (`Permission denied`); perubahan O tidak distage.
- 4 Nov 2026 — Checkpoint Q telah diverifikasi, tetapi commit per butir belum dibuat karena file implementasi yang sama memuat perubahan K-diagnosa/O sebelumnya; staging penuh akan mencampur checkpoint. Riwayat akses `.git/index.lock` tetap terblokir dan tidak dicoba bypass.

## 8. Changelog (rilis internal)
- v0.0.0 — Perencanaan.

## 9. Ringkasan Harian (isi PO tiap malam, 2 menit)
| Tanggal | Target hari ini | Tercapai? | Risiko baru | Rencana besok |
|---|---|---|---|---|
| 2 Nov | Dokumen + registrasi + scaffold | | | |
