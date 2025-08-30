'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SuiClientProvider, WalletProvider } from '@mysten/dapp-kit';
import { getFullnodeUrl } from '@mysten/sui/client';
import { useState } from 'react';

// 导入dapp-kit的样式
import '@mysten/dapp-kit/dist/index.css';

const networks = {
  devnet: { 
    url: getFullnodeUrl('devnet'),
    name: 'Devnet'
  },
  testnet: { 
    url: getFullnodeUrl('testnet'),
    name: 'Testnet'
  },
  mainnet: { 
    url: getFullnodeUrl('mainnet'),
    name: 'Mainnet'
  },
};

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        retry: 3,
        retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider 
        networks={networks} 
        defaultNetwork="devnet"
      >
        <WalletProvider 
          autoConnect={false}
          preferredWallets={['Sui Wallet', 'Sui Wallet Standard']}
        >
          {children}
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  );
}
