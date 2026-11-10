import React, { useState } from 'react';
import { StockItem } from '../types/market';
import { Layers, TrendingUp, TrendingDown, Eye } from 'lucide-react';

interface StockHeatmapProps {
  stocks: StockItem[];
  onSelectStock: (stock: StockItem) => void;
}

export const StockHeatmap: React.FC<StockHeatmapProps> = ({ stocks, onSelectStock }) => {
  const [selectedSector, setSelectedSector] = useState<string>('All');
  const [metric, setMetric] = useState<'1D' | '1W' | '1M'>('1D');
  const [sizeBy, setSizeBy] = useState<'marketCap' | 'volume'>('marketCap');
  const [hoveredStock, setHoveredStock] = useState<StockItem | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const sectors = ['All', 'Technology', 'Communication Services', 'Consumer Discretionary', 'Financials', 'Health Care', 'Consumer Staples', 'Energy', 'Industrials'];

  // Filter stocks by sector
  const filteredStocks = selectedSector === 'All'
    ? stocks
    : stocks.filter((s) => s.sector === selectedSector);

  // Group stocks by sector
  const groupedBySector: { [key: string]: StockItem[] } = {};
  filteredStocks.forEach((stock) => {
    if (!groupedBySector[stock.sector]) {
      groupedBySector[stock.sector] = [];
    }
    groupedBySector[stock.sector].push(stock);
  });

  // Color generator based on change %
  const getTileColor = (changePercent: number) => {
    if (changePercent >= 4.0) return 'bg-[#089981] text-white hover:brightness-110';
    if (changePercent >= 2.0) return 'bg-[#10b981] text-white hover:brightness-110';
    if (changePercent >= 0.5) return 'bg-[#059669] text-white hover:brightness-110';
    if (changePercent >= 0.0) return 'bg-[#047857]/80 text-white hover:brightness-110';
    if (changePercent >= -1.0) return 'bg-[#e11d48]/80 text-white hover:brightness-110';
    if (changePercent >= -3.0) return 'bg-[#dc2626] text-white hover:brightness-110';
    return 'bg-[#f23645] text-white hover:brightness-110';
  };

  const handleMouseMove = (e: React.MouseEvent, stock: StockItem) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTooltipPos({
      x: rect.left + rect.width / 2,
      y: rect.top - 8,
    });
    setHoveredStock(stock);
  };

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] p-4 sm:p-5">
      {/* Heatmap Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2962ff]/10 text-[#2962ff]">
            <Layers className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#181b24] dark:text-[#f0f3fa]">
              S&P 500 Market Heatmap
            </h2>
            <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
              Treemap partitioned by market weight and performance
            </p>
          </div>
        </div>

        {/* View Controls: Size & Metric */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-[#f1f3ff] dark:bg-[#131722] p-0.5 rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39]">
            <span className="text-[10px] text-[#737687] px-2 font-medium">Metric:</span>
            {(['1D', '1W', '1M'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                  metric === m
                    ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                    : 'text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa]'
                }`}
              >
                {m}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#f1f3ff] dark:bg-[#131722] p-0.5 rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39]">
            <span className="text-[10px] text-[#737687] px-2 font-medium">Size by:</span>
            <button
              onClick={() => setSizeBy('marketCap')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sizeBy === 'marketCap'
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                  : 'text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa]'
              }`}
            >
              Market Cap
            </button>
            <button
              onClick={() => setSizeBy('volume')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                sizeBy === 'volume'
                  ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                  : 'text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa]'
              }`}
            >
              Volume
            </button>
          </div>
        </div>
      </div>

      {/* Sector filter tags */}
      <div className="flex items-center gap-1.5 py-3 overflow-x-auto no-scrollbar whitespace-nowrap">
        {sectors.map((sec) => (
          <button
            key={sec}
            onClick={() => setSelectedSector(sec)}
            className={`px-3 py-1 rounded-md text-xs font-medium transition-colors ${
              selectedSector === sec
                ? 'bg-[#2962ff] text-white shadow-xs'
                : 'bg-[#f1f3ff] dark:bg-[#181c27] text-[#5a5e6b] dark:text-[#9194a1] hover:bg-[#e5e8f4] dark:hover:bg-[#2a2e39]'
            }`}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* Treemap Container */}
      <div className="mt-2 min-h-[440px] w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(groupedBySector).map(([sectorName, sectorStocks]) => {
          // Total weight of this sector
          const totalSectorWeight = sectorStocks.reduce(
            (acc, s) => acc + (sizeBy === 'marketCap' ? s.marketCap : s.volume / 1000000),
            0
          );

          return (
            <div
              key={sectorName}
              className="bg-[#f8f9fd] dark:bg-[#131722]/60 rounded-lg p-2.5 border border-[#e0e3eb]/80 dark:border-[#2a2e39]/80 flex flex-col"
            >
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50">
                <span className="text-xs font-bold text-[#181b24] dark:text-[#f0f3fa] truncate">
                  {sectorName}
                </span>
                <span className="text-[10px] font-mono text-[#737687] dark:text-[#848e9c]">
                  {sizeBy === 'marketCap' ? `$${totalSectorWeight.toFixed(1)}B` : `${Math.round(totalSectorWeight)}M vol`}
                </span>
              </div>

              {/* Tiles Grid within Sector */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 flex-1 content-start">
                {sectorStocks.map((stock) => {
                  const weightRatio =
                    (sizeBy === 'marketCap' ? stock.marketCap : stock.volume / 1000000) /
                    (totalSectorWeight || 1);
                  const isLarge = weightRatio > 0.35;
                  const isPositive = stock.changePercent >= 0;

                  return (
                    <div
                      key={stock.symbol}
                      onClick={() => onSelectStock(stock)}
                      onMouseEnter={(e) => handleMouseMove(e, stock)}
                      onMouseLeave={() => setHoveredStock(null)}
                      className={`relative rounded-md p-2 flex flex-col justify-between cursor-pointer transition-transform transform active:scale-98 shadow-xs ${getTileColor(
                        stock.changePercent
                      )} ${isLarge ? 'col-span-2 row-span-2 min-h-[110px]' : 'min-h-[74px]'}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs tracking-tight truncate drop-shadow-xs">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] opacity-80 truncate ml-1 font-mono">
                          ${stock.price.toFixed(2)}
                        </span>
                      </div>

                      <div className="my-auto py-1">
                        <div className="text-sm sm:text-base font-extrabold tracking-tight font-mono tabular-nums">
                          {isPositive ? '+' : ''}
                          {stock.changePercent.toFixed(2)}%
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px] opacity-90 font-mono">
                        <span className="truncate max-w-[65%]">{stock.name}</span>
                        <span>${stock.marketCap.toFixed(0)}B</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Heatmap Legend */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 pt-3 border-t border-[#e0e3eb] dark:border-[#2a2e39] text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[#737687] text-[11px] font-semibold">Scale:</span>
          <div className="flex items-center rounded overflow-hidden text-[10px] font-bold text-white">
            <span className="bg-[#f23645] px-2 py-0.5">-3%</span>
            <span className="bg-[#dc2626] px-2 py-0.5">-2%</span>
            <span className="bg-[#e11d48]/80 px-2 py-0.5">-1%</span>
            <span className="bg-[#4b5563] px-2 py-0.5">0%</span>
            <span className="bg-[#059669] px-2 py-0.5">+1%</span>
            <span className="bg-[#10b981] px-2 py-0.5">+2%</span>
            <span className="bg-[#089981] px-2 py-0.5">+3%+</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[11px] text-[#737687] dark:text-[#848e9c]">
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5 text-[#2962ff]" /> Hover for details
          </span>
          <span>·</span>
          <span>Click tile to open live technical chart</span>
        </div>
      </div>

      {/* Interactive Floating Tooltip */}
      {hoveredStock && (
        <div
          className="fixed z-50 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-2 bg-[#181b24] text-white p-3 rounded-xl shadow-2xl border border-white/10 w-64 backdrop-blur-md"
          style={{ left: `${tooltipPos.x}px`, top: `${tooltipPos.y}px` }}
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/10">
            <div className="flex items-center gap-2">
              <div
                className="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px]"
                style={{ backgroundColor: hoveredStock.logoBg, color: hoveredStock.logoColor }}
              >
                {hoveredStock.symbol.slice(0, 2)}
              </div>
              <div>
                <span className="font-bold text-xs">{hoveredStock.symbol}</span>
                <span className="text-[10px] text-gray-400 block truncate max-w-[130px]">
                  {hoveredStock.name}
                </span>
              </div>
            </div>
            <span className="text-xs font-mono font-bold">${hoveredStock.price.toFixed(2)}</span>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[10px]">Change</span>
              <span
                className={`font-bold font-mono ${
                  hoveredStock.changePercent >= 0 ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {hoveredStock.changePercent >= 0 ? '+' : ''}
                {hoveredStock.changePercent.toFixed(2)}% (${hoveredStock.change.toFixed(2)})
              </span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Market Cap</span>
              <span className="font-mono font-semibold">${hoveredStock.marketCap.toFixed(1)}B</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Sector</span>
              <span className="truncate block">{hoveredStock.sector}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px]">Rating</span>
              <span className="text-[#2962ff] font-semibold">{hoveredStock.rating}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
