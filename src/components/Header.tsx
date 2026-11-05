import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Activity, Info, ListChecks, Lock, Menu, Shield, X } from 'lucide-react';

export type ActiveTab = 'analisis' | 'pola-hidup' | 'dik' | 'privasi' | 'tentang';

interface HeaderProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

const MENU_ITEMS = [
  { id: 'pola-hidup', label: 'Pola Hidup', Icon: Activity },
  { id: 'dik', label: 'Daftar Kritis', Icon: ListChecks },
  { id: 'privasi', label: 'Privasi', Icon: Lock },
  { id: 'tentang', label: 'Tentang', Icon: Info },
] as const;

export const Header: React.FC<HeaderProps> = ({ activeTab, onTabChange }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuItemsRef = useRef<HTMLDivElement>(null);

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false);
    if (restoreFocus) requestAnimationFrame(() => menuButtonRef.current?.focus());
  }, []);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const handlePointerDown = (event: PointerEvent) => {
      if (event.target instanceof Node && !containerRef.current?.contains(event.target)) closeMenu(true);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu(true);
        return;
      }
      const items = Array.from(menuItemsRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]') ?? []);
      const currentIndex = items.indexOf(document.activeElement as HTMLButtonElement);
      const nextIndex = event.key === 'ArrowDown' ? (currentIndex + 1) % items.length
        : event.key === 'ArrowUp' ? (currentIndex - 1 + items.length) % items.length
          : event.key === 'Home' ? 0
            : event.key === 'End' ? items.length - 1 : -1;
      if (nextIndex >= 0 && items.length > 0) {
        event.preventDefault();
        items[nextIndex]?.focus();
      }
    };
    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [closeMenu, menuOpen]);

  const navigate = (tab: ActiveTab) => {
    onTabChange(tab);
    closeMenu(true);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-cyan-900/30 bg-slate-950/95 shadow-lg shadow-black/50 backdrop-blur-md">
      <div ref={containerRef} className="relative mx-auto flex h-14 max-w-7xl min-w-0 items-center justify-between gap-3 px-3 sm:h-16 sm:px-6 lg:px-8">
        <a
          href="#analisis"
          aria-label="PERISAI OPSEC, buka Analisis"
          onClick={(event) => { event.preventDefault(); navigate('analisis'); }}
          className="group flex min-w-0 items-center gap-2.5 rounded-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 sm:gap-3"
        >
          <span className="shrink-0 rounded-xl border border-cyan-500/40 bg-cyan-950/40 p-2 text-cyan-400 transition-all group-hover:border-cyan-400 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]">
            <Shield className="h-5 w-5 sm:h-6 sm:w-6" />
          </span>
          <span className="min-w-0">
            <span className="flex min-w-0 items-center gap-2">
              <span className="whitespace-nowrap text-sm font-bold tracking-wide text-slate-100 sm:text-lg">PERISAI <span className="text-cyan-400">OPSEC</span></span>
              <span className="hidden whitespace-nowrap rounded border border-cyan-800/60 bg-cyan-950/80 px-1.5 py-0.5 font-mono text-[10px] tracking-wider text-cyan-300 lg:inline">COMMAND CENTER</span>
            </span>
            <span className="hidden font-mono text-xs text-slate-400 min-[640px]:block">Periksa sebelum unggah.</span>
          </span>
        </a>

        <div className="relative ml-auto flex shrink-0 items-center gap-2">
          <span className="hidden shrink-0 items-center gap-2 rounded-full border border-cyan-800/50 bg-cyan-950/40 px-3 py-1 font-mono text-[11px] min-[1280px]:inline-flex">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-cyan-300">TANPA UNGGAH DATA</span>
          </span>
          <button
            ref={menuButtonRef}
            type="button"
            aria-label="Menu"
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls="primary-menu"
            onClick={() => setMenuOpen((open) => !open)}
            className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-lg border border-cyan-800/70 px-2.5 text-cyan-200 hover:border-cyan-500 hover:bg-cyan-950/60 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 sm:min-w-24 sm:px-3"
          >
            {menuOpen ? <X className="h-5 w-5" aria-hidden="true" /> : <Menu className="h-5 w-5" aria-hidden="true" />}
            <span className="hidden text-xs font-semibold sm:inline">Menu</span>
          </button>
          <span className="sr-only" aria-live="polite">{activeTab === 'analisis' ? 'Halaman Analisis aktif' : `Halaman ${MENU_ITEMS.find((item) => item.id === activeTab)?.label ?? ''} aktif`}</span>
          <div
            id="primary-menu"
            ref={menuItemsRef}
            role="menu"
            aria-label="Navigasi utama"
            hidden={!menuOpen}
            className={`${menuOpen ? 'grid' : 'hidden'} fixed left-0 right-0 top-14 z-50 gap-1 border-b border-cyan-900/60 bg-slate-950 p-3 shadow-2xl shadow-black/40 sm:top-16 md:absolute md:left-auto md:right-0 md:top-full md:mt-2 md:w-64 md:rounded-xl md:border`}
          >
            {MENU_ITEMS.map(({ id, label, Icon }) => <button
              key={id}
              type="button"
              role="menuitem"
              tabIndex={0}
              aria-current={activeTab === id ? 'page' : undefined}
              onClick={() => navigate(id)}
              className={`flex min-h-11 min-w-0 items-center gap-3 rounded-lg px-3 text-left text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${activeTab === id ? 'bg-cyan-950/70 text-cyan-200' : 'text-slate-300 hover:bg-slate-900 hover:text-white'}`}
            >
              <Icon className="h-4 w-4 shrink-0 text-cyan-400" aria-hidden="true" />
              <span>{label}</span>
            </button>)}
          </div>
        </div>
      </div>
    </header>
  );
};
