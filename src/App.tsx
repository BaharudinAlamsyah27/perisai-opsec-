import React, { useState } from 'react';
import { Header, ActiveTab } from './components/Header';
import { PrivacyBanner } from './components/PrivacyBanner';
import { PatternPage } from './pages/PatternPage';
import { PrivacyPage } from './pages/PrivacyPage';
import { AboutPage } from './pages/AboutPage';
import { AnalysisPage } from './pages/AnalysisPage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('analisis');

  return (
    <div className="min-h-screen flex flex-col bg-slate-900 text-slate-100">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      <PrivacyBanner />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'analisis' && <AnalysisPage />}
        {activeTab === 'pola-hidup' && <PatternPage />}
        {activeTab === 'privasi' && <PrivacyPage />}
        {activeTab === 'tentang' && <AboutPage />}
      </main>

      <footer className="border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>PERISAI OPSEC &copy; 2026 — Kartika Cyber Hackathon (Penangkalan)</span>
          <span className="text-slate-400">100% Client-Side Processing • Tanpa Pengiriman Data</span>
        </div>
      </footer>
    </div>
  );
};

export default App;

