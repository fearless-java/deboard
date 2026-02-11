'use client';

import { cn } from '@/lib/utils';

interface TokenIconProps {
  /** 图标文件名（来自 web3icons 映射） */
  logoIcon: string;
  /** 显示用符号 */
  symbol: string;
  size?: number;
  className?: string;
}

export function TokenIcon({ logoIcon, symbol, size = 40, className }: TokenIconProps) {
  return (
    <img
      src={`/tokens/${logoIcon}.svg`}
      alt={`${symbol} logo`}
      width={size}
      height={size}
      className={cn(
        'flex-shrink-0 object-contain',
        className
      )}
      onError={(e) => {
        // 加载失败时显示首字母
        const target = e.target as HTMLImageElement;
        target.style.display = 'none';
        const parent = target.parentElement;
        if (parent) {
          parent.innerHTML = `<div class="w-full h-full rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center font-bold text-gray-500" style="font-size:${Math.max(12, size/3)}px">${symbol.charAt(0)}</div>`;
        }
      }}
    />
  );
}

/**
 * 代币图标占位符（加载中）
 */
export function TokenIconSkeleton({ size = 40 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gray-200 animate-pulse flex-shrink-0"
      style={{ width: size, height: size }}
    />
  );
}
