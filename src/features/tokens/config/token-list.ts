/**
 * DeBoard 代币配置
 * 使用 web3icons 数据源
 * https://github.com/0xa3k5/web3icons
 */

export type TokenCategory = 'l1' | 'l2' | 'stable' | 'defi' | 'meme';

export interface TokenConfig {
  /** 唯一标识 (CoinGecko ID) */
  id: string;
  /** 交易符号 */
  symbol: string;
  /** 代币全称 */
  name: string;
  /** 显示名称（交易对格式，如 ETH/USDT） */
  displaySymbol: string;
  /** 图标文件名（web3icons SVG 格式） */
  logoIcon: string;
  /** 分类 */
  category: TokenCategory;
  /** 各链合约地址 (null = 原生币) */
  addresses: Partial<Record<SupportedChain, `0x${string}` | null>>;
  /** 小数位 */
  decimals: number;
  /** 默认排序用市值排名 (越小越靠前) */
  marketCapRank: number;
  /** Binance 交易对 */
  binanceSymbol: string;
  /** CoinGecko ID */
  coingeckoId: string;
}

export type SupportedChain = 
  | 'ethereum' 
  | 'arbitrum' 
  | 'optimism' 
  | 'base' 
  | 'zksync' 
  | 'starknet' 
  | 'linea' 
  | 'scroll' 
  | 'polygon_zkevm';

/**
 * 代币列表 (19个，已删除 USDT、MKR、RNDR)
 * 按市值排名排序
 * 
 * Logo 映射规则 (cryptocurrency-icons):
 * - POL -> matic (Polygon 旧 symbol)
 * 其他 symbol 小写直接映射
 */
export const TOKEN_LIST: TokenConfig[] = [
  // ==================== L1 原生币 ====================
  {
    id: 'eth',
    symbol: 'ETH',
    name: 'Ethereum',
    displaySymbol: 'ETH/USDT',
    logoIcon: 'eth',
    category: 'l1',
    addresses: { ethereum: null },
    decimals: 18,
    marketCapRank: 2,
    binanceSymbol: 'ETHUSDT',
    coingeckoId: 'ethereum',
  },
  {
    id: 'sol',
    symbol: 'SOL',
    name: 'Solana',
    displaySymbol: 'SOL/USDT',
    logoIcon: 'sol',
    category: 'l1',
    addresses: {
      ethereum: '0xD31a59c85aE9D8edEFeC411D448f90841571b89c',
    },
    decimals: 9,
    marketCapRank: 5,
    binanceSymbol: 'SOLUSDT',
    coingeckoId: 'solana',
  },
  {
    id: 'near',
    symbol: 'NEAR',
    name: 'NEAR Protocol',
    displaySymbol: 'NEAR/USDT',
    logoIcon: 'near',
    category: 'l1',
    addresses: {
      ethereum: '0x85F17Cf997934a597031b2E18a9aAb6ebD4B55f8',
    },
    decimals: 24,
    marketCapRank: 25,
    binanceSymbol: 'NEARUSDT',
    coingeckoId: 'near',
  },

  // ==================== 稳定币 ====================
  {
    id: 'usdc',
    symbol: 'USDC',
    name: 'USD Coin',
    displaySymbol: 'USDC/USDT',
    logoIcon: 'usdc',
    category: 'stable',
    addresses: {
      ethereum: '0xA0b86a33E6441e0A421e56E4773C3C4b0Db7F5e8',
      arbitrum: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
      optimism: '0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85',
      base: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
    },
    decimals: 6,
    marketCapRank: 6,
    binanceSymbol: 'USDCUSDT',
    coingeckoId: 'usd-coin',
  },

  // ==================== BTC 包装币 ====================
  {
    id: 'wbtc',
    symbol: 'WBTC',
    name: 'Wrapped Bitcoin',
    displaySymbol: 'WBTC/USDT',
    logoIcon: 'wbtc',
    category: 'defi',
    addresses: {
      ethereum: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
      arbitrum: '0x2f2a2543B76A4166549F7aaB2e75Bef0aefC5B0f',
      optimism: '0x68f180fcCe6836688e9084f035309E29Bf0A2095',
      base: '0x1ceA84203673764244E05693e42E6Ace62bD9d79',
    },
    decimals: 8,
    marketCapRank: 12,
    binanceSymbol: 'WBTCUSDT',
    coingeckoId: 'wrapped-bitcoin',
  },

  // ==================== L2 代币 ====================
  {
    id: 'arb',
    symbol: 'ARB',
    name: 'Arbitrum',
    displaySymbol: 'ARB/USDT',
    logoIcon: 'arb',
    category: 'l2',
    addresses: {
      ethereum: '0xB50721BCf8d664c30412Cfbc6be7f5929b8f2b3d',
      arbitrum: '0x912CE59144191C1204E64559FE8253a0e49E6548',
    },
    decimals: 18,
    marketCapRank: 40,
    binanceSymbol: 'ARBUSDT',
    coingeckoId: 'arbitrum',
  },
  {
    id: 'op',
    symbol: 'OP',
    name: 'Optimism',
    displaySymbol: 'OP/USDT',
    logoIcon: 'op',
    category: 'l2',
    addresses: {
      ethereum: '0x4200000000000000000000000000000000000042',
      optimism: '0x4200000000000000000000000000000000000042',
    },
    decimals: 18,
    marketCapRank: 50,
    binanceSymbol: 'OPUSDT',
    coingeckoId: 'optimism',
  },
  {
    id: 'strk',
    symbol: 'STRK',
    name: 'Starknet',
    displaySymbol: 'STRK/USDT',
    logoIcon: 'strk',
    category: 'l2',
    addresses: {
      ethereum: '0xCa14007Eff0d1f1fC4D68B79B6453fF3E9F1A5A3',
    },
    decimals: 18,
    marketCapRank: 80,
    binanceSymbol: 'STRKUSDT',
    coingeckoId: 'starknet',
  },
  {
    id: 'pol',
    symbol: 'POL',
    name: 'Polygon',
    displaySymbol: 'POL/USDT',
    logoIcon: 'matic', // 映射到 matic
    category: 'l2',
    addresses: {
      ethereum: '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    },
    decimals: 18,
    marketCapRank: 30,
    binanceSymbol: 'POLUSDT',
    coingeckoId: 'polygon-ecosystem-token',
  },
  {
    id: 'imx',
    symbol: 'IMX',
    name: 'Immutable',
    displaySymbol: 'IMX/USDT',
    logoIcon: 'imx',
    category: 'l2',
    addresses: {
      ethereum: '0xF57e7e7C23978C3cAEC3C3548E3D615c346e79fF',
    },
    decimals: 18,
    marketCapRank: 55,
    binanceSymbol: 'IMXUSDT',
    coingeckoId: 'immutable-x',
  },

  // ==================== DeFi 蓝筹 ====================
  {
    id: 'link',
    symbol: 'LINK',
    name: 'Chainlink',
    displaySymbol: 'LINK/USDT',
    logoIcon: 'link',
    category: 'defi',
    addresses: {
      ethereum: '0x514910771AF9Ca656af840dff83E8264EcF986CA',
      arbitrum: '0xf97f4df75117a78c1A5a0DBb814Af92458539FB4',
      optimism: '0x350a791Bfc2C21F9Ed5d10980Dad2e2638ffa7f6',
      base: '0x88Fb150BDc53A65feB94f0d995d57285c279c0e1',
    },
    decimals: 18,
    marketCapRank: 15,
    binanceSymbol: 'LINKUSDT',
    coingeckoId: 'chainlink',
  },
  {
    id: 'uni',
    symbol: 'UNI',
    name: 'Uniswap',
    displaySymbol: 'UNI/USDT',
    logoIcon: 'uni',
    category: 'defi',
    addresses: {
      ethereum: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
      arbitrum: '0xFa7F8980b0f1E64A2062791cc3b0871572f1F7f0',
      optimism: '0x6fd9d7AD17242c41f7131d257212c54F0Fb4e692',
      base: '0xc3De830EA07524a0761646a6a4e4be0e114a3C83',
    },
    decimals: 18,
    marketCapRank: 25,
    binanceSymbol: 'UNIUSDT',
    coingeckoId: 'uniswap',
  },
  {
    id: 'aave',
    symbol: 'AAVE',
    name: 'Aave',
    displaySymbol: 'AAVE/USDT',
    logoIcon: 'aave',
    category: 'defi',
    addresses: {
      ethereum: '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9',
      arbitrum: '0xba5DdD1f9d7F570d94A51462a6b4A7F8Ee9C1f1f',
      optimism: '0x76FB31fb4af56892A25e32cFC43De717950c9278',
      base: '0x63706e401c06ac8513145b7687A14804d17f814b',
    },
    decimals: 18,
    marketCapRank: 45,
    binanceSymbol: 'AAVEUSDT',
    coingeckoId: 'aave',
  },
  {
    id: 'ldo',
    symbol: 'LDO',
    name: 'Lido DAO',
    displaySymbol: 'LDO/USDT',
    logoIcon: 'ldo',
    category: 'defi',
    addresses: {
      ethereum: '0x5A98FcBEA516Cf06857215779Fd812CA3beF1B32',
      arbitrum: '0x13Ad51ed4F1B7e9Dc168d8a00cB3f4dDD85EfA60',
    },
    decimals: 18,
    marketCapRank: 60,
    binanceSymbol: 'LDOUSDT',
    coingeckoId: 'lido-dao',
  },
  {
    id: 'crv',
    symbol: 'CRV',
    name: 'Curve DAO',
    displaySymbol: 'CRV/USDT',
    logoIcon: 'crv',
    category: 'defi',
    addresses: {
      ethereum: '0xD533a949740bb3306d119CC777fa900bA034cd52',
      arbitrum: '0x11cDb42B0EB46D95f990BeDD4695A6e3fA034978',
      optimism: '0x0994206dfE8De6Ec6920FF4D779B0d950605Fb53',
    },
    decimals: 18,
    marketCapRank: 120,
    binanceSymbol: 'CRVUSDT',
    coingeckoId: 'curve-dao-token',
  },

  // ==================== Meme 币 ====================
  {
    id: 'shib',
    symbol: 'SHIB',
    name: 'Shiba Inu',
    displaySymbol: 'SHIB/USDT',
    logoIcon: 'shib',
    category: 'meme',
    addresses: {
      ethereum: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE',
    },
    decimals: 18,
    marketCapRank: 18,
    binanceSymbol: 'SHIBUSDT',
    coingeckoId: 'shiba-inu',
  },
  {
    id: 'pepe',
    symbol: 'PEPE',
    name: 'Pepe',
    displaySymbol: 'PEPE/USDT',
    logoIcon: 'pepe',
    category: 'meme',
    addresses: {
      ethereum: '0x6982508145454Ce325dDbE47a25d4ec3d2311933',
    },
    decimals: 18,
    marketCapRank: 38,
    binanceSymbol: 'PEPEUSDT',
    coingeckoId: 'pepe',
  },
];

/**
 * 按市值排名排序的代币列表
 */
export const TOKENS_BY_MARKET_CAP = [...TOKEN_LIST].sort(
  (a, b) => a.marketCapRank - b.marketCapRank
);

/**
 * 获取代币配置
 */
export function getTokenById(id: string): TokenConfig | undefined {
  return TOKEN_LIST.find((t) => t.id === id);
}

/**
 * 获取代币配置（按 symbol）
 */
export function getTokenBySymbol(symbol: string): TokenConfig | undefined {
  return TOKEN_LIST.find((t) => t.symbol === symbol);
}
