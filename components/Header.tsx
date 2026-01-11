
import React, { useEffect, useState } from 'react';
import { ViewMode } from '../types';
import cacService from '../services/cacService';

interface HeaderProps {
  onEnterDashboard: () => void;
  onSignOut: () => void;
  onNavigate: (mode: ViewMode) => void;
  viewMode: ViewMode;
}

const Header: React.FC<HeaderProps> = ({ onEnterDashboard, onSignOut, onNavigate, viewMode }) => {
  const isPlatformActive = viewMode !== ViewMode.LANDING && viewMode !== ViewMode.LOGIN;
  const [cacBalance, setCacBalance] = useState<number>(0);

  useEffect(() => {
    setCacBalance(cacService.getBalance());
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'cac_balance') setCacBalance(Number(e.newValue ?? 0));
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <header className="fixed top-0 z-50 w-full border-b border-white/10 bg-background-dark/80 backdrop-blur-md px-6 lg:px-20 py-4">
      <div className="max-w-[1440px] mx-auto flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => onNavigate(ViewMode.LANDING)}>
            <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-background-dark group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined font-bold">query_stats</span>
            </div>
            <h2 className="text-xl font-bold tracking-tight uppercase group-hover:text-primary transition-colors">Ward-Wise</h2>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <button
              onClick={() => onNavigate(ViewMode.LANDING)}
              className={`text-sm font-medium transition-colors ${viewMode === ViewMode.LANDING ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              Home
            </button>
            <button
              onClick={() => onNavigate(ViewMode.MAP_VIEW)}
              className={`text-sm font-medium transition-colors ${viewMode === ViewMode.MAP_VIEW ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              Wards
            </button>
            <button
              onClick={() => onNavigate(ViewMode.CLEAN_AIR_CREDITS)}
              className={`text-sm font-medium transition-colors ${viewMode === ViewMode.CLEAN_AIR_CREDITS ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              Clean Air Credits
            </button>
            <button
              onClick={() => onNavigate(ViewMode.LOGIN)}
              className={`text-sm font-medium transition-colors ${viewMode === ViewMode.LOGIN ? 'text-primary' : 'text-white/60 hover:text-white'}`}
            >
              Access Portal
            </button>
          </nav>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden lg:flex items-center bg-white/5 border border-white/10 rounded-full px-4 py-1.5">
            <span className="material-symbols-outlined text-primary text-sm mr-2">emergency_home</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Live: Delhi Center 284 AQI</span>
          </div>

          <div className="hidden md:flex items-center cursor-pointer" onClick={() => onNavigate(ViewMode.CLEAN_AIR_CREDITS)}>
            <div className="bg-white/5 px-3 py-1 rounded-full flex items-center gap-2">
              <span className="text-xs font-semibold">CAC</span>
              <span className="bg-primary text-background-dark text-sm px-2 py-0.5 rounded font-bold">{cacBalance}</span>
            </div>
          </div>

          {viewMode === ViewMode.LANDING ? (
            <button
              onClick={onEnterDashboard}
              className="bg-primary text-background-dark px-6 py-2 rounded-xl font-bold text-sm hover:scale-105 transition-transform"
            >
              Enter Platform
            </button>
          ) : isPlatformActive ? (
            <button
              onClick={onSignOut}
              className="text-white/40 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 px-4 py-2 hover:bg-white/5 rounded-xl"
            >
              <span className="material-symbols-outlined text-sm">logout</span>
              Exit
            </button>
          ) : null}
        </div>
      </div>
    </header>
  );
};

export default Header;
