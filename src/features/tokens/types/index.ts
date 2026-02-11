import type { TokenConfig } from '../config/token-list';

/**
 * 代币价格数据
 */
export interface TokenPrice {
  id: string;
  price: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  lastUpdated: number;
}

/**
 * 代币余额数据
 */
export interface TokenBalance {
  tokenId: string;
  balance: bigint;
  formattedBalance: string;
  valueUsd: number;
}

/**
 * 带价格和余额的完整代币数据
 */
export interface TokenWithData extends TokenConfig {
  price?: TokenPrice;
  balance?: TokenBalance;
}

/**
 * 排序模式
 */
export type SortMode = 'marketCap' | 'userValue';

/**
 * Binance WebSocket 24h Ticker 数据
 */
export interface BinanceTickerData {
  e: '24hrTicker'; // Event type
  E: number; // Event time
  s: string; // Symbol
  p: string; // Price change
  P: string; // Price change percent
  w: string; // Weighted average price
  x: string; // First trade price
  c: string; // Last price
  Q: string; // Last quantity
  b: string; // Best bid price
  B: string; // Best bid qty
  a: string; // Best ask price
  A: string; // Best ask qty
  o: string; // Open price
  h: string; // High price
  l: string; // Low price
  v: string; // Total traded base asset volume
  q: string; // Total traded quote asset volume
  O: number; // Statistics open time
  C: number; // Statistics close time
  F: number; // First trade ID
  L: number; // Last trade Id
  n: number; // Total number of trades
}

/**
 * CoinGecko 市场数据响应
 */
export interface CoinGeckoMarketData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  total_volume: number;
  last_updated: string;
}
