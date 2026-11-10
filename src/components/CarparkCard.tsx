import React from 'react';
import {
  Car,
  Zap,
  Bookmark,
  ChevronRight,
  GitCompare,
  ArrowUpRight,
  Gauge,
  Clock,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import { Carpark } from '../types/carpark';
import { formatDistance, estimateDriveMinutes } from '../utils/distance';

interface CarparkCardProps {
  carpark: Carpark;
  distanceKm: number;
  isSelected?: boolean;
  isCompared?: boolean;
  onSelect: (cp: Carpark) => void;
  onToggleFavorite: (id: string) => void;
  onToggleCompare: (cp: Carpark) => void;
  onQuickCalculate: (cp: Carpark) => void;
}

export const CarparkCard: React.FC<CarparkCardProps> = ({
  carpark,
  distanceKm,
  isSelected,
  isCompared,
  onSelect,
  onToggleFavorite,
  onToggleCompare,
  onQuickCalculate,
}) => {
  const percentAvailable = Math.round((carpark.availableLots / carpark.totalLots) * 100);
  const occupancyPercent = 100 - percentAvailable;

  // Semantic status colors
  let statusBg = 'bg-[#e6f5f2] text-[#006554] border-[#84f7db]';
  let badgeColor = 'text-[#089981]';
  let barColor = 'bg-[#089981]';
  let statusText = 'Available';

  if (percentAvailable < 5 || carpark.availableLots === 0) {
    statusBg = 'bg-[#fdebed] text-[#ba1a1a] border-[#ffdad6]';
    badgeColor = 'text-[#f23645]';
    barColor = 'bg-[#f23645]';
    statusText = carpark.availableLots === 0 ? 'Full' : 'Critical';
  } else if (percentAvailable <= 20) {
    statusBg = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
    badgeColor = 'text-[#d97706]';
    barColor = 'bg-[#d97706]';
    statusText = 'Filling Fast';
  }

  const driveMins = estimateDriveMinutes(distanceKm);

  // Agency tag color
  const agencyColors: Record<string, string> = {
    HDB: 'bg-[#dce1ff] text-[#001550]',
    COMMERCIAL: 'bg-[#ebedfa] text-[#181b24]',
    URA: 'bg-[#d9fff2] text-[#00201a]',
    HOSPITAL: 'bg-[#ffdad6] text-[#93000a]',
  };

  return (
    <div
      className={`group relative bg-white rounded-xl border transition-all duration-200 shadow-2xs hover:shadow-md p-4 cursor-pointer flex flex-col justify-between ${
        isSelected
          ? 'border-[#0049db] ring-2 ring-[#0049db]/20 shadow-sm'
          : 'border-[#e0e3eb] hover:border-[#c3c5d8]'
      }`}
      onClick={() => onSelect(carpark)}
    >
      <div>
        {/* Top Header: Agency, Code, and Status Badge */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded ${
                agencyColors[carpark.agency] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {carpark.agency}
            </span>
            <span className="font-mono-num text-[11px] font-bold text-[#5a5e6b] bg-[#f1f3ff] px-1.5 py-0.5 rounded border border-[#e0e3eb]">
              {carpark.carparkNumber}
            </span>
            <span className="text-xs text-[#737687]">
              {formatDistance(distanceKm)} (~{driveMins}m drive)
            </span>
          </div>

          <div className="flex items-center gap-1">
            {/* Real-time Delta Fluctuation */}
            {carpark.deltaLots !== undefined && carpark.deltaLots !== 0 && (
              <span
                className={`text-[10px] font-mono-num font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                  carpark.deltaLots > 0
                    ? 'text-[#089981] bg-[#e6f5f2]'
                    : 'text-[#f23645] bg-[#fdebed]'
                }`}
                title={`Recent gantry change: ${carpark.deltaLots > 0 ? '+' : ''}${carpark.deltaLots} lots`}
              >
                {carpark.deltaLots > 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {carpark.deltaLots > 0 ? `+${carpark.deltaLots}` : carpark.deltaLots}
              </span>
            )}

            <span
              className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${statusBg}`}
            >
              {statusText}
            </span>
          </div>
        </div>

        {/* Carpark Name & Address */}
        <h3 className="font-bold text-sm text-[#181b24] group-hover:text-[#0049db] transition-colors leading-snug line-clamp-1">
          {carpark.name}
        </h3>
        <p className="text-xs text-[#5a5e6b] mt-0.5 line-clamp-1">{carpark.address}</p>

        {/* Primary Metric: Lot Availability Highlight */}
        <div className="mt-3 bg-[#faf9ff] border border-[#ebedfa] rounded-lg p-3">
          <div className="flex items-baseline justify-between mb-1">
            <div className="flex items-baseline gap-1">
              <span className={`text-2xl font-black font-mono-num ${badgeColor}`}>
                {carpark.availableLots}
              </span>
              <span className="text-xs font-semibold text-[#737687]">
                / {carpark.totalLots} Lots
              </span>
            </div>
            <div className="text-right">
              <span className="text-xs font-bold font-mono-num text-[#181b24]">
                {percentAvailable}%
              </span>
              <span className="text-[10px] text-[#737687] ml-1">Free</span>
            </div>
          </div>

          {/* Availability Bar */}
          <div className="w-full bg-[#e0e2ee] h-2 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} transition-all duration-500`}
              style={{ width: `${percentAvailable}%` }}
            />
          </div>

          {/* Sub-vehicle lot details */}
          <div className="mt-2.5 pt-2 border-t border-[#e0e2ee] grid grid-cols-3 gap-1 text-[11px] text-[#434656]">
            <div>
              <span className="text-[#737687] block text-[10px]">Cars (C)</span>
              <span className="font-mono-num font-semibold text-[#181b24]">
                {carpark.lotTypes.cars.available}
              </span>
            </div>

            {carpark.lotTypes.motorcycles ? (
              <div>
                <span className="text-[#737687] block text-[10px]">Bikes (M)</span>
                <span className="font-mono-num font-semibold text-[#181b24]">
                  {carpark.lotTypes.motorcycles.available}
                </span>
              </div>
            ) : (
              <div>
                <span className="text-[#737687] block text-[10px]">Clearance</span>
                <span className="font-mono-num font-semibold text-[#181b24]">
                  {carpark.heightLimitMeters}m
                </span>
              </div>
            )}

            <div>
              <span className="text-[#737687] block text-[10px]">EV Active</span>
              {carpark.evCharging?.hasEV ? (
                <span className="font-mono-num font-semibold text-[#006554] flex items-center gap-0.5">
                  <Zap className="w-3 h-3 text-[#089981] fill-current" />
                  {carpark.evCharging.availableChargers} / {carpark.evCharging.totalChargers}
                </span>
              ) : (
                <span className="text-[#737687]">—</span>
              )}
            </div>
          </div>
        </div>

        {/* Rates & Grace summary */}
        <div className="mt-2.5 flex items-center justify-between text-xs text-[#5a5e6b]">
          <div className="truncate max-w-[200px]" title={carpark.rates.weekdayDay}>
            <span className="text-[#737687]">Rate: </span>
            <span className="font-semibold text-[#181b24]">
              ~S${carpark.rates.estimatedPerHourDay.toFixed(2)}/hr
            </span>
          </div>
          <div className="text-[11px] bg-[#f1f3ff] text-[#0049db] px-2 py-0.5 rounded font-medium">
            {carpark.rates.gracePeriodMinutes}m Grace
          </div>
        </div>
      </div>

      {/* Card Actions Footer */}
      <div className="mt-3 pt-2.5 border-t border-[#e0e3eb] flex items-center justify-between gap-1">
        <div className="flex items-center gap-1">
          {/* Favorite Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(carpark.id);
            }}
            className={`cursor-pointer p-1.5 rounded-lg border transition-colors ${
              carpark.isFavorite
                ? 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]'
                : 'text-[#737687] hover:bg-[#f1f3ff] border-[#e0e3eb]'
            }`}
            title={carpark.isFavorite ? 'Remove from saved' : 'Save carpark'}
          >
            <Bookmark className={`w-3.5 h-3.5 ${carpark.isFavorite ? 'fill-current' : ''}`} />
          </button>

          {/* Compare Toggle */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleCompare(carpark);
            }}
            className={`cursor-pointer p-1.5 rounded-lg border transition-colors ${
              isCompared
                ? 'bg-[#2962ff] text-white border-[#0049db]'
                : 'text-[#737687] hover:bg-[#f1f3ff] border-[#e0e3eb]'
            }`}
            title={isCompared ? 'Remove from compare' : 'Compare carpark'}
          >
            <GitCompare className="w-3.5 h-3.5" />
          </button>

          {/* Quick Calculate Fee */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickCalculate(carpark);
            }}
            className="cursor-pointer text-[11px] px-2 py-1 rounded bg-[#f1f3ff] hover:bg-[#e0e2ee] text-[#0049db] font-semibold transition-colors"
            title="Calculate exact parking fee for duration"
          >
            Calc Fee
          </button>
        </div>

        <button
          onClick={() => onSelect(carpark)}
          className="cursor-pointer inline-flex items-center gap-1 text-xs font-semibold text-[#0049db] hover:text-[#003ab3] group-hover:translate-x-0.5 transition-transform"
        >
          <span>Details</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
