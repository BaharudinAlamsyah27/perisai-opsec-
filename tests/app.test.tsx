import { describe, it, expect } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import App from '../src/App';

describe('App Smoke Test', () => {
  it('renders application title and navigation items', () => {
    render(<App />);
    expect(screen.getAllByText(/PERISAI/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/OPSEC/i)[0]).toBeInTheDocument();
    expect(screen.getByText('Periksa sebelum unggah.')).toBeInTheDocument();
    expect(screen.queryAllByText(/100%.*(lokal|perangkat)/i).length).toBeLessThanOrEqual(2);
    const navigation = within(screen.getByRole('navigation'));
    expect(navigation.getByRole('button', { name: /Analisis/i })).toBeInTheDocument();
    expect(navigation.getByRole('button', { name: /Pola Hidup/i })).toBeInTheDocument();
    expect(navigation.getByRole('button', { name: /Privasi/i })).toBeInTheDocument();
    expect(navigation.getByRole('button', { name: /Tentang/i })).toBeInTheDocument();
  });
});
