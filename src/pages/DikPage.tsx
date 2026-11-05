import React, { useEffect, useRef, useState } from 'react';
import { Download, FileUp, Plus, Save, ShieldAlert, Trash2 } from 'lucide-react';
import { FICTIONAL_DIK_EXAMPLE, validateDikEntries, type DikEntry, type DikKind } from '../engine/dik';
import { useDikStore } from '../store/useDikStore';
import { getSeverityLabel } from '../utils/uiLabels';

const STORAGE_KEY = 'perisai-opsec-dik-v1';
const KIND_LABELS: Record<DikKind, string> = { satuan: 'Satuan', lokasi: 'Lokasi', kegiatan: 'Kegiatan', personel: 'Personel', kode: 'Kode' };

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `dik-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export const DikPage: React.FC = () => {
  const entries = useDikStore((state) => state.entries);
  const setEntries = useDikStore((state) => state.setEntries);
  const [term, setTerm] = useState('');
  const [kind, setKind] = useState<DikKind>('satuan');
  const [catatan, setCatatan] = useState('');
  const [severity, setSeverity] = useState<DikEntry['severity']>('high');
  const [persist, setPersist] = useState(false);
  const [message, setMessage] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return;
      const parsed: unknown = JSON.parse(saved);
      if (!parsed || typeof parsed !== 'object' || !('enabled' in parsed) || parsed.enabled !== true || !('entries' in parsed)) return;
      const restored = validateDikEntries(parsed.entries);
      setEntries(restored);
      setPersist(true);
      setMessage('Daftar tersimpan di perangkat ini telah dimuat.');
    } catch {
      setMessage('Data DIK perangkat tidak dapat dibaca. Daftar sesi tetap tersedia; gunakan impor JSON untuk memulihkan salinan.');
    }
  }, [setEntries]);

  const addEntry = () => {
    if (!term.trim()) {
      setMessage('Istilah wajib diisi.');
      return;
    }
    setEntries([...entries, { id: newId(), term: term.trim(), kind, severity, catatan: catatan.trim() }]);
    setTerm('');
    setCatatan('');
    setMessage('Entri ditambahkan ke sesi ini.');
  };

  const updateEntry = (id: string, patch: Partial<DikEntry>) => setEntries(entries.map((entry) => entry.id === id ? { ...entry, ...patch } : entry));
  const removeEntry = (id: string) => setEntries(entries.filter((entry) => entry.id !== id));

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'daftar-informasi-kritis.json';
    link.click();
    URL.revokeObjectURL(url);
    setMessage('File JSON DIK siap disimpan. Simpan dengan aman karena daftar dapat bersifat sensitif.');
  };

  const importJson = async (file: File | undefined) => {
    if (!file) return;
    try {
      const entriesFromFile = validateDikEntries(JSON.parse(await file.text()));
      setEntries(entriesFromFile);
      setMessage(`${entriesFromFile.length} entri berhasil diimpor.`);
    } catch (error) {
      setMessage(error instanceof SyntaxError
        ? 'Impor gagal: JSON tidak valid atau rusak. Pastikan file berisi daftar entri DIK yang valid.'
        : error instanceof Error ? `Impor gagal: ${error.message}` : 'Impor gagal: file JSON tidak dapat dibaca.');
    } finally {
      if (fileInput.current) fileInput.current.value = '';
    }
  };

  const togglePersistence = (enabled: boolean) => {
    try {
      if (enabled) localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: true, entries }));
      else localStorage.removeItem(STORAGE_KEY);
      setPersist(enabled);
      setMessage(enabled ? 'Penyimpanan perangkat aktif. Daftar DIK tersimpan pada browser ini.' : 'Penyimpanan perangkat dinonaktifkan dan salinan lokal dihapus.');
    } catch {
      setMessage('Browser tidak dapat menyimpan data DIK. Anda tetap dapat memakai daftar selama sesi atau mengekspor JSON.');
    }
  };

  useEffect(() => {
    if (!persist) return;
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled: true, entries })); }
    catch { setMessage('Penyimpanan perangkat gagal diperbarui. Ekspor JSON untuk menyimpan salinan.'); }
  }, [entries, persist]);

  return <div className="mx-auto max-w-5xl space-y-5 px-1 py-4 sm:px-2">
    <header className="rounded-2xl border border-cyan-900/50 bg-slate-950/80 p-5 shadow-xl">
      <p className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cyan-400"><ShieldAlert className="h-4 w-4" /> KAMUS TAMBAHAN · LOKAL</p>
      <h1 className="text-2xl font-bold text-white">Daftar Informasi Kritis</h1>
      <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Tandai istilah yang menurut satuan harus dikenali sebelum konten dibagikan. Pencocokan dijalankan di browser dan berlaku untuk teks OCR serta caption.</p>
      <div className="mt-4 rounded-xl border border-amber-700/50 bg-amber-950/30 p-3 text-xs leading-relaxed text-amber-100"><strong>Daftar ini dapat bersifat sensitif.</strong> Default-nya hanya tersimpan di memori sesi. Saran utama: ekspor atau impor file JSON yang Anda simpan dengan aman. Penyimpanan browser ini opsional dan hanya untuk perangkat yang Anda kendalikan.</div>
    </header>

    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4" aria-label="Tambah entri DIK">
      <h2 className="mb-3 font-mono text-sm font-bold text-cyan-200">TAMBAH INFORMASI KRITIS</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-300">Istilah<input value={term} onChange={(event) => setTerm(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" placeholder="Contoh istilah kritis" /></label>
        <label className="text-xs text-slate-300">Jenis<select value={kind} onChange={(event) => setKind(event.target.value as DikKind)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-xs text-slate-300">Tingkat temuan<select value={severity} onChange={(event) => setSeverity(event.target.value as DikEntry['severity'])} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white">{(['high', 'critical', 'medium', 'low', 'info'] as const).map((value) => <option key={value} value={value}>{getSeverityLabel(value)}</option>)}</select></label>
        <label className="text-xs text-slate-300">Catatan<textarea value={catatan} onChange={(event) => setCatatan(event.target.value)} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white" rows={2} /></label>
      </div>
      <button type="button" onClick={addEntry} className="mt-3 inline-flex items-center gap-2 rounded-lg border border-cyan-600/70 bg-cyan-900/70 px-4 py-2 text-sm font-semibold text-cyan-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300"><Plus className="h-4 w-4" />Tambah entri</button>
    </section>

    <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="font-mono text-sm font-bold text-cyan-200">DAFTAR SAAT INI · {entries.length}</h2><div className="flex flex-wrap gap-2">
        <button type="button" onClick={() => { setEntries([...FICTIONAL_DIK_EXAMPLE]); setMessage('Contoh FIKTIF dimuat ke memori sesi.'); }} className="rounded-lg border border-amber-700/60 px-3 py-2 text-xs text-amber-100">Muat contoh FIKTIF</button>
        <button type="button" onClick={downloadJson} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><Download className="h-3.5 w-3.5" />Ekspor JSON</button>
        <button type="button" onClick={() => fileInput.current?.click()} className="inline-flex items-center gap-1 rounded-lg border border-slate-700 px-3 py-2 text-xs text-slate-200"><FileUp className="h-3.5 w-3.5" />Impor JSON</button>
        <input ref={fileInput} type="file" accept="application/json,.json" className="hidden" aria-label="Pilih file JSON DIK" onChange={(event) => void importJson(event.target.files?.[0])} />
        <button type="button" onClick={() => { setEntries([]); setMessage('Semua entri DIK dihapus dari sesi.'); }} className="inline-flex items-center gap-1 rounded-lg border border-rose-800/70 px-3 py-2 text-xs text-rose-200"><Trash2 className="h-3.5 w-3.5" />Hapus semua</button>
      </div></div>
      {entries.length === 0 ? <p className="rounded-lg border border-dashed border-slate-700 p-5 text-center text-sm text-slate-400">Belum ada entri dalam sesi ini.</p> : <div className="space-y-3">{entries.map((entry) => <article key={entry.id} className="grid gap-3 rounded-xl border border-slate-800 bg-slate-900/70 p-3 sm:grid-cols-[1fr_150px_130px_auto] sm:items-end">
        <label className="text-[10px] text-slate-400">ISTILAH<input aria-label="Istilah DIK" value={entry.term} onChange={(event) => updateEntry(entry.id, { term: event.target.value })} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white" /></label>
        <label className="text-[10px] text-slate-400">JENIS<select aria-label="Jenis DIK" value={entry.kind} onChange={(event) => updateEntry(entry.id, { kind: event.target.value as DikKind })} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">{Object.entries(KIND_LABELS).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
        <label className="text-[10px] text-slate-400">Tingkat temuan<select aria-label="Tingkat temuan DIK" value={entry.severity} onChange={(event) => updateEntry(entry.id, { severity: event.target.value as DikEntry['severity'] })} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">{(['high', 'critical', 'medium', 'low', 'info'] as const).map((value) => <option key={value} value={value}>{getSeverityLabel(value)}</option>)}</select></label>
        <button type="button" onClick={() => removeEntry(entry.id)} aria-label={`Hapus ${entry.term}`} className="rounded border border-rose-900/70 p-2 text-rose-300"><Trash2 className="h-4 w-4" /></button>
        <label className="text-[10px] text-slate-400 sm:col-span-4">CATATAN<textarea aria-label="Catatan DIK" value={entry.catatan} onChange={(event) => updateEntry(entry.id, { catatan: event.target.value })} className="mt-1 w-full rounded border border-slate-700 bg-slate-950 px-2 py-2 text-xs text-slate-200" rows={2} /></label>
      </article>)}</div>}
    </section>

    <section className="rounded-2xl border border-amber-800/50 bg-amber-950/20 p-4">
      <label className="flex items-start gap-3 text-sm text-amber-100"><input type="checkbox" checked={persist} onChange={(event) => togglePersistence(event.target.checked)} className="mt-1 accent-amber-400" /><span><strong className="inline-flex items-center gap-2"><Save className="h-4 w-4" />Simpan di perangkat ini</strong><span className="mt-1 block text-xs leading-relaxed text-amber-200/80">Mengaktifkan localStorage pada browser ini. Daftar dapat terbaca oleh siapa pun yang memakai profil browser yang sama. Hapus centang untuk menghapus salinan tersimpan.</span></span></label>
    </section>
    {message && <p role="status" className="rounded-lg border border-cyan-900/50 bg-cyan-950/30 p-3 text-sm text-cyan-100">{message}</p>}
  </div>;
};
