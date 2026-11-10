import React, { useState, useEffect } from 'react';
import { Search, Moon, Sun, Star, Activity, Globe, ChevronDown, Clock } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenSearch: () => void;
  onOpenWatchlist: () => void;
  watchlistCount: number;
  darkMode: boolean;
  setDarkMode: (val: boolean) => void;
  liveFeedActive: boolean;
  setLiveFeedActive: (val: boolean) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenSearch,
  onOpenWatchlist,
  watchlistCount,
  darkMode,
  setDarkMode,
  liveFeedActive,
  setLiveFeedActive,
}) => {
  const [time, setTime] = useState<string>('');
  const [selectedCountry, setSelectedCountry] = useState<string>('US');
  const [countryMenuOpen, setCountryMenuOpen] = useState<boolean>(false);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(
        now.toLocaleTimeString('en-US', {
          timeZone: 'America/New_York',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }) + ' EST'
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const navCategories = [
    { id: 'stocks', label: 'Stocks' },
    { id: 'crypto', label: 'Crypto' },
    { id: 'forex', label: 'Forex' },
    { id: 'indices', label: 'Indices' },
    { id: 'futures', label: 'Futures' },
    { id: 'bonds', label: 'Bonds' },
  ];

  const countries = [
    { code: 'US', name: 'United States', flag: '🇺🇸' },
    { code: 'UK', name: 'United Kingdom', flag: '🇬🇧' },
    { code: 'EU', name: 'European Union', flag: '🇪🇺' },
    { code: 'JP', name: 'Japan', flag: '🇯🇵' },
    { code: 'CA', name: 'Canada', flag: '🇨🇦' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#131722]/95 backdrop-blur-md border-b border-[#e0e3eb] dark:border-[#2a2e39] transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Wordmark + Quick Search */}
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('stocks')}>
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white font-black text-sm shadow-sm tracking-tighter">
              <span className="flex items-end gap-[1px]">
                <span className="w-1.5 h-3 bg-white rounded-xs"></span>
                <span className="w-1.5 h-5 bg-white rounded-xs"></span>
                <span className="w-1.5 h-2 bg-white rounded-xs"></span>
              </span>
            </div>
            <span className="text-base font-bold tracking-tight text-[#181b24] dark:text-[#f0f3fa] whitespace-nowrap">
              Apex Market
            </span>
          </div>

          {/* Quick Search Bar trigger */}
          <button
            onClick={onOpenSearch}
            className="hidden sm:flex items-center gap-2 px-3 py-1.5 text-xs text-[#5a5e6b] dark:text-[#848e9c] bg-[#f1f3ff] dark:bg-[#1e222d] hover:bg-[#e5e8f4] dark:hover:bg-[#2a2e39] rounded-md border border-[#e0e3eb] dark:border-[#2a2e39] transition-colors w-48 lg:w-64 text-left group"
          >
            <Search className="w-3.5 h-3.5 text-[#737687] group-hover:text-[#2962ff] transition-colors" />
            <span className="truncate">Search symbol, e.g. NVDA...</span>
            <kbd className="ml-auto text-[10px] bg-white dark:bg-[#131722] px-1.5 py-0.5 rounded border border-[#c3c5d8] dark:border-[#363a45] font-mono">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Zone 2: Navigation Links (1-line, whitespace-nowrap) */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2 text-sm font-medium">
          {navCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveTab(cat.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === cat.id
                  ? 'text-[#2962ff] bg-[#2962ff]/10 dark:bg-[#2962ff]/20'
                  : 'text-[#5a5e6b] dark:text-[#9194a1] hover:text-[#181b24] dark:hover:text-[#d1d4dc] hover:bg-[#f1f3ff] dark:hover:bg-[#1e222d]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </nav>

        {/* Zone 3: Market Telemetry, Watchlist, Country, Theme */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Market Status with Live EST Time */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 text-[11px] font-medium rounded-md bg-[#e6f5f2] dark:bg-[#089981]/15 text-[#089981] dark:text-[#089981] border border-[#089981]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#089981] animate-pulse"></span>
            <span className="font-semibold">NYSE/NASDAQ OPEN</span>
            <span className="text-[#089981]/60">·</span>
            <span className="font-mono tabular-nums flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {time || '09:30 EST'}
            </span>
          </div>

          {/* Live Feed Toggle */}
          <button
            onClick={() => setLiveFeedActive(!liveFeedActive)}
            title={liveFeedActive ? 'Live Market Ticks Active' : 'Market Ticks Paused'}
            className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors border ${
              liveFeedActive
                ? 'bg-[#e6f5f2] dark:bg-[#089981]/20 text-[#089981] border-[#089981]/30'
                : 'bg-[#f1f3ff] dark:bg-[#1e222d] text-[#5a5e6b] dark:text-[#848e9c] border-[#e0e3eb] dark:border-[#2a2e39]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span className="text-[11px] font-semibold">{liveFeedActive ? 'Live Ticks' : 'Static'}</span>
          </button>

          {/* Watchlist button with counter */}
          <button
            onClick={onOpenWatchlist}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md bg-[#f1f3ff] dark:bg-[#1e222d] text-[#181b24] dark:text-[#f0f3fa] hover:bg-[#e5e8f4] dark:hover:bg-[#2a2e39] border border-[#e0e3eb] dark:border-[#2a2e39] transition-colors"
          >
            <Star className="w-3.5 h-3.5 text-[#f59e0b] fill-[#f59e0b]" />
            <span className="hidden sm:inline">Watchlist</span>
            {watchlistCount > 0 && (
              <span className="px-1.5 py-0.2 bg-[#2962ff] text-white text-[10px] font-bold rounded-full">
                {watchlistCount}
              </span>
            )}
          </button>

          {/* Country Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => setCountryMenuOpen(!countryMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1.5 text-xs font-medium rounded-md bg-[#f1f3ff] dark:bg-[#1e222d] text-[#181b24] dark:text-[#d1d4dc] hover:bg-[#e5e8f4] dark:hover:bg-[#2a2e39] border border-[#e0e3eb] dark:border-[#2a2e39] transition-colors"
              title="Select Market Region"
            >
              <span>{countries.find((c) => c.code === selectedCountry)?.flag}</span>
              <span className="hidden sm:inline text-xs font-semibold">{selectedCountry}</span>
              <ChevronDown className="w-3 h-3 text-[#737687]" />
            </button>

            {countryMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] rounded-lg shadow-xl py-1 z-50">
                <div className="px-3 py-1 text-[10px] font-semibold text-[#737687] uppercase tracking-wider">
                  Select Market Region
                </div>
                {countries.map((c) => (
                  <button
                    key={c.code}
                    onClick={() => {
                      setSelectedCountry(c.code);
                      setCountryMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs text-left transition-colors ${
                      selectedCountry === c.code
                        ? 'bg-[#2962ff]/10 text-[#2962ff] font-semibold'
                        : 'text-[#181b24] dark:text-[#d1d4dc] hover:bg-[#f1f3ff] dark:hover:bg-[#2a2e39]'
                    }`}
                  >
                    <span className="text-base">{c.flag}</span>
                    <span className="flex-1">{c.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark / Light Mode Toggle */}
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="p-1.5 rounded-md text-[#5a5e6b] dark:text-[#848e9c] hover:text-[#181b24] dark:hover:text-[#f0f3fa] hover:bg-[#f1f3ff] dark:hover:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] transition-colors"
            title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-[#f59e0b]" /> : <Moon className="w-4 h-4 text-[#5a5e6b]" />}
          </button>
        </div>
      </div>
    </header>
  );
};
