'use client';

import { useAccount, useBalance, useReadContracts } from 'wagmi';
import { erc20Abi, formatUnits } from 'viem';
import { useMemo } from 'react';
import { TOKEN_LIST } from '../config/token-list';
import type { TokenBalance, TokenPrice, TokenWithData } from '../types';

// Query key factory
export const balanceKeys = {
  all: ['balances'] as const,
  list: (address: string) => [...balanceKeys.all, 'list', address] as const,
  detail: (address: string, tokenId: string) => [...balanceKeys.all, 'detail', address, tokenId] as const,
};

/**
 * Hook: 获取多个代币的余额
 */
export function useTokenBalances(prices?: Record<string, { price: number }>) {
  const { address, isConnected, chainId } = useAccount();

  // ETH 余额
  const { data: ethBalance } = useBalance({
    address,
    query: {
      enabled: isConnected && !!address,
      refetchInterval: 15000,
    },
  });

  // ERC20 代币合约调用配置
  const erc20Contracts = useMemo(() => {
    if (!address || !chainId) return [];
    
    // 根据当前链 ID 获取链名称
    const chainName = getChainNameById(chainId);
    
    return TOKEN_LIST
      .filter((token) => token.id !== 'eth') // 排除 ETH（单独查询）
      .filter((token) => token.addresses[chainName as keyof typeof token.addresses]) // 只查询当前链上有的代币
      .map((token) => {
        const tokenAddress = token.addresses[chainName as keyof typeof token.addresses];
        return {
          address: tokenAddress as `0x${string}`,
          abi: erc20Abi,
          functionName: 'balanceOf' as const,
          args: [address],
          chainId,
        };
      });
  }, [address, chainId]);

  // 批量查询 ERC20 余额
  const { data: erc20Balances, isLoading } = useReadContracts({
    contracts: erc20Contracts,
    query: {
      enabled: isConnected && !!address && erc20Contracts.length > 0,
      refetchInterval: 15000,
    },
  });

  // 格式化余额数据
  const balances = useMemo(() => {
    if (!isConnected || !address) return {};

    const result: Record<string, TokenBalance> = {};

    // ETH 余额
    if (ethBalance) {
      const formatted = formatUnits(ethBalance.value, 18);
      const balanceNum = Number(formatted);
      result['eth'] = {
        tokenId: 'eth',
        balance: ethBalance.value,
        formattedBalance: formatted,
        valueUsd: prices?.eth?.price ? balanceNum * prices.eth.price : 0,
      };
    }

    // ERC20 余额
    if (erc20Balances && erc20Contracts.length > 0) {
      erc20Balances.forEach((res, index) => {
        const contract = erc20Contracts[index];
        if (!contract) return;

        // 找到对应的代币配置
        const chainName = getChainNameById(chainId!);
        const token = TOKEN_LIST.find(
          (t) => t.addresses[chainName as keyof typeof t.addresses]?.toLowerCase() === contract.address.toLowerCase()
        );

        if (token && res.status === 'success' && res.result !== undefined) {
          const balance = res.result as bigint;
          const formatted = formatUnits(balance, token.decimals);
          const balanceNum = Number(formatted);

          result[token.id] = {
            tokenId: token.id,
            balance,
            formattedBalance: formatted,
            valueUsd: prices?.[token.id]?.price ? balanceNum * prices[token.id].price : 0,
          };
        }
      });
    }

    return result;
  }, [isConnected, address, ethBalance, erc20Balances, erc20Contracts, prices, chainId]);

  return {
    balances,
    isLoading,
    isConnected,
    address,
    chainId,
  };
}

/**
 * 根据链 ID 获取链名称
 */
function getChainNameById(chainId: number): string {
  const chainMap: Record<number, string> = {
    1: 'ethereum',
    42161: 'arbitrum',
    10: 'optimism',
    8453: 'base',
    324: 'zksync',
    534352: 'scroll',
    59144: 'linea',
    1101: 'polygon_zkevm',
  };
  return chainMap[chainId] || 'ethereum';
}

/**
 * Hook: 合并代币配置、价格和余额
 */
export function useTokensWithData(
  prices?: Record<string, TokenPrice>,
  balances?: Record<string, TokenBalance>
): TokenWithData[] {
  return useMemo(() => {
    return TOKEN_LIST.map((token) => ({
      ...token,
      price: prices?.[token.id],
      balance: balances?.[token.id],
    }));
  }, [prices, balances]);
}

/**
 * Hook: 计算总资产价值
 */
export function useTotalPortfolioValue(balances?: Record<string, TokenBalance>) {
  return useMemo(() => {
    if (!balances) return 0;
    return Object.values(balances).reduce((sum, b) => sum + b.valueUsd, 0);
  }, [balances]);
}
