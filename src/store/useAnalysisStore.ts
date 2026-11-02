import { create } from 'zustand';
import { AnalysisFile, Profile } from '../types';
import { readMetadataFromFile } from '../engine/metadata';
import { calculateScore } from '../engine/scoring';

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
    set({ activeProfile: profile });
    // Recalculate scores for all analyzed files with new profile
    const { files } = get();
    const updated = files.map((file) => {
      if (file.score) {
        const recalculated = calculateScore(file.score.findings, profile);
        return { ...file, score: recalculated };
      }
      return file;
    });
    set({ files: updated });
  },

  clearAll: () => {
    const { files } = get();
    files.forEach((f) => {
      if (f.previewUrl) URL.revokeObjectURL(f.previewUrl);
    });
    set({ files: [], activeFileId: null });
  },

  analyzeFile: async (id: string) => {
    const { files, activeProfile } = get();
    const target = files.find((f) => f.id === id);
    if (!target) return;

    set((state) => ({
      files: state.files.map((f) =>
        f.id === id ? { ...f, status: 'analyzing' } : f
      ),
    }));

    try {
      // 1. Read EXIF metadata
      const { exif, findings } = await readMetadataFromFile(target.file);

      // 2. Calculate score
      const score = calculateScore(findings, activeProfile);

      set((state) => ({
        files: state.files.map((f) =>
          f.id === id
            ? {
                ...f,
                exif,
                score,
                status: 'done',
              }
            : f
        ),
      }));
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal menganalisis berkas';
      set((state) => ({
        files: state.files.map((f) =>
          f.id === id
            ? {
                ...f,
                status: 'error',
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
