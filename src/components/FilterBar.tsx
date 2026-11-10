import React from 'react';
import {
  Search,
  Zap,
  ArrowUpDown,
  Filter,
  Map as MapIcon,
  LayoutGrid,
  Columns2,
  X,
  Gauge,
  ShieldAlert,
} from 'lucide-react';
import { FilterOptions } from '../types/carpark';

interface FilterBarProps {
  filters: FilterOptions;
  onFilterChange: (newFilters: FilterOptions) => void;
  viewMode: 'split' | 'map' | 'grid';
  onViewModeChange: (mode: 'split' | 'map' | 'grid') => void;
  totalFilteredCount: number;
}

const REGIONS = [
  'All Regions',
  'Central / CBD',
  'Orchard & Downtown',
  'East',
  'West',
  'North',
  'North-East',
];

const AGENCIES = [
  { label: 'All Agencies', value: 'all' },
  { label: 'HDB Housing', value: 'HDB' },
  { label: 'Commercial / Malls', value: 'COMMERCIAL' },
  { label: 'URA Public Lots', value: 'URA' },
  { label: 'Hospitals', value: 'HOSPITAL' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  viewMode,
  onViewModeChange,
  totalFilteredCount,
}) => {
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({ ...filters, searchQuery: e.target.value });
  };

  const clearSearch = () => {
    onFilterChange({ ...filters, searchQuery: '' });
  };

  const handleRegionSelect = (region: string) => {
    onFilterChange({ ...filters, region: region === 'All Regions' ? 'all' : region });
  };

  return (
    <div className="bg-white border-b border-[#e0e3eb] px-4 py-3 space-y-3">
      {/* Top Search & Primary Controls */}
      <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        {/* Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#737687]" />
          <input
            type="text"
            placeholder="Search by Carpark Name, Code (e.g. MBS, ACB, JWL), Street, or Postal Code..."
            value={filters.searchQuery}
            onChange={handleSearch}
            className="w-full pl-9 pr-9 py-2 text-xs bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg focus:outline-none focus:border-[#0049db] focus:bg-white text-[#181b24] placeholder-[#737687] transition-all"
          />
          {filters.searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#737687] hover:text-[#181b24] cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Quick Filter Selectors & View Switcher */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Agency Dropdown */}
          <select
            value={filters.agency}
            onChange={(e) => onFilterChange({ ...filters, agency: e.target.value })}
            className="text-xs bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg px-2.5 py-2 text-[#181b24] font-medium cursor-pointer focus:outline-none focus:border-[#0049db]"
          >
            {AGENCIES.map((ag) => (
              <option key={ag.value} value={ag.value}>
                {ag.label}
              </option>
            ))}
          </select>

          {/* Vehicle Type */}
          <select
            value={filters.vehicleType}
            onChange={(e) =>
              onFilterChange({
                ...filters,
                vehicleType: e.target.value as 'all' | 'cars' | 'motorcycles',
              })
            }
            className="text-xs bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg px-2.5 py-2 text-[#181b24] font-medium cursor-pointer focus:outline-none focus:border-[#0049db]"
          >
            <option value="all">🚗 All Vehicles</option>
            <option value="cars">🚗 Cars Only</option>
            <option value="motorcycles">🏍️ Motorcycles Only</option>
          </select>

          {/* EV Charging Filter Toggle */}
          <button
            onClick={() => onFilterChange({ ...filters, hasEVOnly: !filters.hasEVOnly })}
            className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold border transition-colors ${
              filters.hasEVOnly
                ? 'bg-[#e6f5f2] border-[#089981] text-[#006554]'
                : 'bg-[#f8f9fd] border-[#c3c5d8] text-[#5a5e6b] hover:bg-[#ebedfa]'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${filters.hasEVOnly ? 'fill-current text-[#089981]' : ''}`} />
            <span>EV Charging</span>
          </button>

          {/* Height limit */}
          <select
            value={filters.minHeightMeters}
            onChange={(e) =>
              onFilterChange({ ...filters, minHeightMeters: parseFloat(e.target.value) })
            }
            className="text-xs bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg px-2 py-2 text-[#181b24] font-medium cursor-pointer focus:outline-none focus:border-[#0049db]"
            title="Minimum clearance height"
          >
            <option value="0">Any Height</option>
            <option value="1.9">Height ≥ 1.9m</option>
            <option value="2.0">Height ≥ 2.0m (SUV)</option>
            <option value="2.15">Height ≥ 2.15m (Van/Van Roof)</option>
          </select>

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1 bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg px-2 py-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#737687]" />
            <select
              value={filters.sortBy}
              onChange={(e) =>
                onFilterChange({
                  ...filters,
                  sortBy: e.target.value as FilterOptions['sortBy'],
                })
              }
              className="text-xs bg-transparent text-[#181b24] font-semibold cursor-pointer focus:outline-none py-1"
            >
              <option value="distance-asc">Nearest Distance</option>
              <option value="availability-desc">Availability % (High to Low)</option>
              <option value="lots-desc">Most Available Lots</option>
              <option value="price-asc">Cheapest Hourly Rate</option>
              <option value="name-asc">Name (A-Z)</option>
            </select>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center bg-[#ebedfa] p-0.5 rounded-lg border border-[#c3c5d8]">
            <button
              onClick={() => onViewModeChange('split')}
              className={`cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'split'
                  ? 'bg-white text-[#0049db] shadow-xs'
                  : 'text-[#5a5e6b] hover:text-[#181b24]'
              }`}
              title="Split View (Map + List)"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Split</span>
            </button>
            <button
              onClick={() => onViewModeChange('map')}
              className={`cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'map'
                  ? 'bg-white text-[#0049db] shadow-xs'
                  : 'text-[#5a5e6b] hover:text-[#181b24]'
              }`}
              title="Interactive Map View"
            >
              <MapIcon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Map</span>
            </button>
            <button
              onClick={() => onViewModeChange('grid')}
              className={`cursor-pointer px-2.5 py-1.5 rounded-md text-xs font-semibold flex items-center gap-1 transition-all ${
                viewMode === 'grid'
                  ? 'bg-white text-[#0049db] shadow-xs'
                  : 'text-[#5a5e6b] hover:text-[#181b24]'
              }`}
              title="Terminal Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Grid</span>
            </button>
          </div>
        </div>
      </div>

      {/* Region Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 pt-1 text-xs">
        <span className="text-[#737687] font-medium text-[11px] whitespace-nowrap mr-1 flex items-center gap-1">
          <Filter className="w-3 h-3" /> Region:
        </span>
        {REGIONS.map((r) => {
          const isSelected =
            (r === 'All Regions' && (filters.region === 'all' || !filters.region)) ||
            filters.region === r;
          return (
            <button
              key={r}
              onClick={() => handleRegionSelect(r)}
              className={`cursor-pointer px-2.5 py-1 rounded-full text-xs whitespace-nowrap font-medium transition-colors ${
                isSelected
                  ? 'bg-[#0049db] text-white shadow-2xs'
                  : 'bg-[#f1f3ff] text-[#434656] hover:bg-[#e0e2ee]'
              }`}
            >
              {r}
            </button>
          );
        })}

        <div className="ml-auto text-xs text-[#737687] whitespace-nowrap pl-2">
          Found <span className="font-semibold text-[#181b24] font-mono-num">{totalFilteredCount}</span> carparks
        </div>
      </div>
    </div>
  );
};
