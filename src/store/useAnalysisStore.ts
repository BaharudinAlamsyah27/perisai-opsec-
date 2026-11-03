import { create } from 'zustand';
import { AnalysisFile, Profile, Finding, OcrWord, AnalysisLog } from '../types';
import { readMetadataFromFile } from '../engine/metadata';
import { calculateScore } from '../engine/scoring';
import { runOcr } from '../engine/ocr';
import { analyzeText } from '../engine/rules';
import { mapOcrWordsToFindings } from '../engine/ocr-mapper';
import { applyComboBoost } from '../engine/combos';
import { getOcrOutcome } from '../engine/ocrOutcome';
import { buildOcrTextTokens } from '../engine/rules';

interface AnalysisState {
  files: AnalysisFile[];
  activeFileId: string | null;
  activeProfile: Profile;
  addFiles: (newFiles: File[]) => void;
  removeFile: (id: string) => void;
  setActiveFileId: (id: string) => void;
  setActiveProfile: (profile: Profile) => void;
  clearAll: () => void;
  analyzeFile: (id: string) => Promise<void>;
  analyzeAll: () => Promise<void>;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  files: [],
  activeFileId: null,
  activeProfile: 'prajurit',

  addFiles: (newFiles: File[]) => {
    const currentFiles = get().files;
    const addedAnalysisFiles: AnalysisFile[] = newFiles.map((f) => ({
      id: `${f.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      file: f,
      name: f.name,
      size: f.size,
      type: f.type,
      previewUrl: URL.createObjectURL(f),
      status: 'idle',
    }));

    const updated = [...currentFiles, ...addedAnalysisFiles];
    set({
      files: updated,
      activeFileId: get().activeFileId || (addedAnalysisFiles[0]?.id ?? null),
    });

    // Auto trigger analysis for new files
    addedAnalysisFiles.forEach((item) => {
      get().analyzeFile(item.id);
    });
  },

  removeFile: (id: string) => {
    const { files, activeFileId } = get();
    const target = files.find((f) => f.id === id);
    if (target?.previewUrl) {
      URL.revokeObjectURL(target.previewUrl);
    }
    const remaining = files.filter((f) => f.id !== id);
    set({
      files: remaining,
      activeFileId: activeFileId === id ? (remaining[0]?.id ?? null) : activeFileId,
    });
  },

  setActiveFileId: (id: string) => set({ activeFileId: id }),

  setActiveProfile: (profile: Profile) => {
    const previousProfile = get().activeProfile;
    if (profile === previousProfile) return;

    // Recalculate scores for all analyzed files with new profile
    const { files } = get();
    const updated = files.map((file) => {
      const recalculated = file.score ? calculateScore(file.score.findings, profile) : undefined;
      const now = new Date();
      const timestamp = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      const profileName = profile === 'prajurit' ? 'Prajurit' : profile === 'keluarga' ? 'Keluarga' : 'Satuan';
      const log: AnalysisLog = {
        timestamp,
        source: 'SYSTEM',
        message: recalculated
          ? `Profil diganti ke ${profileName}. Skor risiko: ${recalculated.value}/100 (${recalculated.level}).`
          : `Profil diganti ke ${profileName}. Skor dihitung dengan profil aktif saat analisis selesai.`,
        level: recalculated && recalculated.value >= 50 ? 'crit' : recalculated && recalculated.value >= 25 ? 'warn' : 'info',
      };
      return {
        ...file,
        ...(recalculated ? { score: recalculated } : {}),
        logs: [...(file.logs ?? []), log],
      };
    });
    set({ activeProfile: profile, files: updated });
  },

  clearAll: () => {
    const { files } = get();
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    set({ files: [], activeFileId: null });
  },

  analyzeFile: async (id: string) => {
    const { files } = get();
    const target = files.find((f) => f.id === id);
    if (!target) return;

    const logs: AnalysisLog[] = [];
    const addLog = (source: AnalysisLog['source'], message: string, level: AnalysisLog['level'] = 'info') => {
      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}.${String(now.getMilliseconds()).padStart(3, '0')}`;
      logs.push({ timestamp: timeStr, source, message, level });
    };

    addLog('SYSTEM', `Memulai analisis berkas ${target.name} (${Math.round(target.size / 1024)} KB)`);

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: 'analyzing', logs: [...logs] } : f
      ),
    }));

    try {
      // 1. Read EXIF metadata
      addLog('EXIF', 'Mengekstrak metadata EXIF (GPS, waktu, perangkat)...');
      const { exif, findings: exifFindings } = await readMetadataFromFile(target.file);

      if (exif.latitude !== undefined && exif.longitude !== undefined) {
        addLog('EXIF', `GPS Terdeteksi: ${exif.latitude.toFixed(5)}, ${exif.longitude.toFixed(5)}`, 'crit');
      } else {
        addLog('EXIF', 'Tidak ditemukan koordinat GPS pada metadata berkas.');
      }

      if (exifFindings.length > 0) {
        addLog('EXIF', `${exifFindings.length} potensi kebocoran metadata ditemukan.`, 'warn');
      }

      // Update intermediate metadata findings
      let currentFindings: Finding[] = [...exifFindings];

      // 2. OCR text recognition with progress
      addLog('OCR', 'Memulai engine OCR WebWorker lokal (bahasa ind+eng)...');
      let ocrWords: OcrWord[] = [];
      const ocrResult = await runOcr(target.file, (percent) => {
        set((state) => ({
          files: state.files.map((f) =>
            f.id === id ? { ...f, ocrProgress: percent } : f
          ),
        }));
      });

      const ocrOutcome = getOcrOutcome(ocrResult);
      if (ocrOutcome === 'error') {
        addLog('OCR', `OCR GAGAL (ERROR TEKNIS): ${ocrResult.error}`, 'crit');
      }

      if (ocrOutcome === 'recognized') {
        ocrWords = ocrResult.words;
        addLog('OCR', `${ocrWords.length} kata berhasil diekstraksi dari visual foto.`);
        // Run opsec rules on recognized OCR text
        const ocrText = buildOcrTextTokens(ocrWords);
        addLog('RULES', 'Mengevaluasi teks hasil OCR terhadap katalog aturan OPSEC militer...');
        const ocrFindings = analyzeText(ocrText.text, 'ocr', ocrText.tokens);

        // Map bbox from OCR words to findings
        const mappedOcrFindings = mapOcrWordsToFindings(ocrWords, ocrFindings);
        currentFindings = [...currentFindings, ...mappedOcrFindings];
        addLog('RULES', `${mappedOcrFindings.length} temuan aturan cocok pada teks OCR.`, mappedOcrFindings.length > 0 ? 'warn' : 'info');
      } else if (ocrOutcome === 'empty') {
        addLog('OCR', 'OCR berhasil; tidak ada teks yang dikenali pada gambar.');
      }

      // 3. Apply Combo Boost (Pola Penugasan co-occurrence)
      addLog('COMBO', 'Memeriksa korelasi ko-okurensi grup operasional...');
      const boostedFindings = applyComboBoost(currentFindings);
      const comboFound = boostedFindings.find((f) => f.ruleId === 'combo-pola-penugasan');
      if (comboFound) {
        addLog('COMBO', 'Peringatan: Pola Penugasan Terbaca! Korelasi >=3 kelompok operasional teridentifikasi.', 'crit');
      } else {
        addLog('COMBO', 'Tidak ada anomali kombinasi pola penugasan.');
      }

      // 4. Calculate final deterministic score
      const profile = get().activeProfile;
      const score = calculateScore(boostedFindings, profile);
      addLog('SYSTEM', `Analisis selesai. Profil: ${profile}. Skor risiko: ${score.value}/100 (${score.level}).`, score.value >= 50 ? 'crit' : score.value >= 25 ? 'warn' : 'info');

      set((state) => ({
        files: state.files.map((f) =>
          f.id === id
            ? {
                ...f,
                exif,
                ocrWords,
                ocrProgress: 100,
                score,
                logs: [
                  ...logs,
                  ...(f.logs ?? []).filter((log) =>
                    log.message.startsWith('Profil diganti ke ')
                    && !logs.some((analysisLog) => analysisLog.timestamp === log.timestamp && analysisLog.message === log.message)
                  ),
                ],
                status: 'done',
              }
            : f
        ),
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menganalisis berkas';
      addLog('SYSTEM', `Kesalahan analisis: ${errorMsg}`, 'crit');
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'error',
                logs: [...logs],
                errorMessage: errorMsg,
              }
            : f
        ),
      }));
    }
  },

  analyzeAll: async () => {
    const { files } = get();
    for (const f of files) {
      if (f.status === 'idle') {
        await get().analyzeFile(f.id);
      }
    }
  },
}));

