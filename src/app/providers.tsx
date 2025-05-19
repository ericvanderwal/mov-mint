'use client';

import { ThirdwebProvider } from '@thirdweb-dev/react';
import { Chain } from '@thirdweb-dev/chains';
import type { ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';

// Memoize chain configuration
const somniaChain: Chain = {
  chainId: 50312,
  rpc: ["https://dream-rpc.somnia.network"],  // Use primary RPC for faster initial load
  nativeCurrency: {
    decimals: 18,
    name: "STT",
    symbol: "STT",
  },
  shortName: "somnia-testnet",
  slug: "somnia-testnet",
  testnet: true,
  chain: "Somnia Testnet",
  name: "Somnia Testnet"
} as const;

// Configure query client for better performance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Provider options for better performance
const providerOptions = {
  autoConnect: true,
  theme: "light",
  dAppMeta: {
    name: "Masks of the Void",
    description: "Mint your Masks of the Void background NFTs",
    logoUrl: "https://your-logo-url.com",
    url: "https://your-website.com",
  },
} as const;

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThirdwebProvider
      activeChain={somniaChain}
      clientId="9a6aeaf524c398220d7da84e93b425e3"  // This is the client ID, NOT the secret key
      queryClient={queryClient}
      {...providerOptions}
    >
      {children}
    </ThirdwebProvider>
  );
}
