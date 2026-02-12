/**
 * TokenList 组件 - Aave 质押版
 * 
 * 列：名称 | 价格 | 涨跌 | 持仓 | 日收益 | 操作
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import type { TokenWithData } from '../types';

interface TokenListProps {
  tokens: TokenWithData[];
  sortMode: 'marketCap' | 'userValue';
  isLoading?: boolean;
}

// 格式化价格
function formatPrice(price: number): string {
  if (price === 0) return '-';
  if (price >= 1000) {
    return price.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  if (price >= 1) {
    return price.toFixed(2);
  }
  if (price >= 0.01) {
    return price.toFixed(4);
  }
  return price.toFixed(6);
}

// 格式化持仓（简化显示）
function formatBalance(value: string, decimals: number): string {
  const num = parseFloat(value);
  if (num === 0) return '0';
  if (num < 0.001) return '<0.001';
  if (num < 1) return num.toFixed(4);
  if (num < 1000) return num.toFixed(2);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// TokenIcon 组件
function TokenIcon({ logoIcon, symbol }: { logoIcon: string; symbol: string }) {
  const [error, setError] = useState(false);
  
  const handleError = () => {
    requestAnimationFrame(() => {
      setError(true);
    });
  };
  
  if (error) {
    return (
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-sm font-bold text-gray-500">
        {symbol.charAt(0)}
      </div>
    );
  }
  
  return (
    <img
      src={`/tokens/${logoIcon}.svg`}
      alt={`${symbol} logo`}
      width={32}
      height={32}
      className="w-8 h-8 rounded-full object-contain flex-shrink-0"
      onError={handleError}
    />
  );
}

// 单个代币行
function TokenRow({ 
  token, 
  isConnected 
}: { 
  token: TokenWithData; 
  isConnected: boolean;
}) {
  const price = token.price;
  const balance = token.balance;
  const changePercent = price?.priceChangePercentage24h || 0;
  const isPositive = changePercent >= 0;
  
  // 计算日收益（占位，后续接入 Aave）
  // 日收益 = 持仓价值 × APY / 365
  const dailyYield = balance && price 
    ? (balance.valueUsd * 0.038 / 365) // 假设 3.8% APY
    : 0;
  
  return (
    <motion.div
      layout
      layoutId={token.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_100px] gap-4 items-center h-16 hover:bg-gray-50/50 cursor-pointer transition-colors"
      style={{ willChange: 'transform' }}
    >
      {/* 第1列 - 名称（左对齐，2fr）*/}
      <div className="flex items-center gap-3">
        <TokenIcon logoIcon={token.logoIcon} symbol={token.symbol} />
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-gray-900">{token.symbol}</span>
          <span className="text-xs text-gray-500 truncate">{token.name}</span>
        </div>
      </div>
      
      {/* 第2列 - 价格（右对齐，1.5fr）*/}
      <div className="text-right font-mono text-base font-medium text-gray-900">
        {price ? formatPrice(price.price) : '-'}
      </div>
      
      {/* 第3列 - 涨跌（右对齐，1fr）*/}
      <div className={`text-right font-mono text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>
      
      {/* 第4列 - 持仓（右对齐，1.5fr）*/}
      <div className="text-right">
        {isConnected && balance ? (
          <div className="flex flex-col items-end">
            <span className="font-mono text-sm font-medium text-gray-900">
              {formatBalance(balance.formattedBalance, token.decimals)} {token.symbol}
            </span>
            <span className="font-mono text-xs text-gray-500">
              ${formatPrice(balance.valueUsd)}
            </span>
          </div>
        ) : (
          <span className="font-mono text-sm text-gray-400">-</span>
        )}
      </div>
      
      {/* 第5列 - 日收益（右对齐，1.5fr）*/}
      <div className="text-right">
        {isConnected && balance && balance.valueUsd > 0 ? (
          <div className="flex flex-col items-end">
            <span className="font-mono text-sm font-medium text-emerald-600">
              +${dailyYield.toFixed(4)}/天
            </span>
            <span className="text-[10px] text-gray-400" title="APY: 3.8%">
              APY 3.8%
            </span>
          </div>
        ) : (
          <span className="font-mono text-sm text-gray-400">-</span>
        )}
      </div>
      
      {/* 第6列 - 操作（右对齐，100px）*/}
      <div className="flex justify-end">
        {isConnected ? (
          <button className="px-3 py-1.5 text-xs font-medium text-white bg-orange-500 hover:bg-orange-600 rounded transition-colors">
            质押
          </button>
        ) : (
          <span className="text-xs text-gray-400">-</span>
        )}
      </div>
    </motion.div>
  );
}

// 骨架屏
function TokenRowSkeleton() {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_100px] gap-4 items-center h-16">
      {/* 名称 */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gray-100 animate-pulse" />
        <div className="flex flex-col gap-1">
          <div className="h-4 w-12 bg-gray-100 rounded animate-pulse" />
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
      {/* 价格 */}
      <div className="text-right">
        <div className="h-5 w-20 bg-gray-200 rounded animate-pulse ml-auto" />
      </div>
      {/* 涨跌 */}
      <div className="text-right">
        <div className="h-4 w-16 bg-gray-100 rounded animate-pulse ml-auto" />
      </div>
      {/* 持仓 */}
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
      </div>
      {/* 日收益 */}
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
      </div>
      {/* 操作 */}
      <div className="flex justify-end">
        <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

// 表头
function TableHeader({ isConnected }: { isConnected: boolean }) {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_100px] gap-4 items-center h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">
      {/* 第1列 - 名称（左对齐）*/}
      <div className="text-left cursor-pointer hover:text-gray-700 flex items-center gap-1">
        名称
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第2列 - 价格（右对齐）*/}
      <div className="text-right cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1">
        价格
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第3列 - 涨跌（右对齐）*/}
      <div className="text-right cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1">
        涨跌
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第4列 - 持仓（右对齐）*/}
      <div className="text-right">
        持仓
      </div>
      {/* 第5列 - 日收益（右对齐）*/}
      <div className="text-right">
        日收益
      </div>
      {/* 第6列 - 操作（右对齐）*/}
      <div className="text-right">
        {isConnected ? '操作' : ''}
      </div>
    </div>
  );
}

export function TokenList({ tokens, sortMode, isLoading = false }: TokenListProps) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  if (isLoading || !mounted) {
    return (
      <div className="w-full bg-white">
        <TableHeader isConnected={isConnected} />
        {Array.from({ length: 8 }).map((_, i) => (
          <TokenRowSkeleton key={i} />
        ))}
      </div>
    );
  }
  
  if (tokens.length === 0) {
    return (
      <div className="w-full text-center py-16 text-gray-400">
        暂无代币数据
      </div>
    );
  }
  
  return (
    <div className="w-full bg-white">
      <TableHeader isConnected={isConnected} />
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            isConnected={isConnected}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
