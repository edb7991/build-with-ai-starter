import React, { useState } from 'react';
import {
  X,
  MapPin,
  Clock,
  Car,
  Zap,
  Bookmark,
  Shield,
  Navigation,
  ExternalLink,
  Bell,
  Check,
  TrendingUp,
  CreditCard,
  Layers,
  Info,
} from 'lucide-react';
import { Carpark } from '../types/carpark';
import { formatDistance, estimateDriveMinutes } from '../utils/distance';
import { calculateParkingFee } from '../utils/feeCalculator';

interface CarparkDetailModalProps {
  carpark: Carpark | null;
  distanceKm: number;
  onClose: () => void;
  onToggleFavorite: (id: string) => void;
  onSetLotAlert: (carparkId: string, carparkName: string, threshold: number) => void;
  activeAlertThreshold?: number;
}

export const CarparkDetailModal: React.FC<CarparkDetailModalProps> = ({
  carpark,
  distanceKm,
  onClose,
  onToggleFavorite,
  onSetLotAlert,
  activeAlertThreshold,
}) => {
  if (!carpark) return null;

  const [alertThresholdInput, setAlertThresholdInput] = useState<number>(
    activeAlertThreshold || 20
  );
  const [alertSaved, setAlertSaved] = useState(false);

  // Quick fee test duration inside modal
  const [testDurationMins, setTestDurationMins] = useState<number>(120);

  const percentAvailable = Math.round((carpark.availableLots / carpark.totalLots) * 100);
  const occupiedLots = carpark.totalLots - carpark.availableLots;
  const driveMinutes = estimateDriveMinutes(distanceKm);

  let statusBg = 'bg-[#e6f5f2] text-[#006554] border-[#84f7db]';
  let badgeColor = 'text-[#089981]';
  let barColor = 'bg-[#089981]';

  if (percentAvailable < 5 || carpark.availableLots === 0) {
    statusBg = 'bg-[#fdebed] text-[#ba1a1a] border-[#ffdad6]';
    badgeColor = 'text-[#f23645]';
    barColor = 'bg-[#f23645]';
  } else if (percentAvailable <= 20) {
    statusBg = 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]';
    badgeColor = 'text-[#d97706]';
    barColor = 'bg-[#d97706]';
  }

  // Quick fee preview
  const feeResult = calculateParkingFee(carpark, new Date(), testDurationMins);

  const handleSaveAlert = () => {
    onSetLotAlert(carpark.id, carpark.name, alertThresholdInput);
    setAlertSaved(true);
    setTimeout(() => setAlertSaved(false), 2500);
  };

  // Maps navigation URLs
  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    carpark.name + ' Singapore'
  )}`;
  const wazeUrl = `https://waze.com/ul?ll=${carpark.coordinates.lat},${carpark.coordinates.lng}&navigate=yes`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-[#e0e3eb] overflow-hidden flex flex-col max-h-[92vh] z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e0e3eb] flex items-start justify-between bg-[#faf9ff]">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-[#dce1ff] text-[#001550] px-2 py-0.5 rounded">
                {carpark.agency}
              </span>
              <span className="font-mono-num text-xs font-bold text-[#5a5e6b] bg-[#ebedfa] px-1.5 py-0.5 rounded">
                {carpark.carparkNumber}
              </span>
              <span className="text-xs text-[#737687]">
                • {formatDistance(distanceKm)} (~{driveMinutes} min drive)
              </span>
            </div>
            <h2 className="text-lg font-bold text-[#181b24] leading-snug">
              {carpark.name}
            </h2>
            <p className="text-xs text-[#5a5e6b] flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-[#737687] shrink-0" />
              <span>{carpark.address}, Singapore {carpark.postalCode}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onToggleFavorite(carpark.id)}
              className={`p-2 rounded-lg border transition-colors cursor-pointer ${
                carpark.isFavorite
                  ? 'bg-[#fef3c7] text-[#d97706] border-[#fde68a]'
                  : 'text-[#737687] hover:bg-[#f1f3ff] border-[#e0e3eb]'
              }`}
              title="Save carpark"
            >
              <Bookmark className={`w-4 h-4 ${carpark.isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-[#737687] hover:bg-[#f1f3ff] border border-[#e0e3eb] hover:text-[#181b24] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Real-Time Lot Gauge Overview */}
          <div className="bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl p-4">
            <div className="flex flex-wrap items-end justify-between gap-2 mb-2">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#737687] block">
                  Real-Time Lot Availability
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <span className={`text-3xl font-black font-mono-num ${badgeColor}`}>
                    {carpark.availableLots}
                  </span>
                  <span className="text-sm font-semibold text-[#737687]">
                    lots free of {carpark.totalLots}
                  </span>
                </div>
              </div>

              <div className="text-right">
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${statusBg}`}>
                  {percentAvailable}% Lots Vacant
                </span>
                <span className="text-[11px] text-[#737687] block mt-1">
                  Updated: {carpark.lastUpdated}
                </span>
              </div>
            </div>

            {/* Availability progress bar */}
            <div className="w-full bg-[#e0e2ee] h-3 rounded-full overflow-hidden mt-3">
              <div
                className={`h-full ${barColor} transition-all duration-500`}
                style={{ width: `${percentAvailable}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#737687] mt-1.5 font-medium">
              <span>{occupiedLots} Occupied ({100 - percentAvailable}%)</span>
              <span>{carpark.availableLots} Free ({percentAvailable}%)</span>
            </div>
          </div>

          {/* Vehicle Category Breakdown Grid */}
          <div>
            <h4 className="text-xs font-bold text-[#181b24] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <Car className="w-4 h-4 text-[#0049db]" /> Vehicle Category Breakdown
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Cars */}
              <div className="p-3 bg-white border border-[#e0e3eb] rounded-xl">
                <div className="text-xs font-medium text-[#737687]">🚗 Cars (Type C)</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-num text-[#181b24]">
                    {carpark.lotTypes.cars.available}
                  </span>
                  <span className="text-xs text-[#737687]">/ {carpark.lotTypes.cars.total}</span>
                </div>
                <div className="text-[10px] text-[#089981] font-semibold mt-0.5">
                  {Math.round((carpark.lotTypes.cars.available / carpark.lotTypes.cars.total) * 100)}% free
                </div>
              </div>

              {/* Motorcycles */}
              <div className="p-3 bg-white border border-[#e0e3eb] rounded-xl">
                <div className="text-xs font-medium text-[#737687]">🏍️ Motorcycles (Type M)</div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-num text-[#181b24]">
                    {carpark.lotTypes.motorcycles ? carpark.lotTypes.motorcycles.available : 0}
                  </span>
                  <span className="text-xs text-[#737687]">
                    / {carpark.lotTypes.motorcycles ? carpark.lotTypes.motorcycles.total : 0}
                  </span>
                </div>
                <div className="text-[10px] text-[#5a5e6b] font-medium mt-0.5">
                  {carpark.lotTypes.motorcycles ? 'Dedicated bay' : 'No motorcycle lots'}
                </div>
              </div>

              {/* EV Charging */}
              <div className="p-3 bg-white border border-[#e0e3eb] rounded-xl col-span-2 sm:col-span-1">
                <div className="text-xs font-medium text-[#737687] flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-[#089981] fill-current" /> EV Chargers
                </div>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-xl font-bold font-mono-num text-[#006554]">
                    {carpark.evCharging?.hasEV ? carpark.evCharging.availableChargers : 0}
                  </span>
                  <span className="text-xs text-[#737687]">
                    / {carpark.evCharging?.hasEV ? carpark.evCharging.totalChargers : 0}
                  </span>
                </div>
                <div className="text-[10px] text-[#5a5e6b] font-medium mt-0.5 truncate">
                  {carpark.evCharging?.hasEV
                    ? `${carpark.evCharging.operator} (${carpark.evCharging.powerKw}kW ${carpark.evCharging.plugType})`
                    : 'No EV stations'}
                </div>
              </div>
            </div>
          </div>

          {/* 12-Hour Historical Trend & Forecast */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-[#181b24] uppercase tracking-wider flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-[#0049db]" /> 12h Occupancy Trend & Forecast
              </h4>
              <span className="text-[11px] text-[#737687]">Peak analysis</span>
            </div>

            <div className="p-3 bg-white border border-[#e0e3eb] rounded-xl">
              <div className="h-28 flex items-end gap-1.5 pt-4 pb-1">
                {carpark.occupancyHistory.map((occ, idx) => {
                  const hourLabel = `${12 - idx}h ago`;
                  return (
                    <div
                      key={idx}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      <div
                        className="w-full rounded-t transition-all bg-[#2962ff]/80 hover:bg-[#0049db]"
                        style={{ height: `${occ}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-[#181b24] text-white text-[9px] font-mono-num px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                        {occ}% occ ({hourLabel})
                      </div>
                    </div>
                  );
                })}

                {/* 4 hours forecast divider */}
                <div className="w-px h-full bg-[#c3c5d8] mx-0.5 relative">
                  <div className="absolute -top-3.5 -left-4 text-[9px] font-bold text-[#0049db]">
                    Now
                  </div>
                </div>

                {carpark.forecastNextHours.map((occ, idx) => {
                  return (
                    <div
                      key={`fc-${idx}`}
                      className="flex-1 flex flex-col items-center gap-1 group relative h-full justify-end"
                    >
                      <div
                        className="w-full rounded-t border-t-2 border-dashed border-[#089981] bg-[#089981]/30 hover:bg-[#089981]/50"
                        style={{ height: `${occ}%` }}
                      />
                      <div className="opacity-0 group-hover:opacity-100 absolute -top-7 bg-[#181b24] text-white text-[9px] font-mono-num px-1.5 py-0.5 rounded shadow pointer-events-none whitespace-nowrap z-20">
                        +{idx + 1}h: {occ}% forecast
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex items-center justify-between text-[10px] text-[#737687] border-t border-[#ebedfa] pt-1.5">
                <span>12 hrs ago</span>
                <span className="font-semibold text-[#0049db]">● Current Real-Time</span>
                <span className="text-[#006554] font-medium">+4h Forecast</span>
              </div>
            </div>
          </div>

          {/* Pricing & Rate Schedule Table */}
          <div>
            <h4 className="text-xs font-bold text-[#181b24] uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-[#0049db]" /> Parking Fee Schedule (SGD)
            </h4>

            <div className="border border-[#e0e3eb] rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <tbody>
                  <tr className="border-b border-[#ebedfa] bg-[#faf9ff]">
                    <td className="py-2.5 px-3.5 font-semibold text-[#434656] w-1/3">
                      Weekday Day
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#181b24]">
                      {carpark.rates.weekdayDay}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ebedfa]">
                    <td className="py-2.5 px-3.5 font-semibold text-[#434656]">
                      Weekday Night
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#181b24]">
                      {carpark.rates.weekdayNight}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ebedfa] bg-[#faf9ff]">
                    <td className="py-2.5 px-3.5 font-semibold text-[#434656]">
                      Saturday
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#181b24]">
                      {carpark.rates.saturday}
                    </td>
                  </tr>
                  <tr className="border-b border-[#ebedfa]">
                    <td className="py-2.5 px-3.5 font-semibold text-[#434656]">
                      Sunday & PH
                    </td>
                    <td className="py-2.5 px-3.5 font-medium text-[#181b24]">
                      {carpark.rates.sundayPh}
                    </td>
                  </tr>
                  <tr className="bg-[#f1f3ff]">
                    <td className="py-2.5 px-3.5 font-semibold text-[#0049db]">
                      Grace Period
                    </td>
                    <td className="py-2.5 px-3.5 font-bold text-[#0049db]">
                      {carpark.rates.gracePeriodMinutes} minutes (Free Exit)
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Interactive Fee Calculator Preview */}
          <div className="bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-[#181b24]">
                Estimated Cost Right Now
              </span>
              <span className="text-[11px] text-[#5a5e6b]">Select duration:</span>
            </div>

            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
              {[15, 30, 60, 90, 120, 180, 240].map((mins) => (
                <button
                  key={mins}
                  onClick={() => setTestDurationMins(mins)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-medium cursor-pointer transition-colors ${
                    testDurationMins === mins
                      ? 'bg-[#0049db] text-white shadow-2xs'
                      : 'bg-white border border-[#c3c5d8] text-[#434656] hover:bg-[#ebedfa]'
                  }`}
                >
                  {mins < 60 ? `${mins}m` : `${mins / 60}h`}
                </button>
              ))}
            </div>

            <div className="p-3 bg-white border border-[#e0e3eb] rounded-lg flex items-center justify-between">
              <div>
                <span className="text-xs text-[#737687] block">
                  {feeResult.durationFormatted} Duration
                </span>
                <span className="text-[11px] text-[#5a5e6b]">{feeResult.breakdown}</span>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black font-mono-num text-[#181b24]">
                  S${feeResult.totalFee.toFixed(2)}
                </span>
                {feeResult.isGracePeriod && (
                  <span className="block text-[10px] font-bold text-[#089981]">GRACE FREE</span>
                )}
                {feeResult.isFreeSunday && (
                  <span className="block text-[10px] font-bold text-[#089981]">SUNDAY FREE</span>
                )}
              </div>
            </div>
          </div>

          {/* Clearance, Gantry & Facility Specs */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl">
              <span className="text-[#737687] block text-[11px]">Clearance Height</span>
              <span className="font-bold text-[#181b24] text-sm font-mono-num">
                {carpark.heightLimitMeters} Meters
              </span>
              <span className="text-[10px] text-[#5a5e6b] block mt-0.5">
                {carpark.heightLimitMeters >= 2.1 ? 'Fits Vans & Full SUVs' : 'Standard Sedan / Hatchback'}
              </span>
            </div>

            <div className="p-3 bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl">
              <span className="text-[#737687] block text-[11px]">Gantry System</span>
              <span className="font-bold text-[#181b24] text-sm">
                {carpark.gantryType}
              </span>
              <span className="text-[10px] text-[#5a5e6b] block mt-0.5">
                NETS FlashPay, ERP 2.0, CashCard
              </span>
            </div>
          </div>

          {/* Set In-App Lot Availability Alert */}
          <div className="p-3.5 bg-[#faf9ff] border border-[#ebedfa] rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#ebedfa] flex items-center justify-center text-[#0049db]">
                <Bell className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#181b24]">Availability Alert</div>
                <div className="text-[11px] text-[#737687]">
                  Notify me when available lots fall below:
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="number"
                min="1"
                max={carpark.totalLots}
                value={alertThresholdInput}
                onChange={(e) => setAlertThresholdInput(parseInt(e.target.value) || 10)}
                className="w-16 px-2 py-1 bg-white border border-[#c3c5d8] rounded text-center text-xs font-bold font-mono-num"
              />
              <button
                onClick={handleSaveAlert}
                className="cursor-pointer px-3 py-1 bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold rounded transition-colors flex items-center gap-1"
              >
                {alertSaved ? <Check className="w-3.5 h-3.5" /> : null}
                <span>{alertSaved ? 'Saved' : 'Set Alert'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Bar */}
        <div className="px-5 py-3.5 border-t border-[#e0e3eb] bg-[#faf9ff] flex items-center justify-between gap-2">
          <div className="text-xs text-[#737687] hidden sm:block">
            GPS: {carpark.coordinates.lat.toFixed(4)}, {carpark.coordinates.lng.toFixed(4)}
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <a
              href={wazeUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white border border-[#c3c5d8] hover:bg-[#f1f3ff] text-xs font-semibold text-[#181b24] transition-colors"
            >
              <Navigation className="w-3.5 h-3.5 text-[#0049db]" />
              <span>Waze</span>
            </a>

            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noreferrer"
              className="cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold transition-colors shadow-xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Google Maps</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
