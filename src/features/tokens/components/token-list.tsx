/**
 * TokenList 组件 - 币安风格严格对齐
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

// 格式化大数字（币安风格：$41.92B）
function formatCompactNumber(num: number): string {
  if (num === 0) return '-';
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// TokenIcon 组件
function TokenIcon({ logoIcon, symbol }: { logoIcon: string; symbol: string }) {
  const [error, setError] = useState(false);
  
  // 使用 ref 来避免重复设置状态
  const handleError = () => {
    // 使用 requestAnimationFrame 延迟状态更新，避免同步调用
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

// 图表图标
function ChartIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M7 16l4-4 4 4 6-6" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// 铃铛图标
function BellIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 17v1a3 3 0 0 0 6 0v-1" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M18 8A6 6 0 1 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

// 单个代币行
function TokenRow({ token, showBalance }: { token: TokenWithData; showBalance: boolean }) {
  const price = token.price;
  const balance = token.balance;
  const changePercent = price?.priceChangePercentage24h || 0;
  const isPositive = changePercent >= 0;
  
  return (
    <motion.div
      layout
      layoutId={token.id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="group grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_80px] gap-4 items-center h-16 hover:bg-gray-50/50 cursor-pointer transition-colors"
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
      
      {/* 第3列 - 24h涨跌（右对齐，1fr）*/}
      <div className={`text-right font-mono text-sm font-medium ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
        {isPositive ? '+' : ''}{changePercent.toFixed(2)}%
      </div>
      
      {/* 第4列 - 成交量（右对齐，1.5fr）*/}
      <div className="text-right font-mono text-sm text-gray-600">
        {price ? formatCompactNumber(price.volume24h) : '-'}
      </div>
      
      {/* 第5列 - 市值（右对齐，1.5fr）*/}
      <div className="text-right font-mono text-sm text-gray-600">
        {showBalance && balance ? (
          formatCompactNumber(balance.valueUsd)
        ) : (
          formatCompactNumber(price?.marketCap || 0)
        )}
      </div>
      
      {/* 第6列 - 操作（右对齐，80px）*/}
      <div className="flex justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChartIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
        <BellIcon className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-pointer" />
      </div>
    </motion.div>
  );
}

// 骨架屏
function TokenRowSkeleton() {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_80px] gap-4 items-center h-16">
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
      {/* 成交量 */}
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
      </div>
      {/* 市值 */}
      <div className="text-right">
        <div className="h-4 w-20 bg-gray-100 rounded animate-pulse ml-auto" />
      </div>
      {/* 操作 */}
      <div className="flex justify-end gap-3">
        <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
        <div className="w-4 h-4 bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}

// 表头
function TableHeader({ sortMode }: { sortMode: 'marketCap' | 'userValue' }) {
  return (
    <div className="grid grid-cols-[2fr_1.5fr_1fr_1.5fr_1.5fr_80px] gap-4 items-center h-10 text-xs font-medium text-gray-500 uppercase tracking-wider">
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
      {/* 第3列 - 24h涨跌（右对齐）*/}
      <div className="text-right cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1">
        24h涨跌
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第4列 - 成交量（右对齐）*/}
      <div className="text-right cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1">
        成交量
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第5列 - 市值（右对齐）*/}
      <div className="text-right cursor-pointer hover:text-gray-700 flex items-center justify-end gap-1">
        {sortMode === 'userValue' ? '持仓价值' : '市值'}
        <span className="text-[10px]">▼</span>
      </div>
      {/* 第6列 - 操作（右对齐）*/}
      <div className="text-right">操作</div>
    </div>
  );
}

export function TokenList({ tokens, sortMode, isLoading = false }: TokenListProps) {
  const { isConnected } = useAccount();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    // 使用 requestAnimationFrame 延迟状态更新，避免同步调用
    const timer = requestAnimationFrame(() => {
      setMounted(true);
    });
    return () => cancelAnimationFrame(timer);
  }, []);
  
  const showBalance = isConnected && sortMode === 'userValue';
  
  if (isLoading || !mounted) {
    return (
      <div className="w-full bg-white">
        <TableHeader sortMode={sortMode} />
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
      <TableHeader sortMode={sortMode} />
      <AnimatePresence mode="popLayout" initial={false}>
        {tokens.map((token) => (
          <TokenRow
            key={token.id}
            token={token}
            showBalance={showBalance}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
