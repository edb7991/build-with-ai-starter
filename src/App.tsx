import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Car,
  Bookmark,
  Layers,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  SlidersHorizontal,
} from 'lucide-react';
import {
  Carpark,
  FilterOptions,
  UserSimulatedLocation,
} from './types/carpark';
import {
  INITIAL_CARPARKS,
  SIMULATED_LOCATIONS,
} from './data/singaporeCarparks';
import { calculateDistanceKm } from './utils/distance';
import { Header } from './components/Header';
import { FilterBar } from './components/FilterBar';
import { CarparkCard } from './components/CarparkCard';
import { CarparkMap } from './components/CarparkMap';
import { CarparkDetailModal } from './components/CarparkDetailModal';
import { FeeCalculatorModal } from './components/FeeCalculatorModal';
import { BackendIntegrationModal } from './components/BackendIntegrationModal';
import { ComparisonModal } from './components/ComparisonModal';
import { NotificationToast, ToastMessage } from './components/NotificationToast';

const LOCAL_STORAGE_FAVORITES_KEY = 'parksg_favorites';
const LOCAL_STORAGE_ALERTS_KEY = 'parksg_alerts';

export default function App() {
  // State: Carpark Data
  const [carparks, setCarparks] = useState<Carpark[]>(() => {
    // Hydrate favorites from localStorage
    try {
      const savedFavorites = localStorage.getItem(LOCAL_STORAGE_FAVORITES_KEY);
      if (savedFavorites) {
        const favIds: string[] = JSON.parse(savedFavorites);
        return INITIAL_CARPARKS.map((cp) => ({
          ...cp,
          isFavorite: favIds.includes(cp.id),
        }));
      }
    } catch {
      // fallback
    }
    return INITIAL_CARPARKS;
  });

  // State: Active Alerts { [carparkId]: threshold }
  const [activeAlerts, setActiveAlerts] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // State: Driver Simulated Location
  const [currentLocation, setCurrentLocation] = useState<UserSimulatedLocation>(
    SIMULATED_LOCATIONS[0]
  );
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // State: Simulation & Real-time Telemetry
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date>(new Date());

  // State: Filters
  const [filters, setFilters] = useState<FilterOptions>({
    searchQuery: '',
    region: 'all',
    agency: 'all',
    vehicleType: 'all',
    hasEVOnly: false,
    minAvailabilityPercent: 0,
    minHeightMeters: 0,
    sortBy: 'distance-asc',
  });

  // State: View Mode ('split' | 'map' | 'grid')
  const [viewMode, setViewMode] = useState<'split' | 'map' | 'grid'>('split');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState<boolean>(false);

  // State: Modals & Selection
  const [selectedCarpark, setSelectedCarpark] = useState<Carpark | null>(null);
  const [comparedCarparks, setComparedCarparks] = useState<Carpark[]>([]);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [calculatorCarpark, setCalculatorCarpark] = useState<Carpark | null>(null);
  const [isBackendModalOpen, setIsBackendModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // State: Backend API custom endpoint
  const [customApiUrl, setCustomApiUrl] = useState<string>('');
  const [isUsingCustomApi, setIsUsingCustomApi] = useState<boolean>(false);

  // State: Toasts
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((toast: Omit<ToastMessage, 'id'>) => {
    const id = Date.now().toString() + Math.random().toString().slice(2, 6);
    setToasts((prev) => [...prev.slice(-3), { ...toast, id }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  }, []);

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Browser Geolocation
  const handleUseBrowserLocation = () => {
    if (!navigator.geolocation) {
      addToast({
        title: 'Geolocation Not Supported',
        message: 'Your browser does not support GPS location.',
        type: 'warning',
      });
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude } = position.coords;
        setCurrentLocation({
          id: 'user-gps',
          name: 'My GPS Location',
          coords: { lat: latitude, lng: longitude },
        });
        addToast({
          title: 'GPS Location Locked',
          message: `Coordinates updated: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`,
          type: 'success',
        });
      },
      (error) => {
        setIsLocating(false);
        addToast({
          title: 'Location Access Denied',
          message: 'Using default Orchard Road simulator location instead.',
          type: 'warning',
        });
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Favorite toggle
  const handleToggleFavorite = (id: string) => {
    setCarparks((prev) => {
      const next = prev.map((cp) =>
        cp.id === id ? { ...cp, isFavorite: !cp.isFavorite } : cp
      );
      const favIds = next.filter((cp) => cp.isFavorite).map((cp) => cp.id);
      try {
        localStorage.setItem(LOCAL_STORAGE_FAVORITES_KEY, JSON.stringify(favIds));
      } catch {}
      return next;
    });

    const target = carparks.find((c) => c.id === id);
    if (target) {
      const willBeFav = !target.isFavorite;
      addToast({
        title: willBeFav ? 'Added to Watchlist' : 'Removed from Watchlist',
        message: `${target.name} has been ${willBeFav ? 'saved' : 'removed'}.`,
        type: 'info',
      });
    }
  };

  // Compare toggle
  const handleToggleCompare = (carpark: Carpark) => {
    setComparedCarparks((prev) => {
      const exists = prev.some((c) => c.id === carpark.id);
      if (exists) {
        return prev.filter((c) => c.id !== carpark.id);
      }
      if (prev.length >= 3) {
        addToast({
          title: 'Comparison Limit Reached',
          message: 'You can compare up to 3 carparks at once. Remove one first.',
          type: 'warning',
        });
        return prev;
      }
      addToast({
        title: 'Added to Comparison',
        message: `${carpark.name} added to comparison queue.`,
        type: 'info',
      });
      return [...prev, carpark];
    });
  };

  // Set Lot Alert
  const handleSetLotAlert = (carparkId: string, carparkName: string, threshold: number) => {
    setActiveAlerts((prev) => {
      const next = { ...prev, [carparkId]: threshold };
      try {
        localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
    addToast({
      title: 'Alert Configured',
      message: `We will alert you if ${carparkName} drops below ${threshold} lots.`,
      type: 'success',
    });
  };

  // Real-Time Gantry Fluctuation Engine (Simulates live arrivals & departures)
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setCarparks((prevCarparks) => {
        // Pick 2-4 carparks to update lots
        const countToUpdate = Math.floor(Math.random() * 3) + 2;
        const indices = new Set<number>();
        while (indices.size < countToUpdate) {
          indices.add(Math.floor(Math.random() * prevCarparks.length));
        }

        return prevCarparks.map((cp, idx) => {
          if (!indices.has(idx)) {
            return cp;
          }

          // Random delta between -4 and +5 lots
          const delta = Math.floor(Math.random() * 10) - 4;
          const newAvailable = Math.max(0, Math.min(cp.totalLots, cp.availableLots + delta));

          // Check if triggered threshold alert
          const alertThresh = activeAlerts[cp.id];
          if (alertThresh && newAvailable < alertThresh && cp.availableLots >= alertThresh) {
            addToast({
              title: `⚠️ Lot Alert: ${cp.name}`,
              message: `Available lots dropped to ${newAvailable} (below your alert threshold of ${alertThresh})!`,
              type: 'alert',
            });
          }

          const carAvailable = Math.max(
            0,
            Math.min(cp.lotTypes.cars.total, cp.lotTypes.cars.available + delta)
          );

          return {
            ...cp,
            availableLots: newAvailable,
            lotTypes: {
              ...cp.lotTypes,
              cars: {
                ...cp.lotTypes.cars,
                available: carAvailable,
              },
            },
            deltaLots: delta,
            lastUpdated: 'Just now',
          };
        });
      });
      setLastSyncTime(new Date());
    }, 15000); // every 15s

    return () => clearInterval(interval);
  }, [isSimulating, activeAlerts, addToast]);

  // Manual Refresh Handler
  const handleManualRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastSyncTime(new Date());
      addToast({
        title: 'Carpark Availability Synced',
        message: 'Refreshed latest Singapore EPS gantry status for all lots.',
        type: 'success',
      });
    }, 800);
  };

  // Quick Fee Calculator launcher
  const handleQuickCalculate = (carpark: Carpark) => {
    setCalculatorCarpark(carpark);
    setIsCalculatorOpen(true);
  };

  // Calculate distance for all carparks and filter
  const filteredAndSortedCarparks = useMemo(() => {
    let result = carparks.map((cp) => {
      const dist = calculateDistanceKm(
        currentLocation.coords.lat,
        currentLocation.coords.lng,
        cp.coordinates.lat,
        cp.coordinates.lng
      );
      return { ...cp, currentDistance: dist };
    });

    // Watchlist filter
    if (showOnlyFavorites) {
      result = result.filter((cp) => cp.isFavorite);
    }

    // Search query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.toLowerCase().trim();
      result = result.filter(
        (cp) =>
          cp.name.toLowerCase().includes(q) ||
          cp.carparkNumber.toLowerCase().includes(q) ||
          cp.address.toLowerCase().includes(q) ||
          cp.postalCode.includes(q) ||
          cp.agency.toLowerCase().includes(q)
      );
    }

    // Region filter
    if (filters.region && filters.region !== 'all') {
      result = result.filter((cp) => cp.region === filters.region);
    }

    // Agency filter
    if (filters.agency && filters.agency !== 'all') {
      result = result.filter((cp) => cp.agency === filters.agency);
    }

    // Vehicle Type filter
    if (filters.vehicleType === 'cars') {
      result = result.filter((cp) => cp.lotTypes.cars.total > 0);
    } else if (filters.vehicleType === 'motorcycles') {
      result = result.filter((cp) => (cp.lotTypes.motorcycles?.total || 0) > 0);
    }

    // EV Charging
    if (filters.hasEVOnly) {
      result = result.filter((cp) => cp.evCharging?.hasEV && cp.evCharging.availableChargers > 0);
    }

    // Min Height clearance
    if (filters.minHeightMeters > 0) {
      result = result.filter((cp) => cp.heightLimitMeters >= filters.minHeightMeters);
    }

    // Sorting
    result.sort((a, b) => {
      if (filters.sortBy === 'distance-asc') {
        return a.currentDistance - b.currentDistance;
      }
      if (filters.sortBy === 'availability-desc') {
        const percA = a.availableLots / a.totalLots;
        const percB = b.availableLots / b.totalLots;
        return percB - percA;
      }
      if (filters.sortBy === 'lots-desc') {
        return b.availableLots - a.availableLots;
      }
      if (filters.sortBy === 'price-asc') {
        return a.rates.estimatedPerHourDay - b.rates.estimatedPerHourDay;
      }
      if (filters.sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      return 0;
    });

    return result;
  }, [carparks, currentLocation, filters, showOnlyFavorites]);

  const favoritesCount = useMemo(
    () => carparks.filter((c) => c.isFavorite).length,
    [carparks]
  );

  return (
    <div className="min-h-screen bg-[#f8f9fd] flex flex-col font-sans text-[#181b24]">
      {/* Top Header */}
      <Header
        currentLocation={currentLocation}
        onLocationChange={setCurrentLocation}
        onUseBrowserLocation={handleUseBrowserLocation}
        isLocating={isLocating}
        carparks={carparks}
        favoritesCount={favoritesCount}
        compareCount={comparedCarparks.length}
        onOpenCalculator={() => {
          setCalculatorCarpark(null);
          setIsCalculatorOpen(true);
        }}
        onOpenBackendModal={() => setIsBackendModalOpen(true)}
        onOpenFavorites={() => setShowOnlyFavorites(!showOnlyFavorites)}
        onOpenCompare={() => setIsCompareModalOpen(true)}
        isSimulating={isSimulating}
        onToggleSimulating={() => setIsSimulating(!isSimulating)}
        onManualRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        lastSyncTime={lastSyncTime}
      />

      {/* Filter and View Control Bar */}
      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        totalFilteredCount={filteredAndSortedCarparks.length}
      />

      {/* Main Content Workspace */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Watchlist Active Notice */}
        {showOnlyFavorites && (
          <div className="bg-[#fef3c7] border-b border-[#fde68a] px-4 py-2 flex items-center justify-between text-xs text-[#92400e]">
            <div className="flex items-center gap-2">
              <Bookmark className="w-4 h-4 fill-current" />
              <span>Showing <strong>{filteredAndSortedCarparks.length}</strong> saved watchlisted carparks only</span>
            </div>
            <button
              onClick={() => setShowOnlyFavorites(false)}
              className="font-bold underline cursor-pointer hover:text-black"
            >
              Show All Carparks
            </button>
          </div>
        )}

        {/* 1. Split View (Map on Top/Side + Cards on Side/Bottom) */}
        {viewMode === 'split' && (
          <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
            {/* Map Area */}
            <div className="w-full lg:w-1/2 h-[350px] lg:h-full border-b lg:border-b-0 lg:border-r border-[#e0e3eb] relative">
              <CarparkMap
                carparks={filteredAndSortedCarparks}
                userLocation={currentLocation}
                selectedCarpark={selectedCarpark}
                onSelectCarpark={setSelectedCarpark}
                onQuickCalculate={handleQuickCalculate}
              />
            </div>

            {/* List / Cards Area */}
            <div className="w-full lg:w-1/2 flex-1 overflow-y-auto p-4 space-y-3 bg-[#faf9ff]">
              <div className="flex items-center justify-between text-xs text-[#5a5e6b] mb-1">
                <span>
                  Showing {filteredAndSortedCarparks.length} carparks near{' '}
                  <strong className="text-[#181b24]">{currentLocation.name}</strong>
                </span>
                <span className="text-[#089981] font-semibold flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#089981] animate-pulse" />
                  Live Lots Feed
                </span>
              </div>

              {filteredAndSortedCarparks.length === 0 ? (
                <div className="p-8 text-center bg-white rounded-xl border border-[#e0e3eb]">
                  <AlertTriangle className="w-8 h-8 text-[#d97706] mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-[#181b24]">No carparks match your filter</h4>
                  <p className="text-xs text-[#5a5e6b] mt-1 mb-3">
                    Try adjusting your search keyword, region pills, or vehicle/height filters.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        searchQuery: '',
                        region: 'all',
                        agency: 'all',
                        vehicleType: 'all',
                        hasEVOnly: false,
                        minAvailabilityPercent: 0,
                        minHeightMeters: 0,
                        sortBy: 'distance-asc',
                      });
                      setShowOnlyFavorites(false);
                    }}
                    className="cursor-pointer text-xs font-semibold px-3 py-1.5 bg-[#ebedfa] hover:bg-[#dfe2f2] text-[#0049db] rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredAndSortedCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      distanceKm={cp.currentDistance}
                      isSelected={selectedCarpark?.id === cp.id}
                      isCompared={comparedCarparks.some((c) => c.id === cp.id)}
                      onSelect={setSelectedCarpark}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleCompare={handleToggleCompare}
                      onQuickCalculate={handleQuickCalculate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 2. Map-Only Full View */}
        {viewMode === 'map' && (
          <div className="flex-1 relative">
            <CarparkMap
              carparks={filteredAndSortedCarparks}
              userLocation={currentLocation}
              selectedCarpark={selectedCarpark}
              onSelectCarpark={setSelectedCarpark}
              onQuickCalculate={handleQuickCalculate}
            />

            {/* Floating Top Results Drawer on Map */}
            <div className="absolute top-4 left-4 z-20 max-w-sm w-full hidden sm:block pointer-events-none">
              <div className="bg-white/95 backdrop-blur-md border border-[#e0e3eb] rounded-xl p-3 shadow-lg pointer-events-auto max-h-[70vh] flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-[#ebedfa] mb-2 text-xs">
                  <span className="font-bold text-[#181b24]">
                    Top Nearest Carparks ({filteredAndSortedCarparks.length})
                  </span>
                  <span className="text-[#0049db] font-semibold text-[11px]">
                    Near {currentLocation.name.split(' ')[0]}
                  </span>
                </div>

                <div className="overflow-y-auto space-y-1.5 pr-1">
                  {filteredAndSortedCarparks.slice(0, 6).map((cp) => (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedCarpark(cp)}
                      className={`p-2 rounded-lg border text-xs cursor-pointer transition-colors ${
                        selectedCarpark?.id === cp.id
                          ? 'bg-[#f1f3ff] border-[#0049db]'
                          : 'bg-white border-[#e0e3eb] hover:bg-[#faf9ff]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className="font-bold text-[#181b24] truncate max-w-[190px]">
                          {cp.name}
                        </span>
                        <span className="font-mono-num font-bold text-[#089981]">
                          {cp.availableLots} lots
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#737687]">
                        <span>{cp.agency} • ~S${cp.rates.estimatedPerHourDay.toFixed(2)}/hr</span>
                        <span>{cp.currentDistance.toFixed(1)} km</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3. Grid / Terminal Data View */}
        {viewMode === 'grid' && (
          <div className="flex-1 overflow-y-auto p-4 lg:p-6 bg-[#f8f9fd]">
            <div className="max-w-7xl mx-auto space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-bold text-base text-[#181b24]">
                    Singapore Real-Time Carpark Directory
                  </h2>
                  <p className="text-xs text-[#5a5e6b]">
                    Displaying {filteredAndSortedCarparks.length} carparks sorted by{' '}
                    <strong>{filters.sortBy}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#737687]">
                    Current Anchor: <strong className="text-[#0049db]">{currentLocation.name}</strong>
                  </span>
                </div>
              </div>

              {filteredAndSortedCarparks.length === 0 ? (
                <div className="p-12 text-center bg-white rounded-2xl border border-[#e0e3eb]">
                  <AlertTriangle className="w-10 h-10 text-[#d97706] mx-auto mb-2" />
                  <h4 className="font-bold text-base text-[#181b24]">No carparks found</h4>
                  <p className="text-xs text-[#5a5e6b] mt-1 mb-4">
                    None of the carparks match your selected filters.
                  </p>
                  <button
                    onClick={() => {
                      setFilters({
                        searchQuery: '',
                        region: 'all',
                        agency: 'all',
                        vehicleType: 'all',
                        hasEVOnly: false,
                        minAvailabilityPercent: 0,
                        minHeightMeters: 0,
                        sortBy: 'distance-asc',
                      });
                      setShowOnlyFavorites(false);
                    }}
                    className="cursor-pointer text-xs font-semibold px-4 py-2 bg-[#0049db] hover:bg-[#003ab3] text-white rounded-lg transition-colors inline-flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Reset All Filters
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
                  {filteredAndSortedCarparks.map((cp) => (
                    <CarparkCard
                      key={cp.id}
                      carpark={cp}
                      distanceKm={cp.currentDistance}
                      isSelected={selectedCarpark?.id === cp.id}
                      isCompared={comparedCarparks.some((c) => c.id === cp.id)}
                      onSelect={setSelectedCarpark}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleCompare={handleToggleCompare}
                      onQuickCalculate={handleQuickCalculate}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer / Terminal Status Bar */}
      <footer className="bg-white border-t border-[#e0e3eb] px-4 py-2.5 text-xs text-[#5a5e6b] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#181b24]">ParkSG Terminal</span>
          <span className="text-[#c3c5d8]">|</span>
          <span>Open Data Standard: Data.gov.sg & LTA DataMall v2 Compatible</span>
        </div>

        <div className="flex items-center gap-4">
          <span>
            Telemetry Sync: <span className="font-mono-num font-medium text-[#181b24]">{lastSyncTime.toLocaleTimeString()}</span>
          </span>
          <button
            onClick={() => setIsBackendModalOpen(true)}
            className="text-[#0049db] hover:underline font-semibold cursor-pointer"
          >
            Backend Integration Guide →
          </button>
        </div>
      </footer>

      {/* Modals & Dialogs */}
      {selectedCarpark && (
        <CarparkDetailModal
          carpark={selectedCarpark}
          distanceKm={calculateDistanceKm(
            currentLocation.coords.lat,
            currentLocation.coords.lng,
            selectedCarpark.coordinates.lat,
            selectedCarpark.coordinates.lng
          )}
          onClose={() => setSelectedCarpark(null)}
          onToggleFavorite={handleToggleFavorite}
          onSetLotAlert={handleSetLotAlert}
          activeAlertThreshold={activeAlerts[selectedCarpark.id]}
        />
      )}

      {isCalculatorOpen && (
        <FeeCalculatorModal
          carparks={carparks}
          initialCarpark={calculatorCarpark}
          onClose={() => setIsCalculatorOpen(false)}
          onSelectCarpark={(cp) => {
            setSelectedCarpark(cp);
          }}
        />
      )}

      {isBackendModalOpen && (
        <BackendIntegrationModal
          onClose={() => setIsBackendModalOpen(false)}
          customApiUrl={customApiUrl}
          onSaveCustomApiUrl={setCustomApiUrl}
          isUsingCustomApi={isUsingCustomApi}
          onToggleUseCustomApi={setIsUsingCustomApi}
        />
      )}

      {isCompareModalOpen && (
        <ComparisonModal
          carparks={comparedCarparks}
          userLocation={currentLocation}
          onClose={() => setIsCompareModalOpen(false)}
          onRemoveCompare={(id) => {
            setComparedCarparks((prev) => prev.filter((c) => c.id !== id));
          }}
          onSelectCarpark={(cp) => {
            setSelectedCarpark(cp);
            setIsCompareModalOpen(false);
          }}
          onClearAll={() => setComparedCarparks([])}
        />
      )}

      {/* In-app Toast Messages */}
      <NotificationToast toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
