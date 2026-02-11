'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useCallback } from 'react';
import { TOKENS_BY_MARKET_CAP } from '../config/token-list';
import type { TokenPrice } from '../types';

// Query key factory
export const priceKeys = {
  all: ['prices'] as const,
  list: () => [...priceKeys.all, 'list'] as const,
  detail: (id: string) => [...priceKeys.all, 'detail', id] as const,
};

/**
 * 从服务端获取初始价格数据
 */
async function fetchServerPrices(): Promise<Record<string, TokenPrice>> {
  const response = await fetch('/api/prices', {
    next: { revalidate: 0 }, // 禁用缓存，获取最新数据
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch prices from server');
  }
  
  const result = await response.json();
  return result.prices || {};
}

/**
 * Hook: 获取代币价格（服务端 SSE 实时更新）
 */
export function useTokenPrices() {
  const queryClient = useQueryClient();

  // 初始数据获取
  const query = useQuery({
    queryKey: priceKeys.list(),
    queryFn: fetchServerPrices,
    staleTime: Infinity, // 数据由 SSE 实时更新，不需要自动刷新
    gcTime: 1000 * 60 * 30, // 30 分钟
    refetchOnWindowFocus: false,
  });

  // SSE 连接（服务端推送实时更新）
  useEffect(() => {
    let eventSource: EventSource | null = null;
    let reconnectTimeout: NodeJS.Timeout | null = null;

    const connect = () => {
      try {
        // 连接服务端 SSE 端点
        eventSource = new EventSource('/api/prices');

        eventSource.onopen = () => {
          console.log('[SSE] Connected to price stream');
        };

        eventSource.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            
            if (message.type === 'prices') {
              // 更新 TanStack Query 缓存
              queryClient.setQueryData(
                priceKeys.list(),
                message.data
              );
            }
          } catch (error) {
            // 忽略心跳消息（:heartbeat）
            if (!event.data.includes('heartbeat')) {
              console.error('[SSE] Parse error:', error);
            }
          }
        };

        eventSource.onerror = (error) => {
          console.error('[SSE] Error:', error);
          eventSource?.close();
          
          // 5 秒后重连
          reconnectTimeout = setTimeout(connect, 5000);
        };
      } catch (error) {
        console.error('[SSE] Connection error:', error);
        reconnectTimeout = setTimeout(connect, 5000);
      }
    };

    connect();

    return () => {
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
      eventSource?.close();
    };
  }, [queryClient]);

  return query;
}

/**
 * Hook: 获取单个代币价格
 */
export function useTokenPrice(tokenId: string) {
  const { data: prices } = useTokenPrices();
  return prices?.[tokenId];
}

/**
 * Hook: 获取所有带价格的代币
 */
export function useTokensWithPrices() {
  const { data: prices, ...rest } = useTokenPrices();
  
  const tokensWithPrices = TOKENS_BY_MARKET_CAP.map((token) => ({
    ...token,
    price: prices?.[token.id],
  }));
  
  return {
    tokens: tokensWithPrices,
    ...rest,
  };
}

/**
 * Hook: 手动刷新价格
 */
export function useRefreshPrices() {
  const queryClient = useQueryClient();
  
  return useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: priceKeys.list() });
  }, [queryClient]);
}
