import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { ResultsPanel } from '../../src/components/ResultsPanel';
import type { AnalysisFile } from '../../src/types';
import { useAnalysisStore } from '../../src/store/useAnalysisStore';

const file: AnalysisFile = {
  id: 'weights-fixture',
  file: new File(['synthetic'], 'weights.png'),
  previewUrl: 'blob:weights',
  name: 'weights.png',
  size: 9,
  type: 'image/png',
  status: 'done',
  score: { value: 0, level: 'Aman', findings: [] },
};

describe('profile weight tooltips', () => {
  it('shows the four category weights from the scoring profiles', () => {
    useAnalysisStore.setState({ files: [file], activeFileId: file.id, activeProfile: 'prajurit' });
    render(<ResultsPanel file={file} />);

    const tooltips = screen.getAllByRole('tooltip');
    expect(tooltips[0].textContent).toContain('Lokasi 1.0×, Identitas 1.2×, Operasional 1.2×, Teknis 1.0×');
    expect(tooltips[1].textContent).toContain('Lokasi 1.1×, Identitas 1.0×, Operasional 1.3×, Teknis 1.0×');
    expect(tooltips[2].textContent).toContain('Lokasi 1.3×, Identitas 1.0×, Operasional 1.2×, Teknis 1.0×');
  });
});
