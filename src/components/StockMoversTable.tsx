import React, { useState } from 'react';
import { StockItem } from '../types/market';
import { TrendingUp, TrendingDown, Star, BarChart2, ArrowUpDown } from 'lucide-react';

interface StockMoversTableProps {
  stocks: StockItem[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockItem) => void;
}

export const StockMoversTable: React.FC<StockMoversTableProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const [activeTab, setActiveTab] = useState<'mega' | 'gainers' | 'losers' | 'active' | 'dividend'>(
    'mega'
  );

  // Filter/Sort based on tab
  const getTabStocks = () => {
    switch (activeTab) {
      case 'mega':
        return [...stocks].sort((a, b) => b.marketCap - a.marketCap);
      case 'gainers':
        return [...stocks].sort((a, b) => b.changePercent - a.changePercent);
      case 'losers':
        return [...stocks].sort((a, b) => a.changePercent - b.changePercent);
      case 'active':
        return [...stocks].sort((a, b) => b.volume - a.volume);
      case 'dividend':
        return [...stocks].sort((a, b) => b.dividendYield - a.dividendYield);
      default:
        return stocks;
    }
  };

  const currentStocks = getTabStocks();

  const getRatingBadge = (rating: string) => {
    switch (rating) {
      case 'Strong Buy':
        return 'text-[#089981] bg-[#e6f5f2] dark:bg-[#089981]/15';
      case 'Buy':
        return 'text-[#10b981] bg-[#10b981]/10';
      case 'Neutral':
        return 'text-[#737687] bg-[#f1f3ff] dark:bg-[#2a2e39]';
      case 'Sell':
      case 'Strong Sell':
        return 'text-[#f23645] bg-[#fdebed] dark:bg-[#f23645]/15';
      default:
        return 'text-[#737687] bg-gray-100';
    }
  };

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] overflow-hidden">
      {/* Tab Navigation header */}
      <div className="flex items-center justify-between gap-4 p-4 border-b border-[#e0e3eb] dark:border-[#2a2e39] overflow-x-auto no-scrollbar">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: 'mega', label: 'Mega-Cap Leaders' },
            { id: 'gainers', label: 'Top Gainers' },
            { id: 'losers', label: 'Top Losers' },
            { id: 'active', label: 'Most Active' },
            { id: 'dividend', label: 'High Dividend' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-[#2962ff] text-white shadow-xs'
                  : 'text-[#5a5e6b] dark:text-[#9194a1] hover:bg-[#f1f3ff] dark:hover:bg-[#2a2e39]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="text-xs text-[#737687] dark:text-[#848e9c] shrink-0 font-medium">
          Showing {currentStocks.length} assets
        </div>
      </div>

      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fd] dark:bg-[#181c27] text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] uppercase tracking-wider border-b border-[#e0e3eb] dark:border-[#2a2e39]">
              <th className="py-3 px-4 w-10 text-center"></th>
              <th className="py-3 px-4">Symbol / Company</th>
              <th className="py-3 px-4 text-right">Price</th>
              <th className="py-3 px-4 text-right">Change %</th>
              <th className="py-3 px-4 text-right">Change ($)</th>
              <th className="py-3 px-4 text-center">Tech Rating</th>
              <th className="py-3 px-4 text-right">Volume</th>
              <th className="py-3 px-4 text-right">Market Cap</th>
              <th className="py-3 px-4 text-right">P/E (TTM)</th>
              <th className="py-3 px-4 text-center">Trend (1D)</th>
              <th className="py-3 px-4 text-center">Chart</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e3eb]/60 dark:divide-[#2a2e39]/60 text-xs">
            {currentStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;
              const isWatchlisted = watchlist.includes(stock.symbol);

              // Sparkline SVG calculation
              const minVal = Math.min(...stock.sparkline);
              const maxVal = Math.max(...stock.sparkline);
              const range = maxVal - minVal || 1;
              const sWidth = 90;
              const sHeight = 24;
              const sparklinePoints = stock.sparkline
                .map((v, i) => {
                  const x = (i / (stock.sparkline.length - 1)) * sWidth;
                  const y = sHeight - ((v - minVal) / range) * (sHeight - 6) - 3;
                  return `${x},${y}`;
                })
                .join(' ');

              return (
                <tr
                  key={stock.symbol}
                  onClick={() => onSelectStock(stock)}
                  className="hover:bg-[#f8f9fd] dark:hover:bg-[#202534] transition-colors cursor-pointer group"
                >
                  {/* Star Toggle */}
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleWatchlist(stock.symbol);
                    }}
                  >
                    <button
                      className="p-1 rounded hover:bg-[#ebedfa] dark:hover:bg-[#2a2e39] text-[#737687] hover:text-[#f59e0b] transition-colors"
                      title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isWatchlisted
                            ? 'text-[#f59e0b] fill-[#f59e0b]'
                            : 'text-[#737687]/40 hover:text-[#737687]'
                        }`}
                      />
                    </button>
                  </td>

                  {/* Symbol & Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs"
                        style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                      >
                        {stock.symbol.slice(0, 2)}
                      </div>
                      <div className="truncate max-w-[180px]">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-[#181b24] dark:text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                            {stock.symbol}
                          </span>
                          <span className="text-[10px] text-[#737687] px-1 py-0.2 bg-[#f1f3ff] dark:bg-[#2a2e39] rounded">
                            {stock.exchange}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#5a5e6b] dark:text-[#848e9c] truncate block">
                          {stock.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                    ${stock.price.toFixed(2)}
                  </td>

                  {/* Change % */}
                  <td className="py-3 px-4 text-right font-mono font-semibold tabular-nums">
                    <span
                      className={`inline-flex items-center gap-0.5 ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? (
                        <TrendingUp className="w-3.5 h-3.5" />
                      ) : (
                        <TrendingDown className="w-3.5 h-3.5" />
                      )}
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </span>
                  </td>

                  {/* Change $ */}
                  <td
                    className={`py-3 px-4 text-right font-mono tabular-nums ${
                      isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                    }`}
                  >
                    {isPositive ? '+' : ''}
                    {stock.change.toFixed(2)}
                  </td>

                  {/* Rating */}
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold tracking-wide ${getRatingBadge(
                        stock.rating
                      )}`}
                    >
                      {stock.rating}
                    </span>
                  </td>

                  {/* Volume */}
                  <td className="py-3 px-4 text-right font-mono text-[#5a5e6b] dark:text-[#848e9c] tabular-nums">
                    {(stock.volume / 1000000).toFixed(2)}M
                  </td>

                  {/* Market Cap */}
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#181b24] dark:text-[#d1d4dc] tabular-nums">
                    {stock.marketCap >= 1000
                      ? `$${(stock.marketCap / 1000).toFixed(2)}T`
                      : `$${stock.marketCap.toFixed(1)}B`}
                  </td>

                  {/* P/E Ratio */}
                  <td className="py-3 px-4 text-right font-mono text-[#5a5e6b] dark:text-[#848e9c] tabular-nums">
                    {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                  </td>

                  {/* Mini Sparkline */}
                  <td className="py-3 px-4 text-center">
                    <div className="w-[90px] h-[24px] mx-auto overflow-hidden">
                      <svg viewBox={`0 0 ${sWidth} ${sHeight}`} className="w-full h-full">
                        <polyline
                          fill="none"
                          stroke={isPositive ? '#089981' : '#f23645'}
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          points={sparklinePoints}
                        />
                      </svg>
                    </div>
                  </td>

                  {/* Quick Chart Trigger */}
                  <td className="py-3 px-4 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStock(stock);
                      }}
                      className="p-1.5 rounded-md hover:bg-[#2962ff]/10 text-[#737687] hover:text-[#2962ff] transition-colors"
                      title="Open Interactive Chart"
                    >
                      <BarChart2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
