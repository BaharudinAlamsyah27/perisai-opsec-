import { afterEach, describe, expect, it } from 'vitest';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';
import { analyzeText } from '../../src/engine/rules';
import { applyComboBoost } from '../../src/engine/combos';
import { calculateScore } from '../../src/engine/scoring';
import type { AnalysisFile } from '../../src/types';

const fileId = 'controls-test';

function makeFile(): AnalysisFile {
  const findings = analyzeText('10.2.3.4 localhost:3000', 'caption');
  return {
    id: fileId, file: {} as File, previewUrl: '', name: 'uji.jpg', size: 1, type: 'image/jpeg', status: 'done',
    score: calculateScore(applyComboBoost(findings)),
  };
}

afterEach(() => useAnalysisStore.setState({ files: [], activeFileId: null, activeProfile: 'prajurit' }));

describe('per-session analyst controls', () => {
  it('ignores a finding from the score and restores it with the score recalculated', () => {
    const initial = makeFile();
    const originalScore = initial.score?.value;
    const idToIgnore = initial.score?.findings.find((finding) => finding.ruleId === 'technical-ipv4')?.id;
    expect(idToIgnore).toBeDefined();
    useAnalysisStore.setState({ files: [initial], activeFileId: fileId });

    useAnalysisStore.getState().ignoreFinding(fileId, idToIgnore as string, 'Contoh alasan');
    const ignored = useAnalysisStore.getState().files[0];
    expect(ignored.ignoredFindings).toHaveLength(1);
    expect(ignored.score?.findings.some((finding) => finding.id === idToIgnore)).toBe(false);
    expect(ignored.score?.value).toBeLessThan(originalScore ?? 0);
    expect(ignored.ignoredFindings?.[0]?.ignoredReason).toBe('Contoh alasan');

    useAnalysisStore.getState().restoreFinding(fileId, idToIgnore as string);
    const restored = useAnalysisStore.getState().files[0];
    expect(restored.ignoredFindings).toHaveLength(0);
    expect(restored.score?.value).toBe(originalScore);
  });

  it('applies corrected OCR as a source without bbox', () => {
    const initial = makeFile();
    useAnalysisStore.setState({ files: [initial], activeFileId: fileId });
    useAnalysisStore.getState().applyOcrCorrection(fileId, 'password: RahasiaFiktif29');
    const corrected = useAnalysisStore.getState().files[0];
    const finding = corrected.score?.findings.find((item) => item.source === 'correction');
    expect(finding?.ruleId).toBe('technical-password');
    expect(finding?.bbox).toBeUndefined();
    expect(finding?.evidence).not.toContain('RahasiaFiktif29');
    expect(corrected.correctedOcrText).not.toContain('RahasiaFiktif29');
  });
});
