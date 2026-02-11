/**
 * TokenCard 组件
 * 
 * 币安风格的代币卡片，显示价格、涨跌、市值/持仓
 */

import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TokenIcon } from './token-icon';
import type { TokenWithData } from '../types';

interface TokenCardProps {
  token: TokenWithData;
  rank: number;
  showBalance?: boolean;
  layoutId?: string;
}

// 格式化价格
function formatPrice(price: number): string {
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

// 格式化市值/成交量
function formatCompactNumber(num: number): string {
  if (num >= 1e12) return `$${(num / 1e12).toFixed(2)}T`;
  if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
  if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
  if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
  return `$${num.toFixed(2)}`;
}

// 格式化余额
function formatBalance(value: string, decimals: number): string {
  const num = parseFloat(value);
  if (num === 0) return '0';
  if (num < 0.001) return '<0.001';
  if (num < 1) return num.toFixed(decimals > 6 ? 6 : decimals);
  if (num < 1000) return num.toFixed(4);
  return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

// 排名徽章颜色
function getRankBadgeColor(rank: number): string {
  if (rank === 0) return 'bg-yellow-500 text-white'; // #1 金色
  if (rank === 1) return 'bg-gray-400 text-white';   // #2 银色
  if (rank === 2) return 'bg-amber-600 text-white';  // #3 铜色
  return 'bg-slate-200 text-slate-600';              // 其他
}

export function TokenCard({ token, rank, showBalance = false, layoutId }: TokenCardProps) {
  const price = token.price;
  const balance = token.balance;
  const changePercent = price?.priceChangePercentage24h || 0;
  const isPositive = changePercent >= 0;
  
  return (
    <motion.div
      layout
      layoutId={layoutId || token.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 350,
          damping: 25,
          mass: 0.8,
        },
        opacity: { duration: 0.2 },
      }}
    >
      <Card className="p-4 hover:shadow-md transition-shadow border-slate-200">
        <div className="flex items-center gap-4">
          {/* 排名 */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${getRankBadgeColor(rank)}`}
          >
            {rank + 1}
          </div>
          
          {/* 图标 */}
          <TokenIcon logoIcon={token.logoIcon} symbol={token.symbol} size={40} />
          
          {/* 名称和符号 */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-slate-900 truncate">
                {token.displaySymbol}
              </span>
            </div>
            <div className="text-sm text-slate-500">
              {token.category === 'stable' && '稳定币'}
              {token.category === 'l2' && 'L2'}
              {token.category === 'defi' && 'DeFi'}
              {token.category === 'meme' && 'Meme'}
              {token.category === 'l1' && 'L1'}
            </div>
          </div>
          
          {/* 价格 */}
          <div className="text-right min-w-[100px]">
            <div className="font-semibold text-slate-900">
              ${price ? formatPrice(price.price) : '-'}
            </div>
            <div
              className={`text-sm font-medium ${
                isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {isPositive ? '+' : ''}
              {changePercent.toFixed(2)}%
            </div>
          </div>
          
          {/* 市值 / 持仓价值 */}
          <div className="text-right min-w-[120px] hidden sm:block">
            {showBalance && balance ? (
              <>
                <div className="font-semibold text-slate-900">
                  ${formatCompactNumber(balance.valueUsd)}
                </div>
                <div className="text-sm text-slate-500">
                  {formatBalance(balance.formattedBalance, token.decimals)} {token.symbol}
                </div>
              </>
            ) : (
              <>
                <div className="font-semibold text-slate-900">
                  {price ? formatCompactNumber(price.marketCap) : '-'}
                </div>
                <div className="text-sm text-slate-500">
                  Vol: {price ? formatCompactNumber(price.volume24h) : '-'}
                </div>
              </>
            )}
          </div>
          
          {/* 移动端持仓显示 */}
          {showBalance && balance && (
            <div className="text-right min-w-[80px] sm:hidden">
              <div className="font-semibold text-slate-900">
                ${formatCompactNumber(balance.valueUsd)}
              </div>
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// 骨架屏
export function TokenCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-4">
        <div className="w-8 h-8 rounded-full bg-slate-200 animate-pulse" />
        <div className="w-10 h-10 rounded-full bg-slate-200 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
        <div className="space-y-2 text-right">
          <div className="h-4 w-20 bg-slate-200 rounded animate-pulse" />
          <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />
        </div>
      </div>
    </Card>
  );
}
