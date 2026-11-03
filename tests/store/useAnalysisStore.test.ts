import { afterEach, describe, expect, it } from 'vitest';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';
import type { AnalysisFile, Finding } from '../../src/types';

const operationalFinding: Finding = {
  id: 'fixture-time',
  ruleId: 'fixture-time',
  category: 'operasional',
  severity: 'medium',
  source: 'caption',
  evidence: 'besok pagi',
  reason: 'Waktu dapat mengungkap jadwal.',
  recommendation: 'Hapus waktu spesifik.',
};

describe('analysis profile score logs', () => {
  afterEach(() => useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit' }));

  it('records the recalculated score whenever the selected profile changes', () => {
    const file: AnalysisFile = {
      id: 'test-file',
      file: new File(['synthetic'], 'fixture.png'),
      previewUrl: 'blob:fixture',
      name: 'fixture.png',
      size: 9,
      type: 'image/png',
      status: 'done',
      score: { value: 24, level: 'Aman', findings: [operationalFinding] },
      logs: [],
    };
    useAnalysisStore.setState({ files: [file], activeFileId: file.id, activeProfile: 'prajurit' });

    useAnalysisStore.getState().setActiveProfile('keluarga');

    const updated = useAnalysisStore.getState().files[0];
    expect(updated.score?.value).toBe(26);
    const lastLog = updated.logs?.[updated.logs.length - 1];
    expect(lastLog?.message).toContain('Profil diganti ke Keluarga. Skor risiko: 26/100');
    expect(useAnalysisStore.getState().activeProfile).toBe('keluarga');
  });
});
