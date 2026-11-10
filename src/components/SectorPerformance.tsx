import React, { useState } from 'react';
import { SECTOR_PERFORMANCE } from '../data/mockMarketData';
import { BarChart3, TrendingUp, TrendingDown } from 'lucide-react';

interface SectorPerformanceProps {
  onSelectStockSymbol: (symbol: string) => void;
}

export const SectorPerformance: React.FC<SectorPerformanceProps> = ({ onSelectStockSymbol }) => {
  const [timeframe, setTimeframe] = useState<'1D' | '1W' | '1M' | 'YTD'>('1D');

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2962ff]/10 text-[#2962ff]">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#181b24] dark:text-[#f0f3fa]">
              Sector Performance
            </h2>
            <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
              GICS sector rotation & leaders
            </p>
          </div>
        </div>

        {/* Timeframe selector */}
        <div className="flex items-center bg-[#f1f3ff] dark:bg-[#131722] p-0.5 rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39]">
          {(['1D', '1W', '1M', 'YTD'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setTimeframe(tf)}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                timeframe === tf
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                  : 'text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa]'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* Sector rows */}
      <div className="divide-y divide-[#e0e3eb]/50 dark:divide-[#2a2e39]/50 mt-2">
        {SECTOR_PERFORMANCE.map((sector) => {
          let change = sector.change1D;
          if (timeframe === '1W') change = sector.change1W;
          if (timeframe === '1M') change = sector.change1M;
          if (timeframe === 'YTD') change = sector.changeYTD;

          const isPositive = change >= 0;
          // Scale bar from max 30% to visually fit
          const maxScale = timeframe === 'YTD' ? 35 : 4;
          const barWidth = Math.min(100, (Math.abs(change) / maxScale) * 100);

          return (
            <div
              key={sector.name}
              className="py-2.5 flex items-center justify-between gap-4 hover:bg-[#f8f9fd] dark:hover:bg-[#181c27] px-2 rounded-lg transition-colors"
            >
              <div className="w-44 sm:w-56 shrink-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#181b24] dark:text-[#f0f3fa]">
                    {sector.name}
                  </span>
                  <span className="text-[10px] text-[#737687] dark:text-[#848e9c]">
                    {sector.weight}% wgt
                  </span>
                </div>
                
                {/* Micro Bar */}
                <div className="h-1.5 w-full bg-[#ebedfa] dark:bg-[#2a2e39] rounded-full mt-1.5 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'
                    }`}
                    style={{ width: `${barWidth}%` }}
                  ></div>
                </div>
              </div>

              {/* Performance metric */}
              <div className="flex items-center gap-3">
                <span
                  className={`flex items-center text-xs font-bold font-mono tabular-nums min-w-[70px] justify-end ${
                    isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                  }`}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                  )}
                  {isPositive ? '+' : ''}
                  {change.toFixed(2)}%
                </span>

                {/* Top Stock tag */}
                <button
                  onClick={() => onSelectStockSymbol(sector.topStock)}
                  className="hidden sm:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-[#f1f3ff] dark:bg-[#2a2e39] text-[#2962ff] hover:bg-[#2962ff]/10 transition-colors"
                  title={`View ${sector.topStock} details`}
                >
                  <span>Leader:</span>
                  <span className="font-bold underline">{sector.topStock}</span>
                  <span className={sector.topStockChange >= 0 ? 'text-[#089981]' : 'text-[#f23645]'}>
                    {sector.topStockChange >= 0 ? '+' : ''}
                    {sector.topStockChange}%
                  </span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
