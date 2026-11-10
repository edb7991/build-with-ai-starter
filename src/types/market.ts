export interface CandleData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type TechnicalRating = 'Strong Buy' | 'Buy' | 'Neutral' | 'Sell' | 'Strong Sell';

export interface StockItem {
  symbol: string;
  name: string;
  exchange: 'NASDAQ' | 'NYSE';
  sector: string;
  industry: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  avgVolume: number;
  marketCap: number; // in billions
  peRatio: number;
  forwardPe: number;
  eps: number;
  dividendYield: number;
  high52: number;
  low52: number;
  beta: number;
  rating: TechnicalRating;
  targetPrice: number;
  analystBuyCount: number;
  analystHoldCount: number;
  analystSellCount: number;
  description: string;
  sparkline: number[];
  candles: CandleData[];
  logoBg: string;
  logoColor: string;
}

export interface MarketIndex {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  dayLow: number;
  dayHigh: number;
  yearLow: number;
  yearHigh: number;
  sparkline: number[];
  timeframes: {
    [key: string]: number[];
  };
}

export interface SectorMetric {
  name: string;
  change1D: number;
  change1W: number;
  change1M: number;
  changeYTD: number;
  topStock: string;
  topStockChange: number;
  weight: number; // % of S&P 500
}

export interface EarningsEvent {
  symbol: string;
  company: string;
  date: string;
  time: 'BMO' | 'AMC'; // Before Market Open, After Market Close
  epsEstimate: number;
  epsActual?: number;
  surprisePercent?: number;
  revenueEstimate: string;
  revenueActual?: string;
}
