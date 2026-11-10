import React, { useState, useEffect } from 'react';
import {
  Car,
  Clock,
  Radio,
  MapPin,
  Calculator,
  Code2,
  Bookmark,
  RefreshCw,
  GitCompare,
  SlidersHorizontal,
  ChevronDown,
} from 'lucide-react';
import { UserSimulatedLocation, Carpark } from '../types/carpark';
import { SIMULATED_LOCATIONS } from '../data/singaporeCarparks';

interface HeaderProps {
  currentLocation: UserSimulatedLocation;
  onLocationChange: (loc: UserSimulatedLocation) => void;
  onUseBrowserLocation: () => void;
  isLocating: boolean;
  carparks: Carpark[];
  favoritesCount: number;
  compareCount: number;
  onOpenCalculator: () => void;
  onOpenBackendModal: () => void;
  onOpenFavorites: () => void;
  onOpenCompare: () => void;
  isSimulating: boolean;
  onToggleSimulating: () => void;
  onManualRefresh: () => void;
  isRefreshing: boolean;
  lastSyncTime: Date;
}

export const Header: React.FC<HeaderProps> = ({
  currentLocation,
  onLocationChange,
  onUseBrowserLocation,
  isLocating,
  carparks,
  favoritesCount,
  compareCount,
  onOpenCalculator,
  onOpenBackendModal,
  onOpenFavorites,
  onOpenCompare,
  isSimulating,
  onToggleSimulating,
  onManualRefresh,
  isRefreshing,
  lastSyncTime,
}) => {
  const [sgTime, setSgTime] = useState<string>('');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Keep live Singapore Time (SGT UTC+8)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const formatted = new Intl.DateTimeFormat('en-SG', {
        timeZone: 'Asia/Singapore',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }).format(now);
      setSgTime(formatted);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Compute aggregate stats across tracked carparks
  const totalLots = carparks.reduce((sum, cp) => sum + cp.totalLots, 0);
  const totalAvailable = carparks.reduce((sum, cp) => sum + cp.availableLots, 0);
  const overallOccupancy = totalLots > 0 ? Math.round(((totalLots - totalAvailable) / totalLots) * 100) : 0;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-[#e0e3eb] shadow-xs">
      {/* Top Telemetry & Status Bar */}
      <div className="bg-[#faf9ff] border-b border-[#ebedfa] px-4 py-1.5 flex flex-wrap items-center justify-between text-xs text-[#5a5e6b]">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 font-medium text-[#181b24]">
            <span className="relative flex h-2 w-2">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-[#089981]' : 'bg-[#737687]'}`}></span>
              <span className={`relative inline-flex rounded-full h-2 w-2 ${isSimulating ? 'bg-[#089981]' : 'bg-[#737687]'}`}></span>
            </span>
            <span className="font-mono-num uppercase tracking-wider text-[11px] font-semibold text-[#0049db]">
              {isSimulating ? 'LIVE FEED ACTIVE' : 'TELEMETRY PAUSED'}
            </span>
          </span>
          <span className="text-[#c3c5d8]">|</span>
          <span className="hidden sm:inline-flex items-center gap-1 text-[#434656]">
            <Radio className="w-3.5 h-3.5 text-[#0049db]" />
            <span>Singapore EPS Gantry Network</span>
          </span>
          <span className="text-[#c3c5d8] hidden sm:inline">|</span>
          <span className="hidden md:inline-flex items-center gap-1">
            <span className="text-[#737687]">Tracked Carparks:</span>
            <span className="font-mono-num font-semibold text-[#181b24]">{carparks.length}</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[#434656]">
            <Clock className="w-3.5 h-3.5 text-[#737687]" />
            <span className="font-mono-num font-medium text-[#181b24]">{sgTime || '20:30:00'}</span>
            <span className="text-[10px] bg-[#ebedfa] text-[#5a5e6b] px-1 py-0.5 rounded font-medium">SGT</span>
          </div>

          <span className="text-[#c3c5d8]">|</span>

          <button
            onClick={onToggleSimulating}
            className={`cursor-pointer px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
              isSimulating
                ? 'bg-[#e6f5f2] text-[#006554] hover:bg-[#d9fff2]'
                : 'bg-[#ebedfa] text-[#5a5e6b] hover:bg-[#dfe2f2]'
            }`}
            title={isSimulating ? 'Pause simulated real-time gantry feed' : 'Resume real-time gantry feed'}
          >
            {isSimulating ? 'Simulating (15s)' : 'Simulation Off'}
          </button>

          <button
            onClick={onManualRefresh}
            disabled={isRefreshing}
            className="cursor-pointer inline-flex items-center gap-1 px-2 py-0.5 rounded bg-[#ebedfa] hover:bg-[#dfe2f2] text-[#181b24] text-[11px] font-medium transition-colors disabled:opacity-50"
            title="Force sync availability data"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#0049db]' : ''}`} />
            <span className="hidden sm:inline">Sync</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Brand & App Title */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#0049db] to-[#2962ff] flex items-center justify-center text-white shadow-xs">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-lg text-[#181b24] tracking-tight flex items-center gap-1.5">
                ParkSG <span className="text-[#0049db] font-extrabold text-sm px-1.5 py-0.2 bg-[#dce1ff] rounded">TERMINAL</span>
              </h1>
              <span className="hidden lg:inline text-[11px] font-semibold text-[#006554] bg-[#e6f5f2] px-2 py-0.5 rounded-full border border-[#84f7db]">
                SG REAL-TIME LOTS
              </span>
            </div>
            <p className="text-xs text-[#5a5e6b] hidden sm:block">
              Singapore Real-Time Carpark Availability & Rates
            </p>
          </div>
        </div>

        {/* Global Key Metrics summary on larger screens */}
        <div className="hidden xl:flex items-center gap-4 bg-[#f8f9fd] border border-[#e0e3eb] rounded-lg px-3 py-1.5 text-xs">
          <div>
            <div className="text-[10px] text-[#737687] uppercase font-semibold">Total Capacity</div>
            <div className="font-mono-num font-bold text-[#181b24] text-sm">{totalLots.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-[#e0e3eb]" />
          <div>
            <div className="text-[10px] text-[#737687] uppercase font-semibold">Available Lots</div>
            <div className="font-mono-num font-bold text-[#089981] text-sm">{totalAvailable.toLocaleString()}</div>
          </div>
          <div className="h-6 w-px bg-[#e0e3eb]" />
          <div>
            <div className="text-[10px] text-[#737687] uppercase font-semibold">Occupancy Rate</div>
            <div className="font-mono-num font-bold text-[#181b24] text-sm">{overallOccupancy}%</div>
          </div>
        </div>

        {/* Simulated Location & Quick Tools */}
        <div className="flex items-center gap-2">
          {/* Location Picker */}
          <div className="relative">
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#c3c5d8] bg-white hover:bg-[#f1f3ff] text-xs font-medium text-[#181b24] transition-colors shadow-2xs"
            >
              <MapPin className="w-3.5 h-3.5 text-[#0049db]" />
              <span className="truncate max-w-[130px] sm:max-w-[180px] font-medium text-left">
                {currentLocation.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-[#737687]" />
            </button>

            {showLocationDropdown && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowLocationDropdown(false)}
                />
                <div className="absolute right-0 mt-1.5 w-72 bg-white rounded-xl shadow-lg border border-[#e0e3eb] p-2 z-40 text-xs">
                  <div className="px-2 py-1 font-semibold text-[#181b24] text-[11px] uppercase tracking-wider text-[#737687]">
                    Simulate Driver Location
                  </div>

                  <button
                    onClick={() => {
                      onUseBrowserLocation();
                      setShowLocationDropdown(false);
                    }}
                    disabled={isLocating}
                    className="w-full text-left px-2.5 py-2 rounded-lg bg-[#ebedfa] hover:bg-[#dfe2f2] text-[#0049db] font-semibold flex items-center justify-between mb-1 transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5" />
                      {isLocating ? 'Detecting GPS...' : 'Use My Actual GPS Location'}
                    </span>
                    <span className="text-[10px] bg-[#dce1ff] text-[#001550] px-1.5 py-0.5 rounded">GPS</span>
                  </button>

                  <div className="h-px bg-[#e0e3eb] my-1" />

                  <div className="max-h-52 overflow-y-auto space-y-0.5">
                    {SIMULATED_LOCATIONS.map((loc) => {
                      const isSelected = loc.id === currentLocation.id;
                      return (
                        <button
                          key={loc.id}
                          onClick={() => {
                            onLocationChange(loc);
                            setShowLocationDropdown(false);
                          }}
                          className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            isSelected
                              ? 'bg-[#e6f5f2] text-[#006554] font-semibold'
                              : 'text-[#434656] hover:bg-[#f1f3ff]'
                          }`}
                        >
                          <span className="truncate">{loc.name}</span>
                          {isSelected && <span className="text-[10px] text-[#089981]">● Active</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Fee Calculator Button */}
          <button
            onClick={onOpenCalculator}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f1f3ff] hover:bg-[#e0e2ee] text-xs font-semibold text-[#0049db] transition-colors border border-[#c3c5d8]"
            title="Open Singapore Parking Fee Estimator"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Rate Calc</span>
          </button>

          {/* Comparison Modal Trigger */}
          <button
            onClick={onOpenCompare}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              compareCount > 0
                ? 'bg-[#2962ff] text-white border-[#0049db]'
                : 'bg-white hover:bg-[#f1f3ff] text-[#5a5e6b] border-[#c3c5d8]'
            }`}
            title="Compare selected carparks"
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compare</span>
            {compareCount > 0 && (
              <span className="px-1.5 py-0.2 text-[10px] bg-white text-[#0049db] rounded-full font-bold">
                {compareCount}
              </span>
            )}
          </button>

          {/* Favorites Button */}
          <button
            onClick={onOpenFavorites}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors border ${
              favoritesCount > 0
                ? 'bg-[#fef3c7] text-[#92400e] border-[#fde68a]'
                : 'bg-white hover:bg-[#f1f3ff] text-[#5a5e6b] border-[#c3c5d8]'
            }`}
            title="Saved carparks"
          >
            <Bookmark className="w-3.5 h-3.5 fill-current" />
            {favoritesCount > 0 && (
              <span className="font-mono-num text-[11px] font-bold">{favoritesCount}</span>
            )}
          </button>

          {/* Backend / API Specs Button */}
          <button
            onClick={onOpenBackendModal}
            className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#181b24] hover:bg-[#2d303a] text-white text-xs font-semibold transition-colors shadow-2xs"
            title="API Specs and Backend Connection Setup"
          >
            <Code2 className="w-3.5 h-3.5 text-[#84f7db]" />
            <span className="hidden md:inline">Backend API</span>
          </button>
        </div>
      </div>
    </header>
  );
};
