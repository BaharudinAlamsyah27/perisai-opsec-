import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LeafletMap } from '../../src/components/LeafletMap';

describe('LeafletMap Component', () => {
  it('renders opt-in panel with coordinates by default (no tile request)', () => {
    render(<LeafletMap latitude={-7.5561} longitude={110.8316} />);
    // Koordinat teks harus tampil
    expect(screen.getByTestId('map-optin-panel')).toBeDefined();
    // Tombol opt-in harus ada
    expect(screen.getByTestId('map-enable-button')).toBeDefined();
    // Teks koordinat harus ada
    expect(screen.getByText(/-7\.556100,\s*110\.831600/i)).toBeDefined();
  });

  it('does NOT render active map panel until button is clicked', () => {
    render(<LeafletMap latitude={-7.5561} longitude={110.8316} />);
    expect(screen.queryByTestId('map-active-panel')).toBeNull();
  });

  it('renders active map panel after clicking enable button', () => {
    render(<LeafletMap latitude={-7.5561} longitude={110.8316} />);
    const btn = screen.getByTestId('map-enable-button');
    fireEvent.click(btn);
    expect(screen.getByTestId('map-active-panel')).toBeDefined();
  });

  it('shows warning about OSM area disclosure before opt-in', () => {
    render(<LeafletMap latitude={-7.5561} longitude={110.8316} />);
    expect(screen.getByText(/area kasar lokasi/i)).toBeDefined();
  });
});
