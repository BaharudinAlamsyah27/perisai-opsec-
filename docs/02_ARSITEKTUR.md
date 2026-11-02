# 02 — Arsitektur Teknis

## 1. Gambaran
Single Page Application statis. Semua analisis berjalan di browser. Tidak ada backend.

```
[Browser]
  UI (React) ── Store (Zustand) ──┬─ ingest/        (baca file, deteksi tipe, resize)
                                  ├─ engine/
                                  │   ├─ metadata.ts   (exifr → Finding[])
                                  │   ├─ ocr.worker.ts (tesseract.js → words+bbox)
                                  │   ├─ rules.ts      (kamus JSON → Finding[])
                                  │   ├─ scoring.ts    (Finding[] → Score)
                                  │   ├─ combos.ts     (boost kombinasi)
                                  │   └─ pattern.ts    (P1: multi-foto → pola hidup)
                                  ├─ sanitize/      (canvas: strip metadata, blur bbox)
                                  └─ report/        (view + print CSS)
Hosting statis (Netlify / Vercel / GitHub Pages) + CSP header
```

## 2. Struktur Repo
```
perisai-opsec/
├─ AGENTS.md
├─ README.md
├─ docs/                (dokumen ini)
├─ public/
│   └─ tessdata/        (ind.traineddata, eng.traineddata — dihosting lokal)
├─ src/
│   ├─ app/             (routing, layout)
│   ├─ components/
│   ├─ engine/          (fungsi murni, tanpa React)
│   ├─ data/            (kamus-satuan.json, kamus-lokasi.json, kamus-pergerakan.json, aturan-identitas.json, profil.json)
│   ├─ sanitize/
│   ├─ store/
│   ├─ types/
│   └─ utils/
├─ tests/
│   ├─ fixtures/        (gambar & teks sintetis + expected.json)
│   └─ engine/
├─ netlify.toml / vercel.json  (header CSP)
└─ package.json
```

## 3. Tipe Data Kunci (src/types)
```ts
export type Severity = 'info' | 'low' | 'medium' | 'high' | 'critical';
export type Category = 'lokasi' | 'identitas' | 'operasional' | 'teknis';
export type Source = 'metadata' | 'ocr' | 'caption' | 'combo';

export interface Finding {
  id: string;
  ruleId: string;
  category: Category;
  severity: Severity;
  source: Source;
  evidence: string;        // potongan teks/nilai yang memicu
  reason: string;          // penjelasan bahasa awam
  recommendation: string;  // tindakan
  bbox?: { x0: number; y0: number; x1: number; y1: number }; // piksel gambar asli
  range?: { start: number; end: number };                   // posisi di caption
}

export interface Score { value: number; level: 'Aman'|'Waspada'|'Tinggi'|'Kritis'; findings: Finding[]; }
export type Profile = 'prajurit' | 'keluarga' | 'satuan';

export interface Analysis {
  fileId: string; fileName: string;
  exif?: { lat?: number; lon?: number; takenAt?: string; make?: string; model?: string; /*...*/ };
  ocrWords?: { text: string; conf: number; bbox: BBox }[];
  caption?: string;
  score: Score;
}
```

## 4. Alur Data (satu foto)
1. `ingest` membaca `File` → ArrayBuffer → deteksi tipe.
2. `metadata.ts` (exifr) → Finding[] sumber `metadata`.
3. `ocr.worker.ts` (tesseract `ind+eng`) → kata + bbox. Gambar besar di-downscale ke sisi panjang ≤ 2400 px untuk OCR, bbox dikonversi ke skala asli.
4. `rules.ts` menjalankan kamus terhadap teks OCR dan caption → Finding[].
5. `combos.ts` menambah temuan sintetis bila ≥3 kategori operasional muncul.
6. `scoring.ts` menghitung skor sesuai PRD §7 dengan profil terpilih.
7. UI menampilkan hasil; `sanitize/` membuat versi aman: gambar digambar ulang ke canvas (otomatis menghapus EXIF), area bbox temuan di-blur/dihitamkan, ekspor `toBlob('image/jpeg')`.

## 5. Keputusan Teknis & Alasan
| Keputusan | Alasan |
|---|---|
| Client-side only | Nilai jual privasi; hosting gratis; demo tanpa kegagalan server |
| exifr | Ringan, cepat, mendukung GPS & banyak format, lisensi MIT |
| tesseract.js dengan tessdata lokal | OCR offline ind+eng; tanpa kirim gambar |
| Canvas re-encode untuk strip metadata | Metode paling andal: piksel baru tanpa metadata asli |
| Kamus JSON | Mudah diedit satuan; mudah di-test |
| Noisy-OR scoring | Transparan, bisa dijelaskan ke juri, tidak mudah jenuh |
| Leaflet + OSM tiles | Gratis, tanpa API key. Tile adalah satu-satunya permintaan eksternal (hanya gambar, tanpa data pengguna). Fallback: tampilkan koordinat bila offline |
| HEIC | Coba `heic2any` (MIT) hanya bila waktu cukup; jika tidak, pesan "ubah ke JPG" (P2) |

## 6. Keamanan & Privasi
- Header CSP (contoh): `default-src 'self'; img-src 'self' data: blob: https://*.tile.openstreetmap.org; script-src 'self' 'wasm-unsafe-eval'; worker-src 'self' blob:; connect-src 'self'; style-src 'self' 'unsafe-inline'`
- Tidak ada cookie, localStorage hanya untuk preferensi non-sensitif (profil, kamus kustom).
- Hasil analisis hanya di memori; tombol "Hapus semua data sesi".
- Fitur AI (P2) di balik toggle eksplisit; saat aktif, tampilkan peringatan bahwa data meninggalkan perangkat dan tier gratis dapat dipakai penyedia untuk pelatihan. Kunci API disimpan hanya di memori sesi.
- Sanitasi output: nama file hasil tidak memuat info asli.

## 7. Pengujian
- **Unit (Vitest):** rules, scoring, combos, parser GPS, pola hidup. Fixture di `tests/fixtures`.
- **Integrasi:** alur gambar sintetis → temuan yang diharapkan (`expected.json`).
- **E2E ringan (Playwright, opsional):** unggah → skor muncul → unduh versi aman → verifikasi tidak ada EXIF pada hasil.
- **Verifikasi privasi:** DevTools Network saat analisis = 0 permintaan data (selain tile).

## 8. Deployment
- Build: `npm run build` → `dist/`.
- Hosting: Netlify/Vercel/GitHub Pages (gratis). Wajib URL publik stabil sebelum 13 Nov.
- Siapkan juga arsip ZIP `dist/` + README sebagai alternatif "link download" untuk juri.
- Pastikan header CSP aktif di hosting (netlify.toml / vercel.json).

## 9. Daftar Dependency (terkunci)
`react`, `react-dom`, `typescript`, `vite`, `tailwindcss`, `zustand`, `exifr`, `tesseract.js`, `leaflet` (+ `react-leaflet`), `vitest`, `@testing-library/react`, `eslint`, `prettier`. Opsional: `playwright`, `heic2any`. Penambahan lain wajib dicatat di Decision Log beserta lisensinya.
