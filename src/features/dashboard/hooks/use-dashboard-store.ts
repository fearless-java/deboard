/**
 * Dashboard 状态管理 (Zustand)
 * 
 * 管理排序模式、选中的代币等 UI 状态
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type SortMode = 'marketCap' | 'userValue';

interface DashboardState {
  // 排序模式
  sortMode: SortMode;
  // 是否自动切换排序（连接钱包后）
  autoSwitchSort: boolean;
  // 选中的代币（用于详情展示）
  selectedTokenId: string | null;
  // 是否显示零余额代币
  showZeroBalance: boolean;
  
  // Actions
  setSortMode: (mode: SortMode) => void;
  toggleAutoSwitchSort: () => void;
  setSelectedTokenId: (id: string | null) => void;
  toggleShowZeroBalance: () => void;
  
  // 水合状态（用于 SSR 兼容）
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      // 初始状态
      sortMode: 'marketCap',
      autoSwitchSort: true,
      selectedTokenId: null,
      showZeroBalance: false,
      _hasHydrated: false,
      
      // Actions
      setSortMode: (mode) => set({ sortMode: mode }),
      
      toggleAutoSwitchSort: () => 
        set((state) => ({ autoSwitchSort: !state.autoSwitchSort })),
      
      setSelectedTokenId: (id) => set({ selectedTokenId: id }),
      
      toggleShowZeroBalance: () => 
        set((state) => ({ showZeroBalance: !state.showZeroBalance })),
      
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'dashboard-storage',
      // 只持久化用户偏好设置
      partialize: (state) => ({
        autoSwitchSort: state.autoSwitchSort,
        showZeroBalance: state.showZeroBalance,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Hook: 等待水合完成（避免 SSR 不匹配）
export function useDashboardHydrated() {
  const _hasHydrated = useDashboardStore((state) => state._hasHydrated);
  return _hasHydrated;
}
