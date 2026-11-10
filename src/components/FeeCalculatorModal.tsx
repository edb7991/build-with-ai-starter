import React, { useState } from 'react';
import {
  X,
  Calculator,
  Clock,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Car,
  ArrowRight,
} from 'lucide-react';
import { Carpark } from '../types/carpark';
import { calculateParkingFee } from '../utils/feeCalculator';

interface FeeCalculatorModalProps {
  carparks: Carpark[];
  initialCarpark?: Carpark | null;
  onClose: () => void;
  onSelectCarpark: (cp: Carpark) => void;
}

export const FeeCalculatorModal: React.FC<FeeCalculatorModalProps> = ({
  carparks,
  initialCarpark,
  onClose,
  onSelectCarpark,
}) => {
  const [selectedId, setSelectedId] = useState<string>(
    initialCarpark?.id || carparks[0]?.id || ''
  );

  const [durationMins, setDurationMins] = useState<number>(120); // 2 hours default
  const [isCustomTime, setIsCustomTime] = useState<boolean>(false);
  const [customHour, setCustomHour] = useState<number>(new Date().getHours());
  const [customDayOfWeek, setCustomDayOfWeek] = useState<number>(new Date().getDay());

  const selectedCarpark = carparks.find((c) => c.id === selectedId) || carparks[0];

  // Construct start date object
  const startDate = new Date();
  if (isCustomTime) {
    startDate.setHours(customHour, 0, 0, 0);
  }

  const result = selectedCarpark
    ? calculateParkingFee(selectedCarpark, startDate, durationMins)
    : null;

  // Compare nearby carparks in the same region
  const sameRegionCarparks = carparks
    .filter((c) => c.region === selectedCarpark?.region)
    .map((cp) => ({
      carpark: cp,
      feeResult: calculateParkingFee(cp, startDate, durationMins),
    }))
    .sort((a, b) => a.feeResult.totalFee - b.feeResult.totalFee);

  const durationPresets = [
    { label: '15m (Grace test)', value: 15 },
    { label: '1 Hour', value: 60 },
    { label: '1.5 Hours', value: 90 },
    { label: '2 Hours', value: 120 },
    { label: '3 Hours', value: 180 },
    { label: '4 Hours', value: 240 },
    { label: '6 Hours', value: 360 },
    { label: 'Overnight (8h)', value: 480 },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="fixed inset-0" onClick={onClose} />
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-[#e0e3eb] overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#e0e3eb] flex items-center justify-between bg-[#faf9ff]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#0049db] flex items-center justify-center text-white">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#181b24]">
                Singapore Parking Fee Calculator
              </h2>
              <p className="text-xs text-[#5a5e6b]">
                Estimate exact parking charges across HDB, Commercial & URA lots
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737687] hover:bg-[#ebedfa] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* Carpark Picker */}
          <div>
            <label className="block text-xs font-bold text-[#181b24] uppercase tracking-wider mb-1.5">
              Select Carpark
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full text-xs font-semibold bg-[#f8f9fd] border border-[#c3c5d8] rounded-lg px-3 py-2 text-[#181b24] focus:outline-none focus:border-[#0049db]"
            >
              {carparks.map((cp) => (
                <option key={cp.id} value={cp.id}>
                  [{cp.agency}] {cp.name} ({cp.carparkNumber}) — {cp.region}
                </option>
              ))}
            </select>
          </div>

          {/* Time & Day Settings */}
          <div className="p-3 bg-[#f8f9fd] border border-[#e0e3eb] rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#181b24]">Entry Timing</span>
              <button
                type="button"
                onClick={() => setIsCustomTime(!isCustomTime)}
                className="text-xs text-[#0049db] font-semibold hover:underline cursor-pointer"
              >
                {isCustomTime ? 'Use Current SGT Time' : 'Custom Day & Time'}
              </button>
            </div>

            {isCustomTime ? (
              <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                <div>
                  <label className="text-[11px] text-[#737687] block mb-1">Day of Week</label>
                  <select
                    value={customDayOfWeek}
                    onChange={(e) => setCustomDayOfWeek(parseInt(e.target.value))}
                    className="w-full bg-white border border-[#c3c5d8] rounded px-2 py-1.5 text-xs font-medium"
                  >
                    <option value={1}>Monday - Friday (Weekday)</option>
                    <option value={6}>Saturday</option>
                    <option value={0}>Sunday / Public Holiday</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] text-[#737687] block mb-1">Entry Hour</label>
                  <select
                    value={customHour}
                    onChange={(e) => setCustomHour(parseInt(e.target.value))}
                    className="w-full bg-white border border-[#c3c5d8] rounded px-2 py-1.5 text-xs font-medium"
                  >
                    {Array.from({ length: 24 }).map((_, i) => (
                      <option key={i} value={i}>
                        {i.toString().padStart(2, '0')}:00 {i >= 12 ? 'PM' : 'AM'} {i >= 18 || i < 7 ? '(Night)' : '(Day)'}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ) : (
              <div className="text-xs text-[#5a5e6b] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#0049db]" />
                <span>Simulating entry right now ({new Date().toLocaleTimeString('en-SG', { hour: '2-digit', minute: '2-digit', hour12: true })})</span>
              </div>
            )}
          </div>

          {/* Duration Selector */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#181b24] uppercase tracking-wider">
                Parking Duration
              </label>
              <span className="text-xs font-bold font-mono-num text-[#0049db]">
                {Math.floor(durationMins / 60)}h {durationMins % 60}m
              </span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mb-2">
              {durationPresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setDurationMins(p.value)}
                  className={`px-2 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-colors ${
                    durationMins === p.value
                      ? 'bg-[#0049db] text-white shadow-2xs font-semibold'
                      : 'bg-[#f1f3ff] text-[#434656] hover:bg-[#e0e2ee]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Duration Slider */}
            <input
              type="range"
              min="10"
              max="600"
              step="15"
              value={durationMins}
              onChange={(e) => setDurationMins(parseInt(e.target.value))}
              className="w-full accent-[#0049db] cursor-pointer"
            />
          </div>

          {/* Result Card */}
          {result && selectedCarpark && (
            <div className="bg-[#faf9ff] border-2 border-[#dce1ff] rounded-xl p-4 text-[#181b24]">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#5a5e6b]">
                  Estimated Fee ({selectedCarpark.name})
                </span>
                <span className="text-3xl font-black font-mono-num text-[#0049db]">
                  S${result.totalFee.toFixed(2)}
                </span>
              </div>

              <div className="text-xs text-[#5a5e6b] mt-1 flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#089981] shrink-0 mt-0.5" />
                <span>{result.breakdown}</span>
              </div>

              {result.isGracePeriod && (
                <div className="mt-2 text-xs bg-[#e6f5f2] border border-[#84f7db] text-[#006554] px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#089981]" />
                  <span>Free exit within grace period ({selectedCarpark.rates.gracePeriodMinutes} mins).</span>
                </div>
              )}

              {result.isFreeSunday && (
                <div className="mt-2 text-xs bg-[#e6f5f2] border border-[#84f7db] text-[#006554] px-2.5 py-1.5 rounded-lg font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#089981]" />
                  <span>Free Sunday Parking Scheme applies for this HDB carpark!</span>
                </div>
              )}
            </div>
          )}

          {/* Comparison with other carparks in same area */}
          <div>
            <h4 className="text-xs font-bold text-[#181b24] uppercase tracking-wider mb-2">
              Price Comparison in {selectedCarpark?.region}
            </h4>

            <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {sameRegionCarparks.slice(0, 5).map(({ carpark: cp, feeResult }) => {
                const isCurrent = cp.id === selectedCarpark?.id;
                return (
                  <div
                    key={cp.id}
                    className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-[#f1f3ff] border-[#0049db]'
                        : 'bg-white border-[#e0e3eb] hover:bg-[#faf9ff]'
                    }`}
                    onClick={() => setSelectedId(cp.id)}
                  >
                    <div className="flex items-center gap-2 truncate max-w-[280px]">
                      <span className="text-[10px] font-bold bg-[#ebedfa] px-1 py-0.5 rounded">
                        {cp.agency}
                      </span>
                      <span className="font-medium text-[#181b24] truncate">{cp.name}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-[#181b24]">
                        S${feeResult.totalFee.toFixed(2)}
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] text-[#0049db] font-semibold">Active</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#e0e3eb] bg-[#faf9ff] flex items-center justify-between">
          <div className="text-xs text-[#737687]">
            Official rates & grace periods configured
          </div>
          <button
            onClick={() => {
              if (selectedCarpark) {
                onSelectCarpark(selectedCarpark);
                onClose();
              }
            }}
            className="cursor-pointer px-4 py-2 bg-[#0049db] hover:bg-[#003ab3] text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
          >
            <span>View This Carpark</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
