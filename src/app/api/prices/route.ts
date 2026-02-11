/**
 * 价格数据 API Route
 * 
 * 服务端维护 Binance WebSocket 连接，通过 SSE 推送实时数据到客户端
 * 避免客户端直连导致的限流问题
 */

import { NextRequest } from 'next/server';
import { TOKEN_LIST } from '@/features/tokens/config/token-list';
import type { TokenPrice, BinanceTickerData } from '@/features/tokens/types';

// 从 Binance symbol 映射到 token ID
const BINANCE_SYMBOL_TO_ID: Record<string, string> = {
  'ETHUSDT': 'eth',
  'WBTCUSDT': 'wbtc',
  'BTCUSDT': 'wbtc',  // 备用
  'USDCUSDT': 'usdc',
  'LINKUSDT': 'link',
  'UNIUSDT': 'uni',
  'AAVEUSDT': 'aave',
  'LDOUSDT': 'ldo',
  'POLUSDT': 'pol',
  'ARBUSDT': 'arb',
  'OPUSDT': 'op',
  'STRKUSDT': 'strk',
  'CRVUSDT': 'crv',
  'SHIBUSDT': 'shib',
  'PEPEUSDT': 'pepe',
  'NEARUSDT': 'near',
  'IMXUSDT': 'imx',
  'SOLUSDT': 'sol',
};

// 稳定币列表（价格固定或接近 $1）
const STABLE_COINS: Record<string, { price: number; change24h: number }> = {};

// 全局价格缓存（服务端内存）
let priceCache: Record<string, TokenPrice> = {};
let lastUpdate = Date.now();

// 初始化缓存
function initCache() {
  for (const token of TOKEN_LIST) {
    priceCache[token.id] = {
      id: token.id,
      price: 0,
      priceChange24h: 0,
      priceChangePercentage24h: 0,
      marketCap: 0,
      volume24h: 0,
      lastUpdated: Date.now(),
    };
  }
  
  // 初始化稳定币价格
  for (const [id, data] of Object.entries(STABLE_COINS)) {
    if (priceCache[id]) {
      priceCache[id] = {
        ...priceCache[id],
        price: data.price,
        priceChange24h: 0,
        priceChangePercentage24h: data.change24h,
        lastUpdated: Date.now(),
      };
    }
  }
}

initCache();

// WebSocket 连接（单例）
let binanceWs: WebSocket | null = null;
let wsReconnectTimeout: NodeJS.Timeout | null = null;

// 连接的客户端列表
const clients = new Set<ReadableStreamDefaultController>();

// 连接 Binance WebSocket
function connectBinanceWS() {
  if (binanceWs?.readyState === WebSocket.OPEN) return;

  try {
    binanceWs = new WebSocket('wss://stream.binance.com:9443/ws/!ticker@arr');

    binanceWs.onopen = () => {
      console.log('[Server Binance WS] Connected');
    };

    binanceWs.onmessage = (event) => {
      try {
        const tickers: BinanceTickerData[] = JSON.parse(event.data);
        let hasUpdate = false;

        for (const ticker of tickers) {
          const tokenId = BINANCE_SYMBOL_TO_ID[ticker.s];
          if (tokenId && priceCache[tokenId]) {
            const newPrice = parseFloat(ticker.c);
            const oldPrice = priceCache[tokenId].price;

            // 只有价格变化时才更新
            if (Math.abs(oldPrice - newPrice) > 0.000001 || oldPrice === 0) {
              priceCache[tokenId] = {
                ...priceCache[tokenId],
                price: newPrice,
                priceChange24h: parseFloat(ticker.p),
                priceChangePercentage24h: parseFloat(ticker.P),
                volume24h: parseFloat(ticker.v) * newPrice,
                lastUpdated: Date.now(),
              };
              hasUpdate = true;
            }
          }
          

        }

        // 有更新时推送给所有客户端
        if (hasUpdate) {
          lastUpdate = Date.now();
          broadcastToClients();
        }
      } catch (error) {
        console.error('[Server Binance WS] Parse error:', error);
      }
    };

    binanceWs.onerror = (error) => {
      console.error('[Server Binance WS] Error:', error);
    };

    binanceWs.onclose = () => {
      console.log('[Server Binance WS] Disconnected, reconnecting in 5s...');
      wsReconnectTimeout = setTimeout(connectBinanceWS, 5000);
    };
  } catch (error) {
    console.error('[Server Binance WS] Connection error:', error);
    wsReconnectTimeout = setTimeout(connectBinanceWS, 5000);
  }
}

// 广播给所有连接的客户端
function broadcastToClients() {
  const data = JSON.stringify({
    type: 'prices',
    data: priceCache,
    timestamp: lastUpdate,
  });

  for (const client of clients) {
    try {
      client.enqueue(`data: ${data}\n\n`);
    } catch (error) {
      // 客户端断开，从列表中移除
      clients.delete(client);
    }
  }
}

// 启动 WebSocket 连接（模块加载时）
connectBinanceWS();

/**
 * GET: SSE 端点，客户端连接获取实时价格
 */
export async function GET(request: NextRequest) {
  // 检查是否是 SSE 请求
  const accept = request.headers.get('accept');
  const isSSE = accept?.includes('text/event-stream');

  if (!isSSE) {
    // 普通 GET 请求，返回当前缓存的价格
    return Response.json({
      prices: priceCache,
      timestamp: lastUpdate,
    });
  }

  // SSE 连接
  const stream = new ReadableStream({
    start(controller) {
      // 添加客户端到列表
      clients.add(controller);

      // 发送初始数据
      const initialData = JSON.stringify({
        type: 'prices',
        data: priceCache,
        timestamp: lastUpdate,
      });
      controller.enqueue(`data: ${initialData}\n\n`);

      // 发送心跳保持连接
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(':heartbeat\n\n');
        } catch {
          clearInterval(heartbeat);
          clients.delete(controller);
        }
      }, 30000);

      // 清理函数
      request.signal.addEventListener('abort', () => {
        clearInterval(heartbeat);
        clients.delete(controller);
      });
    },
    cancel() {
      // 客户端断开连接
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

// 导出缓存供其他服务端代码使用
export { priceCache };
