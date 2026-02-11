/**
 * DashboardHeader 组件 - 极简风格
 */

'use client';

import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { ArrowUpDown, Wallet } from 'lucide-react';
import { ConnectButton } from '@/features/wallet/components/connect-button';
import { useDashboardStore } from '../hooks/use-dashboard-store';

interface DashboardHeaderProps {
  totalValue: number;
  sortMode: 'marketCap' | 'userValue';
  onToggleSort: () => void;
}

function formatCurrency(value: number): string {
  if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
  return `$${value.toFixed(2)}`;
}

export function DashboardHeader({
  totalValue,
  sortMode,
  onToggleSort,
}: DashboardHeaderProps) {
  const { isConnected } = useAccount();
  const { autoSwitchSort, toggleAutoSwitchSort } = useDashboardStore();
  
  return (
    <div className="mb-8">
      {/* 顶部栏 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-[#1a1a1a]">DeBoard</h1>
          <p className="text-sm text-gray-400 mt-0.5">以太坊生态代币看板</p>
        </div>
        <ConnectButton />
      </div>
      
      {/* 统计栏 - 无卡片边框 */}
      <div className="flex flex-wrap items-center gap-6">
        {/* 总资产 */}
        {isConnected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="p-2 bg-gray-50 rounded-xl">
              <Wallet className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-gray-400">总资产价值</p>
              <p className="text-lg font-bold font-mono text-[#1a1a1a]">
                {formatCurrency(totalValue)}
              </p>
            </div>
          </motion.div>
        )}
        
        {/* 排序控制 */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleSort}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#1a1a1a] hover:bg-gray-50 rounded-lg transition-colors"
          >
            <ArrowUpDown className="h-4 w-4" />
            {sortMode === 'marketCap' ? '按市值' : '按持仓'}
          </button>
          
          {isConnected && (
            <button
              onClick={toggleAutoSwitchSort}
              className={`text-xs px-2 py-1 rounded-md transition-colors ${
                autoSwitchSort 
                  ? 'bg-emerald-50 text-emerald-600' 
                  : 'bg-gray-50 text-gray-400'
              }`}
            >
              自动
            </button>
          )}
        </div>
        
        <div className="text-sm text-gray-400 ml-auto">
          20 个代币
        </div>
      </div>
    </div>
  );
}
