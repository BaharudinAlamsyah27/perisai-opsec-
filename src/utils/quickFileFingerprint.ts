async function readBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === 'function') return blob.arrayBuffer();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => reader.result instanceof ArrayBuffer
      ? resolve(reader.result)
      : reject(new Error('Tidak dapat membaca sampel berkas'));
    reader.onerror = () => reject(reader.error ?? new Error('Tidak dapat membaca sampel berkas'));
    reader.readAsArrayBuffer(blob);
  });
}

export interface QuickFileFingerprint {
  normalizedName: string;
  size: number;
  hash: string;
}

/** Hashes the first and last 32 KiB plus file size for a quick local duplicate check. */
export async function getQuickFileFingerprint(file: File): Promise<QuickFileFingerprint> {
  const sampleSize = Math.min(8 * 1024, file.size);
  const sampleOffsets = file.size <= sampleSize
    ? [0]
    : [0, Math.floor(file.size / 3), Math.floor(file.size / 2), Math.floor((file.size * 2) / 3), file.size - sampleSize];
  const samples = await Promise.all(sampleOffsets.map(async (offset) =>
    new Uint8Array(await readBytes(file.slice(offset, Math.min(file.size, offset + sampleSize))))
  ));

  let hash = 0x811c9dc5;
  for (const sample of samples) {
    for (const byte of sample) {
      hash ^= byte;
      hash = Math.imul(hash, 0x01000193);
    }
  }

  return {
    normalizedName: file.name.trim().toLocaleLowerCase('id-ID'),
    size: file.size,
    hash: (hash >>> 0).toString(16).padStart(8, '0'),
  };
}

export function sameQuickFileFingerprint(
  left: QuickFileFingerprint,
  right: QuickFileFingerprint
): boolean {
  return left.normalizedName === right.normalizedName
    && left.size === right.size
    && left.hash === right.hash;
}
