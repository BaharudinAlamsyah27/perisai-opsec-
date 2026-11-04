import { create } from 'zustand';
import type { DikEntry } from '../engine/dik';

interface DikState {
  entries: DikEntry[];
  setEntries: (entries: DikEntry[]) => void;
}

export const useDikStore = create<DikState>((set) => ({
  entries: [],
  setEntries: (entries) => set({ entries }),
}));
