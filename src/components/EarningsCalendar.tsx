import React from 'react';
import { EARNINGS_CALENDAR } from '../data/mockMarketData';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';

interface EarningsCalendarProps {
  onSelectSymbol: (symbol: string) => void;
}

export const EarningsCalendar: React.FC<EarningsCalendarProps> = ({ onSelectSymbol }) => {
  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] p-4 sm:p-5">
      <div className="flex items-center justify-between pb-3 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2962ff]/10 text-[#2962ff]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#181b24] dark:text-[#f0f3fa]">
              Earnings Calendar
            </h2>
            <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
              Key earnings announcements & consensus beats
            </p>
          </div>
        </div>

        <span className="text-[11px] font-semibold text-[#2962ff] bg-[#2962ff]/10 px-2 py-0.5 rounded">
          Q3 / Q4 Reports
        </span>
      </div>

      <div className="divide-y divide-[#e0e3eb]/50 dark:divide-[#2a2e39]/50 mt-2">
        {EARNINGS_CALENDAR.map((item) => {
          const hasReported = item.epsActual !== undefined;
          const isSurprisePositive = (item.surprisePercent || 0) >= 0;

          return (
            <div
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#f8f9fd] dark:hover:bg-[#181c27] px-2 rounded-lg transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#2962ff]/10 text-[#2962ff] flex items-center justify-center font-bold text-xs shrink-0 group-hover:bg-[#2962ff] group-hover:text-white transition-colors">
                  {item.symbol}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-[#181b24] dark:text-[#f0f3fa]">
                      {item.company}
                    </span>
                    <span className="text-[10px] text-[#737687] flex items-center gap-1 font-mono">
                      <Clock className="w-3 h-3" />
                      {item.date} · {item.time}
                    </span>
                  </div>
                  <div className="text-[11px] text-[#5a5e6b] dark:text-[#848e9c] mt-0.5">
                    Est. Revenue: <strong className="font-mono text-[#181b24] dark:text-[#d1d4dc]">{item.revenueEstimate}</strong>
                    {item.revenueActual && (
                      <span className="ml-1 text-[#089981]">
                        (Act: {item.revenueActual})
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 sm:text-right">
                <div>
                  <div className="text-[11px] text-[#737687]">
                    EPS Est: <span className="font-mono font-semibold">${item.epsEstimate.toFixed(2)}</span>
                  </div>
                  {hasReported && (
                    <div className="text-xs font-bold font-mono text-[#089981] flex items-center gap-1 justify-end">
                      <CheckCircle2 className="w-3 h-3" />
                      Act: ${item.epsActual?.toFixed(2)}
                      {item.surprisePercent && (
                        <span className="text-[10px] text-[#089981]">
                          (+{item.surprisePercent}%)
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#f1f3ff] dark:bg-[#2a2e39] text-[#737687]">
                  {item.time === 'AMC' ? 'After Close' : 'Before Open'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
