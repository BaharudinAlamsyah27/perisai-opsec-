export const DEMO_SAMPLE_NAMES = [
  '03_papan_satuan_nrp.jpg',
  '04_dokumen_rahasia.jpg',
  '05_plat_nomor_sah.jpg',
  '02_gps_saja.jpg',
  '01_foto_bersih.jpg',
] as const;

export const PATTERN_SAMPLE_NAMES = [
  '11_pola_A_11-02.jpg', '12_pola_B_11-02.jpg',
  '13_pola_A_11-03.jpg', '14_pola_B_11-03.jpg',
  '15_pola_A_11-04.jpg', '16_pola_B_11-04.jpg',
  '17_pola_C_11-04.jpg', '18_pola_A_11-05.jpg',
] as const;

export async function fetchPublicSamples(names: readonly string[]): Promise<File[]> {
  try {
    const files: File[] = [];
    for (const name of names) {
      try {
        const response = await fetch(`${import.meta.env.BASE_URL}samples/${name}`);
        if (response.ok) {
          const blob = await response.blob();
          files.push(new File([blob], name, { type: 'image/jpeg' }));
        } else {
          console.warn(`File contoh ${name} tidak dapat dimuat: HTTP ${response.status}`);
        }
      } catch (err) {
        console.warn(`Gagal memuat file contoh ${name}:`, err);
      }
    }
    return files;
  } catch (err) {
    console.warn('Gagal memuat sampel foto:', err);
    return [];
  }
}

export async function fetchMissingPatternSamples(existingNames: readonly string[]): Promise<File[]> {
  try {
    const missingNames = PATTERN_SAMPLE_NAMES.filter((name) => !existingNames.includes(name));
    return missingNames.length > 0 ? await fetchPublicSamples(missingNames) : [];
  } catch (err) {
    console.warn('Gagal memuat sampel pola:', err);
    return [];
  }
}
