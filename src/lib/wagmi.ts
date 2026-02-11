import { createConfig, http } from 'wagmi';
import { mainnet, arbitrum, optimism, base, scroll, polygonZkEvm, linea } from 'wagmi/chains';
import { injected, metaMask, walletConnect } from 'wagmi/connectors';

// zkSync 链配置
const zkSync = {
  id: 324,
  name: 'zkSync Era',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://mainnet.era.zksync.io'] },
  },
  blockExplorers: {
    default: { name: 'zkSync Explorer', url: 'https://explorer.zksync.io' },
  },
} as const;

// 支持的所有链
export const supportedChains = [
  mainnet,
  arbitrum,
  optimism,
  base,
  zkSync,
  scroll,
  linea,
  polygonZkEvm,
] as const;

// 创建 Wagmi 配置
export const wagmiConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected({ target: 'metaMask' }),
    metaMask({
      dappMetadata: {
        name: 'DeBoard',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://deboard.app',
      },
    }),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WC_PROJECT_ID || 'deboard-default-project',
      metadata: {
        name: 'DeBoard',
        description: '以太坊生态代币看板',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://deboard.app',
        icons: [`${typeof window !== 'undefined' ? window.location.origin : 'https://deboard.app'}/logo.png`],
      },
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [zkSync.id]: http(),
    [scroll.id]: http(),
    [linea.id]: http(),
    [polygonZkEvm.id]: http(),
  },
  ssr: true,
});

// 链 ID 到名称的映射
export const chainIdToName: Record<number, string> = {
  [mainnet.id]: 'ethereum',
  [arbitrum.id]: 'arbitrum',
  [optimism.id]: 'optimism',
  [base.id]: 'base',
  [zkSync.id]: 'zksync',
  [scroll.id]: 'scroll',
  [linea.id]: 'linea',
  [polygonZkEvm.id]: 'polygon_zkevm',
};

// 名称到链 ID 的映射
export const chainNameToId: Record<string, number> = Object.entries(chainIdToName).reduce(
  (acc, [id, name]) => ({ ...acc, [name]: Number(id) }),
  {}
);
