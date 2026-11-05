import React, { useEffect, useMemo, useState } from 'react';
import { Activity, Clock3, MapPin, Radar, ShieldAlert, Timer, Waypoints } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { analyzePatterns, formatPatternTime, renderPatternInsight, type PatternAnalysisResult } from '../engine/pattern';
import { LeafletMap } from '../components/LeafletMap';
import { fetchMissingPatternSamples } from '../utils/publicSamples';

const CLUSTER_COLORS = ['#34d399', '#22d3ee', '#fbbf24', '#fb7185', '#a78bfa', '#60a5fa', '#f472b6'];
const WEEKDAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
const READABILITY_STYLE = {
  Tinggi: 'border-emerald-600/60 bg-emerald-950/60 text-emerald-200',
  Sedang: 'border-amber-600/60 bg-amber-950/60 text-amber-200',
  Rendah: 'border-slate-700 bg-slate-900 text-slate-300',
} as const;

function colorForCluster(index: number): string {
  return CLUSTER_COLORS[index % CLUSTER_COLORS.length] ?? '#34d399';
}

const RelativeClusterMap: React.FC<{ result: PatternAnalysisResult; labels: Record<string, string> }> = ({ result, labels }) => {
  const width = 520;
  const height = 260;
  const padding = 36;
  if (!result.clusters.length) return <p className="p-4 text-sm text-slate-400">Belum ada titik yang dapat dipetakan.</p>;
  const referenceLatitude = result.clusters.reduce((sum, cluster) => sum + cluster.latitude, 0) / result.clusters.length;
  const longitudeScale = Math.max(0.1, Math.cos(referenceLatitude * Math.PI / 180));
  const points = result.clusters.map((cluster) => ({
    cluster,
    xValue: cluster.longitude * longitudeScale,
    yValue: -cluster.latitude,
  }));
  const minX = Math.min(...points.map(({ xValue }) => xValue));
  const maxX = Math.max(...points.map(({ xValue }) => xValue));
  const minY = Math.min(...points.map(({ yValue }) => yValue));
  const maxY = Math.max(...points.map(({ yValue }) => yValue));
  const pointX = (value: number) => padding + ((value - minX) / Math.max(0.00001, maxX - minX)) * (width - padding * 2);
  const pointY = (value: number) => padding + ((value - minY) / Math.max(0.00001, maxY - minY)) * (height - padding * 2);

  return <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Sebaran relatif klaster lokasi tanpa peta jaringan" className="h-auto w-full rounded-xl border border-slate-800 bg-slate-950/70">
    <title>Sebaran relatif lokasi</title>
    <desc>Tiap lingkaran mewakili satu klaster GPS. Posisi relatif, bukan peta jalan.</desc>
    <path d={`M${padding} ${height - padding}H${width - padding}M${padding} ${padding}V${height - padding}`} stroke="#334155" strokeDasharray="4 6" />
    {points.map(({ cluster, xValue, yValue }, index) => {
      const x = pointX(xValue);
      const y = pointY(yValue);
      const color = colorForCluster(index);
      return <g key={cluster.id}>
        <title>{labels[cluster.id] ?? cluster.label}: {cluster.photoCount} foto</title>
        <circle cx={x} cy={y} r={Math.min(24, 10 + cluster.photoCount * 2)} fill={`${color}33`} stroke={color} strokeWidth="2" />
        <circle cx={x} cy={y} r="4" fill={color} />
        <text x={Math.min(width - 90, x + 13)} y={y - 8} fill={color} fontSize="12" fontFamily="monospace">{labels[cluster.id] ?? cluster.label}</text>
      </g>;
    })}
    <text x={padding} y={height - 10} fill="#94a3b8" fontSize="10" fontFamily="monospace">BARAT</text>
    <text x={width - padding - 30} y={height - 10} fill="#94a3b8" fontSize="10" fontFamily="monospace">TIMUR</text>
  </svg>;
};

const DailyTimeline: React.FC<{ result: PatternAnalysisResult; labels: Record<string, string> }> = ({ result, labels }) => {
  const width = 720;
  const left = 100;
  const right = 24;
  const top = 24;
  const rowHeight = 34;
  const days = [...new Set(result.observations.map(({ date }) => date))].sort();
  if (!days.length) return <p className="p-4 text-sm text-slate-400">Linimasa belum tersedia.</p>;
  return <svg viewBox={`0 0 ${width} ${top + days.length * rowHeight + 24}`} role="img" aria-label="Linimasa waktu foto per hari" className="h-auto w-full rounded-xl border border-slate-800 bg-slate-950/70">
    <title>Linimasa harian</title>
    {[0, 6, 12, 18, 24].map((hour) => {
      const x = left + (hour / 24) * (width - left - right);
      return <g key={hour}><line x1={x} y1={top - 8} x2={x} y2={top + days.length * rowHeight} stroke="#334155" strokeDasharray="3 5" /><text x={x} y="13" fill="#94a3b8" fontSize="10" textAnchor="middle">{String(hour).padStart(2, '0')}.00</text></g>;
    })}
    {days.map((date, row) => {
      const y = top + row * rowHeight + 10;
      return <g key={date}>
        <text x={left - 10} y={y + 4} fill="#cbd5e1" fontSize="10" textAnchor="end" fontFamily="monospace">{date}</text>
        <line x1={left} y1={y} x2={width - right} y2={y} stroke="#1e293b" />
        {result.observations.filter((observation) => observation.date === date).map((observation) => {
          const clusterIndex = result.clusters.findIndex(({ id }) => id === observation.clusterId);
          const color = colorForCluster(clusterIndex);
          const x = left + (observation.minuteOfDay / 1440) * (width - left - right);
          const cluster = result.clusters[clusterIndex];
          return <circle key={observation.analysisId} cx={x} cy={y} r="6" fill={color} stroke="#020617" strokeWidth="2">
            <title>{date} {formatPatternTime(observation.minuteOfDay)} · {labels[observation.clusterId] ?? cluster?.label}</title>
          </circle>;
        })}
      </g>;
    })}
  </svg>;
};

const DayHourHeatmap: React.FC<{ result: PatternAnalysisResult }> = ({ result }) => {
  const labelWidth = 60;
  const cellWidth = 19;
  const cellHeight = 26;
  const top = 24;
  const counts = new Map<string, number>();
  result.observations.forEach(({ weekday, minuteOfDay }) => {
    const key = `${weekday}-${Math.floor(minuteOfDay / 60)}`;
    counts.set(key, (counts.get(key) ?? 0) + 1);
  });
  const maxCount = Math.max(1, ...counts.values());
  return <svg viewBox={`0 0 ${labelWidth + 24 * cellWidth + 8} ${top + 7 * cellHeight}`} role="img" aria-label="Heatmap jumlah foto menurut hari dalam minggu dan jam" className="h-auto w-full rounded-xl border border-slate-800 bg-slate-950/70">
    <title>Heatmap hari dan jam</title>
    {Array.from({ length: 24 }, (_, hour) => <text key={hour} x={labelWidth + hour * cellWidth + cellWidth / 2} y="15" fill="#94a3b8" fontSize="8" textAnchor="middle">{String(hour).padStart(2, '0')}</text>)}
    {WEEKDAYS.map((weekday, dayIndex) => <g key={weekday}>
      <text x={labelWidth - 6} y={top + dayIndex * cellHeight + 15} fill="#cbd5e1" fontSize="9" textAnchor="end">{weekday}</text>
      {Array.from({ length: 24 }, (_, hour) => {
        const count = counts.get(`${dayIndex}-${hour}`) ?? 0;
        return <g key={hour}>
          <rect x={labelWidth + hour * cellWidth} y={top + dayIndex * cellHeight} width={cellWidth - 2} height={cellHeight - 3} rx="3" fill={count ? `rgba(34,211,238,${0.2 + 0.8 * count / maxCount})` : '#0f172a'} stroke="#1e293b" />
          <title>{weekday}, pukul {String(hour).padStart(2, '0')}.00: {count} foto</title>
        </g>;
      })}
    </g>)}
  </svg>;
};

export const PatternPage: React.FC = () => {
  const files = useAnalysisStore((state) => state.files);
  const [result, setResult] = useState<PatternAnalysisResult | null>(null);
  const [fastMode, setFastMode] = useState(true);
  const [waitingForSession, setWaitingForSession] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [labels, setLabels] = useState<Record<string, string>>({});
  const [mapClusterId, setMapClusterId] = useState<string | null>(null);
  const [loadingPatternSamples, setLoadingPatternSamples] = useState(false);
  const addFiles = useAnalysisStore((state) => state.addFiles);

  const mapCluster = result?.clusters.find(({ id }) => id === mapClusterId) ?? result?.clusters[0];
  const currentFiles = useMemo(() => files.map((file) => ({ id: file.id, exif: file.exif })), [files]);
  const hasPendingFileAnalysis = files.some((file) => file.status === 'idle' || file.status === 'analyzing');

  const runPatternAnalysis = () => {
    if (files.length === 0) {
      setStatusMessage('Belum ada foto dalam sesi. Unggah foto yang memiliki GPS dan waktu EXIF.');
      return;
    }
    if (files.some((file) => file.status === 'analyzing' && !file.exif)) {
      setStatusMessage('Menunggu pembacaan GPS dan waktu EXIF foto sesi. Jalankan kembali setelah metadata siap.');
      return;
    }
    if (!fastMode && hasPendingFileAnalysis) {
      setWaitingForSession(true);
      setStatusMessage('Menunggu proses foto sesi yang sedang berjalan selesai.');
      return;
    }
    const patternResult = analyzePatterns(currentFiles);
    setResult(patternResult);
    setWaitingForSession(false);
    setStatusMessage(null);
    setLabels(Object.fromEntries(patternResult.clusters.map((cluster) => [cluster.id, cluster.label])));
    setMapClusterId(patternResult.clusters[0]?.id ?? null);
  };

  const loadPatternSamples = async () => {
    setLoadingPatternSamples(true);
    setStatusMessage(null);
    try {
      const samples = await fetchMissingPatternSamples(files.map((file) => file.name));
      if (samples.length === 0) {
        setStatusMessage('Foto contoh pola hidup sudah ada di sesi. Jalankan analisis pola untuk melihat hasilnya.');
        return;
      }
      addFiles(samples, { metadataOnly: true });
      setResult(null);
      setLabels({});
      setStatusMessage(`${samples.length} foto contoh pola hidup dimuat. Metadata sedang dibaca tanpa OCR; setelah selesai, jalankan analisis pola.`);
    } catch (error) {
      setStatusMessage(error instanceof Error ? error.message : 'Foto contoh pola tidak dapat dimuat.');
    } finally {
      setLoadingPatternSamples(false);
    }
  };

  useEffect(() => {
    if (!waitingForSession || hasPendingFileAnalysis) return;
    const patternResult = analyzePatterns(currentFiles);
    setResult(patternResult);
    setWaitingForSession(false);
    setStatusMessage(null);
    setLabels(Object.fromEntries(patternResult.clusters.map((cluster) => [cluster.id, cluster.label])));
    setMapClusterId(patternResult.clusters[0]?.id ?? null);
  }, [waitingForSession, hasPendingFileAnalysis, currentFiles]);

  return <div className="mx-auto max-w-7xl space-y-5 px-1 py-4 sm:px-2">
    <header className="rounded-2xl border border-cyan-900/50 bg-slate-950/80 p-5 shadow-xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="mb-2 flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] text-cyan-400"><Activity className="h-4 w-4" /> ANALISIS METADATA · LOKAL</p>
          <h1 className="text-2xl font-bold text-white">Rekonstruksi Pola Hidup</h1>
          <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-300">Beberapa foto yang masing-masing tampak aman dapat menunjukkan lokasi yang berulang, jam kunjungan, dan urutan perpindahan ketika dilihat sebagai satu kumpulan.</p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 rounded-lg border border-amber-700/60 bg-amber-950/40 px-3 py-2 font-mono text-[10px] font-bold tracking-wide text-amber-200"><ShieldAlert className="h-4 w-4" /> Fitur lanjutan</span>
      </div>
      <div className="mt-4 grid gap-3 border-t border-slate-800 pt-4 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="flex w-fit cursor-pointer items-start gap-2 text-xs text-slate-200">
            <input aria-label="Mode cepat (hanya metadata, tanpa OCR)" type="checkbox" checked={fastMode} onChange={(event) => setFastMode(event.target.checked)} className="mt-0.5 accent-cyan-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" />
            <span><strong>Mode cepat (hanya metadata, tanpa OCR)</strong><span className="mt-0.5 block text-slate-400">Gunakan GPS dan waktu EXIF yang tersedia; mode ini tidak menunggu proses OCR foto.</span></span>
          </label>
          {!fastMode && hasPendingFileAnalysis && <p className="mt-2 text-xs text-amber-200" role="status">Mode lengkap menunggu pemrosesan foto sesi saat ini selesai, lalu memakai GPS dan waktu EXIF.</p>}
          {statusMessage && <p className="mt-2 text-xs text-cyan-200" role="status">{statusMessage}</p>}
        </div>
        <button type="button" onClick={runPatternAnalysis} disabled={waitingForSession} className="inline-flex items-center justify-center gap-2 rounded-xl border border-cyan-500/70 bg-cyan-800 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-cyan-950/60 hover:bg-cyan-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:cursor-wait disabled:opacity-60">
          {waitingForSession ? <Timer className="h-4 w-4 animate-pulse" /> : <Radar className="h-4 w-4" />}
          {waitingForSession ? 'Menunggu foto…' : 'Analisis pola dari sesi ini'}
        </button>
        <button type="button" onClick={() => void loadPatternSamples()} disabled={loadingPatternSamples} className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-700/60 bg-amber-950/40 px-4 py-3 text-sm font-semibold text-amber-100 hover:bg-amber-900/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-300 disabled:opacity-60">{loadingPatternSamples ? 'Memuat contoh…' : 'Muat contoh pola hidup'}</button>
      </div>
      <p className="mt-3 text-[11px] text-slate-500">Foto tanpa koordinat GPS atau waktu pengambilan yang valid tidak dipetakan. Sebaran di bawah bersifat relatif dan tidak memuat peta jalan.</p>
      <p className="mt-2 text-[10px] font-mono font-bold tracking-wide text-emerald-300">DATA CONTOH FIKTIF · tersedia untuk demonstrasi</p>
    </header>

    {!result ? <section className="rounded-2xl border border-slate-800 bg-slate-950/60 p-8 text-center" aria-label="Belum ada hasil pola">
      <Waypoints className="mx-auto h-9 w-9 text-slate-500" />
      <h2 className="mt-3 text-base font-semibold text-slate-200">Jalankan analisis pada foto sesi</h2>
      <p className="mx-auto mt-1 max-w-xl text-sm text-slate-400">Pola hanya dihitung dari metadata waktu dan koordinat foto yang sudah diunggah pada sesi ini. Foto tidak dikirim ke server.</p>
    </section> : <>
      <section className="grid gap-4 lg:grid-cols-12" aria-label="Ringkasan keterbacaan pola">
        <div className={`rounded-2xl border p-5 lg:col-span-4 ${READABILITY_STYLE[result.readability]}`}>
          <p className="font-mono text-[10px] font-bold tracking-widest">TINGKAT KETERBACAAN POLA</p>
          <p className="mt-2 text-3xl font-bold">{result.readability}</p>
          <p className="mt-1 text-xs opacity-80">{result.routines.length} rutinitas · {result.transitions.length} transisi berulang</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 lg:col-span-4">
          <p className="font-mono text-[10px] font-bold tracking-widest text-cyan-300">FOTO YANG DIPETAKAN</p>
          <p className="mt-2 text-3xl font-bold text-white">{result.observations.length}</p>
          <p className="mt-1 text-xs text-slate-400">{result.unmappableCount} foto tidak dapat dipetakan (tanpa GPS/waktu EXIF valid)</p>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-5 lg:col-span-4">
          <p className="font-mono text-[10px] font-bold tracking-widest text-cyan-300">PARAMETER LOKAL</p>
          <p className="mt-2 text-xl font-semibold text-white">Radius {Math.round(result.radiusMeters)} m</p>
          <p className="mt-1 text-xs text-slate-400">Jendela waktu rutinitas ±{result.routineWindowMinutes} menit.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="mb-3 flex items-center gap-2"><MapPin className="h-4 w-4 text-cyan-300" /><h2 className="font-mono text-sm font-bold text-cyan-200">SEBARAN RELATIF KLASTER</h2></div>
          <RelativeClusterMap result={result} labels={labels} />
          <p className="mt-2 text-[11px] text-slate-500">Peta titik relatif dibuat lokal dari centroid klaster; tidak menampilkan jalan atau menghubungi layanan peta.</p>
        </article>
        <article className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
          <div className="mb-3 flex items-center gap-2"><Clock3 className="h-4 w-4 text-cyan-300" /><h2 className="font-mono text-sm font-bold text-cyan-200">LINIMASA HARIAN</h2></div>
          <DailyTimeline result={result} labels={labels} />
          <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px]">{result.clusters.map((cluster, index) => <span key={cluster.id} className="inline-flex items-center gap-1.5 text-slate-300"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: colorForCluster(index) }} />{labels[cluster.id] ?? cluster.label}</span>)}</div>
        </article>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-cyan-300" /><h2 className="font-mono text-sm font-bold text-cyan-200">HEATMAP HARI × JAM</h2></div>
        <DayHourHeatmap result={result} />
      </section>

      <section className="space-y-3" aria-label="Kartu klaster lokasi">
        <h2 className="font-mono text-sm font-bold tracking-wide text-cyan-200">KLASTER LOKASI</h2>
        <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
          {result.clusters.map((cluster, index) => <article key={cluster.id} className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4" style={{ borderTopColor: colorForCluster(index), borderTopWidth: 3 }}>
            <label className="block text-[10px] font-mono font-bold tracking-widest text-slate-400" htmlFor={`pattern-label-${cluster.id}`}>LABEL LOKASI · {cluster.photoCount} FOTO</label>
            <input id={`pattern-label-${cluster.id}`} value={labels[cluster.id] ?? cluster.label} onChange={(event) => setLabels((current) => ({ ...current, [cluster.id]: event.target.value }))} maxLength={32} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-base font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400" />
            <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
              <div><dt className="text-slate-500">Hari berbeda</dt><dd className="text-slate-200">{cluster.dayCount}</dd></div>
              <div><dt className="text-slate-500">Median waktu</dt><dd className="font-mono text-slate-200">{formatPatternTime(cluster.medianMinuteOfDay)}</dd></div>
              <div><dt className="text-slate-500">Rentang jam</dt><dd className="font-mono text-slate-200">{formatPatternTime(cluster.rangeStartMinute)}–{formatPatternTime(cluster.rangeEndMinute)}</dd></div>
              <div><dt className="text-slate-500">Tanggal</dt><dd className="text-slate-200">{cluster.firstDay} – {cluster.lastDay}</dd></div>
            </dl>
            <p className="mt-3 border-t border-slate-800 pt-2 text-xs text-emerald-200">{result.routines.some(({ clusterId }) => clusterId === cluster.id) ? 'Rutinitas waktu terdeteksi' : 'Belum cukup bukti untuk menyebut rutinitas'}</p>
          </article>)}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4" aria-label="Kesimpulan pihak luar">
        <div className="mb-3 flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-amber-300" /><h2 className="font-mono text-sm font-bold text-amber-200">YANG DAPAT DITARIK PIHAK LUAR</h2></div>
        {result.insights.length === 0 ? <p className="rounded-xl border border-slate-800 p-4 text-sm text-slate-400">Belum ada pola berulang yang didukung beberapa hari data.</p> : <div className="grid gap-3 lg:grid-cols-2">
          {result.insights.map((insight) => <article key={insight.id} className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-4">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2"><span className="rounded border border-amber-700/70 px-2 py-1 font-mono text-[10px] font-bold text-amber-200">KEYAKINAN {insight.confidence.toUpperCase()}</span><span className="text-[10px] text-slate-400">Sumber klaster: {insight.sourceClusterIds.map((id) => labels[id] ?? result.clusters.find((cluster) => cluster.id === id)?.label).join(' → ')}</span></div>
            <p className="text-sm leading-relaxed text-slate-100">{renderPatternInsight(insight, result.clusters, labels)}</p>
          </article>)}
        </div>}
      </section>

      {mapCluster && <details className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4">
        <summary className="cursor-pointer font-mono text-xs font-bold text-cyan-200">PETA OSM OPSIONAL · PERLU PERSETUJUAN</summary>
        <p className="my-3 text-xs text-amber-200">Memuat peta akan meminta gambar peta dari OpenStreetMap dan mengungkap area kasar lokasi yang dipilih. Sebaran dan analisis di atas tetap berjalan tanpa peta.</p>
        <label htmlFor="pattern-map-cluster" className="mb-2 block text-xs text-slate-300">Pilih titik untuk peta</label>
        <select id="pattern-map-cluster" value={mapCluster.id} onChange={(event) => setMapClusterId(event.target.value)} className="mb-3 rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">
          {result.clusters.map((cluster) => <option key={cluster.id} value={cluster.id}>{labels[cluster.id] ?? cluster.label}</option>)}
        </select>
        <LeafletMap latitude={mapCluster.latitude} longitude={mapCluster.longitude} popupTitle={labels[mapCluster.id] ?? mapCluster.label} />
      </details>}
    </>}
  </div>;
};
