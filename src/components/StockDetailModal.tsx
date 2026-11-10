import React, { useState, useRef } from 'react';
import { StockItem, CandleData } from '../types/market';
import {
  X,
  Star,
  TrendingUp,
  TrendingDown,
  BarChart2,
  LineChart,
  Sliders,
  DollarSign,
  Info,
  CheckCircle,
} from 'lucide-react';

interface StockDetailModalProps {
  stock: StockItem | null;
  onClose: () => void;
  isWatchlisted: boolean;
  onToggleWatchlist: (symbol: string) => void;
}

export const StockDetailModal: React.FC<StockDetailModalProps> = ({
  stock,
  onClose,
  isWatchlisted,
  onToggleWatchlist,
}) => {
  if (!stock) return null;

  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick');
  const [timeframe, setTimeframe] = useState<'1D' | '5D' | '1M' | '3M' | '1Y'>('1M');
  const [showSma20, setShowSma20] = useState<boolean>(true);
  const [showSma50, setShowSma50] = useState<boolean>(false);
  const [showRsi, setShowRsi] = useState<boolean>(false);
  const [hoveredCandle, setHoveredCandle] = useState<CandleData | null>(null);
  const [hoverX, setHoverX] = useState<number | null>(null);

  // Paper trade state
  const [tradeShares, setTradeShares] = useState<number>(10);
  const [tradeSuccessMsg, setTradeSuccessMsg] = useState<string | null>(null);

  const isPositive = stock.changePercent >= 0;

  // Filter candles based on timeframe
  const candles = stock.candles.slice(
    timeframe === '1D'
      ? -10
      : timeframe === '5D'
      ? -20
      : timeframe === '1M'
      ? -30
      : -40
  );

  // Compute SMA lines
  const computeSma = (period: number) => {
    return candles.map((_, i) => {
      if (i < period - 1) return null;
      const slice = candles.slice(i - period + 1, i + 1);
      const sum = slice.reduce((acc, c) => acc + c.close, 0);
      return sum / period;
    });
  };

  const sma20 = computeSma(5);
  const sma50 = computeSma(10);

  // Chart Geometry
  const svgWidth = 800;
  const svgHeight = 320;
  const paddingLeft = 10;
  const paddingRight = 60;
  const paddingTop = 20;
  const paddingBottom = 40;
  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const minPrice = Math.min(...candles.map((c) => c.low)) * 0.995;
  const maxPrice = Math.max(...candles.map((c) => c.high)) * 1.005;
  const priceRange = maxPrice - minPrice || 1;

  const maxVolume = Math.max(...candles.map((c) => c.volume)) || 1;

  const getY = (price: number) => {
    return paddingTop + chartHeight - ((price - minPrice) / priceRange) * chartHeight;
  };

  const getX = (index: number) => {
    return paddingLeft + (index / (candles.length - 1 || 1)) * chartWidth;
  };

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, (mouseX - paddingLeft) / chartWidth));
    const index = Math.round(ratio * (candles.length - 1));
    if (candles[index]) {
      setHoveredCandle(candles[index]);
      setHoverX(getX(index));
    }
  };

  const handleMouseLeave = () => {
    setHoveredCandle(null);
    setHoverX(null);
  };

  const handleExecuteTrade = (type: 'BUY' | 'SELL') => {
    const total = tradeShares * stock.price;
    setTradeSuccessMsg(
      `Executed ${type} ${tradeShares} shares of ${stock.symbol} at $${stock.price.toFixed(
        2
      )} (Total: $${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})`
    );
    setTimeout(() => setTradeSuccessMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white dark:bg-[#181c27] border border-[#e0e3eb] dark:border-[#2a2e39] rounded-2xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="p-4 sm:p-5 border-b border-[#e0e3eb] dark:border-[#2a2e39] flex items-center justify-between gap-4 bg-[#faf9ff] dark:bg-[#1e222d]">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 shadow-sm"
              style={{ backgroundColor: stock.logoBg, color: stock.logoColor }}
            >
              {stock.symbol.slice(0, 2)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-[#181b24] dark:text-[#f0f3fa]">
                  {stock.symbol}
                </h1>
                <span className="text-xs px-2 py-0.5 rounded bg-[#f1f3ff] dark:bg-[#2a2e39] text-[#737687]">
                  {stock.exchange}
                </span>
                <span className="text-xs text-[#5a5e6b] dark:text-[#848e9c]">
                  {stock.sector} · {stock.industry}
                </span>
              </div>
              <p className="text-xs text-[#737687] font-medium">{stock.name}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Price block */}
            <div className="text-right">
              <div className="text-xl font-extrabold font-mono text-[#181b24] dark:text-[#f0f3fa] tabular-nums">
                ${stock.price.toFixed(2)}
              </div>
              <div
                className={`text-xs font-bold font-mono tabular-nums flex items-center justify-end gap-1 ${
                  isPositive ? 'text-[#089981]' : 'text-[#f23645]'
                }`}
              >
                {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {isPositive ? '+' : ''}
                {stock.change.toFixed(2)} ({isPositive ? '+' : ''}
                {stock.changePercent.toFixed(2)}%)
              </div>
            </div>

            {/* Watchlist toggle */}
            <button
              onClick={() => onToggleWatchlist(stock.symbol)}
              className={`p-2 rounded-lg border transition-colors ${
                isWatchlisted
                  ? 'bg-[#f59e0b]/10 border-[#f59e0b]/30 text-[#f59e0b]'
                  : 'bg-white dark:bg-[#131722] border-[#e0e3eb] dark:border-[#2a2e39] text-[#737687] hover:text-[#181b24]'
              }`}
              title={isWatchlisted ? 'Remove from Watchlist' : 'Add to Watchlist'}
            >
              <Star className={`w-4 h-4 ${isWatchlisted ? 'fill-[#f59e0b]' : ''}`} />
            </button>

            {/* Close button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white dark:bg-[#131722] border border-[#e0e3eb] dark:border-[#2a2e39] text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6 flex-1">
          {/* Chart Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[#e0e3eb] dark:border-[#2a2e39]">
            {/* Timeframe selector */}
            <div className="flex items-center gap-1 bg-[#f1f3ff] dark:bg-[#131722] p-0.5 rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39]">
              {(['1D', '5D', '1M', '3M', '1Y'] as const).map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    timeframe === tf
                      ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                      : 'text-[#737687] hover:text-[#181b24] dark:hover:text-[#f0f3fa]'
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>

            {/* Chart Type & Indicator Toggles */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#f1f3ff] dark:bg-[#131722] p-0.5 rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39]">
                <button
                  onClick={() => setChartType('candlestick')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    chartType === 'candlestick'
                      ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                      : 'text-[#737687]'
                  }`}
                >
                  <BarChart2 className="w-3.5 h-3.5" />
                  Candles
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`flex items-center gap-1 px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    chartType === 'line'
                      ? 'bg-white dark:bg-[#2a2e39] text-[#2962ff] shadow-xs'
                      : 'text-[#737687]'
                  }`}
                >
                  <LineChart className="w-3.5 h-3.5" />
                  Line
                </button>
              </div>

              {/* Indicator Buttons */}
              <button
                onClick={() => setShowSma20(!showSma20)}
                className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                  showSma20
                    ? 'bg-[#2962ff]/10 border-[#2962ff] text-[#2962ff]'
                    : 'bg-[#f1f3ff] dark:bg-[#131722] border-[#e0e3eb] dark:border-[#2a2e39] text-[#737687]'
                }`}
              >
                SMA 20
              </button>
              <button
                onClick={() => setShowSma50(!showSma50)}
                className={`px-2 py-1 text-xs font-semibold rounded border transition-colors ${
                  showSma50
                    ? 'bg-[#f59e0b]/10 border-[#f59e0b] text-[#f59e0b]'
                    : 'bg-[#f1f3ff] dark:bg-[#131722] border-[#e0e3eb] dark:border-[#2a2e39] text-[#737687]'
                }`}
              >
                SMA 50
              </button>
            </div>
          </div>

          {/* Interactive Inspection Bar (TradingView HUD) */}
          <div className="flex items-center justify-between text-xs font-mono py-1 px-3 bg-[#f8f9fd] dark:bg-[#131722] rounded-md border border-[#e0e3eb]/60 dark:border-[#2a2e39]/60">
            {hoveredCandle ? (
              <div className="flex items-center gap-3 sm:gap-6 flex-wrap">
                <span className="text-[#737687]">Date: <strong className="text-[#181b24] dark:text-[#f0f3fa]">{hoveredCandle.time}</strong></span>
                <span>O: <strong className="text-[#181b24] dark:text-[#f0f3fa]">${hoveredCandle.open.toFixed(2)}</strong></span>
                <span>H: <strong className="text-[#089981]">${hoveredCandle.high.toFixed(2)}</strong></span>
                <span>L: <strong className="text-[#f23645]">${hoveredCandle.low.toFixed(2)}</strong></span>
                <span>C: <strong className="text-[#181b24] dark:text-[#f0f3fa]">${hoveredCandle.close.toFixed(2)}</strong></span>
                <span>Vol: <strong className="text-[#2962ff]">{(hoveredCandle.volume / 1000000).toFixed(2)}M</strong></span>
              </div>
            ) : (
              <span className="text-[#737687]">
                Hover anywhere on the chart to inspect Open, High, Low, Close, Volume
              </span>
            )}
          </div>

          {/* Interactive Technical Chart SVG */}
          <div className="relative w-full h-[320px] bg-[#faf9ff] dark:bg-[#131722] rounded-xl border border-[#e0e3eb] dark:border-[#2a2e39] p-2 select-none overflow-hidden">
            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-full cursor-crosshair"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              {/* Horizontal Grid lines and Price labels */}
              {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                const price = minPrice + priceRange * (1 - pct);
                const y = paddingTop + chartHeight * pct;
                return (
                  <g key={pct}>
                    <line
                      x1={paddingLeft}
                      y1={y}
                      x2={svgWidth - paddingRight}
                      y2={y}
                      stroke="currentColor"
                      className="text-[#e0e3eb]/70 dark:text-[#2a2e39]/70"
                      strokeDasharray="3 3"
                    />
                    <text
                      x={svgWidth - paddingRight + 6}
                      y={y + 4}
                      fill="currentColor"
                      className="text-[10px] font-mono text-[#737687] fill-current"
                    >
                      ${price.toFixed(1)}
                    </text>
                  </g>
                );
              })}

              {/* Volume Bars at Bottom */}
              {candles.map((candle, i) => {
                const x = getX(i);
                const volHeight = (candle.volume / maxVolume) * 50;
                const y = paddingTop + chartHeight - volHeight;
                const isGreen = candle.close >= candle.open;
                return (
                  <rect
                    key={`vol-${i}`}
                    x={x - 4}
                    y={y}
                    width={8}
                    height={volHeight}
                    fill={isGreen ? '#089981' : '#f23645'}
                    opacity={0.3}
                  />
                );
              })}

              {/* Candlesticks or Line */}
              {chartType === 'candlestick' ? (
                candles.map((candle, i) => {
                  const x = getX(i);
                  const isGreen = candle.close >= candle.open;
                  const candleColor = isGreen ? '#089981' : '#f23645';

                  const yHigh = getY(candle.high);
                  const yLow = getY(candle.low);
                  const yOpen = getY(candle.open);
                  const yClose = getY(candle.close);

                  const bodyTop = Math.min(yOpen, yClose);
                  const bodyHeight = Math.max(Math.abs(yOpen - yClose), 2);

                  return (
                    <g key={i}>
                      {/* High-Low Wick */}
                      <line
                        x1={x}
                        y1={yHigh}
                        x2={x}
                        y2={yLow}
                        stroke={candleColor}
                        strokeWidth={1.5}
                      />
                      {/* Candle Body */}
                      <rect
                        x={x - 5}
                        y={bodyTop}
                        width={10}
                        height={bodyHeight}
                        fill={candleColor}
                        rx={1}
                      />
                    </g>
                  );
                })
              ) : (
                <>
                  {/* Gradient area */}
                  <defs>
                    <linearGradient id="area-grad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#2962ff" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#2962ff" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  <polygon
                    points={`${candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ')} ${getX(
                      candles.length - 1
                    )},${paddingTop + chartHeight} ${getX(0)},${paddingTop + chartHeight}`}
                    fill="url(#area-grad)"
                  />
                  <polyline
                    fill="none"
                    stroke="#2962ff"
                    strokeWidth={2}
                    points={candles.map((c, i) => `${getX(i)},${getY(c.close)}`).join(' ')}
                  />
                </>
              )}

              {/* SMA 20 Overlay Line */}
              {showSma20 && (
                <polyline
                  fill="none"
                  stroke="#2962ff"
                  strokeWidth={1.75}
                  strokeDasharray="4 2"
                  points={sma20
                    .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                    .filter(Boolean)
                    .join(' ')}
                />
              )}

              {/* SMA 50 Overlay Line */}
              {showSma50 && (
                <polyline
                  fill="none"
                  stroke="#f59e0b"
                  strokeWidth={1.75}
                  points={sma50
                    .map((val, i) => (val !== null ? `${getX(i)},${getY(val)}` : null))
                    .filter(Boolean)
                    .join(' ')}
                />
              )}

              {/* Interactive Crosshair */}
              {hoverX !== null && hoveredCandle && (
                <g>
                  <line
                    x1={hoverX}
                    y1={paddingTop}
                    x2={hoverX}
                    y2={paddingTop + chartHeight}
                    stroke="#2962ff"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <line
                    x1={paddingLeft}
                    y1={getY(hoveredCandle.close)}
                    x2={svgWidth - paddingRight}
                    y2={getY(hoveredCandle.close)}
                    stroke="#2962ff"
                    strokeWidth={1}
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={hoverX}
                    cy={getY(hoveredCandle.close)}
                    r={4}
                    fill="#2962ff"
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                </g>
              )}
            </svg>
          </div>

          {/* Quick Simulated Paper Trade Action Bar */}
          <div className="bg-[#f8f9fd] dark:bg-[#1e222d] rounded-xl p-4 border border-[#e0e3eb] dark:border-[#2a2e39] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#2962ff]" />
                <span className="text-xs font-bold text-[#181b24] dark:text-[#f0f3fa]">
                  Paper Trading Simulator
                </span>
                <span className="text-[10px] text-[#089981] bg-[#089981]/10 px-2 py-0.5 rounded font-semibold">
                  Zero Risk Simulation
                </span>
              </div>
              <p className="text-xs text-[#5a5e6b] dark:text-[#848e9c] mt-0.5">
                Simulate instant market execution for portfolio backtesting
              </p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center bg-white dark:bg-[#131722] rounded-lg border border-[#e0e3eb] dark:border-[#2a2e39] px-2 py-1">
                <span className="text-[11px] text-[#737687] mr-2">Shares:</span>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={tradeShares}
                  onChange={(e) => setTradeShares(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-14 text-xs font-bold font-mono bg-transparent text-[#181b24] dark:text-[#f0f3fa] focus:outline-none"
                />
              </div>

              <button
                onClick={() => handleExecuteTrade('BUY')}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#089981] hover:bg-[#07806c] text-white shadow-xs transition-colors"
              >
                BUY @ ${stock.price.toFixed(2)}
              </button>
              <button
                onClick={() => handleExecuteTrade('SELL')}
                className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#f23645] hover:bg-[#d62837] text-white shadow-xs transition-colors"
              >
                SELL @ ${stock.price.toFixed(2)}
              </button>
            </div>
          </div>

          {tradeSuccessMsg && (
            <div className="p-3 bg-[#e6f5f2] dark:bg-[#089981]/20 border border-[#089981]/30 text-[#089981] text-xs font-semibold rounded-lg flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{tradeSuccessMsg}</span>
            </div>
          )}

          {/* Fundamentals & 52-Week Range */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Range Meters */}
            <div className="bg-[#faf9ff] dark:bg-[#131722] rounded-xl p-4 border border-[#e0e3eb] dark:border-[#2a2e39]">
              <h3 className="text-xs font-bold text-[#181b24] dark:text-[#f0f3fa] mb-3">
                Price Ranges & High/Low
              </h3>
              
              {/* 52-Week Range */}
              <div>
                <div className="flex justify-between text-[11px] font-mono">
                  <span className="text-[#737687]">52W Low: ${stock.low52.toFixed(2)}</span>
                  <span className="font-bold text-[#2962ff]">Current: ${stock.price.toFixed(2)}</span>
                  <span className="text-[#737687]">52W High: ${stock.high52.toFixed(2)}</span>
                </div>
                <div className="h-2 w-full bg-[#ebedfa] dark:bg-[#2a2e39] rounded-full mt-1.5 relative overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#2962ff] to-[#089981] rounded-full"
                    style={{
                      width: `${Math.max(
                        0,
                        Math.min(100, ((stock.price - stock.low52) / (stock.high52 - stock.low52)) * 100)
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Analyst Price Target */}
              <div className="mt-5 pt-4 border-t border-[#e0e3eb]/60 dark:border-[#2a2e39]/60">
                <div className="flex justify-between text-[11px]">
                  <span className="text-[#737687]">1-Yr Analyst Price Target:</span>
                  <span className="font-bold font-mono text-[#089981]">
                    ${stock.targetPrice.toFixed(2)} (+
                    {(((stock.targetPrice - stock.price) / stock.price) * 100).toFixed(1)}%)
                  </span>
                </div>

                {/* Analyst Breakdown Bar */}
                <div className="mt-2 flex h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#089981]"
                    style={{
                      width: `${(stock.analystBuyCount /
                        (stock.analystBuyCount + stock.analystHoldCount + stock.analystSellCount)) *
                        100}%`,
                    }}
                    title={`${stock.analystBuyCount} Buys`}
                  ></div>
                  <div
                    className="bg-[#f59e0b]"
                    style={{
                      width: `${(stock.analystHoldCount /
                        (stock.analystBuyCount + stock.analystHoldCount + stock.analystSellCount)) *
                        100}%`,
                    }}
                    title={`${stock.analystHoldCount} Holds`}
                  ></div>
                  <div
                    className="bg-[#f23645]"
                    style={{
                      width: `${(stock.analystSellCount /
                        (stock.analystBuyCount + stock.analystHoldCount + stock.analystSellCount)) *
                        100}%`,
                    }}
                    title={`${stock.analystSellCount} Sells`}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-[#737687] mt-1 font-mono">
                  <span>{stock.analystBuyCount} Buys</span>
                  <span>{stock.analystHoldCount} Holds</span>
                  <span>{stock.analystSellCount} Sells</span>
                </div>
              </div>
            </div>

            {/* Key Statistics Grid */}
            <div className="bg-[#faf9ff] dark:bg-[#131722] rounded-xl p-4 border border-[#e0e3eb] dark:border-[#2a2e39]">
              <h3 className="text-xs font-bold text-[#181b24] dark:text-[#f0f3fa] mb-3">
                Key Fundamentals
              </h3>
              <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">Market Cap:</span>
                  <span className="font-bold">
                    {stock.marketCap >= 1000
                      ? `$${(stock.marketCap / 1000).toFixed(2)}T`
                      : `$${stock.marketCap.toFixed(1)}B`}
                  </span>
                </div>
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">P/E (TTM):</span>
                  <span className="font-bold">{stock.peRatio.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">Forward P/E:</span>
                  <span className="font-bold">{stock.forwardPe.toFixed(1)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">EPS (TTM):</span>
                  <span className="font-bold">${stock.eps.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">Div. Yield:</span>
                  <span className="font-bold">{stock.dividendYield.toFixed(2)}%</span>
                </div>
                <div className="flex justify-between border-b border-[#e0e3eb]/50 dark:border-[#2a2e39]/50 pb-1.5">
                  <span className="text-[#737687] font-sans">Beta (1Y):</span>
                  <span className="font-bold">{stock.beta.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737687] font-sans">Volume:</span>
                  <span className="font-bold">{(stock.volume / 1000000).toFixed(2)}M</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#737687] font-sans">Avg Vol (30D):</span>
                  <span className="font-bold">{(stock.avgVolume / 1000000).toFixed(2)}M</span>
                </div>
              </div>
            </div>
          </div>

          {/* About Company */}
          <div className="bg-[#faf9ff] dark:bg-[#131722] rounded-xl p-4 border border-[#e0e3eb] dark:border-[#2a2e39]">
            <h3 className="text-xs font-bold text-[#181b24] dark:text-[#f0f3fa] mb-1.5">
              About {stock.name}
            </h3>
            <p className="text-xs text-[#5a5e6b] dark:text-[#9194a1] leading-relaxed">
              {stock.description}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
