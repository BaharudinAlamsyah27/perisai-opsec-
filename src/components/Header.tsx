import React from 'react';
import { Shield, ShieldAlert, Lock, Info, Activity } from 'lucide-react';

export type ActiveTab = 'analisis' | 'pola-hidup' | 'privasi' | 'tentang';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  return (
    <header className="border-b border-cyan-900/30 bg-slate-950/95 backdrop-blur-md sticky top-0 z-50 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Tagline */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => onTabChange('analisis')}
          >
            <div className="bg-cyan-950/40 border border-cyan-500/40 p-2 rounded-xl text-cyan-400 group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] transition-all">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-wider text-slate-100">
                  PERISAI <span className="text-cyan-400">OPSEC</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-800/60 font-mono tracking-wider">
                  COMMAND CENTER
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Periksa sebelum unggah.
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-1 sm:space-x-2">
            <button
              onClick={() => onTabChange('analisis')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'analisis'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/60 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5 text-cyan-400" />
              <span>ANALISIS</span>
            </button>

            <button
              onClick={() => onTabChange('pola-hidup')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'pola-hidup'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>POLA HIDUP</span>
              <span className="text-[9px] px-1 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded font-mono">
                P1
              </span>
            </button>

            <button
              onClick={() => onTabChange('privasi')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'privasi'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              <span>PRIVASI</span>
            </button>

            <button
              onClick={() => onTabChange('tentang')}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                activeTab === 'tentang'
                  ? 'bg-cyan-950/60 text-cyan-300 border border-cyan-500/60'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Info className="w-3.5 h-3.5" />
              <span>TENTANG</span>
            </button>
          </nav>

          {/* Privacy badge */}
          <div className="hidden md:flex items-center space-x-2 text-[11px] font-mono bg-cyan-950/40 px-3 py-1 rounded-full border border-cyan-800/50">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-cyan-300 font-medium">TANPA UNGGAH DATA</span>
          </div>
        </div>
      </div>
    </header>
  );
};
