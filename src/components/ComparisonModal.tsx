import React from 'react';
import {
  X,
  GitCompare,
  Trash2,
  Car,
  Zap,
  ArrowRight,
  Shield,
  Clock,
  MapPin,
} from 'lucide-react';
import { Carpark, UserSimulatedLocation } from '../types/carpark';
import { calculateDistanceKm, formatDistance, estimateDriveMinutes } from '../utils/distance';

interface ComparisonModalProps {
  carparks: Carpark[];
  userLocation: UserSimulatedLocation;
  onClose: () => void;
  onRemoveCompare: (id: string) => void;
  onSelectCarpark: (cp: Carpark) => void;
  onClearAll: () => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  carparks,
  userLocation,
  onClose,
  onRemoveCompare,
  onSelectCarpark,
  onClearAll,
}) => {
  if (carparks.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="fixed inset-0" onClick={onClose} />
        <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#e0e3eb] p-6 text-center z-10">
          <div className="w-12 h-12 rounded-xl bg-[#ebedfa] text-[#0049db] flex items-center justify-center mx-auto mb-3">
            <GitCompare className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-[#181b24]">No Carparks in Compare List</h3>
          <p className="text-xs text-[#5a5e6b] mt-1 mb-4">
            Click the compare icon on any carpark card or detail modal to evaluate up to 3 carparks side-by-side.
          </p>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-2 bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Browse Carparks
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-[#e0e3eb] overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e0e3eb] flex items-center justify-between bg-[#faf9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#2962ff] flex items-center justify-center text-white">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181b24]">
                Side-by-Side Carpark Comparison
              </h2>
              <p className="text-xs text-[#5a5e6b]">
                Comparing {carparks.length} Singapore carpark {carparks.length === 1 ? 'location' : 'locations'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClearAll}
              className="cursor-pointer text-xs text-[#ba1a1a] hover:underline font-semibold px-2 py-1"
            >
              Clear All
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#737687] hover:bg-[#ebedfa] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Comparison Table */}
        <div className="flex-1 overflow-x-auto overflow-y-auto p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {carparks.map((cp) => {
              const dist = calculateDistanceKm(
                userLocation.coords.lat,
                userLocation.coords.lng,
                cp.coordinates.lat,
                cp.coordinates.lng
              );
              const driveMins = estimateDriveMinutes(dist);
              const percentAvailable = Math.round((cp.availableLots / cp.totalLots) * 100);

              return (
                <div
                  key={cp.id}
                  className="bg-[#faf9ff] border border-[#e0e3eb] rounded-xl p-4 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Controls */}
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-[10px] font-bold bg-[#ebedfa] px-1.5 py-0.5 rounded text-[#181b24]">
                        {cp.agency} • {cp.carparkNumber}
                      </span>
                      <button
                        onClick={() => onRemoveCompare(cp.id)}
                        className="text-[#737687] hover:text-[#ba1a1a] p-1 rounded cursor-pointer"
                        title="Remove from comparison"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-bold text-sm text-[#181b24] line-clamp-1">{cp.name}</h3>
                    <p className="text-[11px] text-[#5a5e6b] mb-3 line-clamp-1">{cp.address}</p>

                    {/* Lot Availability Gauge */}
                    <div className="bg-white border border-[#e0e3eb] rounded-lg p-3 mb-3">
                      <div className="text-[10px] uppercase font-bold text-[#737687]">
                        Available Lots
                      </div>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black font-mono-num text-[#089981]">
                          {cp.availableLots}
                        </span>
                        <span className="text-xs text-[#737687]">/ {cp.totalLots}</span>
                        <span className="ml-auto text-xs font-bold font-mono-num text-[#181b24]">
                          {percentAvailable}%
                        </span>
                      </div>
                      <div className="w-full bg-[#e0e2ee] h-2 rounded-full overflow-hidden mt-1.5">
                        <div
                          className="h-full bg-[#089981]"
                          style={{ width: `${percentAvailable}%` }}
                        />
                      </div>
                    </div>

                    {/* Comparison Attribute List */}
                    <div className="space-y-2 text-xs divide-y divide-[#ebedfa]">
                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Distance:</span>
                        <span className="font-bold text-[#181b24]">
                          {formatDistance(dist)} (~{driveMins}m)
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Est Day Rate:</span>
                        <span className="font-bold text-[#181b24]">
                          S${cp.rates.estimatedPerHourDay.toFixed(2)}/hr
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Est Night Rate:</span>
                        <span className="font-bold text-[#181b24]">
                          S${cp.rates.estimatedPerHourNight.toFixed(2)}/hr
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Grace Period:</span>
                        <span className="font-bold text-[#0049db]">
                          {cp.rates.gracePeriodMinutes} mins free
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Sunday / PH:</span>
                        <span className="font-medium text-[#181b24] truncate max-w-[140px] text-right" title={cp.rates.sundayPh}>
                          {cp.rates.sundayPh}
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">Clearance:</span>
                        <span className="font-bold font-mono-num text-[#181b24]">
                          {cp.heightLimitMeters}m
                        </span>
                      </div>

                      <div className="pt-1.5 flex justify-between">
                        <span className="text-[#737687]">EV Charging:</span>
                        <span className="font-medium text-[#181b24]">
                          {cp.evCharging?.hasEV
                            ? `${cp.evCharging.availableChargers} / ${cp.evCharging.totalChargers} (${cp.evCharging.operator})`
                            : 'None'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#e0e3eb]">
                    <button
                      onClick={() => {
                        onSelectCarpark(cp);
                        onClose();
                      }}
                      className="w-full py-2 bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Select Carpark</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e0e3eb] bg-[#faf9ff] flex items-center justify-between">
          <div className="text-xs text-[#737687]">
            Tip: You can compare up to 3 carparks simultaneously.
          </div>
          <button
            onClick={onClose}
            className="cursor-pointer px-4 py-1.5 bg-[#181b24] hover:bg-[#2d303a] text-white text-xs font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
