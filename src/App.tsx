import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { PatternPage } from './pages/PatternPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { DikPage } from './pages/DikPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analisis');
  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <PrivacyBanner />

      <main className="min-w-0 w-full max-w-7xl mx-auto flex-1 px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        {activeTab === 'analisis' && <AnalysisPage onOpenTab={setActiveTab} />}
        {activeTab === 'pola-hidup' && <PatternPage />}
        {activeTab === 'dik' && <DikPage />}
        {activeTab === 'privasi' && <PrivacyPage />}
        {activeTab === 'tentang' && <AboutPage />}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 sm:flex-row">
          <span>PERISAI OPSEC &copy; 2026 — Kartika Cyber Hackathon (Penangkalan)</span>
          <div className="flex min-w-0 flex-wrap items-center justify-center gap-x-3 gap-y-1 sm:justify-end">
            <a href="#privasi" onClick={(event) => { event.preventDefault(); setActiveTab('privasi'); }} className="inline-flex min-h-11 items-center text-cyan-400 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Privasi</a>
            <a href="#tentang" onClick={(event) => { event.preventDefault(); setActiveTab('tentang'); }} className="inline-flex min-h-11 items-center text-cyan-400 underline-offset-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">Tentang</a>
            <span className="basis-full text-slate-400 sm:basis-auto">Analisis berjalan di perangkat • Tanpa pengiriman data</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;

