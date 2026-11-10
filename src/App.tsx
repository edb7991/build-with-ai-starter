import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TickerTape } from './components/TickerTape';
import { MarketIndices } from './components/MarketIndices';
import { StockHeatmap } from './components/StockHeatmap';
import { SectorPerformance } from './components/SectorPerformance';
import { StockMoversTable } from './components/StockMoversTable';
import { StockScreener } from './components/StockScreener';
import { EarningsCalendar } from './components/EarningsCalendar';
import { StockDetailModal } from './components/StockDetailModal';
import { WatchlistDrawer } from './components/WatchlistDrawer';
import { SearchModal } from './components/SearchModal';
import { StockItem, MarketIndex } from './types/market';
import {
  INITIAL_STOCKS,
  MARKET_INDICES,
  generateCandles,
  generateSparkline,
} from './data/mockMarketData';
import {
  TrendingUp,
  TrendingDown,
  Layers,
  Table,
  Filter,
  Calendar,
  Zap,
  Globe,
  ShieldCheck,
  BarChart3,
  RefreshCw,
} from 'lucide-react';

export default function App() {
  const [stocks, setStocks] = useState<StockItem[]>(INITIAL_STOCKS);
  const [indices, setIndices] = useState<MarketIndex[]>(MARKET_INDICES);
  const [activeNavCategory, setActiveNavCategory] = useState<string>('stocks');
  const [stockSubTab, setStockSubTab] = useState<
    'overview' | 'heatmap' | 'screener' | 'movers' | 'earnings'
  >('overview');
  const [selectedStock, setSelectedStock] = useState<StockItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [isWatchlistOpen, setIsWatchlistOpen] = useState<boolean>(false);
  const [liveFeedActive, setLiveFeedActive] = useState<boolean>(true);

  // Watchlist persisted in localStorage
  const [watchlist, setWatchlist] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('apex_watchlist');
      return saved ? JSON.parse(saved) : ['NVDA', 'AAPL', 'MSFT', 'TSLA'];
    } catch {
      return ['NVDA', 'AAPL', 'MSFT', 'TSLA'];
    }
  });

  // Dark mode persisted
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('apex_dark_mode');
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem('apex_watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  useEffect(() => {
    localStorage.setItem('apex_dark_mode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Global Cmd+K / Ctrl+K search listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Live Micro-Tick Engine (simulates realistic exchange streaming updates)
  useEffect(() => {
    if (!liveFeedActive) return;

    const interval = setInterval(() => {
      // Pick 2-3 random stocks to update
      setStocks((prevStocks) => {
        const next = [...prevStocks];
        const updateCount = Math.floor(Math.random() * 2) + 1;

        for (let i = 0; i < updateCount; i++) {
          const randomIndex = Math.floor(Math.random() * next.length);
          const s = next[randomIndex];
          const tickPct = (Math.random() - 0.49) * 0.004; // +/- 0.4%
          const priceChange = s.price * tickPct;
          const newPrice = Number(Math.max(1, s.price + priceChange).toFixed(2));
          const newChange = Number((s.change + priceChange).toFixed(2));
          const newChangePct = Number(
            (((newPrice - (s.price - s.change)) / (s.price - s.change)) * 100).toFixed(2)
          );

          const updatedSparkline = [...s.sparkline.slice(1), newPrice];

          next[randomIndex] = {
            ...s,
            price: newPrice,
            change: newChange,
            changePercent: newChangePct,
            high52: Math.max(s.high52, newPrice),
            low52: Math.min(s.low52, newPrice),
            volume: s.volume + Math.floor(Math.random() * 5000),
            sparkline: updatedSparkline,
          };
        }
        return next;
      });

      // Update one random index
      setIndices((prevIndices) => {
        const next = [...prevIndices];
        const randIdx = Math.floor(Math.random() * next.length);
        const idx = next[randIdx];
        const delta = (Math.random() - 0.49) * 2.5;
        const newPrice = Number((idx.price + delta).toFixed(2));
        const newChange = Number((idx.change + delta).toFixed(2));
        const newChangePercent = Number(
          (((newPrice - (idx.price - idx.change)) / (idx.price - idx.change)) * 100).toFixed(2)
        );

        next[randIdx] = {
          ...idx,
          price: newPrice,
          change: newChange,
          changePercent: newChangePercent,
        };
        return next;
      });
    }, 2800);

    return () => clearInterval(interval);
  }, [liveFeedActive]);

  const handleToggleWatchlist = (symbol: string) => {
    setWatchlist((prev) =>
      prev.includes(symbol) ? prev.filter((s) => s !== symbol) : [...prev, symbol]
    );
  };

  const handleSelectSymbol = (symbol: string) => {
    const stock = stocks.find((s) => s.symbol === symbol);
    if (stock) {
      setSelectedStock(stock);
    }
  };

  // Crypto Alternate View for category navigation
  const renderCryptoView = () => {
    const cryptoAssets = [
      { symbol: 'BTC', name: 'Bitcoin', price: '$89,450.00', change: '+2.85%', cap: '$1,760B', vol: '$42.1B', pos: true },
      { symbol: 'ETH', name: 'Ethereum', price: '$3,180.20', change: '+1.94%', cap: '$382.4B', vol: '$18.5B', pos: true },
      { symbol: 'SOL', name: 'Solana', price: '$218.45', change: '+6.12%', cap: '$102.8B', vol: '$8.2B', pos: true },
      { symbol: 'BNB', name: 'BNB Chain', price: '$642.10', change: '+0.45%', cap: '$94.1B', vol: '$2.1B', pos: true },
      { symbol: 'XRP', name: 'Ripple', price: '$0.8420', change: '+14.20%', cap: '$48.2B', vol: '$9.5B', pos: true },
      { symbol: 'DOGE', name: 'Dogecoin', price: '$0.3840', change: '+8.45%', cap: '$56.1B', vol: '$11.2B', pos: true },
      { symbol: 'ADA', name: 'Cardano', price: '$0.5920', change: '+3.15%', cap: '$21.2B', vol: '$1.8B', pos: true },
      { symbol: 'AVAX', name: 'Avalanche', price: '$34.80', change: '-1.10%', cap: '$14.1B', vol: '$920M', pos: false },
    ];

    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] p-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
            <div>
              <h2 className="text-base font-bold text-[#181b24] dark:text-[#f0f3fa]">
                Crypto Markets Overview
              </h2>
              <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
                Real-time digital assets, spot rates & market capitalization
              </p>
            </div>
            <button
              onClick={() => setActiveNavCategory('stocks')}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#2962ff] text-white hover:bg-[#1d4ed8]"
            >
              Back to Stocks
            </button>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#f8f9fd] dark:bg-[#181c27] text-[11px] font-semibold text-[#737687] uppercase border-b border-[#e0e3eb] dark:border-[#2a2e39]">
                  <th className="py-3 px-4">Asset</th>
                  <th className="py-3 px-4 text-right">Price (USD)</th>
                  <th className="py-3 px-4 text-right">24h Change</th>
                  <th className="py-3 px-4 text-right">Market Cap</th>
                  <th className="py-3 px-4 text-right">24h Volume</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3eb]/50 dark:divide-[#2a2e39]/50">
                {cryptoAssets.map((c) => (
                  <tr key={c.symbol} className="hover:bg-[#f8f9fd] dark:hover:bg-[#202534]">
                    <td className="py-3.5 px-4 font-bold text-[#181b24] dark:text-[#f0f3fa]">
                      {c.symbol}{' '}
                      <span className="font-normal text-[#737687] text-[11px] ml-1">
                        {c.name}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold">{c.price}</td>
                    <td
                      className={`py-3.5 px-4 text-right font-mono font-bold ${
                        c.pos ? 'text-[#089981]' : 'text-[#f23645]'
                      }`}
                    >
                      {c.change}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#737687]">{c.cap}</td>
                    <td className="py-3.5 px-4 text-right font-mono text-[#737687]">{c.vol}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#faf9ff] dark:bg-[#131722] text-[#181b24] dark:text-[#d1d4dc] transition-colors">
      {/* Top Navigation Bar adhering to the 3-Zone Top Bar Contract */}
      <Header
        activeTab={activeNavCategory}
        setActiveTab={setActiveNavCategory}
        onOpenSearch={() => setIsSearchOpen(true)}
        onOpenWatchlist={() => setIsWatchlistOpen(true)}
        watchlistCount={watchlist.length}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        liveFeedActive={liveFeedActive}
        setLiveFeedActive={setLiveFeedActive}
      />

      {/* Real-time Ticker Tape Ribbon */}
      <TickerTape onSelectSymbol={handleSelectSymbol} />

      {/* Main Content Area */}
      <main className="max-w-[1680px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Render Stocks Views or Alternate categories */}
        {activeNavCategory !== 'stocks' ? (
          renderCryptoView()
        ) : (
          <>
            {/* Stocks Header & Sub-navigation Strip */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-[#181b24] dark:text-[#f0f3fa]">
                  Stock Markets
                </h1>
                <p className="text-xs sm:text-sm text-[#5a5e6b] dark:text-[#848e9c] mt-0.5">
                  Track equities, real-time index benchmarks, S&P 500 breadth, and technical screeners
                </p>
              </div>

              {/* Sub-navigation Tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1 bg-[#f1f3ff] dark:bg-[#1e222d] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] self-start md:self-auto">
                {[
                  { id: 'overview', label: 'Overview', icon: BarChart3 },
                  { id: 'heatmap', label: 'S&P 500 Heatmap', icon: Layers },
                  { id: 'screener', label: 'Stock Screener', icon: Filter },
                  { id: 'movers', label: 'Market Movers', icon: Table },
                  { id: 'earnings', label: 'Earnings', icon: Calendar },
                ].map((tab) => {
                  const Icon = tab.icon;
                  const isActive = stockSubTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setStockSubTab(tab.id as any)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                        isActive
                          ? 'bg-[#2962ff] text-white shadow-xs'
                          : 'text-[#5a5e6b] dark:text-[#9194a1] hover:text-[#181b24] dark:hover:text-[#f0f3fa] hover:bg-white/60 dark:hover:bg-[#2a2e39]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Benchmark Indices Cards */}
            <section aria-label="Key Market Indices">
              <MarketIndices
                indices={indices}
                onSelectIndex={(idx) => {
                  // Find proxy stock or open index view
                  const stockProxy = stocks.find((s) => s.symbol === 'AAPL');
                  if (stockProxy) setSelectedStock(stockProxy);
                }}
              />
            </section>

            {/* Sub-view Content Switch */}
            {stockSubTab === 'overview' && (
              <div className="space-y-6">
                {/* Sector Rotation & Heatmap Preview Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Left Column: S&P 500 Heatmap Preview (7 cols) */}
                  <div className="lg:col-span-8">
                    <StockHeatmap
                      stocks={stocks}
                      onSelectStock={(stock) => setSelectedStock(stock)}
                    />
                  </div>

                  {/* Right Column: Sector Performance (4 cols) */}
                  <div className="lg:col-span-4">
                    <SectorPerformance onSelectStockSymbol={handleSelectSymbol} />
                  </div>
                </div>

                {/* Primary Market Movers Data Grid */}
                <section aria-label="Market Movers Table">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-base font-bold text-[#181b24] dark:text-[#f0f3fa]">
                      Market Movers & Volume Leaders
                    </h2>
                    <span className="text-xs text-[#737687]">
                      Real-time quote snapshot
                    </span>
                  </div>
                  <StockMoversTable
                    stocks={stocks}
                    watchlist={watchlist}
                    onToggleWatchlist={handleToggleWatchlist}
                    onSelectStock={(stock) => setSelectedStock(stock)}
                  />
                </section>
              </div>
            )}

            {stockSubTab === 'heatmap' && (
              <div className="space-y-4">
                <StockHeatmap
                  stocks={stocks}
                  onSelectStock={(stock) => setSelectedStock(stock)}
                />
              </div>
            )}

            {stockSubTab === 'screener' && (
              <div className="space-y-4">
                <StockScreener
                  stocks={stocks}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSelectStock={(stock) => setSelectedStock(stock)}
                />
              </div>
            )}

            {stockSubTab === 'movers' && (
              <div className="space-y-4">
                <StockMoversTable
                  stocks={stocks}
                  watchlist={watchlist}
                  onToggleWatchlist={handleToggleWatchlist}
                  onSelectStock={(stock) => setSelectedStock(stock)}
                />
              </div>
            )}

            {stockSubTab === 'earnings' && (
              <div className="space-y-4">
                <EarningsCalendar onSelectSymbol={handleSelectSymbol} />
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-[#e0e3eb] dark:border-[#2a2e39] bg-white dark:bg-[#181c27] py-8 text-xs text-[#737687] transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#089981]"></span>
            <span>All quotes delayed by 0s (Real-Time Feed active). Market data powered by Apex Terminal.</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>TradingView Attribution</span>
            <span>Disclaimer</span>
          </div>
        </div>
      </footer>

      {/* Technical Stock Detail Modal */}
      <StockDetailModal
        stock={selectedStock}
        onClose={() => setSelectedStock(null)}
        isWatchlisted={selectedStock ? watchlist.includes(selectedStock.symbol) : false}
        onToggleWatchlist={handleToggleWatchlist}
      />

      {/* Slide-over Watchlist Drawer */}
      <WatchlistDrawer
        isOpen={isWatchlistOpen}
        onClose={() => setIsWatchlistOpen(false)}
        watchlist={watchlist}
        stocks={stocks}
        onRemoveFromWatchlist={handleToggleWatchlist}
        onSelectStock={(stock) => setSelectedStock(stock)}
      />

      {/* Command Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
        stocks={stocks}
        onSelectStock={(stock) => setSelectedStock(stock)}
      />
    </div>
  );
}
