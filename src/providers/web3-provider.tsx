'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState, useEffect } from 'react';
import { wagmiConfig } from '@/lib/wagmi';
import '@rainbow-me/rainbowkit/styles.css';

// 创建 QueryClient 配置
function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 60 * 5, // 5 分钟
        gcTime: 1000 * 60 * 60, // 1 小时
        refetchOnWindowFocus: false,
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  });
}

interface Web3ProviderProps {
  children: React.ReactNode;
}

export function Web3Provider({ children }: Web3ProviderProps) {
  const [mounted, setMounted] = useState(false);
  const [queryClient] = useState(() => createQueryClient());

  useEffect(() => {
    setMounted(true);
  }, []);

  // 防止 SSR 水合不匹配
  if (!mounted) {
    return (
      <div className="min-h-screen bg-white dark:bg-black">
        {children}
      </div>
    );
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={{
            lightMode: lightTheme({
              accentColor: '#0F172A',
              accentColorForeground: '#FFFFFF',
              borderRadius: 'large',
              fontStack: 'system',
            }),
            darkMode: darkTheme({
              accentColor: '#3B82F6',
              accentColorForeground: '#FFFFFF',
              borderRadius: 'large',
              fontStack: 'system',
            }),
          }}
          appInfo={{
            appName: 'DeBoard',
            learnMoreUrl: 'https://deboard.app',
          }}
          showRecentTransactions={true}
        >
          {children}
          <ReactQueryDevtools initialIsOpen={false} />
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
