import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createWorker, PSM } from 'tesseract.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const imagePath = path.join(root, 'tests', 'fixtures', 'dataset-tambahan', '19_screenshot_teknis.png');
const tessdataPath = pathToFileURL(path.join(root, 'public', 'tessdata') + path.sep).href;

function redact(text) {
  return text
    .replace(/(?<![A-Z0-9])(password|passwd|pwd|pass|kata[\s_-]*sandi|sandi)\s*[-:=–—]\s*([^\s,;]+)/gi, (_all, label, value) => `${label}: ${value.slice(0, 2)}••••`)
    .replace(/(?<![A-Z0-9])(api[\s_-]*(?:key|token)|token|secret|bearer)\s*[-:=–—]+\s*([A-Z0-9._~+/-]+(?:\s*[- ]\s*[A-Z0-9._~+/-]+){0,4})/gi, (_all, label, value) => `${label}: ${value.slice(0, 2)}••••`);
}

function summarize(data) {
  const words = (data.blocks ?? []).flatMap((block) => (block.paragraphs ?? []).flatMap((paragraph) => (paragraph.lines ?? []).flatMap((line) => line.words ?? [])));
  const confidences = words.map((word) => Number(word.confidence ?? 0));
  const average = confidences.length ? confidences.reduce((sum, value) => sum + value, 0) / confidences.length : 0;
  return {
    count: words.length,
    average: Number(average.toFixed(1)),
    passed: words.filter((word) => Number(word.confidence ?? 0) >= 70),
    words,
  };
}

function safePassedWords(summary) {
  return summary.passed.map((word) => {
    const centerY = ((word.bbox?.y0 ?? 0) + (word.bbox?.y1 ?? 0)) / 2;
    const line = summary.words
      .filter((candidate) => {
        const candidateY = ((candidate.bbox?.y0 ?? 0) + (candidate.bbox?.y1 ?? 0)) / 2;
        return Math.abs(candidateY - centerY) <= Math.max(14, ((word.bbox?.y1 ?? 0) - (word.bbox?.y0 ?? 0)) * 0.7);
      })
      .sort((a, b) => (a.bbox?.x0 ?? 0) - (b.bbox?.x0 ?? 0));
    const lineText = line.map((item) => item.text).join(' ');
    const isCredentialLine = /(?:password|passwd|pwd|pass|kata[\s_-]*sandi|sandi|api[\s_-]*(?:key|token)|token|secret|bearer)/i.test(lineText);
    return isCredentialLine ? '[baris kredensial disamarkan]' : word.text;
  });
}

let worker;
try {
  worker = await createWorker(['ind', 'eng'], 1, {
    corePath: tessdataPath,
    langPath: tessdataPath,
    gzip: false,
    logger: () => {},
  });

  for (const [name, psm] of [['input asli · PSM 6', PSM.SINGLE_BLOCK], ['input asli · PSM 11', PSM.SPARSE_TEXT]]) {
    await worker.setParameters({ tessedit_pageseg_mode: psm });
    const result = await worker.recognize(imagePath, {}, { text: true, blocks: true });
    const summary = summarize(result.data);
    console.log(`\n=== ${name} ===`);
    console.log(`kata=${summary.count}; rata-rata=${summary.average}%; lolos>=70=${summary.passed.length}`);
    console.log('Teks mentah (nilai akses disamarkan):');
    console.log(redact(result.data.text ?? '').trim() || '(kosong)');
    console.log('Kata lolos ambang:', safePassedWords(summary).join(' ') || '(tidak ada)');
    const raw = result.data.text ?? '';
    const detectedTypes = [
      [/(?:\d|[OoIl|]){1,3}\.(?:\d|[OoIl|]){1,3}\.(?:\d|[OoIl|]){1,3}\.(?:\d|[OoIl|]){1,3}/.test(raw), 'IP'],
      [/[A-Z0-9._%+-]+\s*@\s*[A-Z0-9.-]+\.[A-Z]{2,}/i.test(raw), 'email'],
      [/(password|passwd|pwd|pass)\s*[-:=–—]/i.test(raw), 'sandi'],
      [/(api[\s_-]*(key|token)|token|secret|bearer)\s*[-:=–—]/i.test(raw), 'token'],
      [/(intranet|localhost|\.local|\.internal)/i.test(raw), 'URL/host intranet'],
    ].filter(([detected]) => detected).map(([, label]) => label);
    console.log('Jenis yang tampak di teks mentah:', detectedTypes.join(', ') || '(belum terdeteksi)');
  }
} catch (error) {
  console.error('OCR Node tidak dapat dijalankan di lingkungan ini:', error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
} finally {
  await worker?.terminate();
}
