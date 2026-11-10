import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { TICKER_TAPE_ITEMS } from '../data/mockMarketData';

interface TickerTapeProps {
  onSelectSymbol: (symbol: string) => void;
}

export const TickerTape: React.FC<TickerTapeProps> = ({ onSelectSymbol }) => {
  return (
    <div className="w-full bg-[#f8f9fd] dark:bg-[#181c27] border-b border-[#e0e3eb] dark:border-[#2a2e39] py-1.5 overflow-hidden">
      <div className="flex items-center gap-6 overflow-x-auto no-scrollbar px-4 whitespace-nowrap scroll-smooth">
        {TICKER_TAPE_ITEMS.map((item) => (
          <div
            key={item.symbol}
            onClick={() => onSelectSymbol(item.symbol)}
            className="flex items-center gap-2 cursor-pointer group py-0.5 px-2 rounded hover:bg-[#eef0fd] dark:hover:bg-[#202534] transition-colors"
          >
            <span className="font-semibold text-xs text-[#181b24] dark:text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
              {item.symbol}
            </span>
            <span className="text-[11px] text-[#5a5e6b] dark:text-[#848e9c] hidden sm:inline">
              {item.name}
            </span>
            <span className="font-mono text-xs font-semibold text-[#181b24] dark:text-[#d1d4dc] tabular-nums">
              {item.price}
            </span>
            <span
              className={`flex items-center text-[11px] font-semibold tabular-nums ${
                item.isPositive ? 'text-[#089981]' : 'text-[#f23645]'
              }`}
            >
              {item.isPositive ? (
                <TrendingUp className="w-3 h-3 mr-0.5" />
              ) : (
                <TrendingDown className="w-3 h-3 mr-0.5" />
              )}
              {item.change}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
