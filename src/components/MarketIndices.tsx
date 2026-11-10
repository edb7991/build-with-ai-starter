import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Maximize2 } from 'lucide-react';
import { MarketIndex } from '../types/market';

interface MarketIndicesProps {
  indices: MarketIndex[];
  onSelectIndex: (index: MarketIndex) => void;
}

export const MarketIndices: React.FC<MarketIndicesProps> = ({ indices, onSelectIndex }) => {
  const [selectedTimeframes, setSelectedTimeframes] = useState<{ [key: string]: string }>({
    SPX: '1D',
    NDX: '1D',
    DJI: '1D',
    RUT: '1D',
  });

  const handleTimeframeChange = (e: React.MouseEvent, symbol: string, tf: string) => {
    e.stopPropagation();
    setSelectedTimeframes((prev) => ({ ...prev, [symbol]: tf }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {indices.map((idx) => {
        const isPositive = idx.changePercent >= 0;
        const currentTf = selectedTimeframes[idx.symbol] || '1D';
        const chartPoints = idx.timeframes[currentTf] || idx.sparkline;
        
        // Calculate SVG path
        const minVal = Math.min(...chartPoints);
        const maxVal = Math.max(...chartPoints);
        const range = maxVal - minVal || 1;
        const width = 240;
        const height = 64;
        
        const pointsSvg = chartPoints
          .map((val, i) => {
            const x = (i / (chartPoints.length - 1)) * width;
            const y = height - ((val - minVal) / range) * (height - 12) - 6;
            return `${x},${y}`;
          })
          .join(' ');

        const fillSvg = `${pointsSvg} ${width},${height} 0,${height}`;

        // Day range calculation
        const dayProgress = Math.max(
          0,
          Math.min(100, ((idx.price - idx.dayLow) / (idx.dayHigh - idx.dayLow || 1)) * 100)
        );

        return (
          <div
            key={idx.symbol}
            onClick={() => onSelectIndex(idx)}
            className="group relative bg-white dark:bg-[#1e222d] rounded-xl p-4 border border-[#e0e3eb] dark:border-[#2a2e39] hover:border-[#2962ff]/50 dark:hover:border-[#2962ff]/50 hover:shadow-md transition-all cursor-pointer"
          >
            {/* Header info */}
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm text-[#181b24] dark:text-[#f0f3fa]">
                    {idx.name}
                  </span>
                  <span className="text-[11px] font-medium text-[#737687] dark:text-[#848e9c]">
                    {idx.symbol}
                  </span>
                </div>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-xl font-bold font-mono tracking-tight text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                    {idx.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </span>
                  <span
                    className={`flex items-center text-xs font-semibold tabular-nums ${
                      isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPositive ? (
                      <TrendingUp className="w-3.5 h-3.5 mr-0.5" />
                    ) : (
                      <TrendingDown className="w-3.5 h-3.5 mr-0.5" />
                    )}
                    {isPositive ? '+' : ''}
                    {idx.change.toFixed(2)} ({isPositive ? '+' : ''}
                    {idx.changePercent.toFixed(2)}%)
                  </span>
                </div>
              </div>

              <button
                className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-[#f1f3ff] dark:hover:bg-[#2a2e39] text-[#737687] hover:text-[#2962ff] transition-opacity"
                title="Open Index Chart"
              >
                <Maximize2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Sparkline Canvas / SVG */}
            <div className="mt-3 h-16 w-full overflow-hidden">
              <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id={`grad-${idx.symbol}`} x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="0%"
                      stopColor={isPositive ? '#089981' : '#f23645'}
                      stopOpacity="0.25"
                    />
                    <stop
                      offset="100%"
                      stopColor={isPositive ? '#089981' : '#f23645'}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>
                <polygon points={fillSvg} fill={`url(#grad-${idx.symbol})`} />
                <polyline
                  fill="none"
                  stroke={isPositive ? '#089981' : '#f23645'}
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={pointsSvg}
                />
              </svg>
            </div>

            {/* Timeframe pill selectors */}
            <div className="flex items-center justify-between gap-1 mt-2 pt-2 border-t border-[#e0e3eb]/60 dark:border-[#2a2e39]/60">
              {['1D', '5D', '1M', '6M', '1Y', '5Y'].map((tf) => (
                <button
                  key={tf}
                  onClick={(e) => handleTimeframeChange(e, idx.symbol, tf)}
                  className={`px-1.5 py-0.5 text-[10px] font-semibold rounded transition-colors ${
                    currentTf === tf
                      ? 'bg-[#2962ff] text-white'
                      : 'text-[#737687] dark:text-[#848e9c] hover:bg-[#f1f3ff] dark:hover:bg-[#2a2e39]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Day Range Bar */}
            <div className="mt-2.5">
              <div className="flex justify-between text-[10px] text-[#737687] dark:text-[#848e9c] font-mono tabular-nums">
                <span>L: {idx.dayLow.toLocaleString()}</span>
                <span>H: {idx.dayHigh.toLocaleString()}</span>
              </div>
              <div className="h-1 w-full bg-[#ebedfa] dark:bg-[#2a2e39] rounded-full mt-1 relative overflow-hidden">
                <div
                  className={`h-full rounded-full ${isPositive ? 'bg-[#089981]' : 'bg-[#f23645]'}`}
                  style={{ width: `${dayProgress}%` }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
