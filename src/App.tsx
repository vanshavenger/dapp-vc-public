import React from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider, WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import '@solana/wallet-adapter-react-ui/styles.css';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolanaFeatures } from './components/SolanaFeatures'
import { ThemeProvider } from './components/ui/theme-provider';

const App: React.FC = () => {
  const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL;
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ConnectionProvider endpoint={rpcUrl}>
        <WalletProvider wallets={wallets} autoConnect>
          <WalletModalProvider>
            <div className="min-h-screen bg-background text-foreground">
              <header className="flex justify-between items-center p-4 border-b">
                <h1 className="text-2xl font-bold">Solana DApp</h1>
                <WalletMultiButton />
              </header>
              <main className="container mx-auto p-4">
                <SolanaFeatures />
              </main>
            </div>
          </WalletModalProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
}

export default App;