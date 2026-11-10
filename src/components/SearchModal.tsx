import React, { useState, useEffect, useRef } from 'react';
import { StockItem } from '../types/market';
import { Search, X, TrendingUp, TrendingDown, ArrowRight } from 'lucide-react';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  stocks: StockItem[];
  onSelectStock: (stock: StockItem) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  stocks,
  onSelectStock,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const filtered = stocks.filter(
    (s) =>
      s.symbol.toLowerCase().includes(query.toLowerCase()) ||
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.sector.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      e.preventDefault();
      onSelectStock(filtered[selectedIndex]);
      onClose();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/50 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-[#1e222d] rounded-2xl shadow-2xl border border-[#e0e3eb] dark:border-[#2a2e39] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="p-3.5 border-b border-[#e0e3eb] dark:border-[#2a2e39] flex items-center gap-3">
          <Search className="w-4 h-4 text-[#737687] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search stock ticker, company, or sector (e.g. NVDA, Apple, Tech)..."
            className="flex-1 text-sm bg-transparent border-none text-[#181b24] dark:text-[#f0f3fa] focus:outline-none placeholder:text-[#737687]"
          />
          <kbd className="text-[10px] bg-[#f1f3ff] dark:bg-[#131722] px-2 py-0.5 rounded text-[#737687] border border-[#e0e3eb] dark:border-[#2a2e39]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#e0e3eb]/50 dark:divide-[#2a2e39]/50">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#737687]">
              No instruments matching "{query}"
            </div>
          ) : (
            filtered.map((stock, i) => {
              const isPositive = stock.changePercent >= 0;
              const isSelected = i === selectedIndex;

              return (
                <div
                  key={stock.symbol}
                  onClick={() => {
                    onSelectStock(stock);
                    onClose();
                  }}
                  className={`p-3 flex items-center justify-between cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-[#2962ff]/10 dark:bg-[#2962ff]/20'
                      : 'hover:bg-[#f8f9fd] dark:hover:bg-[#202534]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
                      style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
                    >
                      {stock.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#181b24] dark:text-[#f0f3fa]">
                          {stock.symbol}
                        </span>
                        <span className="text-[10px] text-[#737687] px-1 py-0.2 rounded bg-[#f1f3ff] dark:bg-[#2a2e39]">
                          {stock.exchange}
                        </span>
                        <span className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
                          {stock.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-[#737687]">{stock.sector}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                        ${stock.price.toFixed(2)}
                      </div>
                      <div
                        className={`text-[10px] font-mono font-semibold tabular-nums flex items-center justify-end ${
                          isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                        }`}
                      >
                        {isPositive ? '+' : ''}
                        {stock.changePercent.toFixed(2)}%
                      </div>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-[#737687]" />
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="p-2.5 bg-[#f8f9fd] dark:bg-[#131722] border-t border-[#e0e3eb] dark:border-[#2a2e39] text-[10px] text-[#737687] flex items-center justify-between">
          <span>Navigate with ↑ ↓ keys</span>
          <span>Press Enter to view chart</span>
        </div>
      </div>
    </div>
  );
};
