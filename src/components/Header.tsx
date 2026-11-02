import React from 'react';
import { Shield, ShieldAlert, Lock, Info, Activity } from 'lucide-react';

export type ActiveTab = 'analisis' | 'pola-hidup' | 'privasi' | 'tentang';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer"
            onClick={() => onTabChange('analisis')}
          >
            <div className="bg-emerald-600/20 border border-emerald-500/40 p-2 rounded-lg text-emerald-400">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-white">
                  PERISAI <span className="text-emerald-400">OPSEC</span>
                </span>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800/60 font-mono">
                  v0.1.0-alpha
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Pemeriksa Kebocoran Operasional Prajurit
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => onTabChange('analisis')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'analisis'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Analisis</span>
            </button>

            <button
              onClick={() => onTabChange('pola-hidup')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'pola-hidup'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Pola Hidup</span>
              <span className="text-[10px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                P1
              </span>
            </button>

            <button
              onClick={() => onTabChange('privasi')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'privasi'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Lock className="w-4 h-4" />
              <span>Privasi</span>
            </button>

            <button
              onClick={() => onTabChange('tentang')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'tentang'
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Info className="w-4 h-4" />
              <span>Tentang</span>
            </button>
          </nav>

          {/* Privacy badge */}
          <div className="hidden md:flex items-center space-x-2 text-xs bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-medium">100% Client-Side</span>
          </div>
        </div>
      </div>
    </header>
  );
};
