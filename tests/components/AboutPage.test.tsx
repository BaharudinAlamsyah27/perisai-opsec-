import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { AboutPage } from '../../src/pages/AboutPage';

describe('AboutPage', () => {
  it('renders generated dependency licenses and the required declarations', () => {
    const { container } = render(<AboutPage />);
    const pageText = container.textContent ?? '';
    expect(pageText).toContain('Daftar dependency dari package.json');
    expect(pageText).toContain('react v18.3.1');
    expect(pageText).toContain('Deklarasi AI');
    expect(pageText).toContain('Pemeriksaan Metadata Foto');
    expect(pageText).toContain('Sumber Terbuka');
    expect(pageText).not.toContain('AI coding assistant');
    expect(pageText).toContain('semua foto contoh di aplikasi dibuat secara sintetis');
  });
});
