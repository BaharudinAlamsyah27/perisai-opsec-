import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { PrivacyBanner } from '../../src/components/PrivacyBanner';

describe('PrivacyBanner', () => {
  it('keeps the summary compact and reveals the privacy details on request', () => {
    render(<PrivacyBanner />);
    const toggle = screen.getByRole('button', { name: 'Detail' });
    expect(screen.getByText('Diproses 100% di perangkat Anda. Tanpa unggah.')).toBeInTheDocument();
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById('privacy-details')?.hidden).toBe(true);

    fireEvent.click(toggle);
    expect(screen.getByRole('button', { name: 'Tutup' })).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Foto dan analisis diproses di perangkat/)).toBeInTheDocument();
    expect(screen.getByText('Pekerja web')).toBeInTheDocument();
    expect(screen.getByText('Siap tanpa internet')).toBeInTheDocument();
    expect(screen.getByText('Peta atas izin')).toBeInTheDocument();
  });
});
