/**
 * 排序后的代币列表 Hook
 * 
 * 根据排序模式（市值/持仓价值）返回排序后的代币列表
 * 使用 useMemo 缓存排序结果
 */

import { useMemo, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { TOKEN_LIST } from '@/features/tokens/config/token-list';
import type { TokenPrice, TokenBalance, TokenWithData } from '@/features/tokens/types';
import { useDashboardStore, type SortMode } from './use-dashboard-store';

interface UseSortedTokensOptions {
  prices?: Record<string, TokenPrice>;
  balances?: Record<string, TokenBalance>;
  forceSortMode?: SortMode;
}

/**
 * 排序代币列表
 */
function sortTokens(
  tokens: TokenWithData[],
  sortMode: SortMode,
  isConnected: boolean
): TokenWithData[] {
  return [...tokens].sort((a, b) => {
    if (!isConnected || sortMode === 'marketCap') {
      // 按市值排名升序（排名数字小的在前）
      return a.marketCapRank - b.marketCapRank;
    }
    
    // 按用户持仓价值降序
    const valueA = a.balance?.valueUsd || 0;
    const valueB = b.balance?.valueUsd || 0;
    
    if (valueA !== valueB) {
      return valueB - valueA;
    }
    
    // 价值相同则按市值
    return a.marketCapRank - b.marketCapRank;
  });
}

/**
 * Hook: 获取排序后的代币列表
 */
export function useSortedTokens(options: UseSortedTokensOptions) {
  const { prices, balances, forceSortMode } = options;
  const { isConnected } = useAccount();
  const { sortMode: storeSortMode, autoSwitchSort, setSortMode } = useDashboardStore();
  
  // 实际使用的排序模式
  const effectiveSortMode = forceSortMode || storeSortMode;
  
  // 连接钱包后自动切换到按价值排序（如果开启）
  useEffect(() => {
    if (isConnected && autoSwitchSort && storeSortMode === 'marketCap') {
      // 检查是否有持仓
      const hasBalance = Object.values(balances || {}).some(
        (b) => b.valueUsd > 0.01
      );
      
      if (hasBalance) {
        setSortMode('userValue');
      }
    }
  }, [isConnected, autoSwitchSort, storeSortMode, balances, setSortMode]);
  
  // 合并代币数据
  const tokensWithData: TokenWithData[] = useMemo(() => {
    return TOKEN_LIST.map((token) => ({
      ...token,
      price: prices?.[token.id],
      balance: balances?.[token.id],
    }));
  }, [prices, balances]);
  
  // 排序后的列表
  const sortedTokens = useMemo(() => {
    return sortTokens(tokensWithData, effectiveSortMode, isConnected);
  }, [tokensWithData, effectiveSortMode, isConnected]);
  
  // 排名映射（用于动画）
  const rankMap = useMemo(() => {
    const map: Record<string, number> = {};
    sortedTokens.forEach((token, index) => {
      map[token.id] = index;
    });
    return map;
  }, [sortedTokens]);
  
  // 总资产价值
  const totalValue = useMemo(() => {
    if (!balances) return 0;
    return Object.values(balances).reduce((sum, b) => sum + b.valueUsd, 0);
  }, [balances]);
  
  // 切换排序模式
  const toggleSortMode = () => {
    setSortMode(effectiveSortMode === 'marketCap' ? 'userValue' : 'marketCap');
  };
  
  return {
    tokens: sortedTokens,
    rankMap,
    sortMode: effectiveSortMode,
    totalValue,
    isConnected,
    toggleSortMode,
  };
}
