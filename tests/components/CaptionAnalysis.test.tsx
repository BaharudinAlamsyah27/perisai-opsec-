import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { CaptionAnalysis } from '../../src/components/CaptionAnalysis';
import { useCaptionStore } from '../../src/store/useCaptionStore';

describe('caption analysis', () => {
  beforeEach(() => useCaptionStore.setState({ caption: '' }));
  it('highlights operational details and presents safe writing suggestions', () => {
    render(<CaptionAnalysis />);
    fireEvent.change(screen.getByLabelText(/TEMPEL ATAU KETIK/), { target: { value: 'Besok jam 05.00 berangkat ke pos perbatasan bersama Yonif 999' } });
    expect(screen.getAllByRole('mark').length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText(/SARAN PENULISAN ULANG AMAN/)).toBeInTheDocument();
    expect(screen.getByText(/KEBOCORAN TERDETEKSI/)).toBeInTheDocument();
  });

  it('marks a safe caption as safe without inline findings', () => {
    render(<CaptionAnalysis />);
    fireEvent.change(screen.getByLabelText(/TEMPEL ATAU KETIK/), { target: { value: 'Selamat pagi, semangat!' } });
    expect(screen.getByText('TIDAK ADA KECOCOKAN ATURAN')).toBeInTheDocument();
    expect(screen.queryByRole('mark')).not.toBeInTheDocument();
    expect(screen.queryByText(/SARAN PENULISAN ULANG AMAN/)).not.toBeInTheDocument();
  });
});
