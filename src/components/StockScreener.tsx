import React, { useState, useMemo } from 'react';
import { StockItem } from '../types/market';
import { Filter, Download, RotateCcw, Search, Star, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';

interface StockScreenerProps {
  stocks: StockItem[];
  watchlist: string[];
  onToggleWatchlist: (symbol: string) => void;
  onSelectStock: (stock: StockItem) => void;
}

export const StockScreener: React.FC<StockScreenerProps> = ({
  stocks,
  watchlist,
  onToggleWatchlist,
  onSelectStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('All');
  const [capFilter, setCapFilter] = useState<'All' | 'Mega' | 'Large' | 'Mid'>('All');
  const [ratingFilter, setRatingFilter] = useState('All');
  const [perfFilter, setPerfFilter] = useState<'All' | 'Gainers' | 'Losers'>('All');
  const [sortField, setSortField] = useState<keyof StockItem>('marketCap');
  const [sortAsc, setSortAsc] = useState(false);

  const sectors = ['All', 'Technology', 'Communication Services', 'Consumer Discretionary', 'Financials', 'Health Care', 'Consumer Staples', 'Energy', 'Industrials'];

  const filteredAndSortedStocks = useMemo(() => {
    return stocks
      .filter((stock) => {
        // Search term
        if (
          searchTerm &&
          !stock.symbol.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !stock.name.toLowerCase().includes(searchTerm.toLowerCase())
        ) {
          return false;
        }

        // Sector
        if (selectedSector !== 'All' && stock.sector !== selectedSector) {
          return false;
        }

        // Market Cap
        if (capFilter === 'Mega' && stock.marketCap < 200) return false;
        if (capFilter === 'Large' && (stock.marketCap < 10 || stock.marketCap >= 200)) return false;
        if (capFilter === 'Mid' && stock.marketCap >= 10) return false;

        // Rating
        if (ratingFilter !== 'All' && stock.rating !== ratingFilter) {
          return false;
        }

        // Performance
        if (perfFilter === 'Gainers' && stock.changePercent <= 0) return false;
        if (perfFilter === 'Losers' && stock.changePercent >= 0) return false;

        return true;
      })
      .sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        if (typeof aVal === 'number' && typeof bVal === 'number') {
          return sortAsc ? aVal - bVal : bVal - aVal;
        }
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        return 0;
      });
  }, [stocks, searchTerm, selectedSector, capFilter, ratingFilter, perfFilter, sortField, sortAsc]);

  const handleSort = (field: keyof StockItem) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedSector('All');
    setCapFilter('All');
    setRatingFilter('All');
    setPerfFilter('All');
    setSortField('marketCap');
    setSortAsc(false);
  };

  const exportCSV = () => {
    const headers = ['Symbol', 'Name', 'Sector', 'Price', 'Change %', 'Market Cap (B)', 'Volume', 'Rating'];
    const rows = filteredAndSortedStocks.map((s) => [
      s.symbol,
      `"${s.name}"`,
      `"${s.sector}"`,
      s.price,
      s.changePercent,
      s.marketCap,
      s.volume,
      s.rating,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `apex_stock_screener_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] overflow-hidden">
      {/* Header with Title and Export */}
      <div className="p-4 sm:p-5 border-b border-[#e0e3eb] dark:border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#2962ff]/10 text-[#2962ff]">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-[#181b24] dark:text-[#f0f3fa]">
              Stock Screener & Multi-Factor Filter
            </h2>
            <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
              Scan equities by valuation, technical rating, and sector breadth
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetFilters}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#f1f3ff] dark:bg-[#131722] text-[#5a5e6b] dark:text-[#848e9c] hover:text-[#181b24] dark:hover:text-[#f0f3fa] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2962ff] text-white hover:bg-[#1d4ed8] shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Toolbar Controls */}
      <div className="p-4 bg-[#f8f9fd] dark:bg-[#181c27] border-b border-[#e0e3eb] dark:border-[#2a2e39] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div>
          <label className="block text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] mb-1">
            Search
          </label>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-[#737687] absolute left-2.5 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Ticker or company..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-md bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#181b24] dark:text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
            />
          </div>
        </div>

        {/* Sector */}
        <div>
          <label className="block text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] mb-1">
            Sector
          </label>
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#181b24] dark:text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
          >
            {sectors.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Market Cap */}
        <div>
          <label className="block text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] mb-1">
            Market Cap
          </label>
          <select
            value={capFilter}
            onChange={(e) => setCapFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#181b24] dark:text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
          >
            <option value="All">All Caps</option>
            <option value="Mega">Mega Cap (&gt; $200B)</option>
            <option value="Large">Large Cap ($10B - $200B)</option>
            <option value="Mid">Mid/Small Cap (&lt; $10B)</option>
          </select>
        </div>

        {/* Technical Rating */}
        <div>
          <label className="block text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] mb-1">
            Tech Rating
          </label>
          <select
            value={ratingFilter}
            onChange={(e) => setRatingFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#181b24] dark:text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
          >
            <option value="All">All Ratings</option>
            <option value="Strong Buy">Strong Buy</option>
            <option value="Buy">Buy</option>
            <option value="Neutral">Neutral</option>
            <option value="Sell">Sell</option>
          </select>
        </div>

        {/* Performance Direction */}
        <div>
          <label className="block text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] mb-1">
            Direction
          </label>
          <select
            value={perfFilter}
            onChange={(e) => setPerfFilter(e.target.value as any)}
            className="w-full px-2.5 py-1.5 text-xs rounded-md bg-white dark:bg-[#1e222d] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#181b24] dark:text-[#f0f3fa] focus:outline-none focus:border-[#2962ff]"
          >
            <option value="All">All Performance</option>
            <option value="Gainers">Gainers Only (+)</option>
            <option value="Losers">Losers Only (-)</option>
          </select>
        </div>
      </div>

      {/* Results Count & Current Filter Breadcrumbs */}
      <div className="px-4 py-2 bg-white dark:bg-[#1e222d] border-b border-[#e0e3eb]/60 dark:border-[#2a2e39]/60 flex items-center justify-between text-xs text-[#737687]">
        <span>
          Matching Results:{' '}
          <strong className="text-[#181b24] dark:text-[#f0f3fa]">
            {filteredAndSortedStocks.length}
          </strong>{' '}
          stocks
        </span>
        <span className="text-[11px]">
          Sorted by: <span className="font-semibold capitalize text-[#2962ff]">{String(sortField)}</span> (
          {sortAsc ? 'Ascending' : 'Descending'})
        </span>
      </div>

      {/* Table Results */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#f8f9fd] dark:bg-[#181c27] text-[11px] font-semibold text-[#737687] dark:text-[#848e9c] uppercase tracking-wider border-b border-[#e0e3eb] dark:border-[#2a2e39]">
              <th className="py-3 px-4 w-10 text-center"></th>
              <th
                className="py-3 px-4 cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('symbol')}
              >
                <div className="flex items-center gap-1">
                  <span>Symbol</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4">Sector</th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('price')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Price</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('changePercent')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Change %</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('marketCap')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Market Cap</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('volume')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Volume</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                className="py-3 px-4 text-right cursor-pointer hover:text-[#2962ff]"
                onClick={() => handleSort('peRatio')}
              >
                <div className="flex items-center justify-end gap-1">
                  <span>P/E</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="py-3 px-4 text-center">Rating</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#e0e3eb]/60 dark:divide-[#2a2e39]/60 text-xs">
            {filteredAndSortedStocks.length === 0 ? (
              <tr>
                <td colSpan={9} className="py-12 text-center text-[#737687]">
                  <p className="text-sm font-semibold">No stocks meet the selected filter criteria</p>
                  <button
                    onClick={handleResetFilters}
                    className="mt-2 px-3 py-1 text-xs text-[#2962ff] font-semibold underline"
                  >
                    Reset all filters
                  </button>
                </td>
              </tr>
            ) : (
              filteredAndSortedStocks.map((stock) => {
                const isPositive = stock.changePercent >= 0;
                const isWatchlisted = watchlist.includes(stock.symbol);

                return (
                  <tr
                    key={stock.symbol}
                    onClick={() => onSelectStock(stock)}
                    className="hover:bg-[#f8f9fd] dark:hover:bg-[#202534] transition-colors cursor-pointer group"
                  >
                    <td
                      className="py-3 px-4 text-center"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleWatchlist(stock.symbol);
                      }}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${
                          isWatchlisted
                            ? 'text-[#f59e0b] fill-[#f59e0b]'
                            : 'text-[#737687]/40 hover:text-[#737687]'
                        }`}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#181b24] dark:text-[#f0f3fa] group-hover:text-[#2962ff] transition-colors">
                          {stock.symbol}
                        </span>
                        <span className="text-[#5a5e6b] dark:text-[#848e9c] truncate max-w-[140px]">
                          {stock.name}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#5a5e6b] dark:text-[#848e9c] text-xs">
                      {stock.sector}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                      ${stock.price.toFixed(2)}
                    </td>
                    <td
                      className={`py-3 px-4 text-right font-mono font-bold tabular-nums ${
                        isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {isPositive ? '+' : ''}
                      {stock.changePercent.toFixed(2)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-[#181b24] dark:text-[#f0f3fa]">
                      {stock.marketCap >= 1000
                        ? `$${(stock.marketCap / 1000).toFixed(2)}T`
                        : `$${stock.marketCap.toFixed(1)}B`}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5a5e6b] dark:text-[#848e9c] tabular-nums">
                      {(stock.volume / 1000000).toFixed(2)}M
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-[#5a5e6b] dark:text-[#848e9c] tabular-nums">
                      {stock.peRatio > 0 ? stock.peRatio.toFixed(1) : '—'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-semibold text-[#2962ff] px-2 py-0.5 rounded bg-[#2962ff]/10">
                        {stock.rating}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
