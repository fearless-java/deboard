/**
 * Dashboard 主组件 - 极简风格
 */

'use client';

import { useTokenPrices } from '@/features/tokens/hooks/use-token-prices';
import { useTokenBalances } from '@/features/tokens/hooks/use-token-balances';
import { TokenList } from '@/features/tokens/components/token-list';
import { DashboardHeader } from './dashboard-header';
import { useSortedTokens } from '../hooks/use-sorted-tokens';
import { useDashboardHydrated } from '../hooks/use-dashboard-store';

export function Dashboard() {
  const hydrated = useDashboardHydrated();
  const { data: prices, isLoading: isPricesLoading } = useTokenPrices();
  const { balances, isLoading: isBalancesLoading } = useTokenBalances(prices);
  
  const {
    tokens: sortedTokens,
    sortMode,
    totalValue,
    toggleSortMode,
  } = useSortedTokens({
    prices,
    balances,
  });
  
  if (!hydrated) {
    return (
      <div className="max-w-5xl mx-auto p-4 animate-pulse">
        <div className="h-8 w-32 bg-gray-100 rounded mb-2" />
        <div className="h-4 w-48 bg-gray-100 rounded mb-8" />
        <div className="space-y-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-50 rounded" />
          ))}
        </div>
      </div>
    );
  }
  
  const isLoading = isPricesLoading && !prices;
  
  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-6 pb-20">
        <DashboardHeader
          totalValue={totalValue}
          sortMode={sortMode}
          onToggleSort={toggleSortMode}
        />
        
        <TokenList
          tokens={sortedTokens}
          sortMode={sortMode}
          isLoading={isLoading}
        />
        
        <div className="mt-12 text-center text-xs text-gray-300">
          <p>价格数据来自 Binance，实时更新</p>
        </div>
      </div>
    </div>
  );
}
