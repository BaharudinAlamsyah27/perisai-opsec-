import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { FindingCard } from '../../src/components/FindingCard';
import { ScanOverlay } from '../../src/components/ScanOverlay';
import type { Finding } from '../../src/types';

const finding: Finding = {
  id: 'ocr-unit-1', ruleId: 'opr-satuan', category: 'operasional', severity: 'high', source: 'ocr',
  evidence: 'YONIF 999 (keyakinan 91%)', reason: 'Nama satuan dapat membuka identitas unit.',
  recommendation: 'Samarkan nama satuan.', bbox: { x0: 10, y0: 20, x1: 70, y1: 40 },
};

describe('photo and finding interactions', () => {
  it('highlights the matching bbox on hover and opens its card on click', () => {
    const onHover = vi.fn();
    const onSelect = vi.fn();
    render(<ScanOverlay isScanning={false} findings={[finding]} imageWidth={100} imageHeight={100} onHoverFinding={onHover} onSelectFinding={onSelect} />);
    const bbox = screen.getByRole('button', { name: /Buka temuan YONIF 999/ });
    fireEvent.mouseEnter(bbox);
    expect(onHover).toHaveBeenCalledWith(finding.id);
    fireEvent.click(bbox);
    expect(onSelect).toHaveBeenCalledWith(finding.id);
  });

  it('opens finding details with keyboard and signals hover back to the photo', () => {
    const onHover = vi.fn();
    render(<FindingCard finding={finding} compact onHover={onHover} />);
    const card = screen.getByRole('button', { name: /YONIF 999/ });
    fireEvent.mouseEnter(card);
    expect(onHover).toHaveBeenCalledWith(finding.id);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(card).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText('Samarkan nama satuan.')).toBeInTheDocument();
  });

  it('marks DIK findings with their source list label', () => {
    render(<FindingCard finding={{ ...finding, id: 'dik-1', ruleId: 'dik-kode-1', bbox: undefined }} />);
    expect(screen.getByText('Dari Daftar Informasi Kritis')).toBeInTheDocument();
  });
});
