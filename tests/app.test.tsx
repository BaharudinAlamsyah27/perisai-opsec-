import { describe, it, expect } from 'vitest';
import { fireEvent, render, screen, within } from '@testing-library/react';
import App from '../src/App';

describe('App Smoke Test', () => {
  it('renders the compact header, privacy summary, and footer navigation', () => {
    render(<App />);
    expect(screen.getAllByText(/PERISAI/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/OPSEC/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Periksa sebelum unggah.')).toBeInTheDocument();
    expect(screen.queryAllByText(/100%.*(lokal|perangkat)/i).length).toBeLessThanOrEqual(2);
    const trigger = screen.getByRole('button', { name: 'Menu' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    fireEvent.click(trigger);
    const navigation = within(screen.getByRole('menu', { name: 'Navigasi utama' }));
    expect(navigation.getByRole('menuitem', { name: /Pola Hidup/i })).toBeInTheDocument();
    expect(navigation.getByRole('menuitem', { name: /Daftar Kritis/i })).toBeInTheDocument();
    expect(navigation.getByRole('menuitem', { name: /Privasi/i })).toBeInTheDocument();
    expect(navigation.getByRole('menuitem', { name: /Tentang/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privasi' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Tentang' })).toBeInTheDocument();
    expect(screen.getByText('Diproses 100% di perangkat Anda. Tanpa unggah.')).toBeInTheDocument();
  });
});
