import React from 'react';
import { StockItem } from '../types/market';
import { X, Star, Trash2, ArrowUpRight, ArrowDownRight, TrendingUp, TrendingDown } from 'lucide-react';

interface WatchlistDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  watchlist: string[];
  stocks: StockItem[];
  onRemoveFromWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockItem) => void;
}

export const WatchlistDrawer: React.FC<WatchlistDrawerProps> = ({
  isOpen,
  onClose,
  watchlist,
  stocks,
  onRemoveFromWatchlist,
  onSelectStock,
}) => {
  if (!isOpen) return null;

  const watchlistedStocks = stocks.filter((s) => watchlist.includes(s.symbol));

  const totalValue = watchlistedStocks.reduce((acc, s) => acc + s.price, 0);
  const avgPerformance =
    watchlistedStocks.length > 0
      ? watchlistedStocks.reduce((acc, s) => acc + s.changePercent, 0) / watchlistedStocks.length
      : 0;
  const isAvgPositive = avgPerformance >= 0;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end">
      <div className="w-full max-w-md bg-white dark:bg-[#181c27] h-full shadow-2xl border-l border-[#e0e3eb] dark:border-[#2a2e39] flex flex-col animate-in slide-in-from-right duration-250">
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-[#e0e3eb] dark:border-[#2a2e39] flex items-center justify-between bg-[#faf9ff] dark:bg-[#1e222d]">
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-[#f59e0b] fill-[#f59e0b]" />
            <h2 className="text-base font-bold text-[#181b24] dark:text-[#f0f3fa]">
              My Watchlist
            </h2>
            <span className="text-xs bg-[#2962ff]/10 text-[#2962ff] px-2 py-0.5 rounded-full font-semibold">
              {watchlistedStocks.length}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa] hover:bg-[#f1f3ff] dark:hover:bg-[#2a2e39] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Aggregate Watchlist Summary */}
        {watchlistedStocks.length > 0 && (
          <div className="p-4 bg-[#f8f9fd] dark:bg-[#131722] border-b border-[#e0e3eb] dark:border-[#2a2e39] flex items-center justify-between">
            <div>
              <span className="text-[11px] text-[#737687] block">Basket Aggregate</span>
              <span className="text-sm font-bold font-mono text-[#181b24] dark:text-[#f0f3fa]">
                ${totalValue.toFixed(2)}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-[#737687] block">Avg. Daily Move</span>
              <span
                className={`text-xs font-bold font-mono flex items-center gap-0.5 justify-end ${
                  isAvgPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isAvgPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isAvgPositive ? '+' : ''}
                {avgPerformance.toFixed(2)}%
              </span>
            </div>
          </div>
        )}

        {/* Watchlist Items */}
        <div className="flex-1 overflow-y-auto divide-y divide-[#e0e3eb]/60 dark:divide-[#2a2e39]/60">
          {watchlistedStocks.length === 0 ? (
            <div className="p-8 text-center text-[#737687]">
              <Star className="w-10 h-10 mx-auto text-[#c3c5d8] dark:text-[#363a45] mb-2" />
              <p className="text-sm font-semibold text-[#181b24] dark:text-[#f0f3fa]">
                Your watchlist is empty
              </p>
              <p className="text-xs text-[#737687] mt-1">
                Click the star icon next to any ticker in the tables or heatmap to track it here.
              </p>
            </div>
          ) : (
            watchlistedStocks.map((stock) => {
              const isPositive = stock.changePercent >= 0;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock);
                    onClose();
                  }}
                  className="p-3.5 flex items-center justify-between hover:bg-[#f8f9fd] dark:hover:bg-[#202534] transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#181b24] dark:text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-[#737687]">{stock.sector}</span>
                      </div>
                      <span className="text-[11px] text-[#5a5e6b] dark:text-[#848e9c] truncate max-w-[150px] block">
                        {stock.name}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[11px] font-semibold font-mono tabular-nums flex items-center justify-end gap-0.5 ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveFromWatchlist(stock.symbol);
                      }}
                      className="p-1 rounded text-[#737687] hover:text-[#f23645] hover:bg-[#fdebed] dark:hover:bg-[#f23645]/15 transition-colors"
                      title="Remove from Watchlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
