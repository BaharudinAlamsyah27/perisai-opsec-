import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const project = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'));
const names = [...new Set([...Object.keys(project.dependencies ?? {}), ...Object.keys(project.devDependencies ?? {})])].sort((a, b) => a.localeCompare(b));
const dependencies = [];

for (const name of names) {
  const packagePath = join(root, 'node_modules', ...name.split('/'), 'package.json');
  try {
    const metadata = JSON.parse(await readFile(packagePath, 'utf8'));
    const license = typeof metadata.license === 'string' ? metadata.license
      : Array.isArray(metadata.licenses) ? metadata.licenses.map((item) => item.type).filter(Boolean).join(' OR ')
        : 'Tidak dinyatakan';
    dependencies.push({ name, version: metadata.version ?? 'unknown', license });
  } catch {
    dependencies.push({ name, version: 'tidak ditemukan di node_modules', license: 'Tidak diketahui' });
  }
}

const output = {
  generatedFrom: 'package.json dan node_modules',
  dependencies,
  bundledAssets: [
    { name: 'Tesseract.js traineddata (eng, ind)', license: 'Apache-2.0', source: 'tessdata_fast; aset lokal di public/tessdata' },
    { name: 'OpenStreetMap tiles', license: 'ODbL', source: 'Diminta hanya setelah opt-in peta oleh pengguna' },
  ],
};
await writeFile(join(root, 'src', 'data', 'licenses.json'), `${JSON.stringify(output, null, 2)}\n`);
console.log(`Menulis ${dependencies.length} lisensi dependency ke src/data/licenses.json`);
