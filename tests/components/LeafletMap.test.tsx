import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { LeafletMap } from '../../src/components/LeafletMap';

describe('LeafletMap Component', () => {
  it('renders coordinate badge and container without throwing', () => {
    const { getAllByText } = render(
      <LeafletMap latitude={-7.5561} longitude={110.8316} />
    );
    expect(getAllByText(/-7.556100, 110.831600/i).length).toBeGreaterThanOrEqual(1);
  });
});
