import { describe, expect, it } from 'vitest';
import { getQuickFileFingerprint, sameQuickFileFingerprint } from '../../src/utils/quickFileFingerprint';

describe('quick local file fingerprint', () => {
  it('matches same name, size, and sampled bytes regardless of case', async () => {
    const first = new File(['synthetic image data'], 'Foto.PNG');
    const second = new File(['synthetic image data'], 'foto.png');

    expect(sameQuickFileFingerprint(
      await getQuickFileFingerprint(first),
      await getQuickFileFingerprint(second)
    )).toBe(true);
  });

  it('does not match when sampled bytes differ', async () => {
    const first = new File(['synthetic image data A'], 'Foto.PNG');
    const second = new File(['synthetic image data B'], 'Foto.PNG');

    expect(sameQuickFileFingerprint(
      await getQuickFileFingerprint(first),
      await getQuickFileFingerprint(second)
    )).toBe(false);
  });
});
