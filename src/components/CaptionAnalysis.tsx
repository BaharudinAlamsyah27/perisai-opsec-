import React, { useState } from 'react';
import { analyzeText } from '../engine/rules';
import { generateSafeRewrites, RewriteSuggestion } from '../engine/captionRewriter';
import { useDikStore } from '../store/useDikStore';
import { useCaptionStore } from '../store/useCaptionStore';
import { MessageSquareText, ShieldAlert, ShieldCheck, Copy, Check, Sparkles, AlertTriangle } from 'lucide-react';

interface CaptionAnalysisProps {
  className?: string;
}

export const CaptionAnalysis: React.FC<CaptionAnalysisProps> = ({ className = '' }) => {
  const dikEntries = useDikStore((state) => state.entries);
  const caption = useCaptionStore((state) => state.caption);
  const setCaption = useCaptionStore((state) => state.setCaption);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const findings = caption.trim().length > 0 ? analyzeText(caption, 'caption', undefined, dikEntries) : [];
  const rewrites: RewriteSuggestion[] = generateSafeRewrites(caption, findings);

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Render text with highlighted ranges
  const renderHighlightedText = () => {
    if (!caption || findings.length === 0) {
      return <p className="text-sm text-slate-300 font-sans leading-relaxed">{caption}</p>;
    }

    // Extract sorted, non-overlapping ranges
    const sorted = [...findings]
      .filter((f) => f.range)
      .sort((a, b) => (a.range?.start ?? 0) - (b.range?.start ?? 0));

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    sorted.forEach((finding, idx) => {
      const { start, end } = finding.range!;
      if (start > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>{caption.substring(lastIndex, start)}</span>
        );
      }

      const isCrit = finding.severity === 'critical';
      const isHigh = finding.severity === 'high';
      const highlightClass = isCrit
        ? 'bg-rose-950/80 text-rose-300 border border-rose-500/80'
        : isHigh
        ? 'bg-orange-950/80 text-orange-300 border border-orange-500/80'
        : 'bg-amber-950/80 text-amber-300 border border-amber-500/80';

      parts.push(
        <mark
          key={`mark-${idx}`}
          className={`px-1 py-0.5 rounded font-mono font-bold text-xs mx-0.5 inline-block ${highlightClass}`}
          title={`${finding.ruleId}: ${finding.reason}`}
        >
          {caption.substring(start, end)}
        </mark>
      );

      lastIndex = Math.max(lastIndex, end);
    });

    if (lastIndex < caption.length) {
      parts.push(<span key="text-end">{caption.substring(lastIndex)}</span>);
    }

    return <div className="text-sm font-sans leading-relaxed text-slate-200">{parts}</div>;
  };

  return (
    <div className={`bg-slate-950/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl ${className}`}>
      {/* HUD Corner Accents */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyan-500/60" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyan-500/60" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyan-500/60" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyan-500/60" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-800/80">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-400">
            <MessageSquareText className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 tracking-wider font-mono">
              ANALISIS KETERANGAN TEKS (CAPTION)
            </h3>
            <p className="text-xs text-slate-400 font-sans">
              Deteksi kebocoran jadwal, nama satuan, atau rute pergerakan pada teks status media sosial Anda.
            </p>
          </div>
        </div>

        {caption.trim().length > 0 && (
          <div className="flex items-center space-x-2">
            {findings.length > 0 ? (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-rose-950/60 border border-rose-500/50 text-rose-300">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                <span>{findings.length} KEBOCORAN TERDETEKSI</span>
              </span>
            ) : (
              <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-mono bg-emerald-950/60 border border-emerald-500/50 text-emerald-300">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>TIDAK ADA KECOCOKAN ATURAN</span>
              </span>
            )}
          </div>
        )}
      </div>

      {/* Input Textarea & Highlight View */}
      <div className="space-y-4">
        <div>
          <label htmlFor="caption-input" className="block text-xs font-mono text-slate-400 mb-1.5">
            TEMPEL ATAU KETIK TEKS CAPTION:
          </label>
          <textarea
            id="caption-input"
            rows={3}
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Contoh: Besok jam 05.00 berangkat ke pos perbatasan bersama Yonif 999..."
            className="w-full bg-slate-900/90 border border-slate-700/80 rounded-xl p-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500/60 font-sans transition-all"
          />
        </div>

        {/* Live Highlight & Findings Review */}
        {caption.trim().length > 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
              <span>PENYOROTAN KATA BERISIKO:</span>
              <span className="text-[10px] text-cyan-400/80">INLINE OPSEC HIGHLIGHT</span>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 min-h-[48px]">
              {renderHighlightedText()}
            </div>

            {/* List of finding badges */}
            {findings.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {findings.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center space-x-1.5 px-2 py-0.5 rounded text-[11px] font-mono bg-slate-950 border border-slate-700 text-slate-300"
                  >
                    <AlertTriangle className="w-3 h-3 text-amber-400 flex-shrink-0" />
                    <span className="text-cyan-300 font-semibold">{f.evidence}:</span>
                    <span className="text-slate-400 max-w-[200px] truncate">{f.reason}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Safe Rewrite Suggestions (Templates) */}
        {findings.length > 0 && (
          <div className="space-y-3 pt-2">
            <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span className="font-bold tracking-wider">SARAN PENULISAN ULANG AMAN (SAFE TEMPLATES)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {rewrites.map((sug, idx) => (
                <div
                  key={idx}
                  className="bg-slate-900/60 border border-slate-800 hover:border-cyan-500/40 rounded-xl p-4 flex flex-col justify-between space-y-3 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyan-300 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                        {sug.templateName}
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 font-sans italic leading-relaxed pt-1">
                      &quot;{sug.text}&quot;
                    </p>
                    <p className="text-[11px] text-slate-400 font-sans pt-1">
                      {sug.rationale}
                    </p>
                  </div>

                  <button
                    onClick={() => handleCopy(sug.text, idx)}
                    className="flex items-center justify-center space-x-1.5 w-full py-1.5 rounded-lg text-xs font-mono bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 text-cyan-200 transition-colors"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">TERSALIN KE CLIPBOARD!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>SALIN TEKS AMAN INI</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

