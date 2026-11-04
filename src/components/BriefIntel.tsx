import React from 'react';
import { createIntelBrief, type BriefStatement } from '../engine/brief';
import type { AnalysisFile } from '../types';

interface BriefIntelProps {
  file: AnalysisFile;
  onSelectFinding?: (findingId: string) => void;
}

const SEVERITY_LABEL: Record<string, string> = {
  critical: 'Kritis', high: 'Tinggi', medium: 'Sedang', low: 'Rendah', info: 'Info',
};

export const BriefIntel: React.FC<BriefIntelProps> = ({ file, onSelectFinding }) => {
  const score = file.score ?? { value: 0, level: 'Aman' as const, findings: [] };
  const brief = createIntelBrief(score);

  const renderStatement = (item: BriefStatement, key: string, severity?: string) => (
    <li key={key} className="break-inside-avoid rounded-lg border border-slate-700 bg-slate-900/60 p-3 text-sm leading-relaxed">
      {severity && <span className="mb-1 inline-block rounded bg-rose-950 px-2 py-0.5 text-[10px] font-bold uppercase text-rose-200">{severity}</span>}
      <p>{item.text}</p>
      {item.certainty && <p className="mt-1 text-xs text-slate-400">Keyakinan: <span className="font-semibold text-cyan-200">{item.certainty}</span></p>}
      <p className="mt-2 flex flex-wrap items-center gap-1 text-[11px] text-slate-400">
        <span>Sumber:</span>
        {item.findingIds.map((findingId) => <a
          key={findingId}
          href={onSelectFinding ? `#finding-desktop-${findingId}` : `#risk-finding-${findingId}`}
          onClick={onSelectFinding ? (event) => { event.preventDefault(); onSelectFinding(findingId); } : undefined}
          className="rounded border border-cyan-800 px-1.5 py-0.5 font-mono text-cyan-300 underline decoration-cyan-700 underline-offset-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
        >[{findingId}]</a>)}
      </p>
    </li>
  );

  return (
    <article className="space-y-5 rounded-2xl border border-cyan-900/70 bg-slate-950/90 p-5 text-slate-100" aria-label="Brief Intelijen Lawan">
      <header className="border-b border-slate-800 pb-3">
        <h3 className="font-mono text-base font-bold tracking-wide text-cyan-200">BRIEF INTELIJEN LAWAN</h3>
        <p className="mt-1 text-xs text-slate-400">Apa yang dapat disimpulkan pihak luar dari unggahan ini</p>
      </header>

      <section aria-labelledby="brief-summary-title">
        <h4 id="brief-summary-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">1 · Ringkasan</h4>
        <div className="mt-2 rounded-lg border border-slate-700 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded bg-cyan-950 px-2 py-1 text-xs font-bold text-cyan-200">Risiko {brief.level}</span>
            <span className="font-mono text-sm font-bold">Skor {brief.score}/100</span>
            {brief.emptyStatus && <span className="rounded bg-emerald-950 px-2 py-1 text-[11px] font-bold tracking-wide text-emerald-200">{brief.emptyStatus}</span>}
          </div>
          {brief.summary && <ul className="mt-2">{renderStatement(brief.summary, 'summary')}</ul>}
        </div>
      </section>

      <section aria-labelledby="brief-conclusions-title">
        <h4 id="brief-conclusions-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">2 · Kesimpulan pihak luar</h4>
        {brief.conclusions.length > 0 && <div className="mt-2 space-y-4">
          {brief.conclusions.map(({ group, statements }) => <div key={group}>
            <h5 className="mb-2 font-mono text-sm font-bold text-cyan-300">{group}</h5>
            <ul className="space-y-2">{statements.map((item, index) => renderStatement(item, `${group}-${index}`))}</ul>
          </div>)}
        </div>}
      </section>

      <section aria-labelledby="brief-impacts-title">
        <h4 id="brief-impacts-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">3 · Dampak potensial</h4>
        {brief.impacts.length > 0 && <ul className="mt-2 space-y-2">{brief.impacts.map((item, index) => renderStatement(item, `impact-${index}`))}</ul>}
      </section>

      <section aria-labelledby="brief-mitigations-title">
        <h4 id="brief-mitigations-title" className="text-xs font-bold uppercase tracking-wider text-slate-400">4 · Langkah penanggulangan</h4>
        {brief.mitigations.length > 0 && <ol className="mt-2 space-y-2">{brief.mitigations.map((item, index) => renderStatement(item, `mitigation-${index}`, SEVERITY_LABEL[item.severity]))}</ol>}
      </section>

      <section aria-labelledby="brief-decision-title" className="rounded-lg border border-emerald-800/70 bg-emerald-950/30 p-3">
        <h4 id="brief-decision-title" className="text-xs font-bold uppercase tracking-wider text-slate-300">5 · Keputusan yang disarankan</h4>
        <p className="mt-1 text-base font-bold text-emerald-200">{brief.decision}</p>
        <p className="mt-1 text-xs text-slate-300">Level {brief.level} · Skor {brief.score}/100</p>
        {brief.summary && <p className="mt-1 flex flex-wrap gap-1 text-[11px]">Sumber: {brief.summary.findingIds.map((findingId) => <a key={findingId} href={onSelectFinding ? `#finding-desktop-${findingId}` : `#risk-finding-${findingId}`} onClick={onSelectFinding ? (event) => { event.preventDefault(); onSelectFinding(findingId); } : undefined} className="text-cyan-300 underline">[{findingId}]</a>)}</p>}
      </section>

      <p className="border-t border-slate-800 pt-3 text-[11px] text-slate-400">{brief.note}</p>
    </article>
  );
};
